import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import type { LoginDto } from './dto/login.dto';
import type { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByIdentifier(dto.identifier);
    if (!user?.passwordHash) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const permissions = await this.loadPermissions(user.role);
    const payload = { sub: user.id, email: user.email, role: user.role, permissions };

    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.REFRESH_SECRET,
      expiresIn: process.env.REFRESH_EXPIRES_IN ?? '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, permissions,
        avatarUrl: user.avatarUrl, jobTitle: user.jobTitle, department: user.department,
      },
    };
  }

  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    const permissions = await this.loadPermissions(user.role);
    return {
      id: user.id, name: user.name, email: user.email,
      role: user.role, permissions,
      avatarUrl: user.avatarUrl, jobTitle: user.jobTitle, department: user.department,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.users.findByEmail(dto.email);
    const ok = { message: 'Se o e-mail estiver cadastrado, você receberá as instruções em breve.' };
    if (!user) return ok;

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3_600_000);
    await this.users.setResetToken(user.id, token, expires);

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`\n🔑 [RESET PASSWORD] Link para ${user.email}:\n   ${resetUrl}\n`);
    } else {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? 'noreply@aliancatur.com.br',
          to: user.email,
          subject: 'Redefinição de senha — Auris Toolbox',
          html: `<p>Olá, <strong>${user.name}</strong>!</p>
<p>Clique para redefinir sua senha (válido por 1h):</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>`,
        });
      } catch (err) {
        console.error('[RESEND]', err);
        console.log(`🔑 [FALLBACK] Reset URL: ${resetUrl}`);
      }
    }
    return ok;
  }

  async resetPassword(dto: ResetPasswordDto) {
    // Fluxo de convite (novo usuário)
    const invited = await this.users.findByInviteToken(dto.token);
    if (invited) {
      if (!invited.inviteExpires || invited.inviteExpires < new Date()) {
        throw new BadRequestException('Link inválido ou expirado. Solicite um novo.');
      }
      const passwordHash = await bcrypt.hash(dto.password, 12);
      await this.users.activateFromInvite(invited.id, passwordHash);
      return { message: 'Conta ativada com sucesso!' };
    }

    // Fluxo de redefinição de senha (usuário existente)
    const user = await this.users.findByResetToken(dto.token);
    if (!user || !user.resetExpires || user.resetExpires < new Date()) {
      throw new BadRequestException('Link inválido ou expirado. Solicite um novo.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.users.updatePassword(user.id, passwordHash);
    return { message: 'Senha redefinida com sucesso!' };
  }

  private async loadPermissions(roleName: string): Promise<string[]> {
    const roleData = await this.prisma.role.findFirst({
      where: { name: roleName },
      include: { permissions: { include: { permission: true } } },
    });
    return roleData?.permissions.map(rp => rp.permission.key) ?? [];
  }
}

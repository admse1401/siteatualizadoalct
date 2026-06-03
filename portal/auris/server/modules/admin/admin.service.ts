import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const USER_SELECT = {
  id: true, name: true, email: true, matricula: true,
  role: true, jobTitle: true, setor: true, department: true,
  phone: true, birthDate: true, obra: true,
  isActive: true, avatarUrl: true, createdAt: true,
} as const;

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  listUsers() {
    return this.prisma.user.findMany({
      select: USER_SELECT,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('E-mail já cadastrado.');

    const roleData = await this.prisma.role.findFirst({ where: { name: dto.role } });

    const inviteToken = randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase(),
        role: dto.role,
        roleId: roleData?.id ?? null,
        jobTitle: dto.jobTitle,
        setor: dto.setor,
        department: dto.department,
        phone: dto.phone,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
        obra: dto.obra,
        isActive: false,
        inviteToken,
        inviteExpires,
      },
    });

    if (roleData) {
      await this.prisma.userRole.create({
        data: { userId: user.id, roleId: roleData.id },
      });
    }

    const inviteUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/reset-password?token=${inviteToken}`;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log(`\n📧 [CONVITE] ${user.email}:\n   ${inviteUrl}\n`);
    } else {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: process.env.RESEND_FROM ?? 'noreply@aliancatur.com.br',
          to: user.email,
          subject: 'Convite — Auris Toolbox',
          html: `<p>Olá, <strong>${user.name}</strong>!</p>
<p>Você foi convidado para o <strong>Auris Toolbox</strong>. Defina sua senha:</p>
<p><a href="${inviteUrl}">${inviteUrl}</a></p>
<p>Link válido por 48h.</p>`,
        });
      } catch (err) {
        console.error('[RESEND]', err);
        console.log(`📧 [FALLBACK] Invite URL: ${inviteUrl}`);
      }
    }

    return { id: user.id, email: user.email, inviteUrl };
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const conflict = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (conflict) throw new ConflictException('E-mail já cadastrado.');
    }

    let roleId = user.roleId;
    if (dto.role && dto.role !== user.role) {
      const roleData = await this.prisma.role.findFirst({ where: { name: dto.role } });
      roleId = roleData?.id ?? null;
      if (roleData) {
        await this.prisma.userRole.deleteMany({ where: { userId: id } });
        await this.prisma.userRole.create({ data: { userId: id, roleId: roleData.id } });
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name  !== undefined     && { name: dto.name }),
        ...(dto.email !== undefined     && { email: dto.email.toLowerCase() }),
        ...(dto.role !== undefined      && { role: dto.role, roleId }),
        ...(dto.jobTitle !== undefined   && { jobTitle: dto.jobTitle }),
        ...(dto.setor !== undefined      && { setor: dto.setor }),
        ...(dto.department !== undefined && { department: dto.department }),
        ...(dto.phone !== undefined      && { phone: dto.phone }),
        ...(dto.birthDate !== undefined  && { birthDate: dto.birthDate ? new Date(dto.birthDate) : null }),
        ...(dto.obra !== undefined       && { obra: dto.obra }),
        ...(dto.isActive !== undefined   && { isActive: dto.isActive }),
      },
      select: USER_SELECT,
    });
  }

  async blockUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    await this.prisma.refreshToken.deleteMany({ where: { userId: id } });
    await this.prisma.notification.deleteMany({ where: { userId: id } });
    await this.prisma.auditLog.updateMany({ where: { userId: id }, data: { userId: null } });
    await this.prisma.user.delete({ where: { id } });

    return { deleted: true };
  }

  listRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { key: 'asc' } });
  }
}

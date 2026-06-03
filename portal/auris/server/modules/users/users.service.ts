import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findByIdentifier(identifier: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { matricula: identifier },
        ],
        isActive: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findByResetToken(token: string) {
    return this.prisma.user.findUnique({ where: { resetToken: token } });
  }

  findByInviteToken(token: string) {
    return this.prisma.user.findUnique({ where: { inviteToken: token } });
  }

  updatePassword(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, resetToken: null, resetExpires: null },
    });
  }

  activateFromInvite(id: string, passwordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash, isActive: true, inviteToken: null, inviteExpires: null },
    });
  }

  setResetToken(id: string, token: string, expires: Date) {
    return this.prisma.user.update({
      where: { id },
      data: { resetToken: token, resetExpires: expires },
    });
  }
}

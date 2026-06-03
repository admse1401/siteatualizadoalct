import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SignerModule } from './modules/signer/signer.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, SignerModule, AdminModule],
})
export class AppModule {}

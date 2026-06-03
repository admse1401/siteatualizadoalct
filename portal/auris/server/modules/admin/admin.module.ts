import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PermissionGuard } from '../../common/guards/permission.guard';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PermissionGuard],
  exports: [PermissionGuard],
})
export class AdminModule {}

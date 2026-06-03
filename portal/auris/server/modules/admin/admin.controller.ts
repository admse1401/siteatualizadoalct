import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AdminService } from './admin.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtGuard, PermissionGuard)
@RequirePermission('admin.users')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('users')
  listUsers() { return this.admin.listUsers(); }

  @Post('users')
  createUser(@Body() dto: CreateUserDto) { return this.admin.createUser(dto); }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.admin.updateUser(id, dto);
  }

  @Patch('users/:id/block')
  blockUser(@Param('id') id: string) { return this.admin.blockUser(id); }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.admin.deleteUser(id); }

  @Get('roles')
  listRoles() { return this.admin.listRoles(); }

  @Get('permissions')
  listPermissions() { return this.admin.listPermissions(); }
}

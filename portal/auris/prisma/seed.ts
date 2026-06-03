import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { key: 'admin.users',     description: 'Gerenciar usuários' },
  { key: 'admin.roles',     description: 'Gerenciar roles e permissões' },
  { key: 'training.view',   description: 'Visualizar treinamentos' },
  { key: 'training.config', description: 'Configurar treinamentos' },
  { key: 'claims.view',     description: 'Visualizar sinistros' },
  { key: 'claims.create',   description: 'Criar sinistro' },
  { key: 'claims.edit',     description: 'Editar sinistro' },
  { key: 'calendar.view',   description: 'Visualizar calendário' },
  { key: 'signer.use',      description: 'Usar assinador de documentos' },
];

const ROLES: { name: string; description: string; permissions: string[] }[] = [
  {
    name: 'MASTER',
    description: 'Acesso total ao sistema',
    permissions: PERMISSIONS.map(p => p.key),
  },
  {
    name: 'ADMIN',
    description: 'Administrador com permissões de gestão',
    permissions: [
      'admin.users', 'training.view', 'training.config',
      'claims.view', 'claims.create', 'claims.edit',
      'calendar.view', 'signer.use',
    ],
  },
  {
    name: 'USER',
    description: 'Colaborador padrão',
    permissions: ['training.view', 'claims.view', 'calendar.view'],
  },
];

async function main() {
  // 1. Permissions
  const permMap: Record<string, string> = {};
  for (const p of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: { key: p.key, description: p.description },
    });
    permMap[p.key] = perm.id;
  }

  // 2. Roles + RolePermissions
  const roleMap: Record<string, string> = {};
  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleMap[r.name] = role.id;

    for (const permKey of r.permissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permMap[permKey] } },
        update: {},
        create: { roleId: role.id, permissionId: permMap[permKey] },
      });
    }
  }

  // 3. Master user
  const masterHash = await bcrypt.hash('Master@2026', 12);
  const masterUser = await prisma.user.upsert({
    where: { email: 'master@aliancatur.com.br' },
    update: { role: 'MASTER', roleId: roleMap['MASTER'], isActive: true },
    create: {
      email: 'master@aliancatur.com.br',
      name: 'Master Admin',
      matricula: 'MST001',
      passwordHash: masterHash,
      role: 'MASTER',
      roleId: roleMap['MASTER'],
      isActive: true,
      jobTitle: 'Master Administrator',
      department: 'TI',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: masterUser.id, roleId: roleMap['MASTER'] } },
    update: {},
    create: { userId: masterUser.id, roleId: roleMap['MASTER'] },
  });

  // 4. Admin user (update existing)
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@aliancatur.com.br' },
    update: { role: 'ADMIN', roleId: roleMap['ADMIN'], isActive: true },
    create: {
      email: 'admin@aliancatur.com.br',
      name: 'Administrador',
      matricula: 'ADM001',
      passwordHash: adminHash,
      role: 'ADMIN',
      roleId: roleMap['ADMIN'],
      isActive: true,
      jobTitle: 'Administrador do Sistema',
      department: 'TI',
    },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: roleMap['ADMIN'] } },
    update: {},
    create: { userId: adminUser.id, roleId: roleMap['ADMIN'] },
  });

  console.log('✅ Seed concluído: roles MASTER/ADMIN/USER, permissões e usuários criados.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

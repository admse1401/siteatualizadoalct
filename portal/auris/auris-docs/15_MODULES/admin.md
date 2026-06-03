# Módulo · Auris Admin

## O que é
Painel exclusivo para administradores. Invisível para usuários comuns (requer permissão `admin.users`). Central de gestão de todo o ecossistema.

## Status
- ✅ Placeholder criado (`AdminPage.tsx`)
- ⏳ UI e backend pendentes

## Acesso
Visível no dashboard apenas para usuários com `admin.users`. O card tem badge "Admin" (roxo).

## Funcionalidades planejadas

### Gestão de usuários
- Criar usuário → dispara convite via Resend
- Listar usuários com filtros (setor, status, permissão)
- Editar usuário (cargo, setor, permissões, status)
- Bloquear/desbloquear acesso
- Forçar reset de senha
- Ver último acesso

### Gestão de permissões
- Painel visual para atribuir/remover permissões por usuário
- Ver todas as permissões de um usuário de forma consolidada

### Auditoria
- Tabela de logs filtrada por: usuário, módulo, ação, data
- Export de logs (CSV)

### Configurações globais
- Habilitar/desabilitar módulos no dashboard
- Configurações de e-mail (Resend)

## Arquivos (a criar)
```
src/pages/modules/admin/
├── AdminPage.tsx
└── components/
    ├── UserTable.tsx
    ├── CreateUserModal.tsx
    ├── EditPermissionsPanel.tsx
    └── AuditLogTable.tsx
```

## API necessária
Ver `07_API_SPECIFICATION.md` → seção Admin Endpoints.

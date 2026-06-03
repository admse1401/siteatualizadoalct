# 10 · Auth & Permission — Auris Toolbox

## Modelo de Autenticação

### JWT + Refresh Token (SSO)
```
accessToken:   expiração curta (15min), stateless, enviado no header
refreshToken:  expiração longa (7d), salvo no DB, enviado em httpOnly cookie
```

### Fluxo Completo
```
Login
  → POST /auth/login
  → valida email + bcrypt(senha)
  → gera accessToken (JWT, 15min)
  → gera refreshToken (UUID, salvo em DB com expiresAt)
  → seta refreshToken em httpOnly cookie
  → retorna accessToken + dados do usuário

Requisição normal
  → Header: Authorization: Bearer <accessToken>
  → JwtGuard valida assinatura + expiração

Token expirado (401)
  → Axios interceptor captura 401
  → POST /auth/refresh (envia cookie automaticamente)
  → Recebe novo accessToken
  → Retenta a requisição original

Logout
  → POST /auth/logout
  → Deleta refreshToken do DB
  → Limpa cookie
  → Redireciona para /login
```

### Implementação NestJS
```typescript
// Módulos necessários:
// - @nestjs/jwt
// - @nestjs/passport
// - passport-jwt
// - bcrypt + @types/bcrypt

// JwtStrategy: extrai Bearer token, valida, injeta user no request
// JwtAuthGuard: guard global (aplicado em AppModule como APP_GUARD)
// @Public() decorator: isenta rotas públicas (login, activate, forgot)
```

---

## Modelo de Permissões (RBAC)

### Estrutura
```
Usuário ──▶ UserRole ──▶ Role ──▶ RolePermission ──▶ Permission
```

### Como funciona
1. Admin atribui Roles ao usuário (ex: "operacoes", "admin")
2. Cada Role tem um conjunto de Permissions
3. No login, o backend resolve todas as permissions do usuário e inclui no JWT payload
4. Frontend lê permissions do JWT e monta o dashboard dinamicamente
5. Backend valida permissions em cada endpoint com `@RequirePermission('claims.view')`

### Permissões por módulo
```
core:
  admin.users          Gerenciar usuários
  admin.audit          Ver logs de auditoria
  admin.settings       Configurações globais

claims:
  claims.view          Ver lista de sinistros
  claims.create        Criar sinistro
  claims.edit          Editar sinistro
  claims.approve       Aprovar/rejeitar sinistro

signer:
  signer.use           Assinar documentos

calendar:
  calendar.view        Ver calendário
  calendar.manage      Criar e editar eventos
```

### PermissionGuard no Frontend
```typescript
// Componente PermissionGuard (a criar em src/components/auth/)
// Esconde filhos se usuário não tem a permission requerida
// Usado no Dashboard para mostrar/ocultar cards
<PermissionGuard require="claims.view">
  <AppCard module={claimsModule} />
</PermissionGuard>
```

### PrivateRoute
```typescript
// Componente PrivateRoute (a criar)
// Se !accessToken → redireciona para /login
// Se accessToken → renderiza outlet
```

---

## Fluxo de Convite (Admin → Colaborador)

```
1. Admin: POST /admin/users { name, email, cargo, setor, permissions }
2. Backend: cria User com isActive: false
3. Backend: gera token UUID → salva em tabela ActivationToken (expiresAt: +48h)
4. Backend: Resend envia e-mail com link: https://app/activate?token=xxx
5. Colaborador: acessa link, define senha
6. Backend: POST /auth/activate { token, password }
   → valida token (existe? expirou?)
   → bcrypt(password) → salva passwordHash
   → isActive: true
   → deleta ActivationToken
7. Colaborador: login liberado
```

---

## Fluxo de Recuperação de Senha

```
1. Usuário: POST /auth/forgot-password { email }
2. Backend: gera token → PasswordResetToken (expiresAt: +1h)
3. Resend: e-mail com link: https://app/reset-password?token=xxx
4. Usuário: acessa link, define nova senha
5. Backend: POST /auth/reset-password { token, password }
   → valida token
   → atualiza passwordHash
   → deleta token
   → invalida todos os refreshTokens do usuário
```

---

## Segurança de Senhas
- Hash: bcrypt com salt rounds = 12
- Regra mínima: 8 caracteres (recomendado: + maiúscula + número)
- Reset de senha invalida todas as sessões ativas (deleta todos os RefreshTokens)

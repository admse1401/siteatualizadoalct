# 14 · Roadmap — Auris Toolbox

## FASE 1 — Fundação do Backend (Core rodando)

### 1.1 Ambiente local
- [ ] Criar .env a partir do .env.example
- [ ] Subir PostgreSQL via `docker-compose up postgres -d`
- [ ] `prisma migrate dev` + `prisma db seed` (admin + roles + permissions)

### 1.2 Módulo de Autenticação (NestJS)
- [ ] `POST /auth/login`
- [ ] `POST /auth/refresh`
- [ ] `POST /auth/logout`
- [ ] JWT Guard global
- [ ] `@Public()` decorator para rotas abertas

### 1.3 Módulo de Usuários
- [ ] `GET /users/me`
- [ ] `PATCH /users/me`
- [ ] `POST /auth/forgot-password` (Resend)
- [ ] `POST /auth/reset-password`

### 1.4 Módulo de Convite
- [ ] `POST /admin/users` → cria + envia convite via Resend
- [ ] `POST /auth/activate`

---

## FASE 2 — Frontend conectado ao Core

### 2.1 Auth Store (Zustand)
- [ ] `store/authStore.ts`: user, accessToken, permissions, login(), logout(), refreshToken(), hasPermission()
- [ ] `lib/api.ts`: Axios com interceptors (injetar JWT + refresh automático em 401)

### 2.2 Login real
- [ ] Formulário conectado ao `POST /auth/login`
- [ ] Tratamento de erros
- [ ] Redirect para dashboard

### 2.3 Rotas protegidas
- [ ] `PrivateRoute` component
- [ ] `PermissionGuard` component

### 2.4 Dashboard dinâmico
- [ ] Cards montados por permissões reais
- [ ] Saudação com nome real do usuário

### 2.5 Header com dados reais
- [ ] Avatar/iniciais reais
- [ ] Notificações com contagem real

### 2.6 Telas de fluxo de auth
- [ ] `/activate?token=xxx`
- [ ] `/forgot-password`
- [ ] `/reset-password?token=xxx`

---

## FASE 3 — Auris Admin

### Backend
- [ ] `GET /admin/users`
- [ ] `PATCH /admin/users/:id`
- [ ] `POST /admin/users/:id/block`
- [ ] `POST /admin/users/:id/reset-password`
- [ ] `GET /admin/audit-logs`

### Frontend (`src/pages/modules/admin/`)
- [ ] Tabela de usuários com filtros
- [ ] Modal de criação de usuário
- [ ] Painel de edição de permissões
- [ ] Visualização de logs de auditoria

---

## FASE 4 — Auris Signer (Backend)

A UI já está implementada. Falta o backend:
- [ ] Schema Prisma (documents, signature_logs)
- [ ] Upload de PDF para MinIO/S3
- [ ] `POST /signer/sign` — recebe PDF + certificado, retorna PDF assinado com PKCS#7 válido
- [ ] `GET /signer/documents` — histórico de documentos assinados
- [ ] Integração com `@signpdf/signpdf` + `@signpdf/signer-p12`
- [ ] Assinatura válida no Adobe Reader

---

## FASE 5 — Auris Claims

### Backend
- [ ] Schema Prisma (claims, claim_files, claim_history, approvals)
- [ ] CRUD de sinistros
- [ ] Upload de arquivos para MinIO/S3
- [ ] Fluxo de aprovação

### Frontend
- [ ] Lista com filtros e busca
- [ ] Formulário de criação
- [ ] Detalhe com histórico
- [ ] Área de aprovação (se tem `claims.approve`)

---

## FASE 6 — Auris Calendar

### Backend
- [ ] CRUD de eventos
- [ ] Participantes
- [ ] Notificações automáticas

### Frontend
- [ ] View mensal/semanal/diária
- [ ] Criação de evento com participantes

---

## FASE 7 — Funcionalidades Transversais

- [ ] Sistema de notificações (backend + frontend em tempo real)
- [ ] Assistente IA (Google Gemini + painel lateral)
- [ ] Perfil completo (upload de foto, alterar senha)
- [ ] Auditoria visível no Admin

---

## FASE 8 — DevOps de Produção

- [ ] Dockerfile de produção
- [ ] Docker Compose completo (postgres + backend + nginx)
- [ ] CI/CD pipeline
- [ ] Script de deploy com rollback
- [ ] Monitoramento e alertas

---

## Sequência recomendada
```
Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5 → Fase 6 → Fase 7 → Fase 8
```
Após Fase 2, as Fases 3-7 podem ser desenvolvidas em paralelo.

# 05 · System Architecture — Auris Toolbox

## Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React SPA)                  │
│  Login → Dashboard → [Claims | Signer | Calendar | Admin]│
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / JWT
┌────────────────────────▼────────────────────────────────┐
│                   API GATEWAY (NestJS)                   │
│         Auth · Rate Limiting · Routing · Logs            │
└───┬─────────────────┬──────────────────┬────────────────┘
    │                 │                  │
┌───▼───┐       ┌─────▼────┐      ┌─────▼────┐
│ CORE  │       │  CLAIMS  │      │  SIGNER  │  ...módulos
│ Auth  │       │  Service │      │  Service │
│ Users │       └─────┬────┘      └─────┬────┘
│ RBAC  │             │                 │
│ Notif │      ┌──────▼──────┐  ┌───────▼──────┐
│ Audit │      │ Claims DB   │  │  Signer DB   │
└───┬───┘      │ PostgreSQL  │  │  PostgreSQL  │
    │          └─────────────┘  └──────────────┘
┌───▼───────┐
│  Core DB  │
│PostgreSQL │
└───────────┘
```

## Estrutura de Pastas (Frontend)

```
src/
├── App.tsx                          # Rotas principais
├── main.tsx
├── index.css
├── components/
│   └── layout/
│       ├── Layout.tsx               # Shell: header + outlet + painéis flutuantes
│       ├── Header.tsx               # Logo, notificações, IA, avatar
│       └── Background.tsx           # Bolhas glassmorphism
└── pages/
    ├── Login.tsx
    ├── Dashboard.tsx                # Grid de cards por permissão
    └── modules/
        ├── claims/
        │   ├── ClaimsPage.tsx
        │   └── components/
        ├── signer/
        │   ├── SignerPage.tsx        # ✅ Implementado
        │   ├── types.ts
        │   └── components/
        │       ├── FileUploader.tsx
        │       ├── CertificateValidator.tsx
        │       └── PdfSigner.tsx
        ├── calendar/
        │   └── CalendarPage.tsx
        └── admin/
            └── AdminPage.tsx
```

## Estrutura de Pastas (Backend)

```
server/
├── main.ts
├── app.module.ts
├── prisma/
│   └── prisma.service.ts
├── auth/                  # A implementar
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── users/                 # A implementar
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
└── admin/                 # A implementar
    ├── admin.module.ts
    ├── admin.controller.ts
    └── admin.service.ts
```

## Fluxo de Autenticação

```
1. POST /auth/login  →  valida credenciais  →  gera accessToken (15min) + refreshToken (7d)
2. refreshToken salvo em DB (tabela RefreshToken) + httpOnly cookie
3. Toda requisição privada: Authorization: Bearer <accessToken>
4. accessToken expira → interceptor chama POST /auth/refresh automaticamente
5. POST /auth/logout → deleta refreshToken do DB
```

## Comunicação entre Módulos
- Módulos NÃO acessam banco uns dos outros
- Módulos NÃO chamam APIs uns dos outros diretamente
- Tudo passa pelo API Gateway com JWT validado
- Dados de usuário/permissão vêm sempre do Core via token

## Variáveis de Ambiente
```env
DATABASE_URL=          # Core DB
JWT_SECRET=
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=7d
RESEND_API_KEY=
APP_URL=               # Para links nos e-mails
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
```

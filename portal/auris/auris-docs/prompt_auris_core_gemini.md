# PROMPT — GERAÇÃO DO AURIS TOOLBOX CORE
## Para usar no Google AI Studio com Gemini 2.5 Pro

---

Você é um Engenheiro de Software Sênior Full Stack especialista em arquitetura de sistemas corporativos SaaS, React, TypeScript e NestJS.

Sua missão é gerar o código-fonte completo e funcional do **Auris Toolbox Core**, que é a fundação do ecossistema corporativo da Aliança Tur.

---

## REGRA MAIS IMPORTANTE

Gere **TODOS os arquivos** com o **código completo** dentro de cada um.
Não use comentários do tipo `// implementar depois`, `// lógica aqui`, `// TODO` ou similares.
Cada arquivo deve estar 100% funcional e pronto para rodar.

---

## O QUE É O AURIS TOOLBOX

O Auris Toolbox é o Portal do Colaborador da Aliança Tur.
Não é uma coleção de links. É um ecossistema onde todos os sistemas da empresa vivem integrados.

Fluxo de acesso:
```
Site Aliança Tur → Botão "Portal do Colaborador" → Login → Auris Toolbox Dashboard
```

O usuário faz login uma vez e acessa todos os módulos que seu perfil permite.
Nunca abre nova aba. Nunca redireciona para outro sistema. Tudo acontece dentro do portal.

---

## STACK OBRIGATÓRIA

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- Shadcn/UI
- React Router v6 (SPA, sem reload)
- Zustand (estado global)
- Axios (requisições HTTP)
- React Hook Form + Zod (formulários e validação)

### Backend
- Node.js + TypeScript
- NestJS (framework)
- Prisma ORM
- PostgreSQL
- JWT + Refresh Token
- Resend (envio de e-mails)
- class-validator + class-transformer

### Infra
- Docker + Docker Compose
- `.env` para variáveis de ambiente

---

## ESTRUTURA DE PASTAS OBRIGATÓRIA

```
auris-toolbox/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── AppShell.tsx
│   │   │   └── shared/
│   │   │       ├── AppCard.tsx
│   │   │       ├── AvatarMenu.tsx
│   │   │       ├── NotificationBell.tsx
│   │   │       └── AIPanel.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── ActivateAccountPage.tsx
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── profile/
│   │   │   │   └── ProfilePage.tsx
│   │   │   └── admin/
│   │   │       ├── AdminPage.tsx
│   │   │       ├── UsersPage.tsx
│   │   │       └── UserFormPage.tsx
│   │   ├── modules/
│   │   │   ├── claims/
│   │   │   │   └── ClaimsModule.tsx
│   │   │   ├── signer/
│   │   │   │   └── SignerModule.tsx
│   │   │   └── calendar/
│   │   │       └── CalendarModule.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   ├── appStore.ts
│   │   │   └── notificationStore.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── userService.ts
│   │   │   └── notificationService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── usePermission.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── router/
│   │   │   └── index.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── refresh.strategy.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── decorators/
│   │   │   │   ├── public.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── activate-account.dto.ts
│   │   │       └── forgot-password.dto.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       └── update-user.dto.ts
│   │   ├── permissions/
│   │   │   ├── permissions.module.ts
│   │   │   ├── permissions.controller.ts
│   │   │   └── permissions.service.ts
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   └── notifications.service.ts
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   └── audit.service.ts
│   │   ├── mail/
│   │   │   ├── mail.module.ts
│   │   │   └── mail.service.ts
│   │   └── common/
│   │       ├── filters/
│   │       │   └── http-exception.filter.ts
│   │       └── interceptors/
│   │           └── audit.interceptor.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   ├── nest-cli.json
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## BANCO DE DADOS — SCHEMA PRISMA COMPLETO

```prisma
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  passwordHash  String?
  avatarUrl     String?
  jobTitle      String?
  department    String?
  isActive      Boolean   @default(false)
  inviteToken   String?   @unique
  inviteExpires DateTime?
  resetToken    String?   @unique
  resetExpires  DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  roles         UserRole[]
  auditLogs     AuditLog[]
  notifications Notification[]
  refreshTokens RefreshToken[]
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  users       UserRole[]
  permissions RolePermission[]
}

model Permission {
  id    String @id @default(cuid())
  key   String @unique  // ex: claims.view, signer.use
  roles RolePermission[]
}

model UserRole {
  userId String
  roleId String
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@id([userId, roleId])
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id])
  permission   Permission @relation(fields: [permissionId], references: [id])
  @@id([roleId, permissionId])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  action    String
  entity    String?
  entityId  String?
  detail    Json?
  ip        String?
  createdAt DateTime @default(now())
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  body      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

---

## AUTENTICAÇÃO — FLUXO COMPLETO

### Login
- Email + senha
- Retorna `accessToken` (15min) + `refreshToken` (7 dias)
- Salva refreshToken no banco
- Frontend guarda accessToken no Zustand (memória) e refreshToken no cookie httpOnly

### Convite de usuário (criado pelo admin)
- Admin cria usuário informando nome, email, cargo, setor, permissões
- Backend gera `inviteToken` único com expiração de 48h
- Resend envia e-mail com link: `https://dominio.com/ativar?token=XXX`
- Usuário define sua senha → conta ativada → login liberado

### Recuperação de senha
- Usuário informa e-mail na tela de login
- Backend gera `resetToken` com expiração de 1h
- Resend envia e-mail com link: `https://dominio.com/redefinir?token=XXX`
- Usuário define nova senha → token invalidado

### Refresh Token
- Quando `accessToken` expira, frontend chama `POST /auth/refresh`
- Backend valida refreshToken do banco → emite novo accessToken
- Transparente para o usuário

---

## DESIGN VISUAL OBRIGATÓRIO

### Identidade visual
- Fundo: gradiente `#0a1628` → `#0d2045`
- 3 bolhas abstratas no fundo com `blur` pesado e baixa opacidade
- Glassmorphism nos cards e painéis flutuantes: `backdrop-filter: blur(12px)`, fundo `rgba(255,255,255,0.07)`, borda `rgba(255,255,255,0.13)`
- Áreas de trabalho (conteúdo dos módulos): sólidas para legibilidade
- Border radius: 12–16px nos cards
- Tipografia: branca para títulos, `rgba(255,255,255,0.45)` para textos secundários

### Tela de Login
- Fundo com gradiente e bolhas
- Card central com glassmorphism
- Logo Auris Toolbox no topo
- Campos: E-mail + Senha
- Botão "Entrar" azul
- Link "Esqueci minha senha"

### Dashboard
- Header fixo com: Logo | (centro vazio) | Ícone IA | Sino de notificações | Avatar
- Saudação: `Olá, João da Silva 👋`
- Grade de cards responsiva: `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))`
- Cada card: ícone + nome do módulo + descrição curta + badge de status
- Cards montados dinamicamente conforme permissões do usuário logado

### Comportamento ao clicar em um card
- Cards somem com transição suave (opacity + translateY)
- Header permanece fixo
- Saudação sobe para barra do módulo com lembrete contextual
- Fundo permanece — sem ver outros cards
- Módulo carrega dentro do portal
- Botão "← Voltar" retorna ao dashboard com animação

### Header sempre visível
```
[ Logo Auris Toolbox ]  ————————————————  [ 🤖 ] [ 🔔 ] [ JS Avatar ]
```
Ao entrar em um módulo:
```
[ Logo ]  [ ← Voltar ] [ Chip: Auris Claims ]  [ Olá, João | Lembrete ]  [ 🤖 ] [ 🔔 ] [ JS ]
```

---

## MÓDULOS PLACEHOLDER (Claims, Signer, Calendar)

Por enquanto gere cada módulo como uma tela interna funcional com:
- Subheader com nome do módulo e breadcrumb
- 3 cards de métricas com dados mockados
- Área de conteúdo com mensagem indicando que o módulo completo será carregado
- Visual seguindo o Design System do Core

Esses módulos serão substituídos pelos sistemas reais futuramente.
O importante é que a navegação, animações e estrutura funcionem perfeitamente.

---

## PERMISSÕES — RBAC

Permissões disponíveis no seed inicial:
```
claims.view
claims.create
claims.edit
signer.use
calendar.view
admin.users
admin.permissions
admin.audit
```

O dashboard monta os cards dinamicamente:
- Se o usuário tem `claims.view` → mostra card Auris Claims
- Se tem `signer.use` → mostra card Auris Signer
- Se tem `calendar.view` → mostra card Auris Calendar
- Se tem `admin.users` → mostra card Auris Admin (visual diferente, cor roxa)

---

## PAINEL DE ADMIN

Visível apenas para usuários com `admin.users`.

Funcionalidades:
- Listar todos os usuários com status (ativo, pendente, bloqueado)
- Criar usuário (nome, email, cargo, setor, roles) → dispara convite via Resend
- Editar usuário
- Bloquear/desbloquear usuário
- Visualizar permissões do usuário
- Reenviar convite

---

## PAINEL DE PERFIL DO USUÁRIO

Abre como dropdown ao clicar no avatar.
- Nome completo
- Cargo e Setor
- Upload de foto de perfil
- Alterar senha
- Preferências (tema — preparado para dark/light)
- Logout

---

## PAINEL DA IA (sidebar)

Abre deslizando da direita ao clicar no ícone do robô.
Não navega para outra página.
Por enquanto: interface de chat estática com mensagem de boas-vindas.
Arquitetura preparada para receber integração de API de IA futuramente.

---

## DOCKER COMPOSE

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: auris
      POSTGRES_PASSWORD: auris123
      POSTGRES_DB: auris_core
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "3333:3333"
    depends_on:
      - postgres
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## VARIÁVEIS DE AMBIENTE (.env.example)

```env
DATABASE_URL="postgresql://auris:auris123@localhost:5432/auris_core"
JWT_SECRET="seu_secret_aqui"
JWT_EXPIRES_IN="15m"
REFRESH_SECRET="seu_refresh_secret_aqui"
REFRESH_EXPIRES_IN="7d"
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM="noreply@aliancatur.com.br"
FRONTEND_URL="http://localhost:5173"
PORT=3333
```

---

## SEED DO BANCO

Gere um arquivo `prisma/seed.ts` que cria:
- Todas as permissions listadas acima
- Role `admin` com todas as permissions
- Role `colaborador` com permissions básicas (claims.view, calendar.view)
- Um usuário admin padrão já ativado:
  - Nome: Administrador
  - Email: admin@aliancatur.com.br
  - Senha: Admin@2025

---

## README

Gere um README.md completo com:
- Pré-requisitos
- Como rodar localmente (com e sem Docker)
- Como rodar o seed
- Como criar o primeiro usuário via admin
- Estrutura do projeto explicada

---

## ENTREGA ESPERADA

Todos os arquivos listados na estrutura de pastas, com código 100% completo e funcional.
O sistema deve rodar com:
```bash
docker-compose up
cd backend && npx prisma migrate dev && npx prisma db seed
cd frontend && npm run dev
```
E estar pronto para receber os módulos Auris Claims, Auris Signer e Auris Calendar como extensões do Core.


# 99 · Context Global — Auris Toolbox
> Cole este arquivo no início de cada sessão no VS Code com Claude para restaurar contexto sem repassar histórico.

---

## Projeto
**Auris Toolbox** — Portal do Colaborador da Aliança Tur.  
SPA corporativa. Todos os sistemas nascem como módulos integrados. Nunca sistemas isolados.

**Repositório local:** `c:\Users\TI\Documents\auris`  
**Dev server:** `http://localhost:5173` (Vite)  
**Backend:** `http://localhost:3000` (NestJS — a implementar)

---

## Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Shadcn/UI + React Router + Zustand + motion/react
- **Backend:** Node.js + NestJS + TypeScript
- **Banco:** PostgreSQL + Prisma (banco por módulo)
- **Auth:** JWT (15min) + Refresh Token (7d, httpOnly cookie)
- **Email:** Resend (convites, reset de senha)
- **Arquivos:** MinIO / AWS S3
- **DevOps:** Docker + Docker Compose

---

## Estado atual

### ✅ Implementado
- Layout visual completo: fundo glassmorphism, header, bolhas
- Dashboard com grid de cards (4 módulos)
- Transição de rota animada (entrar/sair de módulo)
- Painéis flutuantes: IA e Perfil
- App greeting bar (saudação + lembrete contextual ao entrar no módulo)
- Auris Signer: UI completa (FileUploader, CertificateValidator, PdfSigner)
- Schema Prisma completo (Core DB)
- NestJS iniciado (app.module, main, prisma.service)

### ⏳ Pendente
- Auth real (JWT/SSO) — Fase 1 do roadmap
- Backend NestJS: auth, users, admin modules
- Auth Store Zustand + Axios interceptors
- Dashboard dinâmico por permissões reais
- Assinatura digital válida PKCS#7 no Signer
- Auris Admin, Claims, Calendar

---

## Design System (resumo)

| Token | Valor |
|---|---|
| Fundo | `linear-gradient(135deg, #0a1628, #0d2045, #0a1a3a)` |
| Azul ação | `#2563eb` |
| Azul claro | `#60a5fa` |
| Texto | `#ffffff` |
| Texto sec. | `rgba(255,255,255,0.4)` |
| Card glass | `rgba(255,255,255,0.07)` + `border: 0.5px solid rgba(255,255,255,0.13)` |
| Blur | `backdrop-filter: blur(12px)` |
| Border radius | 12–16px |

---

## Estrutura de arquivos relevantes

```
src/
├── App.tsx                          # Rotas
├── components/layout/
│   ├── Layout.tsx                   # Shell principal
│   ├── Header.tsx
│   └── Background.tsx
└── pages/
    ├── Dashboard.tsx
    ├── Login.tsx
    └── modules/
        ├── signer/                  # ✅ UI completa
        │   ├── SignerPage.tsx
        │   ├── types.ts
        │   └── components/
        │       ├── FileUploader.tsx
        │       ├── CertificateValidator.tsx
        │       └── PdfSigner.tsx
        ├── claims/ClaimsPage.tsx    # placeholder
        ├── calendar/CalendarPage.tsx # placeholder
        └── admin/AdminPage.tsx      # placeholder
```

---

## Módulos e permissões

| Módulo | Permissão mínima | Badge | Cor ícone |
|---|---|---|---|
| Auris Claims | `claims.view` | Ativo (verde) | `#93c5fd` |
| Auris Signer | `signer.use` | Ativo (verde) | `#a5b4fc` |
| Auris Calendar | `calendar.view` | Novo (índigo) | `#5eead4` |
| Auris Admin | `admin.users` | Admin (roxo) | `#d8b4fe` |

---

## Próximo passo recomendado
**Fase 1.2 — Backend de autenticação (NestJS)**  
Ver `14_ROADMAP.md` para sequência completa.

---

## Documentação completa
```
/docs/
├── 00_PROJECT_OVERVIEW.md
├── 01_PRODUCT_VISION.md
├── 02_BUSINESS_RULES.md
├── 03_FUNCTIONAL_REQUIREMENTS.md
├── 04_NON_FUNCTIONAL_REQUIREMENTS.md
├── 05_SYSTEM_ARCHITECTURE.md
├── 06_DATABASE_DER.md
├── 07_API_SPECIFICATION.md
├── 08_FRONTEND_UI_UX.md
├── 09_DESIGN_SYSTEM.md
├── 10_AUTH_PERMISSION.md
├── 11_INFRASTRUCTURE_DEVOPS.md
├── 12_SECURITY.md
├── 13_TESTING_QA.md
├── 14_ROADMAP.md
├── 15_MODULES/
│   ├── portal-colaborador.md
│   ├── signer.md
│   ├── claims.md
│   ├── calendar.md
│   └── admin.md
└── 99_CONTEXT_GLOBAL.md   ← você está aqui
```

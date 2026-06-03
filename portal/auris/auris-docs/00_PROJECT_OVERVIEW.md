# 00 · Project Overview — Auris Toolbox

## O que é
Ecossistema corporativo oficial da **Aliança Tur**. Portal do Colaborador centralizado — SPA onde todos os sistemas da empresa nascem integrados. Não é uma coleção de links. O usuário percebe um único produto.

## Fluxo de Acesso
```
Site Aliança Tur → Botão "Portal do Colaborador" → Login → Auth via Auris Core → Dashboard → Módulos por permissão
```

## Repositório
```
c:\Users\TI\Documents\auris
```

## Stack Resumida
| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS + Shadcn/UI |
| Backend | NestJS + TypeScript |
| Banco | PostgreSQL + Prisma |
| Auth | JWT + Refresh Token (SSO) |
| E-mail | Resend |
| Arquivos | MinIO / AWS S3 |
| DevOps | Docker + Docker Compose |

## Estado Atual (mai/2026)
- ✅ Frontend visual: Login, Dashboard, Layout/Header/Background
- ✅ Design System implementado (glassmorphism, cores, fontes)
- ✅ Schema Prisma completo (users, roles, permissions, auditLog, refreshToken, notification)
- ✅ NestJS iniciado (app.module, main, prisma.service)
- ✅ Estrutura de módulos criada (`src/pages/modules/`)
- ✅ Auris Signer — UI completa com assinatura padrão Adobe
- ⏳ Auth real (JWT/SSO) — pendente
- ⏳ Backend NestJS (auth, users, permissions) — pendente
- ⏳ Auris Admin — pendente
- ⏳ Auris Claims — pendente
- ⏳ Auris Calendar — pendente

## Módulos Planejados
| Módulo | Descrição | Status |
|---|---|---|
| Auris Core | Auth, users, RBAC, notificações, auditoria | 🔨 Em construção |
| Auris Claims | Gestão de sinistros e ocorrências | ⏳ Pendente |
| Auris Signer | Assinatura de documentos em lote | ✅ UI pronta |
| Auris Calendar | Calendário corporativo automatizado | ⏳ Pendente |
| Auris Admin | Painel de gestão (invisível para usuários comuns) | ⏳ Pendente |

## Princípio Central
> Todo novo sistema deve nascer como módulo do ecossistema, nunca como sistema isolado.

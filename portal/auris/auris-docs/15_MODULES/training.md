# Auris Training — Módulo

## Visão Geral

Módulo de treinamentos corporativos integrado ao Auris Toolbox Core. Permite distribuição, rastreamento e certificação de treinamentos, com foco inicial em segurança do trabalho (SIPAT).

**Rota:** `/training`  
**Componente principal:** `src/pages/modules/training/page.tsx` → `TrainingPage`  
**MSS de referência:** `AURIS TRAINING MSS v1.0` (Maio 2026)

---

## Estado Atual (Maio 2026) — Fase 1 implementada

### Frontend implementado
- Fluxo em 3 etapas: **Conteúdo → Assinatura → Certificado**
- StepIndicator visual com animações (Framer Motion)
- Player HTML5 com rastreamento de progresso e bloqueio de skip (>2s)
- Barra de progresso com marcador visual em 75%
- Formulário de dados (nome, matrícula/CPF, cargo)
- Assinatura digital em canvas (touch + mouse) via `useSignature` hook
- Captura de foto opcional via câmera (MediaDevices API)
- Geração de certificado PDF client-side (html2canvas + jsPDF)
- Certificado imprimível A4 com assinatura, foto e dados completos
- Card no Dashboard com ícone `GraduationCap` (emerald)

### Arquivos do módulo
```
src/pages/modules/training/
├── page.tsx                         # Componente principal (TrainingPage)
├── hooks/
│   └── useSignature.ts              # Hook de canvas de assinatura
└── components/
    └── CertificadoDigital.tsx       # Template do certificado para PDF
```

---

## Regras de Negócio Implementadas

| ID     | Regra                                                                 | Status     |
|--------|-----------------------------------------------------------------------|------------|
| RN-001 | Mínimo 75% do vídeo para avançar (frontend + bloqueio de skip)       | ✅ Frontend |
| RN-005 | Assinatura obrigatória; foto opcional                                  | ✅ Frontend |
| RN-007 | Email ao SESMT exige ação explícita do colaborador (botão)            | 🔧 UI pronta, sem backend |

---

## Dependências Instaladas
- `html2canvas@1.4.1` — captura do template HTML para PDF
- `jspdf@4.2.1` — geração do arquivo PDF

---

## Roadmap — Próximas Fases

### Fase 2 — Backend (NestJS)
- Schema Prisma: `Training`, `TrainingProgress`, `Certificate`, `TrainingAssignment`
- API: `PATCH /api/trainings/:id/steps/:stepId/progress` (auto-save a cada 10s)
- API: `POST /api/certificates` — geração server-side com Puppeteer
- Validação backend dos 75% (guard antes de emitir certificado)

### Fase 3 — Notificações e Email
- `POST /api/certificates/:id/send-to-sesmt` via SendGrid
- Fila BullMQ + Redis para envio assíncrono
- Template de email Auris Training com PDF em anexo

### Fase 4 — Multi-módulo
- Dashboard do colaborador: lista de treinamentos pendentes/concluídos
- Wizard admin: criação de treinamentos (vídeo/PDF/formulário/MIXED)
- Widget de pendências no Portal do Colaborador
- API de integração: `GET /api/integrations/portal/pending-trainings`

### Fase 5 — Qualidade
- Suporte a PDFs inline (react-pdf com detecção de última página)
- Formulários dinâmicos (react-hook-form + zod)
- Testes E2E Playwright (5 fluxos críticos)
- QR code de validação nos certificados

---

## Design System

Segue o padrão Auris Toolbox Core:
- Fundo glassmorphism: `rgba(255,255,255,0.07)` + `backdropFilter: blur(12px)`
- Borda: `0.5px solid rgba(255,255,255,0.13)`
- Cor de acento do módulo: `#6ee7b7` (emerald) + `rgba(16,185,129,0.18)`
- Badge "Obrigatório": amber `rgba(245,158,11,0.12)` / `#fcd34d`
- Progresso desbloqueado: `linear-gradient(90deg, #1d4ed8, #34d399)`

---

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Geração de PDF (fase atual) | html2canvas + jsPDF (client-side) | Sem backend ainda; substituir por Puppeteer server-side na Fase 3 |
| Geração de PDF (produção) | Puppeteer no NestJS | Qualidade superior, suporte a fontes, < 5s (RNF-003) |
| Filas de email | BullMQ + Redis | Envio assíncrono, retry automático, não bloqueia a API |
| Upload de arquivos | Presigned URL MinIO/S3 | Evita carga no NestJS, suporta até 2GB (vídeos) |
| Validação de progresso | Frontend + Backend | Frontend para UX imediata; backend para integridade (RN-001) |

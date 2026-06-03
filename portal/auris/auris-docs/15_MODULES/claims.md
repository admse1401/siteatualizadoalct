# Módulo · Auris Claims

## O que é
Gestão de sinistros e ocorrências da Aliança Tur. Módulo compartilhado — usuários autorizados veem os mesmos sinistros.

## Status
- ✅ Placeholder criado (`ClaimsPage.tsx`)
- ⏳ UI e backend pendentes

## Acesso
- `claims.view` — ver lista
- `claims.create` — criar novo sinistro
- `claims.edit` — editar sinistro
- `claims.approve` — aprovar/rejeitar

## Fluxo de um sinistro
```
Criação → PENDING → Análise → APPROVED ou REJECTED → CLOSED
```

## Funcionalidades planejadas

### Lista de sinistros
- Tabela com filtros: status, tipo, data, criado por
- Busca textual
- Paginação

### Criação
- Formulário: tipo, título, descrição, arquivos anexos
- Upload múltiplo para MinIO/S3

### Detalhe do sinistro
- Informações completas
- Histórico de ações (timeline)
- Arquivos anexados com download
- Área de aprovação (para quem tem `claims.approve`)
- Campo de nota na aprovação/rejeição

## Arquivos (a criar)
```
src/pages/modules/claims/
├── ClaimsPage.tsx
└── components/
    ├── ClaimsList.tsx
    ├── CreateClaimForm.tsx
    ├── ClaimDetail.tsx
    ├── ClaimHistory.tsx
    └── ApprovalPanel.tsx
```

## Banco de dados
Ver `06_DATABASE_DER.md` → seção Claims Database.

## Notificações geradas
- Criação: notifica aprovadores
- Aprovação/rejeição: notifica quem criou

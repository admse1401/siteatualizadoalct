# Módulo · Auris Calendar

## O que é
Calendário corporativo automatizado da Aliança Tur. Centraliza eventos, reuniões e lembretes da empresa.

## Status
- ✅ Placeholder criado (`CalendarPage.tsx`)
- ⏳ UI e backend pendentes

## Acesso
- `calendar.view` — visualizar calendário e eventos
- `calendar.manage` — criar e editar eventos

## Funcionalidades planejadas

### Visualizações
- Mensal (grid padrão de calendário)
- Semanal (colunas por dia)
- Diária (lista do dia)

### Eventos
- Criar evento: título, descrição, data/hora início e fim
- Convidar participantes (usuários do sistema)
- Notificações automáticas de lembrete (X minutos antes)

### Integração com notificações
- Lembrete enviado via sistema de notificações do Core
- Badge no header quando há evento próximo

## Arquivos (a criar)
```
src/pages/modules/calendar/
├── CalendarPage.tsx
└── components/
    ├── MonthView.tsx
    ├── WeekView.tsx
    ├── DayView.tsx
    ├── EventModal.tsx
    └── ReminderConfig.tsx
```

## Banco de dados
Ver `06_DATABASE_DER.md` → seção Calendar Database.

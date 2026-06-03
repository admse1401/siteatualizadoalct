# 04 · Non-Functional Requirements — Auris Toolbox

## Performance
- SPA sem reload entre módulos
- Transições de rota com animação (motion/react): 300ms
- Lazy loading por módulo (code splitting no Vite)
- Refresh token automático sem percepção do usuário

## Segurança
- HTTPS obrigatório em produção
- JWT access token: expiração curta (15min recomendado)
- Refresh token: expiração longa (7 dias), armazenado em httpOnly cookie
- Bcrypt para hash de senhas (salt rounds ≥ 12)
- Rate limiting no API Gateway por usuário e por rota
- Proteção contra: SQL Injection (Prisma parameterized), XSS, CSRF
- Conformidade LGPD: dados pessoais tratados com consentimento

## Escalabilidade
- Banco por módulo (não monolítico) — isolamento de falhas
- Integração entre módulos via JWT/API, nunca via banco direto
- Core construído uma vez, módulos adicionados sem alterar Core
- Docker Compose para dev; containers independentes em produção

## Disponibilidade
- Rollback automático em caso de falha no deploy
- Backup automático dos bancos de dados
- Monitoramento de uptime e performance
- Logs centralizados com alertas

## Usabilidade
- Responsivo — funciona em desktop e mobile
- Dashboard se ajusta conforme número de módulos (grade responsiva)
- Feedback visual em todas as ações assíncronas (loading states)
- Mensagens de erro claras e acionáveis

## Manutenibilidade
- TypeScript em todo o projeto (frontend e backend)
- Prisma migrations versionadas
- Separação clara: Core vs Módulos
- Variáveis de ambiente para todos os segredos (.env)
- Documentação em /docs (este repositório)

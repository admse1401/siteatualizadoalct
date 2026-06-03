# 12 · Security — Auris Toolbox

## Autenticação e Sessão
- JWT access token: expiração curta (15min)
- Refresh token: httpOnly cookie (não acessível por JS), expiração 7 dias
- Refresh tokens armazenados no banco — revogáveis a qualquer momento
- Logout em todos os dispositivos: deleta todos os RefreshTokens do usuário
- MFA: arquitetura preparada para expansão futura (TOTP)

## Senhas
- Hash: bcrypt, salt rounds = 12
- Nunca armazenar senha em plain text, logs ou JWT
- Reset de senha invalida todas as sessões ativas
- Link de reset expira em 1 hora
- Link de ativação expira em 48 horas

## Proteção de Rotas (Backend)
```typescript
// Todas as rotas são protegidas por padrão (JwtAuthGuard global)
// Rotas públicas recebem @Public() decorator
// Rotas com permissão recebem @RequirePermission('action.name')
// Validação de input: class-validator em todos os DTOs
```

## Proteção de Aplicação Web
- **SQL Injection**: prevenido pelo Prisma (queries parametrizadas)
- **XSS**: React escapa output por padrão; nunca usar dangerouslySetInnerHTML
- **CSRF**: tokens CSRF em requisições que modificam estado (ou SameSite cookie)
- **CORS**: permitir apenas origens conhecidas (APP_URL)
- **Rate Limiting**: via NestJS ThrottlerModule no API Gateway
  - Login: máx 5 tentativas / 15min por IP
  - Geral: máx 100 req / min por usuário

## Conformidade LGPD
- Dados pessoais coletados: nome, e-mail, cargo, setor, foto (opcional)
- Base legal: contrato de trabalho
- Direito de acesso: usuário vê seus próprios dados em /users/me
- Retenção: definir política de exclusão de logs e dados inativos
- Sem compartilhamento com terceiros (exceto Resend para e-mail transacional)

## Logs de Segurança
Separados dos logs de auditoria de negócio. Registrar:
- Tentativas de login falhas (IP, email, timestamp)
- Tokens inválidos recebidos
- Tentativas de acesso a recursos sem permissão (403)
- Rate limit atingido

## Secrets Management
- Todos os secrets em variáveis de ambiente (.env)
- .env nunca commitado no repositório (.gitignore)
- Em produção: usar secrets manager (ex: AWS Secrets Manager, Doppler)
- Rotação periódica de JWT_SECRET e REFRESH_TOKEN_SECRET

## HTTPS
- Obrigatório em produção
- Certificado TLS válido
- HSTS header habilitado
- Redirect automático HTTP → HTTPS

## Checklist de Segurança antes do Deploy
- [ ] .env.example atualizado (sem valores reais)
- [ ] JWT_SECRET com entropia suficiente (≥ 64 chars aleatórios)
- [ ] CORS configurado apenas para domínios da empresa
- [ ] Rate limiting ativo
- [ ] HTTPS configurado
- [ ] Logs de segurança ativos
- [ ] Backup do banco configurado

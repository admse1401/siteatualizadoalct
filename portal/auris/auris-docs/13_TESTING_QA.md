# 13 · Testing & QA — Auris Toolbox

## Estratégia

### Pirâmide de Testes
```
        [E2E]          → Fluxos críticos (login, assinar doc, criar sinistro)
      [Integration]    → API endpoints com banco real
    [Unit Tests]       → Services, guards, utilities
```

## Unit Tests (Backend)

Testar isoladamente, sem banco:
- `AuthService.login()` — credenciais válidas, inválidas, conta inativa
- `AuthService.refreshToken()` — token válido, expirado, revogado
- `UsersService` — CRUD básico
- `PermissionGuard` — com e sem permissão
- `JwtStrategy` — payload válido/inválido

```bash
# Rodar unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

## Integration Tests (Backend)

Testar endpoints com banco de teste (Postgres test DB):
- `POST /auth/login` → 200 com token / 401 credenciais inválidas
- `POST /auth/refresh` → 200 com novo token / 401 token expirado
- `GET /users/me` → 200 com permissões / 401 sem token
- `POST /admin/users` → 201 cria usuário + envia e-mail
- `GET /admin/users` → 403 para não-admin

```bash
npm run test:e2e
```

## Frontend Tests

- Testar componentes críticos com Vitest + Testing Library
- `AuthStore` — login, logout, hasPermission
- `PrivateRoute` — redireciona sem token
- `PermissionGuard` — esconde/mostra filhos
- `Dashboard` — cards corretos por permissão

## E2E Tests (Playwright — a implementar)

Fluxos críticos:
1. Login → Dashboard → Entrar em módulo → Voltar
2. Admin cria usuário → Colaborador recebe convite → Ativa conta → Faz login
3. Upload PDF → Validar certificado → Posicionar assinatura → Baixar assinado
4. Esqueci senha → Receber e-mail → Redefinir → Fazer login

## QA Manual — Checklist por Feature

### Auth
- [ ] Login com credenciais válidas
- [ ] Login com senha errada — mensagem clara
- [ ] Login com conta inativa — mensagem clara
- [ ] Refresh token automático (expirar access token e fazer requisição)
- [ ] Logout limpa sessão e redireciona
- [ ] Esqueci senha — e-mail chega, link funciona, expira em 1h
- [ ] Ativação — link funciona, expira em 48h, segundo clique no link inválido

### Dashboard
- [ ] Cards corretos para cada perfil de permissão
- [ ] Usuário sem nenhum módulo — tela adequada
- [ ] Hover nos cards
- [ ] Transição ao entrar/sair de módulo

### Auris Signer
- [ ] Upload de múltiplos PDFs
- [ ] Upload de certificado .p12 com senha correta
- [ ] Upload de certificado .p12 com senha errada — erro claro
- [ ] Posicionar assinatura no PDF — arrastar, redimensionar
- [ ] Rubrica PNG transparente — sem fundo branco
- [ ] Rubrica PNG com fundo branco — aviso exibido
- [ ] Download do PDF assinado
- [ ] Assinatura válida no Adobe Reader

## Ambientes de Teste
```env
# .env.test
DATABASE_URL="postgresql://auris:senha@localhost:5432/auris_test"
JWT_SECRET="test_secret"
# E-mail: usar Resend sandbox ou mock
```

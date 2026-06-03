# 03 · Functional Requirements — Auris Toolbox

## Core — Autenticação
- [ ] POST /auth/login — valida email/senha, retorna JWT + refresh token
- [ ] POST /auth/refresh — renova access token com refresh token válido
- [ ] POST /auth/logout — invalida refresh token no banco
- [ ] POST /auth/forgot-password — envia e-mail de reset via Resend
- [ ] POST /auth/reset-password — aplica nova senha via token (expira 1h)
- [ ] POST /auth/activate — colaborador define senha e ativa conta (token 48h)
- [ ] JWT Guard global protegendo todas as rotas privadas

## Core — Usuários
- [ ] GET /users/me — perfil + permissões do usuário logado
- [ ] PATCH /users/me — atualiza nome, cargo, avatar
- [ ] Upload de foto de perfil (MinIO/S3)

## Core — Admin
- [ ] POST /admin/users — cria usuário e dispara convite via Resend
- [ ] GET /admin/users — lista todos os usuários com roles/permissões
- [ ] PATCH /admin/users/:id — editar usuário (cargo, setor, status, permissões)
- [ ] POST /admin/users/:id/block — bloquear acesso
- [ ] POST /admin/users/:id/reset-password — admin força reset
- [ ] GET /admin/audit-logs — log filtrado por usuário, módulo, ação, data

## Core — Notificações
- [ ] GET /notifications — lista notificações do usuário
- [ ] PATCH /notifications/:id/read — marcar como lida
- [ ] PATCH /notifications/read-all — marcar todas como lidas
- [ ] Badge de contagem no header em tempo real

## Frontend — Auth
- [ ] Tela de Login conectada ao POST /auth/login
- [ ] Tratamento de erros (credenciais inválidas, conta inativa)
- [ ] Redirect para dashboard após login bem-sucedido
- [ ] Tela /forgot-password — formulário de e-mail
- [ ] Tela /reset-password?token=xxx — formulário de nova senha
- [ ] Tela /activate?token=xxx — primeiro acesso, define senha

## Frontend — Dashboard
- [ ] Auth Store (Zustand): user, accessToken, login(), logout(), refreshToken()
- [ ] Axios interceptor: injeta JWT e faz refresh automático em 401
- [ ] PrivateRoute: redireciona para /login se sem token
- [ ] PermissionGuard: esconde card se usuário não tem permissão mínima
- [ ] Cards montados a partir das permissões reais do usuário logado
- [ ] Saudação real: "Olá, [nome do usuário]" — sem hardcode
- [ ] Header com avatar/iniciais reais, cargo, notificações com contagem real

## Auris Signer (UI pronta — ver módulo)
- [ ] Upload de PDFs múltiplos
- [ ] Validação de certificado A1 (.p12) com node-forge
- [ ] Suporte a certificado do Windows Store (Electron/API)
- [ ] Posicionamento visual da assinatura no PDF (arrastar + redimensionar)
- [ ] Assinatura digital válida PKCS#7/CMS via @signpdf
- [ ] Fundo transparente no selo de assinatura (padrão Adobe)
- [ ] Rubrica PNG com canal alfa (sem fundo branco)
- [ ] Download individual ou .zip com todos assinados

## Auris Claims
- [ ] CRUD de sinistros
- [ ] Upload de arquivos (MinIO/S3)
- [ ] Fluxo de aprovação: pendente → aprovado/rejeitado
- [ ] Histórico de ações por sinistro
- [ ] Filtros e busca

## Auris Calendar
- [ ] CRUD de eventos
- [ ] Convites para participantes
- [ ] Visualização mensal/semanal/diária
- [ ] Notificações automáticas de lembretes

## Assistente IA
- [ ] Painel lateral deslizante (não ocupa tela principal)
- [ ] Histórico de conversa por sessão
- [ ] Integração com Google Gemini (@google/genai já instalado)
- [ ] Contexto dinâmico por módulo ativo

# 02 · Business Rules — Auris Toolbox

## Regras de Acesso

### Criação de usuários
- Não há cadastro público
- Apenas administradores criam usuários
- Fluxo: Admin preenche dados → sistema envia convite via Resend → token 48h → colaborador ativa e define senha
- Login liberado somente após ativação

### Permissões
- Setor é classificação organizacional apenas — não define acesso
- Acesso é definido exclusivamente por permissões granulares
- Um usuário de TI pode ter acesso a RH; um de RH pode ter acesso a Claims
- Dashboard montado dinamicamente: card só aparece se usuário tem a permissão mínima do módulo

### Sessão
- SSO: login único acessa todos os módulos autorizados
- Refresh Token renova sessão automaticamente
- Logout invalida refresh token no banco
- Suporte futuro a logout em todos os dispositivos

## Regras de Módulos

### Contrato obrigatório — todo novo módulo DEVE:
1. Usar autenticação centralizada do Core (nunca criar login próprio)
2. Respeitar RBAC do Core
3. Registrar ações no sistema de auditoria do Core
4. Usar sistema de notificações do Core
5. Usar dados de perfil do Core
6. Seguir o Design System Auris
7. Comunicar-se via API Gateway (nunca diretamente entre módulos)

### Tipos de módulo
- **Compartilhado**: usuários autorizados veem os mesmos registros (ex: Claims — sinistro criado por A é visível para B com permissão)
- **Privado**: cada usuário vê apenas seus próprios dados (ex: Web Recover)

## Regras de Auditoria
Toda ação relevante deve ser registrada. Exemplos:
- Login e logout
- Alteração de permissões
- Criação, edição, exclusão de registros
- Assinaturas de documentos
- Aprovações e rejeições
- Envio de convites
- Redefinição de senha

## Regras de Segurança
- HTTPS obrigatório em produção
- Senhas com bcrypt
- Tokens JWT com expiração curta + refresh token com expiração longa
- Proteção: SQL Injection, XSS, CSRF
- Conformidade LGPD
- Logs de segurança separados dos logs de auditoria de negócio

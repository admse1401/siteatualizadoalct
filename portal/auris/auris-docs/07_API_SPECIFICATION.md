# 07 · API Specification — Auris Toolbox

## Base URL
```
http://localhost:3000/api/v1   (dev)
https://api.aliancatur.com.br/v1  (prod)
```

## Auth Header
```
Authorization: Bearer <accessToken>
```

---

## Auth Endpoints

### POST /auth/login
```json
// Request
{ "email": "joao@aliancatur.com.br", "password": "senha123" }

// Response 200
{
  "accessToken": "eyJ...",
  "user": { "id": "uuid", "name": "João da Silva", "email": "...", "cargo": "Operações" }
}
// refreshToken via httpOnly cookie
```

### POST /auth/refresh
```json
// Request: refreshToken via cookie (automático)
// Response 200
{ "accessToken": "eyJ..." }
```

### POST /auth/logout
```json
// Request: sem body, refreshToken via cookie
// Response 204 No Content
```

### POST /auth/forgot-password
```json
// Request
{ "email": "joao@aliancatur.com.br" }
// Response 200 (sempre, mesmo se e-mail não existir — evita enumeração)
{ "message": "Se o e-mail existir, você receberá um link." }
```

### POST /auth/reset-password
```json
// Request
{ "token": "abc123", "password": "novaSenha123" }
// Response 200
{ "message": "Senha redefinida com sucesso." }
```

### POST /auth/activate
```json
// Request
{ "token": "abc123", "password": "primeiroAcesso123" }
// Response 200
{ "message": "Conta ativada." }
```

---

## Users Endpoints

### GET /users/me
```json
// Response 200
{
  "id": "uuid",
  "name": "João da Silva",
  "email": "joao@aliancatur.com.br",
  "cargo": "Operações",
  "setor": "TI",
  "avatarUrl": null,
  "permissions": ["claims.view", "signer.use", "calendar.view"]
}
```

### PATCH /users/me
```json
// Request
{ "name": "João Silva", "cargo": "Analista" }
// Response 200: usuário atualizado
```

---

## Admin Endpoints

### POST /admin/users
```json
// Request
{ "name": "Maria Souza", "email": "maria@aliancatur.com.br", "cargo": "RH", "setor": "RH", "permissions": ["claims.view"] }
// Response 201: usuário criado, convite enviado
```

### GET /admin/users
```json
// Query params: ?search=maria&status=active&setor=rh&page=1&limit=20
// Response 200
{ "users": [...], "total": 42, "page": 1 }
```

### PATCH /admin/users/:id
```json
// Request
{ "cargo": "Gerente", "isActive": false, "permissions": ["claims.view", "claims.approve"] }
```

### POST /admin/users/:id/block
```json
// Response 200
{ "message": "Usuário bloqueado." }
```

### POST /admin/users/:id/reset-password
```json
// Response 200 — envia e-mail de reset para o usuário
```

### GET /admin/audit-logs
```json
// Query: ?userId=&module=claims&action=&from=2026-01-01&to=2026-12-31&page=1
// Response 200
{ "logs": [...], "total": 100 }
```

---

## Notifications Endpoints

### GET /notifications
```json
// Response 200
{ "notifications": [...], "unreadCount": 3 }
```

### PATCH /notifications/:id/read
### PATCH /notifications/read-all

---

## Error Response Padrão
```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Senha incorreta."
}
```

## Códigos de Status Usados
| Código | Uso |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content (logout, deletes) |
| 400 | Bad Request (validação) |
| 401 | Unauthorized (token inválido/expirado) |
| 403 | Forbidden (sem permissão) |
| 404 | Not Found |
| 409 | Conflict (e-mail já existe) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

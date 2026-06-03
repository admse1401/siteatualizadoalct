# Como ver os logs do projeto

## 1. Logs do servidor (API — envio de e-mail)

Os logs do servidor aparecem **no terminal onde você rodou `npm run api`**.

Exemplo do que aparece ao iniciar:

```
🚀 API server rodando em http://localhost:3500
   → Contato:     POST /api/contact
   → Candidatura: POST /api/jobs
   → Destino dos e-mails: faleconosco@aliancatur.com
   → Remetente:   noreply@portal.aliancatur.com
```

Exemplo ao receber um formulário de contato:

```
[/api/contact] Requisição recebida
[/api/contact] Body: { "nome": "João", "email": "joao@empresa.com", ... }
[/api/contact] Enviando e-mail via Resend → faleconosco@aliancatur.com
[/api/contact] ✅ E-mail enviado com sucesso. ID Resend: abc123xyz
```

Exemplo de erro:

```
[/api/contact] ❌ Erro ao enviar e-mail: Error: Invalid API Key
```

---

## 2. Logs do frontend (navegador)

Abra o **Console do navegador**:

- **Chrome / Edge:** pressione `F12` → clique na aba **Console**
- **Firefox:** pressione `F12` → clique na aba **Console**
- **Mac:** `Cmd + Option + J`

Exemplo de envio bem-sucedido:

```
[Contact] Enviando formulário: { nome: "João", email: "...", ... }
[Contact] ✅ Formulário enviado com sucesso
```

Exemplo de erro:

```
[Contact] Enviando formulário: { ... }
[Contact] ❌ Falha ao enviar formulário: Error: HTTP 500 — Falha ao enviar e-mail.
```

Para candidaturas (Trabalhe Conosco), os prefixos são `[TrabalheConosco]` em vez de `[Contact]`.

---

## 3. O que cada mensagem significa

| Mensagem | O que significa |
|---|---|
| `⚠️ RESEND_API_KEY não definida` | O arquivo `.env` não tem a chave da Resend — e-mails não serão enviados |
| `⚠️ TO_EMAIL não definido` | Usando e-mail padrão; verifique o `.env` |
| `Requisição recebida` | O formulário chegou no servidor |
| `Campos obrigatórios faltando` | O frontend enviou dados incompletos (não deveria acontecer com a validação ativa) |
| `✅ E-mail enviado com sucesso` | Tudo certo, e-mail entregue à Resend |
| `❌ Erro ao enviar e-mail` | Falha na Resend — veja o erro logo abaixo para detalhes |
| `HTTP 500` no frontend | O servidor teve um erro interno (veja o terminal do `npm run api`) |
| `HTTP 400` no frontend | Dados inválidos enviados ao servidor |
| `Failed to fetch` no frontend | O servidor de API não está rodando — execute `npm run api` |

---

## 4. Checklist rápido quando algo não funciona

1. O terminal do `npm run api` está aberto e mostra `🚀 API server rodando`?
2. Aparece `⚠️ RESEND_API_KEY não definida`? → Verifique o arquivo `.env`
3. O console do navegador mostra `Failed to fetch`? → O servidor API não está rodando
4. O console mostra `HTTP 500`? → Veja o erro no terminal do `npm run api`
5. O domínio remetente está verificado no painel da Resend (resend.com/domains)?

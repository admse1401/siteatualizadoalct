import express from 'express';
import { Resend } from 'resend';
import 'dotenv/config';

const app  = express();
const port = process.env.API_PORT || 3500;

const TO_EMAIL   = process.env.TO_EMAIL   || 'faleconosco@aliancatur.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@aliancatur.com';

// ─── Validação de configuração ao iniciar ─────────────────────────
if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  [CONFIG] RESEND_API_KEY não definida no .env — envios de e-mail vão falhar!');
}
if (!process.env.TO_EMAIL) {
  console.warn(`⚠️  [CONFIG] TO_EMAIL não definido no .env — usando padrão: ${TO_EMAIL}`);
}
if (!process.env.FROM_EMAIL) {
  console.warn(`⚠️  [CONFIG] FROM_EMAIL não definido no .env — usando padrão: ${FROM_EMAIL}`);
}

const resend = new Resend(process.env.RESEND_API_KEY);

app.use(express.json());

// ─── Contato comercial ────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  console.log('[/api/contact] Requisição recebida');
  console.log('[/api/contact] Body:', JSON.stringify(req.body, null, 2));

  const { nome, empresa, email, tel, servico, detalhes } = req.body;

  if (!nome || !email || !tel || !servico || !detalhes) {
    console.warn('[/api/contact] Campos obrigatórios faltando:', {
      nome: !!nome, email: !!email, tel: !!tel, servico: !!servico, detalhes: !!detalhes,
    });
    res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    return;
  }

  try {
    console.log(`[/api/contact] Enviando e-mail via Resend → ${TO_EMAIL}`);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to:   TO_EMAIL,
      replyTo: email,
      subject: `[Contato] ${servico} — ${nome}${empresa ? ` (${empresa})` : ''}`,
      html: `
        <h2 style="color:#C1121F;">Nova solicitação de contato</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;width:160px;">Nome</td><td style="padding:8px;">${nome}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">Empresa</td><td style="padding:8px;">${empresa || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">E-mail</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">Telefone</td><td style="padding:8px;">${tel}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Serviço</td><td style="padding:8px;">${servico}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">Detalhes</td><td style="padding:8px;">${detalhes.replace(/\n/g, '<br/>')}</td></tr>
        </table>
      `,
    });

    console.log('[/api/contact] ✅ E-mail enviado com sucesso. ID Resend:', result.data?.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/contact] ❌ Erro ao enviar e-mail:', err);
    res.status(500).json({ error: 'Falha ao enviar e-mail.' });
  }
});

// ─── Trabalhe conosco ─────────────────────────────────────────────
app.post('/api/jobs', async (req, res) => {
  console.log('[/api/jobs] Requisição recebida');
  console.log('[/api/jobs] Body:', JSON.stringify(req.body, null, 2));

  const { nome, email, tel, cidade, cargo, cnh, experiencia, apresentacao } = req.body;

  if (!nome || !email || !tel || !cidade || !cargo || !apresentacao) {
    console.warn('[/api/jobs] Campos obrigatórios faltando:', {
      nome: !!nome, email: !!email, tel: !!tel, cidade: !!cidade, cargo: !!cargo, apresentacao: !!apresentacao,
    });
    res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    return;
  }

  try {
    console.log(`[/api/jobs] Enviando candidatura via Resend → ${TO_EMAIL}`);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to:   TO_EMAIL,
      replyTo: email,
      subject: `[Candidatura] ${cargo} — ${nome} (${cidade})`,
      html: `
        <h2 style="color:#C6A969;">Nova candidatura recebida</h2>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
          <tr><td style="padding:8px;font-weight:bold;width:160px;">Nome</td><td style="padding:8px;">${nome}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">E-mail</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Telefone</td><td style="padding:8px;">${tel}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">Cidade / Estado</td><td style="padding:8px;">${cidade}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Cargo Desejado</td><td style="padding:8px;">${cargo}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">CNH</td><td style="padding:8px;">${cnh || '—'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Experiência</td><td style="padding:8px;">${experiencia || '—'}</td></tr>
          <tr style="background:#f5f5f5"><td style="padding:8px;font-weight:bold;">Apresentação</td><td style="padding:8px;">${apresentacao.replace(/\n/g, '<br/>')}</td></tr>
        </table>
      `,
    });

    console.log('[/api/jobs] ✅ Candidatura enviada com sucesso. ID Resend:', result.data?.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[/api/jobs] ❌ Erro ao enviar candidatura:', err);
    res.status(500).json({ error: 'Falha ao enviar e-mail.' });
  }
});

app.listen(port, () => {
  console.log(`\n🚀 API server rodando em http://localhost:${port}`);
  console.log(`   → Contato:    POST /api/contact`);
  console.log(`   → Candidatura: POST /api/jobs`);
  console.log(`   → Destino dos e-mails: ${TO_EMAIL}`);
  console.log(`   → Remetente:  ${FROM_EMAIL}\n`);
});

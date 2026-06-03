import { Resend } from 'resend';
import { getDB } from './db';

// JSON Themes
const MONTH_THEMES: Record<number, any> = {
  1: { name: "Janeiro Branco", emoji: "🧠", color: "#FFFFFF", comps: ["🕊️", "✨", "🤍"] },
  5: { name: "Maio Amarelo", emoji: "🚦", color: "#FFD700", comps: ["🚗", "🚲", "⚠️"] },
  7: { name: "Julho Amarelo", emoji: "🎗️", color: "#F1C40F", comps: ["🏥", "☀️", "💛"] },
  10: { name: "Outubro Rosa", emoji: "🎀", color: "#FF69B4", comps: ["🌸", "♀️", "💞"] },
  11: { name: "Novembro Azul", emoji: "🧔", color: "#3498DB", comps: ["💙", "👨‍⚕️", "👔"] },
};

export async function sendEmail(opts: { to: string, subject: string, html: string, type: string, eventId?: number }) {
  const db = getDB();
  const settingsRows = await db.all("SELECT key, value FROM settings");
  const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);

  const resendApiKey = s.resend_api_key || process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("Resend API Key is missing. Simulating email send");
    await db.run(`INSERT INTO email_logs (send_date, trigger_type, status, recipient, error_message, event_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [new Date().toISOString(), opts.type, "SUCCESS", opts.to, "Simulated (No API Key)", opts.eventId || null]
    );
    return true;
  }

  const senderEmail = (s.sender_email || 'onboarding@resend.dev').trim();
  const toEmail = (opts.to || '').trim();
  
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail(senderEmail)) {
     console.error("Invalid from email:", senderEmail);
     await db.run(`INSERT INTO email_logs (send_date, trigger_type, status, recipient, error_message, event_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [new Date().toISOString(), opts.type, "ERROR", toEmail, "Domain not verified / Invalid 'from' email", opts.eventId || null]
     );
     return false;
  }
  
  if (!isValidEmail(toEmail)) {
     console.error("Invalid to email:", toEmail);
     await db.run(`INSERT INTO email_logs (send_date, trigger_type, status, recipient, error_message, event_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [new Date().toISOString(), opts.type, "ERROR", toEmail, "Invalid 'to' email address", opts.eventId || null]
     );
     return false;
  }

  const resend = new Resend(resendApiKey);

  try {
    let payload = {
      from: `Aliança Tur <${senderEmail}>`,
      to: [toEmail],
      subject: opts.subject,
      html: opts.html,
    };

    let { data, error } = await resend.emails.send(payload);
    
    if (error && error.message.includes("not verified")) {
       console.warn("Domain not verified, attempting fallback to onboarding@resend.dev...");
       payload.from = `Aliança Tur <onboarding@resend.dev>`;
       const retry = await resend.emails.send(payload);
       error = retry.error;
       data = retry.data;
    }

    if (error) throw new Error(error.message);

    await db.run(`INSERT INTO email_logs (send_date, trigger_type, status, recipient, error_message, event_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [new Date().toISOString(), opts.type, "SUCCESS", opts.to, null, opts.eventId || null]
    );
    return true;
  } catch (error: any) {
    console.error("Email sending failed", error);
    await db.run(`INSERT INTO email_logs (send_date, trigger_type, status, recipient, error_message, event_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [new Date().toISOString(), opts.type, "ERROR", opts.to, error.message, opts.eventId || null]
    );
    return false;
  }
}

export function buildEventEmailHtml(event: any, month: number, isMonthly: boolean = false, extraMsg: string = "", s?: any): string {
  const theme = MONTH_THEMES[month] || { name: "Calendário", emoji: "📅", color: "#185FA5", comps: [] };
  const logoHtml = s?.company_logo ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${s.company_logo}" alt="Aliança Tur" style="max-height: 60px;"></div>` : '';
  const signature = s?.email_signature || "Auris Calendário Corporativo é uma ferramenta da Auris Toolbox";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Arial', sans-serif; background-color: #f4f6f9; color: #333; margin: 0; padding: 20px 0; }
  .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 16px rgba(0,0,0,0.05); }
  .banner { background-color: ${theme.color}; color: ${theme.color === '#FFFFFF' ? '#333' : '#fff'}; padding: 40px 20px; text-align: center; }
  .banner h1 { margin: 0; font-size: 28px; font-weight: 600; }
  .content { padding: 40px 30px; }
  .section-title { color: #185FA5; border-bottom: 2px solid #85B7EB; padding-bottom: 8px; margin-top: 30px; font-size: 20px; }
  .footer { background-color: #042C53; color: #fff; text-align: center; padding: 25px; font-size: 13px; opacity: 0.9; }
  .footer p { margin: 5px 0; }
  .btn { display: inline-block; padding: 12px 24px; background-color: #185FA5; color: #fff; text-decoration: none; border-radius: 6px; margin-top: 30px; font-weight: bold; }
</style>
</head>
<body>
  ${logoHtml}
  <div class="container">
    <div class="banner">
      <h1>${theme.emoji} ${theme.name} ${theme.comps.join(' ')}</h1>
    </div>
    <div class="content">
      <p style="font-size: 16px; color: #555;">Prezados,</p>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">Segue abaixo o calendário corporativo referente às nossas próximas ações:</p>
      
      ${extraMsg ? `<h3 style="color: #185FA5;">${extraMsg}</h3>` : ''}

      <div class="event-details">
        <h2 class="section-title">Datas de Ouro</h2>
        <p style="font-size: 16px;"><strong>${event?.title || 'Campanha Mensal'}</strong> ${event?.event_date ? `- ${event.event_date.split('-').reverse().join('/')}` : ''}</p>
        <p style="color: #666; line-height: 1.5;">${event?.description || 'Vamos juntos celebrar mais um mês com resultados incríveis.'}</p>
      </div>

      <div class="regionalidade">
        <h2 class="section-title">Regionalidade</h2>
        <p style="color: #666; line-height: 1.5;">Cidades em foco para aniversários e ações regionais: Aracaju, Parauapebas e localidades em Sergipe, Pará, Goiás e Piauí.</p>
      </div>

      <center><a href="#" class="btn">Acessar o Dashboard</a></center>
    </div>
    <div class="footer">
      <p>${signature}</p>
    </div>
  </div>
</body>
</html>`;
}

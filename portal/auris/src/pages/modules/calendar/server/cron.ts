import cron from 'node-cron';
import { getDB } from './db';
import { sendEmail, buildEventEmailHtml } from './email';
import { addDays, format, parseISO } from 'date-fns';

export async function getTargetEmails(db: any, send_type: string) {
  if (!send_type || send_type === 'Todos' || send_type === 'amplo') {
    const contacts = await db.all("SELECT email FROM contacts");
    return contacts.map((c: any) => c.email);
  }
  const contacts = await db.all("SELECT email FROM contacts WHERE sector = ?", [send_type]);
  return contacts.map((c: any) => c.email);
}

export async function initCron() {
  console.log("Initializing Cron Jobs...");

  // Monthly on 1st day at 07:00 AM
  cron.schedule('0 7 1 * *', async () => {
    console.log("Running Monthly Report Email...");
    const db = getDB();
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    
    const settingsRows = await db.all("SELECT key, value FROM settings");
    const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);

    const startObj = new Date(today.getFullYear(), today.getMonth(), 1);
    const endObj = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startStr = format(startObj, 'yyyy-MM-dd');
    const endStr = format(endObj, 'yyyy-MM-dd');

    const events = await db.all(`SELECT * FROM events WHERE event_date >= ? AND event_date <= ? AND status = 'published' AND is_paused = 0`, [startStr, endStr]);
    const campaign = await db.get(`SELECT * FROM campaigns WHERE month = ? AND year = ?`, [currentMonth, today.getFullYear()]);
    
    const monthHtml = buildEventEmailHtml({ 
      title: campaign?.title || 'Eventos do Mês', 
      event_date: startStr, 
      description: `Temos ${events.length} eventos este mês. ${campaign?.description || ''}` 
    }, currentMonth, true, "", s);
    
    const emails = await getTargetEmails(db, campaign?.target_sector || 'Todos');
    if (emails.length > 0) {
      for (const email of emails) {
        await sendEmail({
          to: email, 
          subject: `[Aliança Tur] Calendário Mensal - ${currentMonth}/${today.getFullYear()}`,
          html: monthHtml,
          type: 'MONTHLY'
        });
      }
    }
  });

  cron.schedule('30 7 * * *', async () => {
    console.log("Running Daily Event Alert Checks...");
    const db = getDB();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const t2Str = format(addDays(new Date(), 2), 'yyyy-MM-dd');

    const settingsRows = await db.all("SELECT key, value FROM settings");
    const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);

    // D-0 Alerts
    const d0Events = await db.all(`SELECT * FROM events WHERE event_date = ? AND status = 'published' AND is_paused = 0`, [todayStr]);
    for (const ev of d0Events) {
      const html = buildEventEmailHtml(ev, new Date(ev.event_date).getMonth()+1, false, "Hoje celebramos o evento. Compartilhe nos grupos!", s);
      const emails = await getTargetEmails(db, ev.send_type);
      for (const email of emails) {
        await sendEmail({ to: email, subject: `[Alerta D-0] ${ev.title}`, html, type: 'D-0', eventId: ev.id });
      }
    }

    // T-1 Alerts
    const t1Events = await db.all(`SELECT * FROM events WHERE event_date = ? AND status = 'published' AND is_paused = 0`, [tomorrowStr]);
    for (const ev of t1Events) {
      const html = buildEventEmailHtml(ev, new Date(ev.event_date).getMonth()+1, false, "Amanhã é o evento. Tudo pronto?", s);
      const emails = await getTargetEmails(db, ev.send_type);
      for (const email of emails) {
        await sendEmail({ to: email, subject: `[Alerta T-1] ${ev.title}`, html, type: 'T-1', eventId: ev.id });
      }
    }

    // T-2 Alerts
    const t2Events = await db.all(`SELECT * FROM events WHERE event_date = ? AND status = 'published' AND is_paused = 0`, [t2Str]);
    for (const ev of t2Events) {
      const html = buildEventEmailHtml(ev, new Date(ev.event_date).getMonth()+1, false, "Hora de finalizar a arte para o evento!", s);
      const emails = await getTargetEmails(db, ev.send_type);
      for (const email of emails) {
        await sendEmail({ to: email, subject: `[Alerta T-2] ${ev.title}`, html, type: 'T-2', eventId: ev.id });
      }
    }
  });
}

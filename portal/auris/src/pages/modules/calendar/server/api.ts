import { Router } from "express";
import { getDB } from "./db";
import { addDays, parseISO, differenceInDays } from "date-fns";
import { buildEventEmailHtml, sendEmail } from "./email";
import { getTargetEmails } from "./cron";

const router = Router();

// Events
router.get("/events", async (req, res) => {
  const db = getDB();
  const events = await db.all("SELECT * FROM events ORDER BY event_date ASC");
  res.json(events);
});

router.post("/events", async (req, res) => {
  const db = getDB();
  const { title, description, event_date, category, color_tag, send_type, is_recurrent, recipients, attachment_url, status } = req.body;
  const result = await db.run(
    `INSERT INTO events (title, description, event_date, category, color_tag, send_type, is_recurrent, recipients, attachment_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description, event_date, category, color_tag, send_type, is_recurrent ? 1 : 0, JSON.stringify(recipients || []), attachment_url, status || 'published']
  );
  res.json({ id: result.lastID });
});

router.put("/events/:id", async (req, res) => {
  const db = getDB();
  const { title, description, event_date, category, color_tag, send_type, is_recurrent, recipients, attachment_url, status } = req.body;
  await db.run(
    `UPDATE events 
     SET title=?, description=?, event_date=?, category=?, color_tag=?, send_type=?, is_recurrent=?, recipients=?, attachment_url=?, status=?
     WHERE id=?`,
    [title, description, event_date, category, color_tag, send_type, is_recurrent ? 1 : 0, JSON.stringify(recipients || []), attachment_url, status || 'published', req.params.id]
  );
  res.json({ success: true });
});

router.delete("/events/:id", async (req, res) => {
  const db = getDB();
  await db.run("DELETE FROM events WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

// Contacts
router.get("/contacts", async (req, res) => {
  const db = getDB();
  const contacts = await db.all("SELECT * FROM contacts ORDER BY name ASC");
  res.json(contacts);
});

router.post("/contacts", async (req, res) => {
  const db = getDB();
  const { name, sector, email } = req.body;
  const result = await db.run(
    "INSERT INTO contacts (name, sector, email) VALUES (?, ?, ?)",
    [name, sector, email]
  );
  res.json({ id: result.lastID });
});

router.delete("/contacts/:id", async (req, res) => {
  const db = getDB();
  await db.run("DELETE FROM contacts WHERE id=?", [req.params.id]);
  res.json({ success: true });
});

// Campaigns
router.get("/campaigns", async (req, res) => {
  const db = getDB();
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();
  const campaign = await db.get("SELECT * FROM campaigns WHERE month=? AND year=?", [month, year]);
  res.json(campaign || null);
});

router.post("/campaigns", async (req, res) => {
  const db = getDB();
  const { month, year, title, description, image_url, target_sector } = req.body;
  await db.run(
    `INSERT INTO campaigns (month, year, title, description, image_url, target_sector) 
     VALUES (?, ?, ?, ?, ?, ?) 
     ON CONFLICT(month, year) 
     DO UPDATE SET title=excluded.title, description=excluded.description, image_url=excluded.image_url, target_sector=excluded.target_sector`,
    [month, year, title, description, image_url, target_sector || 'Todos']
  );
  res.json({ success: true });
});

// Settings
router.get("/settings", async (req, res) => {
  const db = getDB();
  const settings = await db.all("SELECT * FROM settings");
  const parsed = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  res.json(parsed);
});

router.post("/settings", async (req, res) => {
  const db = getDB();
  for (const [key, value] of Object.entries(req.body)) {
    await db.run(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      [key, typeof value === 'string' ? value : JSON.stringify(value)]
    );
  }
  res.json({ success: true });
});

// Logs
router.get("/logs", async (req, res) => {
  const db = getDB();
  const logs = await db.all("SELECT * FROM email_logs ORDER BY id DESC LIMIT 100");
  res.json(logs);
});

// Motor de Envios
router.get("/queue", async (req, res) => {
  const db = getDB();
  const events = await db.all("SELECT * FROM events");
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const queue: any[] = [];
  
  events.forEach(ev => {
    const evDate = parseISO(ev.event_date);
    evDate.setHours(0,0,0,0);
    const diff = differenceInDays(evDate, today);
    
    if (diff >= 0 && diff <= 9) {
      if (diff >= 2 && diff <= 9) {
         let sendDate = new Date(evDate);
         sendDate.setDate(sendDate.getDate() - 2);
         if (differenceInDays(sendDate, today) <= 7 && differenceInDays(sendDate, today) >= 0) {
            queue.push({ id: ev.id, type: 'T-2', related_event: ev.title, send_date: sendDate, sector: ev.send_type, status: ev.status === 'published' && !ev.is_paused ? 'Scheduled' : 'Paused', event: ev });
         }
      }
      if (diff >= 1 && diff <= 8) {
         let sendDate = new Date(evDate);
         sendDate.setDate(sendDate.getDate() - 1);
         if (differenceInDays(sendDate, today) <= 7 && differenceInDays(sendDate, today) >= 0) {
            queue.push({ id: ev.id, type: 'T-1', related_event: ev.title, send_date: sendDate, sector: ev.send_type, status: ev.status === 'published' && !ev.is_paused ? 'Scheduled' : 'Paused', event: ev });
         }
      }
      if (diff >= 0 && diff <= 7) {
         let sendDate = new Date(evDate);
         if (differenceInDays(sendDate, today) <= 7 && differenceInDays(sendDate, today) >= 0) {
            queue.push({ id: ev.id, type: 'D-0', related_event: ev.title, send_date: sendDate, sector: ev.send_type, status: ev.status === 'published' && !ev.is_paused ? 'Scheduled' : 'Paused', event: ev });
         }
      }
    }
  });
  
  const nDate = new Date(today);
  for (let i = 0; i <= 7; i++) {
     if (nDate.getDate() === 1) {
        queue.push({ id: 'digest-'+nDate.getMonth(), type: 'Digest Mensal', related_event: 'Todos os Eventos do Mês', send_date: new Date(nDate), sector: 'Todos', status: 'Scheduled', event: null });
     }
     nDate.setDate(nDate.getDate() + 1);
  }

  queue.sort((a,b) => a.send_date.getTime() - b.send_date.getTime());
  
  const logs = await db.all("SELECT status FROM email_logs");
  const successCount = logs.filter(l => l.status === 'SUCCESS').length;
  const successRate = logs.length > 0 ? ((successCount / logs.length) * 100).toFixed(1) : "100.0";
  
  const settingsRows = await db.all("SELECT key, value FROM settings");
  const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);
  const isOnline = !!(s.resend_api_key || process.env.RESEND_API_KEY);

  res.json({ queue, metrics: { online: isOnline, queueCount: queue.length, successRate } });
});

router.get("/preview/:eventId/:type", async (req, res) => {
   const db = getDB();
   const settingsRows = await db.all(`SELECT * FROM settings`);
   const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);

   if (req.params.type === 'Digest Mensal' || req.params.eventId.startsWith('digest')) {
      const monthHtml = buildEventEmailHtml({ 
        title: 'Eventos do Mês (Preview)', 
        event_date: new Date().toISOString(), 
        description: `Preview do envio mensal.` 
      }, new Date().getMonth() + 1, true, "", s);
      res.send(monthHtml);
      return;
   }
   const ev = await db.get("SELECT * FROM events WHERE id=?", [req.params.eventId]);
   let msg = "";
   if (req.params.type === 'T-2') msg = "Hora de finalizar a arte para o evento!";
   if (req.params.type === 'T-1') msg = "Amanhã é o evento. Tudo pronto?";
   if (req.params.type === 'D-0') msg = "Hoje celebramos o evento. Compartilhe nos grupos!";
   
   const html = buildEventEmailHtml(ev, new Date(ev.event_date).getMonth()+1, false, msg, s);
   res.send(html);
});

router.get("/queue/:eventId/recipients", async (req, res) => {
  const db = getDB();
  let sector = "Todos";
  if (!req.params.eventId.startsWith('digest')) {
     const ev = await db.get("SELECT * FROM events WHERE id=?", [req.params.eventId]);
     if (ev) sector = ev.send_type;
  }
  
  // Custom fetch to get names + emails Instead of just emails
  let contacts = [];
  if (!sector || sector === 'Todos' || sector === 'amplo') {
    contacts = await db.all("SELECT name, email FROM contacts");
  } else {
    contacts = await db.all("SELECT name, email FROM contacts WHERE sector = ?", [sector]);
  }
  
  res.json({ recipients: contacts || [] });
});

router.post("/events/:id/pause", async (req, res) => {
  const db = getDB();
  const { is_paused } = req.body;
  await db.run("UPDATE events SET is_paused = ? WHERE id = ?", [is_paused ? 1 : 0, req.params.id]);
  res.json({success:true});
});

router.post("/force_send/:eventId/:type", async (req, res) => {
  const db = getDB();
  const type = req.params.type;
  const eventId = req.params.eventId;
  
  if (type === 'Digest Mensal' || eventId.startsWith('digest')) {
      // Simplification: we don't recalculate events here for preview digest force
      res.json({ success: true, note: 'Digest force disabled for safety in UI demo' });
      return;
  }

  const ev = await db.get("SELECT * FROM events WHERE id=?", [eventId]);
  if (!ev) return res.status(404).json({ error: "Not found" });

  const settingsRows = await db.all("SELECT key, value FROM settings");
  const s = settingsRows.reduce((a, c) => ({ ...a, [c.key]: c.value }), {} as any);

  let msg = "";
  if (type === 'T-2') msg = "Hora de finalizar a arte para o evento!";
  else if (type === 'T-1') msg = "Amanhã é o evento. Tudo pronto?";
  else if (type === 'D-0') msg = "Hoje celebramos o evento. Compartilhe nos grupos!";

  const html = buildEventEmailHtml(ev, new Date(ev.event_date).getMonth()+1, false, msg, s);
  let emails = await getTargetEmails(db, ev.send_type);
  
  if (!emails || emails.length === 0) {
    if (s.sender_email) {
      emails = [s.sender_email]; // Fallback to sender email for testing
    } else {
      return res.status(400).json({ error: "Nenhum contato encontrado para o setor: " + ev.send_type + " e nenhum email padrão configurado." });
    }
  }

  for (const email of emails) {
    await sendEmail({ to: email, subject: `[Forçado ${type}] ${ev.title}`, html, type: type, eventId: ev.id });
  }

  res.json({ success: true });
});

export default router;

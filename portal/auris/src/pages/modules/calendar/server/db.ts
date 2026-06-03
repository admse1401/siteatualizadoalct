import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database;

export async function initDB() {
  db = await open({
    filename: path.join(process.cwd(), 'alianca_tur.sqlite'),
    driver: sqlite3.Database
  });

  console.log("Initializing SQLite database...");

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      category TEXT,
      color_tag TEXT,
      send_type TEXT,
      is_recurrent INTEGER DEFAULT 0,
      recipients TEXT,
      attachment_url TEXT,
      status TEXT DEFAULT 'published'
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sector TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      image_url TEXT,
      target_sector TEXT DEFAULT 'Todos',
      UNIQUE(month, year)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS email_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      send_date TEXT,
      trigger_type TEXT,
      status TEXT,
      recipient TEXT,
      error_message TEXT,
      event_id INTEGER,
      opened INTEGER DEFAULT 0,
      clicked INTEGER DEFAULT 0
    );
  `);

  // Clean old SMTP settings if they exist to prevent UI confusion
  await db.exec(`DELETE FROM settings WHERE key LIKE 'smtp_%' OR key = 'default_lists'`);

  // Migrate tables if needed
  try { await db.exec(`ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'published'`); } catch (e) {}
  try { await db.exec(`ALTER TABLE events ADD COLUMN is_paused INTEGER DEFAULT 0`); } catch (e) {}
  try { await db.exec(`ALTER TABLE campaigns ADD COLUMN target_sector TEXT DEFAULT 'Todos'`); } catch (e) {}
  try { await db.exec(`ALTER TABLE email_logs ADD COLUMN opened INTEGER DEFAULT 0`); } catch (e) {}
  try { await db.exec(`ALTER TABLE email_logs ADD COLUMN clicked INTEGER DEFAULT 0`); } catch (e) {}

  // Seed events if empty
  const count = await db.get(`SELECT COUNT(*) as count FROM events`);
  if (count.count === 0) {
    console.log("Seeding initial events...");
    const currentYear = new Date().getFullYear();
    const seedEvents = [
      { t: 'Dia do Caminhoneiro', d: '25/07', desc: 'Homenagem aos motoristas.', c: 'Transporte', tag: 'blue' },
      { t: 'Semana da Logística', d: '06/06', desc: 'Semana da Logística', c: 'Transporte', tag: 'teal' },
      { t: 'Dia Mundial do Turismo', d: '27/09', desc: 'Dia Mundial do Turismo', c: 'Transporte', tag: 'amber' },
      { t: 'Dia do Trabalhador', d: '01/05', desc: 'Feriado Nacional', c: 'Regional', tag: 'red' },
      { t: 'Dia da Enfermagem', d: '12/05', desc: 'Homenagem à Saúde', c: 'Saúde', tag: 'purple' },
      { t: 'Combate ao Abuso e Exploração Sexual Infantil', d: '18/05', desc: 'Conscientização', c: 'Interno', tag: 'amber' },
      { t: 'Dia da Indústria', d: '25/05', desc: 'Celebração Setor Industrial', c: 'Transporte', tag: 'gray' },
      { t: 'Eleições Nacionais 1º Turno (2026)', d: '04/10/2026', desc: 'Preparação Escala Eleições', c: 'Regional', tag: 'red' },
      { t: 'Eleições Nacionais 2º Turno (2026)', d: '25/10/2026', desc: 'Preparação Escala Eleições', c: 'Regional', tag: 'red' },
    ];

    const stmt = await db.prepare(`
      INSERT INTO events (title, description, event_date, category, color_tag, send_type, is_recurrent, recipients, attachment_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const ev of seedEvents) {
      let fullDate = ev.d.length === 5 ? `${currentYear}-${ev.d.split('/')[1]}-${ev.d.split('/')[0]}` : `${ev.d.split('/')[2]}-${ev.d.split('/')[1]}-${ev.d.split('/')[0]}`;
      await stmt.run(ev.t, ev.desc, fullDate, ev.c, ev.tag, 'amplo', 1, '[]', '', 'published');
    }
    await stmt.finalize();
  }

  // Seed default settings
  const settingsCount = await db.get(`SELECT COUNT(*) as count FROM settings`);
  if (settingsCount.count === 0) {
    const defaultSettings = [
      ['resend_api_key', process.env.RESEND_API_KEY || ''],
      ['sender_email', process.env.SENDER_EMAIL || 'adm.se@aliancatur.com'],
      ['global_send_time', '07:00'],
      ['company_logo', ''],
      ['email_signature', 'Auris Calendário Corporativo é uma ferramenta da Auris Toolbox'],
    ];
    const stmt = await db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of defaultSettings) {
      await stmt.run(k, String(v));
    }
    await stmt.finalize();
  }
}

export function getDB() {
  if (!db) throw new Error("Database not initialized yet.");
  return db;
}

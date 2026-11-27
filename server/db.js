import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'wedding.db');
const db = new DatabaseSync(DB_PATH);

// Setup SQLite settings
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    max_guests INTEGER NOT NULL DEFAULT 1,
    rsvp_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'attending' | 'declined'
    confirmed_count INTEGER NOT NULL DEFAULT 0,
    dietary_requirements TEXT DEFAULT '',
    confirmed_name TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    responded_at TEXT DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_groups_token ON groups(token);

  CREATE TABLE IF NOT EXISTS song_suggestions (
    id TEXT PRIMARY KEY,
    token TEXT DEFAULT '',
    name TEXT DEFAULT '',
    song TEXT NOT NULL,
    artist TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );
`);

// Safe migrations for existing databases
try {
  db.exec("ALTER TABLE groups ADD COLUMN rsvp_status TEXT NOT NULL DEFAULT 'pending';");
} catch (_) {}
try {
  db.exec("ALTER TABLE groups ADD COLUMN confirmed_count INTEGER NOT NULL DEFAULT 0;");
} catch (_) {}
try {
  db.exec("ALTER TABLE groups ADD COLUMN dietary_requirements TEXT DEFAULT '';");
} catch (_) {}
try {
  db.exec("ALTER TABLE groups ADD COLUMN confirmed_name TEXT DEFAULT '';");
} catch (_) {}
try {
  db.exec("ALTER TABLE groups ADD COLUMN responded_at TEXT DEFAULT '';");
} catch (_) {}
try {
  db.exec("ALTER TABLE groups ADD COLUMN guest_names TEXT DEFAULT '[]';");
} catch (_) {}

/**
 * Generate a clean URL-friendly token based on group name
 */
export function generateToken(name) {
  const cleanName = (name || 'invitacion')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
  const randomSuffix = crypto.randomBytes(3).toString('hex');
  return `${cleanName}-${randomSuffix}`;
}

function formatGroup(g) {
  if (!g) return null;
  let guest_names = [];
  try {
    guest_names = JSON.parse(g.guest_names || '[]');
  } catch (_) {
    guest_names = [];
  }
  return {
    ...g,
    guest_names,
    confirmed_count: Number(g.confirmed_count) || 0,
    max_guests: Number(g.max_guests) || 1,
  };
}

export function getAllGroups() {
  const groups = db.prepare('SELECT * FROM groups ORDER BY created_at DESC').all();
  return groups.map(formatGroup);
}

export function getGroupById(id) {
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
  return formatGroup(group);
}

export function getGroupByToken(token) {
  if (!token) return null;
  const group = db.prepare('SELECT * FROM groups WHERE LOWER(token) = LOWER(?)').get(token.trim());
  return formatGroup(group);
}

export function createGroup({ name, max_guests = 1, notes = '', custom_token = '', guest_names = [] }) {
  const id = crypto.randomUUID();
  const token = custom_token && custom_token.trim()
    ? custom_token.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
    : generateToken(name);
  const now = new Date().toISOString();
  const max = Math.max(1, Number(max_guests) || 1);
  const guestNamesJson = JSON.stringify(
    Array.isArray(guest_names) ? guest_names.map((n) => String(n).trim()).filter(Boolean) : []
  );

  db.prepare(`
    INSERT INTO groups (id, name, token, max_guests, guest_names, rsvp_status, confirmed_count, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)
  `).run(id, name.trim(), token, max, guestNamesJson, notes.trim(), now, now);

  return getGroupById(id);
}

export function updateGroup(
  id,
  { name, max_guests, notes, custom_token, guest_names, rsvp_status, confirmed_count, dietary_requirements }
) {
  const existing = getGroupById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updatedName = name !== undefined ? name.trim() : existing.name;
  const updatedMaxGuests = max_guests !== undefined ? Math.max(1, Number(max_guests)) : existing.max_guests;
  const updatedNotes = notes !== undefined ? notes.trim() : existing.notes;
  const updatedToken = custom_token !== undefined && custom_token.trim() 
    ? custom_token.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
    : existing.token;
  const updatedGuestNamesJson = guest_names !== undefined
    ? JSON.stringify(Array.isArray(guest_names) ? guest_names.map((n) => String(n).trim()).filter(Boolean) : [])
    : JSON.stringify(existing.guest_names || []);

  const validStatuses = ['pending', 'attending', 'declined'];
  const updatedStatus =
    rsvp_status !== undefined && validStatuses.includes(rsvp_status)
      ? rsvp_status
      : existing.rsvp_status;

  let updatedConfirmedCount = existing.confirmed_count;
  let updatedRespondedAt = existing.responded_at;

  if (updatedStatus === 'pending') {
    updatedConfirmedCount = 0;
    updatedRespondedAt = null;
  } else if (updatedStatus === 'declined') {
    updatedConfirmedCount = 0;
    updatedRespondedAt = existing.responded_at || now;
  } else if (updatedStatus === 'attending') {
    const rawCount = confirmed_count !== undefined ? Number(confirmed_count) : existing.confirmed_count || updatedMaxGuests;
    updatedConfirmedCount = Math.min(updatedMaxGuests, Math.max(1, rawCount || 1));
    updatedRespondedAt = existing.responded_at || now;
  }

  const updatedDietary =
    dietary_requirements !== undefined ? String(dietary_requirements).trim() : existing.dietary_requirements || '';

  db.prepare(`
    UPDATE groups
    SET name = ?,
        confirmed_name = ?,
        token = ?,
        max_guests = ?,
        guest_names = ?,
        notes = ?,
        rsvp_status = ?,
        confirmed_count = ?,
        dietary_requirements = ?,
        responded_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    updatedName,
    updatedName,
    updatedToken,
    updatedMaxGuests,
    updatedGuestNamesJson,
    updatedNotes,
    updatedStatus,
    updatedConfirmedCount,
    updatedDietary,
    updatedRespondedAt,
    now,
    id
  );

  return getGroupById(id);
}

export function deleteGroup(id) {
  const res = db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  return res.changes > 0;
}

/**
 * Submit RSVP for a group
 * payload: {
 *   token: string,
 *   name?: string,
 *   rsvp_status: 'attending' | 'declined',
 *   confirmed_count?: number,
 *   dietary_requirements?: string
 * }
 */
export function submitRsvp({ token, name, rsvp_status, confirmed_count = 1, dietary_requirements = '' }) {
  const group = getGroupByToken(token);
  if (!group) {
    throw new Error('Invitación no encontrada para el token proporcionado');
  }

  if (group.rsvp_status === 'attending' || group.rsvp_status === 'declined') {
    throw new Error('Tu respuesta ya fue registrada. Si necesitás hacer algún cambio, escribinos directamente.');
  }

  const now = new Date().toISOString();
  const status = rsvp_status === 'attending' ? 'attending' : 'declined';
  const count = status === 'attending' ? Math.min(group.max_guests, Math.max(1, Number(confirmed_count) || 1)) : 0;
  const dietary = (dietary_requirements || '').trim();
  const confirmedName = name && name.trim() ? name.trim() : group.name;

  db.prepare(`
    UPDATE groups
    SET rsvp_status = ?,
        confirmed_count = ?,
        dietary_requirements = ?,
        confirmed_name = ?,
        responded_at = ?,
        updated_at = ?
    WHERE id = ?
  `).run(status, count, dietary, group.name, now, now, group.id);

  return getGroupByToken(token);
}

export function getSummaryMetrics() {
  const allGroups = getAllGroups();
  let totalAllowed = 0;
  let attendingCount = 0;
  let declinedCount = 0;
  let pendingCount = 0;
  let pendingPasses = 0;

  const dietaryList = [];

  for (const group of allGroups) {
    totalAllowed += group.max_guests;
    if (group.rsvp_status === 'attending') {
      attendingCount += group.confirmed_count;
      if (group.dietary_requirements && group.dietary_requirements.trim()) {
        dietaryList.push({
          family: group.confirmed_name || group.name,
          diet: group.dietary_requirements.trim(),
        });
      }
    } else if (group.rsvp_status === 'declined') {
      declinedCount += 1;
    } else {
      pendingCount += 1;
      pendingPasses += group.max_guests;
    }
  }

  return {
    total_groups: allGroups.length,
    total_allowed_passes: totalAllowed,
    attending_count: attendingCount,
    declined_count: declinedCount,
    pending_count: pendingCount,
    pending_passes: pendingPasses,
    dietary_list: dietaryList,
  };
}

/**
 * Add a song suggestion from a guest
 */
export function addSongSuggestion({ token = '', name = '', song = '', artist = '' }) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO song_suggestions (id, token, name, song, artist, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, token, name, song.trim(), artist.trim(), now);
  return { id, token, name, song: song.trim(), artist: artist.trim(), created_at: now };
}

/**
 * Get all song suggestions (for admin)
 */
export function getSongSuggestions() {
  const stmt = db.prepare('SELECT * FROM song_suggestions ORDER BY created_at DESC');
  return stmt.all();
}

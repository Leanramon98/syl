import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import {
  getAllGroups,
  getGroupById,
  getGroupByToken,
  createGroup,
  updateGroup,
  deleteGroup,
  submitRsvp,
  getSummaryMetrics,
} from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '141014syl').trim().toLowerCase();
const ADMIN_AUTH_TOKEN = 'syl_admin_authenticated_session';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin Authentication Middleware
function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token === ADMIN_AUTH_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: 'No autorizado. Se requiere acceso de administrador.' });
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ error: 'Contraseña requerida' });
  }

  if (password.trim().toLowerCase() === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      token: ADMIN_AUTH_TOKEN,
      message: 'Bienvenido al panel de administración',
    });
  }

  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

// Admin: Get all groups
app.get('/api/admin/groups', requireAdmin, (req, res) => {
  try {
    const groups = getAllGroups();
    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ error: 'Error al obtener los grupos' });
  }
});

// Admin: Get summary metrics
app.get('/api/admin/summary', requireAdmin, (req, res) => {
  try {
    const summary = getSummaryMetrics();
    res.json(summary);
  } catch (err) {
    console.error('Error fetching summary:', err);
    res.status(500).json({ error: 'Error al calcular las métricas' });
  }
});

// Admin: Create group
app.post('/api/admin/groups', requireAdmin, (req, res) => {
  try {
    const { name, max_guests, notes, custom_token, guest_names } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre de la familia o grupo es obligatorio' });
    }

    const group = createGroup({
      name,
      max_guests: max_guests ? Number(max_guests) : 1,
      notes,
      custom_token,
      guest_names,
    });

    res.status(201).json(group);
  } catch (err) {
    console.error('Error creating group:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El enlace o token personalizado ya está en uso. Elegí otro.' });
    }
    res.status(500).json({ error: 'Error al crear el grupo' });
  }
});

// Admin: Update group
app.put('/api/admin/groups/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, max_guests, notes, custom_token, guest_names } = req.body;
    const updated = updateGroup(id, { name, max_guests, notes, custom_token, guest_names });

    if (!updated) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating group:', err);
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'El enlace o token personalizado ya está en uso' });
    }
    res.status(500).json({ error: 'Error al actualizar el grupo' });
  }
});

// Admin: Delete group
app.delete('/api/admin/groups/:id', requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteGroup(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }
    res.json({ success: true, message: 'Grupo eliminado correctamente' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ error: 'Error al eliminar el grupo' });
  }
});

// Public: Resolve group by token
app.get('/api/rsvp/:token', (req, res) => {
  try {
    const { token } = req.params;
    const group = getGroupByToken(token);

    if (!group) {
      return res.status(404).json({ error: 'Invitación no encontrada con este enlace' });
    }

    res.json({
      group: {
        id: group.id,
        name: group.name,
        token: group.token,
        max_guests: group.max_guests,
        guest_names: group.guest_names || [],
        rsvp_status: group.rsvp_status,
        confirmed_count: group.confirmed_count,
        dietary_requirements: group.dietary_requirements,
        confirmed_name: group.confirmed_name,
        notes: group.notes,
      },
    });
  } catch (err) {
    console.error('Error resolving token:', err);
    res.status(500).json({ error: 'Error al verificar la invitación' });
  }
});

// Public: Submit RSVP
app.post('/api/rsvp/submit', (req, res) => {
  try {
    const { token, name, rsvp_status, confirmed_count, dietary_requirements } = req.body;
    if (!token || !rsvp_status) {
      return res.status(400).json({ error: 'Datos incompletos para confirmar la asistencia' });
    }

    const updatedGroup = submitRsvp({
      token,
      name,
      rsvp_status,
      confirmed_count,
      dietary_requirements,
    });

    res.json({
      success: true,
      message: '¡Confirmación registrada con éxito! Muchas gracias.',
      group: updatedGroup,
    });
  } catch (err) {
    console.error('Error submitting RSVP:', err);
    res.status(500).json({ error: err.message || 'Error al procesar la confirmación' });
  }
});

// Serve static frontend in production
const DIST_PATH = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    // Avoid capturing API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint no encontrado' });
    }
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sol & Lea Wedding API Server running on port ${PORT}`);
});

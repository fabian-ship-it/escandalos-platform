import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authMiddleware, adminOnly } from '../auth';

const router = Router();

// Public: list all people
router.get('/', (_req: Request, res: Response) => {
  const people = db.prepare('SELECT * FROM people ORDER BY name ASC').all();
  res.json(people);
});

// Public: get person with scandals and evidence
router.get('/:id', (req: Request, res: Response) => {
  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  if (!person) {
    res.status(404).json({ error: 'Persona no encontrada' });
    return;
  }

  const scandals = db.prepare(`
    SELECT s.*, sp.relationship
    FROM scandals s
    JOIN scandal_people sp ON sp.scandal_id = s.id
    WHERE sp.person_id = ? AND s.status = 'active'
  `).all(req.params.id);

  const evidence = db.prepare(`
    SELECT * FROM evidence WHERE person_id = ? AND status = 'approved' ORDER BY created_at DESC
  `).all(req.params.id);

  res.json({ ...person as object, scandals, evidence });
});

// Admin: create person
router.post('/', authMiddleware, adminOnly, (req: Request, res: Response) => {
  const { name, role_title, description } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Nombre de la persona requerido' });
    return;
  }

  const id = uuidv4();
  db.prepare('INSERT INTO people (id, name, role_title, description) VALUES (?, ?, ?, ?)').run(
    id, name, role_title || '', description || ''
  );

  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(id);
  res.status(201).json(person);
});

// Admin: update person
router.put('/:id', authMiddleware, adminOnly, (req: Request, res: Response) => {
  const { name, role_title, description } = req.body;
  db.prepare('UPDATE people SET name = COALESCE(?, name), role_title = COALESCE(?, role_title), description = COALESCE(?, description) WHERE id = ?').run(
    name, role_title, description, req.params.id
  );
  const person = db.prepare('SELECT * FROM people WHERE id = ?').get(req.params.id);
  res.json(person);
});

// Admin: link person to scandal
router.post('/:personId/scandals/:scandalId', authMiddleware, adminOnly, (req: Request, res: Response) => {
  const { relationship } = req.body;
  const id = uuidv4();
  try {
    db.prepare('INSERT INTO scandal_people (id, scandal_id, person_id, relationship) VALUES (?, ?, ?, ?)').run(
      id, req.params.scandalId, req.params.personId, relationship || ''
    );
    res.status(201).json({ id, scandal_id: req.params.scandalId, person_id: req.params.personId, relationship });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE')) {
      res.status(409).json({ error: 'Esta persona ya está vinculada a este escándalo' });
    } else {
      throw err;
    }
  }
});

// Admin: remove person from scandal
router.delete('/:personId/scandals/:scandalId', authMiddleware, adminOnly, (_req: Request, res: Response) => {
  db.prepare('DELETE FROM scandal_people WHERE scandal_id = ? AND person_id = ?').run(
    _req.params.scandalId, _req.params.personId
  );
  res.json({ success: true });
});

export default router;

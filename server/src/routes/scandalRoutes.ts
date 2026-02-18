import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { authMiddleware, adminOnly } from '../auth';

const router = Router();

// Public: list all scandals
router.get('/', (_req: Request, res: Response) => {
  const scandals = db.prepare('SELECT * FROM scandals WHERE status = ? ORDER BY created_at DESC').all('active');
  res.json(scandals);
});

// Public: get scandal with people and evidence
router.get('/:id', (req: Request, res: Response) => {
  const scandal = db.prepare('SELECT * FROM scandals WHERE id = ?').get(req.params.id);
  if (!scandal) {
    res.status(404).json({ error: 'Escándalo no encontrado' });
    return;
  }

  const people = db.prepare(`
    SELECT p.*, sp.relationship, sp.id as link_id
    FROM people p
    JOIN scandal_people sp ON sp.person_id = p.id
    WHERE sp.scandal_id = ?
  `).all(req.params.id);

  const evidence = db.prepare(`
    SELECT * FROM evidence WHERE scandal_id = ? AND status = 'approved' ORDER BY created_at DESC
  `).all(req.params.id);

  res.json({ ...scandal as object, people, evidence });
});

// Public: get full board data for a scandal (nodes + edges)
router.get('/:id/board', (req: Request, res: Response) => {
  const scandal = db.prepare('SELECT * FROM scandals WHERE id = ?').get(req.params.id) as any;
  if (!scandal) {
    res.status(404).json({ error: 'Escándalo no encontrado' });
    return;
  }

  const people = db.prepare(`
    SELECT p.*, sp.relationship, sp.id as link_id
    FROM people p
    JOIN scandal_people sp ON sp.person_id = p.id
    WHERE sp.scandal_id = ?
  `).all(req.params.id) as any[];

  const evidence = db.prepare(`
    SELECT * FROM evidence WHERE scandal_id = ? AND status = 'approved' ORDER BY created_at DESC
  `).all(req.params.id) as any[];

  // Build nodes
  const nodes: any[] = [];
  const edges: any[] = [];

  // Scandal node at center
  nodes.push({
    id: `scandal-${scandal.id}`,
    type: 'scandalNode',
    position: { x: 400, y: 50 },
    data: { ...scandal, nodeType: 'scandal' },
  });

  // People nodes in a circle around scandal
  const peopleCount = people.length;
  people.forEach((person, i) => {
    const angle = (2 * Math.PI * i) / Math.max(peopleCount, 1) - Math.PI / 2;
    const radius = 300;
    nodes.push({
      id: `person-${person.id}`,
      type: 'personNode',
      position: {
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      },
      data: { ...person, nodeType: 'person' },
    });

    edges.push({
      id: `edge-scandal-person-${person.link_id}`,
      source: `scandal-${scandal.id}`,
      target: `person-${person.id}`,
      label: person.relationship || '',
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#e94560', strokeWidth: 2 },
    });
  });

  // Evidence nodes linked to people or scandal
  evidence.forEach((ev, i) => {
    const parentId = ev.person_id ? `person-${ev.person_id}` : `scandal-${scandal.id}`;
    const parentNode = nodes.find((n) => n.id === parentId);
    const offsetAngle = (Math.PI / 4) * (i % 8);
    const offsetRadius = 150;

    nodes.push({
      id: `evidence-${ev.id}`,
      type: 'evidenceNode',
      position: {
        x: (parentNode?.position.x || 400) + offsetRadius * Math.cos(offsetAngle),
        y: (parentNode?.position.y || 300) + offsetRadius * Math.sin(offsetAngle) + 100,
      },
      data: { ...ev, nodeType: 'evidence' },
    });

    edges.push({
      id: `edge-evidence-${ev.id}`,
      source: parentId,
      target: `evidence-${ev.id}`,
      type: 'smoothstep',
      style: { stroke: '#f5a623', strokeWidth: 1.5 },
    });
  });

  res.json({ nodes, edges, scandal });
});

// Admin: create scandal
router.post('/', authMiddleware, adminOnly, (req: Request, res: Response) => {
  const { name, description, color } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Nombre del escándalo requerido' });
    return;
  }

  const id = uuidv4();
  db.prepare('INSERT INTO scandals (id, name, description, color) VALUES (?, ?, ?, ?)').run(
    id,
    name,
    description || '',
    color || '#DC2626'
  );

  const scandal = db.prepare('SELECT * FROM scandals WHERE id = ?').get(id);
  res.status(201).json(scandal);
});

// Admin: update scandal
router.put('/:id', authMiddleware, adminOnly, (req: Request, res: Response) => {
  const { name, description, color, status } = req.body;
  db.prepare('UPDATE scandals SET name = COALESCE(?, name), description = COALESCE(?, description), color = COALESCE(?, color), status = COALESCE(?, status) WHERE id = ?').run(
    name, description, color, status, req.params.id
  );
  const scandal = db.prepare('SELECT * FROM scandals WHERE id = ?').get(req.params.id);
  res.json(scandal);
});

export default router;

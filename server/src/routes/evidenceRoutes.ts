import { Router, Request, Response } from 'express';
import db from '../database';
import { authMiddleware, adminOnly } from '../auth';

const router = Router();

// Public: get evidence for a scandal
router.get('/scandal/:scandalId', (req: Request, res: Response) => {
  const evidence = db.prepare(`
    SELECT e.*, p.name as person_name
    FROM evidence e
    LEFT JOIN people p ON p.id = e.person_id
    WHERE e.scandal_id = ? AND e.status = 'approved'
    ORDER BY e.created_at DESC
  `).all(req.params.scandalId);
  res.json(evidence);
});

// Admin: delete evidence
router.delete('/:id', authMiddleware, adminOnly, (req: Request, res: Response) => {
  db.prepare('DELETE FROM evidence WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;

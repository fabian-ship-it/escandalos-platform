import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../database';
import { authMiddleware } from '../auth';

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'video/mp4', 'video/quicktime',
      'audio/mpeg', 'audio/wav',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
    }
  },
});

const router = Router();

// PUBLIC: submit anonymous tip (no auth required)
router.post('/', upload.array('files', 10), (req: Request, res: Response) => {
  const { scandal_id, person_id, person_name_suggestion, description } = req.body;

  if (!scandal_id || !description) {
    res.status(400).json({ error: 'Se requiere escándalo y descripción' });
    return;
  }

  // Verify scandal exists
  const scandal = db.prepare('SELECT id FROM scandals WHERE id = ?').get(scandal_id);
  if (!scandal) {
    res.status(404).json({ error: 'Escándalo no encontrado' });
    return;
  }

  const tipId = uuidv4();
  db.prepare(`
    INSERT INTO tips (id, scandal_id, person_id, person_name_suggestion, description)
    VALUES (?, ?, ?, ?, ?)
  `).run(tipId, scandal_id, person_id || null, person_name_suggestion || null, description);

  // Save uploaded files
  const files = (req.files as Express.Multer.File[]) || [];
  const insertFile = db.prepare(
    'INSERT INTO tip_files (id, tip_id, original_name, stored_name, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const file of files) {
    insertFile.run(uuidv4(), tipId, file.originalname, file.filename, file.mimetype, file.size);
  }

  res.status(201).json({
    id: tipId,
    message: 'Pista enviada exitosamente. Será revisada por un verificador.',
    files_count: files.length,
  });
});

// ADMIN: list all tips (with filters)
router.get('/', authMiddleware, (req: Request, res: Response) => {
  const status = req.query.status as string || 'pending';
  const scandalId = req.query.scandal_id as string;

  let query = 'SELECT t.*, s.name as scandal_name FROM tips t JOIN scandals s ON s.id = t.scandal_id';
  const params: any[] = [];

  if (status !== 'all') {
    query += ' WHERE t.status = ?';
    params.push(status);
  }

  if (scandalId) {
    query += params.length ? ' AND' : ' WHERE';
    query += ' t.scandal_id = ?';
    params.push(scandalId);
  }

  query += ' ORDER BY t.submitted_at DESC';

  const tips = db.prepare(query).all(...params);
  res.json(tips);
});

// ADMIN: get tip detail with files
router.get('/:id', authMiddleware, (req: Request, res: Response) => {
  const tip = db.prepare(`
    SELECT t.*, s.name as scandal_name
    FROM tips t JOIN scandals s ON s.id = t.scandal_id
    WHERE t.id = ?
  `).get(req.params.id) as any;

  if (!tip) {
    res.status(404).json({ error: 'Pista no encontrada' });
    return;
  }

  const files = db.prepare('SELECT * FROM tip_files WHERE tip_id = ?').all(req.params.id);
  res.json({ ...tip, files });
});

// ADMIN: approve tip (creates evidence entries)
router.post('/:id/approve', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const tip = db.prepare('SELECT * FROM tips WHERE id = ?').get(req.params.id) as any;

  if (!tip) {
    res.status(404).json({ error: 'Pista no encontrada' });
    return;
  }

  if (tip.status !== 'pending') {
    res.status(400).json({ error: 'Esta pista ya fue revisada' });
    return;
  }

  const { review_note, person_id, create_person, person_name, person_role } = req.body;

  // Optionally create a new person
  let linkedPersonId = person_id || tip.person_id;
  if (create_person && person_name) {
    const newPersonId = uuidv4();
    db.prepare('INSERT INTO people (id, name, role_title) VALUES (?, ?, ?)').run(
      newPersonId, person_name, person_role || ''
    );
    // Link to scandal
    db.prepare('INSERT INTO scandal_people (id, scandal_id, person_id, relationship) VALUES (?, ?, ?, ?)').run(
      uuidv4(), tip.scandal_id, newPersonId, ''
    );
    linkedPersonId = newPersonId;
  }

  // Update tip status
  db.prepare(`
    UPDATE tips SET status = 'approved', reviewer_id = ?, review_note = ?, reviewed_at = datetime('now'), person_id = COALESCE(?, person_id)
    WHERE id = ?
  `).run(user.userId, review_note || '', linkedPersonId, tip.id);

  // Create evidence from the tip
  const evidenceId = uuidv4();
  db.prepare(`
    INSERT INTO evidence (id, scandal_id, person_id, tip_id, title, description, evidence_type)
    VALUES (?, ?, ?, ?, ?, ?, 'testimony')
  `).run(evidenceId, tip.scandal_id, linkedPersonId, tip.id, `Pista anónima`, tip.description);

  // Create evidence entries for each file
  const files = db.prepare('SELECT * FROM tip_files WHERE tip_id = ?').all(tip.id) as any[];
  for (const file of files) {
    const fileEvidenceId = uuidv4();
    const isImage = file.mime_type.startsWith('image/');
    db.prepare(`
      INSERT INTO evidence (id, scandal_id, person_id, tip_id, title, description, evidence_type, file_path, original_file_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      fileEvidenceId,
      tip.scandal_id,
      linkedPersonId,
      tip.id,
      file.original_name,
      '',
      isImage ? 'image' : 'document',
      `/uploads/${file.stored_name}`,
      file.original_name
    );
  }

  res.json({ success: true, message: 'Pista aprobada y evidencia creada' });
});

// ADMIN: reject tip
router.post('/:id/reject', authMiddleware, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { review_note } = req.body;

  db.prepare(`
    UPDATE tips SET status = 'rejected', reviewer_id = ?, review_note = ?, reviewed_at = datetime('now')
    WHERE id = ? AND status = 'pending'
  `).run(user.userId, review_note || '', req.params.id);

  res.json({ success: true });
});

export default router;

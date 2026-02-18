import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db, { initDatabase } from './database';

initDatabase();

console.log('Seeding database...');

// Create admin user (username: admin, password: admin123)
const adminId = uuidv4();
const adminPasswordHash = bcrypt.hashSync('admin123', 10);
db.prepare(`
  INSERT OR IGNORE INTO users (id, username, password_hash, role)
  VALUES (?, 'admin', ?, 'admin')
`).run(adminId, adminPasswordHash);

console.log('Admin user created: admin / admin123');

// Create initial scandals
const scandals = [
  {
    id: uuidv4(),
    name: 'Electricaribe',
    description: 'Escándalo relacionado con la empresa Electricaribe y el servicio de energía eléctrica en la costa caribe colombiana. Irregularidades en la prestación del servicio, cortes masivos, y posibles desvíos de recursos públicos.',
    color: '#DC2626',
  },
  {
    id: uuidv4(),
    name: 'Aeropuerto Ernesto Cortissoz',
    description: 'Irregularidades en la construcción, remodelación y administración del Aeropuerto Internacional Ernesto Cortissoz de Barranquilla. Posibles sobrecostos y contratos cuestionables.',
    color: '#7C3AED',
  },
  {
    id: uuidv4(),
    name: 'Tanque',
    description: 'Escándalo relacionado con la construcción del tanque de almacenamiento de agua. Posibles sobrecostos, retrasos injustificados y vínculos con actores cuestionables.',
    color: '#2563EB',
  },
  {
    id: uuidv4(),
    name: 'Navelena',
    description: 'Escándalo del proyecto de navegabilidad del río Magdalena a cargo de Navelena. Contratos millonarios, incumplimientos y posibles actos de corrupción en la obra de infraestructura más ambiciosa del país.',
    color: '#059669',
  },
  {
    id: uuidv4(),
    name: 'La 26 Bogotá',
    description: 'Irregularidades en la construcción y contratos de la Avenida 26 (Avenida El Dorado) en Bogotá. Sobrecostos, retrasos y posibles vínculos con corrupción en la contratación pública.',
    color: '#D97706',
  },
];

const insertScandal = db.prepare(
  'INSERT OR IGNORE INTO scandals (id, name, description, color) VALUES (?, ?, ?, ?)'
);

for (const s of scandals) {
  insertScandal.run(s.id, s.name, s.description, s.color);
  console.log(`Scandal created: ${s.name}`);
}

console.log('\nSeed completed!');
console.log('You can login at /admin with: admin / admin123');

# Escándalos - Plataforma de Denuncias Anónimas

Plataforma ciudadana para documentar y conectar actores en escándalos de interés público. Cualquier persona puede enviar pistas de manera anónima, las cuales son verificadas por administradores antes de ser publicadas.

## Características

- **Tablero interactivo tipo Miro**: Visualización de conexiones entre escándalos, personas y evidencias usando React Flow
- **Envío anónimo de pistas**: No se registran datos personales. Se aceptan imágenes, PDFs, documentos, audio y video
- **Sistema de verificación**: Las pistas pasan por revisión de administradores antes de ser publicadas
- **Gestión de datos**: Panel admin para crear escándalos, personas y vincularlos entre sí

## Escándalos iniciales

1. Electricaribe
2. Aeropuerto Ernesto Cortissoz
3. Tanque
4. Navelena
5. La 26 Bogotá

## Stack técnico

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + React Flow (@xyflow/react)
- **Backend**: Express + TypeScript + SQLite (better-sqlite3)
- **Uploads**: Multer (imágenes, PDFs, documentos)
- **Auth**: JWT para panel admin

## Instalación

```bash
# Instalar todas las dependencias
npm run install:all

# Seed de datos iniciales (crea admin y 5 escándalos)
cd server && npm run seed

# Ejecutar en desarrollo
npm run dev
```

El servidor corre en `http://localhost:3001` y el cliente en `http://localhost:5173`.

## Credenciales admin

- Usuario: `admin`
- Contraseña: `admin123`

## Estructura

```
├── client/          # Frontend React
│   └── src/
│       ├── components/   # Layout, nodos del tablero
│       ├── pages/        # Home, ScandalBoard, SubmitTip, Admin*
│       ├── context/      # AuthContext
│       └── api.ts        # Cliente API
├── server/          # Backend Express
│   └── src/
│       ├── routes/       # auth, scandals, people, tips, evidence
│       ├── database.ts   # SQLite schema
│       ├── auth.ts       # JWT middleware
│       └── seed.ts       # Datos iniciales
```

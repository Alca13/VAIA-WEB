# VAIA Admin Dashboard

Panel administrativo construido con Next.js y React para gestionar usuarios, reportes estratégicos, auditorías y recursos de identidad visual con control de versiones.

## Requisitos

- Node.js 18 o superior

## Scripts disponibles

- `npm install` – instala las dependencias.
- `npm run dev` – inicia el entorno de desarrollo en `http://localhost:3000`.
- `npm run build` – genera el build de producción.
- `npm start` – sirve el build generado.
- `npm run lint` – ejecuta las reglas de ESLint.

## API interna

- `GET /api/users` – lista de usuarios y sus departamentos.
- `GET /api/reports` – reportes con estado y nivel de riesgo.
- `GET /api/audit` – eventos de auditoría para accesos y acciones críticas.
- `GET /api/branding` – estado actual de logotipos y banners.
- `POST /api/branding` – actualiza logotipo o banner mediante un formulario `multipart/form-data`. Guarda el archivo en `public/uploads/<assetType>/` y versiona el historial en `data/branding.json`.

Los archivos cargados se publican de inmediato en la carpeta `public/uploads`. Para mantener los assets generados en un control de versiones remoto, sincroniza este directorio con tu bucket S3 o servicio equivalente.

## Datos semilla

El dashboard consume archivos JSON ubicados en la carpeta `data/` como fuente inicial. Puedes sustituirlos por integraciones reales o conectar directamente las vistas a tus servicios corporativos.

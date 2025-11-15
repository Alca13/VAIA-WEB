# VAIA Authentication & Panel

Este proyecto contiene un backend basado en NestJS para autenticación con JWT, control de dispositivos y 2FA (TOTP), junto con un panel web para administrar usuarios y dispositivos.

## Estructura

- `backend/`: API NestJS con módulos de usuarios, autenticación, dispositivos y administración.
- `frontend/`: Panel React (Vite) para administradores.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
cd backend
npm install

cd ../frontend
npm install
```

> En entornos sin acceso a internet, instala manualmente las dependencias antes de compilar.

## Backend

```bash
cd backend
npm run start:dev
```

El backend expone las rutas en `http://localhost:3000`. Un usuario administrador por defecto se crea al iniciar el servidor (`admin@vaia.local` / `Admin1234`).

### Características

- Registro y login con JWT
- 2FA opcional por usuario usando TOTP
- Registro y control de dispositivos por fingerprint
- Políticas de acceso diferenciadas por rol (`admin`, `usuario`, `directivo`)
- Tokens de recuperación con envío simulado vía email/SMS
- Endpoints para panel administrativo

## Frontend

```bash
cd frontend
npm run dev
```

Configura las variables `VITE_API_URL` y `VITE_ADMIN_TOKEN` en un archivo `.env` si necesitas apuntar a un backend distinto o establecer el token del administrador manualmente.

El panel incluye:

- Listado de usuarios con bloqueo/desbloqueo y restablecimiento forzado
- Solicitud manual de tokens de recuperación
- Gestión de dispositivos registrados y pendientes de autorización

## Seguridad y próximos pasos

- Sustituir los almacenes en memoria por una base de datos persistente (PostgreSQL, MongoDB, etc.).
- Integrar servicios reales de correo/SMS para recuperación.
- Añadir pruebas automatizadas y pipelines CI/CD.
- Extender la auditoría y registros de actividad.

# Reporte Ciudadano

App móvil (Expo/React Native) + API (Laravel) para reportes ciudadanos.

## Estructura

```
movil-proyecto/
├── api/                  # Backend Laravel
│   ├── app/
│   ├── database/
│   ├── routes/
│   └── ...
├── movil-app/            # Frontend Expo
│   ├── src/
│   │   ├── screens/
│   │   ├── services/
│   │   └── components/
│   └── ...
└── README.md
```

---

## 1. Backend (Laravel)

### Requisitos

- PHP 8.2+
- Composer
- SQLite (incluido en PHP)

### Instalación

```bash
cd api
composer install
```

### Configuración

Crear archivo `.env` en `api/`:

```env
APP_NAME=ReporteCiudadano
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_TIMEZONE=America/Bogota
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite

SESSION_DRIVER=file
```

Generar clave y preparar base de datos:

```bash
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan db:seed
```

### Iniciar servidor

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

El flag `--host=0.0.0.0` es necesario para que el teléfono pueda alcanzar el servidor.

### Usuarios predefinidos (seed)

| Rol         | Email                       | Password        |
|-------------|-----------------------------|-----------------|
| Admin       | admin@reportes.com          | admin123        |
| Funcionario | funcionario@reportes.com    | func123         |
| Ciudadano   | ciudadano@reportes.com      | ciudadano123    |

---

## 2. Frontend (Expo)

### Requisitos

- Node.js 18+
- Expo Go en el teléfono

### Instalación

```bash
cd movil-app
npm install
```

### Cambiar IP del servidor

Editar `movil-app/src/services/api.js`:

```js
const API_URL = 'http://TU_IP:8000/api';
const API_BASE = 'http://TU_IP:8000';
```

Obtén tu IP con `ipconfig` (Windows) o `ifconfig` (Linux/Mac) y úsala en lugar de `TU_IP`.

### Iniciar

```bash
npx expo start
```

Escanea el código QR con Expo Go.

Si hay cambios en el código y no se reflejan, reinicia con caché limpio:

```bash
npx expo start -c
```

---

## 3. Firewall (Windows)

Si el teléfono no conecta, abre **PowerShell como Administrador** y ejecuta:

```powershell
netsh advfirewall firewall add rule name="Laravel 8000" dir=in action=allow protocol=TCP localport=8000
```

---

## 4. Flujo de roles

### Admin
- Panel administrativo (pestaña Admin)
- Gestionar usuarios (crear funcionarios, admins, ciudadanos)
- Gestionar categorías
- Asignar reportes a funcionarios
- Ver estadísticas
- Eliminar reportes

### Funcionario
- Filtrar reportes por "Mis asignados" / "Sin asignar"
- Cambiar estado de reportes
- Agregar comentarios
- Crear avisos

### Ciudadano
- Crear reportes con fotos y ubicación
- Ver sus reportes
- Recibir notificaciones

---

## 5. Base de datos

La base de datos SQLite está en `api/database/database.sqlite`. Puedes revisarla con:

- DB Browser for SQLite
- SQLite Viewer (extensión VS Code)
- `sqlite3` en terminal

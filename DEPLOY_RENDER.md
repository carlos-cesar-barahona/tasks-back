# Desplegar backend en Render

## 1. Subir el código a GitHub

Si aún no está en GitHub:

```bash
cd C:\Users\carlo\Downloads\programacion\backend\tasks-back
git init
git add .
git commit -m "Backend listo para Render"
```

Crea un repositorio nuevo en https://github.com/new (por ejemplo `tasks-backend`), sin README. Luego:

```bash
git remote add origin https://github.com/TU_USUARIO/tasks-backend.git
git branch -M main
git push -u origin main
```

No subas `src/serviceFirebase.json` ni `.env` (deben estar en `.gitignore`). En Render usarás variables de entorno.

---

## 2. Crear cuenta en Render

1. Entra en **https://render.com**
2. Regístrate con **GitHub** (así conectas el repo directo).

---

## 3. Crear un Web Service

1. En el panel de Render: **Dashboard** → **New** → **Web Service**.
2. Conecta tu cuenta de GitHub si te lo pide y autoriza a Render.
3. Elige el repositorio del backend (ej. `tasks-backend`).
4. Configura:

| Campo | Valor |
|-------|--------|
| **Name** | `tasks-api` (o el que quieras) |
| **Region** | El más cercano (ej. Oregon o Frankfurt) |
| **Runtime** | `Node` |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | **Free** |

5. En **Advanced** (si aparece): **Root Directory** déjalo vacío.

---

## 4. Variables de entorno

En la misma pantalla, sección **Environment** (Environment Variables), añade:

| Key | Value |
|-----|--------|
| `JWT_SECRET` | `8ac3e766ba01c89249a7be9829beadfb185808d2b788744120dbcd0eec4e2240` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Contenido completo de `src/serviceFirebase.json` **en una sola línea** (sin saltos de línea) |

Para obtener el JSON en una línea (PowerShell, en la carpeta del backend):

```powershell
(Get-Content src\serviceFirebase.json -Raw) -replace "`n|`r|\s+", " "
```

Copia el resultado y pégalo como valor de `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## 5. Desplegar

1. Pulsa **Create Web Service**.
2. Render hará el primer deploy (build + start). Puede tardar 2–5 minutos.
3. Cuando termine, verás **Your service is live at** con una URL como:
   ```
   https://tasks-api.onrender.com
   ```

Esa es la base de tu API.

---

## 6. Rutas de la API

- `GET  https://tasks-api.onrender.com/user/:email`
- `POST https://tasks-api.onrender.com/user`
- `GET  https://tasks-api.onrender.com/tasks/:userId` (header `Authorization: Bearer <token>`)
- `POST https://tasks-api.onrender.com/tasks`
- `PUT  https://tasks-api.onrender.com/tasks/:id`
- `DELETE https://tasks-api.onrender.com/tasks/:id`

En tu frontend, usa esa URL como base del API.

---

## Notas

- **Plan Free:** el servicio se “duerme” tras ~15 min sin peticiones. La primera petición tras dormir puede tardar 30–60 segundos.
- Para ver logs: en Render → tu servicio → **Logs**.
- Si cambias código, haz `git push` a `main` y Render volverá a desplegar solo.

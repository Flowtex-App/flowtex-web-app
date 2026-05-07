# Deploy del frontend FLOWTEX

## Stack

- React 18 + TypeScript + Vite
- TailwindCSS 4 (con tokens neo-brutalist)
- Zustand (estado UI con persistencia)
- React Router 6
- Axios

## Variables de entorno

| Variable | Default | Descripcion |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | URL del backend |

## Local

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # genera dist/
npm run preview      # previsualiza el build
npm run typecheck
npm run test
```

## Netlify

1. New site from Git, conectar el repo `flowtex-web-app`
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Variables de entorno: `VITE_API_BASE_URL=https://<tu-backend>.onrender.com/api/v1`
5. El archivo `netlify.toml` ya configura los redirects para SPA y headers seguros

## Vercel (alternativa)

```
Build Command: npm run build
Output Directory: dist
Framework: Vite
```

Anadir `VITE_API_BASE_URL` en Settings -> Environment Variables.

## Cuenta demo precargada

```
usuario: demo
password: Flowtex2026!
```

Se cablea a 6 formularios de ejemplo (solicitud de acceso, compras, incidentes, vacaciones, proveedores, change request) ya seedeados en la base.

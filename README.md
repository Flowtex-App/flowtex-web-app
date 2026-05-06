# flowtex-web-app

Frontend del proyecto **FLOWTEX**.

## Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 6
- Zustand (estado de UI)
- Axios (cliente HTTP)
- Vitest + Testing Library (tests)

## Arquitectura: Hexagonal (Ports & Adapters) por bounded context

El código se organiza por **bounded context** (no por capa técnica). Cada bounded context es una "hexagonal slice" autocontenida con cuatro carpetas:

```
src/<contexto>/
├── domain/
│   ├── models/        # Aggregates, entidades, value objects. Cero dependencias externas.
│   └── ports/         # Interfaces que el dominio espera consumir (IAuthRepository, etc.).
├── application/
│   └── use-cases/     # Orquestan dominio + ports. Sin detalles de UI ni de transporte.
├── infrastructure/
│   └── adapters/      # Implementan los ports. HTTP, localStorage, mocks, etc.
└── interfaces/
    ├── components/    # Componentes presentacionales del contexto.
    ├── pages/         # Páginas / vistas.
    ├── stores/        # Estado de UI (Zustand). Llaman a use cases.
    └── composition/   # Composition root del contexto: cablea adapters con use cases.
```

Regla de dependencia (mismo principio que el backend):

```
interfaces → application → domain ← infrastructure
```

Domain no importa nada de afuera. Application solo importa domain. Infrastructure implementa abstracciones de domain. Interfaces solo orquesta y consume use cases.

## Estructura del repo

```
flowtex-web-app/
├── public/
├── src/
│   ├── iam/                       # Bounded context: Identity & Access Management
│   │   ├── domain/
│   │   │   ├── models/            # User, Credentials
│   │   │   └── ports/             # IAuthRepository, ITokenStorage
│   │   ├── application/
│   │   │   └── use-cases/         # SignIn, SignUp, SignOut
│   │   ├── infrastructure/
│   │   │   └── adapters/          # HttpAuthRepository, LocalStorageTokenStorage
│   │   └── interfaces/
│   │       ├── pages/             # SignIn.page.tsx, SignUp.page.tsx
│   │       ├── stores/            # auth.store.ts (Zustand)
│   │       └── composition/       # iam-container.ts (composition root del contexto)
│   ├── shared/
│   │   ├── domain/                # Tipos transversales
│   │   ├── infrastructure/
│   │   │   ├── http/              # http-client.ts (axios con interceptor)
│   │   │   └── router/            # router.tsx
│   │   └── interfaces/
│   │       └── components/        # Componentes UI compartidos
│   ├── main.tsx
│   ├── style.css
│   └── test-setup.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Cómo agregar un nuevo bounded context

Para un contexto `<X>`:

1. Crear `src/<x>/` con las cuatro subcarpetas: `domain/`, `application/`, `infrastructure/`, `interfaces/`.
2. En `domain/models/`: aggregates y value objects. Reglas e invariantes en sus constructores y métodos.
3. En `domain/ports/`: interfaces de lo que el contexto necesita del exterior (repositorios, storage, otros contextos).
4. En `application/use-cases/`: una clase por caso de uso. Constructor recibe los ports.
5. En `infrastructure/adapters/`: implementaciones concretas de los ports (HTTP, localStorage, fetch, mocks).
6. En `interfaces/composition/`: archivo que importa adapters concretos, los inyecta en los use cases, y los exporta para que los stores los consuman.
7. En `interfaces/stores/`: store de Zustand que orquesta llamados a use cases.
8. En `interfaces/pages/` y `interfaces/components/`: UI que consume los stores.

**Nada del nuevo contexto debe ser importado directamente por otros contextos.** Si dos contextos necesitan comunicarse, el consumidor define un port en su `domain/ports/` y el composition root cablea un adapter que use el módulo del proveedor.

## Ports & Adapters: por qué este diseño

Beneficios concretos en el día a día:

- **Tests rápidos sin red.** Un caso de uso se testea con mocks de los ports en milisegundos. Ver `src/iam/application/use-cases/SignInUseCase.test.ts` como ejemplo.
- **Cambiar backend sin romper UI.** Si el backend pasa de REST a GraphQL, se reescribe `HttpAuthRepository`. El dominio, los use cases y la UI no se enteran.
- **Cambiar persistencia local sin tocar dominio.** De localStorage a cookie httpOnly: se reemplaza `LocalStorageTokenStorage`.
- **Onboarding más predecible.** Cada contexto se lee solo, sin saltos a una "carpeta global de utilidades".

## Comandos

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de producción
npm run preview      # servir el build
npm test             # vitest watch
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y ajustar:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Documentación del proyecto

Los documentos académicos y los ADRs (Architecture Decision Records) viven en los repos de workspace:

- `calidad-flowtex-workspace`
- `desarrollo-agile-flowtex-workspace`

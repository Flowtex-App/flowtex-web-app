# Modo demo sin login para FLOWTEX — Diseño

Fecha: 2026-07-06
Repo: `flowtex-web-app` (frontend React + TypeScript, arquitectura hexagonal)
Estado: aprobado, listo para plan de implementación.

## Objetivo

Permitir demostrar el MVP de FLOWTEX **sin pantalla de login**: la app entra directo a las funcionalidades principales (armar formularios, configurar sus flujos de aprobación, designar aprobadores y probar un formulario recorriendo la aprobación con las personas involucradas), y ofrece un selector "Actuar como" para saltar entre el solicitante y los aprobadores durante la demo.

## Requisitos

1. La app entra directamente, sin pedir usuario ni contraseña (reemplaza el login por completo).
2. Un selector "Actuar como" en la cabecera permite cambiar de persona (solicitante, aprobadores, diseñador) en cualquier momento.
3. El backend y su seguridad (Spring Security + JWT) **no se modifican**. Cada llamada sigue llevando un JWT real y la lógica de aprobación real se ejecuta de verdad.
4. Los componentes de login (páginas sign-in / sign-up) permanecen en el repositorio, solo sin referenciar, para poder revertir a login real con un cambio pequeño.

## Enfoque

Modo demo **solo frontend**. La autenticación real se conserva pero se ejecuta por debajo: al arrancar, la app inicia sesión automáticamente como una persona por defecto usando las credenciales sembradas; "Actuar como X" vuelve a iniciar sesión como el usuario X. Todo usa el flujo existente `auth.store.signIn(username, password)`, que ya devuelve el `user` con sus roles y guarda el token que consume el `http-client`.

Se descartó desactivar la seguridad del backend (permitAll o endpoint de impersonación): cambiaría la postura de seguridad que forma parte del alcance del proyecto, es más invasivo y se perdería el token por usuario que hace auténtica la demo.

## Datos sembrados (Flyway V2)

Todos los usuarios comparten la contraseña `Flowtex2026!`.

| Usuario | Nombre | Roles | Papel en la demo |
|---|---|---|---|
| `demo` | Demo User | ADMIN, DESIGNER, APPROVER, USER | Persona por defecto (todos los permisos) |
| `gmora` | Gabriel Mora | ADMIN, DESIGNER | Diseñador / Admin |
| `clecca` | Christopher Lecca | ADMIN, DESIGNER | Diseñador / Admin |
| `mtongo` | Milagros Tongo | DESIGNER, APPROVER | Aprobador |
| `mames` | Mariano Ames | USER | Solicitante |
| `asosa` | Angello Sosa | USER | Solicitante |

## Componentes (frontend)

1. **Registro de personas** (`src/iam/demo/personas.ts`): lista de personas (clave, etiqueta visible, `username`, descripción de rol) y la constante `DEMO_PASSWORD = 'Flowtex2026!'`. Define también la persona por defecto (`demo`).
2. **Bootstrap de sesión demo**: al cargar la app, si no hay `user` en `auth.store`, inicia sesión como la persona por defecto (`auth.store.signIn`). Mientras autentica, muestra un splash breve. Ubicación: componente raíz de composición (ej. envoltura del router o `AppShell`).
3. **`AuthGuard` (`src/shared/infrastructure/router/AuthGuard.tsx`)**: deja de redirigir a `/sign-in`. Si no hay sesión, dispara/espera el bootstrap demo y muestra el splash; nunca envía a una pantalla de login.
4. **Router (`src/shared/infrastructure/router/router.tsx`)**: la entrada por defecto es el dashboard de la app. Las rutas `/sign-in` y `/sign-up` redirigen a la app (no se eliminan los componentes, solo se dejan de usar como destino).
5. **Selector "Actuar como" (`AppShell` header)**: componente nuevo (ej. `src/iam/interfaces/components/PersonaSwitcher.tsx`) que muestra la persona actual y un dropdown de personas agrupadas por papel. Al seleccionar, llama a `auth.store.signIn(username, DEMO_PASSWORD)` y permanece en la ruta actual.
6. **Acción de cerrar sesión**: cualquier control de "cerrar sesión" existente en la UI (que hoy usa `SignOutUseCase` y llevaría al login) se oculta en modo demo, o se reemplaza por "volver a la persona por defecto" (re-inicia la sesión demo). Nunca deja al usuario sin sesión ni lo manda a una pantalla de login.

## Flujo de datos

Cambio de persona → `auth.store.signIn(username, DEMO_PASSWORD)` → backend valida y devuelve JWT + user → `http-client` usa el nuevo token → las llamadas siguientes actúan como esa persona → los pasos de aprobación asignados a ella quedan accionables.

## Reversibilidad

El modo demo reemplaza el login por decisión del usuario. Los componentes de sign-in / sign-up se conservan en el repo sin referenciar. Volver al login real implica: restaurar la ruta `/sign-in` como destino del `AuthGuard` y quitar el bootstrap de auto-login. No se borra código de autenticación.

## Pruebas

- **Unitario**: el registro de personas (personas esperadas, persona por defecto válida) y el bootstrap de auto-login (si no hay user, llama a signIn con la persona por defecto; si ya hay, no hace nada).
- **Manual (recorrido de demo)**: entrar directo como diseñador, armar un formulario, armar su workflow, designar aprobadores, cambiar a "Solicitante" y enviar el formulario, cambiar a "Aprobador" y aprobar cada paso, verificar el timeline de la solicitud.

## Fuera de alcance

- Cambios en el backend o en su configuración de seguridad.
- Sembrar o modificar usuarios (se usan los ya existentes en Flyway V2).
- Un selector que filtre solo a los aprobadores realmente asignados al workflow en curso (el selector lista las personas sembradas; basta para la demo).

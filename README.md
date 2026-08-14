# Casa de Cambio - Mobile App

Aplicación móvil para gestión de casa de cambio, construida con Expo + React Native.

## Requisitos

- Node.js 18+
- pnpm
- iOS Simulator, Android Emulator o dispositivo físico

## Instalación

```bash
pnpm install
pnpm start
```

Comandos útiles:

```bash
pnpm ios
pnpm android
pnpm web
pnpm -s tsc --noEmit
```

## Arquitectura Actual

La app usa **arquitectura modular por dominio** con React Query para datos remotos:

- `src/modules/<dominio>/infrastructure`: acceso HTTP (repositories)
- `src/modules/<dominio>/application`: hooks de `useQuery` / `useMutation`
- `src/screens/*`: UI y flujo de interacción
- `src/shared/query/queryKeys.ts`: claves centralizadas de cache

### Regla de estado

- **React Query**: todo dato que viene del backend.
- **Zustand (`authStore`)**: estado de sesión/local (`user`, `login`, `logout`, `changePassword`).

## Estructura (resumen)

```text
APP/
├── App.tsx
├── src/
│   ├── modules/
│   │   ├── cash/
│   │   ├── dashboard/
│   │   ├── exchange-rates/
│   │   ├── expenses/
│   │   ├── objectives/
│   │   ├── profile/
│   │   ├── reports/
│   │   └── transactions/
│   ├── shared/
│   │   └── query/queryKeys.ts
│   ├── screens/
│   ├── services/api.ts
│   ├── store/authStore.ts
│   ├── navigation/
│   ├── components/
│   ├── theme/
│   └── types/
├── app.json
└── package.json
```

## Módulos Implementados

- `transactions`: lista + creación + monedas + tasas.
- `cash`: balances, transacciones, arqueos y ajustes.
- `exchange-rates`: tasas actuales, historial y actualización.
- `expenses`: listado de gastos.
- `objectives`: listado filtrado por estado.
- `profile`: agregados de perfil (cuentas, objetivos activos, caja, resumen diario).
- `reports`: reporte diario por fecha + balances.
- `dashboard`: repository base para datos compuestos del home.

## Convención para Nuevos Módulos

Crear siempre esta base:

```text
src/modules/<dominio>/
├── infrastructure/<dominio>.repository.ts
└── application/use<Domain>.ts
```

Checklist:

1. Definir `queryKeys` en `src/shared/query/queryKeys.ts`.
2. Implementar repository con `api` tipado.
3. Implementar hooks `useQuery`/`useMutation`.
4. Invalidar cache relacionada al mutar.
5. Consumir hooks desde `screen`, sin llamar `api` directo.

## API Backend

La app consume la API REST del proyecto `API/`.

La base URL está en:

- `src/config/constants.ts`

## Diseño y UI

- Navegación por tabs inferiores.
- Tema y tokens en `src/theme/index.ts`.
- Componentes de UI reutilizables en `src/components/ui`.
- Componentes de animación y gráficos en `src/components/animations` y `src/components/charts`.

## Interfaz Web

La experiencia Web de Cashflow incluye una landing de cuatro secciones en `src/screens/auth/WelcomeScreen.web.tsx`: presentación, operaciones, control del negocio y acceso. Sus botones **Iniciar sesión** y **Crear cuenta** usan la navegación Web existente; esta implementación no modifica la UI nativa de Android o iOS.

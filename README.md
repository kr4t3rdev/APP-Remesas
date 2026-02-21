# Casa de Cambio - Mobile App

Aplicación móvil para gestión de casa de cambio desarrollada con Expo y React Native.

## Requisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Expo CLI
- iOS Simulator / Android Emulator / Dispositivo físico

## Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar en desarrollo
pnpm start

# iOS
pnpm ios

# Android
pnpm android
```

## Estructura del Proyecto

```
APP/
├── App.tsx                    # Entry point
├── src/
│   ├── components/
│   │   ├── ui/               # Componentes UI reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   └── features/         # Componentes específicos
│   │       └── Dashboard/
│   │           ├── BalanceCard.tsx
│   │           ├── TransactionSummaryCard.tsx
│   │           └── QuickActionCard.tsx
│   ├── screens/
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── profile/
│   │   │   └── ProfileScreen.tsx
│   │   ├── transactions/
│   │   ├── cash/
│   │   ├── expenses/
│   │   ├── reports/
│   │   └── objectives/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── MainTabs.tsx
│   │   └── types.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   └── finance.service.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── dashboard.store.ts
│   ├── types/
│   │   └── index.ts
│   ├── theme/
│   │   └── index.ts
│   ├── config/
│   │   └── constants.ts
│   └── hooks/
├── assets/
├── tailwind.config.js
├── babel.config.js
└── app.json
```

## Tecnologías

- **Expo SDK 54** - Framework de desarrollo
- **React Native** - UI nativa
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **Zustand** - Estado global
- **TanStack Query** - Data fetching
- **NativeWind** - Tailwind CSS para React Native
- **Axios** - Cliente HTTP
- **React Hook Form + Zod** - Formularios
- **date-fns** - Manejo de fechas

## Pantallas

### Autenticación
- Login

### Dashboard (Home)
- Resumen del día
- Saldos en caja
- Acciones rápidas

### Transacciones
- Lista de transacciones
- Nueva compra/venta

### Caja
- Balances por moneda
- Arqueos
- Ajustes

### Gastos
- Lista de gastos
- Nuevo gasto
- Reconciliaciones

### Reportes
- Diario
- Por período
- Ganancias

### Perfil
- Información del usuario
- Cambiar contraseña
- Configuración

## API Backend

La aplicación consume la API REST ubicada en `/API`. 
URL base de desarrollo: `http://localhost:3000/api`

## Scripts

```bash
# Desarrollo
pnpm start

# iOS Simulator
pnpm ios

# Android Emulator
pnpm android

# Web
pnpm web

# Linting
pnpm lint

# Build
pnpm build
```

## Configuración

### Variables de entorno

Crear archivo `.env` en la raíz:

```env
API_URL=http://localhost:3000/api
```

### Tailwind/NativeWind

Los estilos se definen en `tailwind.config.js` y se aplican usando la sintaxis de Tailwind.

## Notas de Desarrollo

- Estilo iOS-first con diseño suave y fluido
- Navegación por tabs en la parte inferior
- Colores primarios azules
- Cards con sombras suaves
- Animaciones nativas

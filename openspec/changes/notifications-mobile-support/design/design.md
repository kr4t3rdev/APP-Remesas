# Design: Mobile Support para Notificaciones

## Component Hierarchy

```
AppNavigator
├── MainTabs (InstagramTabBar) ← mobile
│   ├── HomeScreen
│   ├── TransactionsScreen
│   ├── CashScreen
│   ├── ExpensesScreen
│   ├── NotificationsScreen  ← NUEVO
│   └── ProfileScreen
│
├── AdminTabs ← mobile
│   ├── AdminHomeScreen
│   ├── AdminRoutes
│   ├── AdminUsersScreen
│   ├── AdminReportsScreen
│   ├── AdminNotificationsScreen ← NUEVO (mismo comp. que NotificationsScreen)
│   └── AdminProfileScreen
│
└── Header (desktop) ← sin cambios
    └── NotificationCenter ← sin cambios
```

## Diseño de componentes

### 1. `NotificationsScreen` (nuevo)

```
src/screens/notifications/NotificationsScreen.tsx
```

**Responsabilidad**: Screen wrapper para mobile. Reutiliza la lógica existente (queries, mutations, repository) pero envuelta en un layout full-height en vez de Modal.

```
NotificationsScreen
├── Header nativo del stack/tab (opcional — usar screen header propio)
│   ├── "Notificaciones" (título)
│   └── "Leer todas" (botón, solo si hay no leídas)
├── FlatList
│   └── NotificationItem
│       ├── Ionicons (icono según tipo)
│       ├── Text (título)
│       ├── Text (mensaje)
│       ├── Text (fecha)
│       ├── unreadDot (si no leída)
│       └── onPress → markAsRead + navigate
└── Estados: loading / error / empty
```

**Props**: ninguna (usa queries internas + navigation de react-navigation).

**Navegación**: recibe `navigation` prop del tab navigator. Usa `navigation.navigate("AdminUserDetail", ...)` o `navigation.getParent()?.navigate(...)` para screens del Stack padre.

### 2. `useNotificationNavigation` (nuevo hook)

```
src/modules/notifications/application/useNotificationNavigation.ts
```

**Responsabilidad**: Encapsular la lógica de navegación según tipo de notificación.

```typescript
function useNotificationNavigation() {
  const navigation = useNavigation<...>();
  const { user } = useAuthStore();

  return (notification: UserNotification) => {
    // Marcar como leída
    markAsReadMutation.mutate(notification.id);

    // Determinar destino según tipo + payload
    switch (notification.type) {
      case "NEW_USER_REGISTERED":
      case "USER_TEMP_BLOCKED":
      case "USER_BANNED":
        if (user?.role === "ADMIN" && notification.payload?.userId) {
          navigation.navigate("AdminUserDetail", {
            user: notification.payload.user,
          });
        }
        break;
      case "LICENSE_EXPIRING":
        if (user?.role === "ADMIN" && notification.payload?.licenseId) {
          navigation.navigate("AdminLicenseDetail", {
            licenseId: notification.payload.licenseId,
          });
        }
        break;
      case "PASSWORD_RESET":
      case "EMAIL_VERIFICATION":
        if (user?.role === "ADMIN" && notification.payload?.userId) {
          navigation.navigate("AdminUserDetail", {
            user: notification.payload.user,
          });
        }
        break;
    }
    // Si no hay navegación aplicable, solo marca como leída (ya se mutó arriba)
  };
}
```

### 3. Refactor `NotificationCenter` (existente)

**Cambios**: Extraer el contenido del FlatList + renderizado de ítems a un componente compartido `NotificationList`.

```
NotificationCenter.tsx (refactor)
├── NotificationList (export) ← nuevo compartido
│   ├── FlatList + renderItem
│   └── Estados loading/error/empty
│
├── ConnectedNotificationCenter (sin cambios mayores)
│   └── usa NotificationList dentro del Modal
│
└── NotificationCenter (wrapper público, sin cambios)
```

`NotificationList` recibe:

```typescript
interface NotificationListProps {
  notifications: UserNotification[];
  isLoading: boolean;
  isError: boolean;
  onPressNotification: (item: UserNotification) => void;
  ListHeaderComponent?: React.ReactElement;
}
```

### 4. Badge en InstagramTabBar

La `InstagramTabBar` usa `mainTabDefinitions` para renderizar los tabs. El badge no está soportado por la arquitectura actual.

**Solución**: Agregar campo opcional `badge` a `MainTabDefinition`:

```typescript
type MainTabDefinition = {
  route: keyof MainTabParamList;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  emphasized?: boolean;
  badge?: number | null;  // NUEVO
};
```

En `InstagramTabBar.tsx`, cuando el tab tiene `badge > 0`, se renderiza un círculo rojo con el número superpuesto al icono (mismo estilo que el badge actual del NotificationCenter trigger).

### 5. Badge en AdminTabs

`AdminTabs` usa `createBottomTabNavigator` estándar. Soporta `tabBarBadge` nativo:

```typescript
<Tab.Screen
  name="AdminNotifications"
  component={NotificationsScreen}
  options={{
    tabBarLabel: "Notificaciones",
    tabBarIcon: ({ color }) => (
      <Ionicons name="notifications-outline" size={24} color={color} />
    ),
    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
  }}
/>
```

El badge se actualiza via `useUnreadNotificationsCountQuery()` en el screenOptions o en un wrapper.

## Flujo de datos

```
useUnreadNotificationsCountQuery()
  └─┬─ InstagramTabBar → badge en tab Notificaciones
    └─ AdminTabs → tabBarBadge nativo

NotificationsScreen
  └─ useNotificationsQuery() → FlatList
  └─ useMarkNotificationAsReadMutation() → onPress
  └─ useNotificationNavigation() → onPress → navigate

useMarkAllNotificationsAsReadMutation()
  └─ botón "Leer todas"
```

## Integración con InstagramTabBar

La `InstagramTabBar` necesita acceder al `unreadCount`. Como está fuera del árbol de TanStack Query del NotificationCenter, hay que:

**Opción A**: Usar `useUnreadNotificationsCountQuery` directamente en la tab bar.

```typescript
// InstagramTabBar.tsx
const { data: unreadCount } = useUnreadNotificationsCountQuery();
```

**Pro**: Simple, la query ya existe, staleTime 30s.
**Contra**: La tab bar se re-renderiza cada 30s si hay data.

**Opción B**: Pasar el badge via props desde MainTabs.

**Pro**: Más control sobre re-renders.
**Contra**: Hay que levantar el estado.

**Decisión**: Opción A. Es el enfoque más simple, la query ya está optimizada con staleTime, y el costo de un polling cada 30s en mobile es despreciable.

## Config de navegación

### types.ts — MainTabParamList

```typescript
export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Cash: undefined;
  Expenses: undefined;
  Notifications: undefined;  // NUEVO
  Profile: undefined;
};
```

### types.ts — AdminTabParamList

```typescript
export type AdminTabParamList = {
  AdminHome: undefined;
  AdminServices: undefined;
  AdminUsers: undefined;
  AdminReports: undefined;
  AdminNotifications: undefined;  // NUEVO
  AdminProfile: undefined;
};
```

### mainTabsConfig.ts

```typescript
export const mainTabDefinitions: readonly MainTabDefinition[] = [
  { route: "Home", label: "Inicio", icon: "home" },
  { route: "Transactions", label: "Transacciones", icon: "swap-horizontal" },
  { route: "Cash", label: "Cash", icon: "wallet", emphasized: true },
  { route: "Expenses", label: "Gastos", icon: "receipt" },
  { route: "Notifications", label: "Notificaciones", icon: "notifications-outline" },  // NUEVO
  { route: "Profile", label: "Perfil", icon: "person" },
];
```

## Archivos afectados (resumen)

| Archivo | Cambio |
| --- | --- |
| `src/types/index.ts` | Sin cambios |
| `src/navigation/types.ts` | + `Notifications` en MainTabParamList, + `AdminNotifications` en AdminTabParamList |
| `src/navigation/mainTabsConfig.ts` | + definición del tab Notificaciones |
| `src/navigation/MainTabs.tsx` | + Tab.Screen para NotificationsScreen |
| `src/navigation/AdminTabs.tsx` | + Tab.Screen para NotificationsScreen con tabBarBadge |
| `src/navigation/InstagramTabBar.tsx` | + badge rendering en tabs con badge > 0, + useUnreadNotificationsCountQuery |
| `src/components/notifications/NotificationCenter.tsx` | Refactor: extraer NotificationList como shared component |
| `src/screens/notifications/NotificationsScreen.tsx` | **NUEVO**: screen full-height para mobile |
| `src/modules/notifications/application/useNotificationNavigation.ts` | **NUEVO**: hook de navegación por tipo |
| `src/modules/notifications/application/useNotifications.ts` | Sin cambios (reutilizado) |
| `src/modules/notifications/infrastructure/notifications.repository.ts` | Sin cambios |

## Desktop/tablet: sin cambios

El `Header.tsx` y `MainLayout.tsx` no se modifican. El `NotificationCenter` actual (modal) sigue funcionando igual en desktop/tablet.

## Consideraciones de rendimiento

- `useUnreadNotificationsCountQuery` en InstagramTabBar: misma query que ya existe en NotificationCenter. Con staleTime 30s, el badge se actualiza cada 30s. Aceptable para mobile.
- FlatList en mobile no tiene paginación (solo 20 ítems). Postergado al SDD de flatlist pagination.
- Navigation type-safety: los `payload` de UserNotification son `Record<string, unknown>`. Validar con type narrowing en el hook.

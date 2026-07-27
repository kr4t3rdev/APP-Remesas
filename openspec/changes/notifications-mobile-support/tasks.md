# Tasks: Mobile Support para Notificaciones

## Estimación

~350 líneas totales estimadas. Por debajo del umbral de 400, va en un solo PR.

## Tareas

### T001 — Refactor: extraer NotificationList como shared component

**Archivos**: `src/components/notifications/NotificationCenter.tsx`

**Descripción**: Extraer la lógica del FlatList, renderItem, y los estados loading/error/empty a un componente `NotificationList` exportable. El `ConnectedNotificationCenter` actual lo usa dentro del Modal.

```typescript
// NotificationList.tsx (nuevo, o dentro del mismo archivo)
export const NotificationList: React.FC<{
  notifications: UserNotification[];
  isLoading: boolean;
  isError: boolean;
  onPressNotification: (item: UserNotification) => void;
  ListHeaderComponent?: React.ReactElement;
}> = ({ notifications, isLoading, isError, onPressNotification, ListHeaderComponent }) => {
  // ... FlatList con renderItem que llama a onPressNotification
};
```

**Tests**: Los tests existentes de NotificationCenter deben seguir pasando.

**Estimado**: ~40 líneas de cambio (mayormente reorganización).

**Checklist**:

- [x] `NotificationList` exportado e importable
- [x] `renderNotification` adaptado para recibir `onPressNotification` externo (no hardcodeado a `markAsReadMutation`)
- [x] `iconForNotification` sigue siendo función standalone
- [x] ConnectedNotificationCenter sigue funcionando (usa NotificationList internamente)
- [x] Tests existentes pasan

### T002 — Crear hook useNotificationNavigation

**Archivos**: `src/modules/notifications/application/useNotificationNavigation.ts`

**Descripción**: Hook que encapsula la navegación según tipo de notificación + rol del usuario.

```typescript
export function useNotificationNavigation() {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const { mutate: markAsRead } = useMarkNotificationAsReadMutation();

  return (notification: UserNotification) => {
    markAsRead(notification.id);
    // switch por tipo con navegación condicional
  };
}
```

**Estimado**: ~60 líneas (hook + lógica de navegación + type narrowing)

**Checklist**:

- [x] Hook creado en `src/modules/notifications/application/`
- [x] Switch cubre los 6 tipos de notificación
- [x] Navegación solo si `user.role === "ADMIN"` para screens admin
- [x] Fallback: si no hay navegación aplicable, solo marca como leída
- [x] Type narrowing sobre `payload: Record<string, unknown>`

### T003 — Agregar badge support a MainTabDefinition e InstagramTabBar

**Archivos**: `src/navigation/mainTabsConfig.ts`, `src/navigation/InstagramTabBar.tsx`

**Descripción**:

- Agregar campo `badge?: number | null` a `MainTabDefinition`.
- En `InstagramTabBar`, cuando un tab tiene `badge > 0`, renderizar un círculo rojo superpuesto al icono (mismo estilo que el badge existente en NotificationCenter).

**InstagramTabBar**: Agregar `useUnreadNotificationsCountQuery()` y pasar el badge al tab de Notificaciones.

**Estimado**: ~50 líneas

**Checklist**:

- [x] `MainTabDefinition.badge` agregado
- [x] Badge renderizado en InstagramTabBar para tabs con badge > 0
- [x] Estilo consistente con el badge actual del NotificationCenter
- [x] Solamente el tab "Notifications" tiene badge > 0
- [x] useUnreadNotificationsCountQuery integrada sin romper existing tests

### T004 — Crear NotificationsScreen

**Archivos**: `src/screens/notifications/NotificationsScreen.tsx`

**Descripción**: Screen full-height para mobile que usa `NotificationList` y `useNotificationNavigation`.

```typescript
const NotificationsScreen: React.FC = () => {
  const notificationsQuery = useNotificationsQuery(1, 20, true);
  const markAllAsReadMutation = useMarkAllNotificationsAsReadMutation();
  const onPressNotification = useNotificationNavigation();
  const notifications = notificationsQuery.data?.data ?? [];

  return (
    <View style={{ flex: 1 }}>
      {/* Header propio: "Notificaciones" + "Leer todas" */}
      {/* <NotificationList ... /> */}
    </View>
  );
};
```

**Estimado**: ~50 líneas

**Checklist**:

- [x] Screen full-height (flex: 1, no Modal)
- [x] Header con título + botón "Leer todas"
- [x] Usa NotificationList compartido
- [x] Usa useNotificationNavigation para onPress
- [x] Test: renderiza correctamente en mobile

### T005 — Agregar tab Notificaciones a MainTabs

**Archivos**: `src/navigation/MainTabs.tsx`, `src/navigation/mainTabsConfig.ts`, `src/navigation/types.ts`

**Descripción**:

- Agregar `Notifications: undefined` a `MainTabParamList`.
- Agregar definición del tab en `mainTabDefinitions`.
- Agregar `<Tab.Screen>` en `MainTabs.tsx`.

**Estimado**: ~15 líneas

**Checklist**:

- [x] Type actualizado
- [x] Tab definition agregada entre Expenses y Profile
- [x] Screen registrada en MainTabs

### T006 — Agregar tab Notificaciones a AdminTabs

**Archivos**: `src/navigation/AdminTabs.tsx`, `src/navigation/types.ts`

**Descripción**:

- Agregar `AdminNotifications: undefined` a `AdminTabParamList`.
- Agregar `<Tab.Screen>` con `tabBarBadge` nativo.
- Obtener `unreadCount` via `useUnreadNotificationsCountQuery()`.

**Estimado**: ~30 líneas

**Checklist**:

- [x] Type actualizado
- [x] Tab agregado entre AdminReports y AdminProfile
- [x] tabBarBadge funciona correctamente
- [x] Mismo NotificationsScreen importado de `src/screens/notifications/`

### T007 — Verificar que desktop/tablet sigue funcionando

**Archivos**: `src/components/layout/Header.tsx`, `src/components/notifications/NotificationCenter.tsx`

**Descripción**: Smoke test manual:

- Desktop: el NotificationCenter modal sigue abriéndose desde el Header
- Tablet: lo mismo
- Mobile: el tab reemplaza al Header (que ya no se renderiza)
- El badge del Header desktop sigue mostrando el conteo

**Estimado**: ~5 líneas (solo verify, no code changes)

**Checklist**:

- [x] Header desktop renderiza NotificationCenter correctamente
- [x] Badge del Header muestra conteo
- [x] Modal se abre/cierra correctamente
- [x] No hay regresiones visuales

## Resumen de archivos cambiados

| Archivo | Cambio | Líneas |
| --- | --- | --- |
| `src/components/notifications/NotificationCenter.tsx` | Refactor: extraer NotificationList | ~40 |
| `src/modules/notifications/application/useNotificationNavigation.ts` | NUEVO | ~60 |
| `src/navigation/mainTabsConfig.ts` | + badge field, + tab def | ~10 |
| `src/navigation/InstagramTabBar.tsx` | + badge rendering + useUnreadCountQuery | ~50 |
| `src/screens/notifications/NotificationsScreen.tsx` | NUEVO | ~50 |
| `src/navigation/MainTabs.tsx` | + Tab.Screen | ~5 |
| `src/navigation/AdminTabs.tsx` | + Tab.Screen + badge | ~30 |
| `src/navigation/types.ts` | + route types | ~4 |
| **Total** | | **~249 líneas** |

## Dependencias entre tareas

```
T001 (refactor NotificationList)
  ├── T004 (NotificationsScreen) — usa NotificationList
  ├── T005 (MainTabs) — registra NotificationsScreen
  ├── T006 (AdminTabs) — registra NotificationsScreen
  └── T007 (verify desktop) — NotificationCenter refactorizado

T002 (useNotificationNavigation)
  └── T004 (NotificationsScreen) — usa el hook

T003 (badge InstagramTabBar)
  └── T005 (MainTabs) — badge activo en el tab

T005 (MainTabs) + T006 (AdminTabs) → T007 (verify)
```

El orden recomendado: T001 → T002 → T003 → T004 → T005 → T006 → T007

# Proposal: Mobile Support para Notificaciones

## Problema

El `NotificationCenter` solo está disponible en el Header de escritorio/tablet (`width >= 640px`). En mobile (`width < BREAKPOINTS.tablet`):

- El Header no se renderiza (`Header.tsx` L26: `if (width < BREAKPOINTS.tablet) return null;`).
- `MainLayout` (mobile mode) renderiza únicamente `{children}`, sin Header ni Sidebar.
- El usuario no tiene **ningún acceso** a las notificaciones desde el teléfono.

## Contexto técnico

- **Nav mobile**: `MainTabs` con `createBottomTabNavigator` y `InstagramTabBar` (custom tab bar animada).
- **Tab bar actual**: 5 tabs — Home, Transactions, Cash (emphasized), Expenses, Profile.
- **NotificationCenter**: componente autónomo con trigger (bell icon + badge) + Modal panel. Queries via TanStack Query.
- **Tipos de notificación**: NEW_USER_REGISTERED, USER_TEMP_BLOCKED, USER_BANNED, LICENSE_EXPIRING, PASSWORD_RESET, EMAIL_VERIFICATION.

## Solución propuesta

### Opción A: Notificaciones como tab en la bottom bar (Recommended)

Agregar un 6to tab "Notificaciones" en `MainTabs` (InstagramTabBar) y `AdminTabs`, con badge de no leídas. La screen de notificaciones es el mismo `NotificationCenter` adaptado a full-screen.

**Pros**: Sigue el patrón mobile nativo (cada sección es un tab). El badge se integra naturalmente en la tab bar. Escala bien con futuras mejoras (pull-to-refresh, paginación).

**Contras**: Agrega un tab más a la barra (pasa de 5 a 6). En mobile el espacio es limitado.

### Opción B: Bell icon flotante en la tab bar

Agregar un botón flotante con badge dentro de la `InstagramTabBar` (como un elemento adicional fuera de los tabs, tipo FAB o inline). Al presionarlo abre el modal de notificaciones.

**Pros**: No agrega un tab completo. El modal existente funciona igual.

**Contras**: Rompe el patrón de navegación mobile estándar. El modal no es óptimo en mobile (overlay chico). No escala bien.

### Decisión: Opción A (tab dedicada)

La Opción A es la más correcta arquitecturalmente:

- Es el patrón de navegación mobile esperado (Instagram, Twitter, etc. usan tabs).
- El badge de no leídas se implementa a nivel del tab bar nativo.
- La screen de notificaciones puede ser el `NotificationCenter` refactorizado a full-screen en mobile.
- Prepara el terreno para push notifications (tener una screen donde aterrizar).

## Alcance

### Incluye

1. Agregar tab "Notificaciones" en `MainTabs` (InstagramTabBar) para usuarios normales.
2. Agregar tab "Notificaciones" en `AdminTabs` para admins.
3. Badge de no leídas en el icono del tab.
4. Adaptar `NotificationCenter` para que en mobile sea una screen full-height en vez de un Modal overlay.
5. Reutilizar toda la lógica existente (queries, mutations, repository).
6. En tablet/desktop el `NotificationCenter` sigue funcionando igual que hoy en el Header.

### No incluye (postergado)

- Push notifications (FCM/APNs).
- Paginación en FlatList (carga infinita).
- Pull-to-refresh.
- Sonidos ni vibración.

## Impacto

- `src/components/notifications/NotificationCenter.tsx` — refactor para soportar modo screen.
- `src/navigation/MainTabs.tsx` — agregar tab + badge.
- `src/navigation/AdminTabs.tsx` — agregar tab + badge.
- `src/navigation/mainTabsConfig.ts` — agregar definición del tab.
- `src/navigation/types.ts` — agregar route al MainTabParamList.
- `src/screens/notifications/` — nueva screen wrapper (opcional, podría ser directo).

## Riesgos

- **Badge en InstagramTabBar**: la tab bar custom usa `mainTabDefinitions` y no tiene soporte nativo de badge. Hay que implementarlo manualmente.
- **AdminTabs**: usa un `Tab.Navigator` estándar con `tabBarBadge` nativo. Es más fácil, pero hay que verificar que el admin también necesite notificaciones.
- **Rendimiento**: `useUnreadNotificationsCountQuery` ya se ejecuta siempre (staleTime 30s). En mobile query constante podría impactar batería/data. Evaluar aumentar staleTime o agregar refetchInterval más espaciado.

## Decisiones del usuario (validado 2026-07-23)

1. ✅ **Admin**: Sí, ambos (admin + usuarios normales) tienen tab de notificaciones en mobile.
2. ✅ **Al tocar**: Marcar como leída Y navegar a la screen relevante según el tipo de notificación.
3. ✅ **Nombre del tab**: "Notificaciones".
4. ✅ **Prioridad**: Secuencial — terminamos mobile support completo antes de arrancar push notifications y flatlist pagination.

## Mapping de navegación por tipo

| Tipo | Screen de destino |
| --- | --- |
| `NEW_USER_REGISTERED` | `AdminUserDetail` (usuario creado) |
| `USER_TEMP_BLOCKED` | `AdminUserDetail` (usuario bloqueado) |
| `USER_BANNED` | `AdminUserDetail` (usuario baneado) |
| `LICENSE_EXPIRING` | `AdminLicenseDetail` |
| `PASSWORD_RESET` | (solo marcar leída — no hay screen post-reset) |
| `EMAIL_VERIFICATION` | (solo marcar leída — no hay screen post-verificación) |

Para PASSWORD_RESET y EMAIL_VERIFICATION el `payload` puede contener userId. Si está presente, se navega a AdminUserDetail. Si no, solo se marca como leída.

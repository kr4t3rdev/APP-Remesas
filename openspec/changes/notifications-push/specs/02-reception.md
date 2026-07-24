# Spec: Recepción de Push Notifications

## Escenario 1: Foreground — App abierta

**Given** la app está en foreground (usuario activo)
**When** llega una push notification
**Then** `expo-notifications` `onNotificationReceived` handler se dispara
**And** NO se muestra el heads-up notification nativo de Android
**And** se actualizan las queries de TanStack Query:
      - `queryClient.invalidateQueries(["notifications", "list"])`
      - `queryClient.invalidateQueries(["notifications", "unreadCount"])`
**And** el badge del tab "Notificaciones" se actualiza automáticamente

## Escenario 2: Background — App en segundo plano

**Given** la app está en background
**When** llega una push notification
**Then** el sistema muestra una notificación nativa en el shade de Android
**And** el badge de la app se actualiza con el `badge` count del payload

## Escenario 3: Tapped — Usuario toca la notificación

**Given** el usuario recibe una push notification
**When** la toca (desde notification shade o banner)
**Then** si la app estaba en background:
      - Se abre la app
      - Navega a `NotificationsScreen` (tab)
**Then** si la app estaba en foreground:
      - Navega a `NotificationsScreen` (tab)

## Escenario 4: Badge count sincronizado

**Given** el badge de la app muestra un conteo
**When** el usuario abre la app y lee todas las notificaciones
**Then** el badge se actualiza a 0 via:
      - `expo-notifications.setBadgeCountAsync(0)`
**And** si llega una push con `unreadCount` en el payload
**Then** `setBadgeCountAsync(unreadCount)`

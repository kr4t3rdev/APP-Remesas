# Spec: NotificationScreen — Screen full-height en mobile

## Escenario 1: Abrir screen de notificaciones

**Given** el usuario está en mobile
**When** toca el tab "Notificaciones" en la bottom bar
**Then** se navega a la screen `NotificationsScreen` dentro del tab navigator
**And** la screen ocupa todo el height disponible (no es un modal overlay)

## Escenario 2: Estados de carga

**Given** el usuario abre la screen de notificaciones
**When** las notificaciones están cargando
**Then** se muestra un `ActivityIndicator` centrado
**And** tiene `testID="notifications-loading"`

**Given** la screen de notificaciones está abierta
**When** ocurre un error en la query
**Then** se muestra texto "No se pudieron cargar las notificaciones." en color danger
**And** tiene `accessibilityRole="alert"`

**Given** la screen de notificaciones está abierta
**When** no hay notificaciones (`data` vacío)
**Then** se muestra texto "No tenés notificaciones nuevas." en color secondary

## Escenario 3: Lista de notificaciones

**Given** hay notificaciones disponibles
**When** se renderiza la screen
**Then** se muestra un `FlatList` con cada notificación
**And** cada ítem tiene: icono, título, mensaje, fecha, y punto rojo si no está leída

## Escenario 4: Marcar como leída al tocar

**Given** una notificación no leída en la lista
**When** el usuario la toca
**Then** se dispara `useMarkNotificationAsReadMutation` con el `id` de la notificación
**And** se navega a la screen correspondiente según el tipo (ver mapping en proposal)
**And** si la navegación no es posible (tipo PASSWORD_RESET sin payload), solo se marca como leída

## Escenario 5: "Leer todas"

**Given** hay al menos una notificación no leída
**When** el usuario toca "Leer todas" en el header de la screen
**Then** se dispara `useMarkAllNotificationsAsReadMutation`
**And** se refrescan las queries de lista y conteo no leído

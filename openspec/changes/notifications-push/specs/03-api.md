# Spec: API — Push Token Endpoint y Envío

## Escenario 1: Registrar push token

**Given** un usuario autenticado
**When** envía `POST /notifications/register-push-token` con body `{ pushToken: "ExponentPushToken[xxx]", platform: "android" }`
**Then** la API responde 201
**And** crea/actualiza un registro en `PushDevice`

## Escenario 2: Envío de push al crear notificación

**Given** el backend crea una notificación de tipo `USER_BANNED`
**When** el canal incluye `PUSH`
**Then** se busca el `PushDevice` del usuario destino
**And** se envía el push via `expo-server-sdk`
**And** el payload incluye: `{ type, title, message, unreadCount, badge }`

## Escenario 3: Push falla (token inválido)

**Given** el `ExpoPushToken` del usuario es inválido/expirado
**When** `expo-server-sdk` responde con error `DeviceNotRegistered`
**Then** la API elimina el `PushDevice` de la DB
**And** la notificación IN_APP se crea igual

## Escenario 4: Push falla (rate limit/network)

**Given** el servicio de Expo Push está temporalmente no disponible
**When** falla el envío de push
**Then** la API loguea el warning
**And** la notificación IN_APP se crea igual (no bloqueante)

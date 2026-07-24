# Spec: Push Notification Token Registration

## Escenario 1: Registro de token al iniciar sesión

**Given** el usuario se autentica exitosamente
**When** la app detecta que hay una sesión activa
**Then** solicita permiso de notificaciones via `expo-notifications`
**And** si el permiso es concedido, solicita `ExpoPushToken`
**And** envía el token a `POST /notifications/register-push-token`
**And** si el permiso es denegado, no se registra token (fallback silencioso)

## Escenario 2: Token existente en API

**Given** el usuario ya tiene un `ExpoPushToken` registrado
**When** la app envía `POST /notifications/register-push-token`
**Then** la API actualiza el `updatedAt` del token existente (no duplica)

## Escenario 3: Token expirado o inválido

**Given** el `ExpoPushToken` del usuario expiró
**When** la app recibe error 400/410 de Expo Push API
**Then** la app solicita un nuevo token
**And** lo re-registra en la API

## Escenario 4: Sin conexión al registrar token

**Given** el usuario está autenticado pero sin conexión a internet
**When** falla `POST /notifications/register-push-token`
**Then** la app reintenta en el próximo `AppState.change` a "active"
**And** no muestra errores al usuario

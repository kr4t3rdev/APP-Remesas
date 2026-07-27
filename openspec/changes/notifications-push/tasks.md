# Tasks: Push Notifications

## Estimación

~350-450 líneas totales (repartidas entre APP y API). Como involucra dos repos, corresponde un PR por repo con su propio presupuesto.

## Tareas frontend (APP)

### APP-T001 — Instalar expo-notifications y configurar app.json

**Archivos**: `package.json`, `app.json`

**Descripción**:

- Agregar `expo-notifications` a dependencies.
- Agregar plugin `expo-notifications` en `app.json`.

**Comandos**:

```bash
npx expo install expo-notifications
```

**Checklist**:

- [x] `expo-notifications` en package.json
- [x] Plugin `"expo-notifications"` en app.json plugins array
- [x] No se rompe `npx expo start`

### APP-T002 — Crear servicio pushNotifications.ts

**Archivos**: `src/services/pushNotifications.ts` (NUEVO)

**Descripción**: Servicio que inicializa `expo-notifications`, configura el handler de foreground (sin heads-up), crea el canal de Android, y exporta `getExpoPushToken()`.

**Checklist**:

- [x] `setNotificationHandler` configurado (shouldShowAlert: false)
- [x] Canal "default" de Android creado con importance HIGH
- [x] `getExpoPushToken()` maneja permiso concedido/denegado
- [x] Retorna `null` si permiso denegado (fallback silencioso)

### APP-T003 — Crear hook usePushTokenRegistration

**Archivos**: `src/modules/notifications/application/usePushTokenRegistration.ts` (NUEVO)

**Descripción**: Mutation que envía el push token al backend.

**DTO**:

```typescript
{ pushToken: string; platform: "android" | "ios" }
```

**Checklist**:

- [x] `useMutation` con `api.post("/notifications/register-push-token", ...)`
- [x] Retry: 2 intentos
- [x] No requiere invalidación de queries

### APP-T004 — Crear hook usePushNotificationHandler

**Archivos**: `src/hooks/usePushNotificationHandler.ts` (NUEVO)

**Descripción**: Hook global que orquesta:

- Registro de push token al autenticarse.
- Listener de foreground → invalidar queries.
- Listener de tapped → navegar a NotificationsScreen.
- Reintento de registro al volver de background.

**Checklist**:

- [x] `getExpoPushToken()` solo si `isAuthenticated`
- [x] `addNotificationReceivedListener` → invalidateQueries(["notifications"])
- [x] `addNotificationResponseReceivedListener` → navega a "Notifications"
- [x] `AppState` listener para retry
- [x] No memory leaks (remover listeners en cleanup)

### APP-T005 — Montar usePushNotificationHandler en root

**Archivos**: `App.tsx` (o layout root equivalente)

**Descripción**: Agregar `usePushNotificationHandler()` en el componente raíz.

**Checklist**:

- [x] Hook montado en el componente correcto
- [x] Se ejecuta una vez al iniciar la app

### APP-T006 — Badge count en NotificationsScreen

**Archivos**: `src/screens/notifications/NotificationsScreen.tsx`

**Descripción**: Al abrir la screen de notificaciones, resetear el badge de la app a 0.

**Checklist**:

- [x] `Notifications.setBadgeCountAsync(0)` al montar la screen
- [x] No rompe el renderizado existente

### APP-T007 — Verificación y smoke test

**Descripción**:

- `npx tsc --noEmit` sin errores nuevos.
- La app compila y arranca.

## Tareas backend (API)

### API-T001 — Agregar PushDevice model y PUSH enum a Prisma

**Archivos**: `prisma/schema.prisma`, migración

**Descripción**:

- Agregar `PUSH` a `NotificationChannel`.
- Crear modelo `PushDevice`.

**Checklist**:

- [x] Enum actualizado
- [x] Modelo PushDevice con campos: id, userId, pushToken, platform, createdAt, updatedAt
- [x] Unique constraint en `[userId, pushToken]`
- [x] Migración aplicada (`npx prisma migrate dev`)

### API-T002 — Instalar expo-server-sdk

**Comando**:

```bash
npm install expo-server-sdk
```

**Checklist**:

- [x] `expo-server-sdk` en package.json

### API-T003 — Crear PushNotificationsService

**Archivos**: `src/notifications/push-notifications.service.ts` (NUEVO)

**Descripción**:

- `upsertDevice(userId, dto)` — upsert de PushDevice.
- `sendPushToUser(userId, notification)` — enviar push via Expo SDK.
- Manejar `DeviceNotRegistered` → eliminar dispositivo.
- Fire-and-forget (no bloqueante).

**Checklist**:

- [x] `upsertDevice` funciona (crea y actualiza)
- [x] `sendPushToUser` busca devices del userId
- [x] `sendPushToUser` chunkea y envía
- [x] `handleReceipts` detecta DeviceNotRegistered y elimina
- [x] Errores logueados con logger.warn

### API-T004 — Endpoint POST /register-push-token

**Archivos**: `src/notifications/notifications.controller.ts`, `src/notifications/dto/register-push-token.dto.ts` (NUEVO)

**DTO**:

```typescript
class RegisterPushTokenDto {
  @IsString()
  pushToken: string;

  @IsString()
  @IsIn(["android", "ios"])
  platform: string;
}
```

**Checklist**:

- [x] Endpoint POST protegido con JwtAuthGuard
- [x] DTO validado con class-validator
- [x] Responde 201

### API-T005 — Extender notifyMixed para enviar push

**Archivos**: `src/notifications/notifications.service.ts`

**Descripción**: En `notifyMixed`, cuando el canal incluye `PUSH`, enviar push via `PushNotificationsService.sendPushToUser`.

**Checklist**:

- [x] Push enviado después de crear IN_APP
- [x] Fire-and-forget (no await, catch errors)
- [x] No bloquea la creación de la notificación IN_APP

### API-T006 — Registrar PushNotificationsService en el módulo

**Archivos**: `src/notifications/notifications.module.ts`

**Checklist**:

- [x] `PushNotificationsService` en `providers`
- [x] Exportado si es necesario

### API-T007 — Verificación

**Descripción**:

- `npx prisma generate`
- `npx jest src/notifications/` sin regresiones
- `npm run build` sin errores

## Orden de implementación

```text
API-T001 (schema + migration)
  ↓
API-T002 (expo-server-sdk)
  ↓
API-T003 (push service)
  ↓
API-T004 (endpoint)
  ↓
API-T005 + API-T006 (extender notifyMixed + module)
  ↓
API-T007 (verify)
-----------
APP-T001 (expo-notifications install)
  ↓
APP-T002 (push service)
  ↓
APP-T003 (usePushTokenRegistration hook)
  ↓
APP-T004 (usePushNotificationHandler)
  ↓
APP-T005 (montar en root)
  ↓
APP-T006 (badge en screen)
  ↓
APP-T007 (verify)
```

Se puede implementar API y APP en paralelo (son independientes excepto por el contrato del DTO).

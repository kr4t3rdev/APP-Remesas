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

- [ ] `expo-notifications` en package.json
- [ ] Plugin `"expo-notifications"` en app.json plugins array
- [ ] No se rompe `npx expo start`

### APP-T002 — Crear servicio pushNotifications.ts

**Archivos**: `src/services/pushNotifications.ts` (NUEVO)

**Descripción**: Servicio que inicializa `expo-notifications`, configura el handler de foreground (sin heads-up), crea el canal de Android, y exporta `getExpoPushToken()`.

**Checklist**:

- [ ] `setNotificationHandler` configurado (shouldShowAlert: false)
- [ ] Canal "default" de Android creado con importance HIGH
- [ ] `getExpoPushToken()` maneja permiso concedido/denegado
- [ ] Retorna `null` si permiso denegado (fallback silencioso)

### APP-T003 — Crear hook usePushTokenRegistration

**Archivos**: `src/modules/notifications/application/usePushTokenRegistration.ts` (NUEVO)

**Descripción**: Mutation que envía el push token al backend.

**DTO**:

```typescript
{ pushToken: string; platform: "android" | "ios" }
```

**Checklist**:

- [ ] `useMutation` con `api.post("/notifications/register-push-token", ...)`
- [ ] Retry: 2 intentos
- [ ] No requiere invalidación de queries

### APP-T004 — Crear hook usePushNotificationHandler

**Archivos**: `src/hooks/usePushNotificationHandler.ts` (NUEVO)

**Descripción**: Hook global que orquesta:

- Registro de push token al autenticarse.
- Listener de foreground → invalidar queries.
- Listener de tapped → navegar a NotificationsScreen.
- Reintento de registro al volver de background.

**Checklist**:

- [ ] `getExpoPushToken()` solo si `isAuthenticated`
- [ ] `addNotificationReceivedListener` → invalidateQueries(["notifications"])
- [ ] `addNotificationResponseReceivedListener` → navega a "Notifications"
- [ ] `AppState` listener para retry
- [ ] No memory leaks (remover listeners en cleanup)

### APP-T005 — Montar usePushNotificationHandler en root

**Archivos**: `App.tsx` (o layout root equivalente)

**Descripción**: Agregar `usePushNotificationHandler()` en el componente raíz.

**Checklist**:

- [ ] Hook montado en el componente correcto
- [ ] Se ejecuta una vez al iniciar la app

### APP-T006 — Badge count en NotificationsScreen

**Archivos**: `src/screens/notifications/NotificationsScreen.tsx`

**Descripción**: Al abrir la screen de notificaciones, resetear el badge de la app a 0.

**Checklist**:

- [ ] `Notifications.setBadgeCountAsync(0)` al montar la screen
- [ ] No rompe el renderizado existente

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

- [ ] Enum actualizado
- [ ] Modelo PushDevice con campos: id, userId, pushToken, platform, createdAt, updatedAt
- [ ] Unique constraint en `[userId, pushToken]`
- [ ] Migración aplicada (`npx prisma migrate dev`)

### API-T002 — Instalar expo-server-sdk

**Comando**:

```bash
npm install expo-server-sdk
```

**Checklist**:

- [ ] `expo-server-sdk` en package.json

### API-T003 — Crear PushNotificationsService

**Archivos**: `src/notifications/push-notifications.service.ts` (NUEVO)

**Descripción**:

- `upsertDevice(userId, dto)` — upsert de PushDevice.
- `sendPushToUser(userId, notification)` — enviar push via Expo SDK.
- Manejar `DeviceNotRegistered` → eliminar dispositivo.
- Fire-and-forget (no bloqueante).

**Checklist**:

- [ ] `upsertDevice` funciona (crea y actualiza)
- [ ] `sendPushToUser` busca devices del userId
- [ ] `sendPushToUser` chunkea y envía
- [ ] `handleReceipts` detecta DeviceNotRegistered y elimina
- [ ] Errores logueados con logger.warn

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

- [ ] Endpoint POST protegido con JwtAuthGuard
- [ ] DTO validado con class-validator
- [ ] Responde 201

### API-T005 — Extender notifyMixed para enviar push

**Archivos**: `src/notifications/notifications.service.ts`

**Descripción**: En `notifyMixed`, cuando el canal incluye `PUSH`, enviar push via `PushNotificationsService.sendPushToUser`.

**Checklist**:

- [ ] Push enviado después de crear IN_APP
- [ ] Fire-and-forget (no await, catch errors)
- [ ] No bloquea la creación de la notificación IN_APP

### API-T006 — Registrar PushNotificationsService en el módulo

**Archivos**: `src/notifications/notifications.module.ts`

**Checklist**:

- [ ] `PushNotificationsService` en `providers`
- [ ] Exportado si es necesario

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

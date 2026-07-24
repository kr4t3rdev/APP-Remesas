# Proposal: Push Notifications (FCM / APNs)

## Problema

Las notificaciones en la APP se consultan via REST polling cada 30s (staleTime de TanStack Query). Esto significa:

- El usuario no recibe alertas en tiempo real.
- La APP hace polling aunque no haya notificaciones nuevas.
- Cuando la app está en background, no hay forma de notificar al usuario.

## Contexto técnico

### Frontend (APP)

- **Expo managed workflow** con EAS project ID configurado (`b1f45fa9-34eb-4642-aaf4-8dd7303af589`).
- **No tiene `expo-notifications`** instalado ni configurado.
- **app.json** ya tiene `UIBackgroundModes: ["fetch", "remote-notification"]` para iOS.
- Ya existe `NotificationCenter` (desktop modal) y `NotificationsScreen` (mobile tab).
- Usa `expo-secure-store` para persistencia.

### Backend (API)

- **Módulo `notifications/`** existente con `NotificationsService`.
- Soporta canales: `IN_APP`, `WEBHOOK`, `EMAIL`.
- **No hay soporte para PUSH** todavía (no hay `firebase-admin` ni `expo-server-sdk`).
- **No hay tabla de push tokens** en Prisma schema.
- `NotificationChannel` enum actual: `IN_APP | WEBHOOK | EMAIL`.

## Solución propuesta

### Estrategia: Expo Push Notifications + Expo Server SDK

Usar el sistema de Expo Push Notifications que abstrae FCM (Android) y APNs (iOS) en una API unificada:

- **Frontend**: `expo-notifications` para recibir pushes + registrar token.
- **Backend**: `expo-server-sdk` para enviar pushes desde el servidor.
- **Canal**: 'PUSH' se agrega como nuevo `NotificationChannel`.

### Flujo

```
1. APP inicia → pide permiso de notificaciones (expo-notifications)
2. Obtiene ExpoPushToken → lo envía a API → POST /notifications/register-push-token
3. API almacena token en nueva tabla PushDevice
4. Cuando se genera una notificación (ej: USER_BANNED):
   a. API crea notificacion IN_APP (ya existe)
   b. API envía push via expo-server-sdk al token del usuario
5. APP recibe push en foreground → actualiza badge + refresca queries
6. APP recibe push en background → sistema muestra notificación nativa
```

### Qué incluye

1. **Frontend**:
   - Instalar `expo-notifications`.
   - Configurar handler de notificaciones (foreground, background, tapped).
   - Registrar `ExpoPushToken` al login y al iniciar app.
   - Sincronizar badge con `useUnreadNotificationsCountQuery`.
   - Al tocar una push notification → navegar a `NotificationsScreen`.
   - Enviar token a API.
   - Manejar permiso denegado (fallback silencioso).

2. **API**:
   - Agregar `PUSH` a `NotificationChannel` enum (migración Prisma).
   - Nueva tabla `PushDevice` (userId, pushToken, platform, createdAt).
   - Endpoint `POST /notifications/register-push-token` (protegido).
   - Endpoint `DELETE /notifications/unregister-push-token` (opcional).
   - Instalar `expo-server-sdk`.
   - Extender `notifyMixed` para enviar push cuando el canal lo incluya.
   - Enviar push en las notificaciones existentes (USER_BANNED, LICENSE_EXPIRING, etc.).

3. **Configuración**:
   - EAS config: necesario build con credentials para push notifications.
   - `app.json`: agregar plugin `expo-notifications`.

### Qué NO incluye (postergado)

- Push para web (solo Android + iOS).
- Push personalizados con acción/buttons.
- Segmentación de audiencia por tipo de notificación.
- Analytics de clics en push.

## Impacto

### Frontend (APP)

- `package.json` + `app.json` — agregar `expo-notifications`.
- `src/services/pushNotifications.ts` — **NUEVO**: handler, token registration.
- `src/modules/notifications/application/usePushTokenRegistration.ts` — **NUEVO**: hook + mutation.
- `src/hooks/usePushNotificationHandler.ts` — **NUEVO**: effect para foreground handler.
- `src/screens/notifications/NotificationsScreen.tsx` — actualizar badge al recibir push.

### Backend (API)

- `prisma/schema.prisma` — + `PUSH` enum, + `PushDevice` model.
- Migración Prisma.
- `src/notifications/notifications.service.ts` — + push sending logic.
- `src/notifications/notifications.controller.ts` — + push token endpoints.
- `src/notifications/dto/` — + `RegisterPushTokenDto`.
- `src/notifications/push-notifications.service.ts` — **NUEVO**: wrapper de expo-server-sdk.
- `package.json` — + `expo-server-sdk`.

## Riesgos

- **Permiso denegado**: si el usuario deniega notificaciones, el token nunca se registra. La app debe funcionar igual.
- **Rate limiting de Expo**: Expo Push API tiene rate limits. Si el sistema envía muchas notificaciones, puede haber delays.
- **EAS Build**: los cambios en app.json requieren un nuevo build de development client para probar en físico.
- **iOS capabilities**: hay que habilitar Push Notifications en el Apple Developer portal y asociarlo al bundle ID.
- **Android channels**: Android 8+ requiere notification channels configurados. `expo-notifications` los maneja por defecto pero hay que personalizar el channel ID.

## Decisiones del usuario (validado 2026-07-23)

1. ✅ **Badge**: ambas — notificar + actualizar badge.
2. ✅ **Tipos**: todos los tipos de notificación existentes.
3. ✅ **Provider**: Expo Push Notifications (`expo-notifications` + `expo-server-sdk`).
4. ✅ **iOS**: postergado — solo Android por ahora (no hay cuenta Apple Developer configurada).

### Implicaciones

- iOS push queda fuera de alcance. `expo-notifications` en Android funciona sin cuenta Apple.
- Los handlers de foreground/background en iOS se pueden codificar pero no probar.
- El bundle ID de iOS (`com.cashflow.app`) ya está configurado pero sin push capabilities activas.
- El `remote-notification` en UIBackgroundModes de iOS queda por compatibilidad futura.

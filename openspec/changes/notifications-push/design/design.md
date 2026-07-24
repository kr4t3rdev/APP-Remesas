# Design: Push Notifications

## Arquitectura general

```
[Expo Push API]
     ↑ expo-server-sdk
     ↓
[API NestJS]
  ├── PushNotificationsService (nuevo)
  ├── NotificationsService (extendido)
  └── PushDevice model (nuevo)

[Expo Push API]
     ↑ expo-notifications
     ↓
[APP React Native]
  ├── pushNotifications.service.ts (nuevo)
  ├── usePushTokenRegistration.ts (nuevo)
  ├── usePushNotificationHandler.ts (nuevo)
  └── NotificationsScreen / NotificationCenter (existentes)
```

## Frontend (APP) — Diseño de componentes

### 1. `src/services/pushNotifications.ts` — Servicio de push

**Responsabilidad**: Inicializar `expo-notifications`, configurar handlers, obtener token.

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configurar handler de foreground: NO mostrar heads-up nativo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,      // nosotros manejamos el UI
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: false,     // no heads-up en Android
    shouldShowList: false,
  }),
});

// Configurar canal de Android (Android 8+)
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Notificaciones",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 100, 50, 100],
    lightColor: "#0ea5e9",
  });
}

export async function getExpoPushToken(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: "b1f45fa9-34eb-4642-aaf4-8dd7303af589", // EAS project ID
  });
  return tokenData.data;
}
```

### 2. `src/modules/notifications/application/usePushTokenRegistration.ts`

**Responsabilidad**: Hook que registra el token en la API.

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../services/api";

export function usePushTokenRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pushToken: string) =>
      api.post("/notifications/register-push-token", {
        pushToken,
        platform: Platform.OS, // "android" | "ios"
      }),
    retry: 2,
  });
}
```

### 3. `src/hooks/usePushNotificationHandler.ts`

**Responsabilidad**: Hook de efecto que se monta al inicio de la app. Maneja:

- Registro de token al autenticarse.
- Listener de notificaciones en foreground → refrescar queries.
- Listener de "tapped" → navegar a NotificationsScreen.
- Reintento de registro cuando la app vuelve a foreground.

```typescript
export function usePushNotificationHandler() {
  const { isAuthenticated } = useAuthStore();
  const navigation = useNavigation();
  const registerToken = usePushTokenRegistration();

  // 1. Registrar token cuando el usuario está autenticado
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const token = await getExpoPushToken();
      if (token) registerToken.mutate(token);
    })();
  }, [isAuthenticated]);

  // 2. Escuchar notificaciones en foreground
  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(() => {
      // Refrescar queries de notificaciones
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });
    return () => sub.remove();
  }, []);

  // 3. Escuchar tapped → navegar a Notifications
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      navigation.navigate("Notifications");
    });
    return () => sub.remove();
  }, []);

  // 4. Reintentar registro al volver de background
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && isAuthenticated) {
        // Reintento silencioso
      }
    });
    return () => sub.remove();
  }, []);
}
```

### 4. Integración en App.tsx

```typescript
// App.tsx (o layout root)
const App: React.FC = () => {
  usePushNotificationHandler(); // <-- mount global handler

  return <AppNavigator />;
};
```

### 5. Badge count en NotificationsScreen

```typescript
import * as Notifications from "expo-notifications";

// Al abrir NotificationsScreen:
Notifications.setBadgeCountAsync(0);

// Al recibir push con unreadCount en payload:
Notifications.setBadgeCountAsync(notification.request.content.data.unreadCount);
```

## Backend (API) — Diseño de componentes

### 1. Prisma Schema

```prisma
enum NotificationChannel {
  IN_APP
  WEBHOOK
  EMAIL
  PUSH        // NUEVO
}

model PushDevice {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  pushToken String
  platform  String   // "android" | "ios"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, pushToken])
  @@index([pushToken])
}
```

### 2. `POST /notifications/register-push-token`

```typescript
@Post('register-push-token')
registerPushToken(
  @CurrentUser('id') userId: number,
  @Body() dto: RegisterPushTokenDto,
) {
  return this.pushNotificationsService.upsertDevice(userId, dto);
}
```

### 3. `PushNotificationsService`

```typescript
@Injectable()
export class PushNotificationsService {
  private expo: Expo;

  constructor(private prisma: PrismaService) {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  async upsertDevice(userId: number, dto: RegisterPushTokenDto) {
    return this.prisma.pushDevice.upsert({
      where: { userId_pushToken: { userId, pushToken: dto.pushToken } },
      update: { platform: dto.platform, updatedAt: new Date() },
      create: { userId, pushToken: dto.pushToken, platform: dto.platform },
    });
  }

  async sendPushToUser(userId: number, notification: { title: string; message: string; data?: Record<string, unknown> }) {
    const devices = await this.prisma.pushDevice.findMany({ where: { userId } });
    if (!devices.length) return;

    const messages = devices.map((device) => ({
      to: device.pushToken,
      title: notification.title,
      body: notification.message,
      data: { ...notification.data, unreadCount: undefined }, // se calcula abajo
      badge: 1, // se puede mejorar
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        const receipts = await this.expo.sendPushNotificationsAsync(chunk);
        // Procesar receipts para detectar DeviceNotRegistered
        await this.handleReceipts(devices, receipts);
      } catch (error) {
        this.logger.warn(`Push send failed: ${error.message}`);
      }
    }
  }
}
```

### 4. Extender `NotificationsService.notifyMixed`

Agregar `PUSH` al switch de canales en `notifyMixed`:

```typescript
// En notifyMixed, después de crear IN_APP:
if (channels.includes('PUSH') && params.userId) {
  // No await — fire and forget
  this.pushNotificationsService.sendPushToUser(params.userId, {
    title: params.title,
    message: params.message,
    data: { type: params.type, ...(params.payload as object) },
  }).catch((err) => this.logger.warn(`Push send error: ${err.message}`));
}
```

## Secuencia completa

```
APP inicia
  → usePushNotificationHandler
    → getExpoPushToken()
      → Permiso concedido? → Notifications.getExpoPushTokenAsync()
      → POST /register-push-token
      → API upsert PushDevice

Evento: USER_BANNED
  → Backend crea notificación IN_APP
  → Backend envía push (fire-and-forget)
    → Expo Push API → Android device
  → APP en foreground
    → onNotificationReceived → invalidateQueries
    → NotificationList se refresca
  → APP en background
    → Notificación nativa en shade
    → Usuario tapa → abre app → NotificationsScreen
```

## Archivos afectados

### APP

| Archivo | Cambio |
| --- | --- |
| `package.json` | + `expo-notifications` |
| `app.json` | + `expo-notifications` plugin |
| `src/services/pushNotifications.ts` | **NUEVO**: init, permissions, token |
| `src/modules/notifications/application/usePushTokenRegistration.ts` | **NUEVO**: mutation |
| `src/hooks/usePushNotificationHandler.ts` | **NUEVO**: effect global |
| `App.tsx` o root layout | + `usePushNotificationHandler()` |
| `src/screens/notifications/NotificationsScreen.tsx` | + `setBadgeCountAsync(0)` |

### API

| Archivo | Cambio |
| --- | --- |
| `prisma/schema.prisma` | + `PUSH` enum, + `PushDevice` model |
| Migración Prisma | `npx prisma migrate dev --name add-push-device` |
| `package.json` | + `expo-server-sdk` |
| `src/notifications/push-notifications.service.ts` | **NUEVO** |
| `src/notifications/notifications.service.ts` | + push en `notifyMixed` |
| `src/notifications/notifications.module.ts` | + import PushNotificationsService |
| `src/notifications/notifications.controller.ts` | + `POST /register-push-token` |
| `src/notifications/dto/register-push-token.dto.ts` | **NUEVO** |
| `.env` | + `EXPO_ACCESS_TOKEN` (opcional para Expo Push) |

## Consideraciones

- Expo Push funciona **sin token de acceso** para proyectos EAS. `EXPO_ACCESS_TOKEN` es opcional, solo necesario si se quiere mayor rate limit.
- Android no necesita Google Play Services para Expo Push (usa Firebase internamente pero el SDK lo maneja).
- `expo-notifications` en Android requiere compilar con EAS Build (no funciona en Expo Go para push). Development client sí funciona.
- Para probar en desarrollo físico: `eas build --profile development --platform android`.
- El handler de foreground no muestra heads-up para no duplicar con la notificación IN_APP existente.

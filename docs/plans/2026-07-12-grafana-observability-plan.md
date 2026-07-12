# Plan: Observabilidad con Grafana Stack (Prometheus + Loki + Grafana)

## Stack

| Component | Rol | Puerto |
|-----------|-----|--------|
| Grafana | Dashboards unificados | 3000 |
| Prometheus | Métricas (API) | 9090 |
| Loki | Logs (API + APP) | 3100 |
| Promtail | Recolector logs del server (opcional) | - |

---

## Fase 1: Infraestructura (Docker)

**1.1** Crear `docker-compose.yml` con Grafana + Prometheus + Loki

**1.2** Crear `prometheus.yml` con `scrape_configs` apuntando a `host.docker.internal:3001` (API)

**1.3** Configurar Grafana datasources vía `provisioning/datasources/`:
  - Prometheus (URL: http://prometheus:9090)
  - Loki (URL: http://loki:3100)

**1.4** Agregar `docker-compose up -d` como script npm o make target

---

## Fase 2: Backend Express (mock-server/server.js)

**2.1** Agregar dependencias:
  - `prom-client` — métricas Prometheus
  - `winston` + `winston-loki` — logs estructurados a Loki

**2.2** Métricas Prometheus:
  - `http_request_duration_ms` — histograma por method, route, status
  - `http_requests_total` — contador con labels method, route, status
  - Endpoint `GET /metrics` exponiendo métricas
  - `collectDefaultMetrics()` para métricas del sistema (CPU, memoria, event loop)

**2.3** Logs a Loki:
  - Middleware que loggea cada request (method, path, status, duration)
  - Reemplazar `console.error` por `logger.error` en todos los catch
  - Label `app: finance-api`

**2.4** Probar que `/metrics` devuelva texto Prometheus y que Loki reciba logs

---

## Fase 3: Frontend React Native (Expo)

**3.1** Crear `src/services/grafana.ts`:
  - Función `logToLoki(level, message, extra?)`
  - Envía POST directo a `http://<host>:3100/loki/api/v1/push`
  - Stream label `app: finance-mobile`

**3.2** Integrar con `ApiClient` (`src/services/api.ts`):
  - Interceptor de response: loggear errores HTTP (4xx, 5xx)
  - Interceptor de request (opcional): loggear requests lentos (>5s)

**3.3** Logging de eventos clave:
  - Login/register exitoso vs fallido
  - Errores de red (fetch abort, timeout)
  - Errores de validación del lado del cliente
  - Crashes globales (Error boundary o `global.ErrorUtils`)

**3.4** Resolver discovery del host local:
  - iOS: `localhost` o IP local
  - Android emulador: `10.0.2.2`
  - Web: `localhost`
  - Usar constantes de `expo-constants` o `Platform.select`

---

## Fase 4: Dashboards en Grafana

**4.1** Dashboard "API Overview":
  - RPS (requests por segundo)
  - Latencia P50/P95/P99 por endpoint
  - Tasa de error 4xx/5xx
  - Logs recientes desde Loki

**4.2** Dashboard "APP Client":
  - Errores por tipo (red, auth, validación)
  - Logs de la app por nivel (info, warn, error)
  - Timeline de eventos

**4.3** Alertas (opcional):
  - Latencia P99 > 2s
  - Tasa de error > 5%
  - Sin datos de API (API caída)

---

## Fase 5: Delivery Final

**5.1** Verificar que todo el stack funcione junto:
  - API envía métricas a Prometheus
  - APP envía logs a Loki
  - Grafana muestra dashboards con data real

**5.2** Documentar:
  - Cómo levantar el stack (`docker-compose up`)
  - Variables de entorno necesarias
  - Troubleshooting común

**5.3** Agregar a `.gitignore`: directorios de data de Grafana/Prometheus/Loki

---

## Dependencias entre fases

```
Fase 1 (Docker)
  ├── Fase 2 (Backend) — necesita Prometheus + Loki corriendo
  └── Fase 3 (Frontend) — necesita Loki corriendo
        └── Fase 4 (Dashboards) — necesita Fase 2 + 3 funcionales
              └── Fase 5 (Delivery)
```

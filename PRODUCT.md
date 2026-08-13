# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive (React Native + Expo; native iOS/Android primary, web secondary for admin/operator workflows and dev)

## Users

- **Operadores de casa de cambio** (rol `USER`): gestionan transacciones FX, caja, gastos, trabajadores, reportes y objetivos. Trabajan mayormente en móvil (teléfono/tablet) durante operaciones diarias.
- **Administradores** (rol `ADMIN`): supervisan la plataforma multi-tenant — usuarios, licencias, métricas de plataforma, auditoría y acciones de control. Trabajan mayormente en web (desktop) dada la densidad informativa.

## Product Purpose

Cashflow es un sistema de gestión para casas de cambio/remesas: opera transacciones FX multicurrency, lleva caja/bancos, paga a trabajadores con saldos propios, calcula ganancia FX y registros, y genera reportes operativos. La plataforma se licencia a múltiples operadores (multi-tenant). El admin supervisa el estado de licencias, conversión trial→paid, churn, y métricas de facturación.

Success = que un operador cierre el día con los saldos cuadrados y la ganancia real calculada, y que el admin vea la salud del negocio en un vistazo.

## Positioning

Un back-office de casa de cambio que nace móvil y se extiende a web — no una hoja de cálculo adaptada. El saldo del trabajador, la ganancia FX por transacción, y la conversión a CUP con tasas históricas son ciudadanos de primera clase, no reportes después.

## Capabilities

- **FX multicurrency**: transacciones con amount, rate, profit; conversión a CUP con `ExchangeRate.referenceRate` vigente a la fecha.
- **Caja y bancos**: `CashBalance` por `userId + currencyId`; fuentes/destinos de fondos.
- **Trabajadores (workers)**: saldo propio (`WorkerBalance`); agregar saldo, depositar, transacción con ganancia, venta desde el saldo del worker.
- **Gastos**: modelo `Expense` con destino Caja/Cuenta bancaria, conversión a CUP, tracking de no-convertidos.
- **Reportes**: ganancia, flujo de caja, diario, período, con desglose y conversión a CUP.
- **Admin**: KPIs de plataforma, series temporales (billing, newUsers, churn), usuarios bloqueados, licencias por vencer, acciones de control (ban/suspend/temp-block), auditoría.
- **Notificaciones**: push (native) + in-app.
- **6 temas visuales**: ocean (default), emerald, midnight, vault, gold, garnet — cada uno con variante light+dark, persistido en AsyncStorage.

## Constraints

- **Stack**: React Native 0.81 + Expo SDK 54, TypeScript, Metro bundler, Jest + RNTL.
- **State**: TanStack Query (server) + Zustand (local, persistido en AsyncStorage).
- **Navigation**: @react-navigation v7 (native-stack + bottom-tabs); `ResponsiveTabBar` muestra sidebar en web desktop y floating bar en mobile.
- **Backend**: NestJS + Prisma en Railway; deploy automático desde `main` en GitHub. ValidationPipe con `whitelist` + `forbidNonWhitelisted`.
- **Idempotencia**: POST /transactions requiere `Idempotency-Key`.
- **CORS**: `CORS_ORIGINS` configurado en Railway; incluye `http://localhost:8081`, `http://localhost:19006` y la URL de la API.
- **iOS/Android**: los 6 temas deben funcionar nativamente; la web hereda el tema activo.

## Voice

Directo, en español (Cuba), sin rodeos. "Casa de Cambio", no "plataforma financiera". Mensajes de error muestran la causa real del backend, no un genérico.

<!-- inferred from AGENTS.md and repository evidence; confirm with user if stale -->

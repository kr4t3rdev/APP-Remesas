# Graph Report - APP  (2026-08-04)

## Corpus Check
- 422 files · ~257,783 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2368 nodes · 4911 edges · 167 communities (157 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `40e776c4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RegisterScreen.tsx
- useDashboardData.ts
- ObjectivesScreen.tsx
- index.tsx
- useAdminReportsDashboard.ts
- borderRadius
- index.ts
- expo
- Opción B: Mock Backend & Integration Testing - COMPLETE ✅
- dependencies
- useSubscriptions.ts
- Requirement: Modal-Based Feedback
- Requirement: Modal-Based Feedback
- Register Screen Validations - Refactor Complete ✅
- useColors
- useShadows
- Authentication API Endpoints
- ReportsScreen.tsx
- themeStore.ts
- WorkerPaymentsScreen.tsx
- AppNavigator.tsx
- ExpenseItemsScreen.tsx
- Toast.tsx
- api.ts
- useAdminHomeData.ts
- types.ts
- AdminAuditLogScreen.tsx
- AdminHomeEventRow.tsx
- MainTabs.tsx
- AdminReportsScreen
- Integration Testing Guide
- AdminUserDetailScreen.tsx
- AdminTempBlockModal.tsx
- AdminPlanCreateScreen.tsx
- useBankAccounts.ts
- licensesApi.ts
- AdminPlanCreateScreen.tsx
- AdminAuditLogScreen.tsx
- ExchangeRatesScreen.tsx
- Design: Admin Users Unified Flow
- package.json
- 2026-07-10T21-21-58Z__src-screens-home-homescreen-tsx.md
- authStore.ts
- ProfileScreen
- CashRegisterTab.tsx
- server.js
- Proposal: Conectar AdminUsersScreen con AdminUserManagementScreen y Eliminar Alertas
- Design: Currencies Screen Redesign (Viajero Global)
- MODIFIED Requirements
- AdminReportsScreen.tsx
- SuccessModal.tsx
- Design: Admin License Detail View
- Design: Admin Licenses Management
- Design: Admin Subscription Plans Management
- AdminServices.integration.test.tsx
- useReports.ts
- AdminActionConfirmModal.tsx
- AdminPlanCreateScreen.tsx
- Design: Admin User Details Screen
- Design: Admin User Management Screen
- Casa de Cambio - Mobile App
- TabSelector.tsx
- ExpenseDatePicker.tsx
- ExchangeRatesScreen.tsx
- Mock Auth Backend Server
- Requirements
- UI Specification
- scripts
- CashAuditCard.tsx
- DeleteButton.tsx
- Plan: Observabilidad con Grafana Stack (Prometheus + Loki + Grafana)
- Verification Report: admin-users-unified-flow
- Requirement: Use Burnt for Application Alerts
- Requirement: Custom Confirmation Component
- devDependencies
- TransactionModal.tsx
- UserAvatar.tsx
- validators.ts
- Design: Delete Exchange Rate Functionality
- Implementation Progress
- CashFlowCurrencyCards.tsx
- TabSelector.tsx
- TabBarMotionProvider.tsx
- Tasks: Admin Users Unified Flow
- Design: Rediseño de Tarjetas de Exchange Rates
- Exchange Rates Validation Specification
- Tasks: Fix App-Wide Dark Mode
- CashAuditCard.tsx
- CashMovementCard.tsx
- types.ts
- Proposal: Admin License Detail View
- Tasks: Admin License Detail View
- Proposal: Admin Licenses Management
- Tasks: Admin Licenses Management
- Proposal: Admin Subscription Plans Management
- Tasks: Admin Subscription Plans Management
- Proposal: Admin User Details Screen
- Tasks: Admin User Details Screen
- Proposal: Admin User Management Screen
- Tasks: Admin User Management Screen
- AdminHomeEventRow.tsx
- useCurrencies.ts
- profile.repository.ts
- tabBarScreenIntegration.test.ts
- AdminExportReportsScreen.tsx
- fix-alerts.js
- fix_isdark_colors.js
- fix-screens-confirm.js
- metro.config.js
- Proposal: Fix Plans API Integration
- Proposal: Fix Services Dark Mode
- Proposal: Replace React Native Alerts with Burnt Toasts/Alerts
- Proposal: Replace Native Alerts with Custom Confirmation Modal
- package.json
- replace-alerts.js
- AdminSuspendSuccessModal.tsx
- FadeIn
- authStore.ts
- AdminLicensesListScreen.tsx
- useSubscriptions.ts
- ActionGridItem.tsx
- Card.tsx
- fix_auth_colors.js
- fix_auth_colors2.js
- fix_auth_colors3.js
- fix_auth_colors4.js
- fix_auth_colors5.js
- fix_auth_colors6.js
- fix_auth_colors7.js
- fix_hardcoded_colors_smart.js
- replace_hardcoded_colors.js
- replace_hardcoded_colors2.js
- AdminReportsPeriodSegment.tsx
- ObjectiveProgressRing.tsx
- AdminHomeHeroCard.tsx
- AdminReportsCashFlowCard.tsx
- tsconfig.json
- fix_static_colors.js
- AdminReportsUsersGrowthCard.tsx
- proMax.ts
- SuccessModal.tsx
- fx-trading-remittances.spec.ts
- ObjectiveProgressRing.tsx
- AdminTempBlockModal.tsx
- AdminResetPasswordSuccessModal.tsx
- currencyFlags.ts
- AdminChangePasswordSuccessModal.tsx
- EmailVerifiedScreen.tsx
- HomeScreen.test.tsx
- GradientCard.tsx
- useShadows
- AdminReportsPeriodSegment.tsx
- transactionsHeaderLayout.ts

## God Nodes (most connected - your core abstractions)
1. `useColors()` - 230 edges
2. `spacing` - 94 edges
3. `borderRadius` - 83 edges
4. `useShadows()` - 69 edges
5. `Alert` - 43 edges
6. `FadeInDown()` - 38 edges
7. `api` - 37 edges
8. `Button()` - 27 edges
9. `Input()` - 26 edges
10. `queryKeys` - 26 edges

## Surprising Connections (you probably didn't know these)
- `AdminUserDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/admin/AdminUserDetailModal.tsx → package.json
- `buildWrapper()` --references--> `react`  [EXTRACTED]
  src/modules/notifications/application/useNotifications.test.tsx → package.json
- `withQueryClient()` --references--> `react`  [EXTRACTED]
  src/modules/notifications/application/usePushTokenRegistration.test.tsx → package.json
- `Harness()` --references--> `react`  [EXTRACTED]
  src/hooks/usePushNotificationHandler.test.tsx → package.json
- `withQueryClient()` --references--> `react`  [EXTRACTED]
  src/hooks/usePushNotificationHandler.test.tsx → package.json

## Import Cycles
- None detected.

## Communities (167 total, 10 thin omitted)

### Community 0 - "RegisterScreen.tsx"
Cohesion: 0.07
Nodes (38): styles, TransactionItem(), TransactionItemProps, WorkerExpandableRow(), WorkerExpandableRowProps, mockedRepository, useAddBalanceMutation(), useCreateTransactionMutation() (+30 more)

### Community 1 - "useDashboardData.ts"
Cohesion: 0.10
Nodes (28): ExpenseAmountInput(), ExpenseAmountInputProps, styles, ObjectiveFormModal(), ObjectiveFormModalProps, styles, ObjectiveStatusPicker(), ObjectiveStatusPickerProps (+20 more)

### Community 2 - "ObjectivesScreen.tsx"
Cohesion: 0.10
Nodes (19): API-T001 — Agregar PushDevice model y PUSH enum a Prisma, API-T002 — Instalar expo-server-sdk, API-T003 — Crear PushNotificationsService, API-T004 — Endpoint POST /register-push-token, API-T005 — Extender notifyMixed para enviar push, API-T006 — Registrar PushNotificationsService en el módulo, API-T007 — Verificación, APP-T001 — Instalar expo-notifications y configurar app.json (+11 more)

### Community 3 - "index.tsx"
Cohesion: 0.05
Nodes (62): OpenPositionModal(), OpenPositionModalProps, styles, AccountOption, styles, TransactionModal(), TransactionModalProps, businessKeys (+54 more)

### Community 4 - "useAdminReportsDashboard.ts"
Cohesion: 0.24
Nodes (10): getReportRangeError(), isReportRangeValid(), useReportsCashBalancesQuery(), useReportsDailyReportQuery(), ReportCardData, ReportsScreen(), ReportType, styles (+2 more)

### Community 5 - "borderRadius"
Cohesion: 0.08
Nodes (34): AdminUserDetailModal(), AdminUserDetailModalProps, styles, createStyles(), UserActionConfirmModal(), UserActionConfirmModalProps, ChangePasswordModal(), ChangePasswordModalProps (+26 more)

### Community 6 - "index.ts"
Cohesion: 0.08
Nodes (31): currenciesRepository, exchangeRatesRepository, ExchangeRatesResponse, AccountReportItem, AccountsReport, AdminNotificationEvent, AuditSummaryReport, CashOverviewMovement (+23 more)

### Community 7 - "expo"
Cohesion: 0.06
Nodes (35): backgroundColor, foregroundImage, adaptiveIcon, edgeToEdgeEnabled, package, permissions, versionCode, projectId (+27 more)

### Community 8 - "Opción B: Mock Backend & Integration Testing - COMPLETE ✅"
Cohesion: 0.06
Nodes (34): 1. Mock Backend Server, 2. useDebounce Hook, 3. Integration Tests, 4. Documentation, App Not Connecting to Mock Server, Architecture, Debouncing Impact, Documentation (+26 more)

### Community 9 - "dependencies"
Cohesion: 0.06
Nodes (35): dependencies, clsx, date-fns, expo, expo-blur, expo-device, expo-font, expo-image-picker (+27 more)

### Community 10 - "useSubscriptions.ts"
Cohesion: 0.10
Nodes (26): useSidebarSync(), getFintechTabBarStyle(), ACTIVE_INDICATOR_GEOMETRY, InstagramTabBar(), isEmphasizedRoute(), styles, TAB_BAR_BLUR, TAB_BAR_EMPHASIS_MOTION (+18 more)

### Community 11 - "Requirement: Modal-Based Feedback"
Cohesion: 0.07
Nodes (28): Admin Users Specification, Components, Data Models, LicenseUserDetail, Purpose, Requirement: Consistency Between Screens, Requirement: Modal-Based Feedback, Requirement: Optional LicenseId Support (+20 more)

### Community 12 - "Requirement: Modal-Based Feedback"
Cohesion: 0.07
Nodes (28): Admin Users Specification, Components, Data Models, LicenseUserDetail, Purpose, Requirement: Consistency Between Screens, Requirement: Modal-Based Feedback, Requirement: Optional LicenseId Support (+20 more)

### Community 13 - "Register Screen Validations - Refactor Complete ✅"
Cohesion: 0.07
Nodes (28): 1. Client-Side Validation, 1. POST /auth/register, 2. GET /auth/check-email?email=..., 2. Real-Time Async Validation, 3. GET /auth/check-nickname?nickname=..., 3. Separated Concerns, 4. Better Error Messages, 5. Documentation (+20 more)

### Community 14 - "useColors"
Cohesion: 0.10
Nodes (22): AnimatedCircle, BarChartProps, BarItem(), BarItemProps, CircularProgress(), CircularProgressProps, clamp(), DonutChartProps (+14 more)

### Community 15 - "useShadows"
Cohesion: 0.11
Nodes (18): 1. Prisma Schema, 1. `src/services/pushNotifications.ts` — Servicio de push, 2. `POST /notifications/register-push-token`, 2. `src/modules/notifications/application/usePushTokenRegistration.ts`, 3. `PushNotificationsService`, 3. `src/hooks/usePushNotificationHandler.ts`, 4. Extender `NotificationsService.notifyMixed`, 4. Integración en App.tsx (+10 more)

### Community 16 - "Authentication API Endpoints"
Cohesion: 0.07
Nodes (27): Authentication API Endpoints, Backend Implementation Notes, Backend Implementation Notes, Backend Validations Required, Common Status Codes, Email Check Flow, Error Handling, Example Request (+19 more)

### Community 17 - "ReportsScreen.tsx"
Cohesion: 0.14
Nodes (17): useBankAccountsQuery(), useCreateBankAccountMutation(), useDeleteBankAccountMutation(), useUpdateBankAccountMutation(), useRegisterSubscriptionPaymentMutation(), AdminCashScreen(), createStyles(), mockUseBankAccountsQuery (+9 more)

### Community 18 - "themeStore.ts"
Cohesion: 0.11
Nodes (17): 1. `NotificationsScreen` (nuevo), 2. `useNotificationNavigation` (nuevo hook), 3. Refactor `NotificationCenter` (existente), 4. Badge en InstagramTabBar, 5. Badge en AdminTabs, Archivos afectados (resumen), Component Hierarchy, Config de navegación (+9 more)

### Community 19 - "WorkerPaymentsScreen.tsx"
Cohesion: 0.08
Nodes (23): Accessibility, Animation strategy, Components, Content integration, Current Context, Definition of Done, Expanded state, Goal (+15 more)

### Community 20 - "AppNavigator.tsx"
Cohesion: 0.08
Nodes (30): createStyles(), formatActionName(), getActionColor(), getActionIcon(), ReportsAuditLogList(), ReportsAuditLogListProps, BlockedUser, createStyles() (+22 more)

### Community 21 - "ExpenseItemsScreen.tsx"
Cohesion: 0.16
Nodes (14): plansApi, AdminHeader(), AdminHeaderProps, getInitials(), Stack, AdminPlanCreateScreen(), ICONS, styles (+6 more)

### Community 22 - "Toast.tsx"
Cohesion: 0.11
Nodes (15): cashRepository, mockedApi, notificationsRepository, mockedApi, api, RequestConfig, checkEmailExists(), checkNicknameExists() (+7 more)

### Community 23 - "api.ts"
Cohesion: 0.09
Nodes (18): mockMetrics, ActionTile(), Props, styles, BottomNav(), Props, styles, GradientCard() (+10 more)

### Community 24 - "useAdminHomeData.ts"
Cohesion: 0.27
Nodes (9): mockUseWindowDimensions, mockUseWindowDimensions, BreakpointListener, BreakpointNotifier, useBreakpointListener(), useBreakpointNotifier(), Breakpoint, BREAKPOINTS (+1 more)

### Community 25 - "types.ts"
Cohesion: 0.11
Nodes (22): AdminReportsCashFlowCard(), AdminReportsCashFlowCardProps, createStyles(), AdminReportsMetricTile(), AdminReportsMetricTileProps, createStyles(), AdminReportsPeriodSegment(), AdminReportsPeriodSegmentProps (+14 more)

### Community 26 - "AdminAuditLogScreen.tsx"
Cohesion: 0.13
Nodes (19): AdminResetPasswordModal(), AdminResetPasswordModalProps, styles, AdminResetPasswordSuccessModal(), AdminResetPasswordSuccessModalProps, styles, mockUser, DeleteButton() (+11 more)

### Community 27 - "AdminHomeEventRow.tsx"
Cohesion: 0.09
Nodes (31): LoadingDots(), BarChart(), DonutChart(), NotificationCenter(), useCashOverviewQuery(), useCreateCashAdjustmentMutation(), useCreateCashAuditMutation(), useCurrenciesQuery() (+23 more)

### Community 28 - "MainTabs.tsx"
Cohesion: 0.15
Nodes (7): BankAccountBalance, bankAccountsRepository, BankAccountTransactions, CreateBankAccountDto, UpdateBankAccountDto, profileRepository, BankAccount

### Community 29 - "AdminReportsScreen"
Cohesion: 0.12
Nodes (16): Backend (API), Backend (API), Contexto técnico, Decisiones del usuario (validado 2026-07-23), Estrategia: Expo Push Notifications + Expo Server SDK, Flujo, Frontend (APP), Frontend (APP) (+8 more)

### Community 30 - "Integration Testing Guide"
Cohesion: 0.10
Nodes (19): Check Email, Check Nickname, Debounce Hook, E2E Tests with Mock Server, File Structure, Integration Testing Guide, Integration Tests, Key Features (+11 more)

### Community 31 - "AdminUserDetailScreen.tsx"
Cohesion: 0.17
Nodes (18): mockedRepository, useActiveObjectives(), useCashBalances(), useDailyReport(), useDashboardData(), useExchangeRates(), useRecentExpenses(), useRecentTransactions() (+10 more)

### Community 32 - "AdminTempBlockModal.tsx"
Cohesion: 0.13
Nodes (21): useAdminPlatformSeriesQuery(), AdminReportsDashboardVM, AdminReportsPeriod, buildMetricTiles(), buildPlatformBars(), buildPlatformModel(), buildSystemUsageRows(), buildTrend() (+13 more)

### Community 33 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.08
Nodes (31): RFC-5322, AuthCard(), AuthCardProps, styles, AuthWrapper(), AuthWrapperProps, createStyles(), BrandingPanel() (+23 more)

### Community 34 - "useBankAccounts.ts"
Cohesion: 0.21
Nodes (10): ConfirmModal(), ConfirmModalProps, styles, useCurrentExchangeRatesQuery(), styles, TabType, ProfileFeatureBackButton(), styles (+2 more)

### Community 35 - "licensesApi.ts"
Cohesion: 0.15
Nodes (8): uploadApi, UploadResponse, API_CONFIG, CURRENCY_CONFIG, ENV, STORAGE_KEYS, AuthState, AuthResponse

### Community 36 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.12
Nodes (17): AdminHomeHeroCard(), AdminHomeHeroCardProps, styles, StaggerList(), AdminRoutes(), AdminTabs(), Tab, AdminTabParamList (+9 more)

### Community 37 - "AdminAuditLogScreen.tsx"
Cohesion: 0.16
Nodes (14): AssignLicensePayload, BackendUserLicense, BillingCycle, licensesApi, AssignLicenseModal(), AssignLicenseModalProps, BILLING_CYCLES, createStyles() (+6 more)

### Community 38 - "ExchangeRatesScreen.tsx"
Cohesion: 0.13
Nodes (14): Alcance, Contexto técnico, Decisiones del usuario (validado 2026-07-23), Decisión: Opción A (tab dedicada), Impacto, Incluye, Mapping de navegación por tipo, No incluye (postergado) (+6 more)

### Community 39 - "Design: Admin Users Unified Flow"
Cohesion: 0.12
Nodes (16): Architecture Decisions, Data Flow, Decision: Alert.alert Replacement Locations, Decision: Data Source Selection, Decision: Modal Component Strategy, Decision: Optional LicenseId Parameter, Design: Admin Users Unified Flow, File Changes (+8 more)

### Community 40 - "package.json"
Cohesion: 0.13
Nodes (14): author, dependencies, body-parser, cors, express, description, keywords, license (+6 more)

### Community 41 - "2026-07-10T21-21-58Z__src-screens-home-homescreen-tsx.md"
Cohesion: 0.14
Nodes (13): Anti-Patterns Verdict, Design Health Score, Minor Observations, Overall Impression, [P1] Data failures are hidden, [P1] No hierarchy of importance, [P2] Controls lack action and accessibility semantics, [P2] Generated visual patterns weaken credibility (+5 more)

### Community 42 - "authStore.ts"
Cohesion: 0.13
Nodes (16): AppLogo(), AppLogoProps, Header(), HeaderProps, styles, ResponsiveContainer(), ResponsiveContainerProps, ResponsiveGrid() (+8 more)

### Community 43 - "ProfileScreen"
Cohesion: 0.09
Nodes (22): AGENTS.md — App Finance APP, Bug resuelto 2026-07-21 — "No se pudo agregar saldo al trabajador", Codebase Knowledge Graph (codebase-memory-mcp), Configuración del entorno opencode, Diagnóstico root cause, E4/E5-follow-up: endpoint admin platform-series, Errores NUEVOS detectados en verificación, Errores que COINCIDEN con el análisis previo (+14 more)

### Community 44 - "CashRegisterTab.tsx"
Cohesion: 0.14
Nodes (16): ObjectiveCard(), ObjectiveCardProps, STATUS_COLORS, styles, Badge(), BadgeProps, BadgeVariant, getVariantStyles() (+8 more)

### Community 45 - "server.js"
Cohesion: 0.15
Nodes (7): app, bodyParser, cors, express, registeredEmails, registeredNicknames, users

### Community 46 - "Proposal: Conectar AdminUsersScreen con AdminUserManagementScreen y Eliminar Alertas"
Cohesion: 0.15
Nodes (12): 1. Navigation Flow, 2. Eliminar Alert.alert, 3. AdminUserManagementScreen Updates, 4. Components to Create/Modify, Affected Files, Breaking Changes, Goals, Impact Analysis (+4 more)

### Community 47 - "Design: Currencies Screen Redesign (Viajero Global)"
Cohesion: 0.15
Nodes (12): Architecture Decisions, Data Flow, Decision: Componentizing Cards, Decision: Icons and Flags, Decision: Layout Structure, Design: Currencies Screen Redesign (Viajero Global), File Changes, Interfaces / Contracts (+4 more)

### Community 48 - "MODIFIED Requirements"
Cohesion: 0.15
Nodes (12): ADDED Requirements, MODIFIED Requirements, Plan API Specification, REMOVED Requirements, Requirement: Create Plan, Requirement: Delete Plan, Requirement: Fetch Plans, Requirement: Update Plan (+4 more)

### Community 49 - "AdminReportsScreen.tsx"
Cohesion: 0.24
Nodes (10): LicenseSummaryCard(), LicenseSummaryCardProps, styles, LicenseUserRow(), LicenseUserRowProps, styles, styles, LicenseDetail (+2 more)

### Community 50 - "SuccessModal.tsx"
Cohesion: 0.09
Nodes (21): useCreatePlanMutation(), usePlansCatalogQuery(), plansRepository, useAssignLicenseMutation(), useSubscriptionLicensesQuery(), subscriptionsRepository, useOperationalUsersQuery(), usersRepository (+13 more)

### Community 51 - "Design: Admin License Detail View"
Cohesion: 0.17
Nodes (11): Architecture Decisions, Data Flow, Decision: Component Structure, Decision: Data Source, Design: Admin License Detail View, File Changes, Interfaces / Contracts, Open Questions (+3 more)

### Community 52 - "Design: Admin Licenses Management"
Cohesion: 0.17
Nodes (11): Architecture Decisions, Data Flow, Decision: Data Model, Decision: Filter Logic, Design: Admin Licenses Management, File Changes, Interfaces / Contracts, Open Questions (+3 more)

### Community 53 - "Design: Admin Subscription Plans Management"
Cohesion: 0.17
Nodes (11): Architecture Decisions, Data Flow, Decision: Data Model, Decision: Navigation Structure, Design: Admin Subscription Plans Management, File Changes, Interfaces / Contracts, Open Questions (+3 more)

### Community 54 - "AdminServices.integration.test.tsx"
Cohesion: 0.15
Nodes (12): Dependencias entre tareas, Estimación, Resumen de archivos cambiados, T001 — Refactor: extraer NotificationList como shared component, T002 — Crear hook useNotificationNavigation, T003 — Agregar badge support a MainTabDefinition e InstagramTabBar, T004 — Crear NotificationsScreen, T005 — Agregar tab Notificaciones a MainTabs (+4 more)

### Community 55 - "useReports.ts"
Cohesion: 0.25
Nodes (4): bankAccounts, cashBalances, currencies, Route

### Community 56 - "AdminActionConfirmModal.tsx"
Cohesion: 0.22
Nodes (8): mockAlert, mockCreateAdjustment, mockCreateAudit, mockCup, mockNavigate, mockPopulatedOverview, mockRefetch, mockUsd

### Community 57 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.24
Nodes (10): mockedRepository, useReportsAccountsQuery(), useReportsAuditSummaryQuery(), useReportsCashFlowQuery(), useReportsCurrencyQuery(), useReportsExpensesQuery(), useReportsObjectivesQuery(), useReportsPeriodQuery() (+2 more)

### Community 58 - "Design: Admin User Details Screen"
Cohesion: 0.18
Nodes (10): Action Item Prop, Architecture Decisions, Data Flow, Decision: Action Grid, Decision: Theme Colors (Dark/Light), Design: Admin User Details Screen, File Changes, Interfaces / Contracts (+2 more)

### Community 59 - "Design: Admin User Management Screen"
Cohesion: 0.18
Nodes (10): Architecture Decisions, Data Flow, Decision: Components, Decision: Theme, Design: Admin User Management Screen, File Changes, Interfaces / Contracts, Role Badge Colors (+2 more)

### Community 60 - "Casa de Cambio - Mobile App"
Cohesion: 0.18
Nodes (10): API Backend, Arquitectura Actual, Casa de Cambio - Mobile App, Convención para Nuevos Módulos, Diseño y UI, Estructura (resumen), Instalación, Módulos Implementados (+2 more)

### Community 61 - "TabSelector.tsx"
Cohesion: 0.21
Nodes (7): AppRoot(), queryClient, APP_INTRO_MOTION_PROFILE, AppIntroAnimation(), AppIntroAnimationProps, EASE_OUT, styles

### Community 62 - "ExpenseDatePicker.tsx"
Cohesion: 0.29
Nodes (6): DAYS, ExpenseDatePicker(), ExpenseDatePickerProps, { height: SCREEN_HEIGHT }, MONTHS, styles

### Community 63 - "ExchangeRatesScreen.tsx"
Cohesion: 0.16
Nodes (16): mockUseAdminAuditLogsProfileQuery, mockUseAdminStatsQuery, mockUseAuthStore, mockUser, mockUseThemeStore, useAdminAuditLogsProfileQuery(), Navigation, useAdminProfile() (+8 more)

### Community 64 - "Mock Auth Backend Server"
Cohesion: 0.20
Nodes (9): API Endpoints, GET /auth/check-email?email=..., GET /auth/check-nickname?nickname=..., Mock Auth Backend Server, POST /auth/register, Pre-registered Test Data, Quick Start, Use with App Finance (+1 more)

### Community 65 - "Requirements"
Cohesion: 0.20
Nodes (9): Purpose, Requirement: Remove Hardcoded Hex Colors, Requirement: Replace Static Color Imports, Requirement: Update Navigation Elements, Requirements, Scenario: User navigates between tabs in dark mode, Scenario: User toggles dark mode on a screen with static imports, Scenario: User views a component with hardcoded white backgrounds in dark mode (+1 more)

### Community 66 - "UI Specification"
Cohesion: 0.20
Nodes (9): ADDED Requirements, MODIFIED Requirements, REMOVED Requirements, Requirement: Centralized Theme Consumption, Requirement: Dark Mode Styles in Services Screens, Scenario: Displaying Admin Services Screen in Dark Mode, Scenario: Displaying Cards in Dark Mode, Scenario: Switching Themes (+1 more)

### Community 67 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, android, build:web, ios, start, test, test:e2e, test:e2e:list (+2 more)

### Community 68 - "CashAuditCard.tsx"
Cohesion: 0.12
Nodes (18): AppNavigator(), AuthStack, MainStack, MainStackNavigator(), mockCheckAuth, mockUseAuthStore, BusinessWorkersScreen(), NavigationProp (+10 more)

### Community 69 - "DeleteButton.tsx"
Cohesion: 0.20
Nodes (7): useDeleteExchangeRateMutation(), usePairHistoryQuery(), usePairStatsQuery(), useRateHistoryQuery(), useResetRateHistoryMutation(), useUpdateExchangeRateMutation(), ExchangeRatesScreen()

### Community 70 - "Plan: Observabilidad con Grafana Stack (Prometheus + Loki + Grafana)"
Cohesion: 0.22
Nodes (8): Dependencias entre fases, Fase 1: Infraestructura (Docker), Fase 2: Backend Express (mock-server/server.js), Fase 3: Frontend React Native (Expo), Fase 4: Dashboards en Grafana, Fase 5: Delivery Final, Plan: Observabilidad con Grafana Stack (Prometheus + Loki + Grafana), Stack

### Community 71 - "Verification Report: admin-users-unified-flow"
Cohesion: 0.22
Nodes (8): Build & Tests Execution, Coherence (Design), Completeness, Correctness (Static — Structural Evidence), Issues Found, Spec Compliance Matrix, Verdict, Verification Report: admin-users-unified-flow

### Community 72 - "Requirement: Use Burnt for Application Alerts"
Cohesion: 0.22
Nodes (8): Purpose, Requirement: Interactive Alerts (Confirmations), Requirement: Use Burnt for Application Alerts, Requirements, Scenario: Deleting an Item, Scenario: Displaying a Success Alert, Scenario: Displaying an Error Alert, UI Specification: Burnt Alerts

### Community 73 - "Requirement: Custom Confirmation Component"
Cohesion: 0.22
Nodes (8): ADDED Requirements, Delta for UI: Custom Confirmation Modal, MODIFIED Requirements, Requirement: Custom Confirmation Component, Requirement: Interactive Alerts Handling, Scenario: Canceling an Action, Scenario: Confirming an Action, Scenario: Displaying a Destructive Confirmation

### Community 74 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, babel-preset-expo, jest, jest-expo, @playwright/test, react-test-renderer, @testing-library/react-native, @types/jest (+2 more)

### Community 75 - "TransactionModal.tsx"
Cohesion: 0.25
Nodes (7): Escenario 1: NEW_USER_REGISTERED → AdminUserDetail, Escenario 2: USER_TEMP_BLOCKED / USER_BANNED → AdminUserDetail, Escenario 3: LICENSE_EXPIRING → AdminLicenseDetail, Escenario 4: PASSWORD_RESET / EMAIL_VERIFICATION → fallback, Escenario 5: Usuario no-admin con notificaciones admin, Escenario 6: Datos de usuario para navegación, Spec: Navegación desde notificaciones

### Community 76 - "UserAvatar.tsx"
Cohesion: 0.31
Nodes (8): COLOR_PALETTE, getBackgroundColor(), getInitials(), hashString(), styles, UserAvatar(), UserAvatarProps, UserAvatarUser

### Community 77 - "validators.ts"
Cohesion: 0.16
Nodes (16): AddUserFormModal(), AddUserFormModalProps, AddUserFormValues, BooleanRow(), compactPayload(), createStyles(), ErrorState, getSubmitFeedback() (+8 more)

### Community 78 - "Design: Delete Exchange Rate Functionality"
Cohesion: 0.25
Nodes (7): Architecture Decisions, Decision: Delete Action Location, Decision: Transaction/Movement Validation Handling, Design: Delete Exchange Rate Functionality, File Changes, Open Questions, Technical Approach

### Community 79 - "Implementation Progress"
Cohesion: 0.25
Nodes (7): Completed Tasks, Deviations from Design, Files Changed, Implementation Progress, Issues Found, Remaining Tasks, Status

### Community 80 - "CashFlowCurrencyCards.tsx"
Cohesion: 0.38
Nodes (5): CashFlowCurrencyCards(), formatAmount(), Props, styles, CashFlowReport

### Community 81 - "TabSelector.tsx"
Cohesion: 0.21
Nodes (14): AdminHomeViewModel, useAdminHomeData(), useAdminAuditLogsQuery(), useAdminBlockedUsersQuery(), useAdminExpiringLicensesQuery(), useAdminKpisQuery(), UseAdminUserControlActionOptions, adminRepository (+6 more)

### Community 82 - "TabBarMotionProvider.tsx"
Cohesion: 0.29
Nodes (6): Escenario 1: Abrir screen de notificaciones, Escenario 2: Estados de carga, Escenario 3: Lista de notificaciones, Escenario 4: Marcar como leída al tocar, Escenario 5: "Leer todas", Spec: NotificationScreen — Screen full-height en mobile

### Community 83 - "Tasks: Admin Users Unified Flow"
Cohesion: 0.29
Nodes (6): Phase 1: Foundation (Create Modal Components), Phase 2: AdminUsersScreen Modals, Phase 3: AdminUserManagementScreen Updates, Phase 4: Navigation Integration, Phase 5: Testing & Verification, Tasks: Admin Users Unified Flow

### Community 84 - "Design: Rediseño de Tarjetas de Exchange Rates"
Cohesion: 0.29
Nodes (6): Architecture Decisions, Decision: Mostrar Bandera sin Círculo de Fondo en Tarjetas, Design: Rediseño de Tarjetas de Exchange Rates, File Changes, Open Questions, Technical Approach

### Community 85 - "Exchange Rates Validation Specification"
Cohesion: 0.29
Nodes (6): Exchange Rates Validation Specification, Purpose, Requirement: Minimum Currencies Validation, Requirements, Scenario: Attempting to create a rate with insufficient currencies, Scenario: Creating a rate with sufficient currencies

### Community 86 - "Tasks: Fix App-Wide Dark Mode"
Cohesion: 0.29
Nodes (6): Phase 1: Navigation and Layout Components, Phase 2: Auth Screens, Phase 3: Main App Screens & Components, Phase 4: Admin Module, Phase 5: Verification, Tasks: Fix App-Wide Dark Mode

### Community 87 - "CashAuditCard.tsx"
Cohesion: 0.26
Nodes (10): getIconForPlan(), getStatusColor(), getStatusLabel(), LicenseCard(), LicenseCardProps, styles, AdminLicensesListScreen(), styles (+2 more)

### Community 88 - "CashMovementCard.tsx"
Cohesion: 0.20
Nodes (8): MainLayout(), MainLayoutProps, styles, Sidebar(), ResponsiveState, SidebarState, STORAGE_KEYS, useResponsiveStore

### Community 89 - "types.ts"
Cohesion: 0.40
Nodes (4): Dashboard redesign verification, Notes, Results, Scope verified

### Community 90 - "Proposal: Admin License Detail View"
Cohesion: 0.33
Nodes (5): Approach, Context, Intent, Proposal: Admin License Detail View, Scope

### Community 91 - "Tasks: Admin License Detail View"
Cohesion: 0.33
Nodes (5): Phase 1: Foundation, Phase 2: UI Components, Phase 3: Screen & Integration, Phase 4: Verification, Tasks: Admin License Detail View

### Community 92 - "Proposal: Admin Licenses Management"
Cohesion: 0.33
Nodes (5): Approach, Context, Intent, Proposal: Admin Licenses Management, Scope

### Community 93 - "Tasks: Admin Licenses Management"
Cohesion: 0.33
Nodes (5): Phase 1: Foundation, Phase 2: UI Components & Screens, Phase 3: Integration, Phase 4: Verification, Tasks: Admin Licenses Management

### Community 94 - "Proposal: Admin Subscription Plans Management"
Cohesion: 0.33
Nodes (5): Approach, Context, Intent, Proposal: Admin Subscription Plans Management, Scope

### Community 95 - "Tasks: Admin Subscription Plans Management"
Cohesion: 0.33
Nodes (5): Phase 1: Foundation (Types & API), Phase 2: UI Components & Screens, Phase 3: Integration & Navigation, Phase 4: Verification, Tasks: Admin Subscription Plans Management

### Community 96 - "Proposal: Admin User Details Screen"
Cohesion: 0.33
Nodes (5): Approach, Context, Intent, Proposal: Admin User Details Screen, Scope

### Community 97 - "Tasks: Admin User Details Screen"
Cohesion: 0.33
Nodes (5): Phase 1: Foundation, Phase 2: UI Components, Phase 3: Integration, Phase 4: Verification, Tasks: Admin User Details Screen

### Community 98 - "Proposal: Admin User Management Screen"
Cohesion: 0.33
Nodes (5): Approach, Context, Intent, Proposal: Admin User Management Screen, Scope

### Community 99 - "Tasks: Admin User Management Screen"
Cohesion: 0.33
Nodes (5): Phase 1: Foundation & Data, Phase 2: UI Components, Phase 3: Integration, Phase 4: Verification, Tasks: Admin User Management Screen

### Community 100 - "AdminHomeEventRow.tsx"
Cohesion: 0.29
Nodes (6): CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCard(), ExpenseCardProps, styles, Expense

### Community 101 - "useCurrencies.ts"
Cohesion: 0.47
Nodes (5): getRoleBadge(), getStyles(), UserManagementCard(), UserManagementCardProps, UserType

### Community 102 - "profile.repository.ts"
Cohesion: 0.14
Nodes (17): invalidateBalanceQueries(), mockedRepository, useCreateExpenseMutation(), useDeleteExpenseMutation(), useExpenseDetailQuery(), useExpensesQuery(), useUpdateExpenseMutation(), expensesRepository (+9 more)

### Community 105 - "fix-alerts.js"
Cohesion: 0.50
Nodes (4): fs, path, processFile(), walkDir()

### Community 107 - "fix-screens-confirm.js"
Cohesion: 0.40
Nodes (3): filesToUpdate, fs, path

### Community 108 - "metro.config.js"
Cohesion: 0.40
Nodes (4): config, deviceEmitterPath, { getDefaultConfig }, path

### Community 109 - "Proposal: Fix Plans API Integration"
Cohesion: 0.40
Nodes (4): Affected Areas, Intent, Proposal: Fix Plans API Integration, Scope

### Community 110 - "Proposal: Fix Services Dark Mode"
Cohesion: 0.40
Nodes (4): Affected Areas, Intent, Proposal: Fix Services Dark Mode, Scope

### Community 111 - "Proposal: Replace React Native Alerts with Burnt Toasts/Alerts"
Cohesion: 0.40
Nodes (4): Affected Areas, Intent, Proposal: Replace React Native Alerts with Burnt Toasts/Alerts, Proposed Approach

### Community 112 - "Proposal: Replace Native Alerts with Custom Confirmation Modal"
Cohesion: 0.40
Nodes (4): Affected Areas, Intent, Proposal: Replace Native Alerts with Custom Confirmation Modal, Proposed Approach

### Community 113 - "package.json"
Cohesion: 0.40
Nodes (4): main, name, private, version

### Community 114 - "replace-alerts.js"
Cohesion: 0.50
Nodes (4): fs, path, processFile(), walkDir()

### Community 115 - "AdminSuspendSuccessModal.tsx"
Cohesion: 0.40
Nodes (4): AdminSuspendSuccessModal(), AdminSuspendSuccessModalProps, styles, { width }

### Community 116 - "FadeIn"
Cohesion: 0.11
Nodes (20): KpiCardProps, ReportsKpiCard(), createStyles(), UserControlActionCard(), UserControlActionCardProps, styles, WorkerCard(), WorkerCardProps (+12 more)

### Community 117 - "authStore.ts"
Cohesion: 0.33
Nodes (5): Escenario 1: Tab visible en AdminTabs (mobile), Escenario 2: Badge de no leídas en AdminTabs, Escenario 3: Mismo NotificationScreen, Escenario 4: Sin QueryClient (fallback), Spec: Tab de Notificaciones en Bottom Bar (AdminTabs)

### Community 118 - "AdminLicensesListScreen.tsx"
Cohesion: 0.18
Nodes (8): BalanceCardProps, TransactionSummaryCardProps, Card(), CardProps, CardVariant, styles, CashBalance, DailyReport

### Community 119 - "useSubscriptions.ts"
Cohesion: 0.33
Nodes (5): Escenario 1: Registro de token al iniciar sesión, Escenario 2: Token existente en API, Escenario 3: Token expirado o inválido, Escenario 4: Sin conexión al registrar token, Spec: Push Notification Token Registration

### Community 120 - "ActionGridItem.tsx"
Cohesion: 0.50
Nodes (4): ActionGridItem(), ActionGridItemProps, getStyles(), { width }

### Community 122 - "Card.tsx"
Cohesion: 0.10
Nodes (22): AdminSuspendAccountModal(), AdminSuspendAccountModalProps, styles, { width }, ErrorModal(), ErrorModalProps, styles, styles (+14 more)

### Community 123 - "fix_auth_colors.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 124 - "fix_auth_colors2.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 125 - "fix_auth_colors3.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 126 - "fix_auth_colors4.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 127 - "fix_auth_colors5.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 128 - "fix_auth_colors6.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 129 - "fix_auth_colors7.js"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 131 - "replace_hardcoded_colors.js"
Cohesion: 0.50
Nodes (3): files, fs, glob

### Community 133 - "AdminReportsPeriodSegment.tsx"
Cohesion: 0.33
Nodes (5): Escenario 1: Foreground — App abierta, Escenario 2: Background — App en segundo plano, Escenario 3: Tapped — Usuario toca la notificación, Escenario 4: Badge count sincronizado, Spec: Recepción de Push Notifications

### Community 135 - "AdminHomeHeroCard.tsx"
Cohesion: 0.33
Nodes (5): Escenario 1: Registrar push token, Escenario 2: Envío de push al crear notificación, Escenario 3: Push falla (token inválido), Escenario 4: Push falla (rate limit/network), Spec: API — Push Token Endpoint y Envío

### Community 136 - "AdminReportsCashFlowCard.tsx"
Cohesion: 0.31
Nodes (10): AdminAuditLogNavigation, AdminAuditLogScreen(), CATEGORIES, Category, createStyles(), formatActionTitle(), getCategoryForAction(), getColorForAction() (+2 more)

### Community 137 - "tsconfig.json"
Cohesion: 0.50
Nodes (3): compilerOptions, strict, extends

### Community 143 - "AdminReportsUsersGrowthCard.tsx"
Cohesion: 0.33
Nodes (7): AdminHomeEventRow(), AdminHomeEventRowProps, AdminHomeEventRowType, deriveTypeFromAction(), EVENT_LABELS, formatEventDate(), styles

### Community 153 - "SuccessModal.tsx"
Cohesion: 0.15
Nodes (16): ErrorToast(), getBackgroundColor(), getIcon(), InfoToast(), styles, SuccessToast(), ToastBase(), ToastContainer() (+8 more)

### Community 154 - "fx-trading-remittances.spec.ts"
Cohesion: 0.25
Nodes (3): currencies, openingPosition, rates

### Community 156 - "AdminTempBlockModal.tsx"
Cohesion: 0.40
Nodes (4): AdminTempBlockModal(), AdminTempBlockModalProps, styles, { width }

### Community 157 - "AdminResetPasswordSuccessModal.tsx"
Cohesion: 0.40
Nodes (4): Escenario 1: Tab "Notificaciones" visible en mobile, Escenario 2: Badge de no leídas, Escenario 3: Sin QueryClient (fallback), Spec: Tab de Notificaciones en Bottom Bar (MainTabs)

### Community 159 - "currencyFlags.ts"
Cohesion: 0.07
Nodes (37): react, ConnectedNotificationCenter(), iconForNotification(), NotificationList(), NotificationListProps, styles, Harness(), mockAppStateSubscription (+29 more)

### Community 160 - "AdminChangePasswordSuccessModal.tsx"
Cohesion: 0.18
Nodes (11): AdminChangePasswordSuccessModal(), AdminChangePasswordSuccessModalProps, styles, AdminLogoutModal(), AdminLogoutModalProps, styles, StatsCard(), AboutModal() (+3 more)

### Community 163 - "EmailVerifiedScreen.tsx"
Cohesion: 0.21
Nodes (9): CATEGORIES, ExpenseCategoryPicker(), ExpenseCategoryPickerProps, styles, ExpenseFormModal(), ExpenseFormModalProps, styles, ExpenseCategory (+1 more)

### Community 166 - "HomeScreen.test.tsx"
Cohesion: 0.10
Nodes (25): createStyles(), defaultPlans, PlanFilter(), PlanFilterProps, QuickAction, QuickActionCardProps, AdminExportReportsScreen(), createStyles() (+17 more)

### Community 168 - "GradientCard.tsx"
Cohesion: 0.10
Nodes (17): AdminChangeRoleModal(), AdminChangeRoleModalProps, { height }, ROLES, styles, AdminRoleChangeSuccessModal(), AdminRoleChangeSuccessModalProps, styles (+9 more)

### Community 172 - "useShadows"
Cohesion: 0.33
Nodes (5): AdminActionConfirmModal(), AdminActionConfirmModalProps, styles, { width }, AdminUserControlActionType

### Community 177 - "transactionsHeaderLayout.ts"
Cohesion: 0.07
Nodes (30): AdminDeleteConfirmModal(), AdminDeleteConfirmModalProps, styles, AdminReportsTopBar(), AdminReportsTopBarProps, createStyles(), createStyles(), DateFilter() (+22 more)

## Knowledge Gaps
- **1065 isolated node(s):** `queryClient`, `name`, `slug`, `version`, `orientation` (+1060 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useColors()` connect `transactionsHeaderLayout.ts` to `RegisterScreen.tsx`, `useDashboardData.ts`, `index.tsx`, `useAdminReportsDashboard.ts`, `borderRadius`, `AdminReportsCashFlowCard.tsx`, `useColors`, `AdminReportsUsersGrowthCard.tsx`, `ReportsScreen.tsx`, `AppNavigator.tsx`, `ExpenseItemsScreen.tsx`, `api.ts`, `types.ts`, `AdminAuditLogScreen.tsx`, `AdminHomeEventRow.tsx`, `AdminTempBlockModal.tsx`, `currencyFlags.ts`, `AdminChangePasswordSuccessModal.tsx`, `AdminPlanCreateScreen.tsx`, `useBankAccounts.ts`, `EmailVerifiedScreen.tsx`, `AdminPlanCreateScreen.tsx`, `AdminAuditLogScreen.tsx`, `HomeScreen.test.tsx`, `GradientCard.tsx`, `useShadows`, `CashRegisterTab.tsx`, `AdminReportsScreen.tsx`, `ExpenseDatePicker.tsx`, `ExchangeRatesScreen.tsx`, `CashAuditCard.tsx`, `DeleteButton.tsx`, `validators.ts`, `CashAuditCard.tsx`, `CashMovementCard.tsx`, `AdminHomeEventRow.tsx`, `profile.repository.ts`, `AdminSuspendSuccessModal.tsx`, `FadeIn`, `AdminLicensesListScreen.tsx`, `Card.tsx`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `react` connect `currencyFlags.ts` to `dependencies`, `borderRadius`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`, `currencyFlags.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `queryClient`, `name`, `slug` to the rest of the system?**
  _1065 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `RegisterScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07402031930333818 - nodes in this community are weakly interconnected._
- **Should `useDashboardData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10121457489878542 - nodes in this community are weakly interconnected._
- **Should `ObjectivesScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
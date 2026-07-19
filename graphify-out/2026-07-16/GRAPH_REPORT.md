# Graph Report - APP  (2026-07-16)

## Corpus Check
- 378 files · ~213,965 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2096 nodes · 4297 edges · 159 communities (149 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `21fc3f95`
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
- AuthWrapper.tsx
- ExpenseFormModal.tsx
- AdminServicesScreen.tsx
- BusinessScreen.tsx
- AdminUsersScreen.tsx
- FadeInDown
- Integration Testing Guide
- AdminUserDetailScreen.tsx
- useBusinessQueries.ts
- AdminPlanCreateScreen.tsx
- useBankAccounts.ts
- licensesApi.ts
- AdminPlanCreateScreen.tsx
- AddUserFormModal.tsx
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
- licensesApi.ts
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
- ExpenseCategoryPicker.tsx
- ExchangeRatesScreen.tsx
- Mock Auth Backend Server
- Requirements
- UI Specification
- scripts
- CashAuditCard.tsx
- VerificationPendingScreen.tsx
- Plan: Observabilidad con Grafana Stack (Prometheus + Loki + Grafana)
- Verification Report: admin-users-unified-flow
- Requirement: Use Burnt for Application Alerts
- Requirement: Custom Confirmation Component
- devDependencies
- AdminHomeEventRow.tsx
- UserAvatar.tsx
- AdminResetPasswordSuccessModal.tsx
- Design: Delete Exchange Rate Functionality
- Implementation Progress
- ObjectiveFormModal.tsx
- AssignLicenseModal.tsx
- bankAccounts.repository.ts
- Tasks: Admin Users Unified Flow
- Design: Rediseño de Tarjetas de Exchange Rates
- Exchange Rates Validation Specification
- Tasks: Fix App-Wide Dark Mode
- useBankAccountsQuery
- useSubscriptions.ts
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
- TabBarMotionProvider.tsx
- AdminSuspendSuccessModal.tsx
- profile.repository.ts
- tabBarScreenIntegration.test.ts
- AdminTempBlockModal.tsx
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
- ExchangeRatesScreen.tsx
- FadeIn
- ActionTile.tsx
- ProfileScreen
- ActionGridItem.tsx
- ErrorModal.tsx
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
- bankAccounts.repository.ts
- ObjectiveProgressRing.tsx
- ReportsPlanFilter.tsx
- tsconfig.json
- fix_static_colors.js
- Card.tsx
- proMax.ts
- fx-trading-remittances.spec.ts
- AppNavigator
- AdminReportsPeriodSegment.tsx
- ReportsBlockedList.tsx
- AdminReportsTopBar.tsx
- transactions.repository.test.ts
- getApiErrorMessage
- AdminUserDetailModal

## God Nodes (most connected - your core abstractions)
1. `useColors()` - 217 edges
2. `spacing` - 95 edges
3. `borderRadius` - 82 edges
4. `useShadows()` - 61 edges
5. `Alert` - 39 edges
6. `FadeInDown()` - 37 edges
7. `api` - 31 edges
8. `Button()` - 25 edges
9. `Input()` - 24 edges
10. `queryKeys` - 23 edges

## Surprising Connections (you probably didn't know these)
- `AdminUserDetailModal()` --references--> `react`  [EXTRACTED]
  src/components/admin/AdminUserDetailModal.tsx → package.json
- `useTransactions()` --calls--> `useTransactionsQuery()`  [EXTRACTED]
  src/hooks/queries/useBusinessQueries.ts → src/modules/transactions/application/useTransactions.ts
- `Section()` --calls--> `useColors()`  [EXTRACTED]
  src/components/admin/AddUserFormModal.tsx → src/store/themeStore.ts
- `BooleanRow()` --calls--> `useColors()`  [EXTRACTED]
  src/components/admin/AddUserFormModal.tsx → src/store/themeStore.ts
- `RoleSelector()` --calls--> `useColors()`  [EXTRACTED]
  src/components/admin/AddUserFormModal.tsx → src/store/themeStore.ts

## Import Cycles
- None detected.

## Communities (159 total, 10 thin omitted)

### Community 0 - "RegisterScreen.tsx"
Cohesion: 0.20
Nodes (9): LoadingDots(), EmptyStateProps, HomeScreen(), styles, contrastRatio(), dashboardData, mockUseDashboardData, mockUseTabScrollToTop (+1 more)

### Community 1 - "useDashboardData.ts"
Cohesion: 0.08
Nodes (33): Header(), HeaderProps, styles, MainLayout(), MainLayoutProps, styles, ResponsiveContainer(), ResponsiveContainerProps (+25 more)

### Community 2 - "ObjectivesScreen.tsx"
Cohesion: 0.19
Nodes (17): mockedRepository, useCreateObjectiveMutation(), useDeleteObjectiveMutation(), useObjectiveDetailQuery(), useObjectiveProgressQuery(), useObjectivesQuery(), useUpdateObjectiveMutation(), useUpdateObjectiveStatusMutation() (+9 more)

### Community 3 - "index.tsx"
Cohesion: 0.06
Nodes (45): AdminReportsMetricTile(), AdminReportsMetricTileProps, createStyles(), AdminReportsSystemUsageSection(), AdminReportsSystemUsageSectionProps, createStyles(), AdminReportsUsersGrowthCard(), AdminReportsUsersGrowthCardProps (+37 more)

### Community 4 - "useAdminReportsDashboard.ts"
Cohesion: 0.20
Nodes (5): CURRENCY_CONFIG, ENV, STORAGE_KEYS, AuthState, AuthResponse

### Community 5 - "borderRadius"
Cohesion: 0.14
Nodes (15): ConfirmModal(), ConfirmModalProps, styles, useBankAccountsQuery(), useCreateBankAccountMutation(), useDeleteBankAccountMutation(), useUpdateBankAccountMutation(), BankAccountsScreen() (+7 more)

### Community 6 - "index.ts"
Cohesion: 0.08
Nodes (31): currenciesRepository, exchangeRatesRepository, ExchangeRatesResponse, AccountReportItem, AccountsReport, AdminNotificationEvent, AuditSummaryReport, CashFlowReport (+23 more)

### Community 7 - "expo"
Cohesion: 0.06
Nodes (34): backgroundColor, foregroundImage, adaptiveIcon, edgeToEdgeEnabled, package, permissions, versionCode, projectId (+26 more)

### Community 8 - "Opción B: Mock Backend & Integration Testing - COMPLETE ✅"
Cohesion: 0.06
Nodes (34): 1. Mock Backend Server, 2. useDebounce Hook, 3. Integration Tests, 4. Documentation, App Not Connecting to Mock Server, Architecture, Debouncing Impact, Documentation (+26 more)

### Community 9 - "dependencies"
Cohesion: 0.06
Nodes (34): dependencies, clsx, date-fns, expo, expo-blur, expo-device, expo-image-picker, expo-linear-gradient (+26 more)

### Community 10 - "useSubscriptions.ts"
Cohesion: 0.11
Nodes (24): styles, TransactionItem(), TransactionItemProps, WorkerExpandableRow(), WorkerExpandableRowProps, mockedRepository, useAddBalanceMutation(), useCreateTransactionMutation() (+16 more)

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
Cohesion: 0.14
Nodes (19): RFC-5322, ErrorModal(), ErrorModalProps, styles, useDebounce(), useRegisterAnimations(), UseRegisterAnimationsResult, ChangePasswordScreen() (+11 more)

### Community 15 - "useShadows"
Cohesion: 0.18
Nodes (13): useCashAdjustmentsQuery(), useCashAuditsQuery(), useCashOverviewQuery(), useCreateCashAdjustmentMutation(), useCreateCashAuditMutation(), useCurrenciesQuery(), AdjustmentType, CashAction (+5 more)

### Community 16 - "Authentication API Endpoints"
Cohesion: 0.07
Nodes (27): Authentication API Endpoints, Backend Implementation Notes, Backend Implementation Notes, Backend Validations Required, Common Status Codes, Email Check Flow, Error Handling, Example Request (+19 more)

### Community 17 - "ReportsScreen.tsx"
Cohesion: 0.12
Nodes (14): cashRepository, mockedApi, mockedApi, api, RequestConfig, checkEmailExists(), checkNicknameExists(), ResendVerificationResponse (+6 more)

### Community 18 - "themeStore.ts"
Cohesion: 0.18
Nodes (10): ExpenseAmountInput(), ExpenseAmountInputProps, styles, ObjectiveFormModal(), ObjectiveFormModalProps, styles, ObjectiveStatusPicker(), ObjectiveStatusPickerProps (+2 more)

### Community 19 - "WorkerPaymentsScreen.tsx"
Cohesion: 0.08
Nodes (23): Accessibility, Animation strategy, Components, Content integration, Current Context, Definition of Done, Expanded state, Goal (+15 more)

### Community 20 - "AppNavigator.tsx"
Cohesion: 0.11
Nodes (22): AnimatedCircle, BarChart(), BarChartProps, BarItem(), BarItemProps, CircularProgress(), CircularProgressProps, clamp() (+14 more)

### Community 21 - "ExpenseItemsScreen.tsx"
Cohesion: 0.20
Nodes (11): getTransactionFilterLabel(), Props, styles, TRANSACTION_FILTER_OPTIONS, TransactionFilterModal(), TransactionFilterValue, getTransactionsHeaderLayout(), TransactionsHeaderLayout (+3 more)

### Community 22 - "Toast.tsx"
Cohesion: 0.14
Nodes (15): uploadApi, UploadResponse, mockUseAdminAuditLogsProfileQuery, mockUseAdminStatsQuery, mockUseAuthStore, mockUser, mockUseThemeStore, useAdminAuditLogsProfileQuery() (+7 more)

### Community 23 - "api.ts"
Cohesion: 0.16
Nodes (14): StaggerList(), AdminRoutes(), AdminTabs(), Tab, AdminTabParamList, AdminHomeNavigationProp, AdminHomeScreen(), createStyles() (+6 more)

### Community 24 - "AuthWrapper.tsx"
Cohesion: 0.11
Nodes (12): queryClient, WebToaster(), AppNavigator(), AuthStack, MainStack, mockCheckAuth, mockUseAuthStore, AdminStackParamList (+4 more)

### Community 25 - "ExpenseFormModal.tsx"
Cohesion: 0.12
Nodes (24): AdminHomeHeroCard(), AdminHomeHeroCardProps, styles, ExpenseDatePicker(), ExpenseDatePickerProps, styles, QuickAction, QuickActionCardProps (+16 more)

### Community 26 - "AdminServicesScreen.tsx"
Cohesion: 0.09
Nodes (26): BlockedUser, createStyles(), ReportsBlockedList(), ReportsBlockedListProps, KpiCardProps, ReportsKpiCard(), ObjectiveCard(), ObjectiveCardProps (+18 more)

### Community 27 - "BusinessScreen.tsx"
Cohesion: 0.23
Nodes (13): useCategoriesQuery(), useCreateExpenseItemMutation(), useDeleteExpenseItemMutation(), useExpenseItemsQuery(), useUpdateExpenseItemMutation(), expenseItemsRepository, useTabBarScrollBehavior(), ExpenseItemsScreen() (+5 more)

### Community 28 - "AdminUsersScreen.tsx"
Cohesion: 0.06
Nodes (47): AssignLicensePayload, BackendUserLicense, BillingCycle, licensesApi, plansApi, AdminHeader(), AdminHeaderProps, getInitials() (+39 more)

### Community 29 - "FadeInDown"
Cohesion: 0.21
Nodes (7): usePositionsQuery(), useRemittancesQuery(), useTransactionsQuery(), AdminLicensesListScreen(), TransactionsTab(), TransactionsTabColors, query()

### Community 30 - "Integration Testing Guide"
Cohesion: 0.10
Nodes (19): Check Email, Check Nickname, Debounce Hook, E2E Tests with Mock Server, File Structure, Integration Testing Guide, Integration Tests, Key Features (+11 more)

### Community 31 - "AdminUserDetailScreen.tsx"
Cohesion: 0.12
Nodes (20): AdminSuspendSuccessModal(), AdminSuspendSuccessModalProps, styles, { width }, styles, SuccessModal(), SuccessModalProps, useAdminUserControlActionMutation() (+12 more)

### Community 32 - "useBusinessQueries.ts"
Cohesion: 0.15
Nodes (12): BUSINESS_TABS, BusinessScreen(), Header(), styles, styles, TabItem, TabSelector(), TabSelectorProps (+4 more)

### Community 33 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.20
Nodes (10): useCurrentExchangeRatesQuery(), useDeleteExchangeRateMutation(), usePairHistoryQuery(), usePairStatsQuery(), useRateHistoryQuery(), useResetRateHistoryMutation(), useUpdateExchangeRateMutation(), ExchangeRatesScreen() (+2 more)

### Community 35 - "licensesApi.ts"
Cohesion: 0.16
Nodes (16): AddUserFormModal(), AddUserFormModalProps, AddUserFormValues, BooleanRow(), compactPayload(), createStyles(), ErrorState, getSubmitFeedback() (+8 more)

### Community 36 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.09
Nodes (19): mockMetrics, ActionTile(), Props, styles, BottomNav(), Props, styles, GradientCard() (+11 more)

### Community 37 - "AddUserFormModal.tsx"
Cohesion: 0.60
Nodes (4): createStyles(), getFeatures(), WelcomeScreen(), WelcomeScreenProps

### Community 38 - "ExchangeRatesScreen.tsx"
Cohesion: 0.07
Nodes (30): AdminChangeRoleModal(), AdminChangeRoleModalProps, { height }, ROLES, styles, AdminResetPasswordModal(), AdminResetPasswordModalProps, styles (+22 more)

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
Cohesion: 0.12
Nodes (17): AccountOption, styles, TransactionModal(), BankAccount, calculateTransferPreview(), CashMovement, CashReconciliation, FxPerformanceReport (+9 more)

### Community 43 - "ProfileScreen"
Cohesion: 0.32
Nodes (4): Tab, tabComponents, MainTabDefinition, mainTabDefinitions

### Community 44 - "CashRegisterTab.tsx"
Cohesion: 0.13
Nodes (12): AdjustmentType, CashAction, CashScreen(), styles, mockAlert, mockCreateAdjustment, mockCreateAudit, mockCup (+4 more)

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
Cohesion: 0.22
Nodes (10): AdminResetPasswordSuccessModal(), AdminResetPasswordSuccessModalProps, styles, useAdminDeleteUserMutation(), useAdminUpdateUserBasicMutation(), useAdminUserDetailQuery(), AdminUserDetailScreen(), createStyles() (+2 more)

### Community 50 - "licensesApi.ts"
Cohesion: 0.33
Nodes (9): useCreateCurrencyMutation(), useCurrenciesWithPrimaryQuery(), useDeleteCurrencyMutation(), useSetPrimaryCurrencyMutation(), useUpdateCurrencyMutation(), CurrenciesScreen(), styles, getCountryCode() (+1 more)

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
Cohesion: 0.12
Nodes (16): useCreatePlanMutation(), usePlansCatalogQuery(), plansRepository, useAssignLicenseMutation(), useSubscriptionLicensesQuery(), useOperationalUsersQuery(), usersRepository, mockNavigate (+8 more)

### Community 55 - "useReports.ts"
Cohesion: 0.25
Nodes (4): bankAccounts, cashBalances, currencies, Route

### Community 56 - "AdminActionConfirmModal.tsx"
Cohesion: 0.29
Nodes (6): CATEGORY_COLORS, CATEGORY_ICONS, ExpenseCard(), ExpenseCardProps, styles, Expense

### Community 57 - "AdminPlanCreateScreen.tsx"
Cohesion: 0.40
Nodes (4): CashAudit, CashAuditCard(), Props, styles

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
Cohesion: 0.40
Nodes (4): CashMovement, CashMovementCard(), Props, styles

### Community 62 - "ExpenseCategoryPicker.tsx"
Cohesion: 0.33
Nodes (5): ExpenseFormModal(), ExpenseFormModalProps, styles, ExpenseCategory, ExpenseSourceType

### Community 63 - "ExchangeRatesScreen.tsx"
Cohesion: 0.22
Nodes (10): FintechTabBarColors, floatingTabBarMetrics, getFintechTabBarStyle(), InstagramTabBar(), styles, TAB_BAR_EMPHASIS_MOTION, routeNames, ScrollToTopRegistration() (+2 more)

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
Cohesion: 0.06
Nodes (34): AdminChangePasswordSuccessModal(), AdminChangePasswordSuccessModalProps, styles, AdminDeleteConfirmModal(), AdminDeleteConfirmModalProps, styles, AdminLogoutModal(), AdminLogoutModalProps (+26 more)

### Community 69 - "VerificationPendingScreen.tsx"
Cohesion: 0.16
Nodes (14): AuthCard(), AuthCardProps, styles, AuthWrapper(), AuthWrapperProps, createStyles(), BrandingPanel(), BrandingPanelProps (+6 more)

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

### Community 75 - "AdminHomeEventRow.tsx"
Cohesion: 0.31
Nodes (10): AdminAuditLogNavigation, AdminAuditLogScreen(), CATEGORIES, Category, createStyles(), formatActionTitle(), getCategoryForAction(), getColorForAction() (+2 more)

### Community 76 - "UserAvatar.tsx"
Cohesion: 0.31
Nodes (8): COLOR_PALETTE, getBackgroundColor(), getInitials(), hashString(), styles, UserAvatar(), UserAvatarProps, UserAvatarUser

### Community 77 - "AdminResetPasswordSuccessModal.tsx"
Cohesion: 0.33
Nodes (7): AdminHomeEventRow(), AdminHomeEventRowProps, AdminHomeEventRowType, deriveTypeFromAction(), EVENT_LABELS, formatEventDate(), styles

### Community 78 - "Design: Delete Exchange Rate Functionality"
Cohesion: 0.25
Nodes (7): Architecture Decisions, Decision: Delete Action Location, Decision: Transaction/Movement Validation Handling, Design: Delete Exchange Rate Functionality, File Changes, Open Questions, Technical Approach

### Community 79 - "Implementation Progress"
Cohesion: 0.25
Nodes (7): Completed Tasks, Deviations from Design, Files Changed, Implementation Progress, Issues Found, Remaining Tasks, Status

### Community 80 - "ObjectiveFormModal.tsx"
Cohesion: 0.48
Nodes (6): createStyles(), formatActionName(), getActionColor(), getActionIcon(), ReportsAuditLogList(), ReportsAuditLogListProps

### Community 81 - "AssignLicenseModal.tsx"
Cohesion: 0.27
Nodes (5): adminProfileRepository, DEFAULT_STATS, safeArray(), safeObject(), queryKeys

### Community 82 - "bankAccounts.repository.ts"
Cohesion: 0.29
Nodes (6): BankAccountBalance, bankAccountsRepository, BankAccountTransactions, CreateBankAccountDto, UpdateBankAccountDto, BankAccount

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

### Community 87 - "useBankAccountsQuery"
Cohesion: 0.40
Nodes (4): AdminSuspendAccountModal(), AdminSuspendAccountModalProps, styles, { width }

### Community 88 - "useSubscriptions.ts"
Cohesion: 0.23
Nodes (14): useActiveObjectives(), useCashBalances(), useDailyReport(), useDashboardData(), useExchangeRates(), useRecentExpenses(), useRecentTransactions(), dashboardRepository (+6 more)

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

### Community 100 - "TabBarMotionProvider.tsx"
Cohesion: 0.40
Nodes (7): createTabBarScrollState(), TabBarDisplay, TabBarScrollState, updateTabBarScrollState(), TabBarMotionContext, TabBarMotionContextValue, TabBarMotionProvider()

### Community 101 - "AdminSuspendSuccessModal.tsx"
Cohesion: 0.67
Nodes (3): createStyles(), DateFilter(), DateFilterProps

### Community 102 - "profile.repository.ts"
Cohesion: 0.23
Nodes (13): mockedRepository, useCreateExpenseMutation(), useDeleteExpenseMutation(), useExpenseDetailQuery(), useExpensesQuery(), useUpdateExpenseMutation(), expensesRepository, mockedApi (+5 more)

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

### Community 115 - "ExchangeRatesScreen.tsx"
Cohesion: 0.31
Nodes (9): businessKeys, mockFetch(), useBankAccounts(), useCashMovements(), useCreateTransaction(), useTransactions(), useUpdateWorkerBalance(), useWorkers() (+1 more)

### Community 116 - "FadeIn"
Cohesion: 0.12
Nodes (14): AnimatedNumberProps, AnimatedWrapperProps, FadeIn(), LoadingDotsProps, PressableScale(), PressableScaleProps, PulseLoaderProps, safeDuration() (+6 more)

### Community 119 - "ProfileScreen"
Cohesion: 0.26
Nodes (10): useProfileActiveObjectivesQuery(), useProfileBankAccountsQuery(), useProfileCashBalancesQuery(), useProfileDailyReportQuery(), ProfileNavigationItem, profileNavigationItems, ProfileRoute, createStyles() (+2 more)

### Community 120 - "ActionGridItem.tsx"
Cohesion: 0.50
Nodes (4): ActionGridItem(), ActionGridItemProps, getStyles(), { width }

### Community 122 - "ErrorModal.tsx"
Cohesion: 0.10
Nodes (29): createStyles(), ReportsUserList(), ReportsUserListProps, createStyles(), UserActionConfirmModal(), UserActionConfirmModalProps, FadeInDown(), ExpenseItemFormModalProps (+21 more)

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

### Community 133 - "bankAccounts.repository.ts"
Cohesion: 0.17
Nodes (9): useRegisterSubscriptionPaymentMutation(), subscriptionsRepository, AdminCashScreen(), createStyles(), mockUseBankAccountsQuery, mockUseRegisterSubscriptionPaymentMutation, BillingCycle, SubscriptionPayment (+1 more)

### Community 135 - "ReportsPlanFilter.tsx"
Cohesion: 0.50
Nodes (4): createStyles(), defaultPlans, PlanFilter(), PlanFilterProps

### Community 137 - "tsconfig.json"
Cohesion: 0.50
Nodes (3): compilerOptions, strict, extends

### Community 143 - "Card.tsx"
Cohesion: 0.13
Nodes (12): AdminReportsCashFlowCard(), AdminReportsCashFlowCardProps, createStyles(), BalanceCardProps, TransactionSummaryCardProps, ObjectiveProgressRingProps, styles, Card() (+4 more)

### Community 154 - "fx-trading-remittances.spec.ts"
Cohesion: 0.25
Nodes (3): currencies, openingPosition, rates

### Community 157 - "AppNavigator"
Cohesion: 0.07
Nodes (33): Badge(), BadgeProps, BadgeVariant, getVariantStyles(), Select(), SelectOption, SelectProps, ErrorToast() (+25 more)

### Community 159 - "AdminReportsPeriodSegment.tsx"
Cohesion: 0.40
Nodes (5): AdminReportsPeriodSegment(), AdminReportsPeriodSegmentProps, createStyles(), OPTIONS, AdminReportsPeriod

### Community 160 - "ReportsBlockedList.tsx"
Cohesion: 0.40
Nodes (5): createStyles(), defaultTabs, ReportTab, TabSelector(), TabSelectorProps

### Community 161 - "AdminReportsTopBar.tsx"
Cohesion: 0.23
Nodes (10): createStyles(), ForgotPasswordScreen(), ForgotPasswordScreenProps, createStyles(), ResetPasswordScreen(), ResetPasswordScreenProps, forgotPassword(), ForgotPasswordResponse (+2 more)

### Community 163 - "transactions.repository.test.ts"
Cohesion: 0.50
Nodes (3): ExchangeRatesResponse, transactionsRepository, TransactionType

### Community 166 - "getApiErrorMessage"
Cohesion: 0.23
Nodes (13): AdminHomeViewModel, useAdminHomeData(), useAdminAuditLogsQuery(), useAdminBlockedUsersQuery(), useAdminExpiringLicensesQuery(), useAdminKpisQuery(), UseAdminUserControlActionOptions, adminRepository (+5 more)

### Community 169 - "AdminUserDetailModal"
Cohesion: 0.16
Nodes (11): AdminActionConfirmModal(), AdminActionConfirmModalProps, styles, { width }, AdminUserDetailModal(), AdminUserDetailModalProps, styles, createStyles() (+3 more)

## Knowledge Gaps
- **911 isolated node(s):** `mockNavigate`, `ExchangeRatesResponse`, `Props`, `styles`, `mockUseTransactionsQuery` (+906 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useColors()` connect `CashAuditCard.tsx` to `RegisterScreen.tsx`, `useDashboardData.ts`, `ObjectivesScreen.tsx`, `index.tsx`, `borderRadius`, `ReportsPlanFilter.tsx`, `useSubscriptions.ts`, `useColors`, `Card.tsx`, `useShadows`, `themeStore.ts`, `AppNavigator.tsx`, `Toast.tsx`, `api.ts`, `ExpenseFormModal.tsx`, `AdminServicesScreen.tsx`, `BusinessScreen.tsx`, `AdminUsersScreen.tsx`, `AppNavigator`, `FadeInDown`, `AdminUserDetailScreen.tsx`, `ReportsBlockedList.tsx`, `AdminReportsPeriodSegment.tsx`, `AdminReportsTopBar.tsx`, `licensesApi.ts`, `AdminPlanCreateScreen.tsx`, `AddUserFormModal.tsx`, `ExchangeRatesScreen.tsx`, `useBusinessQueries.ts`, `AdminPlanCreateScreen.tsx`, `AdminUserDetailModal`, `AdminReportsScreen.tsx`, `AdminPlanCreateScreen.tsx`, `TabSelector.tsx`, `VerificationPendingScreen.tsx`, `AdminHomeEventRow.tsx`, `AdminResetPasswordSuccessModal.tsx`, `ObjectiveFormModal.tsx`, `useBankAccountsQuery`, `AdminSuspendSuccessModal.tsx`, `AdminTempBlockModal.tsx`, `ProfileScreen`, `ErrorModal.tsx`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `AdminUserDetailModal()` connect `AdminUserDetailModal` to `dependencies`, `CashAuditCard.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `mockNavigate`, `ExchangeRatesResponse`, `Props` to the rest of the system?**
  _911 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useDashboardData.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08333333333333333 - nodes in this community are weakly interconnected._
- **Should `index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06352087114337568 - nodes in this community are weakly interconnected._
- **Should `borderRadius` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
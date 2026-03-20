# Tasks: Fix App-Wide Dark Mode

## Phase 1: Navigation and Layout Components
- [ ] 1.1 Update `src/navigation/AppNavigator.tsx`: Replace static `colors` import with `useColors()` hook. Update dynamic `createStyles` to accept `colors`.
- [ ] 1.2 Update `src/navigation/AdminTabs.tsx`: Ensure Tab.Navigator uses dynamic `colors.card` and `colors.border` instead of static. Replace any hardcoded backgrounds.
- [ ] 1.3 Update `src/components/layout/Header.tsx`: Replace `#FFFFFF` border/background colors with dynamic `colors.card` or `colors.border`.

## Phase 2: Auth Screens
- [ ] 2.1 Update `src/screens/auth/WelcomeScreen.tsx`: Replace static `colors` import with `useColors()` and remove hardcoded `#FFFFFF`.
- [ ] 2.2 Update `src/screens/auth/LoginScreen.tsx`: Replace static `colors` import with `useColors()`.
- [ ] 2.3 Update `src/screens/auth/RegisterScreen.tsx` & `ForgotPasswordScreen.tsx`: Replace static `colors` import with `useColors()`.
- [ ] 2.4 Update `src/screens/auth/ChangePasswordScreen.tsx` & `ResetPasswordScreen.tsx`: Replace static `colors` and hardcoded `#fff`.
- [ ] 2.5 Update `src/screens/auth/EmailVerifiedScreen.tsx` & `VerificationPendingScreen.tsx`: Replace static `colors` and hardcoded `#FFFFFF`.

## Phase 3: Main App Screens & Components
- [ ] 3.1 Update `src/screens/home/HomeScreen.tsx`: Remove hardcoded `borderColor: '#fff'` and replace with `colors.border`.
- [ ] 3.2 Update `src/screens/cash/CashScreen.tsx` & `CashHistoryScreen.tsx`: Replace static `colors` import and hardcoded `#fff` with dynamic `themeColors.text.inverse` or `card`.
- [ ] 3.3 Update `src/screens/expenses/ExpensesScreen.tsx` & Expense Components (`ExpenseDatePicker.tsx`, `ExpenseAmountInput.tsx`): Replace hardcoded `#fff` with dynamic `themeColors.card`/`inverse`.
- [ ] 3.4 Update `src/screens/transactions/TransactionsScreen.tsx`: Replace static `colors` import and hardcoded `#fff`.
- [ ] 3.5 Update `src/screens/currencies/CurrenciesScreen.tsx` & `ExchangeRatesScreen.tsx`: Replace static `colors` and hardcoded `#fff`.
- [ ] 3.6 Update `src/screens/bank-accounts/BankAccountsScreen.tsx` & `src/screens/profile/ProfileScreen.tsx`: Replace static `colors` and hardcoded `#fff`.
- [ ] 3.7 Update Dashboard Components (`QuickActionCard.tsx`, `BalanceCard.tsx`, `TransactionSummaryCard.tsx`): Replace static `colors` import with `useColors()`.
- [ ] 3.8 Update UI Components (`Badge.tsx`, `Toast.tsx`, `DeleteButton.tsx`, `UserAvatar.tsx`, `Charts.tsx`): Replace static `colors` and hardcoded `#FFFFFF`/`white`.
- [ ] 3.9 Update Worker Payments Components (`WorkerCard.tsx`, `TransactionFormModal.tsx`, etc.): Replace hardcoded `#fff`.

## Phase 4: Admin Module
- [ ] 4.1 Update Admin Screens (`AdminUsersScreen.tsx`, `AdminExportReportsScreen.tsx`, `AdminUserDetailScreen.tsx`, etc.): Remove hardcoded `#fff` and `#FFF` from styles.
- [ ] 4.2 Update Admin Licenses (`AdminLicenseDetailScreen.tsx`, `AdminLicensesListScreen.tsx`, `LicenseCard.tsx`, `LicenseUserRow.tsx`, etc.): Replace `#fff` and `#1e293b` with dynamic `colors.card` / `colors.background`.
- [ ] 4.3 Update Admin Plans (`AdminPlanCreateScreen.tsx`, `AdminPlansListScreen.tsx`): Remove hardcoded `#fff` and replace with `colors.card`.
- [ ] 4.4 Update Admin Components (`AdminDeleteConfirmModal.tsx`, `ActionTile.tsx`, `AdminHomeHeroCard.tsx`, `UserManagementCard.tsx`, etc.): Replace hardcoded hex colors with `useColors()`.

## Phase 5: Verification
- [ ] 5.1 Run the app and toggle dark mode in the Auth Flow.
- [ ] 5.2 Navigate through Main App Tabs (Home, Cash, Expenses) and verify background/text colors update dynamically.
- [ ] 5.3 Navigate through Admin Dashboard and verify all cards and modals reflect the dark theme without stark white flashes.

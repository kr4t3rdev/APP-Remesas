# Cashflow Web UI Rebuild — Baseline

## Scope

Rebuild the Expo Web presentation for the public authentication surface,
Admin workspace, and User workspace. Native Android and iOS presentation files
remain out of scope.

## Verified repository surface

- 35 screen components were found across authentication, Admin, and User
  domains.
- Expo exports the application successfully with `npm run build:web`.
- The repository contains an existing responsive shell (`useResponsive`,
  `Sidebar`, and platform-aware web toaster) and six persisted themes.
- The auth stack currently registers Welcome, Login, Register,
  VerificationPending, and ChangePassword. Recovery screens need an explicit
  web navigation pass before they can be exposed as routes.

## Baseline verification

- Before the web slice: 85 suites / 489 tests passed; Jest did not terminate
  naturally because of existing asynchronous handles.
- After the web auth slice: 87 suites / 495 tests passed with `--forceExit`.
- TypeScript: `npx tsc --noEmit` passes.
- Web export: `npm run build:web` passes and the bundle contains the new
  `CASHFLOW / INICIO`, `CASHFLOW / ACCESO`, and `CASHFLOW / REGISTRO` labels.
- Focused web tests cover entry navigation, labelled fields, empty-login
  validation, and keyboard/pointer-accessible terms acceptance.

## Isolation contract

New Web UI uses `.web.tsx` platform resolution. Existing native `.tsx` screens
and components are not rewritten. The current dirty change in
`src/modules/exchange-rates/application/useExchangeRates.ts` is unrelated and
must be preserved.

## Known limitations to carry forward

- Full Jest still reports pre-existing `act()` warnings and open asynchronous
  handles; the suite requires `--forceExit` for deterministic CLI completion.
- Browser-level screenshot and keyboard traversal verification is still
  pending.
- Admin and User authenticated shells are not yet replaced by the new web
  system.

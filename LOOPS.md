# Project loops

## License-audit-remediation

One sentence: iterate through the 11 findings of the License-management Impeccable audit (score 8/20), fix one per pass in priority order P0→P3, re-score, and close when score ≥ 14/20 or no measurable progress; then hand off to commit + push on the same branch.

**Saved**: 2026-08-14
**Source**: ad-hoc (audit at `src/screens/admin/licenses/`, `src/components/admin/licenses/`, plus 3 cross-cutting files for the `isDark` hack).

### Prompt

> Work the License-audit-remediation loop. Scope: only files under `src/screens/admin/licenses/`, `src/components/admin/licenses/`, plus the three cross-cutting files needed for the `isDark` fix (`src/components/admin/ActionTile.tsx`, `GradientCard.tsx`, `InfoCard.tsx`). Each pass picks the highest-priority open finding, applies one bounded code change, then verifies by re-reading the file, running `npx tsc --noEmit` and the targeted jest suite (or `npm test -- --testPathPattern=licenses` when no specific suite exists). Move on only when the change is in place and the verification passed. Stop when every P0 and P1 finding from the audit is fixed and re-scoring the 5 audit dimensions yields ≥ 14/20; then return a final re-audit report and stop. Hand off commit + push on the current branch (user already authorized). Ask the user only when a finding needs a decision that the audit didn't dictate.

### Worklist

| Pass | Severity | Finding | Files |
|------|----------|---------|-------|
| 1 | P0 | Cable `ExtendLicenseModal`; fix `handleExtend` to send `months` | `LicenseCard.tsx`, `ExtendLicenseModal.tsx`, `useSubscriptions.ts`, `licensesApi.ts` |
| 2 | P1 | Remove destructive theme override in detail screen | `AdminLicenseDetailScreen.tsx` |
| 3 | P1 | Add `KeyboardAvoidingView` to both modals | `AssignLicenseModal.tsx`, `ExtendLicenseModal.tsx` |
| 4 | P1 | Unwrap nested `TouchableOpacity` around `TextInput` | `ExtendLicenseModal.tsx` |
| 5 | P1 | Replace `colors.background === "#0f172a"` hack with `useIsDark()` | 6 files (`ActionTile.tsx`, `GradientCard.tsx`, `InfoCard.tsx`, `LicenseCard.tsx`, `LicenseSummaryCard.tsx`, `LicenseUserRow.tsx`) |
| 6 | P1 | `Promise.allSettled` for sequential assign | `AssignLicenseModal.tsx` |
| 7 | P2 | Distinguish error vs not-found in detail | `AdminLicenseDetailScreen.tsx` |
| 8 | P2 | `accessibilityLabel`/`Role`/`State` on FAB, tabs, cards, rows, checkboxes | both screens + 3 components |
| 9 | P2 | Touch targets ≥ 44pt (tabs, "Renovar") | `AdminLicensesListScreen.tsx`, `LicenseCard.tsx` |
| 10 | P2 | `React.memo` on `LicenseCard` | `LicenseCard.tsx` |
| 11 | P3 | Remove dead styles + dead chevron | `AdminLicenseDetailScreen.tsx`, `LicenseUserRow.tsx` |
| 12 | — | Re-run audit scoring | all files |
| 13 | — | Commit + push on current branch | repo |

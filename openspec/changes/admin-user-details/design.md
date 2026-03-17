# Design: Admin User Details Screen

## Technical Approach
Implement `AdminUserDetailsScreen` as a detail view.
1.  **Navigation**: Add to `AdminRoutes`.
2.  **Data**: Fetch full user details (mocked for now) based on `userId`.
3.  **UI**:
    - **Theme**: Use `useColorScheme` for adaptive dark/light mode.
    - **Layout**: ScrollView with Profile Header and Action Grid.

## Architecture Decisions

### Decision: Action Grid
**Choice**: CSS Grid-like layout using Flexbox `flexWrap: 'wrap'`.
**Rationale**: Responsive and simple to implement in RN.

### Decision: Theme Colors (Dark/Light)
- **Background**: Slate 900 / Slate 50.
- **Card/Action Item**: Slate 800 / White.
- **Text**: Slate 50 / Slate 900.
- **Accent**: Blue 500 (Primary actions).

## Data Flow
1.  **Entry**: Tap user in `AdminUserManagementScreen`.
2.  **Load**: Get `user` object from params (or fetch by ID).
3.  **Render**: Display profile and actions.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/screens/admin/users/AdminUserDetailsScreen.tsx` | Create | Main screen. |
| `src/components/admin/users/ActionGridItem.tsx` | Create | Reusable action button component. |
| `src/navigation/adminRoutes.tsx` | Modify | Add route. |
| `src/screens/admin/users/AdminUserManagementScreen.tsx` | Modify | Link card press. |

## Interfaces / Contracts

### Action Item Prop
```typescript
interface ActionItemProps {
  icon: string; // Ionicons name
  label: string;
  description: string;
  color: string; // Icon color
  bg: string; // Icon bg color
  onPress: () => void;
}
```

## Testing Strategy
- Manual verification of UI layout.
- Verify Theme switching.

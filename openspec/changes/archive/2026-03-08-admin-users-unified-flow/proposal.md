# Proposal: Conectar AdminUsersScreen con AdminUserManagementScreen y Eliminar Alertas

## Problem Statement

Currently there's a disconnect between the admin user management screens:
- **AdminUsersScreen**: Muestra todos los usuarios del sistema, al hacer click abre un modal
- **AdminUserManagementScreen**: Accesible solo desde AdminLicenseDetail, muestra usuarios de una licencia específica

Additionally, the app uses `Alert.alert` for success/error messages instead of proper modal UI components.

## Goals

1. **Conectar las pantallas**: AdminUsersScreen debe navegar a AdminUserManagementScreen al hacer click en un usuario
2. **Eliminar alertas**: Reemplazar todos los `Alert.alert` con modales de confirmación/éxito
3. **Flujo unificado**: Usar el mismo sistema de modales en ambas pantallas

## Proposed Solution

### 1. Navigation Flow

```
AdminServicesScreen
    └── AdminLicensesList (listado de licencias)
            └── AdminLicenseDetail (detalle de licencia)
                    └── AdminUserManagement (gestionar usuarios de licencia)
                            └── Modales de confirmación

AdminUsersScreen (acceso directo desde navegación)
    └── AdminUserManagement (todos los usuarios del sistema)
            └── Modales de confirmación
```

### 2. Eliminar Alert.alert

Reemplazar las siguientes llamadas a `Alert.alert`:

| Ubicación | Tipo | Reemplazar con |
|-----------|------|----------------|
| AdminUsersScreen:102 | Éxito crear usuario | `AddUserSuccessModal` (crear) |
| AdminUsersScreen:104 | Error crear usuario | `ErrorModal` o inline en modal |
| AdminUsersScreen:119 | Error actualizar usuario | `ErrorModal` o inline en modal |
| AdminUsersScreen:176 | Éxito ejecutar acción | `SuccessModal` genérico |
| AdminUsersScreen:185 | Error ejecutar acción | `ErrorModal` |

### 3. AdminUserManagementScreen Updates

- Eliminar dependencia de `licenseId` (hacer opcional)
- Si no hay `licenseId`, cargar todos los usuarios del sistema
- Implementar el mismo sistema de modales que AdminUsersScreen
- Click en usuario → abrir `AdminUserDetailModal` en lugar de navegar

### 4. Components to Create/Modify

| Componente | Acción |
|------------|--------|
| `AdminUsersScreen.tsx` | Cambiar `onPress` de usuario para navegar a AdminUserManagement |
| `AdminUserManagementScreen.tsx` | Añadir sistema de modales, hacer licenseId opcional |
| `SuccessModal.tsx` | Crear modal de éxito genérico |
| `ErrorModal.tsx` | Crear modal de error genérico |
| `AddUserSuccessModal.tsx` | Crear modal de éxito al crear usuario |

## Impact Analysis

### Affected Files
- `src/screens/admin/AdminUsersScreen.tsx`
- `src/screens/admin/users/AdminUserManagementScreen.tsx`
- `src/components/admin/*.tsx` (modales existentes)
- `src/navigation/adminRoutes.tsx`

### Breaking Changes
- Ninguno - es un cambio aditivo que mejora UX
- La ruta AdminLicenseDetail → AdminUserManagement sigue funcionando

## Success Criteria

1. ✅ Click en usuario de AdminUsersScreen → navega a AdminUserManagementScreen
2. ✅ No hay `Alert.alert` en ninguna de las dos pantallas
3. ✅ Todas las acciones muestran feedback visual via modales
4. ✅ El flujo desde AdminLicenseDetail sigue funcionando

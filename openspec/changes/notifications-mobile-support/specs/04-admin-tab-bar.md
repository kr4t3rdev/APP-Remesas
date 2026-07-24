# Spec: Tab de Notificaciones en Bottom Bar (AdminTabs)

## Escenario 1: Tab visible en AdminTabs (mobile)

**Given** un admin autenticado en mobile (`width < 640px`)
**When** se renderiza `AdminTabs`
**Then** aparece un tab "Notificaciones" con icono `notifications-outline`
**And** está ubicado entre "Reportes" y "Perfil"

## Escenario 2: Badge de no leídas en AdminTabs

**Given** el admin tiene notificaciones no leídas
**When** se renderiza el tab "Notificaciones"
**Then** el tab muestra un badge rojo con el conteo
**And** usa `tabBarBadge` nativo de `@react-navigation/bottom-tabs` (no custom)

## Escenario 3: Mismo NotificationScreen

**Given** el admin toca el tab "Notificaciones"
**When** se abre la screen
**Then** es el mismo componente `NotificationScreen` que usa el usuario normal
**And** la navegación al tocar una notificación está disponible (admin tiene acceso a AdminUserDetail, AdminLicenseDetail)

## Escenario 4: Sin QueryClient (fallback)

**Given** no hay `QueryClientContext` disponible
**When** se renderiza `AdminTabs`
**Then** el tab aparece sin badge
**And** al tocar se abre la screen con mensaje "No tenés notificaciones nuevas."

# Spec: Tab de Notificaciones en Bottom Bar (MainTabs)

## Escenario 1: Tab "Notificaciones" visible en mobile

**Given** un usuario autenticado en mobile (`width < 640px`)
**When** se renderiza `MainTabs` con `InstagramTabBar`
**Then** aparece un tab llamado "Notificaciones" con icono de campana (`notifications-outline`)
**And** el tab está ubicado después de "Gastos" y antes de "Perfil"

## Escenario 2: Badge de no leídas

**Given** el usuario tiene notificaciones no leídas (`unreadCount > 0`)
**When** se renderiza el tab "Notificaciones" en la bottom bar
**Then** el icono del tab muestra un badge rojo con el conteo
**And** si `unreadCount > 99`, el badge muestra "99+"

**Given** el usuario tenía notificaciones no leídas
**When** se marcan todas como leídas
**Then** el badge desaparece del tab

## Escenario 3: Sin QueryClient (fallback)

**Given** no hay `QueryClientContext` disponible
**When** se renderiza `MainTabs`
**Then** el tab "Notificaciones" aparece sin badge y sin funcionalidad de conteo
**And** al tocar el tab se abre la screen vacía con mensaje "No tenés notificaciones nuevas."

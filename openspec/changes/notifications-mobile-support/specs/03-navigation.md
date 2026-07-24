# Spec: Navegación desde notificaciones

## Escenario 1: NEW_USER_REGISTERED → AdminUserDetail

**Given** el usuario admin toca una notificación de tipo `NEW_USER_REGISTERED`
**When** la mutación markAsRead es exitosa
**Then** navega a `AdminUserDetail` con el `userId` del payload
**And** si la screen actual es `AdminTabs`, usa `navigation.navigate("AdminUserDetail", { user })`

## Escenario 2: USER_TEMP_BLOCKED / USER_BANNED → AdminUserDetail

**Given** el usuario admin toca una notificación de tipo `USER_TEMP_BLOCKED` o `USER_BANNED`
**When** la mutación markAsRead es exitosa
**Then** navega a `AdminUserDetail` con el usuario del payload

## Escenario 3: LICENSE_EXPIRING → AdminLicenseDetail

**Given** el usuario admin toca una notificación de tipo `LICENSE_EXPIRING`
**When** la mutación markAsRead es exitosa
**Then** navega a `AdminLicenseDetail` con `licenseId` del payload

## Escenario 4: PASSWORD_RESET / EMAIL_VERIFICATION → fallback

**Given** el usuario toca una notificación de tipo `PASSWORD_RESET` o `EMAIL_VERIFICATION`
**When** el payload contiene `userId`
**Then** navega a `AdminUserDetail` con ese userId
**When** el payload NO contiene `userId`
**Then** solo marca como leída, sin navegación

## Escenario 5: Usuario no-admin con notificaciones admin

**Given** un usuario NO admin (`role !== "ADMIN"`)
**When** recibe una notificación de tipo admin (NEW_USER_REGISTERED, USER_BANNED, etc.)
**Then** al tocar, solo marca como leída (no navega — esas screens no están disponibles)

## Escenario 6: Datos de usuario para navegación

**Given** se va a navegar a `AdminUserDetail`
**When** el payload contiene `{ userId, user?: { id, name, email, role, ... } }`
**Then** si `user` completo está disponible, se pasa como prop
**And** si solo está `userId`, se navega sin datos completos (la screen hará fetch propio)

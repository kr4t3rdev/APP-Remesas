/**
 * Extrae un mensaje legible desde un error de Axios (p. ej. respuestas NestJS).
 * NestJS devuelve message como string o string[] (ValidationPipe).
 * Si no hay response (error de red), devuelve mensaje de conexión.
 * 401/403 se traducen a mensajes claros para el usuario.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = "Ha ocurrido un error. Intenta de nuevo.",
): string {
  const err = error as {
    response?: { data?: { message?: string | string[] }; status?: number };
    message?: string;
  };
  const status = err?.response?.status;
  const data = err?.response?.data;
  const msg = data?.message;

  // 401: token ausente, inválido o expirado
  if (status === 401) {
    return "Sesión expirada o no autorizada. Cierra sesión y vuelve a iniciar sesión con una cuenta de administrador.";
  }

  // 403: usuario autenticado pero sin permiso (p. ej. no es ADMIN)
  if (status === 403) {
    return "No tienes permisos para esta acción. Debes iniciar sesión con una cuenta de administrador.";
  }

  if (msg != null) {
    if (Array.isArray(msg)) return msg.length ? msg.join(". ") : fallback;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }

  // Sin response: error de red, timeout o API no alcanzable
  if (!err?.response) {
    const networkMsg = err?.message;
    if (
      networkMsg &&
      (networkMsg === "Network Error" || networkMsg.includes("timeout"))
    ) {
      return "No hay conexión con el servidor. Comprueba que el API esté en ejecución y la red.";
    }
    return networkMsg && typeof networkMsg === "string" ? networkMsg : fallback;
  }

  return fallback;
}

// Simple in-repo i18n helper (es only for this task)
const translationsEs: Record<string, string> = {
  'admin.services.title': 'Servicios de Finanzas',
  'admin.services.activas': 'ACTIVAS',
  'admin.services.expiradas': 'EXPIRADAS',
  'admin.services.gestion_principal': 'Gestión Principal',
  'admin.services.licencias': 'Gestión de Licencias',
  'admin.services.control_acceso': 'Control de acceso y renovaciones',
  'admin.services.configurar_ahora': 'Configurar ahora',
  'admin.services.planes': 'Planes de Suscripción',
  'admin.services.editar_ofertas': 'Editar ofertas y niveles de precio',
  'admin.services.ver_planes': 'Ver planes',
  'admin.actions.nueva': 'Nueva',
  'admin.actions.exportar': 'Exportar',
  'admin.actions.alertas': 'Alertas',
  'admin.actions.acciones_rapidas': 'Acciones Rápidas',
  'admin.nav.inicio': 'Inicio',
  'admin.nav.servicios': 'Servicios',
  'admin.actions.otra': 'Otra',
}

export function t(key: string): string {
  return translationsEs[key] ?? key
}

export default { t }

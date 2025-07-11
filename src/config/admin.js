// Configuración del administrador por defecto
// En producción, estas credenciales deberían cambiarse inmediatamente

export const ADMIN_CONFIG = {
  // Credenciales del administrador por defecto
  DEFAULT_ADMIN: {
    username: "admin",
    fullName: "Administrador del Sistema",
    password: "GasHer1985@", // Debe cambiarse en producción
    role: "admin",
    email: "admin@elorza-arredondo.uy",
    isActive: true,
    createdAt: "2024-01-01T00:00:00.000Z",
  },

  // Roles del sistema
  ROLES: {
    ADMIN: "admin",
    USER: "user",
    MANAGER: "manager",
  },

  // Permisos por rol
  PERMISSIONS: {
    admin: [
      "CREATE_USERS",
      "EDIT_USERS",
      "DELETE_USERS",
      "VIEW_ALL_DATA",
      "EXPORT_DATA",
      "MANAGE_SYSTEM",
      "VIEW_AUDIT_LOGS",
      "MANAGE_BACKUPS",
    ],
    manager: ["VIEW_ALL_DATA", "EXPORT_DATA", "VIEW_AUDIT_LOGS"],
    user: ["VIEW_OWN_DATA", "CREATE_RECORDS", "EDIT_OWN_RECORDS"],
  },

  // Configuración de seguridad del admin
  ADMIN_SECURITY: {
    // El admin no puede ser eliminado
    PROTECTED: true,
    // El admin puede cambiar su contraseña
    CAN_CHANGE_PASSWORD: true,
    // El admin puede ver todos los logs
    CAN_VIEW_LOGS: true,
    // El admin puede gestionar backups
    CAN_MANAGE_BACKUPS: true,
  },
};

// Función para verificar si un usuario es admin
export const isAdmin = (user) => {
  return user && user.role === ADMIN_CONFIG.ROLES.ADMIN;
};

// Función para verificar si un usuario es manager
export const isManager = (user) => {
  return user && user.role === ADMIN_CONFIG.ROLES.MANAGER;
};

// Función para verificar si un usuario es admin o manager
export const isAdminOrManager = (user) => {
  return (
    user &&
    (user.role === ADMIN_CONFIG.ROLES.ADMIN ||
      user.role === ADMIN_CONFIG.ROLES.MANAGER)
  );
};

// Función para verificar si un usuario tiene un permiso específico
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  const userPermissions = ADMIN_CONFIG.PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

// Función para obtener todos los permisos de un usuario
export const getUserPermissions = (user) => {
  if (!user || !user.role) return [];
  return ADMIN_CONFIG.PERMISSIONS[user.role] || [];
};

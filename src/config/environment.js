// Configuración de entorno que funciona en navegador y servidor

// Función para obtener variables de entorno de forma segura
export const getEnvVar = (key, defaultValue) => {
  // Verificar si estamos en un entorno con process.env (Node.js/React)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // Verificar si estamos en el navegador con variables globales
  if (typeof window !== "undefined" && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }

  // Verificar variables de entorno del navegador (si están definidas)
  if (typeof window !== "undefined" && window.ENV && window.ENV[key]) {
    return window.ENV[key];
  }

  return defaultValue;
};

// Configuración de entorno
export const ENV_CONFIG = {
  // Verificar si estamos en producción
  IS_PRODUCTION: getEnvVar("NODE_ENV", "development") === "production",

  // Verificar si estamos en desarrollo
  IS_DEVELOPMENT: getEnvVar("NODE_ENV", "development") === "development",

  // Configuración de seguridad
  ENCRYPTION_KEY: getEnvVar(
    "REACT_APP_ENCRYPTION_KEY",
    "horas-cliente-secret-key-2024"
  ),
  PASSWORD_SALT: getEnvVar(
    "REACT_APP_PASSWORD_SALT",
    "horas-cliente-salt-2024"
  ),

  // Configuración de la aplicación
  APP_NAME: getEnvVar("REACT_APP_NAME", "Horas Cliente"),
  APP_VERSION: getEnvVar("REACT_APP_VERSION", "1.0.0"),

  // Configuración de logs
  LOG_LEVEL: getEnvVar("REACT_APP_LOG_LEVEL", "info"),
  ENABLE_AUDIT_LOGS:
    getEnvVar("REACT_APP_ENABLE_AUDIT_LOGS", "true") === "true",

  // Configuración de rate limiting
  RATE_LIMIT_ENABLED:
    getEnvVar("REACT_APP_RATE_LIMIT_ENABLED", "true") === "true",

  // Configuración de backup
  BACKUP_ENABLED: getEnvVar("REACT_APP_BACKUP_ENABLED", "true") === "true",
  MAX_BACKUP_SIZE: parseInt(getEnvVar("REACT_APP_MAX_BACKUP_SIZE", "10485760")), // 10MB
};

// Función para obtener configuración según el entorno
export const getConfig = (key) => {
  return ENV_CONFIG[key];
};

// Función para verificar si estamos en producción
export const isProduction = () => {
  return ENV_CONFIG.IS_PRODUCTION;
};

// Función para verificar si estamos en desarrollo
export const isDevelopment = () => {
  return ENV_CONFIG.IS_DEVELOPMENT;
};

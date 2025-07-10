// Configuración de seguridad
// En producción, estas claves deberían estar en variables de entorno

import { getEnvVar } from "./environment";

export const SECURITY_CONFIG = {
  // Clave principal para encriptación AES
  ENCRYPTION_KEY: getEnvVar(
    "REACT_APP_ENCRYPTION_KEY",
    "horas-cliente-secret-key-2024"
  ),

  // Salt para hashing de contraseñas (en producción debería ser único por usuario)
  PASSWORD_SALT: getEnvVar(
    "REACT_APP_PASSWORD_SALT",
    "horas-cliente-salt-2024"
  ),

  // Configuración de encriptación
  ENCRYPTION_CONFIG: {
    // Algoritmo de encriptación
    algorithm: "AES",
    // Modo de operación
    mode: "CBC",
    // Tamaño de clave
    keySize: 256,
  },

  // Campos sensibles que deben encriptarse
  SENSITIVE_FIELDS: [
    "email",
    "telefono",
    "identificadorFiscal",
    "securityAnswer",
  ],

  // Configuración de validación de contraseñas
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    maxLength: 16,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
  },
};

// Función para obtener la clave de encriptación
export const getEncryptionKey = () => {
  return SECURITY_CONFIG.ENCRYPTION_KEY;
};

// Función para obtener el salt de contraseñas
export const getPasswordSalt = () => {
  return SECURITY_CONFIG.PASSWORD_SALT;
};

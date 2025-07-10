import CryptoJS from "crypto-js";
import { getEncryptionKey, getPasswordSalt } from "../config/security";

// Función para encriptar datos
export const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
  } catch (error) {
    console.error("Error al encriptar:", error);
    return data; // Fallback a texto plano en caso de error
  }
};

// Función para desencriptar datos
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error al desencriptar:", error);
    return encryptedData; // Fallback al texto encriptado en caso de error
  }
};

// Función para generar hash de contraseña (one-way)
export const hashPassword = (password) => {
  try {
    const salt = getPasswordSalt();
    return CryptoJS.SHA256(password + salt).toString();
  } catch (error) {
    console.error("Error al generar hash:", error);
    return password; // Fallback en caso de error
  }
};

// Función para verificar contraseña
export const verifyPassword = (password, hashedPassword) => {
  try {
    const salt = getPasswordSalt();
    const hashedInput = CryptoJS.SHA256(password + salt).toString();
    return hashedInput === hashedPassword;
  } catch (error) {
    console.error("Error al verificar contraseña:", error);
    return false;
  }
};

// Función para encriptar datos sensibles de clientes
export const encryptClientData = (clientData) => {
  const sensitiveFields = ["email", "telefono", "identificadorFiscal"];
  const encryptedData = { ...clientData };

  sensitiveFields.forEach((field) => {
    if (encryptedData[field]) {
      encryptedData[field] = encryptData(encryptedData[field]);
    }
  });

  return encryptedData;
};

// Función para desencriptar datos sensibles de clientes
export const decryptClientData = (clientData) => {
  const sensitiveFields = ["email", "telefono", "identificadorFiscal"];
  const decryptedData = { ...clientData };

  sensitiveFields.forEach((field) => {
    if (decryptedData[field] && typeof decryptedData[field] === "string") {
      try {
        decryptedData[field] = decryptData(decryptedData[field]);
      } catch (error) {
        // Si no se puede desencriptar, mantener el valor original
        console.warn(`No se pudo desencriptar ${field}:`, error);
      }
    }
  });

  return decryptedData;
};

// Sistema de backup encriptado para exportar/importar datos

import { encryptData, decryptData } from "./encryption";
import { logAuditEvent, AUDIT_EVENTS } from "./auditLogger";

// Función para generar backup encriptado
export const generateEncryptedBackup = (data) => {
  try {
    const backupData = {
      version: "1.0",
      timestamp: new Date().toISOString(),
      data: data,
      checksum: generateChecksum(data),
    };

    const encryptedBackup = encryptData(JSON.stringify(backupData));

    // Log de auditoría
    logAuditEvent(AUDIT_EVENTS.BACKUP_CREATED, {
      dataSize: JSON.stringify(data).length,
      encryptedSize: encryptedBackup.length,
    });

    return encryptedBackup;
  } catch (error) {
    console.error("Error al generar backup:", error);
    logAuditEvent(AUDIT_EVENTS.ENCRYPTION_ERROR, { error: error.message });
    throw new Error("No se pudo generar el backup encriptado");
  }
};

// Función para restaurar backup encriptado
export const restoreEncryptedBackup = (encryptedBackup) => {
  try {
    const decryptedData = decryptData(encryptedBackup);
    const backupData = JSON.parse(decryptedData);

    // Verificar checksum
    if (backupData.checksum !== generateChecksum(backupData.data)) {
      throw new Error("El backup está corrupto o ha sido modificado");
    }

    // Verificar versión
    if (backupData.version !== "1.0") {
      throw new Error("Versión de backup no compatible");
    }

    // Log de auditoría
    logAuditEvent(AUDIT_EVENTS.BACKUP_RESTORED, {
      backupTimestamp: backupData.timestamp,
      dataSize: JSON.stringify(backupData.data).length,
    });

    return backupData.data;
  } catch (error) {
    console.error("Error al restaurar backup:", error);
    logAuditEvent(AUDIT_EVENTS.DECRYPTION_ERROR, { error: error.message });
    throw new Error("No se pudo restaurar el backup");
  }
};

// Función para generar checksum simple
const generateChecksum = (data) => {
  const dataString = JSON.stringify(data);
  let checksum = 0;
  for (let i = 0; i < dataString.length; i++) {
    checksum =
      ((checksum << 5) - checksum + dataString.charCodeAt(i)) & 0xffffffff;
  }
  return checksum.toString(16);
};

// Función para exportar backup a archivo
export const exportBackup = (data, filename = null) => {
  try {
    const encryptedBackup = generateEncryptedBackup(data);
    const backupBlob = new Blob([encryptedBackup], {
      type: "application/octet-stream",
    });

    const defaultFilename = `horas-cliente-backup-${
      new Date().toISOString().split("T")[0]
    }.enc`;
    const finalFilename = filename || defaultFilename;

    const url = window.URL.createObjectURL(backupBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = finalFilename;
    a.click();
    window.URL.revokeObjectURL(url);

    // Log de auditoría
    logAuditEvent(AUDIT_EVENTS.BACKUP_EXPORTED, {
      filename: finalFilename,
      size: encryptedBackup.length,
    });

    return true;
  } catch (error) {
    console.error("Error al exportar backup:", error);
    throw error;
  }
};

// Función para importar backup desde archivo
export const importBackup = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const encryptedBackup = e.target.result;
        const data = restoreEncryptedBackup(encryptedBackup);

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.BACKUP_IMPORTED, {
          filename: file.name,
          size: file.size,
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    reader.readAsText(file);
  });
};

// Función para validar archivo de backup
export const validateBackupFile = (file) => {
  const validExtensions = [".enc", ".backup"];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "El archivo es demasiado grande (máximo 10MB)",
    };
  }

  const extension = file.name
    .toLowerCase()
    .substring(file.name.lastIndexOf("."));
  if (!validExtensions.includes(extension)) {
    return { valid: false, error: "Formato de archivo no válido" };
  }

  return { valid: true };
};

// Función para obtener información del backup
export const getBackupInfo = (encryptedBackup) => {
  try {
    const decryptedData = decryptData(encryptedBackup);
    const backupData = JSON.parse(decryptedData);

    return {
      version: backupData.version,
      timestamp: backupData.timestamp,
      dataSize: JSON.stringify(backupData.data).length,
      isValid: backupData.checksum === generateChecksum(backupData.data),
    };
  } catch (error) {
    return { error: "No se pudo leer la información del backup" };
  }
};

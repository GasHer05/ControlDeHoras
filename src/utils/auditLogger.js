// Sistema de logs de auditoría para seguridad

// Tipos de eventos de auditoría
export const AUDIT_EVENTS = {
  // Autenticación
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  REGISTER: "REGISTER",
  PASSWORD_RECOVERY: "PASSWORD_RECOVERY",
  PASSWORD_CHANGE: "PASSWORD_CHANGE",

  // Gestión de usuarios
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_STATUS_CHANGED: "USER_STATUS_CHANGED",

  // Gestión de clientes
  CLIENT_CREATED: "CLIENT_CREATED",
  CLIENT_UPDATED: "CLIENT_UPDATED",
  CLIENT_DELETED: "CLIENT_DELETED",

  // Gestión de registros
  RECORD_CREATED: "RECORD_CREATED",
  RECORD_UPDATED: "RECORD_UPDATED",
  RECORD_DELETED: "RECORD_DELETED",

  // Backup y sistema
  BACKUP_CREATED: "BACKUP_CREATED",
  BACKUP_RESTORED: "BACKUP_RESTORED",
  BACKUP_EXPORTED: "BACKUP_EXPORTED",
  BACKUP_IMPORTED: "BACKUP_IMPORTED",

  // Seguridad
  ENCRYPTION_ERROR: "ENCRYPTION_ERROR",
  DECRYPTION_ERROR: "DECRYPTION_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Exportación
  REPORT_EXPORTED: "REPORT_EXPORTED",
  PDF_GENERATED: "PDF_GENERATED",
};

// Función para generar log de auditoría
export const logAuditEvent = (event, details = {}) => {
  const auditLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId: sessionStorage.getItem("sessionId") || "unknown",
  };

  // Guardar en localStorage para persistencia
  const existingLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
  existingLogs.push(auditLog);

  // Mantener solo los últimos 1000 logs
  if (existingLogs.length > 1000) {
    existingLogs.splice(0, existingLogs.length - 1000);
  }

  localStorage.setItem("auditLogs", JSON.stringify(existingLogs));

  // En producción, enviar a servidor de logs
  if (process.env.NODE_ENV === "production") {
    // Aquí se enviaría a un servicio de logs como Sentry, LogRocket, etc.
    console.log("AUDIT_LOG:", auditLog);
  }
};

// Función para obtener logs de auditoría
export const getAuditLogs = (limit = 100) => {
  const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
  return logs.slice(-limit);
};

// Función para limpiar logs antiguos
export const clearOldAuditLogs = (daysOld = 30) => {
  const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const filteredLogs = logs.filter(
    (log) => new Date(log.timestamp) > cutoffDate
  );

  localStorage.setItem("auditLogs", JSON.stringify(filteredLogs));
};

// Función para exportar logs
export const exportAuditLogs = () => {
  const logs = getAuditLogs(1000);
  const csvContent = [
    "Timestamp,Event,Details,UserAgent,URL,SessionID",
    ...logs.map(
      (log) =>
        `"${log.timestamp}","${log.event}","${JSON.stringify(log.details)}","${
          log.userAgent
        }","${log.url}","${log.sessionId}"`
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { isAdmin, isManager, hasPermission } from "../config/admin";
import "./AuditoriaPage.css";

// Página de auditoría para managers y admins
function AuditoriaPage() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const [logs, setLogs] = useState([]);
  const [filtro, setFiltro] = useState({
    fechaInicio: "",
    fechaFin: "",
    tipo: "todos",
    usuario: "",
  });

  // Verificar permisos
  const canViewLogs = hasPermission(currentUser, "VIEW_AUDIT_LOGS");
  const canExportData = hasPermission(currentUser, "EXPORT_DATA");
  const isUserAdmin = isAdmin(currentUser);
  const isUserManager = isManager(currentUser);

  useEffect(() => {
    // Simular carga de logs desde localStorage
    const auditLogs = JSON.parse(localStorage.getItem("audit_logs") || "[]");
    setLogs(auditLogs);
  }, []);

  // Filtrar logs
  const logsFiltrados = logs.filter((log) => {
    const { fechaInicio, fechaFin, tipo, usuario } = filtro;

    if (fechaInicio && log.timestamp < fechaInicio) return false;
    if (fechaFin && log.timestamp > fechaFin) return false;
    if (tipo !== "todos" && log.event !== tipo) return false;
    if (usuario && !log.username?.toLowerCase().includes(usuario.toLowerCase()))
      return false;

    return true;
  });

  // Exportar logs
  const exportarLogs = () => {
    const dataStr = JSON.stringify(logsFiltrados, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Exportar backup (solo admin)
  const exportarBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      users: JSON.parse(localStorage.getItem("persist:root") || "{}"),
      clientes: JSON.parse(localStorage.getItem("clientes") || "[]"),
      registros: JSON.parse(localStorage.getItem("registrosHoras") || "[]"),
      logs: logs,
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `backup_completo_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!canViewLogs) {
    return (
      <div className="auditoria-page">
        <h1>Acceso Denegado</h1>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="auditoria-page">
      <h1>Auditoría del Sistema</h1>

      {/* Información del usuario */}
      <div className="user-info-section">
        <h3>Información del Usuario</h3>
        <p>
          <strong>Usuario:</strong>{" "}
          {currentUser?.fullName || currentUser?.username}
        </p>
        <p>
          <strong>Rol:</strong> {currentUser?.role}
        </p>
        <p>
          <strong>Permisos:</strong>{" "}
          {isUserAdmin
            ? "Administrador"
            : isUserManager
            ? "Manager"
            : "Usuario"}
        </p>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <h3>Filtros</h3>
        <div className="filtros-container">
          <div className="filtro-item">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              value={filtro.fechaInicio}
              onChange={(e) =>
                setFiltro({ ...filtro, fechaInicio: e.target.value })
              }
            />
          </div>

          <div className="filtro-item">
            <label>Fecha Fin:</label>
            <input
              type="date"
              value={filtro.fechaFin}
              onChange={(e) =>
                setFiltro({ ...filtro, fechaFin: e.target.value })
              }
            />
          </div>

          <div className="filtro-item">
            <label>Tipo de Evento:</label>
            <select
              value={filtro.tipo}
              onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
            >
              <option value="todos">Todos los eventos</option>
              <option value="LOGIN_SUCCESS">Login exitoso</option>
              <option value="LOGIN_FAILED">Login fallido</option>
              <option value="LOGOUT">Logout</option>
              <option value="REGISTER">Registro de usuario</option>
              <option value="USER_UPDATED">Usuario actualizado</option>
              <option value="USER_DELETED">Usuario eliminado</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Usuario:</label>
            <input
              type="text"
              placeholder="Buscar por usuario..."
              value={filtro.usuario}
              onChange={(e) =>
                setFiltro({ ...filtro, usuario: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="acciones-section">
        <h3>Acciones</h3>
        <div className="acciones-container">
          {canExportData && (
            <button onClick={exportarLogs} className="btn-exportar">
              📊 Exportar Logs
            </button>
          )}

          {isUserAdmin && (
            <button onClick={exportarBackup} className="btn-backup">
              💾 Exportar Backup Completo
            </button>
          )}
        </div>
      </div>

      {/* Lista de logs */}
      <div className="logs-section">
        <h3>Logs de Auditoría ({logsFiltrados.length} registros)</h3>

        {logsFiltrados.length === 0 ? (
          <p>No hay logs que coincidan con los filtros seleccionados.</p>
        ) : (
          <div className="logs-container">
            {logsFiltrados.map((log, index) => (
              <div key={index} className="log-item">
                <div className="log-header">
                  <span className="log-timestamp">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className={`log-event log-${log.event.toLowerCase()}`}>
                    {log.event}
                  </span>
                </div>
                <div className="log-details">
                  <p>
                    <strong>Usuario:</strong> {log.username || "N/A"}
                  </p>
                  <p>
                    <strong>Detalles:</strong>{" "}
                    {JSON.stringify(log.details || {})}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuditoriaPage;

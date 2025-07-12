import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { isAdmin, isManager, hasPermission } from "../config/admin";
import { AUDIT_EVENTS } from "../utils/auditLogger";
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
    texto: "",
  });
  const [detalleExpandido, setDetalleExpandido] = useState(null);

  // Verificar permisos
  const canViewLogs = hasPermission(currentUser, "VIEW_AUDIT_LOGS");
  const canExportData = hasPermission(currentUser, "EXPORT_DATA");
  const isUserAdmin = isAdmin(currentUser);
  const isUserManager = isManager(currentUser);

  useEffect(() => {
    // Cargar logs desde localStorage
    const auditLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
    setLogs(auditLogs.reverse()); // Mostrar los más recientes primero
  }, []);

  // Filtrar logs
  const logsFiltrados = logs.filter((log) => {
    const { fechaInicio, fechaFin, tipo, usuario, texto } = filtro;
    if (fechaInicio && log.timestamp < fechaInicio) return false;
    if (fechaFin && log.timestamp > fechaFin) return false;
    if (tipo !== "todos" && log.event !== tipo) return false;
    if (
      usuario &&
      !(log.details?.usuario || log.username || "")
        .toLowerCase()
        .includes(usuario.toLowerCase())
    )
      return false;
    if (
      texto &&
      !JSON.stringify(log).toLowerCase().includes(texto.toLowerCase())
    )
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
      <p className="auditoria-explicacion">
        Aquí puedes ver el historial de acciones importantes realizadas en el
        sistema (creación, edición, eliminación, login, etc.). Usa los filtros
        para buscar por usuario, tipo de acción, fecha o texto.
      </p>
      {/* Filtros */}
      <div className="filtros-section">
        <input
          type="date"
          value={filtro.fechaInicio}
          onChange={(e) =>
            setFiltro({ ...filtro, fechaInicio: e.target.value })
          }
          placeholder="Fecha inicio"
        />
        <input
          type="date"
          value={filtro.fechaFin}
          onChange={(e) => setFiltro({ ...filtro, fechaFin: e.target.value })}
          placeholder="Fecha fin"
        />
        <select
          value={filtro.tipo}
          onChange={(e) => setFiltro({ ...filtro, tipo: e.target.value })}
        >
          <option value="todos">Todos los eventos</option>
          {Object.values(AUDIT_EVENTS).map((ev) => (
            <option key={ev} value={ev}>
              {ev}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={filtro.usuario}
          onChange={(e) => setFiltro({ ...filtro, usuario: e.target.value })}
          placeholder="Usuario"
        />
        <input
          type="text"
          value={filtro.texto}
          onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })}
          placeholder="Buscar en detalles..."
        />
      </div>
      {/* Tabla de logs */}
      <div style={{ overflowX: "auto" }}>
        <table className="auditoria-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Usuario</th>
              <th>Acción</th>
              <th>Detalles</th>
            </tr>
          </thead>
          <tbody>
            {logsFiltrados.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  No hay logs que coincidan con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              logsFiltrados.map((log, idx) => {
                const usuario =
                  log.details?.usuario ||
                  log.details?.username ||
                  log.username ||
                  log.details?.fullName ||
                  "-";
                const resumen =
                  log.details && Object.keys(log.details).length > 0
                    ? Object.entries(log.details)
                        .map(
                          ([k, v]) =>
                            `${k}: ${
                              typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)
                            }`
                        )
                        .join(", ")
                        .slice(0, 60) +
                      (Object.keys(log.details).length > 1 ? "..." : "")
                    : "-";
                const tieneDetalles =
                  log.details && Object.keys(log.details).length > 0;
                return (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? "fila-par" : "fila-impar"}
                  >
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{usuario}</td>
                    <td>{log.event}</td>
                    <td
                      style={{
                        maxWidth: 400,
                        whiteSpace: "pre-wrap",
                        fontSize: 13,
                        verticalAlign: "top",
                      }}
                    >
                      <div className="detalle-flex">
                        <span className="detalle-resumen">{resumen}</span>
                        <button
                          className="btn-detalle"
                          style={{ visibility: "visible" }}
                          onClick={() =>
                            tieneDetalles
                              ? setDetalleExpandido(
                                  detalleExpandido === idx ? null : idx
                                )
                              : null
                          }
                          disabled={!tieneDetalles}
                        >
                          {detalleExpandido === idx ? "Ocultar" : "Ver más"}
                        </button>
                      </div>
                      {detalleExpandido === idx && tieneDetalles && (
                        <div className="detalle-expandido">
                          {Object.entries(log.details).map(([k, v]) => (
                            <div key={k}>
                              <strong>{k}:</strong>{" "}
                              {typeof v === "object"
                                ? JSON.stringify(v)
                                : String(v)}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
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
    </div>
  );
}

export default AuditoriaPage;

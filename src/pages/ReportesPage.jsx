import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import ReporteCliente from "../components/reportes/ReporteCliente.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import { isAdminOrManager, hasPermission } from "../config/admin";
import "./ReportesPage.css";

// Página principal de reportes
function ReportesPage() {
  const clientes = useSelector((state) => state.clientes);
  const registros = useSelector((state) => state.registrosHoras);
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Verificar permisos
  const canExportData = hasPermission(currentUser, "EXPORT_DATA");
  const isUserAdminOrManager = isAdminOrManager(currentUser);

  const [filtro, setFiltro] = useState({ fechaInicio: "", fechaFin: "" });
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");

  // Filtrar registros por fechas
  const registrosFiltrados = useMemo(() => {
    return registros.filter((r) => {
      const fecha = r.fecha;
      const { fechaInicio, fechaFin } = filtro;
      if (fechaInicio && fecha < fechaInicio) return false;
      if (fechaFin && fecha > fechaFin) return false;
      return true;
    });
  }, [registros, filtro]);

  // Calcular estadísticas generales
  const estadisticasGenerales = useMemo(() => {
    const totalHoras = registrosFiltrados.reduce((sum, r) => sum + r.horas, 0);
    const totalMonto = registrosFiltrados.reduce((sum, r) => sum + r.monto, 0);
    const totalRegistros = registrosFiltrados.length;

    return { totalHoras, totalMonto, totalRegistros };
  }, [registrosFiltrados]);

  // Función para exportar reporte
  const exportarReporte = () => {
    const reporteData = {
      fecha: new Date().toISOString(),
      filtros: filtro,
      estadisticas: estadisticasGenerales,
      registros: registrosFiltrados,
      clienteSeleccionado: clienteSeleccionado,
    };

    const dataStr = JSON.stringify(reporteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Función para exportar datos
  const exportarDatos = () => {
    const datosExport = {
      fecha: new Date().toISOString(),
      registros: registrosFiltrados,
      clientes: clientes,
      estadisticas: estadisticasGenerales,
    };

    const dataStr = JSON.stringify(datosExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `datos_export_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reportes-page">
      <h1>Reportes</h1>

      {/* Información del usuario para managers */}
      {isUserAdminOrManager && (
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
            {canExportData ? "Puede exportar datos" : "Solo visualización"}
          </p>
        </div>
      )}

      {/* Filtros */}
      <div className="filtros-section">
        <h3>Filtros</h3>
        <div className="filtros-container">
          <FiltroFechas
            fechaInicio={filtro.fechaInicio}
            fechaFin={filtro.fechaFin}
            onChange={setFiltro}
          />

          <div className="filtro-cliente">
            <label>Cliente específico:</label>
            <select
              value={clienteSeleccionado}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="estadisticas-generales">
        <h3>Resumen General</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Horas:</span>
            <span className="stat-value">
              {estadisticasGenerales.totalHoras}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Facturado:</span>
            <span className="stat-value">
              ${estadisticasGenerales.totalMonto}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Registros:</span>
            <span className="stat-value">
              {estadisticasGenerales.totalRegistros}
            </span>
          </div>
        </div>

        {/* Botones de exportación para managers */}
        {canExportData && (
          <div className="export-actions">
            <button onClick={() => exportarReporte()} className="btn-exportar">
              📊 Exportar Reporte
            </button>
            <button onClick={() => exportarDatos()} className="btn-exportar">
              📋 Exportar Datos
            </button>
          </div>
        )}
      </div>

      {/* Reportes por cliente */}
      <div className="reportes-clientes">
        <h3>Reportes por Cliente</h3>

        {clienteSeleccionado ? (
          // Reporte de cliente específico
          <ReporteCliente
            cliente={clientes.find((c) => c.id === clienteSeleccionado)}
            registros={registrosFiltrados.filter(
              (r) => r.clienteId === clienteSeleccionado
            )}
          />
        ) : (
          // Reportes de todos los clientes
          clientes.map((cliente) => {
            const registrosCliente = registrosFiltrados.filter(
              (r) => r.clienteId === cliente.id
            );
            if (registrosCliente.length === 0) return null;

            return (
              <ReporteCliente
                key={cliente.id}
                cliente={cliente}
                registros={registrosCliente}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default ReportesPage;

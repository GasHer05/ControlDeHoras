import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import ReporteCliente from "../components/reportes/ReporteCliente.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import { isAdminOrManager, hasPermission } from "../config/admin";
import "./ReportesPage.css";

// Dashboard de reportes con diseño moderno y visual
function ReportesPage() {
  const clientes = useSelector((state) =>
    Array.isArray(state.clientes.clientes) ? state.clientes.clientes : []
  );
  const registros = useSelector((state) =>
    Array.isArray(state.registrosHoras.registros)
      ? state.registrosHoras.registros
      : []
  );
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Verificar permisos
  const canExportData = hasPermission(currentUser, "EXPORT_DATA");
  const isUserAdminOrManager = isAdminOrManager(currentUser);

  const [filtro, setFiltro] = useState({ fechaInicio: "", fechaFin: "" });
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard"); // "dashboard", "clientes", "exportar"

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
    const clientesActivos = new Set(registrosFiltrados.map((r) => r.clienteId))
      .size;
    const promedioPorRegistro =
      totalRegistros > 0 ? totalMonto / totalRegistros : 0;

    return {
      totalHoras,
      totalMonto,
      totalRegistros,
      clientesActivos,
      promedioPorRegistro,
    };
  }, [registrosFiltrados]);

  // Calcular estadísticas por cliente
  const estadisticasPorCliente = useMemo(() => {
    const stats = {};
    registrosFiltrados.forEach((registro) => {
      if (!stats[registro.clienteId]) {
        stats[registro.clienteId] = {
          horas: 0,
          monto: 0,
          registros: 0,
        };
      }
      stats[registro.clienteId].horas += registro.horas;
      stats[registro.clienteId].monto += registro.monto;
      stats[registro.clienteId].registros += 1;
    });
    return stats;
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
      <h1>📊 Dashboard de Reportes</h1>

      {/* Filtros principales */}
      <div className="filtros-principales">
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

      {/* Navegación del dashboard */}
      <div className="dashboard-nav">
        <button
          className={`nav-button ${
            activeSection === "dashboard" ? "active" : ""
          }`}
          onClick={() => setActiveSection("dashboard")}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-button ${
            activeSection === "clientes" ? "active" : ""
          }`}
          onClick={() => setActiveSection("clientes")}
        >
          👥 Reportes por Cliente
        </button>
        {canExportData && (
          <button
            className={`nav-button ${
              activeSection === "exportar" ? "active" : ""
            }`}
            onClick={() => setActiveSection("exportar")}
          >
            📋 Exportar Datos
          </button>
        )}
      </div>

      {/* Contenido del dashboard */}
      <div className="dashboard-content">
        {activeSection === "dashboard" && (
          <div className="dashboard-section">
            {/* Tarjetas de KPIs */}
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-icon">💰</div>
                <div className="kpi-content">
                  <h3>Total Facturado</h3>
                  <div className="kpi-value">
                    ${estadisticasGenerales.totalMonto.toFixed(2)} + IVA
                  </div>
                  <div className="kpi-subtitle">
                    {estadisticasGenerales.totalRegistros} registros
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">⏰</div>
                <div className="kpi-content">
                  <h3>Horas Trabajadas</h3>
                  <div className="kpi-value">
                    {estadisticasGenerales.totalHoras.toFixed(1)}h
                  </div>
                  <div className="kpi-subtitle">
                    Promedio:{" "}
                    {(
                      estadisticasGenerales.totalHoras /
                      Math.max(estadisticasGenerales.totalRegistros, 1)
                    ).toFixed(1)}
                    h/registro
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <h3>Clientes Activos</h3>
                  <div className="kpi-value">
                    {estadisticasGenerales.clientesActivos}
                  </div>
                  <div className="kpi-subtitle">de {clientes.length} total</div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">📈</div>
                <div className="kpi-content">
                  <h3>Promedio por Registro</h3>
                  <div className="kpi-value">
                    ${estadisticasGenerales.promedioPorRegistro.toFixed(2)} +
                    IVA
                  </div>
                  <div className="kpi-subtitle">Valor promedio</div>
                </div>
              </div>
            </div>

            {/* Gráfico de clientes más activos */}
            <div className="chart-section">
              <h3>📊 Top Clientes por Facturación</h3>
              <div className="clientes-chart">
                {clientes
                  .map((cliente) => ({
                    ...cliente,
                    ...estadisticasPorCliente[cliente.id],
                  }))
                  .filter((cliente) => cliente.monto > 0)
                  .sort((a, b) => b.monto - a.monto)
                  .slice(0, 5)
                  .map((cliente, index) => (
                    <div key={cliente.id} className="cliente-bar">
                      <div className="bar-info">
                        <span className="cliente-nombre">{cliente.nombre}</span>
                        <span className="cliente-monto">
                          ${cliente.monto.toFixed(2)} + IVA
                        </span>
                      </div>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${
                              (cliente.monto /
                                Math.max(
                                  ...clientes.map(
                                    (c) =>
                                      estadisticasPorCliente[c.id]?.monto || 0
                                  )
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Información del usuario para managers */}
            {isUserAdminOrManager && (
              <div className="user-info-section">
                <h3>👤 Información del Usuario</h3>
                <div className="user-info-grid">
                  <div className="user-info-item">
                    <span className="info-label">Usuario:</span>
                    <span className="info-value">
                      {currentUser?.fullName || currentUser?.username}
                    </span>
                  </div>
                  <div className="user-info-item">
                    <span className="info-label">Rol:</span>
                    <span className="info-value">{currentUser?.role}</span>
                  </div>
                  <div className="user-info-item">
                    <span className="info-label">Permisos:</span>
                    <span className="info-value">
                      {canExportData
                        ? "Puede exportar datos"
                        : "Solo visualización"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "clientes" && (
          <div className="clientes-section">
            <h3>👥 Reportes por Cliente</h3>
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
              <div className="reportes-grid">
                {clientes.map((cliente) => {
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
                })}
              </div>
            )}
          </div>
        )}

        {activeSection === "exportar" && canExportData && (
          <div className="exportar-section">
            <h3>📋 Exportar Datos</h3>
            <div className="export-options">
              <div className="export-card">
                <h4>📊 Exportar Reporte</h4>
                <p>
                  Genera un reporte completo con estadísticas y datos filtrados
                </p>
                <button onClick={exportarReporte} className="btn-exportar">
                  📊 Exportar Reporte
                </button>
              </div>

              <div className="export-card">
                <h4>📋 Exportar Datos Completos</h4>
                <p>
                  Exporta todos los datos en formato JSON para análisis externo
                </p>
                <button onClick={exportarDatos} className="btn-exportar">
                  📋 Exportar Datos
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportesPage;

import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReporteCliente from "../components/reportes/ReporteCliente.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import { isAdminOrManager, hasPermission } from "../config/admin";
import { MONEDAS, MONEDA_INFO, formatMoney } from "../utils/currency";
import { calcularIVA } from "../utils/tarifas";
import { fetchClientes } from "../store/clientesSlice";
import { fetchRegistrosHoras } from "../store/registrosHorasSlice";
import { selectClientesDecrypted } from "../utils/selectors";
import "./ReportesPage.css";

function estadisticasVacias() {
  return { totalHoras: 0, totalMonto: 0, totalRegistros: 0 };
}

// Dashboard de reportes con diseño moderno y visual
function ReportesPage() {
  const dispatch = useDispatch();
  const clientes = useSelector(selectClientesDecrypted);
  const registros = useSelector((state) =>
    Array.isArray(state.registrosHoras.registros)
      ? state.registrosHoras.registros
      : []
  );
  const currentUser = useSelector((state) => state.auth.currentUser);
  const ivaRate = useSelector((state) => state.config.ivaRate);

  // Verificar permisos
  const canExportData = hasPermission(currentUser, "EXPORT_DATA");
  const isUserAdminOrManager = isAdminOrManager(currentUser);

  const [filtro, setFiltro] = useState({ fechaInicio: "", fechaFin: "" });
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard"); // "dashboard", "clientes", "exportar"

  // Cargar clientes y registros al montar: este dashboard no puede depender
  // de que el usuario haya visitado antes las paginas de Clientes/Registros
  useEffect(() => {
    dispatch(fetchClientes());
    dispatch(fetchRegistrosHoras());
  }, [dispatch]);

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

  // Estadísticas generales que sí pueden combinarse entre monedas (horas, cantidad
  // de registros, clientes activos) porque no son montos de dinero.
  const resumenGeneral = useMemo(() => {
    const clientesSet = new Set(registrosFiltrados.map((r) => r.clienteId));
    return {
      totalHoras: registrosFiltrados.reduce((sum, r) => sum + r.horas, 0),
      totalRegistros: registrosFiltrados.length,
      clientesActivos: clientesSet.size,
    };
  }, [registrosFiltrados]);

  // Estadísticas de facturación agrupadas por moneda: nunca se suma UYU con USD
  const estadisticasPorMoneda = useMemo(() => {
    const stats = { UYU: estadisticasVacias(), USD: estadisticasVacias() };
    registrosFiltrados.forEach((r) => {
      const moneda = r.moneda || "UYU";
      if (!stats[moneda]) stats[moneda] = estadisticasVacias();
      stats[moneda].totalHoras += r.horas;
      stats[moneda].totalMonto += r.monto;
      stats[moneda].totalRegistros += 1;
    });
    Object.keys(stats).forEach((moneda) => {
      const s = stats[moneda];
      s.totalIVA = calcularIVA(s.totalMonto, ivaRate);
      s.totalConIVA = Math.round((s.totalMonto + s.totalIVA) * 100) / 100;
      s.promedioPorRegistro =
        s.totalRegistros > 0 ? s.totalMonto / s.totalRegistros : 0;
    });
    return stats;
  }, [registrosFiltrados, ivaRate]);

  const monedasConDatos = MONEDAS.filter(
    (m) => estadisticasPorMoneda[m]?.totalRegistros > 0
  );

  // Estadísticas por cliente, agrupadas también por moneda
  const estadisticasPorCliente = useMemo(() => {
    const stats = {};
    registrosFiltrados.forEach((registro) => {
      const moneda = registro.moneda || "UYU";
      if (!stats[registro.clienteId]) stats[registro.clienteId] = {};
      if (!stats[registro.clienteId][moneda]) {
        stats[registro.clienteId][moneda] = {
          horas: 0,
          monto: 0,
          registros: 0,
        };
      }
      stats[registro.clienteId][moneda].horas += registro.horas;
      stats[registro.clienteId][moneda].monto += registro.monto;
      stats[registro.clienteId][moneda].registros += 1;
    });
    return stats;
  }, [registrosFiltrados]);

  // Función para exportar reporte
  const exportarReporte = () => {
    const reporteData = {
      fecha: new Date().toISOString(),
      filtros: filtro,
      estadisticas: estadisticasPorMoneda,
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
      estadisticas: estadisticasPorMoneda,
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
            {/* KPIs generales (no monetarios, se pueden combinar) */}
            <div className="kpi-cards">
              <div className="kpi-card">
                <div className="kpi-icon">⏰</div>
                <div className="kpi-content">
                  <h3>Horas Trabajadas</h3>
                  <div className="kpi-value">
                    {resumenGeneral.totalHoras.toFixed(1)}h
                  </div>
                  <div className="kpi-subtitle">
                    {resumenGeneral.totalRegistros} registros
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">👥</div>
                <div className="kpi-content">
                  <h3>Clientes Activos</h3>
                  <div className="kpi-value">
                    {resumenGeneral.clientesActivos}
                  </div>
                  <div className="kpi-subtitle">de {clientes.length} total</div>
                </div>
              </div>
            </div>

            {/* Facturación por moneda: nunca se mezcla UYU con USD */}
            {monedasConDatos.length === 0 ? (
              <p className="sin-datos">No hay facturación en el período seleccionado.</p>
            ) : (
              <div className="facturacion-por-moneda">
                {monedasConDatos.map((moneda) => {
                  const s = estadisticasPorMoneda[moneda];
                  return (
                    <div key={moneda} className="moneda-kpi-group">
                      <h3 className={`moneda-kpi-titulo badge-moneda badge-${moneda.toLowerCase()}`}>
                        {MONEDA_INFO[moneda].label}
                      </h3>
                      <div className="kpi-cards">
                        <div className="kpi-card">
                          <div className="kpi-icon">💰</div>
                          <div className="kpi-content">
                            <h3>Subtotal</h3>
                            <div className="kpi-value">
                              {formatMoney(s.totalMonto, moneda)}
                            </div>
                            <div className="kpi-subtitle">
                              {s.totalRegistros} registros
                            </div>
                          </div>
                        </div>
                        <div className="kpi-card">
                          <div className="kpi-icon">🧾</div>
                          <div className="kpi-content">
                            <h3>Total con IVA ({ivaRate}%)</h3>
                            <div className="kpi-value">
                              {formatMoney(s.totalConIVA, moneda)}
                            </div>
                            <div className="kpi-subtitle">
                              IVA: {formatMoney(s.totalIVA, moneda)}
                            </div>
                          </div>
                        </div>
                        <div className="kpi-card">
                          <div className="kpi-icon">📈</div>
                          <div className="kpi-content">
                            <h3>Promedio por Registro</h3>
                            <div className="kpi-value">
                              {formatMoney(s.promedioPorRegistro, moneda)}
                            </div>
                            <div className="kpi-subtitle">Valor promedio</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Gráfico de clientes más activos, un ranking por moneda */}
            <div className="chart-section">
              <h3>📊 Top Clientes por Facturación</h3>
              {monedasConDatos.map((moneda) => {
                const top = clientes
                  .map((cliente) => ({
                    ...cliente,
                    stat: estadisticasPorCliente[cliente.id]?.[moneda],
                  }))
                  .filter((cliente) => cliente.stat && cliente.stat.monto > 0)
                  .sort((a, b) => b.stat.monto - a.stat.monto)
                  .slice(0, 5);

                if (top.length === 0) return null;
                const maxMonto = Math.max(...top.map((c) => c.stat.monto), 1);

                return (
                  <div key={moneda} className="clientes-chart">
                    <h4 className={`badge-moneda badge-${moneda.toLowerCase()}`}>
                      {MONEDA_INFO[moneda].label}
                    </h4>
                    {top.map((cliente) => (
                      <div key={cliente.id} className="cliente-bar">
                        <div className="bar-info">
                          <span className="cliente-nombre">{cliente.nombre}</span>
                          <span className="cliente-monto">
                            {formatMoney(cliente.stat.monto, moneda)}
                          </span>
                        </div>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${(cliente.stat.monto / maxMonto) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
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

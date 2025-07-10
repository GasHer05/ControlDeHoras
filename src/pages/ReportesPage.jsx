import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import ReporteCliente from "../components/reportes/ReporteCliente.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import "./ReportesPage.css";

// Página principal de reportes
function ReportesPage() {
  const clientes = useSelector((state) => state.clientes);
  const registros = useSelector((state) => state.registrosHoras);

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

  return (
    <div className="reportes-page">
      <h1>Reportes</h1>

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

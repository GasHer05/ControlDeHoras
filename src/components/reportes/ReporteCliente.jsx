import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./ReporteCliente.css";

// Logo removido por simplicidad

function formatFechaLocal(fechaIso) {
  if (!fechaIso) return "-";
  const fecha = new Date(fechaIso);
  return (
    fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
  );
}

function renderDescuento(tipo, valor) {
  if (!tipo || !valor) return null;
  if (tipo === "porcentaje")
    return <span className="descuento-info">Descuento: {valor}%</span>;
  if (tipo === "monto")
    return <span className="descuento-info">Descuento: ${valor}</span>;
  return null;
}

function exportarPDF({ cliente, registros, estadisticas }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Logo removido

  // Encabezado
  doc.setFontSize(16);
  doc.text("Reporte de Horas", pageWidth / 2, 48, { align: "center" });
  doc.setFontSize(10);
  doc.text("Elorza - Arredondo Abogados", pageWidth / 2, 55, {
    align: "center",
  });
  doc.text("Constituyente 1467 oficina 503, Montevideo", pageWidth / 2, 60, {
    align: "center",
  });
  doc.text("contacto@elorza-arredondo.uy", pageWidth / 2, 65, {
    align: "center",
  });

  // Datos del cliente
  let y = 75;
  doc.setFontSize(12);
  doc.text(`Cliente: ${cliente.nombre}`, 14, y);
  doc.setFontSize(10);
  doc.text(`Email: ${cliente.email || "-"}`, 14, y + 6);
  doc.text(`Teléfono: ${cliente.telefono || "-"}`, 14, y + 12);
  doc.text(`Dirección: ${cliente.direccion || "-"}`, 14, y + 18);
  doc.text(
    `Identificador Fiscal: ${cliente.identificadorFiscal || "-"}`,
    14,
    y + 24
  );
  doc.text(`Valor por hora: $${cliente.valorHora}`, 14, y + 30);
  if (cliente.tipoDescuento && cliente.valorDescuento) {
    doc.text(
      `Descuento: ${
        cliente.tipoDescuento === "porcentaje"
          ? cliente.valorDescuento + "%"
          : "$" + cliente.valorDescuento
      }`,
      14,
      y + 36
    );
  }

  // Estadísticas
  y += 42;
  doc.setFontSize(11);
  doc.text(`Total Horas: ${estadisticas.totalHoras}`, 14, y);
  doc.text(`Total Facturado: $${estadisticas.totalMonto}`, 70, y);
  doc.text(`Total Registros: ${estadisticas.totalRegistros}`, 140, y);

  // Tabla de registros
  y += 8;
  autoTable(doc, {
    startY: y + 5,
    head: [["Fecha", "Horas", "Monto", "Descuento", "Descripción"]],
    body: registros.map((r) => [
      r.fecha,
      r.horas,
      `$${r.monto}`,
      r.tipoDescuento && r.valorDescuento
        ? r.tipoDescuento === "porcentaje"
          ? `${r.valorDescuento}%`
          : `$${r.valorDescuento}`
        : "-",
      r.descripcion || "-",
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 46, 58] },
    margin: { left: 10, right: 10 },
    theme: "grid",
  });

  doc.save(`Reporte_${cliente.nombre.replace(/\s+/g, "_")}.pdf`);
}

// Componente que muestra el reporte de un cliente específico
function ReporteCliente({ cliente, registros }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);

  // Calcular estadísticas del cliente
  const estadisticas = useMemo(() => {
    const totalHoras = registros.reduce((sum, r) => sum + r.horas, 0);
    const totalMonto = registros.reduce((sum, r) => sum + r.monto, 0);
    const promedioHoras =
      registros.length > 0 ? totalHoras / registros.length : 0;

    return {
      totalHoras,
      totalMonto,
      promedioHoras,
      totalRegistros: registros.length,
    };
  }, [registros]);

  // Ordenar registros por fecha (más recientes primero)
  const registrosOrdenados = useMemo(() => {
    return [...registros].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [registros]);

  if (!cliente) return null;

  return (
    <div className="reporte-cliente">
      <div className="reporte-header">
        <div className="cliente-info">
          <h4>{cliente.nombre}</h4>
          <span className="valor-hora">
            Valor por hora: ${cliente.valorHora}
          </span>
          {renderDescuento(cliente.tipoDescuento, cliente.valorDescuento)}
        </div>

        <div className="estadisticas-cliente">
          <div className="stat">
            <span className="stat-label">Total Horas:</span>
            <span className="stat-value">{estadisticas.totalHoras}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Facturado:</span>
            <span className="stat-value">${estadisticas.totalMonto}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Promedio por registro:</span>
            <span className="stat-value">
              {estadisticas.promedioHoras.toFixed(2)}h
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Total Registros:</span>
            <span className="stat-value">{estadisticas.totalRegistros}</span>
          </div>
        </div>

        <button
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
          className="toggle-detalles"
        >
          {mostrarDetalles ? "Ocultar detalles" : "Ver detalles"}
        </button>
        <button
          onClick={() =>
            exportarPDF({
              cliente,
              registros: registrosOrdenados,
              estadisticas,
            })
          }
          className="exportar-pdf-btn"
        >
          Exportar a PDF
        </button>
      </div>

      {mostrarDetalles && (
        <div className="registros-detalle">
          <div className="auditoria-cliente">
            <div>
              <strong>Creado por:</strong> {cliente.creadoPor || "-"}
              {" | "}
              <strong>Fecha:</strong> {formatFechaLocal(cliente.fechaCreacion)}
            </div>
            <div>
              <strong>Última modificación por:</strong>{" "}
              {cliente.modificadoPor || "-"}
              {" | "}
              <strong>Fecha:</strong>{" "}
              {formatFechaLocal(cliente.fechaModificacion)}
            </div>
          </div>
          <h5>Registros detallados:</h5>
          <div className="registros-lista">
            {registrosOrdenados.map((registro) => (
              <div key={registro.id} className="registro-item">
                <div className="registro-fecha">{registro.fecha}</div>
                <div className="registro-horas">{registro.horas}h</div>
                <div className="registro-monto">${registro.monto}</div>
                <div className="registro-descripcion">
                  {registro.descripcion || "Sin descripción"}
                </div>
                <div className="registro-auditoria">
                  <span>
                    <strong>Creado por:</strong> {registro.creadoPor || "-"} |{" "}
                    <strong>Fecha:</strong>{" "}
                    {formatFechaLocal(registro.fechaCreacion)}
                  </span>
                  <br />
                  <span>
                    <strong>Modificado por:</strong>{" "}
                    {registro.modificadoPor || "-"} | <strong>Fecha:</strong>{" "}
                    {formatFechaLocal(registro.fechaModificacion)}
                  </span>
                  {renderDescuento(
                    registro.tipoDescuento,
                    registro.valorDescuento
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReporteCliente;

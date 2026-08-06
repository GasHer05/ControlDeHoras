import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../../assets/elorza-arredondo.jpg";
import { MONEDAS, MONEDA_INFO, formatMoney, formatNumber } from "../../utils/currency";
import { calcularIVA } from "../../utils/tarifas";
import { useSelector } from "react-redux";
import "./ReporteCliente.css";

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

function renderDescuento(tipo, valor, moneda) {
  if (!tipo || !valor) return null;
  if (tipo === "porcentaje")
    return <span className="descuento-info">Descuento: {valor}%</span>;
  if (tipo === "monto")
    return (
      <span className="descuento-info">
        Descuento: {formatMoney(valor, moneda)}
      </span>
    );
  return null;
}

// Agrupa los registros de un cliente por moneda y calcula sus totales/IVA
function agruparPorMoneda(registros, ivaRate) {
  const grupos = {};
  registros.forEach((r) => {
    const moneda = r.moneda || "UYU";
    if (!grupos[moneda]) {
      grupos[moneda] = { moneda, registros: [], totalHoras: 0, totalMonto: 0 };
    }
    grupos[moneda].registros.push(r);
    grupos[moneda].totalHoras += r.horas;
    grupos[moneda].totalMonto += r.monto;
  });
  return MONEDAS.map((moneda) => grupos[moneda])
    .filter(Boolean)
    .map((g) => {
      const totalIVA = calcularIVA(g.totalMonto, ivaRate);
      return {
        ...g,
        totalIVA,
        totalConIVA: Math.round((g.totalMonto + totalIVA) * 100) / 100,
        promedioHoras: g.registros.length ? g.totalHoras / g.registros.length : 0,
      };
    });
}

async function cargarLogoBase64() {
  try {
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("No se pudo cargar el logo:", error);
    return null;
  }
}

async function exportarPDF({ cliente, gruposPorMoneda, ivaRate }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoBase64 = await cargarLogoBase64();

  if (logoBase64) {
    const img = new window.Image();
    img.src = logoBase64;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    const desiredWidth = 40; // mm
    const aspectRatio = img.width / img.height;
    const calculatedHeight = desiredWidth / aspectRatio;
    doc.addImage(logoBase64, "JPEG", 15, 15, desiredWidth, calculatedHeight);
  }

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

  y += 32;

  // Una sección por cada moneda con registros, nunca se mezclan los totales
  gruposPorMoneda.forEach((grupo) => {
    const info = MONEDA_INFO[grupo.moneda];
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`${info.label}`, 14, y);
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);
    doc.text(`Subtotal: ${info.simbolo} ${formatNumber(grupo.totalMonto)}`, 14, y + 6);
    doc.text(`IVA (${ivaRate}%): ${info.simbolo} ${formatNumber(grupo.totalIVA)}`, 90, y + 6);
    doc.text(`Total: ${info.simbolo} ${formatNumber(grupo.totalConIVA)}`, 160, y + 6);
    doc.text(`Total Horas: ${grupo.totalHoras}`, 14, y + 12);

    autoTable(doc, {
      startY: y + 16,
      head: [["Fecha", "Horas", "Monto", "Descuento", "Descripción"]],
      body: grupo.registros.map((r) => [
        r.fecha,
        r.horas,
        `${info.simbolo} ${formatNumber(r.monto)}`,
        r.tipoDescuento && r.valorDescuento
          ? r.tipoDescuento === "porcentaje"
            ? `${r.valorDescuento}%`
            : `${info.simbolo} ${formatNumber(r.valorDescuento)}`
          : "-",
        r.descripcion || "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 46, 58] },
      margin: { left: 10, right: 10 },
      theme: "grid",
    });

    y = doc.lastAutoTable.finalY + 14;
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`Reporte_${cliente.nombre.replace(/\s+/g, "_")}.pdf`);
}

// Componente que muestra el reporte de un cliente específico
function ReporteCliente({ cliente, registros }) {
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const ivaRate = useSelector((state) => state.config.ivaRate);

  const gruposPorMoneda = useMemo(
    () => agruparPorMoneda(registros, ivaRate),
    [registros, ivaRate]
  );

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
        </div>

        <div className="estadisticas-por-moneda">
          {gruposPorMoneda.map((grupo) => (
            <div key={grupo.moneda} className="estadisticas-moneda-bloque">
              <span className={`badge-moneda badge-${grupo.moneda.toLowerCase()}`}>
                {grupo.moneda}
              </span>
              <div className="estadisticas-cliente">
                <div className="stat">
                  <span className="stat-label">Horas:</span>
                  <span className="stat-value">{grupo.totalHoras}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Subtotal:</span>
                  <span className="stat-value">
                    {formatMoney(grupo.totalMonto, grupo.moneda)}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">IVA ({ivaRate}%):</span>
                  <span className="stat-value">
                    {formatMoney(grupo.totalIVA, grupo.moneda)}
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">
                    {formatMoney(grupo.totalConIVA, grupo.moneda)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setMostrarDetalles(!mostrarDetalles)}
          className="toggle-detalles"
        >
          {mostrarDetalles ? "Ocultar detalles" : "Ver detalles"}
        </button>
        <button
          onClick={() => exportarPDF({ cliente, gruposPorMoneda, ivaRate })}
          className="exportar-pdf"
        >
          Exportar a PDF
        </button>
      </div>

      {mostrarDetalles && (
        <div className="reporte-detalles">
          <p>
            <strong>Creado por:</strong> {cliente.creadoPor || "-"} |{" "}
            <strong>Fecha:</strong>{" "}
            {cliente.fechaCreacion
              ? formatFechaLocal(cliente.fechaCreacion)
              : "-"}
          </p>
          <p>
            <strong>Última modificación por:</strong>{" "}
            {cliente.modificadoPor || "-"} | <strong>Fecha:</strong>{" "}
            {cliente.fechaActualizacion
              ? formatFechaLocal(cliente.fechaActualizacion)
              : "-"}
          </p>
          <h4>Registros detallados:</h4>
          <div className="registros-lista">
            {registrosOrdenados.map((registro) => {
              const moneda = registro.moneda || "UYU";
              return (
                <div key={registro.id} className="registro-item">
                  <div className="registro-fecha">{registro.fecha}</div>
                  <div className="registro-horas">{registro.horas}h</div>
                  <div className="registro-monto">
                    <span className={`badge-moneda badge-${moneda.toLowerCase()}`}>
                      {moneda}
                    </span>{" "}
                    {formatMoney(registro.monto, moneda)}
                  </div>
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
                      registro.valorDescuento,
                      moneda
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReporteCliente;

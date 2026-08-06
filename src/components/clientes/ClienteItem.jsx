import React from "react";
import { MONEDAS, MONEDA_INFO, formatMoney } from "../../utils/currency";
import { getTarifa } from "../../utils/tarifas";
import "./ClienteItem.css";

function renderDescuento(tipo, valor, moneda) {
  if (!tipo || !valor) return null;
  const info = MONEDA_INFO[moneda];
  if (tipo === "porcentaje")
    return <span className="descuento-info">Descuento: {valor}%</span>;
  if (tipo === "monto")
    return (
      <span className="descuento-info">
        Descuento: {info.simbolo} {valor}
      </span>
    );
  return null;
}

// Item individual de cliente
// Props:
// - cliente: objeto cliente
// - onEdit: función para editar
// - onDelete: función para eliminar
function ClienteItem({ cliente, onEdit, onDelete }) {
  const tarifas = MONEDAS.map((moneda) => ({
    moneda,
    tarifa: getTarifa(cliente, moneda),
  })).filter((t) => t.tarifa);

  return (
    <div className="cliente-item">
      <div className="cliente-item-info">
        <div className="cliente-item-header">
          <strong>{cliente.nombre}</strong>
          <div className="cliente-item-badges">
            {tarifas.map(({ moneda }) => (
              <span key={moneda} className={`badge-moneda badge-${moneda.toLowerCase()}`}>
                {moneda}
              </span>
            ))}
          </div>
        </div>
        <div className="cliente-item-meta">
          <span>
            <strong>Email:</strong> {cliente.email || "-"}
          </span>
          <span>
            <strong>Teléfono:</strong> {cliente.telefono || "-"}
          </span>
          <span>
            <strong>Dirección:</strong> {cliente.direccion || "-"}
          </span>
          <span>
            <strong>Id. Fiscal:</strong> {cliente.identificadorFiscal || "-"}
          </span>
        </div>
        <div className="cliente-item-tarifas">
          {tarifas.map(({ moneda, tarifa }) => (
            <div key={moneda} className="cliente-item-tarifa">
              <span>
                Valor por hora ({moneda}): {formatMoney(tarifa.valorHora, moneda)}
              </span>
              {renderDescuento(tarifa.tipoDescuento, tarifa.valorDescuento, moneda)}
            </div>
          ))}
        </div>
      </div>
      <div className="item-actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete} className="btn-danger">
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default ClienteItem;

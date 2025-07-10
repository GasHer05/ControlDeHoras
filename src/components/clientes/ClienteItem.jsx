import React from "react";
import "./ClienteItem.css";

function renderDescuento(tipo, valor) {
  if (!tipo || !valor) return null;
  if (tipo === "porcentaje")
    return <span className="descuento-info">Descuento: {valor}%</span>;
  if (tipo === "monto")
    return <span className="descuento-info">Descuento: ${valor}</span>;
  return null;
}

// Item individual de cliente
// Props:
// - cliente: objeto cliente
// - onEdit: función para editar
// - onDelete: función para eliminar
function ClienteItem({ cliente, onEdit, onDelete }) {
  return (
    <div className="cliente-item">
      <div>
        <strong>{cliente.nombre}</strong> <br />
        <span>Contacto: {cliente.contacto || "-"}</span> <br />
        <span>Valor por hora: ${cliente.valorHora}</span>
        <br />
        {renderDescuento(cliente.tipoDescuento, cliente.valorDescuento)}
      </div>
      <div className="item-actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete}>Eliminar</button>
      </div>
    </div>
  );
}

export default ClienteItem;

import React from "react";
import "./RegistroHoraItem.css";

// Item individual de registro de horas
// Props:
// - registro: objeto registro de horas
// - cliente: objeto cliente correspondiente
// - onEdit: función para editar
// - onDelete: función para eliminar
function RegistroHoraItem({ registro, cliente, onEdit, onDelete }) {
  return (
    <div className="registro-hora-item">
      <div>
        <strong>{cliente ? cliente.nombre : "Cliente eliminado"}</strong> <br />
        <span>Fecha: {registro.fecha}</span> <br />
        <span>Horas: {registro.horas}</span> <br />
        <span>Descripción: {registro.descripcion || "-"}</span> <br />
        <span>Monto: ${registro.monto}</span>
      </div>
      <div className="item-actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete}>Eliminar</button>
      </div>
    </div>
  );
}

export default RegistroHoraItem;

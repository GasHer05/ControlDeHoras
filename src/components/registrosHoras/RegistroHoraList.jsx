import React from "react";
import RegistroHoraItem from "./RegistroHoraItem.jsx";
import "./RegistroHoraList.css";

// Listado de registros de horas
// Props:
// - registros: array de registros de horas
// - clientes: array de clientes (para mostrar nombre)
// - onEdit: función para editar un registro
// - onDelete: función para eliminar un registro
function RegistroHoraList({ registros, clientes, onEdit, onDelete }) {
  if (registros.length === 0) {
    return <p>No hay registros de horas.</p>;
  }
  return (
    <div className="registro-hora-list">
      {registros.map((registro) => (
        <RegistroHoraItem
          key={registro.id}
          registro={registro}
          cliente={clientes.find((c) => c.id === registro.clienteId)}
          onEdit={() => onEdit(registro)}
          onDelete={() => onDelete(registro.id)}
        />
      ))}
    </div>
  );
}

export default RegistroHoraList;

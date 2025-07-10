import React from "react";
import ClienteItem from "./ClienteItem.jsx";
import "./ClienteList.css";

// Listado de clientes
// Props:
// - clientes: array de clientes
// - onEdit: función para editar un cliente
// - onDelete: función para eliminar un cliente
function ClienteList({ clientes, onEdit, onDelete }) {
  if (clientes.length === 0) {
    return <p>No hay clientes cargados.</p>;
  }
  return (
    <div className="cliente-list">
      {clientes.map((cliente) => (
        <ClienteItem
          key={cliente.id}
          cliente={cliente}
          onEdit={() => onEdit(cliente)}
          onDelete={() => onDelete(cliente.id)}
        />
      ))}
    </div>
  );
}

export default ClienteList;

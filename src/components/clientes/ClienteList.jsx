import React, { useState, useMemo } from "react";
import ClienteItem from "./ClienteItem.jsx";
import "./ClienteList.css";

// Listado de clientes con búsqueda y filtros
// Props:
// - clientes: array de clientes
// - onEdit: función para editar un cliente
// - onDelete: función para eliminar un cliente
function ClienteList({ clientes, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nombre"); // "nombre", "valorHora", "fechaCreacion"

  // Filtrar y ordenar clientes
  const filteredAndSortedClientes = useMemo(() => {
    let filtered = clientes;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = clientes.filter(
        (cliente) =>
          cliente.nombre?.toLowerCase().includes(term) ||
          cliente.email?.toLowerCase().includes(term) ||
          cliente.telefono?.toLowerCase().includes(term) ||
          cliente.identificadorFiscal?.toLowerCase().includes(term)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nombre":
          return (a.nombre || "").localeCompare(b.nombre || "");
        case "valorHora":
          return (b.valorHora || 0) - (a.valorHora || 0);
        case "fechaCreacion":
          return (
            new Date(b.fechaCreacion || 0) - new Date(a.fechaCreacion || 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [clientes, searchTerm, sortBy]);

  if (clientes.length === 0) {
    return (
      <div className="cliente-list-empty">
        <p>No hay clientes cargados.</p>
      </div>
    );
  }

  return (
    <div className="cliente-list-container">
      {/* Barra de búsqueda y filtros */}
      <div className="cliente-list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              className="clear-search"
              onClick={() => setSearchTerm("")}
              title="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        <div className="sort-container">
          <label htmlFor="sort-select">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="nombre">Nombre</option>
            <option value="valorHora">Valor por Hora</option>
            <option value="fechaCreacion">Fecha de Creación</option>
          </select>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <span>
          {filteredAndSortedClientes.length} de {clientes.length} clientes
          {searchTerm && ` que coinciden con "${searchTerm}"`}
        </span>
      </div>

      {/* Lista de clientes */}
      <div className="cliente-list">
        {filteredAndSortedClientes.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron clientes que coincidan con tu búsqueda.</p>
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm("");
                setSortBy("nombre");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          filteredAndSortedClientes.map((cliente) => (
            <ClienteItem
              key={cliente.id}
              cliente={cliente}
              onEdit={() => onEdit(cliente)}
              onDelete={() => onDelete(cliente.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ClienteList;

import React, { useState, useMemo } from "react";
import RegistroHoraItem from "./RegistroHoraItem.jsx";
import "./RegistroHoraList.css";

// Listado de registros de horas con búsqueda y filtros
// Props:
// - registros: array de registros de horas
// - clientes: array de clientes (para mostrar nombre)
// - onEdit: función para editar un registro
// - onDelete: función para eliminar un registro
function RegistroHoraList({ registros, clientes, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("fecha"); // "fecha", "cliente", "horas", "monto"
  const [filterCliente, setFilterCliente] = useState("");

  // Filtrar y ordenar registros
  const filteredAndSortedRegistros = useMemo(() => {
    let filtered = registros;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = registros.filter((registro) => {
        const cliente = clientes.find((c) => c.id === registro.clienteId);
        return (
          cliente?.nombre?.toLowerCase().includes(term) ||
          registro.descripcion?.toLowerCase().includes(term) ||
          registro.fecha?.toLowerCase().includes(term)
        );
      });
    }

    // Filtrar por cliente específico
    if (filterCliente) {
      filtered = filtered.filter(
        (registro) => registro.clienteId === filterCliente
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "fecha":
          return new Date(b.fecha || 0) - new Date(a.fecha || 0);
        case "cliente":
          const clienteA = clientes.find((c) => c.id === a.clienteId);
          const clienteB = clientes.find((c) => c.id === b.clienteId);
          return (clienteA?.nombre || "").localeCompare(clienteB?.nombre || "");
        case "horas":
          return (b.horas || 0) - (a.horas || 0);
        case "monto":
          return (b.monto || 0) - (a.monto || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [registros, clientes, searchTerm, sortBy, filterCliente]);

  if (registros.length === 0) {
    return (
      <div className="registro-hora-list-empty">
        <p>No hay registros de horas.</p>
      </div>
    );
  }

  return (
    <div className="registro-hora-list-container">
      {/* Barra de búsqueda y filtros */}
      <div className="registro-hora-list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar registros..."
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

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="cliente-filter">Filtrar por cliente:</label>
            <select
              id="cliente-filter"
              value={filterCliente}
              onChange={(e) => setFilterCliente(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-select">Ordenar por:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="fecha">Fecha</option>
              <option value="cliente">Cliente</option>
              <option value="horas">Horas</option>
              <option value="monto">Monto</option>
            </select>
          </div>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="results-info">
        <span>
          {filteredAndSortedRegistros.length} de {registros.length} registros
          {searchTerm && ` que coinciden con "${searchTerm}"`}
          {filterCliente && ` del cliente seleccionado`}
        </span>
      </div>

      {/* Lista de registros */}
      <div className="registro-hora-list">
        {filteredAndSortedRegistros.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron registros que coincidan con tu búsqueda.</p>
            <button
              className="btn-clear-filters"
              onClick={() => {
                setSearchTerm("");
                setFilterCliente("");
                setSortBy("fecha");
              }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          filteredAndSortedRegistros.map((registro) => (
            <RegistroHoraItem
              key={registro.id}
              registro={registro}
              cliente={clientes.find((c) => c.id === registro.clienteId)}
              onEdit={() => onEdit(registro)}
              onDelete={() => onDelete(registro.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default RegistroHoraList;

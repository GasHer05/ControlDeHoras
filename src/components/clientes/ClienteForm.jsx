import React, { useState, useEffect } from "react";
import "./ClienteForm.css";

// Formulario para agregar o editar un cliente
// Props:
// - onSubmit: función a ejecutar al enviar el formulario
// - initialData: datos iniciales para edición (opcional)
// - onCancel: función para cancelar la edición (opcional)
function ClienteForm({ onSubmit, initialData = null, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [valorHora, setValorHora] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState("");
  const [valorDescuento, setValorDescuento] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "");
      setContacto(initialData.contacto || "");
      setValorHora(initialData.valorHora || "");
      setTipoDescuento(initialData.tipoDescuento || "");
      setValorDescuento(initialData.valorDescuento || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !valorHora) return; // Validación básica
    onSubmit({
      nombre,
      contacto,
      valorHora: Number(valorHora),
      tipoDescuento,
      valorDescuento: valorDescuento ? Number(valorDescuento) : "",
    });
    if (!initialData) {
      setNombre("");
      setContacto("");
      setValorHora("");
      setTipoDescuento("");
      setValorDescuento("");
    }
  };

  return (
    <form className="cliente-form" onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Datos de contacto:</label>
        <input
          type="text"
          value={contacto}
          onChange={(e) => setContacto(e.target.value)}
        />
      </div>
      <div>
        <label>Valor por hora:</label>
        <input
          type="number"
          value={valorHora}
          onChange={(e) => setValorHora(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label>Descuento/Bonificación (opcional):</label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={tipoDescuento}
            onChange={(e) => setTipoDescuento(e.target.value)}
          >
            <option value="">Sin descuento</option>
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto">Monto fijo ($)</option>
          </select>
          {tipoDescuento && (
            <input
              type="number"
              value={valorDescuento}
              onChange={(e) => setValorDescuento(e.target.value)}
              min="0"
              step="0.01"
              placeholder={
                tipoDescuento === "porcentaje" ? "% descuento" : "$ descuento"
              }
              style={{ width: "120px" }}
            />
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="submit">
          {initialData ? "Guardar cambios" : "Agregar cliente"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ClienteForm;

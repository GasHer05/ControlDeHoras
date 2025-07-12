import React, { useState, useEffect } from "react";
import "./RegistroHoraForm.css";

// Formulario para agregar o editar un registro de horas
// Props:
// - clientes: array de clientes para seleccionar
// - onSubmit: función a ejecutar al enviar el formulario
// - initialData: datos iniciales para edición (opcional)
// - onCancel: función para cancelar la edición (opcional)
function RegistroHoraForm({
  clientes = [],
  onSubmit,
  initialData = null,
  onCancel,
}) {
  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (initialData) {
      setClienteId(initialData.clienteId || "");
      setFecha(initialData.fecha || "");
      setHoras(initialData.horas || "");
      setDescripcion(initialData.descripcion || "");
    }
  }, [initialData]);

  // Buscar datos del cliente seleccionado
  const cliente = clientes.find((c) => c.id === clienteId);
  const valorHora = cliente?.valorHora || 0;
  const tipoDescuento = cliente?.tipoDescuento || "";
  const valorDescuento = cliente?.valorDescuento || "";

  // Calcular monto con descuento
  let monto = horas && valorHora ? Number(horas) * Number(valorHora) : 0;
  let descuentoAplicado = 0;
  if (tipoDescuento === "porcentaje" && valorDescuento) {
    descuentoAplicado = monto * (valorDescuento / 100);
  } else if (tipoDescuento === "monto" && valorDescuento) {
    descuentoAplicado = Number(valorDescuento);
  }
  let montoFinal = monto - descuentoAplicado;
  if (montoFinal < 0) montoFinal = 0;
  montoFinal = Math.round(montoFinal * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clienteId || !fecha || !horas) return; // Validación básica
    onSubmit({
      clienteId,
      fecha,
      horas: Number(horas),
      descripcion,
      valorHora,
      tipoDescuento,
      valorDescuento,
    });
    if (!initialData) {
      setClienteId("");
      setFecha("");
      setHoras("");
      setDescripcion("");
    }
  };

  return (
    <form className="registro-hora-form" onSubmit={handleSubmit}>
      <div>
        <label>Cliente:</label>
        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
          required
        >
          <option value="">Seleccionar cliente</option>
          {clientes.map((cliente) => (
            <option key={cliente.id} value={cliente.id}>
              {cliente.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Fecha:</label>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Cantidad de horas:</label>
        <input
          type="number"
          value={horas}
          onChange={(e) => setHoras(e.target.value)}
          required
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <label>Descripción:</label>
        <input
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
      <div>
        <label>Monto calculado:</label>
        <input type="text" value={montoFinal} readOnly />
        {tipoDescuento && valorDescuento ? (
          <div className="descuento-info">
            Descuento aplicado:{" "}
            {tipoDescuento === "porcentaje"
              ? `${valorDescuento}%`
              : `$${valorDescuento}`}{" "}
            ({descuentoAplicado > 0 ? `-$${descuentoAplicado.toFixed(2)}` : ""})
          </div>
        ) : null}
      </div>
      <div className="form-actions">
        <button type="submit">
          {initialData ? "Guardar cambios" : "Registrar horas"}
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

export default RegistroHoraForm;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { calcularMonto } from "../../store/registrosHorasSlice";
import { getTarifa, monedasDisponibles, calcularIVA } from "../../utils/tarifas";
import { MONEDA_INFO, formatMoney } from "../../utils/currency";
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
  const ivaRate = useSelector((state) => state.config.ivaRate);

  const [clienteId, setClienteId] = useState("");
  const [moneda, setMoneda] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setClienteId(initialData.clienteId || "");
      setMoneda(initialData.moneda || "UYU");
      setFecha(initialData.fecha || "");
      setHoras(initialData.horas || "");
      setDescripcion(initialData.descripcion || "");
    }
  }, [initialData]);

  const cliente = clientes.find((c) => c.id === clienteId);
  const monedasCliente = monedasDisponibles(cliente);

  // Ajustar la moneda seleccionada cuando cambia el cliente
  useEffect(() => {
    if (!cliente) {
      setMoneda("");
      return;
    }
    if (!monedasCliente.includes(moneda)) {
      setMoneda(monedasCliente[0] || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clienteId]);

  const tarifa = getTarifa(cliente, moneda);
  const valorHora = tarifa?.valorHora || 0;
  const tipoDescuento = tarifa?.tipoDescuento || "";
  const valorDescuento = tarifa?.valorDescuento || "";

  const montoFinal = calcularMonto(
    Number(horas) || 0,
    valorHora,
    tipoDescuento,
    valorDescuento
  );
  const descuentoAplicado =
    horas && valorHora ? Number(horas) * valorHora - montoFinal : 0;
  const iva = calcularIVA(montoFinal, ivaRate);
  const totalConIva = Math.round((montoFinal + iva) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!clienteId || !fecha || !horas) {
      setError("Completá cliente, fecha y horas.");
      return;
    }
    if (!moneda) {
      setError("El cliente seleccionado no tiene ninguna tarifa configurada.");
      return;
    }
    onSubmit({
      clienteId,
      fecha,
      horas: Number(horas),
      descripcion,
      moneda,
      valorHora,
      tipoDescuento,
      valorDescuento,
    });
    if (!initialData) {
      setClienteId("");
      setMoneda("");
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
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {monedasCliente.length > 1 && (
        <div>
          <label>Moneda:</label>
          <div className="moneda-selector">
            {monedasCliente.map((m) => (
              <button
                key={m}
                type="button"
                className={`moneda-opcion ${moneda === m ? "activa" : ""}`}
                onClick={() => setMoneda(m)}
              >
                {MONEDA_INFO[m].label}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {moneda && (
        <div className="desglose-monto">
          <div className="desglose-linea">
            <span>Subtotal</span>
            <span>{formatMoney(montoFinal, moneda)}</span>
          </div>
          {tipoDescuento && valorDescuento ? (
            <div className="descuento-info">
              Descuento aplicado:{" "}
              {tipoDescuento === "porcentaje"
                ? `${valorDescuento}%`
                : formatMoney(valorDescuento, moneda)}{" "}
              ({descuentoAplicado > 0 ? `-${formatMoney(descuentoAplicado, moneda)}` : ""})
            </div>
          ) : null}
          <div className="desglose-linea">
            <span>IVA ({ivaRate}%)</span>
            <span>{formatMoney(iva, moneda)}</span>
          </div>
          <div className="desglose-linea desglose-total">
            <span>Total</span>
            <span>{formatMoney(totalConIva, moneda)}</span>
          </div>
        </div>
      )}

      {error && <span className="field-error">{error}</span>}

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

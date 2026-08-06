import React, { useState, useEffect } from "react";
import { MONEDA_INFO } from "../../utils/currency";
import "./ClienteForm.css";

// Formulario para agregar o editar un cliente
// Props:
// - onSubmit: función a ejecutar al enviar el formulario
// - initialData: datos iniciales para edición (opcional)
// - onCancel: función para cancelar la edición (opcional)

const TARIFA_VACIA = { valorHora: "", tipoDescuento: "", valorDescuento: "" };

function tarifaDesdeCliente(cliente, moneda) {
  if (!cliente) return { activo: false, ...TARIFA_VACIA };
  if (cliente.tarifas) {
    const t = cliente.tarifas[moneda];
    if (!t) return { activo: false, ...TARIFA_VACIA };
    return {
      activo: true,
      valorHora: t.valorHora != null ? String(t.valorHora) : "",
      tipoDescuento: t.tipoDescuento || "",
      valorDescuento: t.valorDescuento != null ? String(t.valorDescuento) : "",
    };
  }
  // Cliente legacy: el valorHora suelto se trata como tarifa UYU
  if (moneda === "UYU" && cliente.valorHora) {
    return {
      activo: true,
      valorHora: String(cliente.valorHora),
      tipoDescuento: cliente.tipoDescuento || "",
      valorDescuento:
        cliente.valorDescuento != null ? String(cliente.valorDescuento) : "",
    };
  }
  return { activo: false, ...TARIFA_VACIA };
}

// Bloque de tarifa para una moneda específica
function TarifaFields({ moneda, tarifa, onChange }) {
  const info = MONEDA_INFO[moneda];
  return (
    <div className={`tarifa-bloque ${tarifa.activo ? "activo" : ""}`}>
      <label className="tarifa-checkbox">
        <input
          type="checkbox"
          checked={tarifa.activo}
          onChange={(e) => onChange({ ...tarifa, activo: e.target.checked })}
        />
        Facturar en {info.label}
      </label>

      {tarifa.activo && (
        <div className="tarifa-detalle">
          <div>
            <label>Valor por hora ({info.simbolo}):</label>
            <input
              type="number"
              value={tarifa.valorHora}
              onChange={(e) =>
                onChange({ ...tarifa, valorHora: e.target.value })
              }
              required
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label>Descuento/Bonificación (opcional):</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <select
                value={tarifa.tipoDescuento}
                onChange={(e) =>
                  onChange({ ...tarifa, tipoDescuento: e.target.value })
                }
              >
                <option value="">Sin descuento</option>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto fijo ({info.simbolo})</option>
              </select>
              {tarifa.tipoDescuento && (
                <input
                  type="number"
                  value={tarifa.valorDescuento}
                  onChange={(e) =>
                    onChange({ ...tarifa, valorDescuento: e.target.value })
                  }
                  min="0"
                  step="0.01"
                  placeholder={
                    tarifa.tipoDescuento === "porcentaje"
                      ? "% descuento"
                      : `${info.simbolo} descuento`
                  }
                  style={{ width: "120px" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClienteForm({ onSubmit, initialData = null, onCancel }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [identificadorFiscal, setIdentificadorFiscal] = useState("");
  const [tarifaUYU, setTarifaUYU] = useState({ activo: false, ...TARIFA_VACIA });
  const [tarifaUSD, setTarifaUSD] = useState({ activo: false, ...TARIFA_VACIA });
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "");
      setEmail(initialData.email || "");
      setTelefono(initialData.telefono || "");
      setDireccion(initialData.direccion || "");
      setIdentificadorFiscal(initialData.identificadorFiscal || "");
      setTarifaUYU(tarifaDesdeCliente(initialData, "UYU"));
      setTarifaUSD(tarifaDesdeCliente(initialData, "USD"));
    }
  }, [initialData]);

  const tarifaAObjeto = (tarifa) =>
    tarifa.activo && tarifa.valorHora
      ? {
          valorHora: Number(tarifa.valorHora),
          tipoDescuento: tarifa.tipoDescuento,
          valorDescuento: tarifa.valorDescuento
            ? Number(tarifa.valorDescuento)
            : "",
        }
      : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!nombre) {
      setError("El nombre es obligatorio.");
      return;
    }

    const tarifas = {
      UYU: tarifaAObjeto(tarifaUYU),
      USD: tarifaAObjeto(tarifaUSD),
    };

    if (!tarifas.UYU && !tarifas.USD) {
      setError(
        "Configurá al menos una tarifa (en pesos o en dólares) con su valor por hora."
      );
      return;
    }

    onSubmit({
      nombre,
      email,
      telefono,
      direccion,
      identificadorFiscal,
      tarifas,
    });

    if (!initialData) {
      setNombre("");
      setEmail("");
      setTelefono("");
      setDireccion("");
      setIdentificadorFiscal("");
      setTarifaUYU({ activo: false, ...TARIFA_VACIA });
      setTarifaUSD({ activo: false, ...TARIFA_VACIA });
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
          placeholder="Adrea Perez"
        />
      </div>
      <div>
        <label>Correo electrónico:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@email.com"
        />
      </div>
      <div>
        <label>Teléfono:</label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="+598 1234 5678"
        />
      </div>
      <div>
        <label>Dirección:</label>
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección completa"
        />
      </div>
      <div>
        <label>Identificador Fiscal:</label>
        <input
          type="text"
          value={identificadorFiscal}
          onChange={(e) => setIdentificadorFiscal(e.target.value)}
          placeholder="RUT o identificación fiscal"
        />
      </div>

      <div className="tarifas-container">
        <label>Tarifas de facturación:</label>
        <TarifaFields moneda="UYU" tarifa={tarifaUYU} onChange={setTarifaUYU} />
        <TarifaFields moneda="USD" tarifa={tarifaUSD} onChange={setTarifaUSD} />
      </div>

      {error && <span className="field-error">{error}</span>}

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

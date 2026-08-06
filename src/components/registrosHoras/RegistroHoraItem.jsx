import React from "react";
import { useSelector } from "react-redux";
import { formatMoney } from "../../utils/currency";
import { calcularIVA } from "../../utils/tarifas";
import "./RegistroHoraItem.css";

// Item individual de registro de horas
// Props:
// - registro: objeto registro de horas
// - cliente: objeto cliente correspondiente
// - onEdit: función para editar
// - onDelete: función para eliminar
function RegistroHoraItem({ registro, cliente, onEdit, onDelete }) {
  const ivaRate = useSelector((state) => state.config.ivaRate);
  const moneda = registro.moneda || "UYU";
  const iva = calcularIVA(registro.monto, ivaRate);
  const total = Math.round((registro.monto + iva) * 100) / 100;

  return (
    <div className="registro-hora-item">
      <div>
        <div className="registro-hora-header">
          <strong>{cliente ? cliente.nombre : "Cliente eliminado"}</strong>
          <span className={`badge-moneda badge-${moneda.toLowerCase()}`}>
            {moneda}
          </span>
        </div>
        <div className="registro-hora-meta">
          <span>
            <strong>Fecha:</strong> {registro.fecha}
          </span>
          <span>
            <strong>Horas:</strong> {registro.horas}
          </span>
          <span>
            <strong>Descripción:</strong> {registro.descripcion || "-"}
          </span>
        </div>
        <div className="desglose-linea desglose-total registro-hora-monto">
          <span>
            {formatMoney(registro.monto, moneda)} + IVA ({ivaRate}%):{" "}
            {formatMoney(iva, moneda)}
          </span>
          <span>= {formatMoney(total, moneda)}</span>
        </div>
      </div>
      <div className="item-actions">
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete} className="btn-danger">
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default RegistroHoraItem;

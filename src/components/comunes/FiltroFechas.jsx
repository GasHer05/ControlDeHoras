import React from "react";
import "./FiltroFechas.css";

// Componente para filtrar por rango de fechas
// Props:
// - fechaInicio: valor actual de la fecha de inicio
// - fechaFin: valor actual de la fecha de fin
// - onChange: función que recibe ({ fechaInicio, fechaFin }) cuando cambian los valores
function FiltroFechas({ fechaInicio, fechaFin, onChange }) {
  return (
    <div className="filtro-fechas">
      <label>
        Desde:
        <input
          type="date"
          value={fechaInicio || ""}
          onChange={(e) => onChange({ fechaInicio: e.target.value, fechaFin })}
        />
      </label>
      <label>
        Hasta:
        <input
          type="date"
          value={fechaFin || ""}
          onChange={(e) => onChange({ fechaInicio, fechaFin: e.target.value })}
        />
      </label>
    </div>
  );
}

export default FiltroFechas;

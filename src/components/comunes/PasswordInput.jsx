import React, { useState } from "react";
import "./PasswordInput.css";

// Input de contraseña reutilizable con opción de mostrar/ocultar
function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input type={visible ? "text" : "password"} className={className} {...props} />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        tabIndex={-1}
      >
        {visible ? "🙈" : "👁️"}
      </button>
    </div>
  );
}

export default PasswordInput;

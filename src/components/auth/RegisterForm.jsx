import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearMessages } from "../../store/authSlice";
import "./RegisterForm.css";

// Componente de formulario de registro
function RegisterForm({ onSwitchToLogin }) {
  const dispatch = useDispatch();
  const { error, success } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Limpiar mensajes al montar el componente
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Validar campos
  const validateFields = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida";
    } else if (password.length < 4) {
      errors.password = "La contraseña debe tener al menos 4 caracteres";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    dispatch(register({ username, password }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Registrarse</h2>

        {(error || success) && (
          <div className={`message ${error ? "error" : "success"}`}>
            {error || success}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label>Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={validationErrors.username ? "error" : ""}
            />
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
          </div>

          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={validationErrors.password ? "error" : ""}
            />
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          <div>
            <label>Confirmar Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={validationErrors.confirmPassword ? "error" : ""}
            />
            {validationErrors.confirmPassword && (
              <span className="field-error">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit">Registrarse</button>
          </div>
        </form>

        <div className="auth-switch">
          <p>
            ¿Ya tienes cuenta?{" "}
            <button onClick={onSwitchToLogin}>Iniciar Sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, clearMessages } from "../../store/authSlice";
import {
  generateUsername,
  isUsernameAvailable,
  generateUsernameSuggestions,
} from "../../utils/userUtils";
import "./RegisterForm.css";

// Componente de formulario de registro
function RegisterForm({ onSwitchToLogin }) {
  const dispatch = useDispatch();
  const { error, success } = useSelector((state) => state.auth);

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(
    "¿Cuál es el nombre de tu primera mascota?"
  );
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Limpiar mensajes al montar el componente
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  // Generar nombre de usuario automáticamente cuando cambia el nombre completo
  useEffect(() => {
    if (fullName.trim()) {
      const generatedUsername = generateUsername(fullName);
      setUsername(generatedUsername);
    }
  }, [fullName]);

  // Validar contraseña robusta
  const validatePassword = (password) => {
    const minLength = 8;
    const maxLength = 16;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (password.length > maxLength) {
      return "La contraseña debe tener máximo 16 caracteres";
    }
    if (!hasUpperCase) {
      return "La contraseña debe contener al menos una mayúscula";
    }
    if (!hasLowerCase) {
      return "La contraseña debe contener al menos una minúscula";
    }
    if (!hasNumbers) {
      return "La contraseña debe contener al menos un número";
    }
    if (!hasSymbols) {
      return "La contraseña debe contener al menos un símbolo especial";
    }
    return null;
  };

  // Validar campos
  const validateFields = () => {
    const errors = {};

    if (!fullName.trim()) {
      errors.fullName = "El nombre completo es requerido";
    } else if (fullName.length < 2) {
      errors.fullName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (username.length < 3) {
      errors.username = "El nombre de usuario debe tener al menos 3 caracteres";
    }

    if (!password.trim()) {
      errors.password = "La contraseña es requerida";
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        errors.password = passwordError;
      }
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Confirma tu contraseña";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }

    if (!securityAnswer.trim()) {
      errors.securityAnswer = "La respuesta de seguridad es requerida";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    dispatch(register({ fullName, username, password, securityAnswer }));
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
            <label>Nombre Completo:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={validationErrors.fullName ? "error" : ""}
              placeholder="Ej: Gastón Pérez"
            />
            {validationErrors.fullName && (
              <span className="field-error">{validationErrors.fullName}</span>
            )}
          </div>

          <div>
            <label>Nombre de Usuario:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={validationErrors.username ? "error" : ""}
              placeholder="Se genera automáticamente"
            />
            {validationErrors.username && (
              <span className="field-error">{validationErrors.username}</span>
            )}
            <div className="username-info">
              <small>Se genera automáticamente sin tildes ni espacios</small>
            </div>
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

          <div>
            <label>Pregunta de Seguridad:</label>
            <p className="security-question">{securityQuestion}</p>
          </div>

          <div>
            <label>Respuesta de Seguridad:</label>
            <input
              type="text"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className={validationErrors.securityAnswer ? "error" : ""}
              placeholder="Ingresa tu respuesta"
            />
            {validationErrors.securityAnswer && (
              <span className="field-error">
                {validationErrors.securityAnswer}
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

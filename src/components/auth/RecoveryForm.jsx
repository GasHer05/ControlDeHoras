import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recoveryPasswordUser, clearMessages } from "../../store/authSlice";
import "./RecoveryForm.css";

// Componente de recuperación de contraseña
function RecoveryForm({ onSwitchToLogin }) {
  const dispatch = useDispatch();
  const { error, success } = useSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: username, 2: security, 3: new password
  const [validationErrors, setValidationErrors] = useState({});

  // Limpiar mensajes al montar el componente
  useEffect(() => {
    dispatch(clearMessages());
  }, [dispatch]);

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

  // Validar campos según el paso
  const validateFields = () => {
    const errors = {};

    if (step === 1) {
      if (!username.trim()) {
        errors.username = "El nombre de usuario es requerido";
      }
    } else if (step === 2) {
      if (!securityAnswer.trim()) {
        errors.securityAnswer = "La respuesta de seguridad es requerida";
      }
    } else if (step === 3) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }

      if (!confirmNewPassword.trim()) {
        errors.confirmNewPassword = "Confirma tu nueva contraseña";
      } else if (newPassword !== confirmNewPassword) {
        errors.confirmNewPassword = "Las contraseñas no coinciden";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    if (validateFields()) {
      // Simular verificación de usuario y obtener pregunta de seguridad
      setSecurityQuestion("¿Cuál es el nombre de tu primera mascota?");
      setStep(2);
    }
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    if (validateFields()) {
      // Simular verificación de respuesta de seguridad
      setStep(3);
    }
  };

  const handleStep3 = (e) => {
    e.preventDefault();
    if (validateFields()) {
      dispatch(recoveryPasswordUser({ username, newPassword, securityAnswer }));
    }
  };

  const renderStep1 = () => (
    <form className="auth-form" onSubmit={handleStep1}>
      <div>
        <label>Usuario:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={validationErrors.username ? "error" : ""}
          placeholder="Ingresa tu nombre de usuario"
        />
        {validationErrors.username && (
          <span className="field-error">{validationErrors.username}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit">Continuar</button>
        <button type="button" onClick={onSwitchToLogin} className="secondary">
          Volver al Login
        </button>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form className="auth-form" onSubmit={handleStep2}>
      <div>
        <label>Pregunta de Seguridad:</label>
        <p className="security-question">{securityQuestion}</p>
      </div>

      <div>
        <label>Respuesta:</label>
        <input
          type="text"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          className={validationErrors.securityAnswer ? "error" : ""}
          placeholder="Ingresa tu respuesta"
        />
        {validationErrors.securityAnswer && (
          <span className="field-error">{validationErrors.securityAnswer}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit">Verificar</button>
        <button type="button" onClick={() => setStep(1)} className="secondary">
          Volver
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form className="auth-form" onSubmit={handleStep3}>
      <div>
        <label>Nueva Contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className={validationErrors.newPassword ? "error" : ""}
          placeholder="Mínimo 8 caracteres, máximo 16"
        />
        {validationErrors.newPassword && (
          <span className="field-error">{validationErrors.newPassword}</span>
        )}
        <div className="password-requirements">
          <small>
            La contraseña debe contener: mayúsculas, minúsculas, números y
            símbolos
          </small>
        </div>
      </div>

      <div>
        <label>Confirmar Nueva Contraseña:</label>
        <input
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          className={validationErrors.confirmNewPassword ? "error" : ""}
          placeholder="Confirma tu nueva contraseña"
        />
        {validationErrors.confirmNewPassword && (
          <span className="field-error">
            {validationErrors.confirmNewPassword}
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit">Cambiar Contraseña</button>
        <button type="button" onClick={() => setStep(2)} className="secondary">
          Volver
        </button>
      </div>
    </form>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Recuperar Contraseña</h2>

        {(error || success) && (
          <div className={`message ${error ? "error" : "success"}`}>
            {error || success}
          </div>
        )}

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <div className="auth-switch">
          <p>
            ¿Recordaste tu contraseña?{" "}
            <button onClick={onSwitchToLogin}>Iniciar Sesión</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RecoveryForm;

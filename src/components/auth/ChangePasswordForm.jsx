import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePassword } from "../../store/authSlice";
import "./ChangePasswordForm.css";

// Componente para cambiar contraseña
function ChangePasswordForm({ onClose }) {
  const dispatch = useDispatch();
  const { error, success } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

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

    if (!formData.currentPassword.trim()) {
      errors.currentPassword = "La contraseña actual es requerida";
    }

    if (!formData.newPassword.trim()) {
      errors.newPassword = "La nueva contraseña es requerida";
    } else {
      const passwordError = validatePassword(formData.newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
      }
    }

    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirma tu nueva contraseña";
    } else if (formData.newPassword !== formData.confirmPassword) {
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

    dispatch(
      changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        userId: currentUser.id,
      })
    );

    // Limpiar formulario si fue exitoso
    if (!error) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="change-password-overlay">
      <div className="change-password-modal">
        <div className="modal-header">
          <h2>Cambiar Contraseña</h2>
          <button onClick={onClose} className="close-btn">
            ✕
          </button>
        </div>

        {(error || success) && (
          <div className={`message ${error ? "error" : "success"}`}>
            {error || success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="change-password-form">
          <div className="form-group">
            <label>Contraseña Actual:</label>
            <div className="password-input-container">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className={validationErrors.currentPassword ? "error" : ""}
                placeholder="Ingresa tu contraseña actual"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {validationErrors.currentPassword && (
              <span className="field-error">
                {validationErrors.currentPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Nueva Contraseña:</label>
            <div className="password-input-container">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={validationErrors.newPassword ? "error" : ""}
                placeholder="Ingresa tu nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => togglePasswordVisibility("new")}
              >
                {showPasswords.new ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {validationErrors.newPassword && (
              <span className="field-error">
                {validationErrors.newPassword}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Confirmar Nueva Contraseña:</label>
            <div className="password-input-container">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={validationErrors.confirmPassword ? "error" : ""}
                placeholder="Confirma tu nueva contraseña"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <span className="field-error">
                {validationErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Cambiar Contraseña
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordForm;

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";
import RecoveryForm from "../components/auth/RecoveryForm.jsx";

// Página de autenticación que maneja login y registro
function AuthPage() {
  const [authMode, setAuthMode] = useState("login"); // "login", "register", "recovery"
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/clientes");
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchToRegister = (mode) => {
    if (mode === "recovery") {
      setAuthMode("recovery");
    } else {
      setAuthMode("register");
    }
  };

  const handleSwitchToLogin = () => {
    setAuthMode("login");
  };

  return (
    <div>
      {authMode === "login" && (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      )}
      {/* Registro público deshabilitado - solo admin puede crear usuarios */}
      {authMode === "register" && (
        <div className="auth-container">
          <div className="auth-card">
            <h2>Registro Deshabilitado</h2>
            <p>El registro público está deshabilitado por seguridad.</p>
            <p>Solo los administradores pueden crear nuevos usuarios.</p>
            <button onClick={handleSwitchToLogin} className="btn-primary">
              Volver al Login
            </button>
          </div>
        </div>
      )}
      {authMode === "recovery" && (
        <RecoveryForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
}

export default AuthPage;

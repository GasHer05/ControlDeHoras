import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm.jsx";
import RegisterForm from "../components/auth/RegisterForm.jsx";

// Página de autenticación que maneja login y registro
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/clientes");
    }
  }, [isAuthenticated, navigate]);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} />
      )}
    </div>
  );
}

export default AuthPage;

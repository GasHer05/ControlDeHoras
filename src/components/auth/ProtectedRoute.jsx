import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Componente para proteger rutas - redirige a login si no está autenticado
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default ProtectedRoute;

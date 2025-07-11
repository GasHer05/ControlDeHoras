import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "./store/authSlice";
import ClientesPage from "./pages/ClientesPage.jsx";
import RegistrosHorasPage from "./pages/RegistrosHorasPage.jsx";
import ReportesPage from "./pages/ReportesPage.jsx";
import AuditoriaPage from "./pages/AuditoriaPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import ChangePasswordForm from "./components/auth/ChangePasswordForm.jsx";
import "./styles/main.css";
import {
  isAdmin,
  isManager,
  isAdminOrManager,
  hasPermission,
} from "./config/admin";

// Importar debug temporal
import "./utils/debugAuth.js";

function App() {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
  };

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && (
          <nav className="navbar">
            <ul>
              <li>
                <Link to="/clientes">Clientes</Link>
              </li>
              <li>
                <Link to="/registros-horas">Registros de Horas</Link>
              </li>
              <li>
                <Link to="/reportes">Reportes</Link>
              </li>
              {isAdminOrManager(currentUser) && (
                <li>
                  <Link to="/auditoria">Auditoría</Link>
                </li>
              )}
              {isAdmin(currentUser) && (
                <li>
                  <Link to="/admin">Administración</Link>
                </li>
              )}
              <li className="user-info">
                <span>
                  Usuario: {currentUser?.fullName || currentUser?.username}
                </span>
                <button
                  onClick={handleChangePassword}
                  className="change-password-btn"
                >
                  🔐 Cambiar Contraseña
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </nav>
        )}
        <main>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/registros-horas"
              element={
                <ProtectedRoute>
                  <RegistrosHorasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <ProtectedRoute>
                  <ReportesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute>
                  <AuditoriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </main>

        {/* Modal de cambio de contraseña */}
        {showChangePassword && (
          <ChangePasswordForm onClose={handleCloseChangePassword} />
        )}
      </div>
    </Router>
  );
}

export default App;

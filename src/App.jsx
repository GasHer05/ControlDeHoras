import React, { useState, useEffect, useRef } from "react";
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
import FirebaseTest from "./components/FirebaseTest.jsx";
import MigrationTool from "./components/MigrationTool.jsx";
import "./styles/main.css";
import {
  isAdmin,
  isManager,
  isAdminOrManager,
  hasPermission,
} from "./config/admin";

// Importar debug temporal
// import "./utils/debugAuth.js";

function getUserDisplayName(user) {
  return user?.username || user?.fullName || user?.usuario || "-";
}

function App() {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const hamburgerRef = useRef(null);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setIsMenuOpen(false);
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <Router>
      <div className="app-container">
        {isAuthenticated && (
          <nav className="navbar">
            <div className="navbar-inner">
              {/* Logo */}
              <div className="navbar-logo">
                <h1 className="logo-text">Elorza-Arredondo Abogados</h1>
                <div className="logo-underline"></div>
              </div>

              {/* Menú hamburguesa */}
              <button
                ref={hamburgerRef}
                className={`hamburger-menu ${isMenuOpen ? "active" : ""}`}
                onClick={toggleMenu}
                aria-label="Abrir menú"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>

              {/* Menú desplegable */}
              <div
                ref={menuRef}
                className={`navbar-dropdown ${isMenuOpen ? "open" : ""}`}
              >
                <div className="dropdown-content">
                  <div className="menu-section">
                    <h3>Navegación</h3>
                    <ul className="dropdown-menu">
                      <li>
                        <Link to="/clientes" onClick={closeMenu}>
                          👥 Clientes
                        </Link>
                      </li>
                      <li>
                        <Link to="/registros-horas" onClick={closeMenu}>
                          ⏰ Registros de Horas
                        </Link>
                      </li>
                      <li>
                        <Link to="/reportes" onClick={closeMenu}>
                          📊 Reportes
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {isAdmin(currentUser) && (
                    <div className="menu-section">
                      <h3>Administración</h3>
                      <ul className="dropdown-menu">
                        <li>
                          <Link to="/firebase-test" onClick={closeMenu}>
                            🧪 Test Firebase
                          </Link>
                        </li>
                        <li>
                          <Link to="/migration" onClick={closeMenu}>
                            🔄 Migración
                          </Link>
                        </li>
                        <li>
                          <Link to="/auditoria" onClick={closeMenu}>
                            📋 Auditoría
                          </Link>
                        </li>
                        <li>
                          <Link to="/admin" onClick={closeMenu}>
                            ⚙️ Administración
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}

                  <div className="menu-section">
                    <h3>Usuario</h3>
                    <div className="user-info">
                      <span className="user-name">
                        {getUserDisplayName(currentUser)}
                      </span>
                    </div>
                    <div className="user-actions">
                      <button
                        onClick={handleChangePassword}
                        className="btn-menu-action"
                      >
                        🔐 Cambiar Contraseña
                      </button>
                      <button
                        onClick={handleLogout}
                        className="btn-menu-logout"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            <Route
              path="/firebase-test"
              element={
                <ProtectedRoute>
                  <FirebaseTest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/migration"
              element={
                <ProtectedRoute>
                  <MigrationTool />
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

import React from "react";
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
import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import "./styles/main.css";

function App() {
  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
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
              <li className="user-info">
                <span>
                  Usuario: {currentUser?.fullName || currentUser?.username}
                </span>
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
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

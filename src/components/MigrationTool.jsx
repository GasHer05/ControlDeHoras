import React, { useState } from "react";
import { migrateUsersFromLocalStorage } from "../services/userService";
import { getAllUsers } from "../services/userService";
import {
  migrateClientesFromLocalStorage,
  getAllClientes,
} from "../services/clientesService";
import {
  migrateRegistrosHorasFromLocalStorage,
  getAllRegistrosHoras,
} from "../services/registrosHorasService";

const MigrationTool = () => {
  const [migrationStatus, setMigrationStatus] = useState({});
  const [loading, setLoading] = useState({});
  const [debugInfo, setDebugInfo] = useState(null);

  const handleMigrateUsers = async () => {
    setLoading((l) => ({ ...l, users: true }));
    setMigrationStatus((s) => ({ ...s, users: null }));

    try {
      const result = await migrateUsersFromLocalStorage();
      setMigrationStatus((s) => ({ ...s, users: result }));
    } catch (error) {
      setMigrationStatus((s) => ({
        ...s,
        users: { success: false, message: error.message, error },
      }));
    } finally {
      setLoading((l) => ({ ...l, users: false }));
    }
  };

  const handleMigrateClientes = async () => {
    setLoading((l) => ({ ...l, clientes: true }));
    setMigrationStatus((s) => ({ ...s, clientes: null }));

    try {
      const result = await migrateClientesFromLocalStorage();
      setMigrationStatus((s) => ({ ...s, clientes: result }));
    } catch (error) {
      setMigrationStatus((s) => ({
        ...s,
        clientes: { success: false, message: error.message, error },
      }));
    } finally {
      setLoading((l) => ({ ...l, clientes: false }));
    }
  };

  const handleMigrateRegistros = async () => {
    setLoading((l) => ({ ...l, registros: true }));
    setMigrationStatus((s) => ({ ...s, registros: null }));

    try {
      const result = await migrateRegistrosHorasFromLocalStorage();
      setMigrationStatus((s) => ({ ...s, registros: result }));
    } catch (error) {
      setMigrationStatus((s) => ({
        ...s,
        registros: { success: false, message: error.message, error },
      }));
    } finally {
      setLoading((l) => ({ ...l, registros: false }));
    }
  };

  const handleCheckData = async () => {
    setLoading((l) => ({ ...l, debug: true }));

    try {
      const localStorageUsers = JSON.parse(
        localStorage.getItem("usuarios") || "[]"
      );
      const localStorageClientes = JSON.parse(
        localStorage.getItem("clientes") || "[]"
      );
      const localStorageRegistros = JSON.parse(
        localStorage.getItem("registrosHoras") || "[]"
      );
      const firestoreUsers = await getAllUsers();
      const firestoreClientes = await getAllClientes();
      const firestoreRegistros = await getAllRegistrosHoras();
      setDebugInfo({
        localStorage: {
          users: localStorageUsers,
          clientes: localStorageClientes,
          registros: localStorageRegistros,
        },
        firestore: {
          users: firestoreUsers,
          clientes: firestoreClientes,
          registros: firestoreRegistros,
        },
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setLoading((l) => ({ ...l, debug: false }));
    }
  };

  const renderStatus = (status) =>
    status && (
      <div
        style={{
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: status.success ? "#d4edda" : "#f8d7da",
          border: `1px solid ${status.success ? "#c3e6cb" : "#f5c6cb"}`,
          color: status.success ? "#155724" : "#721c24",
          marginBottom: "10px",
        }}
      >
        <h4>
          {status.success ? "✅ Migración Completada" : "❌ Error en Migración"}
        </h4>
        <p>
          <strong>Mensaje:</strong> {status.message}
        </p>
        {status.migratedCount !== undefined && (
          <div>
            <p>
              <strong>Items migrados:</strong> {status.migratedCount}
            </p>
            <p>
              <strong>Errores:</strong> {status.errorCount || 0}
            </p>
            <p>
              <strong>Total procesados:</strong> {status.totalCount}
            </p>
          </div>
        )}
        {status.error && (
          <div>
            <p>
              <strong>Error:</strong> {status.error.message}
            </p>
          </div>
        )}
      </div>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2>🔄 Herramienta de Migración</h2>

      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>📋 Estado de la Migración</h3>
        <p>Esta herramienta migra los datos desde localStorage a Firestore.</p>
        <p>
          <strong>Nota:</strong> Los datos originales en localStorage se
          mantienen como respaldo.
        </p>
      </div>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handleMigrateUsers}
          disabled={loading.users}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading.users ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading.users ? "🔄 Migrando..." : "🚀 Migrar Usuarios"}
        </button>
        <button
          onClick={handleMigrateClientes}
          disabled={loading.clientes}
          style={{
            padding: "12px 24px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading.clientes ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading.clientes ? "🔄 Migrando..." : "🚀 Migrar Clientes"}
        </button>
        <button
          onClick={handleMigrateRegistros}
          disabled={loading.registros}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ffc107",
            color: "#333",
            border: "none",
            borderRadius: "5px",
            cursor: loading.registros ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          {loading.registros
            ? "🔄 Migrando..."
            : "🚀 Migrar Registros de Horas"}
        </button>
        <button
          onClick={handleCheckData}
          disabled={loading.debug}
          style={{
            padding: "12px 24px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading.debug ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading.debug ? "🔍 Verificando..." : "🔍 Verificar Datos"}
        </button>
      </div>

      {renderStatus(migrationStatus.users)}
      {renderStatus(migrationStatus.clientes)}
      {renderStatus(migrationStatus.registros)}

      {debugInfo && (
        <div
          style={{
            padding: "15px",
            borderRadius: "5px",
            backgroundColor: "#e7f3ff",
            border: "1px solid #b3d9ff",
            color: "#004085",
            marginBottom: "20px",
          }}
        >
          <h4>🔍 Información de Debug</h4>

          {debugInfo.error ? (
            <p>
              <strong>Error:</strong> {debugInfo.error}
            </p>
          ) : (
            <>
              <div style={{ marginBottom: "15px" }}>
                <h5>📱 localStorage:</h5>
                <p>
                  <strong>Usuarios:</strong>{" "}
                  {debugInfo.localStorage.users.length}
                </p>
                <p>
                  <strong>Clientes:</strong>{" "}
                  {debugInfo.localStorage.clientes.length}
                </p>
                <p>
                  <strong>Registros de Horas:</strong>{" "}
                  {debugInfo.localStorage.registros.length}
                </p>
                <details>
                  <summary>Ver datos</summary>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      borderRadius: "3px",
                    }}
                  >
                    {JSON.stringify(debugInfo.localStorage, null, 2)}
                  </pre>
                </details>
              </div>

              <div>
                <h5>🔥 Firestore:</h5>
                <p>
                  <strong>Usuarios:</strong> {debugInfo.firestore.users.length}
                </p>
                <p>
                  <strong>Clientes:</strong>{" "}
                  {debugInfo.firestore.clientes.length}
                </p>
                <p>
                  <strong>Registros de Horas:</strong>{" "}
                  {debugInfo.firestore.registros.length}
                </p>
                <details>
                  <summary>Ver datos</summary>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      borderRadius: "3px",
                    }}
                  >
                    {JSON.stringify(debugInfo.firestore, null, 2)}
                  </pre>
                </details>
              </div>
            </>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
        }}
      >
        <h4>📝 Próximos pasos:</h4>
        <ol>
          <li>Migrar usuarios</li>
          <li>Migrar clientes</li>
          <li>Migrar registros de horas</li>
          <li>Actualizar slices de Redux</li>
          <li>Eliminar dependencia de localStorage</li>
        </ol>
      </div>
    </div>
  );
};

export default MigrationTool;

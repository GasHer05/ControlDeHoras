import React, { useState } from "react";
import {
  testFirebaseConnection,
  createTestDocument,
  cleanupTestDocuments,
} from "../utils/firebaseTest";

const FirebaseTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    setLoading(true);
    const result = await testFirebaseConnection();
    setTestResult(result);
    setLoading(false);
  };

  const handleCreateTestDoc = async () => {
    setLoading(true);
    const result = await createTestDocument();
    setTestResult(result);
    setLoading(false);
  };

  const handleCleanup = async () => {
    setLoading(true);
    const result = await cleanupTestDocuments();
    setTestResult(result);
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>🧪 Test de Conexión Firebase</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={handleTestConnection}
          disabled={loading}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Probando..." : "Probar Conexión"}
        </button>

        <button
          onClick={handleCreateTestDoc}
          disabled={loading}
          style={{
            marginRight: "10px",
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Creando..." : "Crear Documento Test"}
        </button>

        <button
          onClick={handleCleanup}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Limpiando..." : "Limpiar Test"}
        </button>
      </div>

      {testResult && (
        <div
          style={{
            padding: "15px",
            borderRadius: "5px",
            backgroundColor: testResult.success ? "#d4edda" : "#f8d7da",
            border: `1px solid ${testResult.success ? "#c3e6cb" : "#f5c6cb"}`,
            color: testResult.success ? "#155724" : "#721c24",
          }}
        >
          <h4>{testResult.success ? "✅ Éxito" : "❌ Error"}</h4>
          <p>
            <strong>Mensaje:</strong> {testResult.message}
          </p>
          {testResult.documentId && (
            <p>
              <strong>ID del documento:</strong> {testResult.documentId}
            </p>
          )}
          {testResult.documentCount !== undefined && (
            <p>
              <strong>Documentos encontrados:</strong>{" "}
              {testResult.documentCount}
            </p>
          )}
          {testResult.error && (
            <p>
              <strong>Error:</strong> {testResult.error.message}
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <p>
          <strong>Instrucciones:</strong>
        </p>
        <ol>
          <li>
            Haz clic en "Probar Conexión" para verificar que Firebase funciona
          </li>
          <li>Si la conexión es exitosa, haz clic en "Crear Documento Test"</li>
          <li>Revisa la consola del navegador para más detalles</li>
          <li>Una vez que todo funcione, puedes eliminar este componente</li>
        </ol>
      </div>
    </div>
  );
};

export default FirebaseTest;

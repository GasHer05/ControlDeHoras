import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ClienteForm from "../components/clientes/ClienteForm.jsx";
import ClienteList from "../components/clientes/ClienteList.jsx";
import ConfirmModal from "../components/comunes/ConfirmModal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  addCliente,
  editCliente,
  removeCliente,
  fetchClientes,
} from "../store/clientesSlice";
import { selectClientesDecrypted } from "../utils/selectors";
import "./ClientesPage.css";

// Página principal para gestión de clientes con sistema de pestañas
function ClientesPage() {
  const clientes = useSelector(selectClientesDecrypted);
  const clientesRaw = useSelector((state) => state.clientes.clientes);
  const usuario = useSelector(
    (state) =>
      state.auth.currentUser?.username ||
      state.auth.currentUser?.fullName ||
      state.auth.currentUser?.usuario ||
      ""
  );
  const dispatch = useDispatch();

  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("lista"); // "nuevo" o "lista"

  // Estado para edición
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Cargar clientes al montar
  useEffect(() => {
    dispatch(fetchClientes()).then(() => {
      // Log después del fetch
      setTimeout(() => {
        // Espera a que Redux actualice el estado
        // eslint-disable-next-line no-console
        console.log("[DEBUG] clientesRaw tras fetch:", clientesRaw);
      }, 500);
    });
  }, [dispatch]);

  // Log en cada render
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[DEBUG] clientes (desencriptados):", clientes);
  }, [clientes]);

  // Agregar nuevo cliente
  const handleAgregar = (data) => {
    const clienteData = { ...data };
    if (usuario) clienteData.usuario = usuario;
    if (usuario) clienteData.creadoPor = usuario;
    console.log("[DEBUG handleAgregar] clienteData:", clienteData);
    dispatch(addCliente(clienteData))
      .unwrap()
      .then(() => {
        toast.success("Cliente agregado correctamente");
        setActiveTab("lista"); // Cambiar a la lista después de agregar
      })
      .catch((err) => toast.error(err));
  };

  // Guardar cambios de edición
  const handleEditar = (data) => {
    const clienteData = { ...data };
    if (usuario) clienteData.usuario = usuario;
    if (usuario) clienteData.modificadoPor = usuario;
    console.log("[DEBUG handleEditar] clienteData:", clienteData);
    dispatch(editCliente({ id: clienteEditando.id, clienteData }))
      .unwrap()
      .then(() => {
        toast.success("Cliente editado correctamente");
        setClienteEditando(null);
        setActiveTab("lista"); // Cambiar a la lista después de editar
      })
      .catch((err) => toast.error(err));
  };

  // Eliminar cliente
  const handleEliminar = (id) => {
    setClienteAEliminar(id);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    dispatch(removeCliente(clienteAEliminar))
      .unwrap()
      .then(() => toast.success("Cliente eliminado correctamente"))
      .catch((err) => toast.error(err));
    setModalOpen(false);
    setClienteAEliminar(null);
  };

  const cancelarEliminar = () => {
    setModalOpen(false);
    setClienteAEliminar(null);
  };

  // Iniciar edición
  const handleIniciarEdicion = (cliente) => {
    setClienteEditando(cliente);
    setActiveTab("nuevo"); // Cambiar a la pestaña de formulario
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setClienteEditando(null);
    setActiveTab("lista"); // Volver a la lista
  };

  // Cambiar a pestaña de nuevo cliente
  const handleNuevoCliente = () => {
    setClienteEditando(null);
    setActiveTab("nuevo");
  };

  return (
    <div className="clientes-page">
      <ToastContainer position="top-right" autoClose={2500} />
      <h1>Clientes</h1>

      {/* Sistema de Pestañas */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "lista" ? "active" : ""}`}
            onClick={() => setActiveTab("lista")}
          >
            📋 Lista de Clientes ({clientes.length})
          </button>
          <button
            className={`tab-button ${activeTab === "nuevo" ? "active" : ""}`}
            onClick={handleNuevoCliente}
          >
            ➕ Nuevo Cliente
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "lista" && (
            <div className="lista-tab">
              <div className="lista-header">
                <h2>Lista de Clientes</h2>
                <button
                  className="btn-nuevo-cliente"
                  onClick={handleNuevoCliente}
                >
                  ➕ Agregar Cliente
                </button>
              </div>
              <ClienteList
                clientes={clientes}
                onEdit={handleIniciarEdicion}
                onDelete={handleEliminar}
              />
            </div>
          )}

          {activeTab === "nuevo" && (
            <div className="formulario-tab">
              <div className="formulario-header">
                <h2>{clienteEditando ? "Editar Cliente" : "Nuevo Cliente"}</h2>
                {clienteEditando && (
                  <button
                    className="btn-volver-lista"
                    onClick={() => setActiveTab("lista")}
                  >
                    ← Volver a la Lista
                  </button>
                )}
              </div>
              <ClienteForm
                onSubmit={clienteEditando ? handleEditar : handleAgregar}
                initialData={clienteEditando}
                onCancel={clienteEditando ? handleCancelarEdicion : undefined}
              />
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={modalOpen}
        message="¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer."
        onConfirm={confirmarEliminar}
        onCancel={cancelarEliminar}
      />
    </div>
  );
}

export default ClientesPage;

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ClienteForm from "../components/clientes/ClienteForm.jsx";
import ClienteList from "../components/clientes/ClienteList.jsx";
import ConfirmModal from "../components/comunes/ConfirmModal.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  agregarCliente,
  editarCliente,
  eliminarCliente,
} from "../store/clientesSlice";

// Página principal para gestión de clientes
function ClientesPage() {
  const clientes = useSelector((state) => state.clientes);
  const usuario = useSelector((state) => state.auth.currentUser?.username);
  const dispatch = useDispatch();

  // Estado para edición
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Agregar nuevo cliente
  const handleAgregar = (data) => {
    dispatch(agregarCliente({ ...data, usuario }));
    toast.success("Cliente agregado correctamente");
  };

  // Guardar cambios de edición
  const handleEditar = (data) => {
    dispatch(editarCliente({ ...data, id: clienteEditando.id, usuario }));
    setClienteEditando(null);
    toast.success("Cliente editado correctamente");
  };

  // Eliminar cliente
  const handleEliminar = (id) => {
    setClienteAEliminar(id);
    setModalOpen(true);
  };

  const confirmarEliminar = () => {
    dispatch(eliminarCliente(clienteAEliminar));
    setModalOpen(false);
    setClienteAEliminar(null);
    toast.success("Cliente eliminado correctamente");
  };

  const cancelarEliminar = () => {
    setModalOpen(false);
    setClienteAEliminar(null);
  };

  // Iniciar edición
  const handleIniciarEdicion = (cliente) => {
    setClienteEditando(cliente);
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setClienteEditando(null);
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2500} />
      <h1>Clientes</h1>
      <div style={{ marginBottom: "2rem" }}>
        <ClienteForm
          onSubmit={clienteEditando ? handleEditar : handleAgregar}
          initialData={clienteEditando}
          onCancel={clienteEditando ? handleCancelarEdicion : undefined}
        />
      </div>
      <ClienteList
        clientes={clientes}
        onEdit={handleIniciarEdicion}
        onDelete={handleEliminar}
      />
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

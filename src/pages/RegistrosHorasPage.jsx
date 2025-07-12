import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import RegistroHoraForm from "../components/registrosHoras/RegistroHoraForm.jsx";
import RegistroHoraList from "../components/registrosHoras/RegistroHoraList.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import {
  addRegistroHora,
  editRegistroHora,
  removeRegistroHora,
  fetchRegistrosHoras,
  calcularMonto,
} from "../store/registrosHorasSlice";
import "./RegistrosHorasPage.css";

// Página principal para gestión y listado de registros de horas con sistema de pestañas
function RegistrosHorasPage() {
  const registros = useSelector(
    (state) => state.registrosHoras?.registros ?? []
  );
  const clientes = useSelector((state) => state.clientes.clientes);
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Obtener el nombre del usuario de manera más robusta
  const usuario =
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.usuario ||
    "Usuario";

  // Log para depurar
  console.log("[DEBUG] RegistrosHorasPage - currentUser:", currentUser);
  console.log("[DEBUG] RegistrosHorasPage - usuario:", usuario);

  const dispatch = useDispatch();

  // Estado para pestañas
  const [activeTab, setActiveTab] = useState("lista"); // "nuevo" o "lista"

  // Estado para edición
  const [registroEditando, setRegistroEditando] = useState(null);

  // Estado para filtro de fechas
  const [filtro, setFiltro] = useState({ fechaInicio: "", fechaFin: "" });

  // Cargar registros al montar
  useEffect(() => {
    dispatch(fetchRegistrosHoras());
  }, [dispatch]);

  // Agregar nuevo registro
  const handleAgregar = (data) => {
    const monto = calcularMonto(
      data.horas,
      data.valorHora,
      data.tipoDescuento,
      data.valorDescuento
    );
    dispatch(addRegistroHora({ ...data, monto, usuario, creadoPor: usuario }))
      .unwrap()
      .then(() => {
        setActiveTab("lista"); // Cambiar a la lista después de agregar
      })
      .catch((err) => console.error(err));
  };

  // Guardar cambios de edición
  const handleEditar = (data) => {
    const monto = calcularMonto(
      data.horas,
      data.valorHora,
      data.tipoDescuento,
      data.valorDescuento
    );
    dispatch(
      editRegistroHora({
        id: registroEditando.id,
        registroData: { ...data, monto, usuario, modificadoPor: usuario },
      })
    )
      .unwrap()
      .then(() => {
        setRegistroEditando(null);
        setActiveTab("lista"); // Cambiar a la lista después de editar
      })
      .catch((err) => console.error(err));
  };

  // Eliminar registro
  const handleEliminar = (id) => {
    dispatch(removeRegistroHora(id))
      .unwrap()
      .catch((err) => console.error(err));
    // Si se está editando el mismo, cancelar edición
    if (registroEditando && registroEditando.id === id) {
      setRegistroEditando(null);
    }
  };

  // Iniciar edición
  const handleIniciarEdicion = (registro) => {
    setRegistroEditando(registro);
    setActiveTab("nuevo"); // Cambiar a la pestaña de formulario
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setRegistroEditando(null);
    setActiveTab("lista"); // Volver a la lista
  };

  // Cambiar a pestaña de nuevo registro
  const handleNuevoRegistro = () => {
    setRegistroEditando(null);
    setActiveTab("nuevo");
  };

  // Filtrar registros por fechas
  const registrosFiltrados = registros.filter((r) => {
    const fecha = r.fecha;
    const { fechaInicio, fechaFin } = filtro;
    if (fechaInicio && fecha < fechaInicio) return false;
    if (fechaFin && fecha > fechaFin) return false;
    return true;
  });

  return (
    <div className="registros-horas-page">
      <h1>Registros de Horas</h1>

      {/* Sistema de Pestañas */}
      <div className="tabs-container">
        <div className="tabs-header">
          <button
            className={`tab-button ${activeTab === "lista" ? "active" : ""}`}
            onClick={() => setActiveTab("lista")}
          >
            📋 Lista de Registros ({registrosFiltrados.length})
          </button>
          <button
            className={`tab-button ${activeTab === "nuevo" ? "active" : ""}`}
            onClick={handleNuevoRegistro}
          >
            ➕ Nuevo Registro
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "lista" && (
            <div className="lista-tab">
              <div className="lista-header">
                <h2>Lista de Registros de Horas</h2>
                <button
                  className="btn-nuevo-registro"
                  onClick={handleNuevoRegistro}
                >
                  ➕ Agregar Registro
                </button>
              </div>

              {/* Filtro de fechas */}
              <div className="filtro-fechas-container">
                <FiltroFechas
                  fechaInicio={filtro.fechaInicio}
                  fechaFin={filtro.fechaFin}
                  onChange={setFiltro}
                />
              </div>

              <RegistroHoraList
                registros={registrosFiltrados}
                clientes={clientes}
                onEdit={handleIniciarEdicion}
                onDelete={handleEliminar}
              />
            </div>
          )}

          {activeTab === "nuevo" && (
            <div className="formulario-tab">
              <div className="formulario-header">
                <h2>
                  {registroEditando
                    ? "Editar Registro"
                    : "Nuevo Registro de Horas"}
                </h2>
                {registroEditando && (
                  <button
                    className="btn-volver-lista"
                    onClick={() => setActiveTab("lista")}
                  >
                    ← Volver a la Lista
                  </button>
                )}
              </div>
              <RegistroHoraForm
                clientes={clientes}
                onSubmit={registroEditando ? handleEditar : handleAgregar}
                initialData={registroEditando}
                onCancel={registroEditando ? handleCancelarEdicion : undefined}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegistrosHorasPage;

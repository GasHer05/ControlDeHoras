import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import RegistroHoraForm from "../components/registrosHoras/RegistroHoraForm.jsx";
import RegistroHoraList from "../components/registrosHoras/RegistroHoraList.jsx";
import FiltroFechas from "../components/comunes/FiltroFechas.jsx";
import {
  agregarRegistro,
  editarRegistro,
  eliminarRegistro,
} from "../store/registrosHorasSlice";

// Página principal para gestión y listado de registros de horas
function RegistrosHorasPage() {
  const registros = useSelector((state) => state.registrosHoras);
  const clientes = useSelector((state) => state.clientes);
  const usuario = useSelector((state) => state.auth.currentUser?.username);
  const dispatch = useDispatch();

  // Estado para edición
  const [registroEditando, setRegistroEditando] = useState(null);

  // Estado para filtro de fechas
  const [filtro, setFiltro] = useState({ fechaInicio: "", fechaFin: "" });

  // Agregar nuevo registro
  const handleAgregar = (data) => {
    dispatch(agregarRegistro({ ...data, usuario }));
  };

  // Guardar cambios de edición
  const handleEditar = (data) => {
    dispatch(editarRegistro({ ...data, id: registroEditando.id, usuario }));
    setRegistroEditando(null);
  };

  // Eliminar registro
  const handleEliminar = (id) => {
    dispatch(eliminarRegistro(id));
    // Si se está editando el mismo, cancelar edición
    if (registroEditando && registroEditando.id === id) {
      setRegistroEditando(null);
    }
  };

  // Iniciar edición
  const handleIniciarEdicion = (registro) => {
    setRegistroEditando(registro);
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    setRegistroEditando(null);
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
    <div>
      <h1>Registros de Horas</h1>
      <div style={{ marginBottom: "1rem" }}>
        <FiltroFechas
          fechaInicio={filtro.fechaInicio}
          fechaFin={filtro.fechaFin}
          onChange={setFiltro}
        />
      </div>
      <div style={{ marginBottom: "2rem" }}>
        <RegistroHoraForm
          clientes={clientes}
          onSubmit={registroEditando ? handleEditar : handleAgregar}
          initialData={registroEditando}
          onCancel={registroEditando ? handleCancelarEdicion : undefined}
        />
      </div>
      <RegistroHoraList
        registros={registrosFiltrados}
        clientes={clientes}
        onEdit={handleIniciarEdicion}
        onDelete={handleEliminar}
      />
    </div>
  );
}

export default RegistrosHorasPage;

import { createSlice, nanoid } from "@reduxjs/toolkit";

// Modelo de Cliente: { id, nombre, contacto, valorHora, tipoDescuento, valorDescuento, creadoPor, fechaCreacion, modificadoPor, fechaModificacion }

const initialState = [];

const clientesSlice = createSlice({
  name: "clientes",
  initialState,
  reducers: {
    agregarCliente: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare({
        nombre,
        contacto,
        valorHora,
        usuario,
        tipoDescuento = "",
        valorDescuento = "",
      }) {
        const fecha = new Date().toISOString();
        return {
          payload: {
            id: nanoid(),
            nombre,
            contacto,
            valorHora,
            tipoDescuento,
            valorDescuento,
            creadoPor: usuario,
            fechaCreacion: fecha,
            modificadoPor: usuario,
            fechaModificacion: fecha,
          },
        };
      },
    },
    editarCliente(state, action) {
      const {
        id,
        nombre,
        contacto,
        valorHora,
        usuario,
        tipoDescuento = "",
        valorDescuento = "",
      } = action.payload;
      const cliente = state.find((c) => c.id === id);
      if (cliente) {
        cliente.nombre = nombre;
        cliente.contacto = contacto;
        cliente.valorHora = valorHora;
        cliente.tipoDescuento = tipoDescuento;
        cliente.valorDescuento = valorDescuento;
        cliente.modificadoPor = usuario;
        cliente.fechaModificacion = new Date().toISOString();
      }
    },
    eliminarCliente(state, action) {
      return state.filter((c) => c.id !== action.payload);
    },
  },
});

export const { agregarCliente, editarCliente, eliminarCliente } =
  clientesSlice.actions;
export default clientesSlice.reducer;

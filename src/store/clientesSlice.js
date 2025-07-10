import { createSlice, nanoid } from "@reduxjs/toolkit";
import { encryptClientData, decryptClientData } from "../utils/encryption";

// Modelo de Cliente: { id, nombre, contacto, valorHora, tipoDescuento, valorDescuento, creadoPor, fechaCreacion, modificadoPor, fechaModificacion }

const initialState = [];

const clientesSlice = createSlice({
  name: "clientes",
  initialState,
  reducers: {
    agregarCliente: {
      reducer(state, action) {
        // Encriptar datos sensibles antes de guardar
        const encryptedPayload = encryptClientData(action.payload);
        state.push(encryptedPayload);
      },
      prepare({
        nombre,
        email,
        telefono,
        direccion,
        identificadorFiscal,
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
            email,
            telefono,
            direccion,
            identificadorFiscal,
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
        email,
        telefono,
        direccion,
        identificadorFiscal,
        valorHora,
        usuario,
        tipoDescuento = "",
        valorDescuento = "",
      } = action.payload;
      const cliente = state.find((c) => c.id === id);
      if (cliente) {
        // Encriptar datos sensibles antes de actualizar
        const updatedData = encryptClientData({
          nombre,
          email,
          telefono,
          direccion,
          identificadorFiscal,
          valorHora,
          tipoDescuento,
          valorDescuento,
        });

        Object.assign(cliente, updatedData);
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

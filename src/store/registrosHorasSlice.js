import { createSlice, nanoid } from "@reduxjs/toolkit";

// Modelo de Registro de Horas: { id, clienteId, fecha, horas, descripcion, monto, creadoPor, fechaCreacion, modificadoPor, fechaModificacion }

const initialState = [];

function calcularMonto(horas, valorHora, tipoDescuento, valorDescuento) {
  let monto = horas * valorHora;
  if (tipoDescuento === "porcentaje" && valorDescuento) {
    monto = monto - monto * (valorDescuento / 100);
  } else if (tipoDescuento === "monto" && valorDescuento) {
    monto = monto - valorDescuento;
  }
  return monto < 0 ? 0 : Math.round(monto * 100) / 100;
}

const registrosHorasSlice = createSlice({
  name: "registrosHoras",
  initialState,
  reducers: {
    agregarRegistro: {
      reducer(state, action) {
        state.push(action.payload);
      },
      prepare({
        clienteId,
        fecha,
        horas,
        descripcion,
        valorHora,
        usuario,
        tipoDescuento = "",
        valorDescuento = "",
      }) {
        const now = new Date().toISOString();
        const monto = calcularMonto(
          horas,
          valorHora,
          tipoDescuento,
          valorDescuento
        );
        return {
          payload: {
            id: nanoid(),
            clienteId,
            fecha,
            horas,
            descripcion,
            monto,
            tipoDescuento,
            valorDescuento,
            creadoPor: usuario,
            fechaCreacion: now,
            modificadoPor: usuario,
            fechaModificacion: now,
          },
        };
      },
    },
    editarRegistro(state, action) {
      const {
        id,
        clienteId,
        fecha,
        horas,
        descripcion,
        valorHora,
        usuario,
        tipoDescuento = "",
        valorDescuento = "",
      } = action.payload;
      const registro = state.find((r) => r.id === id);
      if (registro) {
        registro.clienteId = clienteId;
        registro.fecha = fecha;
        registro.horas = horas;
        registro.descripcion = descripcion;
        registro.monto = calcularMonto(
          horas,
          valorHora,
          tipoDescuento,
          valorDescuento
        );
        registro.tipoDescuento = tipoDescuento;
        registro.valorDescuento = valorDescuento;
        registro.modificadoPor = usuario;
        registro.fechaModificacion = new Date().toISOString();
      }
    },
    eliminarRegistro(state, action) {
      return state.filter((r) => r.id !== action.payload);
    },
  },
});

export const { agregarRegistro, editarRegistro, eliminarRegistro } =
  registrosHorasSlice.actions;
export default registrosHorasSlice.reducer;

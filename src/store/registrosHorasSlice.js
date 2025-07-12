import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllRegistrosHoras,
  createRegistroHora,
  updateRegistroHora,
  deleteRegistroHora,
} from "../services/registrosHorasService";
import { logAuditEvent, AUDIT_EVENTS } from "../utils/auditLogger";

// Modelo de Registro de Horas: { id, clienteId, fecha, horas, descripcion, monto, creadoPor, fechaCreacion, modificadoPor, fechaModificacion }

const initialState = {
  registros: [],
  loading: false,
  error: null,
};

export function calcularMonto(horas, valorHora, tipoDescuento, valorDescuento) {
  let monto = horas * valorHora;
  if (tipoDescuento === "porcentaje" && valorDescuento) {
    monto = monto - monto * (valorDescuento / 100);
  } else if (tipoDescuento === "monto" && valorDescuento) {
    monto = monto - valorDescuento;
  }
  return monto < 0 ? 0 : Math.round(monto * 100) / 100;
}

// Thunks asíncronos
export const fetchRegistrosHoras = createAsyncThunk(
  "registrosHoras/fetchRegistrosHoras",
  async (_, { rejectWithValue }) => {
    try {
      const registros = await getAllRegistrosHoras();
      console.log(
        "[DEBUG] fetchRegistrosHoras thunk: registros obtenidos:",
        registros
      );
      return registros;
    } catch (error) {
      console.error("[ERROR] fetchRegistrosHoras thunk:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const addRegistroHora = createAsyncThunk(
  "registrosHoras/addRegistroHora",
  async (registroData, { rejectWithValue, getState }) => {
    try {
      const result = await createRegistroHora(registroData);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.RECORD_CREATED, {
        usuario: currentUser?.usuario,
        registroAfectado: result?.id,
        cliente: result?.clienteId,
      });
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editRegistroHora = createAsyncThunk(
  "registrosHoras/editRegistroHora",
  async ({ id, registroData }, { rejectWithValue, getState }) => {
    try {
      const result = await updateRegistroHora(id, registroData);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.RECORD_UPDATED, {
        usuario: currentUser?.usuario,
        registroAfectado: id,
        registroData,
      });
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeRegistroHora = createAsyncThunk(
  "registrosHoras/removeRegistroHora",
  async (id, { rejectWithValue, getState }) => {
    try {
      await deleteRegistroHora(id);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.RECORD_DELETED, {
        usuario: currentUser?.usuario,
        registroAfectado: id,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const registrosHorasSlice = createSlice({
  name: "registrosHoras",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchRegistrosHoras.pending, (state) => {
        return {
          ...state,
          loading: true,
          error: null,
        };
      })
      .addCase(fetchRegistrosHoras.fulfilled, (state, action) => {
        console.log(
          "[DEBUG] fetchRegistrosHoras.fulfilled payload:",
          action.payload
        );

        // Validar que payload sea un array
        const registros = Array.isArray(action.payload) ? action.payload : [];

        return {
          ...state,
          loading: false,
          registros,
        };
      })
      .addCase(fetchRegistrosHoras.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      })
      // Add
      .addCase(addRegistroHora.pending, (state) => {
        return {
          ...state,
          loading: true,
          error: null,
        };
      })
      .addCase(addRegistroHora.fulfilled, (state, action) => {
        console.log(
          "[DEBUG] addRegistroHora.fulfilled payload:",
          action.payload
        );

        // Verificar que el payload sea un objeto válido
        if (!action.payload || typeof action.payload !== "object") {
          console.error(
            "[ERROR] addRegistroHora payload inválido:",
            action.payload
          );
          return {
            ...state,
            loading: false,
            error: "Error: datos de registro inválidos",
          };
        }

        return {
          ...state,
          loading: false,
          registros: [...state.registros, action.payload],
        };
      })
      .addCase(addRegistroHora.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      })
      // Edit
      .addCase(editRegistroHora.pending, (state) => {
        return {
          ...state,
          loading: true,
          error: null,
        };
      })
      .addCase(editRegistroHora.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          registros: state.registros.map((r) =>
            r.id === action.payload.id ? action.payload : r
          ),
        };
      })
      .addCase(editRegistroHora.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      })
      // Remove
      .addCase(removeRegistroHora.pending, (state) => {
        return {
          ...state,
          loading: true,
          error: null,
        };
      })
      .addCase(removeRegistroHora.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          registros: state.registros.filter((r) => r.id !== action.payload),
        };
      })
      .addCase(removeRegistroHora.rejected, (state, action) => {
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      });
  },
});

export default registrosHorasSlice.reducer;

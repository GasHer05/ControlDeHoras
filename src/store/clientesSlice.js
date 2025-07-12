import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAllClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "../services/clientesService";
import { logAuditEvent, AUDIT_EVENTS } from "../utils/auditLogger";

// Modelo de Cliente: { id, nombre, contacto, valorHora, tipoDescuento, valorDescuento, creadoPor, fechaCreacion, modificadoPor, fechaModificacion }

const initialState = {
  clientes: [],
  loading: false,
  error: null,
};

// Thunks asíncronos
export const fetchClientes = createAsyncThunk(
  "clientes/fetchClientes",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllClientes();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addCliente = createAsyncThunk(
  "clientes/addCliente",
  async (clienteData, { rejectWithValue, getState }) => {
    try {
      const result = await createCliente(clienteData);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.CLIENT_CREATED, {
        usuario: currentUser?.usuario,
        clienteAfectado: result?.id,
        nombre: result?.nombre,
      });
      return result;
    } catch (error) {
      console.error("[DEBUG addCliente thunk][catch] error:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const editCliente = createAsyncThunk(
  "clientes/editCliente",
  async ({ id, clienteData }, { rejectWithValue, getState }) => {
    try {
      const result = await updateCliente(id, clienteData);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.CLIENT_UPDATED, {
        usuario: currentUser?.usuario,
        clienteAfectado: id,
        clienteData,
      });
      return result;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeCliente = createAsyncThunk(
  "clientes/removeCliente",
  async (id, { rejectWithValue, getState }) => {
    try {
      await deleteCliente(id);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.CLIENT_DELETED, {
        usuario: currentUser?.usuario,
        clienteAfectado: id,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Copia local de la función normalizeCliente para usar en el reducer
function normalizeCliente(docOrData) {
  const data = docOrData.data ? docOrData.data() : docOrData;
  const id = docOrData.id || (data && data.id) || undefined;
  return {
    id,
    nombre: data.nombre || "",
    email: data.email || "",
    telefono: data.telefono || "",
    activo: typeof data.activo === "boolean" ? data.activo : false,
    fechaCreacion:
      data.fechaCreacion && data.fechaCreacion.toDate
        ? data.fechaCreacion.toDate().toISOString()
        : typeof data.fechaCreacion === "string"
        ? data.fechaCreacion
        : null,
    fechaActualizacion:
      data.fechaActualizacion && data.fechaActualizacion.toDate
        ? data.fechaActualizacion.toDate().toISOString()
        : typeof data.fechaActualizacion === "string"
        ? data.fechaActualizacion
        : null,
    creadoPor: data.creadoPor || "",
    modificadoPor: data.modificadoPor || "",
    ...data,
  };
}

const clientesSlice = createSlice({
  name: "clientes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchClientes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientes.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          clientes: action.payload.map(normalizeCliente),
        };
      })
      .addCase(fetchClientes.rejected, (state, action) => {
        return { ...state, loading: false, error: action.payload };
      })
      // Add
      .addCase(addCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCliente.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          clientes: [...state.clientes, normalizeCliente(action.payload)],
        };
      })
      .addCase(addCliente.rejected, (state, action) => {
        return { ...state, loading: false, error: action.payload };
      })
      // Edit
      .addCase(editCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCliente.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          clientes: state.clientes.map((c) =>
            c.id === action.payload.id ? normalizeCliente(action.payload) : c
          ),
        };
      })
      .addCase(editCliente.rejected, (state, action) => {
        return { ...state, loading: false, error: action.payload };
      })
      // Remove
      .addCase(removeCliente.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCliente.fulfilled, (state, action) => {
        return {
          ...state,
          loading: false,
          clientes: state.clientes
            .filter((c) => c.id !== action.payload)
            .map(normalizeCliente),
        };
      })
      .addCase(removeCliente.rejected, (state, action) => {
        return { ...state, loading: false, error: action.payload };
      });
  },
});

export default clientesSlice.reducer;

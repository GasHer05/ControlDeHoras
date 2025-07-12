import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  verifyUserCredentials,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getUserByUsername,
  normalizeUser,
} from "../services/userService";
import {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
} from "../utils/encryption";
import { logAuditEvent, AUDIT_EVENTS } from "../utils/auditLogger";
import {
  checkRateLimit,
  recordAttempt,
  clearAttempts,
} from "../utils/rateLimiter";
import { ADMIN_CONFIG } from "../config/admin";

// Estado inicial para autenticación
const initialState = {
  isAuthenticated: false,
  currentUser: null,
  loading: false,
  error: null,
  users: [],
};

// Thunks asíncronos
export const fetchUsers = createAsyncThunk(
  "auth/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const users = await getAllUsers();

      // Función de depuración para verificar Timestamps
      const checkForTimestamps = (obj, path = "") => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (
            value &&
            typeof value === "object" &&
            value.constructor &&
            value.constructor.name === "Timestamp"
          ) {
            console.warn(`⚠️ Timestamp detectado en: ${currentPath}`, value);
          } else if (
            value &&
            typeof value === "object" &&
            !Array.isArray(value)
          ) {
            checkForTimestamps(value, currentPath);
          }
        }
      };

      // Verificar cada usuario
      users.forEach((user, index) => {
        checkForTimestamps(user, `users[${index}]`);
      });

      console.log("[DEBUG] Usuarios ya normalizados desde getAllUsers:", users);
      return users;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const user = await verifyUserCredentials(username, password);
      if (!user) {
        logAuditEvent(AUDIT_EVENTS.LOGIN_FAILED, { usuario: username });
        throw new Error("Usuario o contraseña incorrectos");
      }
      logAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, { usuario: username });
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue, getState }) => {
    try {
      const existing = await getUserByUsername(userData.usuario);
      if (existing) throw new Error("El nombre de usuario ya existe");
      const nuevoUsuario = await createUser(userData);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.USER_CREATED, {
        usuario: currentUser?.usuario,
        usuarioAfectado: userData.usuario,
        nombre: userData.nombre,
      });
      return nuevoUsuario;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserData = createAsyncThunk(
  "auth/updateUserData",
  async ({ id, updates }, { rejectWithValue, getState }) => {
    try {
      const updated = await updateUser(id, updates);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.USER_UPDATED, {
        usuario: currentUser?.usuario,
        usuarioAfectado: updates.usuario,
        id,
        updates,
      });
      return updated;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUserData = createAsyncThunk(
  "auth/deleteUserData",
  async (id, { rejectWithValue, getState }) => {
    try {
      await deleteUser(id);
      const currentUser = getState().auth.currentUser;
      logAuditEvent(AUDIT_EVENTS.USER_DELETED, {
        usuario: currentUser?.usuario,
        usuarioAfectado: id,
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserStatusData = createAsyncThunk(
  "auth/toggleUserStatusData",
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      // Cambiar el estado activo/inactivo
      const updates = { activo: !currentStatus };
      return await updateUser(id, updates);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recoveryPasswordUser = createAsyncThunk(
  "auth/recoveryPasswordUser",
  async ({ username, newPassword, securityAnswer }, { rejectWithValue }) => {
    try {
      const user = await getUserByUsername(username);
      if (!user) throw new Error("Usuario no encontrado");
      // (Opcional) Validar respuesta de seguridad aquí si es necesario
      // Actualizar contraseña
      const updates = { password: newPassword };
      return await updateUser(user.id, updates);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const changePasswordUser = createAsyncThunk(
  "auth/changePasswordUser",
  async ({ userId, currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      // Obtener usuario actual
      const user = await getUserByUsername(userId);
      if (!user) throw new Error("Usuario no encontrado");
      // Verificar contraseña actual
      // (Opcional: podrías usar verifyUserCredentials si tienes el username)
      // Aquí asumimos que userId es el username
      const isValid = await verifyUserCredentials(
        user.usuario,
        currentPassword
      );
      if (!isValid) throw new Error("La contraseña actual es incorrecta");
      // Actualizar contraseña
      const updates = { password: newPassword };
      return await updateUser(user.id, updates);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = null;
    },
    clearMessages: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        return { ...state, loading: false, users: action.payload };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.currentUser = null;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(normalizeUser(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserData.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = normalizeUser(action.payload);
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = normalizeUser(action.payload);
        }
      })
      .addCase(updateUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteUserData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserData.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users
          .filter((u) => u.id !== action.payload)
          .map(normalizeUser);
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.isAuthenticated = false;
          state.currentUser = null;
        }
      })
      .addCase(deleteUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle user status
      .addCase(toggleUserStatusData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatusData.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) {
          state.users[idx] = action.payload;
        }
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(toggleUserStatusData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Recovery password
      .addCase(recoveryPasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recoveryPasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        // Opcional: podrías mostrar un mensaje de éxito
      })
      .addCase(recoveryPasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Change password
      .addCase(changePasswordUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordUser.fulfilled, (state, action) => {
        state.loading = false;
        // Opcional: podrías mostrar un mensaje de éxito
      })
      .addCase(changePasswordUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;

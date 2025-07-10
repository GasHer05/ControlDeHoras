import { createSlice, nanoid } from "@reduxjs/toolkit";
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

// Estado inicial para autenticación
const initialState = {
  isAuthenticated: false,
  currentUser: null,
  users: [], // Lista de usuarios registrados
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Registrar nuevo usuario
    register: {
      reducer(state, action) {
        const { fullName, username, password, securityAnswer } = action.payload;

        // Asegurar que users existe
        if (!state.users) {
          state.users = [];
        }

        // Verificar si el usuario ya existe
        const userExists = state.users.find(
          (user) => user.username === username
        );
        if (userExists) {
          state.error = "El nombre de usuario ya existe";
          return;
        }

        // Verificar rate limiting para registro
        const rateLimitCheck = checkRateLimit("REGISTER_ATTEMPTS", username);
        if (!rateLimitCheck.allowed) {
          state.error = rateLimitCheck.message;
          recordAttempt("REGISTER_ATTEMPTS", username, false);
          return;
        }

        // Agregar nuevo usuario
        const newUser = {
          id: nanoid(),
          fullName,
          username,
          password: hashPassword(password, nanoid()), // Contraseña hasheada con salt único
          securityQuestion: "¿Cuál es el nombre de tu primera mascota?",
          securityAnswer: encryptData(securityAnswer), // Respuesta encriptada
          createdAt: new Date().toISOString(),
        };

        state.users.push(newUser);
        state.currentUser = newUser;
        state.isAuthenticated = true;
        state.error = null;
        state.success = "Usuario registrado exitosamente";

        // Log de auditoría y limpiar intentos
        logAuditEvent(AUDIT_EVENTS.REGISTER, {
          username: newUser.username,
          fullName: newUser.fullName,
        });
        recordAttempt("REGISTER_ATTEMPTS", username, true);
        clearAttempts("REGISTER_ATTEMPTS", username);
      },
      prepare({ fullName, username, password, securityAnswer }) {
        return {
          payload: { fullName, username, password, securityAnswer },
        };
      },
    },

    // Iniciar sesión
    login: {
      reducer(state, action) {
        const { username, password } = action.payload;

        // Verificar rate limiting para login
        const rateLimitCheck = checkRateLimit("LOGIN_ATTEMPTS", username);
        if (!rateLimitCheck.allowed) {
          state.error = rateLimitCheck.message;
          recordAttempt("LOGIN_ATTEMPTS", username, false);
          return;
        }

        // Asegurar que users existe
        if (!state.users) {
          state.users = [];
        }

        // Buscar usuario
        const user = state.users.find((u) => u.username === username);

        if (!user) {
          state.error = "Usuario o contraseña incorrectos";
          state.isAuthenticated = false;
          state.currentUser = null;
          recordAttempt("LOGIN_ATTEMPTS", username, false);
          logAuditEvent(AUDIT_EVENTS.LOGIN_FAILED, {
            username,
            reason: "USER_NOT_FOUND",
          });
          return;
        }

        // Verificar contraseña
        if (!verifyPassword(password, user.password, user.id)) {
          state.error = "Usuario o contraseña incorrectos";
          state.isAuthenticated = false;
          state.currentUser = null;
          recordAttempt("LOGIN_ATTEMPTS", username, false);
          logAuditEvent(AUDIT_EVENTS.LOGIN_FAILED, {
            username,
            reason: "INVALID_PASSWORD",
          });
          return;
        }

        state.currentUser = user;
        state.isAuthenticated = true;
        state.error = null;
        state.success = "Sesión iniciada correctamente";

        // Log de auditoría y limpiar intentos
        logAuditEvent(AUDIT_EVENTS.LOGIN_SUCCESS, {
          username: user.username,
          fullName: user.fullName,
        });
        recordAttempt("LOGIN_ATTEMPTS", username, true);
        clearAttempts("LOGIN_ATTEMPTS", username);
      },
      prepare({ username, password }) {
        return {
          payload: { username, password },
        };
      },
    },

    // Cerrar sesión
    logout: (state) => {
      const currentUser = state.currentUser;
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = null;
      state.success = "Sesión cerrada correctamente";

      // Log de auditoría
      if (currentUser) {
        logAuditEvent(AUDIT_EVENTS.LOGOUT, {
          username: currentUser.username,
          fullName: currentUser.fullName,
        });
      }
    },

    // Recuperar contraseña
    recoveryPassword: {
      reducer(state, action) {
        const { username, newPassword } = action.payload;

        // Verificar rate limiting para recuperación
        const rateLimitCheck = checkRateLimit("RECOVERY_ATTEMPTS", username);
        if (!rateLimitCheck.allowed) {
          state.error = rateLimitCheck.message;
          recordAttempt("RECOVERY_ATTEMPTS", username, false);
          return;
        }

        // Buscar usuario
        const user = state.users.find((u) => u.username === username);

        if (!user) {
          state.error = "Usuario no encontrado";
          recordAttempt("RECOVERY_ATTEMPTS", username, false);
          logAuditEvent(AUDIT_EVENTS.PASSWORD_RECOVERY, {
            username,
            success: false,
            reason: "USER_NOT_FOUND",
          });
          return;
        }

        // Actualizar contraseña
        user.password = hashPassword(newPassword, user.id); // Contraseña hasheada con salt único
        user.updatedAt = new Date().toISOString();

        state.error = null;
        state.success = "Contraseña actualizada correctamente";

        // Log de auditoría y limpiar intentos
        logAuditEvent(AUDIT_EVENTS.PASSWORD_RECOVERY, {
          username: user.username,
          success: true,
        });
        recordAttempt("RECOVERY_ATTEMPTS", username, true);
        clearAttempts("RECOVERY_ATTEMPTS", username);
      },
      prepare({ username, newPassword }) {
        return {
          payload: { username, newPassword },
        };
      },
    },

    // Limpiar mensajes
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
});

export const { register, login, logout, recoveryPassword, clearMessages } =
  authSlice.actions;
export default authSlice.reducer;

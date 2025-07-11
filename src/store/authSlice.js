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
import { ADMIN_CONFIG } from "../config/admin";

// Estado inicial para autenticación
const initialState = {
  isAuthenticated: false,
  currentUser: null,
  users: [
    // Usuario administrador por defecto
    {
      id: "admin-default",
      username: ADMIN_CONFIG.DEFAULT_ADMIN.username,
      fullName: ADMIN_CONFIG.DEFAULT_ADMIN.fullName,
      password: hashPassword(
        ADMIN_CONFIG.DEFAULT_ADMIN.password,
        "admin-default"
      ),
      role: ADMIN_CONFIG.DEFAULT_ADMIN.role,
      email: ADMIN_CONFIG.DEFAULT_ADMIN.email,
      isActive: ADMIN_CONFIG.DEFAULT_ADMIN.isActive,
      securityQuestion: "¿Cuál es el nombre de tu primera mascota?",
      securityAnswer: encryptData("admin"),
      createdAt: ADMIN_CONFIG.DEFAULT_ADMIN.createdAt,
    },
  ],
  error: null,
  success: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Registrar nuevo usuario (solo admin puede crear usuarios)
    register: {
      reducer(state, action) {
        const {
          fullName,
          username,
          password,
          securityAnswer,
          role = "user",
          createdBy,
        } = action.payload;

        // Verificar que solo un admin puede crear usuarios
        if (
          !createdBy ||
          !state.users.find((u) => u.id === createdBy && u.role === "admin")
        ) {
          state.error = "Solo los administradores pueden crear usuarios";
          return;
        }

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

        // Agregar nuevo usuario
        const userId = nanoid();
        const newUser = {
          id: userId,
          fullName,
          username,
          password: hashPassword(password, userId), // Contraseña hasheada con userId como salt
          role: role || "user",
          email: "",
          isActive: true,
          securityQuestion: "¿Cuál es el nombre de tu primera mascota?",
          securityAnswer: encryptData(securityAnswer), // Respuesta encriptada
          createdAt: new Date().toISOString(),
          createdBy: createdBy,
        };

        state.users.push(newUser);
        state.error = null;
        state.success = "Usuario creado exitosamente";

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.REGISTER, {
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          createdBy: createdBy,
        });
      },
      prepare({
        fullName,
        username,
        password,
        securityAnswer,
        role,
        createdBy,
      }) {
        return {
          payload: {
            fullName,
            username,
            password,
            securityAnswer,
            role,
            createdBy,
          },
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
        user.password = hashPassword(newPassword, user.id); // Contraseña hasheada con userId como salt
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

    // Cambiar contraseña del usuario actual
    changePassword: {
      reducer(state, action) {
        const { currentPassword, newPassword, userId } = action.payload;

        // Buscar usuario actual
        const user = state.users.find((u) => u.id === userId);

        if (!user) {
          state.error = "Usuario no encontrado";
          return;
        }

        // Verificar contraseña actual
        if (!verifyPassword(currentPassword, user.password, user.id)) {
          state.error = "La contraseña actual es incorrecta";
          logAuditEvent(AUDIT_EVENTS.PASSWORD_CHANGE, {
            username: user.username,
            success: false,
            reason: "INVALID_CURRENT_PASSWORD",
          });
          return;
        }

        // Actualizar contraseña
        user.password = hashPassword(newPassword, user.id);
        user.updatedAt = new Date().toISOString();

        state.error = null;
        state.success = "Contraseña cambiada correctamente";

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.PASSWORD_CHANGE, {
          username: user.username,
          success: true,
        });
      },
      prepare({ currentPassword, newPassword, userId }) {
        return {
          payload: { currentPassword, newPassword, userId },
        };
      },
    },

    // Editar usuario (solo admin)
    editUser: {
      reducer(state, action) {
        const { userId, updates, editedBy } = action.payload;

        // Verificar que solo un admin puede editar usuarios
        if (
          !editedBy ||
          !state.users.find((u) => u.id === editedBy && u.role === "admin")
        ) {
          state.error = "Solo los administradores pueden editar usuarios";
          return;
        }

        const user = state.users.find((u) => u.id === userId);
        if (!user) {
          state.error = "Usuario no encontrado";
          return;
        }

        // Proteger al admin por defecto
        if (user.id === "admin-default" && updates.role !== "admin") {
          state.error =
            "No se puede cambiar el rol del administrador por defecto";
          return;
        }

        // Actualizar usuario
        Object.assign(user, updates);
        user.modifiedBy = editedBy;
        user.modifiedAt = new Date().toISOString();

        state.error = null;
        state.success = "Usuario actualizado correctamente";

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.USER_UPDATED, {
          userId,
          updates,
          editedBy,
        });
      },
      prepare({ userId, updates, editedBy }) {
        return { payload: { userId, updates, editedBy } };
      },
    },

    // Eliminar usuario (solo admin)
    deleteUser: {
      reducer(state, action) {
        const { userId, deletedBy } = action.payload;

        // Verificar que solo un admin puede eliminar usuarios
        if (
          !deletedBy ||
          !state.users.find((u) => u.id === deletedBy && u.role === "admin")
        ) {
          state.error = "Solo los administradores pueden eliminar usuarios";
          return;
        }

        const user = state.users.find((u) => u.id === userId);
        if (!user) {
          state.error = "Usuario no encontrado";
          return;
        }

        // Proteger al admin por defecto
        if (user.id === "admin-default") {
          state.error = "No se puede eliminar al administrador por defecto";
          return;
        }

        // No permitir que un usuario se elimine a sí mismo
        if (userId === deletedBy) {
          state.error = "No puedes eliminar tu propia cuenta";
          return;
        }

        // Eliminar usuario
        state.users = state.users.filter((u) => u.id !== userId);
        state.error = null;
        state.success = "Usuario eliminado correctamente";

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.USER_DELETED, {
          userId,
          username: user.username,
          deletedBy,
        });
      },
      prepare({ userId, deletedBy }) {
        return { payload: { userId, deletedBy } };
      },
    },

    // Activar/Desactivar usuario (solo admin)
    toggleUserStatus: {
      reducer(state, action) {
        const { userId, toggledBy } = action.payload;

        // Verificar que solo un admin puede cambiar estado de usuarios
        if (
          !toggledBy ||
          !state.users.find((u) => u.id === toggledBy && u.role === "admin")
        ) {
          state.error =
            "Solo los administradores pueden cambiar el estado de usuarios";
          return;
        }

        const user = state.users.find((u) => u.id === userId);
        if (!user) {
          state.error = "Usuario no encontrado";
          return;
        }

        // Proteger al admin por defecto
        if (user.id === "admin-default") {
          state.error = "No se puede desactivar al administrador por defecto";
          return;
        }

        // Cambiar estado
        user.isActive = !user.isActive;
        user.modifiedBy = toggledBy;
        user.modifiedAt = new Date().toISOString();

        state.error = null;
        state.success = `Usuario ${
          user.isActive ? "activado" : "desactivado"
        } correctamente`;

        // Log de auditoría
        logAuditEvent(AUDIT_EVENTS.USER_STATUS_CHANGED, {
          userId,
          newStatus: user.isActive,
          toggledBy,
        });
      },
      prepare({ userId, toggledBy }) {
        return { payload: { userId, toggledBy } };
      },
    },

    // Limpiar mensajes
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
});

export const {
  register,
  login,
  logout,
  recoveryPassword,
  changePassword,
  editUser,
  deleteUser,
  toggleUserStatus,
  clearMessages,
} = authSlice.actions;
export default authSlice.reducer;

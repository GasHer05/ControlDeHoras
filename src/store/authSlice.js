import { createSlice, nanoid } from "@reduxjs/toolkit";
import {
  hashPassword,
  verifyPassword,
  encryptData,
  decryptData,
} from "../utils/encryption";

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

        // Agregar nuevo usuario
        const newUser = {
          id: nanoid(),
          fullName,
          username,
          password: hashPassword(password), // Contraseña hasheada
          securityQuestion: "¿Cuál es el nombre de tu primera mascota?",
          securityAnswer: encryptData(securityAnswer), // Respuesta encriptada
          createdAt: new Date().toISOString(),
        };

        state.users.push(newUser);
        state.currentUser = newUser;
        state.isAuthenticated = true;
        state.error = null;
        state.success = "Usuario registrado exitosamente";
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
          return;
        }

        // Verificar contraseña
        if (!verifyPassword(password, user.password)) {
          state.error = "Usuario o contraseña incorrectos";
          state.isAuthenticated = false;
          state.currentUser = null;
          return;
        }

        state.currentUser = user;
        state.isAuthenticated = true;
        state.error = null;
        state.success = "Sesión iniciada correctamente";
      },
      prepare({ username, password }) {
        return {
          payload: { username, password },
        };
      },
    },

    // Cerrar sesión
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.error = null;
      state.success = "Sesión cerrada correctamente";
    },

    // Recuperar contraseña
    recoveryPassword: {
      reducer(state, action) {
        const { username, newPassword } = action.payload;

        // Buscar usuario
        const user = state.users.find((u) => u.username === username);

        if (!user) {
          state.error = "Usuario no encontrado";
          return;
        }

        // Actualizar contraseña
        user.password = hashPassword(newPassword); // Contraseña hasheada
        user.updatedAt = new Date().toISOString();

        state.error = null;
        state.success = "Contraseña actualizada correctamente";
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

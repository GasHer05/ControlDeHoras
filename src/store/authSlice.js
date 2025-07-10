import { createSlice, nanoid } from "@reduxjs/toolkit";

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
        const { username, password } = action.payload;

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
          username,
          password, // En producción debería estar encriptada
          createdAt: new Date().toISOString(),
        };

        state.users.push(newUser);
        state.currentUser = newUser;
        state.isAuthenticated = true;
        state.error = null;
        state.success = "Usuario registrado exitosamente";
      },
      prepare({ username, password }) {
        return {
          payload: { username, password },
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
        const user = state.users.find(
          (u) => u.username === username && u.password === password
        );

        if (!user) {
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

    // Limpiar mensajes
    clearMessages: (state) => {
      state.error = null;
      state.success = null;
    },
  },
});

export const { register, login, logout, clearMessages } = authSlice.actions;
export default authSlice.reducer;

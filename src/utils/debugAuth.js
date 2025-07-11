// Archivo temporal de debug para problemas de autenticación
// Este archivo debe ser eliminado después de resolver el problema

import { hashPassword, verifyPassword } from "./encryption.js";

// Función para diagnosticar problemas de login
export const debugLogin = (username) => {
  console.log("🔍 Diagnóstico de login para:", username);

  try {
    // Obtener estado de Redux
    const persistData = localStorage.getItem("persist:root");
    if (!persistData) {
      console.log("❌ No se encontró el estado persistido de Redux");
      return;
    }

    const state = JSON.parse(persistData);
    if (!state.auth) {
      console.log("❌ No se encontró el estado de autenticación");
      return;
    }

    const authState = JSON.parse(state.auth);
    if (!authState.users || !Array.isArray(authState.users)) {
      console.log("❌ No se encontraron usuarios en el estado");
      return;
    }

    // Buscar el usuario específico
    const user = authState.users.find((u) => u.username === username);
    if (!user) {
      console.log(`❌ Usuario '${username}' no encontrado`);
      console.log("👥 Usuarios disponibles:");
      authState.users.forEach((u) => {
        console.log(`   - ${u.username} (${u.role}) - ID: ${u.id}`);
      });
      return;
    }

    console.log("✅ Usuario encontrado:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Usuario: ${user.username}`);
    console.log(`   Nombre: ${user.fullName}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   Activo: ${user.isActive}`);
    console.log(`   Hash de contraseña: ${user.password}`);
    console.log(`   Creado: ${user.createdAt}`);

    // Verificar si el usuario está activo
    if (!user.isActive) {
      console.log("❌ Usuario está inactivo");
      return;
    }

    // Verificar rate limits
    const rateLimitKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("rate_limit_LOGIN_ATTEMPTS_") && key.includes(username)
    );

    if (rateLimitKeys.length > 0) {
      console.log("⚠️ Rate limits encontrados:");
      rateLimitKeys.forEach((key) => {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        console.log(`   ${key}: ${data.length} intentos`);
      });
    } else {
      console.log("✅ No hay rate limits para este usuario");
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        isActive: user.isActive,
        passwordHash: user.password,
        createdAt: user.createdAt,
      },
      rateLimits: rateLimitKeys.length,
    };
  } catch (error) {
    console.error("❌ Error al diagnosticar login:", error);
    return null;
  }
};

// Función para limpiar rate limits de un usuario específico
export const clearUserRateLimits = (username) => {
  try {
    const keys = Object.keys(localStorage);
    const userRateLimitKeys = keys.filter(
      (key) => key.startsWith("rate_limit_") && key.includes(username)
    );

    userRateLimitKeys.forEach((key) => {
      localStorage.removeItem(key);
      console.log(`🗑️ Eliminado rate limit: ${key}`);
    });

    console.log(`✅ Rate limits limpiados para usuario '${username}'`);
    return {
      success: true,
      clearedKeys: userRateLimitKeys.length,
    };
  } catch (error) {
    console.error("❌ Error al limpiar rate limits:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Función para verificar contraseña manualmente
export const testPassword = (username, password) => {
  try {
    const persistData = localStorage.getItem("persist:root");
    if (!persistData) {
      console.log("❌ No se encontró el estado persistido de Redux");
      return false;
    }

    const state = JSON.parse(persistData);
    const authState = JSON.parse(state.auth);
    const user = authState.users.find((u) => u.username === username);

    if (!user) {
      console.log(`❌ Usuario '${username}' no encontrado`);
      return false;
    }

    // Verificar contraseña
    const isValid = verifyPassword(password, user.password, user.id);
    console.log(`🔐 Verificación de contraseña para '${username}':`);
    console.log(`   Contraseña ingresada: ${password}`);
    console.log(`   Hash almacenado: ${user.password}`);
    console.log(`   ID del usuario: ${user.id}`);
    console.log(`   Resultado: ${isValid ? "✅ VÁLIDA" : "❌ INVÁLIDA"}`);

    // Generar hash para comparación
    const newHash = hashPassword(password, user.id);
    console.log(`   Hash generado: ${newHash}`);
    console.log(
      `   Coinciden: ${newHash === user.password ? "✅ SÍ" : "❌ NO"}`
    );

    return isValid;
  } catch (error) {
    console.error("❌ Error al verificar contraseña:", error);
    return false;
  }
};

// Función para crear un manager de prueba
export const createTestManager = () => {
  try {
    const persistData = localStorage.getItem("persist:root");
    if (!persistData) {
      console.log("❌ No se encontró el estado persistido de Redux");
      return false;
    }

    const state = JSON.parse(persistData);
    const authState = JSON.parse(state.auth);

    // Crear manager de prueba
    const testManager = {
      id: "test-manager-" + Date.now(),
      username: "manager",
      fullName: "Manager de Prueba",
      password: hashPassword("Manager123!", "test-manager-" + Date.now()),
      role: "manager",
      email: "manager@test.com",
      isActive: true,
      securityQuestion: "¿Cuál es el nombre de tu primera mascota?",
      securityAnswer: "test",
      createdAt: new Date().toISOString(),
      createdBy: "admin-default",
    };

    // Agregar al estado
    authState.users.push(testManager);
    state.auth = JSON.stringify(authState);
    localStorage.setItem("persist:root", JSON.stringify(state));

    console.log("✅ Manager de prueba creado:");
    console.log(`   Usuario: ${testManager.username}`);
    console.log(`   Contraseña: Manager123!`);
    console.log(`   Rol: ${testManager.role}`);
    console.log(`   ID: ${testManager.id}`);

    return {
      success: true,
      credentials: {
        username: testManager.username,
        password: "Manager123!",
      },
    };
  } catch (error) {
    console.error("❌ Error al crear manager de prueba:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Ejecutar automáticamente si se importa este archivo
if (typeof window !== "undefined") {
  console.log("🔧 Archivo de debug de autenticación cargado");
  console.log(
    '💡 Para diagnosticar un usuario, ejecuta: debugLogin("username")'
  );
  console.log(
    '💡 Para limpiar rate limits, ejecuta: clearUserRateLimits("username")'
  );
  console.log(
    '💡 Para verificar contraseña, ejecuta: testPassword("username", "password")'
  );
  console.log("💡 Para crear manager de prueba, ejecuta: createTestManager()");
}

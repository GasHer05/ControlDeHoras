import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { hashPassword } from "../utils/encryption";
import { getPasswordSalt } from "../config/security";

const COLLECTION_NAME = "usuarios";

// Función para migrar usuarios desde localStorage a Firestore
export const migrateUsersFromLocalStorage = async () => {
  try {
    console.log("🔄 Iniciando migración de usuarios...");

    // Obtener usuarios de localStorage
    const storedUsers = JSON.parse(localStorage.getItem("usuarios") || "[]");

    if (storedUsers.length === 0) {
      console.log("ℹ️ No hay usuarios en localStorage para migrar");
      return {
        success: true,
        message: "No hay usuarios para migrar",
        count: 0,
      };
    }

    console.log(`📊 Encontrados ${storedUsers.length} usuarios para migrar`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of storedUsers) {
      try {
        // Verificar si el usuario ya existe en Firestore
        const existingUser = await getUserByUsername(user.usuario);

        if (existingUser) {
          console.log(
            `⚠️ Usuario ${user.usuario} ya existe en Firestore, saltando...`
          );
          continue;
        }

        // Preparar datos del usuario para Firestore
        const userData = {
          nombre: user.nombre,
          usuario: user.usuario,
          passwordHash: user.passwordHash,
          rol: user.rol,
          activo: user.activo,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };

        // Crear usuario en Firestore
        const docRef = await addDoc(collection(db, COLLECTION_NAME), userData);

        console.log(`✅ Usuario ${user.usuario} migrado con ID: ${docRef.id}`);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrando usuario ${user.usuario}:`, error);
        errorCount++;
      }
    }

    console.log(
      `🎉 Migración completada: ${migratedCount} usuarios migrados, ${errorCount} errores`
    );

    return {
      success: true,
      message: `Migración completada: ${migratedCount} usuarios migrados`,
      migratedCount,
      errorCount,
      totalCount: storedUsers.length,
    };
  } catch (error) {
    console.error("❌ Error en migración de usuarios:", error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Normaliza un usuario Firestore a formato serializable y consistente
function normalizeUser(docOrData, idFromDoc = null) {
  // docOrData puede ser un DocumentSnapshot o un objeto plano
  const data = docOrData.data ? docOrData.data() : docOrData;
  const id = docOrData.id || idFromDoc || (data && data.id) || undefined;

  // Función auxiliar para convertir Timestamps
  const convertTimestamp = (timestamp) => {
    if (timestamp && typeof timestamp === "object" && timestamp.toDate) {
      return timestamp.toDate().toISOString();
    }
    if (typeof timestamp === "string") {
      return timestamp;
    }
    return null;
  };

  // Función auxiliar para limpiar campos no serializables
  const cleanData = (obj) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Saltar campos que ya procesamos explícitamente
      if (
        [
          "id",
          "usuario",
          "nombre",
          "rol",
          "activo",
          "fechaCreacion",
          "fechaActualizacion",
        ].includes(key)
      ) {
        continue;
      }
      // Convertir cualquier Timestamp que encuentre
      if (value && typeof value === "object" && value.toDate) {
        cleaned[key] = convertTimestamp(value);
      } else {
        cleaned[key] = value;
      }
    }
    return cleaned;
  };

  return {
    id,
    usuario: data.usuario || "",
    nombre: data.nombre || "",
    rol: data.rol || "",
    activo: typeof data.activo === "boolean" ? data.activo : false,
    fechaCreacion: convertTimestamp(data.fechaCreacion),
    fechaActualizacion: convertTimestamp(data.fechaActualizacion),
    // Incluir otros campos limpiados
    ...cleanData(data),
  };
}

// Obtener todos los usuarios
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => normalizeUser(doc));
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
};

// Obtener usuario por ID
export const getUserById = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return normalizeUser(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario por ID:", error);
    throw error;
  }
};

// Obtener usuario por nombre de usuario
export const getUserByUsername = async (username) => {
  if (!username) {
    throw new Error("El username es requerido para buscar el usuario.");
  }
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("usuario", "==", username)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return normalizeUser(doc);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario por username:", error);
    throw error;
  }
};

// Crear nuevo usuario
export const createUser = async (userData) => {
  try {
    // Generar hash de la contraseña
    const passwordHash = hashPassword(userData.password, userData.usuario);

    const newUser = {
      nombre: userData.nombre,
      usuario: userData.usuario,
      passwordHash: passwordHash,
      rol: userData.rol,
      activo: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newUser);

    // Normalizar antes de retornar para evitar valores no serializables
    return normalizeUser({ id: docRef.id, ...newUser });
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (id, userData) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);

    const updateData = {
      ...userData,
      fechaActualizacion: new Date(),
    };

    // Si hay nueva contraseña, generar hash
    if (userData.password) {
      if (!userData.usuario) {
        throw new Error(
          "El campo 'usuario' es requerido para actualizar la contraseña."
        );
      }
      updateData.passwordHash = hashPassword(
        userData.password,
        userData.usuario
      );
      delete updateData.password; // No guardar la contraseña en texto plano
    }

    await updateDoc(docRef, updateData);

    // Normalizar antes de retornar para evitar valores no serializables
    return normalizeUser({ id, ...updateData });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw error;
  }
};

// Eliminar usuario
export const deleteUser = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw error;
  }
};

// Verificar credenciales de usuario
export const verifyUserCredentials = async (username, password) => {
  try {
    const user = await getUserByUsername(username);

    if (!user || !user.activo) {
      return null;
    }

    // Verificar contraseña
    const salt = `${getPasswordSalt()}_${username}`;
    const passwordHash = hashPassword(password, username);
    console.log(
      "[DEBUG LOGIN] username:",
      username,
      "| password:",
      password,
      "| salt:",
      salt,
      "| hash calculado:",
      passwordHash,
      "| hash Firestore:",
      user.passwordHash
    );

    if (user.passwordHash === passwordHash) {
      return {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        rol: user.rol,
        role: user.rol,
        activo: user.activo,
      };
    }

    return null;
  } catch (error) {
    console.error("Error verificando credenciales:", error);
    throw error;
  }
};

// Escuchar cambios en usuarios (tiempo real)
export const subscribeToUsers = (callback) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const users = snapshot.docs.map((doc) => normalizeUser(doc));
      callback(users);
    }
  );

  return unsubscribe;
};

export { normalizeUser };

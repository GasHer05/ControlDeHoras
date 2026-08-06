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
  onSnapshot,
} from "firebase/firestore";

const COLLECTION_NAME = "registrosHoras";

// Migrar registros de horas desde localStorage a Firestore
export const migrateRegistrosHorasFromLocalStorage = async () => {
  try {
    console.log("🔄 Iniciando migración de registros de horas...");
    const storedRegistros = JSON.parse(
      localStorage.getItem("registrosHoras") || "[]"
    );
    if (storedRegistros.length === 0) {
      console.log("ℹ️ No hay registros de horas en localStorage para migrar");
      return {
        success: true,
        message: "No hay registros de horas para migrar",
        count: 0,
      };
    }
    let migratedCount = 0;
    let errorCount = 0;
    for (const registro of storedRegistros) {
      try {
        // Verificar si el registro ya existe en Firestore (por userId, clienteId y fecha)
        const existing = await getRegistroByUniqueFields(
          registro.userId,
          registro.clienteId,
          registro.fecha
        );
        if (existing) {
          console.log(
            `⚠️ Registro de horas ya existe para userId ${registro.userId}, clienteId ${registro.clienteId}, fecha ${registro.fecha}`
          );
          continue;
        }
        const registroData = {
          userId: registro.userId,
          clienteId: registro.clienteId,
          fecha: registro.fecha,
          horas: registro.horas,
          descripcion: registro.descripcion,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };
        await addDoc(collection(db, COLLECTION_NAME), registroData);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrando registro de horas:`, error);
        errorCount++;
      }
    }
    return {
      success: true,
      message: `Migración completada: ${migratedCount} registros de horas migrados`,
      migratedCount,
      errorCount,
      totalCount: storedRegistros.length,
    };
  } catch (error) {
    console.error("❌ Error en migración de registros de horas:", error);
    return { success: false, message: error.message, error };
  }
};

// Normaliza un registro de horas Firestore a formato serializable y consistente
function normalizeRegistroHora(docOrData, idFromDoc = null) {
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
          "userId",
          "clienteId",
          "fecha",
          "horas",
          "descripcion",
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
    userId: data.userId || "",
    clienteId: data.clienteId || "",
    fecha: data.fecha || "",
    horas: typeof data.horas === "number" ? data.horas : 0,
    descripcion: data.descripcion || "",
    fechaCreacion: convertTimestamp(data.fechaCreacion),
    fechaActualizacion: convertTimestamp(data.fechaActualizacion),
    // Incluir otros campos limpiados
    ...cleanData(data),
  };
}

// CRUD básico
export const getAllRegistrosHoras = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map((doc) => normalizeRegistroHora(doc));
  } catch (error) {
    console.error("[ERROR] getAllRegistrosHoras:", error);
    throw error;
  }
};

export const getRegistroById = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? normalizeRegistroHora(docSnap) : null;
};

export const getRegistroByUniqueFields = async (userId, clienteId, fecha) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
    where("clienteId", "==", clienteId),
    where("fecha", "==", fecha)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return normalizeRegistroHora(doc);
  }
  return null;
};

export const createRegistroHora = async (registroData) => {
  try {
    // Filtrar campos undefined para evitar errores de Firestore
    const cleanData = Object.fromEntries(
      Object.entries(registroData).filter(([key, value]) => value !== undefined)
    );
    // Si ya viene fechaCreacion, no la sobrescribas
    const newRegistro = {
      ...cleanData,
      fechaCreacion: cleanData.fechaCreacion || new Date(),
      fechaActualizacion: new Date(),
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), newRegistro);
    return normalizeRegistroHora({ id: docRef.id, ...newRegistro });
  } catch (error) {
    console.error("[ERROR] createRegistroHora:", error);
    throw error;
  }
};

export const updateRegistroHora = async (id, registroData) => {
  try {
    // Leer el registro original
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    const original = docSnap.exists() ? docSnap.data() : {};

    // Filtrar campos undefined para evitar errores de Firestore
    const cleanData = Object.fromEntries(
      Object.entries(registroData).filter(([key, value]) => value !== undefined)
    );
    // Preservar creadoPor y fechaCreacion originales si no se envían
    const updateData = {
      ...cleanData,
      creadoPor: cleanData.creadoPor || original.creadoPor || "-",
      fechaCreacion:
        cleanData.fechaCreacion || original.fechaCreacion || new Date(),
      fechaModificacion: new Date(),
    };
    await updateDoc(docRef, updateData);
    return normalizeRegistroHora({ id, ...updateData });
  } catch (error) {
    console.error("[ERROR] updateRegistroHora:", error);
    throw error;
  }
};

export const deleteRegistroHora = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  return true;
};

export const subscribeToRegistrosHoras = (callback) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const registros = snapshot.docs.map((doc) => normalizeRegistroHora(doc));
      callback(registros);
    }
  );
  return unsubscribe;
};

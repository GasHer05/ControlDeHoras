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

const COLLECTION_NAME = "clientes";

// Migrar clientes desde localStorage a Firestore
export const migrateClientesFromLocalStorage = async () => {
  try {
    console.log("🔄 Iniciando migración de clientes...");
    const storedClientes = JSON.parse(localStorage.getItem("clientes") || "[]");
    if (storedClientes.length === 0) {
      console.log("ℹ️ No hay clientes en localStorage para migrar");
      return {
        success: true,
        message: "No hay clientes para migrar",
        count: 0,
      };
    }
    let migratedCount = 0;
    let errorCount = 0;
    for (const cliente of storedClientes) {
      try {
        // Verificar si el cliente ya existe en Firestore (por nombre y/o email)
        const existing = await getClienteByNombre(cliente.nombre);
        if (existing) {
          console.log(
            `⚠️ Cliente ${cliente.nombre} ya existe en Firestore, saltando...`
          );
          continue;
        }
        const clienteData = {
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          activo: cliente.activo,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
        };
        await addDoc(collection(db, COLLECTION_NAME), clienteData);
        migratedCount++;
      } catch (error) {
        console.error(`❌ Error migrando cliente ${cliente.nombre}:`, error);
        errorCount++;
      }
    }
    return {
      success: true,
      message: `Migración completada: ${migratedCount} clientes migrados`,
      migratedCount,
      errorCount,
      totalCount: storedClientes.length,
    };
  } catch (error) {
    console.error("❌ Error en migración de clientes:", error);
    return { success: false, message: error.message, error };
  }
};

// Normaliza un cliente Firestore a formato serializable y consistente
function normalizeCliente(docOrData, idFromDoc = null) {
  const data = docOrData.data ? docOrData.data() : docOrData;
  const id = docOrData.id || idFromDoc || (data && data.id) || undefined;
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
    // Incluye cualquier otro campo adicional
    ...data,
  };
}

// CRUD básico
export const getAllClientes = async () => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map((doc) => normalizeCliente(doc));
};

export const getClienteById = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? normalizeCliente(docSnap) : null;
};

export const getClienteByNombre = async (nombre) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where("nombre", "==", nombre)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return normalizeCliente(doc);
  }
  return null;
};

export const createCliente = async (clienteData) => {
  const now = new Date().toISOString();
  const newCliente = {
    ...clienteData,
    activo: true,
    fechaCreacion: now,
    fechaActualizacion: now,
    creadoPor: clienteData.creadoPor || "",
    modificadoPor: "",
  };
  const docRef = await addDoc(collection(db, COLLECTION_NAME), newCliente);
  return { id: docRef.id, ...newCliente };
};

export const updateCliente = async (id, clienteData) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData = {
    ...clienteData,
    fechaActualizacion: new Date().toISOString(),
    modificadoPor: clienteData.modificadoPor || "",
  };
  await updateDoc(docRef, updateData);
  return { id, ...updateData };
};

export const deleteCliente = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
  return true;
};

export const subscribeToClientes = (callback) => {
  const unsubscribe = onSnapshot(
    collection(db, COLLECTION_NAME),
    (snapshot) => {
      const clientes = snapshot.docs.map((doc) => normalizeCliente(doc));
      callback(clientes);
    }
  );
  return unsubscribe;
};

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
  limit,
  startAfter,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

// Funciones básicas de CRUD para cualquier colección
export const firestoreUtils = {
  // Obtener todos los documentos de una colección
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error obteniendo documentos de ${collectionName}:`, error);
      throw error;
    }
  },

  // Obtener un documento por ID
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error(
        `Error obteniendo documento ${id} de ${collectionName}:`,
        error
      );
      throw error;
    }
  },

  // Crear un nuevo documento
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return {
        id: docRef.id,
        ...data,
      };
    } catch (error) {
      console.error(`Error creando documento en ${collectionName}:`, error);
      throw error;
    }
  },

  // Actualizar un documento
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return {
        id,
        ...data,
      };
    } catch (error) {
      console.error(
        `Error actualizando documento ${id} en ${collectionName}:`,
        error
      );
      throw error;
    }
  },

  // Eliminar un documento
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(
        `Error eliminando documento ${id} de ${collectionName}:`,
        error
      );
      throw error;
    }
  },

  // Buscar documentos con filtros
  async query(
    collectionName,
    filters = [],
    orderByField = null,
    limitCount = null
  ) {
    try {
      let q = collection(db, collectionName);

      // Aplicar filtros
      filters.forEach((filter) => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Aplicar ordenamiento
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }

      // Aplicar límite
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error(`Error consultando ${collectionName}:`, error);
      throw error;
    }
  },

  // Escuchar cambios en tiempo real
  subscribeToCollection(collectionName, callback) {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(data);
      }
    );

    return unsubscribe;
  },
};

export default firestoreUtils;

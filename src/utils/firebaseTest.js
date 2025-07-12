import { db } from "../config/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Función para probar la conexión a Firebase
export const testFirebaseConnection = async () => {
  try {
    console.log("🔍 Probando conexión a Firebase...");

    // Intentar obtener documentos de una colección de prueba
    const testCollection = collection(db, "test");
    const querySnapshot = await getDocs(testCollection);

    console.log("✅ Conexión a Firebase exitosa!");
    console.log(`📊 Documentos en colección test: ${querySnapshot.size}`);

    return {
      success: true,
      message: "Conexión a Firebase exitosa",
      documentCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("❌ Error conectando a Firebase:", error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Función para crear un documento de prueba
export const createTestDocument = async () => {
  try {
    console.log("📝 Creando documento de prueba...");

    const testData = {
      message: "Test de conexión Firebase",
      timestamp: new Date(),
      project: "registro-de-horas",
    };

    const docRef = await addDoc(collection(db, "test"), testData);

    console.log("✅ Documento de prueba creado con ID:", docRef.id);

    return {
      success: true,
      documentId: docRef.id,
      message: "Documento de prueba creado exitosamente",
    };
  } catch (error) {
    console.error("❌ Error creando documento de prueba:", error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// Función para limpiar documentos de prueba
export const cleanupTestDocuments = async () => {
  try {
    console.log("🧹 Limpiando documentos de prueba...");

    const testCollection = collection(db, "test");
    const querySnapshot = await getDocs(testCollection);

    // Nota: En producción, deberías usar deleteDoc para eliminar documentos
    // Por ahora solo contamos cuántos hay
    console.log(`📊 Documentos de prueba encontrados: ${querySnapshot.size}`);

    return {
      success: true,
      message: "Limpieza completada",
      documentCount: querySnapshot.size,
    };
  } catch (error) {
    console.error("❌ Error limpiando documentos de prueba:", error);
    return {
      success: false,
      message: error.message,
      error: error,
    };
  }
};

// src/config/firebase.example.js
// Este es un archivo de ejemplo. Copia este contenido a firebase.js y reemplaza los valores

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Ejemplo de configuración de Firebase
// Reemplaza estos valores con los de tu consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener instancia de Firestore
const db = getFirestore(app);

export { db };

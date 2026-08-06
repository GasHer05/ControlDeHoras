/**
 * Script de emergencia: restablece la contraseña del usuario admin.
 * Uso: node scripts/reset-admin-password.mjs [nueva-contraseña]
 */
import CryptoJS from "crypto-js";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env");
const envContent = readFileSync(envPath, "utf8");
const env = Object.fromEntries(
  envContent
    .split("\n")
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const [key, ...rest] = line.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
);

const PASSWORD_SALT =
  env.REACT_APP_PASSWORD_SALT || "horas-cliente-salt-2024";
const newPassword = process.argv[2] || "Admin2024!";

function hashPassword(password, username) {
  const salt = `${PASSWORD_SALT}_${username}`;
  return CryptoJS.SHA256(password + salt).toString();
}

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const q = query(collection(db, "usuarios"), where("usuario", "==", "admin"));
const snapshot = await getDocs(q);

if (snapshot.empty) {
  console.log("\nNo existe un usuario 'admin' en Firestore.");
  console.log("Ejecutá list-users.mjs para ver los usuarios disponibles.\n");
  process.exit(1);
}

const adminDoc = snapshot.docs[0];
const passwordHash = hashPassword(newPassword, "admin");

await updateDoc(doc(db, "usuarios", adminDoc.id), {
  passwordHash,
  fechaActualizacion: new Date(),
});

console.log("\nContraseña del admin restablecida correctamente.");
console.log(`Usuario: admin`);
console.log(`Nueva contraseña: ${newPassword}\n`);
process.exit(0);

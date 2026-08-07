import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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

const clientesSnap = await getDocs(collection(db, "clientes"));
console.log(`\nTotal clientes: ${clientesSnap.size}`);
clientesSnap.docs.forEach((d) => {
  console.log(`  ID: ${d.id} | nombre: ${d.data().nombre}`);
});

const registrosSnap = await getDocs(collection(db, "registrosHoras"));
console.log(`\nTotal registros: ${registrosSnap.size}`);
registrosSnap.docs.forEach((d) => {
  const r = d.data();
  console.log(
    `  ID: ${d.id} | clienteId: ${r.clienteId} | fecha: ${r.fecha} | horas: ${JSON.stringify(
      r.horas
    )} (${typeof r.horas}) | monto: ${JSON.stringify(r.monto)} | moneda: ${JSON.stringify(
      r.moneda
    )}`
  );
});

process.exit(0);

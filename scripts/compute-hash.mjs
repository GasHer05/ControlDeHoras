import CryptoJS from "crypto-js";

const salt = "horas-cliente-salt-2024";
const passwords = ["Admin2024!", "cambiar-por-password-real"];

for (const p of passwords) {
  const hash = CryptoJS.SHA256(p + salt + "_admin").toString();
  console.log(`admin / ${p} => ${hash}`);
}

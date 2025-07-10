import { decryptClientData } from "./encryption";

// Selector para obtener clientes desencriptados
export const selectClientesDecrypted = (state) => {
  return state.clientes.map((cliente) => decryptClientData(cliente));
};

// Selector para obtener un cliente específico desencriptado
export const selectClienteDecrypted = (state, clienteId) => {
  const cliente = state.clientes.find((c) => c.id === clienteId);
  return cliente ? decryptClientData(cliente) : null;
};

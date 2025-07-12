import { createSelector } from "@reduxjs/toolkit";
import { decryptClientData } from "./encryption";

const EMPTY_ARRAY = [];

// Selector para obtener clientes desencriptados (memoizado)
export const selectClientesDecrypted = createSelector(
  (state) => state.clientes.clientes || EMPTY_ARRAY,
  (clientes) => clientes.map((cliente) => decryptClientData(cliente))
);

// Selector para obtener un cliente específico desencriptado
export const selectClienteDecrypted = (state, clienteId) => {
  const cliente = state.clientes.clientes.find((c) => c.id === clienteId);
  return cliente ? decryptClientData(cliente) : null;
};

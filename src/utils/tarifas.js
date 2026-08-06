// Helpers para leer tarifas de cliente por moneda y calcular IVA.
//
// Modelo nuevo: cliente.tarifas = { UYU: {valorHora, tipoDescuento, valorDescuento} | null, USD: {...} | null }
// Modelo legacy (clientes creados antes de multi-moneda): cliente.valorHora / tipoDescuento / valorDescuento
// sueltos, sin cliente.tarifas. Se tratan como si fueran la tarifa en UYU.

export function getTarifa(cliente, moneda) {
  if (!cliente) return null;
  if (cliente.tarifas) {
    return cliente.tarifas[moneda] || null;
  }
  if (moneda === "UYU" && cliente.valorHora) {
    return {
      valorHora: cliente.valorHora,
      tipoDescuento: cliente.tipoDescuento || "",
      valorDescuento: cliente.valorDescuento || "",
    };
  }
  return null;
}

// Monedas para las que el cliente tiene una tarifa configurada
export function monedasDisponibles(cliente) {
  if (!cliente) return [];
  if (cliente.tarifas) {
    return Object.keys(cliente.tarifas).filter(
      (moneda) => cliente.tarifas[moneda] && cliente.tarifas[moneda].valorHora
    );
  }
  return cliente.valorHora ? ["UYU"] : [];
}

export function calcularIVA(monto, tasaIVA) {
  const tasa = Number(tasaIVA) || 0;
  return Math.round(Number(monto) * (tasa / 100) * 100) / 100;
}

export function calcularTotalConIVA(monto, tasaIVA) {
  return Math.round((Number(monto) + calcularIVA(monto, tasaIVA)) * 100) / 100;
}

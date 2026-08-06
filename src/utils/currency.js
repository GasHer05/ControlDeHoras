// Utilidades de formato y metadata de moneda (UYU / USD)

export const MONEDAS = ["UYU", "USD"];

export const MONEDA_INFO = {
  UYU: { label: "Pesos (UYU)", corto: "UYU", simbolo: "$", claseBadge: "badge-uyu" },
  USD: { label: "Dólares (USD)", corto: "USD", simbolo: "US$", claseBadge: "badge-usd" },
};

export function esMonedaValida(moneda) {
  return MONEDAS.includes(moneda);
}

// Formatea solo el número (sin símbolo) con separador de miles, útil para el PDF
// donde el símbolo se escribe aparte
export function formatNumber(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("es-UY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Formatea un monto con separador de miles y el símbolo propio de cada moneda.
// No se usa Intl currencyDisplay porque en varias locales UYU y USD comparten
// el símbolo "$", lo que haría imposible distinguirlas a simple vista.
export function formatMoney(amount, moneda = "UYU") {
  const currency = esMonedaValida(moneda) ? moneda : "UYU";
  const info = MONEDA_INFO[currency];
  return `${info.simbolo} ${formatNumber(amount)}`;
}

// Currency codes render as "USD 199.00"; symbol currencies like the
// peso render tight against the amount, "₱199.00", with no code prefix.
const SYMBOL_CURRENCIES = new Set(["₱"]);

export function formatMoney(currency: string, amount: number): string {
  const formatted = amount.toFixed(2);
  return SYMBOL_CURRENCIES.has(currency) ? `${currency}${formatted}` : `${currency} ${formatted}`;
}

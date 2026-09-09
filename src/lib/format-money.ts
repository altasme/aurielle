// Sitewide pricing is in USD, rendered as "$199.00" (tight against the
// amount, dollar sign not the "USD" code) -- both Aurielle Collection
// and Atelier Supply price this way now. "₱" is kept mapped here too:
// it's what Aurielle Collection products were priced in before the
// relabel and may still be the stored value for any row until the
// 0019_usd_relabel.sql migration is run, or for a row that predates it
// -- same "$" display either way, no numeric change.
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  "₱": "$",
};

export function formatMoney(currency: string, amount: number): string {
  const formatted = amount.toFixed(2);
  const symbol = CURRENCY_SYMBOLS[currency];
  return symbol ? `${symbol}${formatted}` : `${currency} ${formatted}`;
}

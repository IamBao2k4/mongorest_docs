export function formatCurrencyVND(amount) {
  const formatted = new Intl.NumberFormat('en-US').format(amount);
  return `${formatted} VND`;
}

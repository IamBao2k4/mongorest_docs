export function formatRangeString(rangeString) {
  if (!rangeString.includes(',')) return rangeString;

  const [startDate, endDate] = rangeString.split(',');

  return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
}

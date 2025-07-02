export async function handleExportExcel(data) {
  const { utils, writeFile } = await import('../../public/scripts-dynamic/xlsx.mjs');
  const wb = utils.book_new();
  const ws = utils.json_to_sheet(data);
  utils.book_append_sheet(wb, ws, 'data');
  writeFile(wb, 'file.xlsx');
}

import xlsx from 'xlsx';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const excelPath = 'C:\\Users\\Admin\\OneDrive\\Desktop\\07-11-2026\\18-11-2026\\REST_ADDED_PASS_LIST\\17_11_2026_ADDITIONAL__EMPLOYEES_WITH_GENERATED_EMAIL.xlsx';

try {
  const workbook = xlsx.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  console.log('Sheets:', workbook.SheetNames);
  console.log('Columns:', Object.keys(data[0] || {}));
  console.log('Sample rows (first 3):');
  data.slice(0, 3).forEach((row, i) => console.log(`Row ${i}:`, row));
  console.log('Total rows:', data.length);
} catch (e) {
  console.error('Error reading Excel:', e.message);
}

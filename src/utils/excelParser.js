import * as XLSX from 'xlsx';
import { isValidPhone } from './validators';

const HEADER_ALIASES = {
  name: ['name', 'full name', 'fullname', 'contributor', 'contributor name'],
  phone: ['phone', 'phone number', 'mobile', 'contact', 'tel'],
  amount: ['amount', 'contribution', 'contribution amount', 'amount (tzs)', 'value'],
};

function normalizeHeader(header) {
  return String(header || '').trim().toLowerCase();
}

function mapRowKeys(row) {
  const mapped = {};
  Object.entries(row).forEach(([key, value]) => {
    const normalized = normalizeHeader(key);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.includes(normalized)) {
        mapped[field] = value;
        break;
      }
    }
  });
  return mapped;
}

/**
 * Reads an .xlsx/.xls/.csv file and returns raw row objects keyed by
 * normalized field names (name, phone, amount).
 */
export function parseSpreadsheetFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the file'));
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        resolve(rows.map(mapRowKeys));
      } catch (err) {
        console.error('Failed to parse spreadsheet file:', err);
        reject(new Error('Could not parse the spreadsheet. Please check the file format.'));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validates parsed rows and splits them into valid/invalid sets.
 * @returns {{ valid: Array, invalid: Array<{ row: object, rowNumber: number, errors: string[] }> }}
 */
export function validateImportRows(rows) {
  const valid = [];
  const invalid = [];

  rows.forEach((row, index) => {
    const errors = [];
    const name = String(row.name || '').trim();
    const phone = String(row.phone || '').trim();
    const amount = row.amount;

    if (!name) errors.push('Missing name');
    if (!phone) errors.push('Missing phone');
    else if (!isValidPhone(phone)) errors.push('Invalid phone format');
    if (amount === '' || amount === undefined || amount === null) errors.push('Missing amount');
    else if (Number.isNaN(Number(amount)) || Number(amount) < 0) errors.push('Invalid amount');

    const rowNumber = index + 2; // accounts for the header row
    if (errors.length) {
      invalid.push({ row, rowNumber, errors });
    } else {
      valid.push({ name, phone, amount: Number(amount), rowNumber });
    }
  });

  return { valid, invalid };
}

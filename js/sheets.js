import { CONFIG, COLUMNS } from './config.js';
import { getAccessToken } from './auth.js';

const API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

function sheetRange(fromCol, toCol, rowStart, rowEnd) {
  const sheet = CONFIG.SHEET_NAME;
  if (rowEnd) {
    return `${sheet}!${fromCol}${rowStart}:${toCol}${rowEnd}`;
  }
  if (fromCol === toCol) {
    return `${sheet}!${fromCol}${rowStart}`;
  }
  return `${sheet}!${fromCol}${rowStart}:${toCol}`;
}

async function apiFetch(path, options = {}) {
  const token = await getAccessToken();
  const response = await fetch(`${API_BASE}/${CONFIG.SPREADSHEET_ID}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Sheets API Fehler (${response.status}): ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function rowToItem(values, rowNumber) {
  const item = { _row: rowNumber };
  COLUMNS.forEach((key, index) => {
    item[key] = values[index] ?? '';
  });
  return item;
}

export async function getAllItems() {
  const data = await apiFetch(`/values/${encodeURIComponent(sheetRange('A', 'J', 2))}`);
  const rows = data.values || [];

  return rows
    .map((values, index) => rowToItem(values, index + 2))
    .filter((item) => item.id && String(item.id).trim() !== '');
}

export async function appendItem(item) {
  const values = COLUMNS.map((key) => item[key] ?? '');
  const range = sheetRange('A', 'J', 2);

  await apiFetch(
    `/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      body: JSON.stringify({ values: [values] }),
    }
  );
}

export async function updateItemCells(rowNumber, updates) {
  const data = Object.entries(updates).map(([key, value]) => {
    const colIndex = COLUMNS.indexOf(key);
    if (colIndex < 0) {
      throw new Error(`Unbekannte Spalte: ${key}`);
    }
    const colLetter = String.fromCharCode('A'.charCodeAt(0) + colIndex);
    return {
      range: sheetRange(colLetter, colLetter, rowNumber),
      values: [[value ?? '']],
    };
  });

  await apiFetch('/values:batchUpdate', {
    method: 'POST',
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data,
    }),
  });
}

export async function hideItem(rowNumber) {
  await updateItemCells(rowNumber, { showapp: '' });
}

export async function updateStatus(rowNumber, status) {
  await updateItemCells(rowNumber, { status });
}

export async function updateSale(rowNumber, saleData) {
  await updateItemCells(rowNumber, {
    status: 'verkauft',
    verkaufdatum: saleData.verkaufdatum,
    verkaufpreis: saleData.verkaufpreis,
    verkaufplatform: saleData.verkaufplatform,
  });
}

export function getNextId(items) {
  const maxId = items.reduce((max, item) => {
    const id = Number.parseInt(String(item.id), 10);
    return Number.isFinite(id) && id > max ? id : max;
  }, 0);
  return maxId + 1;
}

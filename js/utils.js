import { STATUS_ORDER } from './config.js';

export function parseGermanDate(value) {
  if (!value) return null;
  const parts = String(value).trim().split('.');
  if (parts.length < 3) return null;
  const day = Number.parseInt(parts[0], 10);
  const month = Number.parseInt(parts[1], 10) - 1;
  let year = Number.parseInt(parts[2], 10);
  if (parts[2].length === 2) {
    year += year >= 70 ? 1900 : 2000;
  }
  const date = new Date(year, month, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatGermanDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateShort(value) {
  const date = parseGermanDate(value);
  if (!date) return value || '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

export function formatDateDisplay(value) {
  const date = parseGermanDate(value);
  if (!date) return value || '—';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

export function isoToGermanDate(iso) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

export function germanDateToIso(value) {
  const date = parseGermanDate(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayIso() {
  return germanDateToIso(formatGermanDate(new Date()));
}

export function todayGerman() {
  return formatGermanDate(new Date());
}

export function toGermanDecimal(value) {
  return String(value ?? '').trim().replace('.', ',');
}

function parseEuroCents(value) {
  const raw = String(value).trim();
  if (!raw) return null;
  let unsigned = raw.replace(/€/g, '').replace(/\bEUR\b/gi, '').replace(/\s/g, '');
  const negative = unsigned.startsWith('-') || unsigned.startsWith('−');
  if (negative) unsigned = unsigned.slice(1);
  const comma = unsigned.lastIndexOf(',');
  const dot = unsigned.lastIndexOf('.');
  if (comma !== -1 && dot !== -1) {
    unsigned = comma > dot
      ? unsigned.replaceAll('.', '').replace(',', '.')
      : unsigned.replaceAll(',', '');
  } else if (comma !== -1) {
    unsigned = unsigned.replace(',', '.');
  }
  if (!/^\d+(\.\d+)?$/.test(unsigned)) return Number.NaN;

  const [wholePart, fracPart = ''] = unsigned.split('.');
  const digits = `${fracPart}000`;
  let cents = Number(wholePart) * 100 + Number(digits.slice(0, 2));
  if (digits[2] >= '5') cents += 1;
  return negative ? -cents : cents;
}

export function formatEuro(value) {
  if (value === '' || value == null) return '—';
  const cents = parseEuroCents(value);
  if (cents == null) return '—';
  if (!Number.isFinite(cents)) return `${value} €`;
  const fractionDigits = cents % 100 === 0 ? 0 : 2;
  return `${(cents / 100).toLocaleString('de-DE', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} €`;
}

export function getNextStatus(current) {
  const index = STATUS_ORDER.indexOf(current);
  if (index < 0 || index >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[index + 1];
}

export function itemStatus(item) {
  return String(item.status || '').trim().toLowerCase();
}

export function filterByStatus(items, status) {
  const wanted = String(status || '').trim().toLowerCase();
  if (!wanted) return items;
  return items.filter((item) => itemStatus(item) === wanted);
}

export function countByStatus(items) {
  const counts = {};
  items.forEach((item) => {
    const status = itemStatus(item);
    if (!status) return;
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

export function isVisibleInApp(item) {
  const showapp = String(item.showapp || '').trim().toLowerCase();
  return showapp === 'x' || showapp === '1' || showapp === 'true' || showapp === 'yes';
}

function compareId(a, b) {
  const idA = Number.parseInt(String(a.id), 10);
  const idB = Number.parseInt(String(b.id), 10);
  const finiteA = Number.isFinite(idA);
  const finiteB = Number.isFinite(idB);
  if (!finiteA && !finiteB) return 0;
  if (!finiteA) return 1;
  if (!finiteB) return -1;
  return idA - idB;
}

export function sortById(items) {
  return [...items].sort(compareId);
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

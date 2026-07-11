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

export function formatEuro(value) {
  if (value === '' || value == null) return '—';
  const number = Number.parseFloat(String(value).replace(',', '.'));
  if (!Number.isFinite(number)) return `${value} €`;
  return `${number.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
}

export function truncate(text, length) {
  const value = String(text || '');
  if (value.length <= length) return value;
  return value.slice(0, length);
}

export function getNextStatus(current) {
  const index = STATUS_ORDER.indexOf(current);
  if (index < 0 || index >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[index + 1];
}

export function isVisibleInApp(item) {
  const showapp = String(item.showapp || '').trim().toLowerCase();
  return showapp === 'x' || showapp === '1' || showapp === 'true' || showapp === 'yes';
}

export function sortByKaufdatum(items) {
  return [...items].sort((a, b) => {
    const dateA = parseGermanDate(a.kaufdatum);
    const dateB = parseGermanDate(b.kaufdatum);
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA - dateB;
  });
}

export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

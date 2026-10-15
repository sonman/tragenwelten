/**
 * Tragenwelt configuration.
 * If a `.local` file exists next to index.html, DEFAULTS_LOCAL is used.
 * Otherwise DEFAULTS is used.
 * Override at runtime via localStorage keys:
 *   tragenwelt_client_id
 *   tragenwelt_spreadsheet_id
 *   tragenwelt_sheet_name
 */

//Marie
const DEFAULTS = {
  CLIENT_ID: '791761767935-m1cqk76ro2b8vut7ls49rt5cgf8onjch.apps.googleusercontent.com',
  SPREADSHEET_ID: '1kw0e_ukjpQQDEMcmRTAKmmljJ6lQxZ2gMjZkswyyq60',
  SHEET_NAME: 'Inventory',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// Martin
const DEFAULTS_LOCAL = {
  CLIENT_ID: '219640143150-h2gb3ds031fu574ku25rjks9i4qlgnk1.apps.googleusercontent.com',
  SPREADSHEET_ID: '11Cbr47Bf6BiWVsZPnT7k4YHztUZwstEHq_wmVuSKNik',
  SHEET_NAME: 'Inventory',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

async function localFileExists() {
  try {
    const response = await fetch(new URL('../.local', import.meta.url), {
      cache: 'no-store',
    });
    return response.ok;
  } catch {
    return false;
  }
}

const defaults = (await localFileExists()) ? DEFAULTS_LOCAL : DEFAULTS;

function fromStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value && value.trim() ? value.trim() : fallback;
}

export const CONFIG = {
  get CLIENT_ID() {
    return fromStorage('tragenwelt_client_id', defaults.CLIENT_ID);
  },
  get SPREADSHEET_ID() {
    return fromStorage('tragenwelt_spreadsheet_id', defaults.SPREADSHEET_ID);
  },
  get SHEET_NAME() {
    return fromStorage('tragenwelt_sheet_name', defaults.SHEET_NAME);
  },
  SCOPES: defaults.SCOPES,
};

export const COLUMNS = [
  'id',
  'name',
  'kaufdatum',
  'kaufplatform',
  'kaufpreis',
  'status',
  'verkaufdatum',
  'verkaufpreis',
  'verkaufplatform',
  'showapp',
];

export const STATUS_ORDER = [
  'gekauft',
  'erhalten',
  'gereinigt',
  'verpackt',
  'online',
  'verkauft',
];

export const STATUS_COLORS = {
  gekauft: '#E53935',
  erhalten: '#FB8C00',
  gereinigt: '#FDD835',
  verpackt: '#C0CA33',
  online: '#7CB342',
  verkauft: '#43A047',
};

export const PLATFORMS = ['Kleinanzeigen', 'Vinted'];

export const FIELD_LABELS = {
  id: 'ID',
  name: 'Name',
  kaufdatum: 'Kaufdatum',
  kaufplatform: 'Kaufplattform',
  kaufpreis: 'Kaufpreis',
  status: 'Status',
  verkaufdatum: 'Verkaufdatum',
  verkaufpreis: 'Verkaufpreis',
  verkaufplatform: 'Verkaufsplattform',
};

/**
 * Tragenwelt configuration.
 * ?shared selects DEFAULTS_MARTIN_VIA_MARIE.
 * ?local selects DEFAULTS_LOCAL.
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
// via ?local
const DEFAULTS_LOCAL = {
  CLIENT_ID: '219640143150-h2gb3ds031fu574ku25rjks9i4qlgnk1.apps.googleusercontent.com',
  SPREADSHEET_ID: '11Cbr47Bf6BiWVsZPnT7k4YHztUZwstEHq_wmVuSKNik',
  SHEET_NAME: 'Inventory',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

// Marie via Martin
// via ?shared
const DEFAULTS_MARTIN_VIA_MARIE = {
  CLIENT_ID: '219640143150-h2gb3ds031fu574ku25rjks9i4qlgnk1.apps.googleusercontent.com',
  SPREADSHEET_ID: '1kw0e_ukjpQQDEMcmRTAKmmljJ6lQxZ2gMjZkswyyq60',
  SHEET_NAME: 'Inventory',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

function searchParamSet(name) {
  return new URLSearchParams(window.location.search).has(name);
}

function selectDefaults() {
  if (searchParamSet('shared')) return DEFAULTS_MARTIN_VIA_MARIE;
  if (searchParamSet('local')) return DEFAULTS_LOCAL;
  return DEFAULTS;
}

const defaults = selectDefaults();

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
  gekauft: '#8E24AA',
  erhalten: '#E53935',
  gereinigt: '#FB8C00',
  verpackt: '#FDD835',
  online: '#9CCC65',
  verkauft: '#2E7D32',
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

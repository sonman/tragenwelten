/**
 * Tragenwelt configuration.
 * Override at runtime via localStorage keys:
 *   tragenwelt_client_id
 *   tragenwelt_spreadsheet_id
 *   tragenwelt_sheet_name
 */
const DEFAULTS = {
  CLIENT_ID: '791761767935-m1cqk76ro2b8vut7ls49rt5cgf8onjch.apps.googleusercontent.com',
  SPREADSHEET_ID: '1kw0e_ukjpQQDEMcmRTAKmmljJ6lQxZ2gMjZkswyyq60',
  SHEET_NAME: 'Inventory',
  SCOPES: 'https://www.googleapis.com/auth/spreadsheets',
};

function fromStorage(key, fallback) {
  const value = localStorage.getItem(key);
  return value && value.trim() ? value.trim() : fallback;
}

export const CONFIG = {
  get CLIENT_ID() {
    return fromStorage('tragenwelt_client_id', DEFAULTS.CLIENT_ID);
  },
  get SPREADSHEET_ID() {
    return fromStorage('tragenwelt_spreadsheet_id', DEFAULTS.SPREADSHEET_ID);
  },
  get SHEET_NAME() {
    return fromStorage('tragenwelt_sheet_name', DEFAULTS.SHEET_NAME);
  },
  SCOPES: DEFAULTS.SCOPES,
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

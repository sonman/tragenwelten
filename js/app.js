import { CONFIG, FIELD_LABELS, STATUS_COLORS } from './config.js';
import { signIn, isConfigured } from './auth.js';
import {
  getAllItems,
  appendItem,
  hideItem,
  updateStatus,
  updateSale,
  getNextId,
} from './sheets.js';
import {
  formatDateShort,
  formatDateDisplay,
  formatEuro,
  truncate,
  getNextStatus,
  isVisibleInApp,
  sortByKaufdatum,
  escapeHtml,
  isoToGermanDate,
  todayIso,
  todayGerman,
} from './utils.js';

const state = {
  items: [],
  selectedId: null,
  pendingStatus: null,
};

const els = {
  authScreen: document.getElementById('auth-screen'),
  btnSignIn: document.getElementById('btn-sign-in'),
  authError: document.getElementById('auth-error'),
  loading: document.getElementById('loading'),
  toast: document.getElementById('toast'),
  screenInventory: document.getElementById('screen-inventory'),
  screenDetails: document.getElementById('screen-details'),
  inventoryList: document.getElementById('inventory-list'),
  inventoryEmpty: document.getElementById('inventory-empty'),
  btnAdd: document.getElementById('btn-add'),
  btnBack: document.getElementById('btn-back'),
  detailsTitle: document.getElementById('details-title'),
  detailsFields: document.getElementById('details-fields'),
  btnHide: document.getElementById('btn-hide'),
  btnNextStatus: document.getElementById('btn-next-status'),
  modalAdd: document.getElementById('modal-add'),
  formAdd: document.getElementById('form-add'),
  modalSell: document.getElementById('modal-sell'),
  formSell: document.getElementById('form-sell'),
};

let toastTimer = null;

function show(el) {
  el.classList.remove('hidden');
}

function hide(el) {
  el.classList.add('hidden');
}

function setLoading(active) {
  els.loading.classList.toggle('hidden', !active);
}

function showToast(message) {
  els.toast.textContent = message;
  show(els.toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => hide(els.toast), 3200);
}

function showAuthError(message) {
  els.authError.textContent = message;
  show(els.authError);
}

function getSelectedItem() {
  return state.items.find((item) => String(item.id) === String(state.selectedId)) || null;
}

function getVisibleItems() {
  return sortByKaufdatum(state.items.filter(isVisibleInApp));
}

function showScreen(name) {
  hide(els.authScreen);
  hide(els.screenInventory);
  hide(els.screenDetails);

  if (name === 'auth') show(els.authScreen);
  if (name === 'inventory') show(els.screenInventory);
  if (name === 'details') show(els.screenDetails);
}

function statusBadgeHtml(status) {
  const safeStatus = escapeHtml(status || '—');
  const className = `status-badge status-${String(status || '').toLowerCase()}`;
  return `<span class="${className}">${safeStatus}</span>`;
}

function renderInventory() {
  const items = getVisibleItems();
  els.inventoryList.innerHTML = '';

  if (!items.length) {
    show(els.inventoryEmpty);
    return;
  }

  hide(els.inventoryEmpty);

  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'inventory-item';
    li.dataset.id = item.id;
    li.innerHTML = `
      <span class="item-date">${escapeHtml(formatDateShort(item.kaufdatum))}</span>
      <span class="item-name">${escapeHtml(truncate(item.name, 12))}</span>
      <span class="item-price">${escapeHtml(formatEuro(item.kaufpreis))}</span>
      ${statusBadgeHtml(item.status)}
    `;
    li.addEventListener('click', () => openDetails(item.id));
    els.inventoryList.appendChild(li);
  });
}

function renderField(label, value, options = {}) {
  const { html = false, colored = false } = options;
  const display = html ? value : escapeHtml(value);
  const style = colored && value ? ` style="color:${STATUS_COLORS[value] || 'inherit'};"` : '';
  return `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd${style}>${display}</dd>
    </div>
  `;
}

function renderDetails() {
  const item = getSelectedItem();
  if (!item) return;

  els.detailsTitle.textContent = item.name || '';
  const fields = [
    renderField(FIELD_LABELS.id, item.id),
    renderField(FIELD_LABELS.name, item.name),
    renderField(FIELD_LABELS.kaufdatum, formatDateDisplay(item.kaufdatum)),
    renderField(FIELD_LABELS.kaufplatform, item.kaufplatform || '—'),
    renderField(FIELD_LABELS.kaufpreis, formatEuro(item.kaufpreis)),
    renderField(FIELD_LABELS.status, item.status || '—', {
      html: statusBadgeHtml(item.status),
      colored: false,
    }),
  ];

  if (item.status === 'verkauft') {
    fields.push(
      renderField(FIELD_LABELS.verkaufdatum, formatDateDisplay(item.verkaufdatum)),
      renderField(FIELD_LABELS.verkaufpreis, formatEuro(item.verkaufpreis)),
      renderField(FIELD_LABELS.verkaufplatform, item.verkaufplatform || '—')
    );
  }

  els.detailsFields.innerHTML = fields.join('');

  const nextStatus = getNextStatus(item.status);
  if (nextStatus) {
    els.btnNextStatus.textContent = `→ ${nextStatus}`;
    show(els.btnNextStatus);
  } else {
    hide(els.btnNextStatus);
  }
}

function openDetails(id) {
  state.selectedId = id;
  renderDetails();
  showScreen('details');
}

function openModal(modal) {
  show(modal);
}

function closeModal(modal) {
  hide(modal);
}

function resetAddForm() {
  els.formAdd.reset();
  els.formAdd.elements.kaufdatum.value = todayIso();
  els.formAdd.elements.kaufplatform.value = 'Kleinanzeigen';
}

function resetSellForm() {
  els.formSell.reset();
  els.formSell.elements.verkaufdatum.value = todayIso();
  els.formSell.elements.verkaufplatform.value = 'Kleinanzeigen';
}

async function refreshItems() {
  state.items = await getAllItems();
  renderInventory();
  if (state.selectedId) {
    renderDetails();
  }
}

async function withLoading(task) {
  setLoading(true);
  try {
    await task();
  } finally {
    setLoading(false);
  }
}

async function bootstrap() {
  if (!isConfigured()) {
    showScreen('auth');
    showAuthError(
      'Bitte CLIENT_ID und SPREADSHEET_ID in js/config.js eintragen (oder per localStorage setzen).'
    );
    return;
  }

  showScreen('auth');
  setLoading(true);
  try {
    await signIn(false);
    await refreshItems();
    showScreen('inventory');
  } catch {
    showScreen('auth');
  } finally {
    setLoading(false);
  }
}

async function handleSignIn() {
  hide(els.authError);
  setLoading(true);
  try {
    await signIn(true);
    await refreshItems();
    showScreen('inventory');
  } catch (error) {
    showAuthError(error.message || 'Anmeldung fehlgeschlagen.');
    showScreen('auth');
  } finally {
    setLoading(false);
  }
}

async function handleAddItem(event) {
  event.preventDefault();
  const formData = new FormData(els.formAdd);
  const name = String(formData.get('name') || '').trim();
  const kaufpreis = String(formData.get('kaufpreis') || '').trim();
  const kaufplatform = String(formData.get('kaufplatform') || '').trim();
  const kaufdatum = isoToGermanDate(String(formData.get('kaufdatum') || ''));

  if (!name || !kaufpreis || !kaufplatform || !kaufdatum) {
    showToast('Bitte alle Felder ausfüllen.');
    return;
  }

  await withLoading(async () => {
    const nextId = getNextId(state.items);
    const item = {
      id: nextId,
      name,
      kaufdatum,
      kaufplatform,
      kaufpreis,
      status: 'gekauft',
      verkaufdatum: '',
      verkaufpreis: '',
      verkaufplatform: '',
      showapp: 'x',
    };

    await appendItem(item);
    closeModal(els.modalAdd);
    resetAddForm();
    await refreshItems();
    showToast('Artikel gespeichert.');
  });
}

async function handleHideItem() {
  const item = getSelectedItem();
  if (!item) return;

  await withLoading(async () => {
    await hideItem(item._row);
    await refreshItems();
    state.selectedId = null;
    showScreen('inventory');
    showToast('Artikel ausgeblendet.');
  });
}

async function handleNextStatus() {
  const item = getSelectedItem();
  if (!item) return;

  const nextStatus = getNextStatus(item.status);
  if (!nextStatus) return;

  if (nextStatus === 'verkauft') {
    state.pendingStatus = 'verkauft';
    resetSellForm();
    openModal(els.modalSell);
    return;
  }

  await withLoading(async () => {
    await updateStatus(item._row, nextStatus);
    item.status = nextStatus;
    await refreshItems();
    showToast(`Status: ${nextStatus}`);
  });
}

async function handleSellItem(event) {
  event.preventDefault();
  const item = getSelectedItem();
  if (!item) return;

  const formData = new FormData(els.formSell);
  const verkaufdatum = isoToGermanDate(String(formData.get('verkaufdatum') || ''));
  const verkaufpreis = String(formData.get('verkaufpreis') || '').trim();
  const verkaufplatform = String(formData.get('verkaufplatform') || '').trim();

  if (!verkaufdatum || !verkaufpreis || !verkaufplatform) {
    showToast('Bitte alle Verkaufsfelder ausfüllen.');
    return;
  }

  await withLoading(async () => {
    await updateSale(item._row, { verkaufdatum, verkaufpreis, verkaufplatform });
    closeModal(els.modalSell);
    state.pendingStatus = null;
    await refreshItems();
    showToast('Als verkauft markiert.');
  });
}

function bindEvents() {
  els.btnSignIn.addEventListener('click', handleSignIn);

  els.btnAdd.addEventListener('click', () => {
    resetAddForm();
    openModal(els.modalAdd);
  });

  els.btnBack.addEventListener('click', () => {
    state.selectedId = null;
    showScreen('inventory');
  });

  els.btnHide.addEventListener('click', handleHideItem);
  els.btnNextStatus.addEventListener('click', handleNextStatus);

  els.formAdd.addEventListener('submit', handleAddItem);
  els.formSell.addEventListener('submit', handleSellItem);

  document.querySelectorAll('[data-close]').forEach((element) => {
    element.addEventListener('click', () => {
      const modalId = element.dataset.close;
      const modal = document.getElementById(modalId);
      if (modal) {
        closeModal(modal);
        if (modalId === 'modal-sell') {
          state.pendingStatus = null;
        }
      }
    });
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

bindEvents();
resetAddForm();
resetSellForm();
registerServiceWorker();
bootstrap();

export { CONFIG, todayGerman };

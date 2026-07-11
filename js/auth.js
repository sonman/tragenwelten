import { CONFIG } from './config.js';

let tokenClient = null;
let accessToken = null;
let tokenExpiresAt = 0;
let pendingResolve = null;
let pendingReject = null;

function waitForGis() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.google?.accounts?.oauth2) {
        clearInterval(timer);
        resolve();
      } else if (attempts > 100) {
        clearInterval(timer);
        reject(new Error('Google Identity Services konnte nicht geladen werden.'));
      }
    }, 100);
  });
}

function initTokenClient() {
  if (tokenClient) return;

  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    callback: (response) => {
      if (response.error) {
        pendingReject?.(new Error(response.error));
        pendingResolve = null;
        pendingReject = null;
        return;
      }

      accessToken = response.access_token;
      const expiresIn = Number(response.expires_in || 3600);
      tokenExpiresAt = Date.now() + expiresIn * 1000 - 60_000;
      pendingResolve?.(accessToken);
      pendingResolve = null;
      pendingReject = null;
    },
  });
}

export async function signIn(forcePrompt = false) {
  if (!CONFIG.CLIENT_ID || CONFIG.CLIENT_ID.startsWith('YOUR_')) {
    throw new Error('Bitte CLIENT_ID in js/config.js oder localStorage konfigurieren.');
  }

  await waitForGis();
  initTokenClient();

  return new Promise((resolve, reject) => {
    pendingResolve = resolve;
    pendingReject = reject;
    tokenClient.requestAccessToken({ prompt: forcePrompt ? 'consent' : '' });
  });
}

export async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiresAt) {
    return accessToken;
  }

  return signIn(!accessToken);
}

export function signOut() {
  if (accessToken && window.google?.accounts?.oauth2) {
    google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenExpiresAt = 0;
}

export function isConfigured() {
  return (
    CONFIG.CLIENT_ID &&
    !CONFIG.CLIENT_ID.startsWith('YOUR_') &&
    CONFIG.SPREADSHEET_ID &&
    !CONFIG.SPREADSHEET_ID.startsWith('YOUR_')
  );
}

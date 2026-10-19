import { CONFIG } from './config.js';

const LOGIN_HINT_KEY = 'tragenwelt_login_hint';

let tokenClient = null;
let tokenClientHint = '';
let accessToken = null;
let tokenExpiresAt = 0;
let pendingResolve = null;
let pendingReject = null;

function readLoginHint() {
  const value = localStorage.getItem(LOGIN_HINT_KEY);
  return value && value.includes('@') ? value.trim() : '';
}

function storeLoginHint(email) {
  if (!email || !email.includes('@')) return;
  localStorage.setItem(LOGIN_HINT_KEY, email.trim());
}

async function rememberAccount(token) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const profile = await response.json();
    storeLoginHint(profile.email);
  } catch {
    // Sign-in already succeeded. The hint only skips the account chooser next time.
  }
}

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
  const loginHint = readLoginHint();
  if (tokenClient && tokenClientHint === loginHint) return;

  tokenClientHint = loginHint;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CONFIG.CLIENT_ID,
    scope: CONFIG.SCOPES,
    ...(loginHint ? { login_hint: loginHint } : {}),
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
      const grantedEmail = !response.scope || /email/.test(response.scope);
      if (grantedEmail) rememberAccount(accessToken);
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
    const loginHint = readLoginHint();
    tokenClient.requestAccessToken({
      prompt: forcePrompt ? 'consent' : '',
      ...(loginHint ? { hint: loginHint } : {}),
    });
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

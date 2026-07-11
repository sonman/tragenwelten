# Tragenwelt PWA

Eine installierbare Progressive Web App für ein Pixel 6, die ein Babytragen-Inventar verwaltet. Backend ist ein Google Sheet über die Google Sheets API v4 mit OAuth2 (Google Identity Services).

## Features

- **Inventar**: Artikel nach Kaufdatum sortiert (älteste zuerst), nur mit gesetztem `showapp`
- **Details**: Alle Felder anzeigen, Verkaufsfelder nur bei Status `verkauft`
- **Status-Flow**: gekauft → erhalten → gereinigt → verpackt → online → verkauft
- **Neuer Artikel**: Modal mit Name, Kaufpreis, Plattform und Datum
- **Verkauf**: Modal bei Statuswechsel auf `verkauft`
- **Ausblenden**: Entfernt `showapp` im Sheet (kein Löschen)

## Projektstruktur

```
tragenwelt/
├── index.html
├── manifest.webmanifest
├── sw.js
├── css/styles.css
├── js/
│   ├── config.js      # Client ID, Spreadsheet ID, Sheet Name
│   ├── auth.js        # Google OAuth2
│   ├── sheets.js      # Sheets API
│   ├── utils.js       # Datum, Euro, Status-Hilfen
│   └── app.js         # UI-Logik
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

## Google Sheet vorbereiten

1. Erstelle ein Google Sheet mit dem Tab **`Inventory`** (oder passe den Namen in der Config an).
2. Zeile 1 enthält die Spaltenüberschriften:

   | A | B | C | D | E | F | G | H | I | J |
   |---|---|---|---|---|---|---|---|---|---|
   | id | name | kaufdatum | kaufplatform | kaufpreis | status | verkaufdatum | verkaufpreis | verkaufplatform | showapp |

3. Daten ab Zeile 2 eintragen. `showapp` = `x` zeigt den Artikel in der App.
4. Die **Spreadsheet ID** findest du in der URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`

## Google Cloud einrichten

### 1. Projekt & API

1. Öffne [Google Cloud Console](https://console.cloud.google.com/).
2. Neues Projekt erstellen (z. B. „Tragenwelt“).
3. **APIs & Services → Library** → **Google Sheets API** aktivieren.

### 2. OAuth-Zustimmungsbildschirm

1. **APIs & Services → OAuth consent screen**
2. User type: **External**
3. App-Name: `Tragenwelt`
4. Deine Google-E-Mail als **Test user** hinzufügen (wichtig im Testing-Modus).

### 3. OAuth Client ID

1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. **Authorized JavaScript origins** hinzufügen:
   - `https://<dein-github-nutzer>.github.io` (GitHub Pages)
   - `http://localhost:8080` (lokales Testen)
4. Client ID kopieren.

### 4. Konfiguration

In [`js/config.js`](js/config.js) eintragen:

```javascript
CLIENT_ID: '123456789-xxxx.apps.googleusercontent.com',
SPREADSHEET_ID: 'deine-spreadsheet-id',
SHEET_NAME: 'Inventory',
```

Alternativ per Browser-Konsole / localStorage (ohne Code-Änderung):

```javascript
localStorage.setItem('tragenwelt_client_id', 'DEINE_CLIENT_ID');
localStorage.setItem('tragenwelt_spreadsheet_id', 'DEINE_SPREADSHEET_ID');
localStorage.setItem('tragenwelt_sheet_name', 'Inventory');
```

## Lokal testen

OAuth erfordert HTTPS oder `localhost`. Starte einen lokalen Server:

```bash
cd tragenwelt
python3 -m http.server 8080
```

Dann im Browser: `http://localhost:8080`

Stelle sicher, dass `http://localhost:8080` als Authorized JavaScript origin in der Google Cloud Console eingetragen ist.

## Auf GitHub hosten

Die App ist reines HTML/CSS/JavaScript und kann kostenlos über **GitHub Pages** gehostet werden. GitHub liefert automatisch HTTPS — das ist für OAuth und Service Worker erforderlich.

### 1. Repository erstellen

1. Auf [github.com](https://github.com) einloggen.
2. **New repository** klicken.
3. Name z. B. `tragenwelt` wählen, **Public** auswählen (GitHub Pages ist für Public-Repos kostenlos).
4. Repository **ohne** README/License erstellen (der Code liegt schon lokal vor).

### 2. Code hochladen

Im Projektordner:

```bash
cd tragenwelt
git init
git add .
git commit -m "Initial Tragenwelt PWA"
git branch -M main
git remote add origin https://github.com/<DEIN-NUTZER>/tragenwelt.git
git push -u origin main
```

Ersetze `<DEIN-NUTZER>` durch deinen GitHub-Benutzernamen.

### 3. GitHub Pages aktivieren

1. Im Repository: **Settings → Pages**.
2. Unter **Build and deployment → Source**: **Deploy from a branch** wählen.
3. Branch: **`main`**, Ordner: **`/ (root)`**.
4. **Save** klicken.

Nach 1–2 Minuten ist die App erreichbar unter:

```
https://<DEIN-NUTZER>.github.io/tragenwelt/
```

Der genaue Link steht auf der Pages-Settings-Seite unter „Your site is live at …“.

### 4. Google OAuth für die Live-URL konfigurieren

In der [Google Cloud Console](https://console.cloud.google.com/) unter **APIs & Services → Credentials → OAuth 2.0 Client ID** die **Authorized JavaScript origins** ergänzen:

```
https://<DEIN-NUTZER>.github.io
```

Wichtig:
- **Kein** abschließender Schrägstrich.
- **Kein** Pfad wie `/tragenwelt/` — nur die Origin.
- `http://localhost:8080` für lokales Testen zusätzlich eintragen.

### 5. App-Konfiguration setzen

Vor dem Push (oder in einem weiteren Commit) in [`js/config.js`](js/config.js) eintragen:

```javascript
CLIENT_ID: '123456789-xxxx.apps.googleusercontent.com',
SPREADSHEET_ID: 'deine-spreadsheet-id',
```

Dann erneut committen und pushen:

```bash
git add js/config.js
git commit -m "Configure Google OAuth and spreadsheet"
git push
```

Alternativ kann die Konfiguration direkt auf dem Pixel 6 per Browser-Konsole gesetzt werden (siehe Abschnitt „Google Cloud einrichten“), ohne die Werte ins Repository zu committen.

### 6. Updates veröffentlichen

Nach jeder Änderung:

```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```

GitHub Pages aktualisiert die Seite automatisch nach dem Push. Der Service Worker cached statische Dateien — nach Updates ggf. die App einmal schließen und neu öffnen, oder in Chrome unter Site-Einstellungen den Cache leeren.

### 7. Auf dem Pixel 6 installieren

1. Die GitHub-Pages-URL in **Chrome** öffnen.
2. Mit Google anmelden und Inventar laden.
3. Chrome-Menü (⋮) → **Zum Startbildschirm hinzufügen** / **App installieren**.

Die App startet dann wie eine native App im Vollbildmodus.

## Status-Farben

| Status | Farbe |
|--------|-------|
| gekauft | Rot |
| erhalten | Orange |
| gereinigt | Gelb |
| verpackt | Limette |
| online | Hellgrün |
| verkauft | Grün |

## Hinweise

- Artikel werden in der App **nicht gelöscht**, nur ausgeblendet (`showapp` leeren).
- Preise werden in **Euro** angezeigt.
- Datumsformat: Anzeige `DD.MM.YY`, Liste `DD.MM`, Speicherung im Sheet `DD.MM.YYYY`.
- Die App ist für **einen einzelnen Nutzer** ausgelegt; das Google-Konto muss Zugriff auf das Sheet haben.

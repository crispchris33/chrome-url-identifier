# URL Detail – Link Hover Info and Enhanced Browsing Tools

![URL Detail Screenshot](URL%20Detail.jpg)

**Version:** 2.0  
**Author:** crispchris33  
**Compatibility:** Chrome (Manifest V3)

## Overview

**URL Detail** is a Chrome extension that reveals the real destination behind every hyperlink, giving users immediate insight and added safety while browsing. It enhances link transparency with a floating hover preview and adds productivity tools like Reddit title search and VirusTotal link scanning.

## Features

### Hover Preview
- Displays a popup when hovering over links
- Shows link text, full URL, and base domain
- Respects a user-managed whitelist to suppress popup on trusted domains

### Sidebar Tools
- **Reddit Search**:
  - Extracts page titles (title tag, H1, meta) for quick Reddit searches
  - Editable input field for custom queries
- **VirusTotal Scan**:
  - Analyze full page URL, base domain, or custom hash
  - Generates valid VirusTotal links (Base64 URL-encoded if needed)
  - Copyable preview links and one-click open in a new tab

### Customization
- Toggle hover preview on/off
- Add/remove URLs or domains from whitelist via popup or options page
- View and manage the full whitelist in the settings menu

## Security

- No external data collection or tracking
- No third-party scripts injected
- All DOM interactions are scoped and sanitized
- Clipboard and link actions require explicit user interaction
- Uses `all: initial` inline styling to avoid CSS bleed
- Uses `storage.sync` for settings and whitelist (no sensitive data stored)

## File Structure

URL-Detail/
├── manifest.json
├── Project/
│   ├── css/
│   │   ├── style.css
│   │   ├── popup.css
│   │   └── options.css
│   ├── js/
│   │   ├── script.js         ← hover preview logic
│   │   ├── sidebar-inject.js ← injected sidebar (Reddit + VT)
│   │   ├── popup.js          ← popup control & whitelist toggles
│   │   └── options.js        ← options page with whitelist table
│   ├── html/
│   │   ├── popup.html
│   │   └── options.html
│   └── icons/
│       ├── icon16x16.png
│       ├── icon48x48.png
│       └── icon128x128.png


## Permissions Justification

- `activeTab`: To inject sidebar script or capture current URL
- `scripting`: Required for sidebar injection via popup controls
- `tabs`: Allows querying the current tab for URL/domain
- `storage`: Stores settings, whitelist, and toggle state securely in sync storage

## Setup & Distribution

1. Clone or download the repository.
2. Visit `chrome://extensions` in Chrome.
3. Enable **Developer Mode**.
4. Click **Load unpacked** and select the `URL-Detail` directory.
5. For distribution:
   - Zip the directory excluding `.DS_Store`, `.git`, and `node_modules`
   - Upload the ZIP to the Chrome Web Store Developer Dashboard

## Changelog

### 2.0
- Complete UI redesign
- Added Reddit and VirusTotal sidebar features
- Enhanced styling and usability
- Full domain extraction with two-part TLD logic
- Better permissions scoping and sanitization

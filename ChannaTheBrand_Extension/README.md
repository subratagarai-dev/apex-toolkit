# ⚡ ChannaTheBrand Pro v10.0 Ultra — Dola AI Extension Suite

**The Ultimate Multi-Session Container, Duration Bypass & Video Downloader Extension for Dola AI (Seedance 2.5).**

---

## 🌟 Key Features

1. **🔒 SessionBox-Grade Multi-Session Container Engine**:
   - Isolated per-tab cookies using native Chrome `declarativeNetRequest` header rules.
   - Run multiple Dola AI accounts (`0005`, `0007`, `ChannaTheBrand`, etc.) side-by-side in separate tabs with zero token collision.
   - Live in-page container badge indicating the active account per tab.
   - Tab-aware popup synchronizing 1:1 with the focused container tab.

2. **⚡ Duration Bypass System (15s, 20s, 25s, 30s, 60s)**:
   - Universal payload override across `fetch`, `XMLHttpRequest`, `WebSocket`, and `JSON.stringify`.
   - Direct in-page Dola dropdown menu injector allowing 1-click selection of 15s, 20s, 25s, 30s, and 60s directly on Dola AI.
   - Dynamic prompt sanitizer to prevent trademark and safety refusals.

3. **👥 Instant Cookie Account Switcher**:
   - Universal parser for Netscape format, JSON array exports, and raw HTTP cookie headers.
   - `+ Capture Current`: 1-click capture of all active session tokens from the browser.
   - `⚡ Switch`: Instant parallel clearing and injection (<0.02s) with automatic tab reload.
   - `🚀 Open Studio`: Launches `https://www.dola.com/chat` in a fresh, isolated container tab.

4. **📹 1-Click Master Stream Video Downloader**:
   - Detects rendered videos on the page and automatically grabs the uncompressed 1080p master MP4 stream directly from the CDN.
   - In-page `📹 FETCH VIDEO` download button overlaid on video cards.

5. **🛡️ Anti-Detection & Multi-Account Cloaking Shield**:
   - Sub-pixel Canvas noise injection.
   - WebGL GPU renderer spoofing (rotating RTX 4070, RTX 3080, Apple M2 Pro).
   - Automated cleanup of cross-account tracking tokens (`bd_device_id`, `tt_webid`, `fp_token`).

---

## 📂 Project Directory Structure

```
├── manifest.json       # Manifest V3 configuration with per-tab container permissions
├── background.js      # Service Worker: declarativeNetRequest container rules & cookie hot-swap
├── content.js         # Isolated bridge connecting inject.js to background runtime
├── inject.js          # Main-world engine: duration bypass, in-page menu injector & anti-detection
├── popup.html         # Glassmorphic UI with Studio, Accounts, Settings, and Logs tabs
├── popup.css          # Obsidian violet dark theme styling
├── popup.js           # Tab-aware popup manager & universal cookie parser
├── icon16.png         # Toolbar icon 16x16
├── icon48.png         # Extension manager icon 48x48
└── icon128.png        # Web Store icon 128x128
```

---

## 🚀 How to Install & Reload

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked** and select:
   - `ChannaTheBrand_Ultimate_v10_Client_Package`
4. When making updates, click the 🔄 **Reload icon** on the extension card.

---

## 💖 Support the Creator (Buy Me a Coffee)

If you love **ChannaTheBrand Pro** and it helps your work, consider tipping or buying the creator a coffee:

- **🇵🇰 Easypaisa (PK)**:
  - Account Title: `Waheed Ahmad`
  - IBAN: `PK84TMFB0000000026456836`
  - QR Code: Scan inside the extension popup under the **☕ Tip** button!
- **🌐 Binance Pay (Global)**:
  - Nickname: `channathebrand`
  - Pay UID: `370403238` (Zero Fees via Binance App)

### 📲 Follow Creator:
- **Facebook**: [facebook.com/profile.php?id=61590732452324](https://www.facebook.com/profile.php?id=61590732452324)
- **WhatsApp**: [Join WhatsApp Channel](https://www.whatsapp.com/channel/0029VbDLcm5BVJl4yoHocF2j)



# TrueSource Radar 🔍
*Anti-Dropship & Chinese Factory Wholesale Sourcing Extension for Chrome, Edge, & Brave*

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-4F46E5.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Browsers](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Edge%20%7C%20Brave%20%7C%20Opera-success.svg)](#)
[![Zero Data Collection](https://img.shields.io/badge/Privacy-Zero%20Data%20Collected-10B981.svg)](PRIVACY.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**TrueSource Radar** is an intelligent browser extension that uncovers dropshipped and white-labeled products on Amazon, Etsy, and Shopify. It identifies the authentic Chinese manufacturing origin and finds direct wholesale supplier listings on **1688**, **AliExpress**, and **Alibaba**.

---

## 🌟 Key Features

* **Intelligent Dropship & Private-Label Detector**: Automatically detects pseudo-brand trademarks (all-caps brand registry accounts like `GODONLIF`), SEO keyword-stuffed titles, and generic supplier catalog items.
* **Verified Global Brand Whitelist**: Recognized global OEMs (*Razer, Sony, Apple, Bose*) are safeguarded and rated as *Verified Global Brand* (5% score) rather than falsely flagged as cheap dropshipping.
* **Native Chinese Keyword Translation for 1688**: Automatically translates English product categories into native Chinese manufacturing terminology (e.g. *Candle Warmer Lamp* $\rightarrow$ **融蜡灯 / 香薰灯**) so factory queries return genuine suppliers rather than random English noise.
* **1-Click Multi-Engine Lookups**:
  * 🇨🇳 **1688 Chinese Factory Source**: Searches direct domestic wholesale factories in Chinese.
  * 📦 **AliExpress Wholesale Catalog**: Directly queries verified export supplier listings.
  * ⚡ **Bing Visual Product Match**: Instantly identifies the exact product from the uncompressed image URL.
  * 🏭 **Alibaba B2B OEM Directory**: Connects to export-ready manufacturers with MOQ and FOB rates.
  * 🔍 **Google Lens (Visual Matches)**: Direct reverse-image fingerprinting.
* **Accurate Price & Decimal Parser**: Accurately parses retail prices without cent-dropping or currency distortion.
* **Strict Page Guards**: Only activates on single product detail pages—never clutters deals, search results, or cart pages.
* **Bi-Directional Active Tab Sync**: Opening the extension popup immediately reads the product on your current tab with ready-to-click buttons.
* **100% Client-Side Privacy**: Runs completely inside your browser memory. Zero tracking, zero analytics, zero external data transmission.

---

## 🚀 Installation & Testing

### Option 1: Load Unpacked (Developer Mode)
1. Clone this repository:
   ```bash
   git clone https://github.com/Coder-0X/truesource-radar.git
   ```
2. Open your browser extension management page:
   * **Chrome / Brave**: `chrome://extensions/`
   * **Edge**: `edge://extensions/`
3. Toggle **Developer mode** on (top-right).
4. Click **Load unpacked** and select the root folder of this repository.
5. Visit any product listing on [Amazon](https://www.amazon.com) or [Etsy](https://www.etsy.com).

### Option 2: Pre-Built Production Package
Download the pre-packaged ZIP from [`dist/truesource-radar-v1.3.0.zip`](dist/truesource-radar-v1.3.0.zip) to upload directly to the Chrome Web Store or Microsoft Edge Add-ons.

---

## 📂 Repository Architecture

```text
truesource-radar/
├── manifest.json              # Manifest V3 configuration & scoped permissions
├── README.md                  # Project overview & documentation
├── PRIVACY.md                 # Public Privacy Policy (Section 4.h compliant)
├── CHROMEWEBSTORE.md          # Store descriptions, permissions justifications & copy
├── privacy-policy.html        # Self-contained standalone privacy policy webpage
├── icons/                     # Verified 16px, 48px, 128px, and 300px store logos
├── background/
│   └── service-worker.js      # Ephemeral background worker, caching & context menus
├── content/
│   ├── content.js             # High-res DOM extractor, dropship analyzer & UI badge
│   └── content.css            # Glassmorphism overlay stylesheet
├── popup/
│   ├── popup.html             # Extension popup dashboard & active tab card
│   ├── popup.css              # Popup styling
│   └── popup.js               # Bi-directional tab sync & query generator
└── dist/
    └── truesource-radar-v1.3.0.zip  # Production distribution archive
```

---

## 🔒 Privacy & Compliance

TrueSource Radar complies with **Section 4.h of the Microsoft Store App Developer Agreement** and the **Chrome Web Store Single Purpose Policy**.

* **Data Collection**: None.
* **Data Transmission**: None. All heuristics, string formatting, and price parsing run locally on your device.
* Full policy: [PRIVACY.md](PRIVACY.md)

---

## 📄 License

MIT License — see LICENSE for details.

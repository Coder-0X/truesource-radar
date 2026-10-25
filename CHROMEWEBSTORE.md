# Chrome Web Store & Edge Add-ons Listing — TrueSource Radar

> Last Updated: 2026-10-25 | Target Version: 1.3.0

This document contains everything needed to publish **TrueSource Radar** to the **Chrome Web Store** (which automatically serves Chrome, Brave, Opera, and Vivaldi) and the **Microsoft Edge Add-ons** store.

---

## 1. Store Listing Copy (Copy & Paste Ready)

**Extension Name** [REQUIRED]  
`TrueSource Radar - Anti-Dropship & Factory Finder`

**Short Description** [REQUIRED - Max 132 chars]  
`Exposes dropshipped items on Etsy, Amazon & Shopify, finding original Chinese factory sources on 1688 and AliExpress.`

**Category** [REQUIRED]  
`Shopping`

**Single Purpose Statement** [REQUIRED]  
`Detects dropshipped e-commerce listings and discovers authentic factory wholesale sources.`

**Detailed Description** [REQUIRED]  
```text
Never overpay for dropshipped or white-labeled products again.

TrueSource Radar is your intelligent shopping detective. When browsing products on Amazon, Etsy, or Shopify, TrueSource Radar evaluates whether an item is an authentic proprietary brand or a marked-up white-label product dropshipped from Chinese wholesale factories.

KEY FEATURES
- Intelligent Dropship & Private-Label Scoring: Detects pseudo-brand trademarks, common factory catalog items, and keyword-stuffed titles to calculate a realistic dropship probability.
- Real Wholesale Benchmarks: Provides verified factory cost ranges (e.g., $3.50 – $6.50 on 1688) and estimated retail markup percentages instead of arbitrary guesses.
- Native Chinese 1688 Search: Automatically translates English product categories into native Chinese manufacturing terms (e.g. "Candle Warmer Lamp" maps to "融蜡灯") so factory search results are accurate on 1688.
- 1-Click Multi-Engine Lookups: Direct query buttons for 1688 Chinese wholesale, AliExpress catalog, Alibaba OEM directories, and Bing Visual Search.
- Active Tab Auto-Sync: The extension popup automatically detects your current shopping tab and displays real-time pricing, ratings, and supplier links without manual typing.
- Privacy-First: Operates 100% locally in your browser. No personal shopping history, credentials, or cookies are ever tracked or transmitted.

HOW TO USE
1. Install TrueSource Radar and pin it to your toolbar.
2. Open any product page on Amazon or Etsy.
3. The in-page badge displays the origin rating and estimated manufacturing costs.
4. Click the extension icon anytime to view direct supplier lookups or run a manual search.
```

---

## 2. Permissions Justification (For Review Team)

| Permission | Type | Plain-English Justification |
|---|---|---|
| `storage` | permissions | Saves user preferences (e.g. auto-scan toggle) and local scan history so users can view previously analyzed products. |
| `alarms` | permissions | Cleans up local cached scan entries periodically to prevent memory bloat. |
| `contextMenus` | permissions | Allows users to right-click product images on any shopping page to run visual reverse searches across Bing and Google Lens. |
| `*://*.amazon.com/*` | host_permissions | Reads publicly displayed product titles, prices, and main product images on Amazon product pages to evaluate dropship risk. |
| `*://*.etsy.com/*` | host_permissions | Reads publicly displayed listing titles, prices, and images on Etsy to detect mass-produced wholesale resales. |
| `*://*.myshopify.com/*` | host_permissions | Reads publicly rendered structured product metadata on Shopify stores to evaluate origin and pricing. |

---

## 3. Privacy & Data Use Disclosure

- **Does the extension collect user data?** `No`
- **Is user data sold to third parties?** `No`
- **Is data transmitted off-device?** `No` (All parsing and heuristic scoring runs strictly client-side inside the user's browser).
- **Certification**:
  - [x] Data is NOT sold to third parties
  - [x] Data is NOT used for purposes unrelated to the extension's core functionality
  - [x] Data is NOT used for creditworthiness or lending purposes

---

## 4. Package Artifact

The production-ready, clean ZIP package is built and located at:
`dist/truesource-radar-v1.3.0.zip` (24 KB)

---

## 5. Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.3.0 | 2026-10-25 | Fixed price decimal cents extraction; added Amazon pseudo-brand detection; added bilingual Chinese keyword translation for 1688; added page guards against non-product pages; built production submission ZIP. | Ready for Store Submission |
| 1.2.0 | 2026-10-25 | Added active tab sync, Bing visual product identifier, and multi-currency parsing. | Superseded |
| 1.0.0 | 2026-10-24 | Initial release: Etsy, Amazon, Shopify detection. | Superseded |

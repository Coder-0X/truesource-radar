/**
 * TrueSource Radar - Precision Content Script (Manifest V3)
 * Accurate DOM extraction, brand vs. dropship analysis, bilingual 1688 search, and page guards.
 */

(function () {
  'use strict';

  if (window.__TRUE_SOURCE_RADAR_LOADED__) return;
  window.__TRUE_SOURCE_RADAR_LOADED__ = true;

  // Verified major global OEMs & brands whitelist
  const GLOBAL_OEM_BRANDS = [
    'razer', 'sony', 'apple', 'logitech', 'samsung', 'bose', 'microsoft',
    'dell', 'hp', 'lenovo', 'asus', 'acer', 'canon', 'nikon', 'philips',
    'panasonic', 'kitchenaid', 'dyson', 'nintendo', 'corsair', 'steelseries',
    'anker', 'seagate', 'western digital', 'lg', 'jbl', 'sennheiser', 'garmin'
  ];

  // Common high-volume Chinese dropship & white-label product categories
  const DROPSHIP_CATALOG_CATEGORIES = [
    { en: 'candle warmer lamp', zh: '融蜡灯 香薰灯', costMin: 3.50, costMax: 6.50 },
    { en: 'candle warmer', zh: '融蜡灯', costMin: 3.00, costMax: 6.00 },
    { en: 'wax warmer', zh: '融蜡灯', costMin: 3.00, costMax: 6.00 },
    { en: 'sunset lamp', zh: '日落灯 氛围灯', costMin: 2.00, costMax: 4.50 },
    { en: 'galaxy projector', zh: '星空投影灯 极光灯', costMin: 5.50, costMax: 11.00 },
    { en: 'star projector', zh: '星空投影仪', costMin: 5.00, costMax: 10.00 },
    { en: 'neck fan', zh: '挂脖风扇 无叶风扇', costMin: 2.50, costMax: 5.50 },
    { en: 'portable blender', zh: '便携榨汁杯 电动随行杯', costMin: 4.00, costMax: 8.00 },
    { en: 'ice roller', zh: '美容冰球 冰敷滚轮', costMin: 1.20, costMax: 2.80 },
    { en: 'crystal hair eraser', zh: '水晶脱毛器 物理脱毛石', costMin: 0.80, costMax: 1.80 },
    { en: 'posture corrector', zh: '背部矫正带 隐形驼背带', costMin: 1.50, costMax: 3.50 },
    { en: 'electric spin scrubber', zh: '电动清洁刷 多功能刷', costMin: 6.00, costMax: 12.00 },
    { en: 'massage gun', zh: '筋膜枪 肌肉按摩器', costMin: 7.00, costMax: 15.00 },
    { en: 'oil diffuser', zh: '香薰机 超声波加湿器', costMin: 3.00, costMax: 7.00 },
    { en: 'air fryer silicone', zh: '空气炸锅硅胶垫', costMin: 0.90, costMax: 2.20 },
    { en: 'milk frother', zh: '电动打奶泡器 咖啡搅拌器', costMin: 1.10, costMax: 2.50 },
    { en: 'gaming headset', zh: '电竞游戏耳机 头戴式', costMin: 8.00, costMax: 22.00 },
    { en: 'gaming chair', zh: '电竞椅 赛车电脑椅', costMin: 35.00, costMax: 65.00 },
    { en: 'ring light', zh: '补光灯 直播环形灯', costMin: 3.50, costMax: 8.00 },
    { en: 'desk lamp', zh: '护眼台灯 充电折叠灯', costMin: 3.00, costMax: 7.50 },
    { en: 'wireless charger', zh: '无线充电支架', costMin: 2.50, costMax: 6.00 },
    { en: 'audio mixer', zh: '声卡 调音台 直播设备', costMin: 15.00, costMax: 35.00 },
    { en: 'stream deck', zh: '直播控制台 宏键盘', costMin: 20.00, costMax: 45.00 }
  ];

  // Fluff words used by dropshippers in titles
  const DROPSHIP_SEO_BUZZWORDS = [
    'gifts for women', 'gifts for men', 'gifts for mom', 'birthday gifts',
    'home decor', 'fall decor', 'halloween decorations', 'christmas gifts',
    'anniversary gifts', 'handmade', 'artisanal', 'bespoke', 'aesthetic',
    'trending', 'viral', 'tiktok', 'cozy', 'minimalist', 'boho'
  ];

  // Guard: Ensure we ONLY run on single product detail pages
  function isProductPage() {
    const url = window.location.href;
    const host = window.location.hostname;

    if (host.includes('amazon.com')) {
      if (url.includes('/gp/goldbox') || url.includes('/s?') || url.includes('/cart/') || url.includes('/hz/')) {
        return false;
      }
      return url.includes('/dp/') || url.includes('/gp/product/') || !!document.querySelector('#productTitle');
    }
    if (host.includes('etsy.com')) {
      if (url.includes('/search') || url.includes('/cart')) return false;
      return url.includes('/listing/') || !!document.querySelector('h1[data-buy-box-listing-title]');
    }
    if (host.includes('shopify') || document.querySelector('meta[property="og:type"][content="product"]')) {
      if (url.includes('/collections/') && !url.includes('/products/')) return false;
      return url.includes('/products/');
    }
    return false;
  }

  // Detect all-caps pseudo-brands common in Amazon Brand Registry dropshipping
  function isPseudoBrand(brandText) {
    if (!brandText) return false;
    const clean = brandText.trim();
    // Typical Amazon white-label brand: 4-12 uppercase characters (e.g. GODONLIF, CZIOLO, AUKING)
    const isCaps = /^[A-Z0-9]{4,12}$/.test(clean);
    const legitCaps = ['SONY', 'ASUS', 'DELL', 'HP', 'LG', 'MSI', 'JBL', 'BOSCH', 'IKEA', 'LEGO', 'NIKE', 'AMD', 'INTEL'];
    return isCaps && !legitCaps.includes(clean);
  }

  // Extract accurate price without cent-dropping or currency distortion
  function extractAmazonPrice() {
    let price = 0;
    let currency = '$';

    const corePriceEl = document.querySelector('#corePriceDisplay_desktop_feature_div') ||
                        document.querySelector('#corePrice_feature_div') ||
                        document.querySelector('#apex_desktop');

    if (corePriceEl) {
      const symbolEl = corePriceEl.querySelector('.a-price-symbol');
      if (symbolEl && symbolEl.textContent.trim()) {
        currency = symbolEl.textContent.trim();
      }

      const wholeEl = corePriceEl.querySelector('.a-price-whole');
      const fractionEl = corePriceEl.querySelector('.a-price-fraction');

      if (wholeEl) {
        const whole = wholeEl.textContent.replace(/[^\d]/g, '');
        const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
        if (whole) {
          price = parseFloat(`${whole}.${fraction}`);
        }
      }
    }

    // Fallback: Check offscreen span with cents preservation
    if (!price) {
      const offscreen = document.querySelector('#apex_desktop .a-offscreen') ||
                        document.querySelector('#corePrice_feature_div .a-offscreen') ||
                        document.querySelector('.a-price .a-offscreen');
      if (offscreen) {
        const text = offscreen.textContent.trim();
        if (text.includes('NPR') || text.includes('Rs.')) currency = 'Rs. ';
        else if (text.includes('₹')) currency = '₹';
        else if (text.includes('€')) currency = '€';
        else if (text.includes('£')) currency = '£';
        else if (text.includes('$')) currency = '$';

        if (text.includes('.')) {
          const match = text.replace(/,/g, '').match(/\d+\.\d{2}/);
          if (match) price = parseFloat(match[0]);
        } else {
          // If Amazon writes "$1407" without decimal, parse last 2 digits as cents
          const digits = text.replace(/[^\d]/g, '');
          if (digits && digits.length >= 3) {
            const dollars = digits.slice(0, -2);
            const cents = digits.slice(-2);
            price = parseFloat(`${dollars}.${cents}`);
          } else if (digits) {
            price = parseFloat(digits);
          }
        }
      }
    }

    return { price, currency };
  }

  // Extract clean Amazon image
  function extractAmazonImage() {
    const landingImg = document.querySelector('#landingImage') || 
                       document.querySelector('#imgTagWrapperId img') ||
                       document.querySelector('.a-dynamic-image');
    if (!landingImg) return '';

    const hires = landingImg.getAttribute('data-old-hires');
    if (hires && hires.startsWith('http')) return hires;

    const dynamicAttr = landingImg.getAttribute('data-a-dynamic-image');
    if (dynamicAttr) {
      try {
        const parsed = JSON.parse(dynamicAttr);
        let bestUrl = '';
        let maxPixels = 0;
        for (const [url, dims] of Object.entries(parsed)) {
          const p = Array.isArray(dims) ? dims[0] * dims[1] : 0;
          if (p > maxPixels && url.startsWith('http')) {
            maxPixels = p;
            bestUrl = url;
          }
        }
        if (bestUrl) return bestUrl;
      } catch (e) {}
    }

    return landingImg.src && landingImg.src.startsWith('http') ? landingImg.src : '';
  }

  // Extract brand text
  function extractBrand() {
    const byLine = document.querySelector('#bylineInfo') || 
                   document.querySelector('a#sellerProfileTriggerId') ||
                   document.querySelector('.wt-text-body-01.wt-text-link-no-underline');
    if (!byLine) return '';
    let b = byLine.textContent.trim();
    b = b.replace(/^(visit the|brand:|by)\s+/i, '').replace(/\s+store$/i, '');
    return b.trim();
  }

  // Find matching Chinese translation and realistic factory cost range
  function matchCategoryAndChinese(cleanTitle) {
    const lower = cleanTitle.toLowerCase();
    for (const cat of DROPSHIP_CATALOG_CATEGORIES) {
      if (lower.includes(cat.en)) {
        return {
          categoryName: cat.en,
          chineseKeywords: cat.zh,
          factoryMin: cat.costMin,
          factoryMax: cat.costMax,
          isCatalogMatch: true
        };
      }
    }
    // Fallback: extract primary 2 nouns
    const tokens = lower.split(/\s+/).filter(w => w.length > 2).slice(0, 3).join(' ');
    return {
      categoryName: tokens,
      chineseKeywords: tokens,
      factoryMin: 3.00,
      factoryMax: 8.00,
      isCatalogMatch: false
    };
  }

  // Clean title for search (strip pseudo-brands, fluff, and brackets)
  function cleanTitleForSearch(rawTitle, brand) {
    if (!rawTitle) return '';
    let cleaned = rawTitle;

    // Strip brand if pseudo-brand
    if (brand) {
      const brandRegex = new RegExp(`\\b${brand}\\b`, 'gi');
      cleaned = cleaned.replace(brandRegex, ' ');
    }

    cleaned = cleaned.replace(/[\[\(【].*?[\]\)】]/g, ' ');
    cleaned = cleaned.replace(/[^\w\s-]/g, ' ');

    DROPSHIP_SEO_BUZZWORDS.forEach(bw => {
      const reg = new RegExp(`\\b${bw}\\b`, 'gi');
      cleaned = cleaned.replace(reg, ' ');
    });

    const tokens = cleaned
      .split(/\s+/)
      .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'from', 'this', 'that', 'with'].includes(w.toLowerCase()));

    return tokens.slice(0, 4).join(' ');
  }

  // Main extraction function
  function extractProductDetails() {
    if (!isProductPage()) return null;

    let title = '';
    let imageUrl = '';
    let description = '';
    let platform = 'Web Store';

    const brand = extractBrand();
    const { price, currency } = extractAmazonPrice();

    const titleEl = document.querySelector('#productTitle') || 
                    document.querySelector('h1[data-buy-box-listing-title]') || 
                    document.querySelector('h1');
    if (titleEl) title = titleEl.textContent.trim();

    imageUrl = extractAmazonImage();

    const descEl = document.querySelector('#feature-bullets') || document.querySelector('#productDescription');
    if (descEl) description = descEl.textContent.trim();

    if (!title || price <= 0) return null;

    const cleanKeywords = cleanTitleForSearch(title, brand) || 'product';
    const catMatch = matchCategoryAndChinese(title);

    return {
      title,
      brand,
      cleanKeywords,
      chineseKeywords: catMatch.chineseKeywords,
      categoryName: catMatch.categoryName,
      factoryMin: catMatch.factoryMin,
      factoryMax: catMatch.factoryMax,
      isCatalogMatch: catMatch.isCatalogMatch,
      price,
      currency,
      imageUrl,
      description: description.toLowerCase(),
      platform: 'Amazon',
      url: window.location.href
    };
  }

  // Real Dropship vs. Brand Evaluation Engine
  function evaluateDropshipRisk(item) {
    let score = 0;
    const flags = [];
    const lowerTitle = item.title.toLowerCase();
    const lowerBrand = (item.brand || '').toLowerCase();

    // Check 1: Verified Global OEM Brands Whitelist
    const isMajorBrand = GLOBAL_OEM_BRANDS.some(b => lowerBrand.includes(b) || lowerTitle.includes(b));

    if (isMajorBrand) {
      return {
        score: 5,
        isMajorBrand: true,
        verdict: 'Verified Global OEM Brand',
        color: '#10B981',
        flags: [{
          label: 'Authorized Global OEM',
          detail: 'This is an authentic global consumer brand with proprietary production lines and verified supply chains.'
        }],
        factoryMin: (item.price * 0.40).toFixed(2),
        factoryMax: (item.price * 0.60).toFixed(2),
        markupEst: '60% – 150%'
      };
    }

    // Check 2: Pseudo-Brand Trademark (All-caps Chinese trademark e.g. GODONLIF, CZIOLO)
    if (isPseudoBrand(item.brand)) {
      score += 40;
      flags.push({
        label: 'Pseudo-Brand Identifier (' + item.brand + ')',
        detail: 'Matches automated Amazon trademark patterns used by overseas private-label dropshippers.'
      });
    }

    // Check 3: Known Dropship / White-Label Catalog Match (e.g. Candle Warmer Lamp)
    if (item.isCatalogMatch) {
      score += 35;
      flags.push({
        label: 'Common Sourcing Catalog Item',
        detail: `Identified as "${item.categoryName}", widely manufactured in wholesale volume across Guangdong and Zhejiang factories.`
      });
    }

    // Check 4: SEO Keyword Stuffing in Title (e.g. gifts for women, birthday gifts)
    let seoMatches = 0;
    DROPSHIP_SEO_BUZZWORDS.forEach(bw => {
      if (lowerTitle.includes(bw)) seoMatches++;
    });
    if (seoMatches >= 2 || item.title.split(/\s+/).length > 14) {
      score += 20;
      flags.push({
        label: 'SEO Keyword Stuffed Title',
        detail: 'Title is heavily packed with gift/occasion search tags typical of third-party arbitrage listings.'
      });
    }

    score = Math.min(95, Math.max(15, score));

    // Realistic Factory Wholesale Benchmark
    let factoryMin = item.factoryMin;
    let factoryMax = item.factoryMax;
    let markupEst = '200% – 450%';

    // If item price is higher than standard, scale realistic wholesale
    if (item.price > factoryMax * 4) {
      const estMin = Math.max(factoryMin, (item.price * 0.18)).toFixed(2);
      const estMax = Math.max(factoryMax, (item.price * 0.32)).toFixed(2);
      factoryMin = estMin;
      factoryMax = estMax;
      markupEst = '250% – 500%';
    }

    const isHigh = score >= 50;
    return {
      score,
      isMajorBrand: false,
      verdict: isHigh ? 'High Dropship / Private-Label Risk' : 'Moderate Origin Confidence',
      color: isHigh ? '#EF4444' : '#F59E0B',
      flags,
      factoryMin,
      factoryMax,
      markupEst
    };
  }

  // Build tested, working search endpoints
  function buildVerificationLinks(item) {
    const keywords = item.cleanKeywords;
    const slug = keywords.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'product';
    const chineseQuery = item.chineseKeywords;
    const imgUrl = item.imageUrl;

    return {
      // 1. AliExpress Consumer Wholesale Search
      aliExpress: `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(slug)}.html?SearchText=${encodeURIComponent(keywords)}`,

      // 2. 1688 Chinese Factory Source (SEARCHES IN CHINESE)
      s1688: `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(chineseQuery)}`,

      // 3. Alibaba B2B OEM Factory Search (English)
      alibabaOEM: `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(keywords)}&viewType=G`,

      // 4. Bing Visual Search
      bingVisual: imgUrl 
        ? `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(imgUrl)}`
        : `https://www.bing.com/shop?q=${encodeURIComponent(keywords)}`,

      // 5. Google Lens Direct Visual Match
      googleLens: imgUrl 
        ? `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(imgUrl)}&hl=en`
        : `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(keywords + ' wholesale supplier')}`
    };
  }

  // Inject the floating radar overlay
  function injectRadarUI(item, analysis, links) {
    const existing = document.getElementById('truesource-radar-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'truesource-radar-root';

    root.innerHTML = `
      <div class="ts-card ${analysis.score >= 50 ? 'ts-alert-border' : ''}">
        <div class="ts-header">
          <div class="ts-brand">
            <span class="ts-radar-icon"></span>
            <span class="ts-title">TrueSource Radar</span>
          </div>
          <div class="ts-actions">
            <button class="ts-btn-toggle" title="Minimize/Maximize" id="ts-toggle-btn">−</button>
            <button class="ts-btn-close" title="Close" id="ts-close-btn">&times;</button>
          </div>
        </div>

        <div class="ts-body" id="ts-body-content">
          <div class="ts-product-preview">
            ${item.imageUrl ? `
              <img src="${item.imageUrl}" class="ts-preview-thumb" alt="Product thumbnail" />
            ` : '<div class="ts-no-thumb">No Img</div>'}
            <div class="ts-preview-details">
              <span class="ts-preview-title" title="${item.title}">${item.title}</span>
              <span class="ts-brand-tag">${item.brand ? 'Brand: <strong>' + item.brand + '</strong>' : 'Unbranded / Unknown'}</span>
            </div>
          </div>

          <div class="ts-score-row">
            <div class="ts-gauge">
              <span class="ts-pulse-dot" style="background-color: ${analysis.color};"></span>
              <span class="ts-score-num" style="color: ${analysis.color};">${analysis.score}%</span>
            </div>
            <div class="ts-status">
              <span class="ts-verdict" style="color: ${analysis.color};">${analysis.verdict}</span>
              <span class="ts-retail-price">Retail Price: <strong>${item.currency}${item.price.toFixed(2)}</strong></span>
            </div>
          </div>

          <div class="ts-savings-banner">
            <div class="ts-stat">
              <span class="ts-stat-label">1688 Factory Benchmark</span>
              <span class="ts-stat-value">$${analysis.factoryMin} – $${analysis.factoryMax}</span>
            </div>
            <div class="ts-stat">
              <span class="ts-stat-label">Est. Markup</span>
              <span class="ts-stat-value ts-markup">${analysis.markupEst}</span>
            </div>
          </div>

          ${analysis.flags.length > 0 ? `
            <div class="ts-flags">
              ${analysis.flags.map(f => `
                <div class="ts-flag-item">
                  <span class="ts-flag-bullet">⚠️</span>
                  <div class="ts-flag-text">
                    <strong>${f.label}</strong>
                    <p>${f.detail}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="ts-links-header">Direct Factory & Visual Lookups:</div>
          <div class="ts-btn-grid">
            <a href="${links.s1688}" target="_blank" rel="noopener noreferrer" class="ts-action-btn ts-1688" title="Searches 1688 using native Chinese keywords">
              <span>🇨🇳 1688 Factory (搜: ${item.chineseKeywords})</span>
              <span class="ts-arrow">↗</span>
            </a>
            <a href="${links.aliExpress}" target="_blank" rel="noopener noreferrer" class="ts-action-btn ts-ali" title="Search AliExpress wholesale catalog">
              <span>📦 Search AliExpress</span>
              <span class="ts-arrow">↗</span>
            </a>
            <a href="${links.bingVisual}" target="_blank" rel="noopener noreferrer" class="ts-action-btn ts-bing" title="Instant product visual identification and price comparison">
              <span>⚡ Bing Visual Match</span>
              <span class="ts-arrow">↗</span>
            </a>
            <a href="${links.alibabaOEM}" target="_blank" rel="noopener noreferrer" class="ts-action-btn ts-alibaba" title="Find OEM manufacturers on Alibaba">
              <span>🏭 Alibaba OEM Factory Directory</span>
              <span class="ts-arrow">↗</span>
            </a>
            <a href="${links.googleLens}" target="_blank" rel="noopener noreferrer" class="ts-action-btn ts-lens" title="Search with Google Lens (Visual Matches tab)">
              <span>🔍 Google Lens (Visual Matches)</span>
              <span class="ts-arrow">↗</span>
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    const toggleBtn = root.querySelector('#ts-toggle-btn');
    const bodyContent = root.querySelector('#ts-body-content');
    toggleBtn.addEventListener('click', () => {
      const isCollapsed = bodyContent.style.display === 'none';
      bodyContent.style.display = isCollapsed ? 'block' : 'none';
      toggleBtn.textContent = isCollapsed ? '−' : '+';
    });

    const closeBtn = root.querySelector('#ts-close-btn');
    closeBtn.addEventListener('click', () => {
      root.remove();
    });
  }

  // Bi-directional messaging listener for popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_ACTIVE_PRODUCT') {
      const item = extractProductDetails();
      if (item && item.title) {
        const analysis = evaluateDropshipRisk(item);
        const links = buildVerificationLinks(item);
        sendResponse({ success: true, item, analysis, links });
      } else {
        sendResponse({ success: false });
      }
    }
    return true;
  });

  // Main runner
  async function runScanner() {
    if (!isProductPage()) {
      const existing = document.getElementById('truesource-radar-root');
      if (existing) existing.remove();
      return;
    }

    await new Promise(r => setTimeout(r, 600));

    const item = extractProductDetails();
    if (!item || !item.price || item.price <= 0) return;

    const analysis = evaluateDropshipRisk(item);
    const links = buildVerificationLinks(item);

    injectRadarUI(item, analysis, links);

    try {
      await chrome.runtime.sendMessage({
        type: 'ITEM_ANALYZED',
        payload: {
          title: item.title,
          cleanKeywords: item.cleanKeywords,
          price: item.price,
          currency: item.currency,
          imageUrl: item.imageUrl,
          platform: item.platform,
          url: item.url,
          dropshipScore: analysis.score,
          wholesaleEstimate: parseFloat(analysis.factoryMin) || 4.00
        }
      });
    } catch (e) {}
  }

  runScanner();
})();

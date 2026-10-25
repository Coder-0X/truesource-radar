/**
 * TrueSource Radar - Popup Logic (Manifest V3)
 * Active tab sync, bilingual Chinese 1688 routing, and realistic sourcing benchmarks.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeProductCard = document.getElementById('active-product-card');
  const noActiveProduct = document.getElementById('no-active-product');
  const activeTitle = document.getElementById('active-title');
  const activePrice = document.getElementById('active-price');
  const activeFactory = document.getElementById('active-factory');
  const activeQuery = document.getElementById('active-query');
  const activeThumb = document.getElementById('active-thumb');
  const activeRiskPill = document.getElementById('active-risk-pill');

  const btnActive1688 = document.getElementById('btn-active-1688');
  const btn1688Label = document.getElementById('btn-1688-label');
  const btnActiveAli = document.getElementById('btn-active-ali');
  const btnActiveBing = document.getElementById('btn-active-bing');
  const btnActiveAlibaba = document.getElementById('btn-active-alibaba');
  const btnActiveLens = document.getElementById('btn-active-lens');

  const statScanned = document.getElementById('stat-scanned');
  const statDetected = document.getElementById('stat-detected');
  const statSavings = document.getElementById('stat-savings');
  const recentList = document.getElementById('recent-list');
  const manualQuery = document.getElementById('manual-query');
  const manualSearchBtn = document.getElementById('manual-search-btn');

  const link1688 = document.getElementById('link-1688');
  const linkAli = document.getElementById('link-ali');
  const linkBing = document.getElementById('link-bing');
  const linkAlibaba = document.getElementById('link-alibaba');
  const linkLens = document.getElementById('link-lens');
  const lookupHint = document.getElementById('lookup-hint');

  const clearHistoryBtn = document.getElementById('clear-history-btn');
  const autoscanToggle = document.getElementById('autoscan-toggle');

  const CHINESE_LOOKUP = {
    'candle warmer': '融蜡灯',
    'candle lamp': '融蜡灯',
    'warmer lamp': '融蜡灯',
    'wax warmer': '融蜡灯',
    'sunset lamp': '日落灯',
    'galaxy projector': '星空投影灯',
    'headset': '游戏耳机',
    'gaming chair': '电竞椅',
    'neck fan': '挂脖风扇',
    'massage gun': '筋膜枪',
    'portable blender': '榨汁杯',
    'ice roller': '冰敷滚轮',
    'posture corrector': '驼背矫正带',
    'diffuser': '香薰机'
  };

  // 1. Sync directly with Active Tab's current product
  async function syncActiveTabProduct() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        const resp = await chrome.tabs.sendMessage(tab.id, { type: 'GET_ACTIVE_PRODUCT' });
        if (resp && resp.success && resp.item) {
          const { item, analysis, links } = resp;

          activeProductCard.style.display = 'block';
          noActiveProduct.style.display = 'none';

          activeTitle.textContent = item.title;
          activePrice.textContent = `Retail Price: ${item.currency}${item.price.toFixed(2)}`;
          activeFactory.textContent = `1688 Benchmark: $${analysis.factoryMin} – $${analysis.factoryMax}`;
          activeQuery.textContent = `Clean Query: ${item.cleanKeywords}`;
          
          if (item.imageUrl) {
            activeThumb.src = item.imageUrl;
            activeThumb.style.display = 'block';
          } else {
            activeThumb.style.display = 'none';
          }

          activeRiskPill.textContent = `${analysis.score}% ${analysis.isMajorBrand ? 'Original Brand' : 'Dropship Risk'}`;
          if (analysis.score >= 50) {
            activeRiskPill.classList.add('high');
            activeRiskPill.style.background = '#FEE2E2';
            activeRiskPill.style.color = '#991B1B';
          } else {
            activeRiskPill.classList.remove('high');
            activeRiskPill.style.background = '#D1FAE5';
            activeRiskPill.style.color = '#065F46';
          }

          // Populate Chinese 1688 button
          btn1688Label.textContent = `🇨🇳 1688 Factory (搜: ${item.chineseKeywords})`;
          btnActive1688.href = links.s1688;
          btnActiveAli.href = links.aliExpress;
          btnActiveBing.href = links.bingVisual;
          btnActiveAlibaba.href = links.alibabaOEM;
          btnActiveLens.href = links.googleLens;

          manualQuery.value = item.cleanKeywords;
          updateManualLinks(item.cleanKeywords, false);
          return true;
        }
      }
    } catch (e) {
      // Non-content page
    }

    activeProductCard.style.display = 'none';
    noActiveProduct.style.display = 'block';
    return false;
  }

  // 2. Update manual search link targets
  function updateManualLinks(input, isUrl) {
    if (isUrl) {
      const cleanImg = input.startsWith('//') ? 'https:' + input : input;
      linkBing.href = `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(cleanImg)}`;
      linkLens.href = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(cleanImg)}&hl=en`;
      link1688.href = `https://s.1688.com/selloffer/offer_search.htm?keywords=wholesale`;
      linkAli.href = `https://www.aliexpress.com/wholesale?SearchText=wholesale`;
      linkAlibaba.href = `https://www.alibaba.com/trade/search?SearchText=wholesale&viewType=G`;

      lookupHint.innerHTML = `✅ Visual search target configured for Bing and Google Lens!`;
    } else {
      const query = input.trim();
      const slug = query.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'product';

      // Check Chinese translation
      let chineseWord = query;
      const lower = query.toLowerCase();
      for (const [en, zh] of Object.entries(CHINESE_LOOKUP)) {
        if (lower.includes(en)) {
          chineseWord = zh;
          break;
        }
      }

      link1688.href = `https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(chineseWord)}`;
      linkAli.href = `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(slug)}.html?SearchText=${encodeURIComponent(query)}`;
      linkBing.href = `https://www.bing.com/shop?q=${encodeURIComponent(query)}`;
      linkAlibaba.href = `https://www.alibaba.com/trade/search?SearchText=${encodeURIComponent(query)}&viewType=G`;
      linkLens.href = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query + ' wholesale factory supplier')}`;

      lookupHint.innerHTML = `✅ 1688 mapped to <strong>${escapeHtml(chineseWord)}</strong> | AliExpress: <strong>${escapeHtml(query)}</strong>`;
    }
  }

  // 3. Load global stats & scan history
  async function loadData() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_DASHBOARD_DATA' });
      if (response && response.success && response.data) {
        const { stats, recentScans, settings } = response.data;

        if (stats) {
          statScanned.textContent = stats.itemsScanned || 0;
          statDetected.textContent = stats.dropshipDetected || 0;
          statSavings.textContent = `$${Math.round(stats.estimatedSavings || 0)}`;
        }

        if (settings && typeof settings.autoScan === 'boolean') {
          autoscanToggle.checked = settings.autoScan;
        }

        renderRecentList(recentScans || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  }

  function renderRecentList(scans) {
    if (!scans || scans.length === 0) {
      recentList.innerHTML = `<div class="empty-state">No listings scanned yet. Open an Amazon or Etsy product to see real-time analysis.</div>`;
      return;
    }

    recentList.innerHTML = '';
    scans.forEach(item => {
      const isHigh = item.dropshipScore >= 50;
      const card = document.createElement('a');
      card.className = 'recent-item';
      card.href = item.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      const thumbHtml = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" class="recent-thumb" alt="Product" />`
        : `<div class="recent-thumb" style="display:flex;align-items:center;justify-content:center;font-size:9px;color:#999;">N/A</div>`;

      card.innerHTML = `
        ${thumbHtml}
        <div class="recent-info">
          <span class="recent-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
          <span class="recent-meta">${escapeHtml(item.platform || 'Store')} • ${escapeHtml(item.currency)}${(item.price || 0).toFixed(2)}</span>
        </div>
        <span class="recent-badge ${isHigh ? 'high' : 'low'}">
          ${item.dropshipScore}%
        </span>
      `;
      recentList.appendChild(card);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Handle manual input search
  function handleManualSearch() {
    const raw = manualQuery.value.trim();
    if (!raw) return;

    const isUrl = raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('//');
    updateManualLinks(raw, isUrl);
  }

  manualSearchBtn.addEventListener('click', handleManualSearch);
  manualQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleManualSearch();
  });

  // Clear history
  clearHistoryBtn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' });
    statScanned.textContent = '0';
    statDetected.textContent = '0';
    statSavings.textContent = '$0';
    recentList.innerHTML = `<div class="empty-state">History cleared.</div>`;
  });

  // Settings toggle
  autoscanToggle.addEventListener('change', async () => {
    const data = await chrome.storage.local.get('settings');
    const settings = data.settings || {};
    settings.autoScan = autoscanToggle.checked;
    await chrome.storage.local.set({ settings });
  });

  // Initial runs
  await syncActiveTabProduct();
  await loadData();
});

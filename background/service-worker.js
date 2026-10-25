/**
 * TrueSource Radar - Background Service Worker (Manifest V3)
 * Handles context menus, storage persistence, lookup history, and badge alerts.
 */

// Clean Amazon/Etsy/Shopify image URLs to get master high-res file
function sanitizeImageUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();

  if (url.startsWith('//')) {
    url = 'https:' + url;
  }

  // Etsy cleanup
  if (url.includes('etsystatic.com')) {
    url = url.replace(/il_\d+xN\./i, 'il_fullxfull.');
  }

  // Shopify cleanup
  if (url.includes('cdn.shopify.com')) {
    url = url.replace(/_(?:pico|icon|thumb|small|compact|medium|large|grande|\d+x\d+)\./i, '.');
  }

  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('v');
    return parsed.toString();
  } catch (e) {
    return url;
  }
}

// Build context menus on install
chrome.runtime.onInstalled.addListener(async () => {
  const defaults = {
    settings: {
      autoScan: true,
      alertThreshold: 60,
      preferredEngine: 'all'
    },
    stats: {
      itemsScanned: 0,
      dropshipDetected: 0,
      estimatedSavings: 0
    },
    recentScans: []
  };

  const current = await chrome.storage.local.get(['settings', 'stats', 'recentScans']);
  if (!current.settings) {
    await chrome.storage.local.set(defaults);
  }

  // Create Context Menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ts-parent',
      title: 'TrueSource: Factory & Dropship Search',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'ts-bing',
      parentId: 'ts-parent',
      title: '⚡ Bing Instant Visual Match',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'ts-lens',
      parentId: 'ts-parent',
      title: '🔍 Google Lens Visual Fingerprint',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'ts-ali',
      parentId: 'ts-parent',
      title: '📦 Search AliExpress for Similar',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'ts-alibaba',
      parentId: 'ts-parent',
      title: '🏭 Find OEM Factory on Alibaba / 1688',
      contexts: ['image']
    });
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.srcUrl) return;

  const cleanImgUrl = sanitizeImageUrl(info.srcUrl);
  let targetUrl = '';

  switch (info.menuItemId) {
    case 'ts-bing':
      targetUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(cleanImgUrl)}`;
      break;
    case 'ts-lens':
      targetUrl = `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(cleanImgUrl)}&hl=en`;
      break;
    case 'ts-ali':
      targetUrl = `https://www.aliexpress.com/wholesale?SearchText=wholesale`;
      break;
    case 'ts-alibaba':
      targetUrl = `https://www.alibaba.com/trade/search?SearchText=wholesale&viewType=G`;
      break;
    default:
      targetUrl = `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(cleanImgUrl)}`;
  }

  if (targetUrl) {
    await chrome.tabs.create({ url: targetUrl });
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === 'ITEM_ANALYZED') {
        const item = message.payload;
        const data = await chrome.storage.local.get(['stats', 'recentScans', 'settings']);
        
        const stats = data.stats || { itemsScanned: 0, dropshipDetected: 0, estimatedSavings: 0 };
        const recentScans = data.recentScans || [];
        const settings = data.settings || { alertThreshold: 60 };

        stats.itemsScanned += 1;
        if (item.dropshipScore >= settings.alertThreshold) {
          stats.dropshipDetected += 1;
          const savings = Math.max(0, (item.price || 0) - (item.wholesaleEstimate || 0));
          stats.estimatedSavings += savings;

          if (sender.tab && sender.tab.id) {
            await chrome.action.setBadgeText({ text: '!', tabId: sender.tab.id });
            await chrome.action.setBadgeBackgroundColor({ color: '#DC2626', tabId: sender.tab.id });
          }
        }

        const updatedScans = [
          {
            id: Date.now(),
            title: item.title,
            price: item.price,
            currency: item.currency || '$',
            wholesaleEstimate: item.wholesaleEstimate,
            dropshipScore: item.dropshipScore,
            platform: item.platform,
            url: item.url,
            imageUrl: sanitizeImageUrl(item.imageUrl),
            cleanKeywords: item.cleanKeywords,
            timestamp: new Date().toISOString()
          },
          ...recentScans.filter(s => s.url !== item.url)
        ].slice(0, 30);

        await chrome.storage.local.set({ stats, recentScans: updatedScans });
        sendResponse({ success: true, stats });
      } else if (message.type === 'GET_DASHBOARD_DATA') {
        const data = await chrome.storage.local.get(['stats', 'recentScans', 'settings']);
        sendResponse({ success: true, data });
      } else if (message.type === 'CLEAR_HISTORY') {
        await chrome.storage.local.set({
          recentScans: [],
          stats: { itemsScanned: 0, dropshipDetected: 0, estimatedSavings: 0 }
        });
        sendResponse({ success: true });
      }
    } catch (err) {
      console.error('[TrueSource Radar SW Error]:', err);
      sendResponse({ success: false, error: err.message });
    }
  })();
  return true;
});

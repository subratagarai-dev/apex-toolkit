(() => {
  'use strict';

  function extractVideoFingerprintGlobal(url) {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    if (clean.startsWith('blob:')) {
      const parts = clean.split('/');
      return 'blob_' + parts[parts.length - 1].toLowerCase();
    }
    const md5Match = clean.match(/\/([a-f0-9]{32})(?:[~.]|$)/i) || clean.match(/(?:^|[^a-f0-9])([a-f0-9]{32})(?:[^a-f0-9]|$)/i);
    if (md5Match && md5Match[1]) return 'hash_' + md5Match[1].toLowerCase();
    const tosMatch = clean.match(/(tos-[a-z0-9-]+(?:\/[^/?#~]+)+)/i);
    if (tosMatch && tosMatch[1]) return 'tos_' + tosMatch[1].replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '').toLowerCase();
    try {
      const u = new URL(clean);
      let p = u.pathname.replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '');
      return 'path_' + p.toLowerCase();
    } catch (e) {
      return 'raw_' + clean.split('?')[0].replace(/~tplv-[^/?#]+/g, '').toLowerCase();
    }
  }

  function getChatScopeKey(url, title) {
    const cleanUrl = String(url || (typeof window !== 'undefined' ? window.location.href : '') || '').split('#')[0];
    
    // 1. URL path check: /chat/<id> or /c/<id> or /conversation/<id>
    const pathMatch = cleanUrl.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
      return 'chat_' + pathMatch[1];
    }

    // 2. Query param check: ?conversation_id=<id> or ?id=<id> or ?session_id=<id>
    try {
      const u = new URL(cleanUrl);
      const qId = u.searchParams.get('conversation_id') || u.searchParams.get('id') || u.searchParams.get('chat_id') || u.searchParams.get('session_id');
      if (qId) return 'chat_' + qId;
      if (u.pathname && u.pathname !== '/' && u.pathname !== '/chat') {
        return 'path_' + u.pathname.replace(/\/$/, '').toLowerCase();
      }
    } catch (e) {}

    // 3. Active conversation item in Dola sidebar
    if (typeof document !== 'undefined') {
      try {
        const activeLink = document.querySelector('aside a[class*="active"], nav a[class*="active"], [class*="sidebar"] a[class*="active"], [class*="sidebar"] [aria-selected="true"] a, a[aria-current="page"]');
        if (activeLink && activeLink.href) {
          const m = activeLink.href.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
          if (m && m[1] && m[1] !== 'new') return 'chat_' + m[1];
        }
      } catch (e) {}

      // 4. Header title of current active conversation in DOM
      try {
        const headerEl = document.querySelector('header [class*="title"], [class*="chat-header"] [class*="title"], [class*="conversation-header"], main header h1, main header h2, [data-conversation-title]');
        const headerText = (headerEl?.textContent || headerEl?.getAttribute?.('data-conversation-title') || '').trim();
        if (headerText && !headerText.includes('Dola AI -') && headerText !== 'Dola' && headerText !== 'Dola AI' && headerText.length > 2) {
          return 'title_' + headerText.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
        }
      } catch (e) {}
    }

    // 5. Fallback title
    const cleanTitle = String(title || (typeof document !== 'undefined' ? document.title : '') || '').trim();
    if (cleanTitle && !cleanTitle.includes('Dola AI -') && cleanTitle !== 'Dola' && cleanTitle !== 'Dola AI' && cleanTitle.length > 2) {
      return 'title_' + cleanTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
    }

    return 'chat_current';
  }

  try {
    window.__ctbExtractFingerprint = extractVideoFingerprintGlobal;
    window.__ctbGetChatScopeKey = getChatScopeKey;
    window.__CTB_ACTIVE_CHAT_VIDEOS__ = window.__CTB_ACTIVE_CHAT_VIDEOS__ || new Map();
  } catch (e) {}

  function broadcastConfig() {
    chrome.storage.local.get(['ratioOverride', 'durationOverride', 'targetRatio', 'ctb_max_credits_limit', 'active_profile_name'], (data) => {
      const dur = data?.durationOverride || '30';
      const ratio = data?.ratioOverride || data?.targetRatio || '9:16';
      const maxCredits = data?.ctb_max_credits_limit || '10';
      const activeAccountName = data?.active_profile_name || '';

      window.postMessage({
        type: 'SET_RATIO_OVERRIDE',
        duration: dur,
        ratio: ratio,
        maxCredits: maxCredits,
        activeAccountName: activeAccountName
      }, '*');

      window.postMessage({
        type: 'DURATION_OVERRIDE',
        duration: dur,
        activeAccountName: activeAccountName
      }, '*');

      window.postMessage({
        type: 'SET_MAX_CREDITS_LIMIT',
        maxCredits: maxCredits
      }, '*');

      window.postMessage({
        type: 'RATIO_SWITCHED',
        ratio: ratio
      }, '*');

      if (activeAccountName) {
        window.postMessage({
          type: 'SET_ACTIVE_ACCOUNT_NAME',
          activeAccountName: activeAccountName
        }, '*');
      }
    });
  }

  function broadcastPrompts() {
    chrome.storage.local.get(['ctb_saved_prompts'], (data) => {
      window.postMessage({
        type: 'CTB_SYNC_PROMPTS',
        prompts: Array.isArray(data?.ctb_saved_prompts) ? data.ctb_saved_prompts : []
      }, '*');
    });
  }

  function broadcastAccounts() {
    chrome.storage.local.get(['multi_profiles', 'active_profile_name'], (data) => {
      const profiles = data?.multi_profiles || {};
      const sanitizedProfiles = {};
      for (const [name, prof] of Object.entries(profiles)) {
        sanitizedProfiles[name] = {
          name: prof?.name || name,
          count: Array.isArray(prof?.cookies) ? prof.cookies.length : (prof?.count || 0),
          date: prof?.date || '',
          color: prof?.color || '#059669',
          lastUsed: prof?.lastUsed || null
        };
      }
      window.postMessage({
        type: 'CTB_SYNC_ACCOUNTS_PAYLOAD',
        profiles: sanitizedProfiles,
        activeProfile: data?.active_profile_name || ''
      }, '*');
    });
  }

  // Broadcast when DOM content script initializes
  broadcastConfig();
  broadcastPrompts();
  broadcastAccounts();
  setTimeout(broadcastPrompts, 500);
  setTimeout(broadcastAccounts, 500);
  setTimeout(broadcastPrompts, 1500);
  setTimeout(broadcastAccounts, 1500);
  setTimeout(broadcastPrompts, 3500);
  setTimeout(broadcastAccounts, 3500);

  // Listen to chrome.storage changes
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.ratioOverride || changes.targetRatio || changes.durationOverride || changes.ctb_max_credits_limit || changes.active_profile_name) {
        broadcastConfig();
      }
      if (changes.ctb_saved_prompts) {
        window.postMessage({
          type: 'CTB_SYNC_PROMPTS',
          prompts: Array.isArray(changes.ctb_saved_prompts.newValue) ? changes.ctb_saved_prompts.newValue : []
        }, '*');
      }
      if (changes.multi_profiles || changes.active_profile_name) {
        broadcastAccounts();
      }
    }
  });

  // Listen for prompt events from in-page Prompt Dock
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'CTB_REQUEST_PROMPT_SYNC') {
      broadcastPrompts();
    }
    if (e.data?.type === 'CTB_SAVE_PROMPTS_FROM_PAGE') {
      const prompts = e.data.prompts;
      if (Array.isArray(prompts)) {
        chrome.storage.local.set({ ctb_saved_prompts: prompts });
      }
    }
  });

  function findDolaComposerGlobal() {
    const selectors = [
      '#input-engine-container .tiptap',
      '#input-engine-container .ProseMirror',
      '#input-engine-container [role="textbox"]',
      '#input-engine-container textarea',
      '.tiptap',
      '.ProseMirror[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"]',
      '.ProseMirror',
      '[contenteditable="true"]',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="video" i]',
      'textarea[placeholder*="describe" i]',
      'textarea[placeholder*="chat" i]',
      'textarea',
      '.semi-input-textarea',
      '[data-testid="chat-input"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && (el.offsetParent !== null || el.offsetHeight > 0 || (el.getClientRects && el.getClientRects().length > 0))) return el;
    }
    return document.querySelector('.tiptap, .ProseMirror, textarea, div[contenteditable="true"]');
  }

  function injectPromptIntoComposerGlobal(text, options = {}) {
    if (!text || typeof text !== 'string') return false;
    if (!options?.skipDna && typeof applyCharacterDna === 'function') {
      text = applyCharacterDna(text.trim());
    } else {
      text = text.trim();
    }
    if (!text) return false;

    const composer = findDolaComposerGlobal();
    if (!composer) return false;

    try {
      composer.focus();

      if (composer.isContentEditable || composer.getAttribute('contenteditable') === 'true') {
        let injected = false;
        try {
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(composer);
          sel.removeAllRanges();
          sel.addRange(range);

          document.execCommand('delete', false);
          injected = document.execCommand('insertText', false, text);
        } catch (e) {}

        if (!injected || !composer.textContent?.includes(text.slice(0, 15))) {
          try {
            const ev = new InputEvent('beforeinput', {
              bubbles: true,
              cancelable: true,
              inputType: 'insertText',
              data: text
            });
            composer.dispatchEvent(ev);
          } catch (e) {}
        }

        if (!composer.textContent || !composer.textContent.includes(text.slice(0, 15))) {
          try {
            const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            composer.innerHTML = `<p>${esc}</p>`;
          } catch (e) {
            composer.textContent = text;
          }
        }

        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        composer.focus();
        return true;
      }

      if (composer.tagName?.toLowerCase() === 'textarea' || composer.tagName?.toLowerCase() === 'input') {
        const proto = composer.tagName?.toLowerCase() === 'textarea' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(composer, text);
        } else {
          composer.value = text;
        }
        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        composer.focus();
        return true;
      }
    } catch (e) {
      console.warn('[ChannaTheBrand Pro] In-page prompt injection failed:', e);
      return false;
    }
    return false;
  }

  try {
    window.findDolaComposerGlobal = findDolaComposerGlobal;
    window.injectPromptIntoComposerGlobal = injectPromptIntoComposerGlobal;
  } catch (e) {}

  // Listen for direct messages from popup.js
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'SET_RATIO_OVERRIDE' || message?.action === 'set_ratio') {
      const ratio = message.ratio || '9:16';
      window.postMessage({
        type: 'SET_RATIO_OVERRIDE',
        ratio: ratio
      }, '*');
      window.postMessage({
        type: 'RATIO_SWITCHED',
        ratio: ratio
      }, '*');
      sendResponse?.({ ok: true });
    }
    if (message?.type === 'DURATION_OVERRIDE' || message?.action === 'set_duration') {
      const dur = message.duration || '30';
      window.postMessage({
        type: 'DURATION_OVERRIDE',
        duration: dur
      }, '*');
      sendResponse?.({ ok: true });
    }
    if (message?.type === 'SET_MAX_CREDITS_LIMIT') {
      window.postMessage({
        type: 'SET_MAX_CREDITS_LIMIT',
        maxCredits: message.maxCredits || '6'
      }, '*');
      sendResponse?.({ ok: true });
    }

    // ⚡ 1-Click Prompt Paste Handler (From Extension Side Panel / Popup Prompts Tab)
    if (message?.action === 'paste_prompt_to_page' || message?.type === 'PASTE_PROMPT') {
      const promptText = message.prompt || '';
      if (promptText) {
        const injected = injectPromptIntoComposerGlobal(promptText);
        window.postMessage({
          type: 'CHANNA_PASTE_PROMPT',
          prompt: promptText,
          promptNumber: message.promptNumber,
          promptTitle: message.promptTitle
        }, '*');
        sendResponse?.({ ok: true, injected });
      } else {
        sendResponse?.({ ok: false, error: 'Empty prompt' });
      }
    }
    return true;
  });
})();

/**
 * ChannaTheBrand Auto Video Downloader — Content Script (Isolated World)
 * Strictly connects with MAIN-world extractor (extractor.js) for 100% Watermark-Free raw streams.
 * Eliminates duplicate downloads & saves directly to Downloads/ChannaTheBrand_Videos.
 */
(() => {
  'use strict';

  if (window.__CTB_CONTENT_SCRIPT_INITIALIZED__) {
    return;
  }
  window.__CTB_CONTENT_SCRIPT_INITIALIZED__ = true;

  console.log('[ChannaTheBrand Downloader Bridge] Content script active on:', window.location.href);

  // In-memory deduplication set
  const downloadedMediaKeys = new Set();
  let latestExtractedVideos = [];
  
  function showDownloadToast(title, resolution = '1080P Raw') {
    try {
      const existing = document.getElementById('channa-download-toast');
      if (existing) existing.remove();

      const toast = document.createElement('div');
      toast.id = 'channa-download-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999999;
        background: rgba(18, 13, 36, 0.94);
        border: 1px solid rgba(168, 85, 247, 0.55);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 12px rgba(124, 58, 237, 0.35);
        color: #f8fafc;
        padding: 5px 12px;
        border-radius: 999px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(12px);
        animation: ctbToastSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        user-select: none;
        white-space: nowrap;
        max-width: 380px;
      `;

      toast.innerHTML = `
        <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(135deg, #7c3aed, #a855f7); font-size: 10px; color: #fff; box-shadow: 0 0 6px rgba(168,85,247,0.5);">📥</span>
        <span style="font-weight: 700; color: #ffffff;">Video Saved</span>
        <span style="color: #94a3b8; font-size: 10px;">•</span>
        <span style="color: #c084fc; font-weight: 600; font-size: 10.5px;">1080P Raw</span>
        <span style="background: rgba(52, 211, 153, 0.15); color: #34d399; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 999px; border: 1px solid rgba(52, 211, 153, 0.35);">✓</span>
      `;

      if (!document.getElementById('ctb-toast-anim-style')) {
        const style = document.createElement('style');
        style.id = 'ctb-toast-anim-style';
        style.textContent = `
          @keyframes ctbToastSlideUp {
            from { transform: translateY(16px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 2600);
    } catch {}
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  let isBulkModeActiveLocal = false;
  try {
    chrome.storage.local.get(['channa_bulk_mode'], res => {
      isBulkModeActiveLocal = Boolean(res?.channa_bulk_mode);
      window.__ctbIsBulkModeActive = isBulkModeActiveLocal;
    });
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.channa_bulk_mode !== undefined) {
        isBulkModeActiveLocal = Boolean(changes.channa_bulk_mode.newValue);
        isBulkModeActive = isBulkModeActiveLocal;
        window.__ctbIsBulkModeActive = isBulkModeActiveLocal;
        if (typeof updateBulkDock === 'function') updateBulkDock();
      }
    });
  } catch (e) {}

  function triggerDownload(video, force = false) {
    if (!video || !video.url) return;

    // In Bulk Download Mode, suppress individual auto-downloads completely to avoid spamming the user's downloads folder
    const isBulk = Boolean(window.__ctbIsBulkModeActive || isBulkModeActiveLocal);
    if (isBulk && !force) {
      console.log('[ChannaTheBrand Downloader] ⏸️ Individual auto-download paused: Bulk Download Mode is ACTIVE.');
      try {
        const cleanUrl = String(video.url).trim();
        const fp = (window.__ctbExtractFingerprint || extractVideoFingerprintGlobal)(cleanUrl);
        if (fp) {
          const entry = {
            url: cleanUrl,
            title: video.prompt || video.topicTitle || video.title || 'Chat Video',
            source: video.source || 'bulk_mode',
            pageUrl: window.location.href,
            chatScopeKey: (typeof getChatScopeKey === 'function') ? getChatScopeKey(window.location.href, document.title) : 'chat_current',
            fingerprint: fp
          };
          window.__CTB_ACTIVE_CHAT_VIDEOS__ = window.__CTB_ACTIVE_CHAT_VIDEOS__ || new Map();
          window.__CTB_ACTIVE_CHAT_VIDEOS__.set(fp, entry);
          if (typeof allExtractedChatVideos !== 'undefined') {
            allExtractedChatVideos.set(fp, entry);
          }
          if (typeof updateBulkDock === 'function') {
            updateBulkDock();
          }
        }
      } catch (e) {}
      return;
    }
    
    // Allow all valid unwatermarked and chat video sources
    const allowedSources = ['fallback_api', 'dola_chat', 'dom', 'media'];
    if (video.source && !allowedSources.includes(video.source) && !force) {
      console.log('[ChannaTheBrand Downloader] Ignored non-media video stream.');
      return;
    }

    const cleanUrl = String(video.url).trim();
    if (!cleanUrl.startsWith('http')) return;

    const fp = (window.__ctbExtractFingerprint || extractVideoFingerprintGlobal)(cleanUrl);
    const mediaKey = String(video.vid || fp || cleanUrl);

    window.__ctbDownloadedFingerprints = window.__ctbDownloadedFingerprints || new Set();

    if (!force) {
      if (
        (fp && window.__ctbDownloadedFingerprints.has(fp)) ||
        (fp && downloadedMediaKeys.has(fp)) ||
        downloadedMediaKeys.has(mediaKey) ||
        downloadedMediaKeys.has(cleanUrl)
      ) {
        return;
      }
    }

    if (fp) {
      window.__ctbDownloadedFingerprints.add(fp);
      downloadedMediaKeys.add(fp);
    }
    downloadedMediaKeys.add(mediaKey);
    downloadedMediaKeys.add(cleanUrl);

    try {
      window.__CTB_ACTIVE_CHAT_VIDEOS__ = window.__CTB_ACTIVE_CHAT_VIDEOS__ || new Map();
      if (fp) {
        window.__CTB_ACTIVE_CHAT_VIDEOS__.set(fp, {
          url: cleanUrl,
          title: video.prompt || video.topicTitle || video.title || 'Chat Video',
          source: 'auto_download',
          fingerprint: fp
        });
      }
    } catch (e) {}

    const accountCapsule = document.getElementById('channa-top-center-capsule') || document.querySelector('[class*="profile"], [class*="avatar"], [class*="user"]');
    const accountName = (accountCapsule?.textContent || '').replace(/[^\w\s-]/g, '').trim().split('\n')[0] || '';

    chrome.runtime.sendMessage({
      type: 'AUTO_DOWNLOAD_VIDEO',
      force,
      video: {
        ...video,
        url: cleanUrl,
        pageUrl: window.location.href,
        prompt: video.prompt || video.topicTitle || video.title || '',
        accountName: video.accountName || accountName || 'Account',
        resolution: '1080P'
      }
    }, response => {
      if (response?.ok && response?.downloaded) {
        showDownloadToast(video.prompt || video.topicTitle || video.title || 'ChannaTheBrand Video', '1080P Raw (No Watermark)');
      } else if (!response?.downloaded && response?.reason !== 'Already downloaded') {
        downloadedMediaKeys.delete(mediaKey);
      }
    });
  }

  function requestMainWorldMedia(timeoutMs = 1500) {
    return new Promise(resolve => {
      let settled = false;

      const finish = (vids) => {
        if (settled) return;
        settled = true;
        window.removeEventListener('message', onMsg);
        window.removeEventListener('DOLA_CHAT_MEDIA_RESPONSE', onEvent);
        document.removeEventListener('DOLA_CHAT_MEDIA_RESPONSE', onEvent);
        const list = Array.isArray(vids) ? vids : [];
        if (list.length > 0) latestExtractedVideos = list;
        resolve(list.length > 0 ? list : (latestExtractedVideos || []));
      };

      const onMsg = (event) => {
        if (event.data?.type === 'DOLA_CHAT_MEDIA_RESPONSE_RELAY') {
          finish(event.data?.videos);
        }
      };

      const onEvent = (event) => {
        finish(event?.detail?.videos);
      };

      window.addEventListener('message', onMsg);
      window.addEventListener('DOLA_CHAT_MEDIA_RESPONSE', onEvent, { once: true });
      document.addEventListener('DOLA_CHAT_MEDIA_RESPONSE', onEvent, { once: true });

      // Dispatch request through both message and CustomEvent on window and document
      window.postMessage({ type: 'DOLA_GET_CHAT_MEDIA_REQUEST' }, '*');
      try {
        window.dispatchEvent(new CustomEvent('DOLA_GET_CHAT_MEDIA'));
        document.dispatchEvent(new CustomEvent('DOLA_GET_CHAT_MEDIA'));
      } catch (e) {}

      setTimeout(() => {
        finish(latestExtractedVideos);
      }, timeoutMs);
    });
  }

  try { window.__ctbRequestMainWorldMedia = requestMainWorldMedia; } catch (e) {}

  // 1. Listen for new unwatermarked video extractions from extractor.js / inject.js
  window.addEventListener('DOLA_VIDEO_EXTRACTED', event => {
    const video = event.detail;
    if (video && video.url) {
      console.log('[ChannaTheBrand Downloader] Extracted unwatermarked master video stream:', video);
      try {
        window.__CTB_ACTIVE_CHAT_VIDEOS__ = window.__CTB_ACTIVE_CHAT_VIDEOS__ || new Map();
        const fp = (window.__ctbExtractFingerprint || extractVideoFingerprintGlobal)(video.url);
        if (fp) {
          const entry = {
            url: video.url,
            title: video.prompt || video.topicTitle || video.title || 'Chat Video',
            source: video.source || 'auto_download',
            pageUrl: window.location.href,
            chatScopeKey: video.chatScopeKey || ((typeof getChatScopeKey === 'function') ? getChatScopeKey(window.location.href, document.title) : 'chat_current'),
            fingerprint: fp
          };
          window.__CTB_ACTIVE_CHAT_VIDEOS__.set(fp, entry);
          if (typeof allExtractedChatVideos !== 'undefined') {
            allExtractedChatVideos.set(fp, entry);
          }
          if (typeof updateBulkDock === 'function') {
            updateBulkDock();
          }
        }
      } catch (e) {}

      const isBulk = Boolean(window.__ctbIsBulkModeActive || isBulkModeActiveLocal);
      if (!isBulk) {
        triggerDownload(video, false);
      } else {
        console.log('[ChannaTheBrand Downloader] ⏸️ Bulk Mode Active: Auto-download suppressed for newly extracted video.');
      }
    }
  });

  // 1a. Listen for account auto-switch & reset requests from inject.js (Safe & Debounced)
  let lastContentSwitchTime = 0;
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'CHANNA_MANUAL_SWITCH_ACCOUNT') {
      console.log('[ChannaTheBrand Pro] 🔄 Manual Switch Account triggered from Shark Block banner!');
      chrome.runtime.sendMessage({ action: 'SWITCH_TO_NEXT_PROFILE', isManual: true }, (resp) => {
        if (resp?.success) {
          console.log('[ChannaTheBrand Pro] ✅ Successfully rotated to profile:', resp.profileName);
        } else {
          console.warn('[ChannaTheBrand Pro] ⚠️ Manual switch result:', resp);
        }
      });
      return;
    }
    if (event.data?.type === 'CHANNA_SWITCH_NEXT_ACCOUNT') {
      const now = Date.now();
      const switchCooldown = parseInt(sessionStorage.getItem('__ctb_switch_cooldown') || '0', 10);
      if (now < switchCooldown) return;
      
      chrome.storage.local.get(['ctb_auto_rotate', 'multi_profiles'], (res) => {
        // Strictly require explicit opt-in (default disabled) to prevent unprompted page reloads
        if (res?.ctb_auto_rotate !== true) {
          console.log('[ChannaTheBrand Pro] ⏸️ Auto-switch suppressed: ctb_auto_rotate is disabled (Anti-Reload Active).');
          return;
        }
        const profiles = res?.multi_profiles || {};
        if (Object.keys(profiles).length <= 1) return;
        
        chrome.runtime.sendMessage({ action: 'SWITCH_TO_NEXT_PROFILE', reason: event.data.reason || 'limit', isManual: false }, (resp) => {
          if (resp?.success) {
            console.log('[ChannaTheBrand Pro] ✅ Successfully rotated to profile:', resp.profileName);
          }
        });
      });
    }
    if (event.data?.type === 'CHANNA_RESET_CLEAN_SESSION') {
      console.log('[ChannaTheBrand Pro] 🧹 Resetting session & rate limits...');
      chrome.runtime.sendMessage({ action: 'RESET_SESSION_AND_RATE_LIMITS' });
    }
  });

  // 1a2. Smart Autonomous Daily Limit Detector (Notice only, NEVER force-reloads the page)
  (() => {
    const pageInitTime = Date.now();
    const seenLimitMessageIds = new Set();
    const limitPhrases = [
      "reached the daily limit for video generation",
      "daily limit for video generation",
      "reached the daily limit",
      "reached daily limit",
      "daily video generation limit",
      "limit for video generation",
      "please try again tomorrow",
      "try again tomorrow",
      "达到今日视频生成上限",
      "今日视频生成上限",
      "今日生成上限"
    ];

    function checkDailyLimitInDom() {
      try {
        const now = Date.now();
        // Startup immunity: First 30s no notices
        if (now - pageInitTime < 30000) return;

        // Check active floating dialogs/modals
        const activeDialogs = Array.from(document.querySelectorAll(
          '[role="dialog"], [role="alert"], .semi-modal, .semi-toast, .semi-notification, [class*="toast" i], [class*="alert" i], [class*="modal" i]'
        ));
        for (const dialog of activeDialogs) {
          const text = (dialog.innerText || dialog.textContent || '').toLowerCase();
          if (text && limitPhrases.some(p => text.includes(p))) {
            const key = 'dialog_' + text.slice(0, 40);
            if (!seenLimitMessageIds.has(key)) {
              seenLimitMessageIds.add(key);
              showNonReloadLimitNotice('active_dialog');
              return;
            }
          }
        }
      } catch (e) {}
    }

    function showNonReloadLimitNotice(reason) {
      console.warn(`[ChannaTheBrand Pro] ⚠️ Daily Limit Detected (${reason}). Notice displayed without reloading page.`);
      if (typeof window.__showChannaNotice === 'function') {
        window.__showChannaNotice('⚠️ Daily generation limit reached. You can switch accounts anytime from the side panel.', 6000);
      }
    }

    setInterval(checkDailyLimitInDom, 6000);
  })();

  // 1b. Robust Autonomous DOM Chat Video Detector & Auto-Downloader
  (() => {
    const autoDownloadedUrls = new Set();

    function checkAndAutoDownloadChatVideos() {
      try {
        const videoEls = document.querySelectorAll('video');
        if (!videoEls || videoEls.length === 0) return;

        videoEls.forEach(v => {
          let src = v.currentSrc || v.src || v.querySelector('source')?.src || '';
          if (!src || !src.startsWith('http')) return;

          const cleanUrl = src.split('?')[0];
          if (autoDownloadedUrls.has(cleanUrl) || downloadedMediaKeys.has(cleanUrl)) return;

          const isMediaHost = src.includes('byteintl.com') || 
                              src.includes('doubao.com') || 
                              src.includes('dola.com') || 
                              src.includes('seaart.ai') || 
                              src.includes('ibytedtos.com') || 
                              src.includes('.mp4');
          if (!isMediaHost) return;

          // Check if video is loaded and ready
          if (v.readyState >= 1 || v.duration > 0 || v.videoWidth > 0) {
            autoDownloadedUrls.add(cleanUrl);
            downloadedMediaKeys.add(cleanUrl);

            const bubble = v.closest('[class*="message"], [class*="chat"], [class*="bubble"], div[data-testid]') || v.parentElement;
            let promptText = '';
            if (bubble) {
              const textEl = bubble.querySelector('p, span, [class*="text"], [class*="content"]');
              promptText = (textEl?.textContent || '').trim().slice(0, 100);
            }
            
            const isBulk = Boolean(window.__ctbIsBulkModeActive || isBulkModeActiveLocal);
            if (!isBulk) {
              console.log('[ChannaTheBrand Auto-Downloader] 🚀 Detected ready chat video! Auto-downloading:', cleanUrl);
              triggerDownload({
                url: src,
                source: 'dola_chat',
                prompt: promptText || 'Dola Chat Video',
                vid: cleanUrl
              }, false);
            } else {
              console.log('[ChannaTheBrand Auto-Downloader] ⏸️ Bulk Mode Active: Individual auto-download suppressed for DOM video.');
            }
          }
        });
      } catch (e) {}
    }

    // ⚡ ULTRA-FAST TARGETED BRANDING SYNCHRONIZER
    function syncBrandingLabels() {
      try {
        chrome.storage.local.get(['durationOverride', 'targetRatio', 'ratioOverride'], (data) => {
          const dur = String(data?.durationOverride || '30');
          const ratio = data?.targetRatio || data?.ratioOverride || '9:16';

          // 1. Direct pill elements
          document.querySelectorAll('.dur-pill, .dur-pill-span, #dur-pill, [class*="dur-pill"]').forEach(p => {
            const expected = `${dur}s CHANNA`;
            if (p.textContent.trim() !== expected) p.textContent = expected;
            p.style.color = '#10b981';
            p.style.fontWeight = 'bold';
          });

          document.querySelectorAll('.ratio-pill, .ratio-pill-span, #ratio-pill, [class*="ratio-pill"]').forEach(p => {
            const expected = `THE BRAND ${ratio}`;
            if (p.textContent.trim() !== expected) p.textContent = expected;
            p.style.color = '#38bdf8';
            p.style.fontWeight = 'bold';
          });

          // 2. TreeWalker deep scrubber strictly across composer toolbar
          const composerArea = document.querySelector('[class*="composer" i], [class*="chat-input" i], div[class*="input-engine"], form');
          if (composerArea) {
            const walker = document.createTreeWalker(composerArea, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while ((node = walker.nextNode())) {
              if (node.nodeValue) {
                if (node.nodeValue.includes('Bypassed')) {
                  node.nodeValue = node.nodeValue.replace(/\(?Bypassed\)?/gi, 'CHANNA').replace(/\s{2,}/g, ' ');
                  if (node.parentElement) {
                    node.parentElement.style.color = '#10b981';
                    node.parentElement.style.fontWeight = 'bold';
                  }
                }
                if (/\b\d+s\s+Bypassed\b/i.test(node.nodeValue)) {
                  node.nodeValue = node.nodeValue.replace(/\b(\d+s)\s+Bypassed\b/gi, '$1 CHANNA');
                }
                if (/^Ratio\s*(?:9:16|16:9|1:1|4:3|3:4|21:9)?/i.test(node.nodeValue.trim())) {
                  node.nodeValue = node.nodeValue.trim().replace(/^Ratio\s*(?:9:16|16:9|1:1|4:3|3:4|21:9)?/i, 'THE BRAND ' + ratio);
                }
                if (/THE BRAND\s+(?:9:16|16:9|1:1|4:3|3:4|21:9)/i.test(node.nodeValue)) {
                  node.nodeValue = node.nodeValue.replace(/THE BRAND\s+(?:9:16|16:9|1:1|4:3|3:4|21:9)/gi, 'THE BRAND ' + ratio);
                }
              }
            }
          }
        });
      } catch (e) {}
    }

    // Lightweight periodic check & initial execution (0% CPU impact)
    setInterval(checkAndAutoDownloadChatVideos, 4000);
    setInterval(syncBrandingLabels, 2500);
    syncBrandingLabels();
    checkAndAutoDownloadChatVideos();
  })();

  // 2. Handle manual download trigger from extension popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'SCAN_AND_DOWNLOAD_ACTIVE_TAB') {
      (async () => {
        try {
          const videos = await requestMainWorldMedia(2000);
          const unwatermarked = videos.filter(v => v?.source === 'fallback_api' && v.url);

          if (unwatermarked.length > 0) {
            const target = unwatermarked[unwatermarked.length - 1];
            triggerDownload(target, true);
            sendResponse({ ok: true, foundCount: 1, unwatermarked: true, url: target.url });
            return;
          }

          sendResponse({ ok: false, foundCount: 0, message: 'Generating or unwatermarked 1080P stream not ready yet.' });
        } catch (err) {
          sendResponse({ ok: false, error: err.message || String(err) });
        }
      })();
      return true;
    }
  });

})();


// ============================================================================
// ⚡ 10-TAB PARALLEL FARM IN-PAGE AUTO-PROMPT INJECTOR
// ============================================================================
(() => {
  function findDolaComposer() {
    const selectors = [
      'textarea[placeholder*="prompt" i]',
      'textarea[placeholder*="video" i]',
      'textarea[placeholder*="describe" i]',
      'textarea[placeholder*="chat" i]',
      'textarea',
      'div[contenteditable="true"]',
      '.semi-input-textarea',
      '[data-testid="chat-input"]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.offsetParent !== null) return el;
    }
    return document.querySelector('textarea, div[contenteditable="true"]');
  }

  function injectPromptIntoComposer(text) {
    if (!text) return false;
    const composer = findDolaComposer();
    if (!composer) return false;

    try {
      if (composer.tagName?.toLowerCase() === 'textarea' || composer.tagName?.toLowerCase() === 'input') {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
                             Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(composer, text);
        } else {
          composer.value = text;
        }
      } else if (composer.isContentEditable) {
        composer.innerText = text;
      }

      composer.dispatchEvent(new Event('input', { bubbles: true }));
      composer.dispatchEvent(new Event('change', { bubbles: true }));
      composer.focus();
      return true;
    } catch (e) {
      console.warn('[ChannaTheBrand Farm] In-page prompt injection failed:', e);
      return false;
    }
  }

  function showFarmSlotBanner(info) {
    try {
      if (document.getElementById('channa-farm-slot-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'channa-farm-slot-banner';
      banner.style.cssText = `
        position: fixed;
        bottom: 12px;
        right: 12px;
        z-index: 999999;
        background: linear-gradient(135deg, rgba(15, 12, 27, 0.95), rgba(30, 22, 56, 0.95));
        border: 1px solid #a855f7;
        box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
        padding: 6px 12px;
        border-radius: 8px;
        color: #f1f5f9;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 11px;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: none;
        backdrop-filter: blur(8px);
        animation: fadeIn 0.3s ease-out;
      `;
      const capText = (info.maxCredits || 6) + ' Pts Cap';
      banner.innerHTML = `
        <span style="color: #10b981;">⚡ Farm Slot #0${info.slotNumber || 1}</span>
        <span style="color: #94a3b8;">|</span>
        <span style="color: #38bdf8;">👤 ${info.accountName || 'Account'}</span>
        <span style="color: #94a3b8;">|</span>
        <span style="color: #c084fc;">💎 ${capText}</span>
        <span style="color: #94a3b8;">|</span>
        <span style="color: #f59e0b;">📝 Prompt #${String(info.promptNumber || 1).padStart(2, '0')} Ready</span>
      `;
      document.body.appendChild(banner);
    } catch (e) {}
  }

  async function checkAndInjectFarmPrompt() {
    try {
      chrome.runtime.sendMessage({ type: 'GET_FARM_ASSIGNED_PROMPT' }, (res) => {
        if (chrome.runtime.lastError) return;
        if (res && res.hasAssignedPrompt && res.promptText) {
          console.log('[ChannaTheBrand Farm] Assigned prompt received:', res);

          let attempts = 0;
          const maxAttempts = 30; // 15 seconds polling
          const interval = setInterval(() => {
            attempts++;
            const success = injectPromptIntoComposer(res.promptText);
            if (success || attempts >= maxAttempts) {
              clearInterval(interval);
              if (success) {
                showFarmSlotBanner(res);
                console.log('[ChannaTheBrand Farm] Prompt successfully injected into composer!');
              }
            }
          }, 500);
        }
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInjectFarmPrompt);
  } else {
    checkAndInjectFarmPrompt();
  }
})();

// ============================================================================
// 🎬 AUTOMATED OMNI-REFERENCE LAST-FRAME CONTINUATION ENGINE (CapCut Style)
// ============================================================================
(() => {
  'use strict';

  if (typeof window === 'undefined' || window.self !== window.top) return;
  if (window.__CTB_OMNI_ENGINE_INITIALIZED__) return;
  window.__CTB_OMNI_ENGINE_INITIALIZED__ = true;

  let omniChainEnabled = true;
  let lastCapturedFrameFile = null;
  let processedVideos = new Set();

  chrome.storage.local.get(['ctb_omni_reference_chaining'], (data) => {
    omniChainEnabled = data?.ctb_omni_reference_chaining !== false;
  });

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'SET_OMNI_CHAIN_CONFIG') {
      omniChainEnabled = Boolean(message.enabled);
      console.log('[Omni-Ref] 🔄 Last-Frame Continuation state updated:', omniChainEnabled);
    }
  });

  function showOmniRefToast(msg) {
    try {
      let toast = document.getElementById('channa-omni-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'channa-omni-toast';
        toast.style.cssText = `
          position: fixed;
          top: 18px;
          right: 18px;
          z-index: 9999999;
          background: linear-gradient(135deg, rgba(30, 22, 56, 0.95), rgba(15, 12, 27, 0.95));
          border: 1px solid #a855f7;
          box-shadow: 0 8px 30px rgba(168, 85, 247, 0.45);
          color: #f8fafc;
          padding: 8px 14px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          pointer-events: none;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        `;
        document.body.appendChild(toast);
      }
      toast.innerHTML = `<span style="color: #a855f7; font-size: 14px;">🎬</span> <span>${msg}</span>`;
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
      setTimeout(() => {
        if (toast) {
          toast.style.opacity = '0';
          toast.style.transform = 'translateY(-10px)';
        }
      }, 4500);
    } catch (e) {}
  }

  async function captureLastFrameFromVideo(videoElOrUrl, posterFallbackUrl = '') {
    try {
      // 1. If an HTMLVideoElement is already loaded in DOM with valid dimensions, try direct draw
      if (videoElOrUrl instanceof HTMLVideoElement && videoElOrUrl.readyState >= 2 && videoElOrUrl.videoWidth > 0) {
        try {
          const vw = videoElOrUrl.videoWidth || 720;
          const vh = videoElOrUrl.videoHeight || 1280;
          const canvas = document.createElement('canvas');
          canvas.width = vw;
          canvas.height = vh;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(videoElOrUrl, 0, 0, vw, vh);
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/png', 0.95));
          if (blob && blob.size > 1000) {
            return new File([blob], `omni_ref_last_frame_${Date.now()}.png`, { type: 'image/png' });
          }
        } catch (taintErr) {}
      }

      // 2. Extract clean video URL & poster URL
      let url = typeof videoElOrUrl === 'string'
        ? videoElOrUrl.trim()
        : (videoElOrUrl?.currentSrc || videoElOrUrl?.src || videoElOrUrl?.querySelector?.('source')?.src || '');

      const poster = posterFallbackUrl || (typeof videoElOrUrl === 'object' && videoElOrUrl?.poster) || '';

      if (!url && !poster) return null;

      // 3. Fast & precise headless last frame extraction from video stream (200ms)
      if (url) {
        const file = await new Promise((resolve) => {
          const video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';
          if (!url.startsWith('blob:')) {
            video.crossOrigin = 'anonymous';
          }
          video.src = url;

          let finished = false;
          let timer = null;

          const cleanup = () => {
            clearTimeout(timer);
            try { video.remove(); } catch (e) {}
          };

          const finish = () => {
            if (finished) return;
            finished = true;
            try {
              const vw = video.videoWidth || 720;
              const vh = video.videoHeight || 1280;
              if (vw > 0 && vh > 0) {
                const canvas = document.createElement('canvas');
                canvas.width = vw;
                canvas.height = vh;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, vw, vh);
                canvas.toBlob((b) => {
                  cleanup();
                  if (b && b.size > 1000) {
                    resolve(new File([b], `omni_ref_last_frame_${Date.now()}.png`, { type: 'image/png' }));
                  } else {
                    resolve(null);
                  }
                }, 'image/png', 0.95);
                return;
              }
            } catch (err) {
              console.warn('[Omni-Ref] Canvas grab error:', err);
            }
            cleanup();
            resolve(null);
          };

          // 3.8s timeout for seek
          timer = setTimeout(() => {
            console.warn('[Omni-Ref] Video seek timeout, trying poster fallback...');
            finish();
          }, 3800);

          video.onerror = (e) => {
            console.warn('[Omni-Ref] Video load error:', e);
            cleanup();
            resolve(null);
          };

          const onReady = () => {
            try {
              const dur = (isFinite(video.duration) && video.duration > 0) ? video.duration : 5;
              const targetT = Math.max(0.08, dur - 0.08);
              video.addEventListener('seeked', () => finish(), { once: true });
              video.currentTime = targetT;
            } catch (e) {
              finish();
            }
          };

          if (video.readyState >= 1) {
            onReady();
          } else {
            video.addEventListener('loadedmetadata', onReady, { once: true });
            video.load();
          }
        });

        if (file) return file;
      }

      // 4. Reliable Poster Fallback (Guarantees reference image is NEVER missed!)
      if (poster) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          const fileFromPoster = await new Promise((resolve) => {
            const t = setTimeout(() => resolve(null), 3000);
            img.onload = () => {
              clearTimeout(t);
              try {
                const canvas = document.createElement('canvas');
                canvas.width = img.naturalWidth || 720;
                canvas.height = img.naturalHeight || 1280;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((b) => {
                  if (b && b.size > 1000) {
                    resolve(new File([b], `omni_ref_frame_${Date.now()}.png`, { type: 'image/png' }));
                  } else {
                    resolve(null);
                  }
                }, 'image/png', 0.95);
              } catch (e) {
                resolve(null);
              }
            };
            img.onerror = () => {
              clearTimeout(t);
              resolve(null);
            };
            img.src = poster;
          });
          if (fileFromPoster) return fileFromPoster;
        } catch (e) {}
      }

      return null;
    } catch (err) {
      console.warn('[Omni-Ref] Frame capture exception:', err);
      return null;
    }
  }

  let omniRefStagedForCurrentSession = false;
  let isProcessingOmniRef = false;
  let lastStageTimestamp = 0;
  let isCurrentlyStaging = false;

  function getComposerContainer() {
    const engine = document.getElementById('input-engine-container') || document.querySelector('.guidance-input-surface, [class*="input-content-container"]');
    if (engine) return engine;
    const textbox = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, [role="textbox"], textarea');
    if (!textbox) return null;
    return textbox.closest('#input-engine-container, .guidance-input-surface, form, div[class*="composer"], div[class*="chat-input"], div[class*="input"], div[class*="editor-wrapper"]') || textbox.parentElement?.parentElement;
  }

  function isComposerAlreadyHasImage() {
    try {
      const cards = findComposerAttachmentCards();
      if (cards && cards.length > 0) return true;
      const composer = getComposerContainer() || document.getElementById('input-engine-container');
      if (!composer) return false;

      // Check modern Dola image containers or blob images
      const rawCards = composer.querySelectorAll('[class*="thumb-card-"], div[data-kind="image"], [class*="container-A6iRE0"], [class*="image-container-"], .semi-upload-picture-card');
      for (const card of rawCards) {
        if (card.id === 'input-engine-container' || card.classList?.contains('input-content-container')) continue;
        if (card.querySelector('img') && !card.querySelector('.tiptap, .ProseMirror, textarea, [contenteditable="true"]')) return true;
      }
    } catch (e) {}
    return false;
  }


  function findComposerAttachmentCards() {
    try {
      const isOurUi = (el) => {
        if (!el) return false;
        return !!(el.closest && el.closest('#channa-video-ref-btn, #channa-actor-ref-btn, #channa-actor-dock-btn, #channa-accounts-dock-btn, #channa-accounts-quick-popover, #channa-ref-modal-overlay, #channa-prompt-dock, #channa-actor-quick-popover, #ctb-extension-root'));
      };

      const textbox = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea') || findDolaComposerGlobal();
      const composer = textbox?.closest('#input-engine-container, .guidance-input-surface, form, div[class*="input-content-container"], div[class*="chat-input"], div[class*="composer"]') || document.getElementById('input-engine-container') || textbox?.parentElement;
      if (!composer && !textbox) return [];

      // 1. PRO MODE & Dola Chat Cards: Match genuine thumbnail card containers (.relative.group.shrink-0 and standard cards)
      const rawCards = Array.from((composer || document).querySelectorAll(
        '.relative.group.shrink-0, [class*="relative"][class*="group"][class*="shrink-0"], [class*="thumb-card-"], div[data-kind="image"], div[data-kind], [class*="container-A6iRE0"], [class*="container-"], [class*="image-container-"], [class*="attachment"], .semi-upload-picture-card'
      ));

      const validCards = rawCards.filter(card => {
        if (isOurUi(card)) return false;
        if (card.id === 'input-engine-container' || card.classList?.contains('input-content-container')) return false;
        if (card.tagName === 'BUTTON' || card.tagName === 'SVG' || card.tagName === 'PATH') return false;
        // Must never contain the text editor itself
        if (card.querySelector('.tiptap, .ProseMirror, textarea, [contenteditable="true"]')) return false;
        // Must contain an image or video thumbnail
        const img = card.querySelector('img');
        if (!img) return false;
        if (img.classList && img.classList.contains('semi-avatar')) return false;
        return true;
      });

      // Fallback: Any container holding a thumbnail image with a delete button that isn't the root composer
      const imgs = Array.from((composer || document).querySelectorAll('img')).filter(img => {
        if (isOurUi(img)) return false;
        if (img.classList && img.classList.contains('semi-avatar')) return false;
        if (img.width > 0 && img.width < 20 && img.height < 20) return false;
        return true;
      });

      for (const img of imgs) {
        const card = img.closest('.relative.group.shrink-0, [class*="relative"][class*="group"], [class*="thumb-card-"], div[data-kind], [class*="container-A6iRE0"], [class*="container-"], [class*="image-container-"], [class*="attachment"], .semi-upload-picture-card') || img.parentElement;
        if (card && !isOurUi(card) && card.id !== 'input-engine-container' && !card.classList?.contains('input-content-container') && !validCards.includes(card)) {
          if (!card.querySelector('.tiptap, .ProseMirror, textarea, [contenteditable="true"]')) {
            validCards.push(card);
          }
        }
      }

      // Deduplicate nested cards if any
      const result = [];
      for (const card of validCards) {
        if (!result.some(existing => existing.contains(card))) {
          result.push(card);
        }
      }

      return result;
    } catch (e) {
      return [];
    }
  }

  function purgeComposerAttachmentCards(keepFirst = false) {
    try {
      const composer = document.getElementById('input-engine-container') || document;

      // 1. Click delete buttons strictly scoped inside recognized thumbnail cards
      const cards = findComposerAttachmentCards();
      const cardStartIdx = keepFirst ? 1 : 0;
      for (let i = cardStartIdx; i < cards.length; i++) {
        const card = cards[i];
        card.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        card.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        const btn = card.querySelector('path[d*="M18 6L6 18"]')?.closest('div, button')
          || card.querySelector('div[class*="-top-1"], div[class*="-right-1"], div[class*="rounded-full"], [class*="cursor-pointer"], button, [role="button"], [class*="delete-btn-"], [class*="icon-pRUcfR"], [class*="close"], [class*="delete"], [class*="remove"], svg');
        if (btn) {
          const target = btn.closest('button, div[role="button"], div[class*="cursor-pointer"]') || btn;
          try {
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t => {
              target.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
            });
            target.click?.();
          } catch (e) {}
        } else {
          try { card.remove(); } catch (e) {}
        }
      }

      // 2. Safe fallback: Only delete buttons specifically nested under thumb-card or container-A6iRE0
      if (!keepFirst && cards.length === 0) {
        const delBtns = Array.from(composer.querySelectorAll('[class*="thumb-card-"] [class*="delete-btn-"], [class*="container-A6iRE0"] [class*="delete-btn-"], div[data-kind="image"] button'));
        for (const btn of delBtns) {
          try {
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(t => {
              btn.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
            });
            btn.click?.();
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  // Expose helper methods for cross-module bridges
  window.__CTB_findComposerAttachmentCards = findComposerAttachmentCards;
  window.__CTB_purgeComposerAttachmentCards = purgeComposerAttachmentCards;
  window.__CTB_isComposerAlreadyHasImage = isComposerAlreadyHasImage;
  window.__CTB_getComposerContainer = getComposerContainer;

  function findComposerFileInput() {
    try {
      const textbox = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, [role="textbox"], textarea');
      const composerArea = textbox?.closest('form, div[class*="composer"], div[class*="chat"], div[class*="input"], div.relative') || document.getElementById('input-engine-container') || document;
      
      let input = composerArea.querySelector('input[type="file"]:not(#channa-ref-file-input)');
      if (input) return input;
      
      input = document.querySelector('.semi-upload-hidden-input:not(#channa-ref-file-input)');
      if (input) return input;
      
      const allInputs = document.querySelectorAll('input[type="file"]:not(#channa-ref-file-input)');
      for (const inp of allInputs) {
        const acc = (inp.getAttribute('accept') || '').toLowerCase();
        if (acc.includes('image') || acc.includes('video') || !acc || acc === '*/*') {
          return inp;
        }
      }
    } catch (e) {}
    return null;
  }
  window.__CTB_findComposerFileInput = findComposerFileInput;

  let lastImageStagedSignature = '';
  let lastImageStagedTime = 0;

  function detectActiveDolaMode() {
    try {
      const container = document.getElementById('input-engine-container') || document.querySelector('form, div[class*="composer"]') || document;
      
      // Check Create Video pills (Ratio 16:9, Duration, Model)
      const hasVideoPills = 
        container.querySelector('[class*="video-engine"], [class*="model-select"], [data-mode="video"]') ||
        Array.from(container.querySelectorAll('button, div[role="button"]')).some(b => {
          const t = (b.textContent || '').trim();
          return /^Ratio\b/i.test(t) || /\b(5s|10s|15s)\b/i.test(t) || (/^Model\b/i.test(t) && !t.includes('Pro') && !t.includes('Fast'));
        });
      if (hasVideoPills) return 'CREATE_VIDEO';

      // Check Chat mode buttons (Pro vs Fast)
      const candidates = Array.from(container.querySelectorAll('button, div[role="button"], span, div'));
      const isPro = candidates.some(el => {
        const t = (el.textContent || '').trim();
        return /\bPro\b/i.test(t) && !t.includes('Prompt') && !t.includes('Project');
      });
      if (isPro) return 'PRO';

      const isFast = candidates.some(el => {
        const t = (el.textContent || '').trim();
        return /\bFast\b/i.test(t) && !t.includes('Fast action');
      });
      if (isFast) return 'FAST';
    } catch (e) {}

    return 'PRO';
  }

  function stageReferenceImageToComposer(file, options = {}) {
    if (!file) return false;
    const { purge = false } = options;
    try {
      const now = Date.now();
      const sig = `${file.name}_${file.size}`;
      if (sig === lastImageStagedSignature && (now - lastImageStagedTime) < 1200) {
        return true;
      }
      lastImageStagedSignature = sig;
      lastImageStagedTime = now;

      // 1. Purge only if explicitly requested
      if (purge) {
        purgeComposerAttachmentCards(false);
      }

      const activeMode = detectActiveDolaMode();
      console.log('[Actor Vault / Composer] 🎭 Staging reference image for mode:', activeMode);

      let staged = false;
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      if (activeMode === 'PRO') {
        // 🎯 PRO CHAT MODE: Direct single non-bubbling paste on Tiptap/ProseMirror editor (Strictly 1 upload, never double-attaches)
        const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea') || findDolaComposerGlobal();
        if (editor) {
          try {
            editor.focus();
            const pasteEvent = new ClipboardEvent('paste', {
              bubbles: false,
              cancelable: true,
              composed: false,
              clipboardData: dataTransfer
            });
            editor.dispatchEvent(pasteEvent);
            staged = true;
          } catch (e) {
            console.warn('[Actor Vault / Composer] Pro paste error:', e);
          }
        }
      }

      // 🎯 FAST CHAT MODE & CREATE VIDEO MODE (or fallback if Pro paste did not find editor): Native File Input
      if (!staged) {
        let targetInput = findComposerFileInput();
        if (!targetInput) {
          const composer = getComposerContainer() || document.getElementById('input-engine-container') || document;
          const plusBtn = Array.from(composer.querySelectorAll('button')).find(b => {
            return b.querySelector('path[d*="M12.0005 2.25"]') || b.textContent.trim() === '+' || b.getAttribute('aria-label')?.toLowerCase().includes('upload');
          });
          if (plusBtn) {
            plusBtn.click();
            targetInput = findComposerFileInput();
          }
        }

        if (targetInput) {
          try {
            targetInput.value = '';
            const proto = HTMLInputElement.prototype;
            const desc = Object.getOwnPropertyDescriptor(proto, 'files');
            if (desc && desc.set) {
              desc.set.call(targetInput, dataTransfer.files);
            } else {
              targetInput.files = dataTransfer.files;
            }
            targetInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
            staged = true;
          } catch (e) {
            console.warn('[Composer] File input staging error:', e);
          }
        }
      }

      // Final fallback if both above failed: editor paste
      if (!staged) {
        const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea') || findDolaComposerGlobal();
        if (editor) {
          try {
            editor.focus();
            const pasteEvent = new ClipboardEvent('paste', {
              bubbles: false,
              cancelable: true,
              composed: false,
              clipboardData: dataTransfer
            });
            editor.dispatchEvent(pasteEvent);
            staged = true;
          } catch (e) {}
        }
      }

      if (staged) {
        omniRefStagedForCurrentSession = true;
        return true;
      }
    } catch (e) {
      console.warn('[Omni-Ref] Staging failed:', e);
    }
    return false;
  }
  window.__CTB_stageReferenceImageToComposer = stageReferenceImageToComposer;

  async function handleSingleVideoCompletion(videoSource, videoTitle = '') {
    if (omniRefStagedForCurrentSession || isProcessingOmniRef) return;
    if (!omniChainEnabled) return;

    isProcessingOmniRef = true;
    try {
      console.log('[Omni-Ref] 🎥 Caching last frame for on-demand attachment...');
      const file = await captureLastFrameFromVideo(videoSource);
      if (file) {
        lastCapturedFrameFile = file;
        showOmniRefToast('Omni-Ref: Last frame ready! Click [➕ Attach Last Frame] to add.');
      }
    } finally {
      isProcessingOmniRef = false;
    }
  }

  async function triggerManualOmniRefAttachment() {
    try {
      showOmniRefToast('Omni-Ref: Grabbing last frame from video...');

      // 1. Discover target video source & poster in current chat
      let targetSource = null;
      let targetPoster = null;

      // 1a. Active DOM video elements (e.g. if drawer / player is currently open)
      const domVideos = Array.from(document.querySelectorAll('video')).filter(v => {
        const s = v.currentSrc || v.src || v.querySelector('source')?.src;
        return Boolean(s) || (v.videoWidth > 0);
      });
      if (domVideos.length > 0) {
        const lastEl = domVideos[domVideos.length - 1];
        targetSource = lastEl.currentSrc || lastEl.src || lastEl;
        targetPoster = lastEl.getAttribute('poster') || '';
      }

      // 1b. __ctb_vault__ bridge (Shared DOM bridge from Main world with direct API data)
      if (!targetSource) {
        try {
          const bridge = document.getElementById('__ctb_vault__');
          if (bridge) {
            const raw = bridge.getAttribute('data-videos') || bridge.textContent;
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list) && list.length > 0) {
                const lastItem = list[list.length - 1];
                if (lastItem?.url) {
                  targetSource = lastItem.url;
                  targetPoster = lastItem.poster_url || lastItem.poster || '';
                }
              }
            }
          }
        } catch (e) {}
      }

      // 1c. Comprehensive chat videos map (latest one in current chat)
      if (!targetSource) {
        const chatVideos = typeof getComprehensiveCurrentChatVideos === 'function' ? getComprehensiveCurrentChatVideos() : [];
        if (chatVideos && chatVideos.length > 0) {
          const lastVideo = chatVideos[chatVideos.length - 1];
          if (lastVideo?.url) {
            targetSource = lastVideo.url;
            targetPoster = lastVideo.poster_url || lastVideo.poster || '';
          }
        }
      }

      // 1d. window.__channaChatVideos / memory
      if (!targetSource && Array.isArray(window.__channaChatVideos) && window.__channaChatVideos.length > 0) {
        const last = window.__channaChatVideos[window.__channaChatVideos.length - 1];
        targetSource = last?.url;
        targetPoster = last?.poster_url || last?.poster || '';
      }

      // 1e. Processed videos cache
      if (!targetSource && processedVideos && processedVideos.size > 0) {
        targetSource = Array.from(processedVideos).pop();
      }

      // 1f. SessionStorage master videos
      if (!targetSource) {
        try {
          const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
          if (Array.isArray(stored) && stored.length > 0) {
            const last = stored[stored.length - 1];
            targetSource = last.url || last.src;
            targetPoster = last.poster_url || last.poster || '';
          }
        } catch (e) {}
      }

      if (!targetSource) {
        showOmniRefToast('Omni-Ref: No video found yet in this chat.');
        return { ok: false, message: 'No video found' };
      }

      // 2. Extract the last frame
      const file = await captureLastFrameFromVideo(targetSource, targetPoster);
      if (!file) {
        showOmniRefToast('Omni-Ref: Could not extract frame from video.');
        return { ok: false, message: 'Frame extraction failed' };
      }

      lastCapturedFrameFile = file;

      // 3. Attach to composer
      const staged = stageReferenceImageToComposer(file);
      if (staged) {
        showOmniRefToast('Omni-Ref: 1 Last frame attached for continuation!');
        return { ok: true, message: 'Attached last frame' };
      } else {
        showOmniRefToast('Omni-Ref: Frame ready, please click composer box.');
        return { ok: true, message: 'Frame ready' };
      }
    } catch (e) {
      console.warn('[Omni-Ref] Manual staging error:', e);
      return { ok: false, error: e?.message || String(e) };
    }
  }

  // 🎯 Universal ByteDance TOS Video Fingerprint Extractor (Eliminates Duplicate Downloads)
  function extractVideoFingerprint(url) {
    if (!url || typeof url !== 'string') return '';
    const clean = url.trim();
    if (clean.startsWith('blob:')) {
      const parts = clean.split('/');
      return 'blob_' + parts[parts.length - 1].toLowerCase();
    }

    // 1. Try to extract 32-character hexadecimal MD5 hash (ByteDance / Dola TOS object key)
    // Example: .../tos-alisg-v-64f990/44a4986b0ddd497ca9644988a543e334~tplv-obj.mp4
    const md5Match = clean.match(/\/([a-f0-9]{32})(?:[~.]|$)/i) || clean.match(/(?:^|[^a-f0-9])([a-f0-9]{32})(?:[^a-f0-9]|$)/i);
    if (md5Match && md5Match[1]) {
      return 'hash_' + md5Match[1].toLowerCase();
    }

    // 2. Try to extract TOS URI pattern: tos-xxx/yyyy
    const tosMatch = clean.match(/(tos-[a-z0-9-]+(?:\/[^/?#~]+)+)/i);
    if (tosMatch && tosMatch[1]) {
      return 'tos_' + tosMatch[1].replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '').toLowerCase();
    }

    // 3. Fallback to path without query parameters, without template suffix
    try {
      const u = new URL(clean);
      let p = u.pathname.replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '');
      return 'path_' + p.toLowerCase();
    } catch (e) {
      return 'raw_' + clean.split('?')[0].replace(/~tplv-[^/?#]+/g, '').toLowerCase();
    }
  }

  function getChatScopeKey(url, title) {
    if (typeof window !== 'undefined' && typeof window.__ctbGetChatScopeKey === 'function') {
      return window.__ctbGetChatScopeKey(url, title);
    }
    return 'chat_current';
  }

  // 📜 Chat History Auto-Scroller & Comprehensive Multi-Video Harvester
  function isValidChatScrollTarget(el) {
    if (!el) return false;
    if (el.closest && el.closest('#channa-prompt-dock, .channa-prompt-dock, #channa-bulk-mode-dock, #channa-accounts-dock-btn, #channa-accounts-quick-popover, #channa-actor-dock-btn, #channa-actor-quick-popover, [class*="sidebar"], [class*="drawer"]')) return false;
    if (el.id?.includes('prompt-dock') || el.id?.includes('bulk-mode-dock') || el.className?.includes?.('prompt-dock')) return false;
    return true;
  }

  function findChatScrollContainers() {
    const list = new Set();
    const selectors = [
      '[class*="v_list_scroller"]',
      '[class*="list_scroller"]',
      '[class*="chat_scroller"]',
      '.scroller',
      '[class*="message-list"]',
      '[class*="chat-content"]',
      'main [class*="overflow-y-auto"]',
      '[class*="overflow-y-auto"]',
      'main',
      'section[class*="chat"]',
      'div[role="feed"]',
      'div[role="region"]'
    ];
    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach(el => {
        if (isValidChatScrollTarget(el) && el.scrollHeight > el.clientHeight + 20) {
          list.add(el);
        }
      });
    }

    const messageNode = document.querySelector('[data-message-id], [class*="message-item"], [class*="chat-message"], video');
    if (messageNode) {
      let parent = messageNode.parentElement;
      while (parent && parent !== document.body) {
        if (isValidChatScrollTarget(parent)) {
          try {
            const s = window.getComputedStyle(parent);
            if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && parent.scrollHeight > parent.clientHeight + 20) {
              list.add(parent);
            }
          } catch (e) {}
        }
        parent = parent.parentElement;
      }
    }

    if (list.size === 0) {
      list.add(document.scrollingElement || document.documentElement || document.body);
    }
    return Array.from(list);
  }

  function findChatScrollContainer() {
    const containers = findChatScrollContainers();
    return containers[0] || document.scrollingElement || document.documentElement || document.body;
  }

  function extractChatIdFromUrl(url) {
    if (!url) return '';
    const clean = String(url).split('#')[0];
    const m = clean.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
    if (m && m[1] && m[1] !== 'new') return m[1];
    try {
      const u = new URL(clean);
      return u.searchParams.get('conversation_id') || u.searchParams.get('id') || u.searchParams.get('chat_id') || u.searchParams.get('session_id') || '';
    } catch (e) {
      return '';
    }
  }

  const allExtractedChatVideos = new Map();
  let lastActiveChatScope = typeof window !== 'undefined' ? getChatScopeKey(window.location.href, document.title) : '';
  let lastActiveChatUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  function checkChatNavigation() {
    try {
      if (typeof window === 'undefined') return;
      const currentUrl = window.location.href.split('#')[0];
      const newScope = getChatScopeKey(currentUrl, document.title);
      
      const urlChanged = lastActiveChatUrl && currentUrl !== lastActiveChatUrl;
      const scopeChanged = lastActiveChatScope && newScope && newScope !== lastActiveChatScope;

      if (urlChanged || scopeChanged) {
        console.log(`[ChannaTheBrand] 🔀 Chat navigation detected: [${lastActiveChatScope}] -> [${newScope}] (${currentUrl}). Resetting video registry.`);
        lastActiveChatUrl = currentUrl;
        lastActiveChatScope = newScope;

        if (isAutoScrolling) {
          stopContinuousAutoScrollChat(false);
        }

        allExtractedChatVideos.clear();
        if (window.__CTB_ACTIVE_CHAT_VIDEOS__ && window.__CTB_ACTIVE_CHAT_VIDEOS__.clear) {
          window.__CTB_ACTIVE_CHAT_VIDEOS__.clear();
        }

        window.postMessage({
          type: 'CHANNA_CHAT_NAVIGATION',
          newScope: newScope,
          url: currentUrl
        }, '*');

        if (typeof updateBulkDock === 'function') {
          updateBulkDock();
        }
      } else if (newScope && !lastActiveChatScope) {
        lastActiveChatScope = newScope;
        lastActiveChatUrl = currentUrl;
      }
    } catch (e) {}
  }

  // Fast interval (350ms) + SPA history event hooks for instant chat transition detection
  setInterval(checkChatNavigation, 350);
  window.addEventListener('popstate', () => setTimeout(checkChatNavigation, 50));
  try {
    const origPush = history.pushState;
    history.pushState = function(...args) {
      const ret = origPush.apply(this, args);
      setTimeout(checkChatNavigation, 50);
      return ret;
    };
    const origReplace = history.replaceState;
    history.replaceState = function(...args) {
      const ret = origReplace.apply(this, args);
      setTimeout(checkChatNavigation, 50);
      return ret;
    };
  } catch (e) {}

  function belongsToCurrentChat(item, currentUrl = window.location.href, currentTitle = document.title) {
    if (!item) return false;
    const rawUrl = typeof item === 'string' ? item : (item.url || item.src);
    if (!rawUrl || (!rawUrl.startsWith('http') && !rawUrl.startsWith('blob:'))) return false;

    // 1. Elements freshly harvested from the active DOM right now belong to current chat
    if (item.source === 'dom' || item.source === 'dom_video' || item.source === 'dom_link') {
      return true;
    }

    const currentScopeKey = getChatScopeKey(currentUrl, currentTitle);
    const currentCleanUrl = String(currentUrl || '').split('?')[0].split('#')[0].replace(/\/$/, '');
    const currentChatId = extractChatIdFromUrl(currentUrl);

    const itemChatId = extractChatIdFromUrl(item.pageUrl) ||
      (item.chatScopeKey && item.chatScopeKey.startsWith('chat_') && item.chatScopeKey !== 'chat_current' ? item.chatScopeKey.replace('chat_', '') : '');

    // 2. If both current chat and item have a concrete chat ID, they MUST match
    if (currentChatId && itemChatId) {
      return currentChatId === itemChatId;
    }

    // 3. If item has a concrete chat ID but current view has a different concrete chat ID -> reject
    if (currentChatId && itemChatId && currentChatId !== itemChatId) {
      return false;
    }

    // 4. If both have concrete chatScopeKey (not chat_current)
    if (item.chatScopeKey && item.chatScopeKey !== 'chat_current' && currentScopeKey !== 'chat_current') {
      return item.chatScopeKey === currentScopeKey;
    }

    // 5. If item has pageUrl
    if (item.pageUrl && currentUrl) {
      const pClean = String(item.pageUrl).split('?')[0].split('#')[0].replace(/\/$/, '');
      if (currentCleanUrl && pClean && pClean !== currentCleanUrl) {
        return false;
      }
    }

    // 6. If in a concrete chat, reject cached items with unknown origin
    if (currentChatId && !itemChatId) {
      return false;
    }

    return true;
  }

  function getComprehensiveCurrentChatVideos() {
    const scopeKey = getChatScopeKey(window.location.href, document.title);

    function addCandidate(rawUrl, rawTitle, source, pageUrl, origScope) {
      if (!rawUrl || typeof rawUrl !== 'string') return;
      const clean = rawUrl.trim();
      if (!clean.startsWith('http') && !clean.startsWith('blob:')) return;

      const fp = extractVideoFingerprint(clean);
      if (!fp) return;

      const item = {
        url: clean,
        title: (rawTitle || 'Dola Video').trim(),
        source: source || 'chat',
        pageUrl: pageUrl || window.location.href,
        chatScopeKey: origScope || scopeKey,
        fingerprint: fp
      };

      if (belongsToCurrentChat(item)) {
        if (allExtractedChatVideos.has(fp)) {
          const existing = allExtractedChatVideos.get(fp);
          // Prefer real http URL over blob URL
          if (existing?.url && !existing.url.startsWith('blob:') && clean.startsWith('blob:')) {
            return;
          }
        }
        allExtractedChatVideos.set(fp, item);
      }
    }

    // 1. Scan DOM elements
    harvestVideosFromDOM();

    // 2. Read from __ctb_vault__ bridge (Shared DOM Bridge from main world)
    try {
      const bridge = document.getElementById('__ctb_vault__');
      if (bridge) {
        const raw = bridge.getAttribute('data-videos') || bridge.textContent;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(v => {
              if (v && v.url) addCandidate(v.url, v.prompt || v.title || v.topicTitle, v.source || 'vault', v.pageUrl, v.chatScopeKey);
            });
          }
        }
      }
    } catch (e) {}

    // 3. Read from sessionStorage
    try {
      const storedRaw = sessionStorage.getItem('__CTB_MASTER_VIDEOS__');
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach(v => {
            if (v && v.url) addCandidate(v.url, v.prompt || v.title, v.source || 'session_storage', v.pageUrl, v.chatScopeKey);
          });
        }
      }
    } catch (e) {}

    // 4. Read from window.__CTB_ACTIVE_CHAT_VIDEOS__
    try {
      if (window.__CTB_ACTIVE_CHAT_VIDEOS__ && typeof window.__CTB_ACTIVE_CHAT_VIDEOS__.values === 'function') {
        Array.from(window.__CTB_ACTIVE_CHAT_VIDEOS__.values()).forEach(v => {
          if (v && v.url) addCandidate(v.url, v.prompt || v.title || v.topicTitle, v.source || 'memory', v.pageUrl, v.chatScopeKey);
        });
      }
    } catch (e) {}

    // 5. Read from window.__channaChatVideos
    try {
      if (Array.isArray(window.__channaChatVideos)) {
        window.__channaChatVideos.forEach(v => {
          if (v && v.url) addCandidate(v.url, v.prompt || v.title || v.topicTitle, v.source || 'extractor', v.pageUrl, v.chatScopeKey);
        });
      }
    } catch (e) {}

    // Filter deduplicated videos strictly belonging to current chat
    const filtered = [];
    const seen = new Set();
    for (const v of allExtractedChatVideos.values()) {
      if (v && v.url && belongsToCurrentChat(v)) {
        const fp = v.fingerprint || extractVideoFingerprint(v.url);
        if (fp && !seen.has(fp)) {
          seen.add(fp);
          filtered.push(v);
        }
      }
    }
    return filtered;
  }

  function harvestVideosFromDOM() {
    const scopeKey = getChatScopeKey(window.location.href, document.title);

    function add(url, title = 'Chat Video') {
      if (!url || typeof url !== 'string') return;
      let clean = url.trim();
      if (!clean.startsWith('http') && !clean.startsWith('blob:')) return;

      const fp = extractVideoFingerprint(clean);
      if (!fp) return;

      if (!allExtractedChatVideos.has(fp)) {
        const entry = {
          url: clean,
          title: (title || 'Chat Video').trim(),
          source: 'dom',
          pageUrl: window.location.href,
          chatScopeKey: scopeKey,
          fingerprint: fp
        };
        allExtractedChatVideos.set(fp, entry);
        try {
          let bridge = document.getElementById('__ctb_vault__');
          if (!bridge) {
            bridge = document.createElement('div');
            bridge.id = '__ctb_vault__';
            bridge.style.display = 'none';
            document.documentElement.appendChild(bridge);
          }
          bridge.setAttribute('data-content-videos', JSON.stringify(Array.from(allExtractedChatVideos.values())));
        } catch (e) {}
      }
    }

    // 1. Scan all <video> elements with deep attribute resolution
    document.querySelectorAll('video').forEach((v, i) => {
      // Never harvest from prompt dock preview or floating docks
      if (v.closest && v.closest('#channa-prompt-dock, .channa-prompt-dock, #channa-accounts-dock-btn, #channa-accounts-quick-popover, #channa-actor-dock-btn, #channa-actor-quick-popover')) return;

      const bubble = v.closest('[data-message-id], [class*="message"], [class*="chat"], [class*="bubble"]') || v.parentElement;
      const textEl = bubble ? bubble.querySelector('p, span, [class*="text"], [class*="content"]') : null;
      const promptText = (textEl?.textContent || '').trim().slice(0, 100);

      const candidates = [
        v.currentSrc,
        v.src,
        v.getAttribute('src'),
        v.getAttribute('data-src'),
        v.getAttribute('data-video-url'),
        v.getAttribute('data-url'),
        bubble?.getAttribute('data-video-url'),
        bubble?.getAttribute('data-src')
      ];
      v.querySelectorAll('source').forEach(s => candidates.push(s.src, s.getAttribute('src')));

      for (const cand of candidates) {
        if (cand && (cand.startsWith('http') || cand.startsWith('blob:'))) {
          add(cand, promptText || `Video_${i + 1}`);
        }
      }
    });

    // 2. Scan all data attributes & links
    document.querySelectorAll('a[href*=".mp4"], a[download*=".mp4"], a[href*="byteintl"], a[href*="ibytedtos"], [data-src*="http"], [data-video-url*="http"], [data-url*="http"], [data-src*="blob:"], [data-video-url*="blob:"]').forEach(el => {
      if (el.closest && el.closest('#channa-prompt-dock, .channa-prompt-dock, #channa-accounts-dock-btn, #channa-accounts-quick-popover, #channa-actor-dock-btn, #channa-actor-quick-popover')) return;
      const src = el.href || el.getAttribute('data-src') || el.getAttribute('data-video-url') || el.getAttribute('data-url');
      if (src && (src.startsWith('http') || src.startsWith('blob:'))) {
        add(src, 'Chat Video');
      }
    });

    // 3. Scan shared vault bridge directly into DOM scan
    try {
      const bridge = document.getElementById('__ctb_vault__');
      if (bridge) {
        const raw = bridge.getAttribute('data-videos') || bridge.textContent;
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach(v => {
              if (v && v.url) add(v.url, v.prompt || v.title || v.topicTitle);
            });
          }
        }
      }
    } catch (e) {}

    return Array.from(allExtractedChatVideos.values());
  }

  // 📜 Intelligent Fast Auto-Scroll Up Deep-Harvest Engine
  // Rapidly step-scrolls the chat container upwards so Dola AI virtual list triggers pagination fetch
  async function deepAutoScrollChatHarvest(maxSteps = 3, stepDelayMs = 140) {
    try {
      const container = findChatScrollContainer();
      if (!container) {
        harvestVideosFromDOM();
        return;
      }

      const isWindow = (!container || container === document.documentElement || container === document.body);
      const originalScrollTop = isWindow ? (window.scrollY || window.pageYOffset || 0) : (container.scrollTop || 0);

      harvestVideosFromDOM();

      let previousHeight = 0;
      for (let step = 0; step < maxSteps; step++) {
        // Step-scroll gently upwards rather than slamming to 0 instantly
        if (isWindow) {
          window.scrollBy(0, -window.innerHeight * 0.85);
        } else {
          container.scrollTop = Math.max(0, container.scrollTop - container.clientHeight * 0.85);
        }

        try {
          container.dispatchEvent(new Event('scroll', { bubbles: true }));
          window.dispatchEvent(new Event('scroll'));
        } catch (e) {}

        await new Promise(r => setTimeout(r, stepDelayMs));
        harvestVideosFromDOM();

        const currentHeight = container.scrollHeight || document.body.scrollHeight;
        const atTop = isWindow ? (window.scrollY === 0) : (container.scrollTop === 0);
        if (atTop || (currentHeight === previousHeight && step > 0)) {
          break;
        }
        previousHeight = currentHeight;
      }

      harvestVideosFromDOM();

      // Smoothly restore reading position
      try {
        if (isWindow) {
          window.scrollTo(0, originalScrollTop);
        } else {
          container.scrollTop = originalScrollTop;
        }
      } catch (e) {}
    } catch (err) {
      console.warn('[ChannaTheBrand Batch ZIP] Auto-scroll non-fatal error:', err);
    }
  }


  // ⚡ Cross-Tab Click Mirroring
  let isClickSyncArmed = false;
  let clickCaptureHandler = null;

  function armClickSync() {
    if (clickCaptureHandler) {
      window.removeEventListener('click', clickCaptureHandler, true);
    }

    isClickSyncArmed = true;
    showOmniRefToast('⚡ Mirror Mode Armed! Click Create Video to mirror across tabs.');

    clickCaptureHandler = (e) => {
      if (!isClickSyncArmed) return;
      const target = e.target && (e.target.closest('button, div[role="button"], a[role="button"]') || e.target);
      if (!target) return;

      isClickSyncArmed = false;
      window.removeEventListener('click', clickCaptureHandler, true);
      clickCaptureHandler = null;

      const btnText = (target.textContent || target.innerText || '').trim().substring(0, 40);
      const aria = target.getAttribute('aria-label') || '';
      const rect = target.getBoundingClientRect();

      chrome.runtime.sendMessage({
        type: 'BROADCAST_MIRRORED_CLICK',
        targetData: {
          text: btnText,
          ariaLabel: aria,
          xRatio: (rect.left + rect.width / 2) / window.innerWidth,
          yRatio: (rect.top + rect.height / 2) / window.innerHeight
        }
      });
      showOmniRefToast('⚡ Click Mirrored to all open Dola tabs!');
    };

    window.addEventListener('click', clickCaptureHandler, true);
    setTimeout(() => {
      if (isClickSyncArmed) {
        isClickSyncArmed = false;
        if (clickCaptureHandler) {
          window.removeEventListener('click', clickCaptureHandler, true);
          clickCaptureHandler = null;
        }
      }
    }, 10000);
  }

  function executeMirroredClick(targetData) {
    if (!targetData) return;
    let targetEl = null;

    if (targetData.text) {
      const candidates = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"]'));
      for (const c of candidates) {
        const txt = (c.textContent || c.innerText || '').trim();
        if (txt && (txt.toLowerCase() === targetData.text.toLowerCase() || txt.includes(targetData.text))) {
          targetEl = c;
          break;
        }
      }
    }

    if (!targetEl && targetData.ariaLabel) {
      try {
        targetEl = document.querySelector(`[aria-label="${CSS.escape(targetData.ariaLabel)}"]`);
      } catch (e) {}
    }

    if (!targetEl && targetData.xRatio !== undefined && targetData.yRatio !== undefined) {
      const x = targetData.xRatio * window.innerWidth;
      const y = targetData.yRatio * window.innerHeight;
      const pointEl = document.elementFromPoint(x, y);
      if (pointEl) {
        targetEl = pointEl.closest('button, div[role="button"], a[role="button"]') || pointEl;
      }
    }

    if (targetEl) {
      try {
        targetEl.focus({ preventScroll: true });
        ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtType => {
          targetEl.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
        });
        showOmniRefToast('⚡ Action Mirrored from master tab!');
      } catch (e) {}
    }
  }

  // Listen for manual trigger from popup button
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'OPEN_VIDEO_REF_MODAL') {
      window.dispatchEvent(new CustomEvent('CHANNA_OPEN_VIDEO_REF_MODAL'));
      window.postMessage({ type: 'CHANNA_OPEN_VIDEO_REF_MODAL' }, '*');
      sendResponse({ ok: true });
      return true;
    }
    if (message?.type === 'TRIGGER_STAGE_OMNI_REF') {
      triggerManualOmniRefAttachment().then(res => sendResponse(res));
      return true;
    }
    if (message?.type === 'ARM_CLICK_SYNC') {
      armClickSync();
      sendResponse({ ok: true });
      return true;
    }
    if (message?.type === 'EXECUTE_MIRRORED_CLICK') {
      executeMirroredClick(message.targetData);
      sendResponse({ ok: true });
      return true;
    }
    if (message?.type === 'FETCH_BLOB_BUFFER') {
      (async () => {
        try {
          const resp = await fetch(message.url);
          if (!resp.ok) throw new Error(`Blob fetch error ${resp.status}`);
          const buf = await resp.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = '';
          const chunk = 8192;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
          }
          sendResponse({ ok: true, base64: btoa(binary) });
        } catch (e) {
          sendResponse({ ok: false, error: e?.message || String(e) });
        }
      })();
      return true;
    }

    if (message?.type === 'GET_CHAT_VIDEOS_FOR_ZIP') {
      (async () => {
        try {
          const currentScopeKey = getChatScopeKey(window.location.href, document.title);

          // 1. Intelligent Fast Auto-Scroll if requested
          if (message?.autoScroll !== false) {
            await Promise.race([
              deepAutoScrollChatHarvest(3, 140),
              new Promise(r => setTimeout(r, 650))
            ]);
          }

          // 2. Request Main World Harvester (Vault + SessionStorage + React Fiber props)
          try {
            window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_FOR_ZIP' }, '*');
            window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_FOR_ZIP'));
            window.postMessage({ type: 'DOLA_GET_CHAT_MEDIA_REQUEST' }, '*');
            window.dispatchEvent(new CustomEvent('DOLA_GET_CHAT_MEDIA'));
          } catch (err) {}
          await new Promise(r => setTimeout(r, 250));

          const finalVideos = getComprehensiveCurrentChatVideos();
          console.log(`[ChannaTheBrand Batch ZIP] 🎯 Harvested ${finalVideos.length} unique videos strictly for chat [${currentScopeKey}].`);
          sendResponse({ ok: true, videos: finalVideos, chatScopeKey: currentScopeKey });
        } catch (err) {
          console.error('[ChannaTheBrand Batch ZIP] Harvest error:', err);
          sendResponse({ ok: false, error: err?.message || String(err) });
        }
      })();
      return true;
    }

    if (message?.type === 'CHANNA_VIDEO_ZIP_PROGRESS' || message?.type === 'CHANNA_VIDEO_ZIP_BUILD_PROGRESS') {
      updateZipOverlay(message);
      return;
    }

    if (message?.type === 'CHANNA_START_CHAT_SCROLL') {
      if (!isBulkModeActive) setBulkMode(true);
      startContinuousAutoScrollChat();
      return;
    }

    if (message?.type === 'CHANNA_SET_BULK_MODE') {
      setBulkMode(message.enabled);
      return;
    }

    if (message?.type === 'CHANNA_TRIGGER_BATCH_ZIP') {
      triggerChannaBulkZipDownload();
      return;
    }

    if (message?.type === 'CHANNA_RESET_CHAT_VIDEOS') {
      resetCurrentChatVideos();
      if (typeof sendResponse === 'function') sendResponse({ ok: true });
      return true;
    }
  });

  // ============================================================================
  // ⚡ CHANNA THE BRAND HIGH-SPEED PARALLEL VIDEO ZIP & IN-PAGE DOCK ENGINE
  // ============================================================================
  const ZIP_OVERLAY_ID = 'channa-video-zip-overlay';
  const MINI_BADGE_ID = 'channa-video-zip-minibadge';
  const BULK_DOCK_ID = 'channa-bulk-mode-dock';

  let overlayHideTimer = 0;
  let currentBuildId = '';
  let isCurrentDownloadPaused = false;
  let isAutoScrolling = false;
  let autoScrollTimer = null;
  let isBulkModeActive = false;

  function injectChannaZipStyles() {
    if (document.getElementById('channa-zip-styles')) return;
    const style = document.createElement('style');
    style.id = 'channa-zip-styles';
    style.textContent = `
      @keyframes channa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #channa-bulk-mode-dock {
        position: fixed !important;
        top: 64px !important;
        bottom: auto !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 2147483645 !important;
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 6px 14px !important;
        border-radius: 9999px !important;
        background: rgba(15, 23, 42, 0.94) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border: 1px solid rgba(129, 140, 248, 0.38) !important;
        box-shadow: 0 12px 36px -4px rgba(0, 0, 0, 0.65), 0 0 20px -2px rgba(99, 102, 241, 0.25) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        user-select: none !important;
        cursor: grab !important;
        white-space: nowrap !important;
        max-width: calc(100vw - 24px) !important;
        box-sizing: border-box !important;
        transition: box-shadow 0.2s ease, border-color 0.2s ease !important;
      }
      #channa-bulk-mode-dock:active {
        cursor: grabbing !important;
      }
      .channa-dock-icon {
        width: 28px !important;
        height: 28px !important;
        border-radius: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        flex-shrink: 0 !important;
      }
      .channa-dock-info {
        display: flex !important;
        flex-direction: column !important;
        gap: 1px !important;
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .channa-dock-title-row {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        white-space: nowrap !important;
        line-height: 1.2 !important;
      }
      .channa-dock-title {
        color: #f8fafc !important;
        font-weight: 700 !important;
        font-size: 12.5px !important;
        white-space: nowrap !important;
        letter-spacing: 0.2px !important;
      }
      .channa-dock-badge {
        background: rgba(99, 102, 241, 0.22) !important;
        color: #a5b4fc !important;
        padding: 1.5px 7px !important;
        border-radius: 10px !important;
        font-size: 11px !important;
        font-weight: 700 !important;
        border: 1px solid rgba(99, 102, 241, 0.4) !important;
        white-space: nowrap !important;
      }
      .channa-dock-sub {
        color: #94a3b8 !important;
        font-size: 11px !important;
        white-space: nowrap !important;
        line-height: 1.15 !important;
      }
      .channa-dock-actions {
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        flex-shrink: 0 !important;
        white-space: nowrap !important;
      }
      .channa-dock-btn {
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        padding: 6px 12px !important;
        border-radius: 9999px !important;
        font-family: inherit !important;
        font-size: 11.5px !important;
        font-weight: 650 !important;
        cursor: pointer !important;
        transition: all 0.18s ease !important;
        white-space: nowrap !important;
        line-height: 1.2 !important;
        border: none !important;
        outline: none !important;
        box-sizing: border-box !important;
      }
      .channa-dock-btn:hover {
        transform: translateY(-1px) scale(1.02) !important;
        opacity: 0.95 !important;
      }
      .channa-dock-btn:active {
        transform: translateY(0) scale(0.98) !important;
      }
      .channa-dock-btn-scroll {
        background: rgba(255, 255, 255, 0.08) !important;
        border: 1px solid rgba(255, 255, 255, 0.18) !important;
        color: #f1f5f9 !important;
      }
      .channa-dock-btn-scroll:hover {
        background: rgba(255, 255, 255, 0.14) !important;
        border-color: rgba(255, 255, 255, 0.3) !important;
      }
      .channa-dock-btn-reset {
        background: rgba(239, 68, 68, 0.12) !important;
        border: 1px solid rgba(239, 68, 68, 0.35) !important;
        color: #fca5a5 !important;
      }
      .channa-dock-btn-reset:hover {
        background: rgba(239, 68, 68, 0.22) !important;
        border-color: rgba(239, 68, 68, 0.55) !important;
        color: #fee2e2 !important;
      }
      .channa-dock-btn-download {
        background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
        border: 1px solid rgba(165, 180, 252, 0.4) !important;
        color: #ffffff !important;
        box-shadow: 0 2px 10px rgba(99, 102, 241, 0.45) !important;
      }
      .channa-dock-btn-download:hover {
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.6) !important;
      }
      .channa-dock-btn-close {
        background: rgba(255, 255, 255, 0.06) !important;
        border: 1px solid rgba(255, 255, 255, 0.12) !important;
        color: #94a3b8 !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        cursor: pointer !important;
        width: 24px !important;
        height: 24px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.2s ease !important;
        padding: 0 !important;
      }
      .channa-dock-btn-close:hover {
        color: #fca5a5 !important;
        background: rgba(239, 68, 68, 0.2) !important;
        border-color: rgba(239, 68, 68, 0.4) !important;
      }
      @media (max-width: 900px) {
        .channa-dock-sub { display: none !important; }
        #channa-bulk-mode-dock { gap: 8px !important; padding: 5px 10px !important; }
        .channa-dock-btn { padding: 5px 10px !important; font-size: 11px !important; }
      }
      @media (max-width: 680px) {
        .channa-dock-btn-scroll .channa-btn-text { font-size: 0 !important; }
        .channa-dock-btn-scroll .channa-btn-text::before { content: 'Scroll' !important; font-size: 11px !important; }
        .channa-dock-btn-download .channa-btn-text { font-size: 0 !important; }
        .channa-dock-btn-download .channa-btn-text::before { content: 'ZIP' !important; font-size: 11px !important; }
      }
      @media (max-width: 480px) {
        .channa-btn-text { display: none !important; }
        .channa-dock-btn { padding: 5px 8px !important; }
        .channa-dock-title { font-size: 11.5px !important; }
        .channa-dock-badge { font-size: 10px !important; padding: 1px 5px !important; }
      }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function formatBytes(value) {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) return '';
    if (bytes === 0) return '0.0 MB';
    if (bytes < 1024) return `${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function ensureMiniBadge() {
    let badge = document.getElementById(MINI_BADGE_ID);
    if (badge) return badge;

    badge = document.createElement('div');
    badge.id = MINI_BADGE_ID;
    badge.style.cssText = [
      'position:fixed',
      'bottom:24px',
      'right:24px',
      'z-index:2147483647',
      'display:none',
      'align-items:center',
      'gap:10px',
      'padding:10px 18px',
      'border-radius:30px',
      'background:rgba(17,24,39,0.95)',
      'backdrop-filter:blur(14px)',
      '-webkit-backdrop-filter:blur(14px)',
      'border:1px solid rgba(129,140,248,0.5)',
      'box-shadow:0 12px 36px rgba(0,0,0,0.55)',
      'color:#f8fafc',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer',
      'transition:all 0.2s ease',
      'user-select:none'
    ].join(';');

    badge.addEventListener('click', () => {
      const overlay = document.getElementById(ZIP_OVERLAY_ID);
      if (overlay) overlay.style.display = 'flex';
      badge.style.display = 'none';
    });

    badge.addEventListener('mouseenter', () => {
      badge.style.transform = 'scale(1.04)';
      badge.style.borderColor = '#818cf8';
    });
    badge.addEventListener('mouseleave', () => {
      badge.style.transform = 'scale(1)';
    });

    (document.body || document.documentElement).appendChild(badge);
    return badge;
  }

  function updateMiniBadge(progress = {}) {
    const badge = ensureMiniBadge();
    const percent = Math.round(Math.min(100, Math.max(0, Number(progress.percent) || 0)));
    const stage = progress.stage || 'downloading';
    if (stage === 'complete' || stage === 'error' || stage === 'cancelled') {
      badge.style.display = 'none';
      return;
    }
    const curMB = formatBytes(progress.currentBytes) || '0.0 MB';
    const totalMB = progress.currentTotal > 0 ? formatBytes(progress.currentTotal) : '';
    const sizePart = totalMB ? ` • ${curMB}/${totalMB}` : '';
    badge.innerHTML = `
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${progress.isPaused ? '#f59e0b' : '#6366f1'};box-shadow:0 0 8px ${progress.isPaused ? '#f59e0b' : '#6366f1'};"></span>
      <span>⚡ <b>ChannaTheBrand ZIP</b> ${progress.isPaused ? 'Paused' : (stage === 'packing' ? 'Packing' : 'Downloading')}: <b>${percent}%</b> (${progress.completed || 0}/${progress.total || 0})${sizePart}</span>
    `;
  }

  function ensureZipOverlay() {
    let overlay = document.getElementById(ZIP_OVERLAY_ID);
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = ZIP_OVERLAY_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = [
      'position:fixed',
      'inset:0',
      'z-index:2147483646',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'padding:20px',
      'background:rgba(15,23,42,0.78)',
      'backdrop-filter:blur(8px)',
      '-webkit-backdrop-filter:blur(8px)',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'user-select:none'
    ].join(';');

    const card = document.createElement('div');
    card.style.cssText = [
      'position:relative',
      'width:min(520px,100%)',
      'box-sizing:border-box',
      'padding:26px 28px',
      'border:1px solid rgba(129,140,248,0.45)',
      'border-radius:20px',
      'background:linear-gradient(145deg, #111827, #0f172a)',
      'color:#f8fafc',
      'box-shadow:0 24px 70px rgba(0,0,0,0.75)'
    ].join(';');
    overlay.appendChild(card);

    // Branding Badge Row
    const badgeRow = document.createElement('div');
    badgeRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;';
    card.appendChild(badgeRow);

    const brandPill = document.createElement('div');
    brandPill.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'padding:4px 12px',
      'border-radius:20px',
      'background:rgba(99,102,241,0.18)',
      'border:1px solid rgba(129,140,248,0.35)',
      'font-size:11.5px',
      'font-weight:600',
      'color:#c7d2fe',
      'letter-spacing:0.3px'
    ].join(';');
    brandPill.innerHTML = '<span style="color:#818cf8;margin-right:4px;">⚡</span> Bulk Downloader by <b>ChannaTheBrand</b>';
    badgeRow.appendChild(brandPill);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'channa-video-zip-close-btn';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Minimize overlay (Download continues in background)';
    closeBtn.style.cssText = [
      'background:rgba(255,255,255,0.08)',
      'border:none',
      'color:#94a3b8',
      'font-size:14px',
      'font-weight:bold',
      'width:28px',
      'height:28px',
      'border-radius:50%',
      'cursor:pointer',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'transition:all 0.2s ease'
    ].join(';');
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.18)';
      closeBtn.style.color = '#ffffff';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'rgba(255,255,255,0.08)';
      closeBtn.style.color = '#94a3b8';
    });
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
      const badge = ensureMiniBadge();
      badge.style.display = 'flex';
    });
    badgeRow.appendChild(closeBtn);

    // Title Row
    const title = document.createElement('div');
    title.id = 'channa-video-zip-title';
    title.textContent = 'Preparing video ZIP';
    title.style.cssText = 'font-size:21px;font-weight:750;line-height:1.25;margin-bottom:6px;color:#f8fafc;';
    card.appendChild(title);

    // Subtitle / Status
    const status = document.createElement('div');
    status.id = 'channa-video-zip-status';
    status.textContent = 'Starting parallel downloads (10 in parallel)...';
    status.style.cssText = 'font-size:14px;line-height:1.5;color:#cbd5e1;margin-bottom:16px;';
    card.appendChild(status);

    // Progress Bar Track
    const track = document.createElement('div');
    track.style.cssText = 'height:11px;overflow:hidden;border-radius:999px;background:#1e293b;border:1px solid rgba(255,255,255,0.05);';
    const bar = document.createElement('div');
    bar.id = 'channa-video-zip-progress';
    bar.style.cssText = 'width:0%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#6366f1,#a855f7);transition:width .2s ease;';
    track.appendChild(bar);
    card.appendChild(track);

    // Stats Row
    const statsRow = document.createElement('div');
    statsRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-top:8px;';
    const fileLabel = document.createElement('div');
    fileLabel.id = 'channa-video-zip-file';
    fileLabel.textContent = '10 Parallel Video Streams Active';
    fileLabel.style.cssText = 'font-size:12.5px;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:75%;';
    const percentLabel = document.createElement('div');
    percentLabel.id = 'channa-video-zip-percent';
    percentLabel.textContent = '0%';
    percentLabel.style.cssText = 'font-size:13.5px;font-weight:750;color:#a5b4fc;';
    statsRow.appendChild(fileLabel);
    statsRow.appendChild(percentLabel);
    card.appendChild(statsRow);

    // Actions Row
    const actionsRow = document.createElement('div');
    actionsRow.id = 'channa-video-zip-actions';
    actionsRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);';

    const pauseBtn = document.createElement('button');
    pauseBtn.id = 'channa-video-zip-pause-btn';
    pauseBtn.textContent = '⏸ Pause';
    pauseBtn.style.cssText = [
      'flex:1',
      'padding:8px 16px',
      'border-radius:10px',
      'border:1px solid rgba(129,140,248,0.4)',
      'background:rgba(99,102,241,0.15)',
      'color:#e0e7ff',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer',
      'transition:all 0.2s ease'
    ].join(';');
    pauseBtn.addEventListener('click', () => {
      isCurrentDownloadPaused = !isCurrentDownloadPaused;
      pauseBtn.textContent = isCurrentDownloadPaused ? '▶ Resume' : '⏸ Pause';
      pauseBtn.style.borderColor = isCurrentDownloadPaused ? 'rgba(245,158,11,0.5)' : 'rgba(129,140,248,0.4)';
      pauseBtn.style.background = isCurrentDownloadPaused ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)';
      pauseBtn.style.color = isCurrentDownloadPaused ? '#fde68a' : '#e0e7ff';
      chrome.runtime.sendMessage({
        type: isCurrentDownloadPaused ? 'CHANNA_PAUSE_VIDEO_ZIP' : 'CHANNA_RESUME_VIDEO_ZIP',
        buildId: currentBuildId
      }).catch(() => {});
    });
    actionsRow.appendChild(pauseBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'channa-video-zip-cancel-btn';
    cancelBtn.textContent = '✕ Cancel Download';
    cancelBtn.style.cssText = [
      'flex:1',
      'padding:8px 16px',
      'border-radius:10px',
      'border:1px solid rgba(239,68,68,0.4)',
      'background:rgba(239,68,68,0.12)',
      'color:#fca5a5',
      'font-size:13px',
      'font-weight:600',
      'cursor:pointer',
      'transition:all 0.2s ease'
    ].join(';');
    cancelBtn.addEventListener('click', () => {
      const buildIdToCancel = currentBuildId;
      chrome.runtime.sendMessage({
        type: 'CHANNA_CANCEL_VIDEO_ZIP',
        buildId: buildIdToCancel
      }).catch(() => {});

      clearTimeout(overlayHideTimer);
      overlay.remove();
      const badge = document.getElementById(MINI_BADGE_ID);
      if (badge) badge.remove();
    });
    actionsRow.appendChild(cancelBtn);
    card.appendChild(actionsRow);

    // Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'margin-top:14px;font-size:11.5px;line-height:1.45;color:#64748b;display:flex;align-items:center;justify-content:space-between;';
    footer.innerHTML = `
      <span style="color:#818cf8;font-weight:600;">⚡ ChannaTheBrand Pro</span>
      <span>ZIP auto-saves to Downloads</span>
    `;
    card.appendChild(footer);

    (document.body || document.documentElement).appendChild(overlay);
    return overlay;
  }

  let lastKnownZipProgress = {};

  function updateZipOverlay(incomingProgress = {}) {
    try {
      clearTimeout(overlayHideTimer);
      if (incomingProgress.buildId) currentBuildId = incomingProgress.buildId;

      // Keep previous fields so partial updates do not wipe total/bytes
      const progress = { ...lastKnownZipProgress, ...incomingProgress };
      lastKnownZipProgress = progress;

      const overlay = ensureZipOverlay();
      overlay.style.display = 'flex';
      const badge = document.getElementById(MINI_BADGE_ID);
      if (badge) badge.style.display = 'none';

      const stage = String(progress.stage || 'downloading');
      const total = Math.max(0, Number(progress.total) || 0);
      const completed = Math.min(total, Math.max(0, Number(progress.completed) || 0));
      const percent = Math.min(100, Math.max(0, Number(progress.percent) || 0));
      const currentBytes = Number(progress.currentBytes) || 0;
      const currentTotal = Number(progress.currentTotal) || 0;

      const status = overlay.querySelector('#channa-video-zip-status');
      const bar = overlay.querySelector('#channa-video-zip-progress');
      const percentLabel = overlay.querySelector('#channa-video-zip-percent');
      const fileLabel = overlay.querySelector('#channa-video-zip-file');
      const title = overlay.querySelector('#channa-video-zip-title');
      const actions = overlay.querySelector('#channa-video-zip-actions');
      const pauseBtn = overlay.querySelector('#channa-video-zip-pause-btn');

      if (progress.isPaused !== undefined && pauseBtn) {
        isCurrentDownloadPaused = Boolean(progress.isPaused);
        pauseBtn.textContent = isCurrentDownloadPaused ? '▶ Resume' : '⏸ Pause';
        pauseBtn.style.borderColor = isCurrentDownloadPaused ? 'rgba(245,158,11,0.5)' : 'rgba(129,140,248,0.4)';
        pauseBtn.style.background = isCurrentDownloadPaused ? 'rgba(245,158,11,0.2)' : 'rgba(99,102,241,0.15)';
        pauseBtn.style.color = isCurrentDownloadPaused ? '#fde68a' : '#e0e7ff';
      }

      const curMB = formatBytes(currentBytes) || '0.0 MB';
      const totalMB = currentTotal > 0 ? formatBytes(currentTotal) : '';
      const displayPercent = Math.min(100, Math.max(0, Math.round(percent)));

      let statusText = '';
      if (stage === 'complete') {
        statusText = `ZIP download completed! (${total} videos • ${totalMB || curMB} saved)`;
      } else if (stage === 'packing') {
        statusText = `All ${total} videos downloaded (${totalMB || curMB})! Assembling ZIP archive...`;
      } else if (stage === 'saving') {
        statusText = `ZIP archive ready (${totalMB || curMB}). Saving to Downloads...`;
      } else if (progress.isPaused) {
        statusText = `⏸ Paused: ${curMB}${totalMB ? ' of ' + totalMB : ''} (${completed}/${total} videos • ${displayPercent}%)`;
      } else if (stage === 'error') {
        statusText = progress.error || 'ZIP download could not be completed.';
      } else if (stage === 'cancelled') {
        statusText = 'ZIP download was cancelled.';
      } else {
        // Active downloading stage:
        if (totalMB) {
          statusText = `${curMB} of ${totalMB} downloaded (${completed}/${total} videos • ${displayPercent}%)`;
        } else if (currentBytes > 0) {
          statusText = `${curMB} downloaded (${completed}/${total} videos • ${displayPercent}%)`;
        } else {
          statusText = `Starting parallel downloads (${completed}/${total} videos • 0%)`;
        }
      }

      if (title) {
        if (stage === 'complete') {
          title.textContent = '✅ Video ZIP Ready!';
        } else if (stage === 'packing' || stage === 'saving') {
          title.textContent = '📦 Assembling ZIP Archive...';
        } else if (stage === 'error') {
          title.textContent = '❌ ZIP Download Failed';
        } else if (progress.isPaused) {
          title.textContent = `⏸ Paused (${completed}/${total})`;
        } else if (total > 0) {
          title.textContent = `Downloading Videos (${completed}/${total})`;
        } else {
          title.textContent = 'Preparing video ZIP';
        }
      }

      if (status) status.textContent = statusText;
      if (bar) {
        bar.style.width = `${displayPercent}%`;
        if (stage === 'complete') {
          bar.style.background = '#22c55e';
        } else if (stage === 'error') {
          bar.style.background = '#ef4444';
        } else {
          bar.style.background = 'linear-gradient(90deg,#6366f1,#a855f7)';
        }
      }
      if (percentLabel) percentLabel.textContent = `${displayPercent}%`;

      if (fileLabel) {
        if (stage === 'packing') {
          fileLabel.textContent = `Packing ${total} streams into ZIP archive...`;
        } else if (stage === 'saving') {
          fileLabel.textContent = `Writing ZIP archive to Downloads folder...`;
        } else if (stage === 'complete') {
          fileLabel.textContent = `All ${total} files successfully archived`;
        } else if (totalMB) {
          fileLabel.textContent = `Downloading streams — ${curMB} / ${totalMB} (${completed}/${total} done)`;
        } else {
          fileLabel.textContent = `${completed}/${total} videos done • Active parallel streams`;
        }
      }

      updateMiniBadge(progress);

      if (stage === 'complete') {
        if (actions) actions.style.display = 'none';
        overlayHideTimer = setTimeout(() => {
          overlay.remove();
          const b = document.getElementById(MINI_BADGE_ID);
          if (b) b.remove();
          lastKnownZipProgress = {};
        }, 2500);
      } else if (stage === 'error' || stage === 'cancelled') {
        if (stage === 'cancelled') {
          overlay.remove();
          const b = document.getElementById(MINI_BADGE_ID);
          if (b) b.remove();
          lastKnownZipProgress = {};
          return;
        }
        if (title) title.textContent = 'ZIP Download Failed';
        if (actions) actions.style.display = 'none';
        overlayHideTimer = setTimeout(() => {
          overlay.remove();
          const b = document.getElementById(MINI_BADGE_ID);
          if (b) b.remove();
          lastKnownZipProgress = {};
        }, 4000);
      }
    } catch (e) {}
  }

  let dockCustomPos = null;
  function makeDockDraggable(dock) {
    if (!dock || dock._hasDragHandler) return;
    dock._hasDragHandler = true;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    dock.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, input, a')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = dock.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      dock.style.transform = 'none';
      dock.style.left = initialLeft + 'px';
      dock.style.top = initialTop + 'px';
      dock.style.bottom = 'auto';
      dock.style.right = 'auto';
      dock.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = Math.max(10, Math.min(window.innerWidth - dock.offsetWidth - 10, initialLeft + dx));
      const newTop = Math.max(10, Math.min(window.innerHeight - dock.offsetHeight - 10, initialTop + dy));
      dock.style.left = newLeft + 'px';
      dock.style.top = newTop + 'px';
      dockCustomPos = { left: newLeft, top: newTop };
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        dock.style.cursor = 'grab';
      }
    });
  }

  function resetCurrentChatVideos() {
    try {
      if (isAutoScrolling) {
        stopContinuousAutoScrollChat(false);
      }

      const currentCleanUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, '');
      const currentScopeKey = getChatScopeKey(window.location.href, document.title);
      const currentChatId = extractChatIdFromUrl(window.location.href);

      // 1. Clear in-memory Map in content script
      allExtractedChatVideos.clear();
      if (window.__CTB_ACTIVE_CHAT_VIDEOS__ && window.__CTB_ACTIVE_CHAT_VIDEOS__.clear) {
        window.__CTB_ACTIVE_CHAT_VIDEOS__.clear();
      }
      if (Array.isArray(window.__channaChatVideos)) {
        window.__channaChatVideos = window.__channaChatVideos.filter(v => !belongsToCurrentChat(v));
      }

      // 2. Filter sessionStorage
      try {
        const storedRaw = sessionStorage.getItem('__CTB_MASTER_VIDEOS__');
        if (storedRaw) {
          const parsed = JSON.parse(storedRaw);
          if (Array.isArray(parsed)) {
            const remaining = parsed.filter(v => !belongsToCurrentChat(v));
            sessionStorage.setItem('__CTB_MASTER_VIDEOS__', JSON.stringify(remaining));
          }
        }
      } catch (e) {}

      // 3. Filter __ctb_vault__ DOM bridge
      try {
        const bridge = document.getElementById('__ctb_vault__');
        if (bridge) {
          const raw = bridge.getAttribute('data-videos') || bridge.textContent;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const remaining = parsed.filter(v => !belongsToCurrentChat(v));
              bridge.setAttribute('data-videos', JSON.stringify(remaining));
            }
          }
        }
      } catch (e) {}

      // 4. Tell main world (inject.js) to reset extracted videos for this chat
      window.postMessage({
        type: 'CHANNA_RESET_CHAT_VIDEOS',
        chatScopeKey: currentScopeKey,
        pageUrl: currentCleanUrl,
        chatId: currentChatId
      }, '*');

      // 5. Tell background service worker to purge session storage for this chat
      chrome.runtime.sendMessage({
        type: 'PURGE_CHAT_SESSION_VIDEOS',
        chatScopeKey: currentScopeKey,
        pageUrl: currentCleanUrl,
        chatId: currentChatId
      }).catch(() => {});

      // 6. Update Bulk Dock UI
      updateBulkDock();

      // 7. Show confirmation toast
      showDownloadToast('Chat videos registry reset', 'Extracted: 0');
      console.log(`[ChannaTheBrand] 🔄 Reset extracted videos for chat [${currentScopeKey}].`);
    } catch (err) {
      console.warn('[ChannaTheBrand] Reset chat videos notice:', err);
    }
  }

  function updateBulkDock(completed = false) {
    let dock = document.getElementById(BULK_DOCK_ID);
    if (!isBulkModeActive && !window.__ctbIsBulkModeActive && !isBulkModeActiveLocal) {
      if (dock) dock.remove();
      return;
    }

    injectChannaZipStyles();
    const videos = getComprehensiveCurrentChatVideos();
    const count = videos.length;

    if (!dock) {
      dock = document.createElement('div');
      dock.id = BULK_DOCK_ID;
      (document.body || document.documentElement).appendChild(dock);
    } else if (document.body && dock.parentNode !== document.body) {
      document.body.appendChild(dock);
    }

    makeDockDraggable(dock);
    if (dockCustomPos) {
      dock.style.transform = 'none';
      dock.style.left = dockCustomPos.left + 'px';
      dock.style.top = dockCustomPos.top + 'px';
      dock.style.bottom = 'auto';
      dock.style.right = 'auto';
    }

    dock.style.display = 'flex';

    if (isAutoScrolling) {
      dock.innerHTML = `
        <div class="channa-dock-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 0 10px rgba(99,102,241,0.5);">
          <span style="animation:channa-spin 1s linear infinite;display:inline-block;">🔄</span>
        </div>
        <div class="channa-dock-info">
          <div class="channa-dock-title-row">
            <span class="channa-dock-title" style="color:#93c5fd;">Auto-Scrolling...</span>
            <span class="channa-dock-badge"><b>${count}</b> Extracted</span>
          </div>
          <span class="channa-dock-sub">Loading past chat messages</span>
        </div>
        <div class="channa-dock-actions">
          <button id="channa-dock-stop-btn" class="channa-dock-btn" style="background:rgba(239,68,68,0.22);border:1px solid rgba(239,68,68,0.6);color:#fca5a5;">
            <span class="channa-btn-icon">⏹</span>
            <span class="channa-btn-text">Stop</span>
          </button>
        </div>
      `;

      const stopBtn = dock.querySelector('#channa-dock-stop-btn');
      if (stopBtn) {
        stopBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          stopContinuousAutoScrollChat(false);
        });
      }
      return;
    }

    if (completed) {
      dock.innerHTML = `
        <div class="channa-dock-icon" style="background:linear-gradient(135deg,#10b981,#059669);box-shadow:0 0 10px rgba(16,185,129,0.5);">
          ✅
        </div>
        <div class="channa-dock-info">
          <div class="channa-dock-title-row">
            <span class="channa-dock-title" style="color:#86efac;">All Videos Ready</span>
            <span class="channa-dock-badge" style="background:rgba(16,185,129,0.2);border-color:rgba(16,185,129,0.4);color:#a7f3d0;"><b>${count}</b> Ready</span>
          </div>
          <span class="channa-dock-sub">Unwatermarked 1080P videos</span>
        </div>
        <div class="channa-dock-actions">
          <button id="channa-dock-reset-btn" class="channa-dock-btn channa-dock-btn-reset" title="Forget and reset extracted videos for this chat">
            <span class="channa-btn-icon">🔄</span>
            <span class="channa-btn-text">Reset</span>
          </button>
          <button id="channa-dock-download-btn" class="channa-dock-btn channa-dock-btn-download" title="Compile and download all extracted videos as ZIP">
            <span class="channa-btn-icon">📦</span>
            <span class="channa-btn-text">Download All</span>
            <span class="channa-btn-count">(${count})</span>
          </button>
          <button id="channa-dock-close-btn" class="channa-dock-btn-close" title="Turn off Bulk Mode">✕</button>
        </div>
      `;
    } else {
      dock.innerHTML = `
        <div class="channa-dock-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 0 10px rgba(99,102,241,0.5);">
          ⚡
        </div>
        <div class="channa-dock-info">
          <div class="channa-dock-title-row">
            <span class="channa-dock-title">Bulk Mode</span>
            <span class="channa-dock-badge"><b>${count}</b> Extracted</span>
          </div>
          <span class="channa-dock-sub">Auto-download paused</span>
        </div>
        <div class="channa-dock-actions">
          <button id="channa-dock-scroll-btn" class="channa-dock-btn channa-dock-btn-scroll" title="Auto-scroll upwards to extract past videos">
            <span class="channa-btn-icon">📜</span>
            <span class="channa-btn-text">Auto-Scroll</span>
          </button>
          <button id="channa-dock-reset-btn" class="channa-dock-btn channa-dock-btn-reset" title="Forget and reset extracted videos for this chat">
            <span class="channa-btn-icon">🔄</span>
            <span class="channa-btn-text">Reset</span>
          </button>
          <button id="channa-dock-download-btn" class="channa-dock-btn channa-dock-btn-download" title="Compile and download all extracted videos as ZIP">
            <span class="channa-btn-icon">📦</span>
            <span class="channa-btn-text">Download ZIP</span>
            <span class="channa-btn-count">(${count})</span>
          </button>
          <button id="channa-dock-close-btn" class="channa-dock-btn-close" title="Turn off Bulk Mode">✕</button>
        </div>
      `;
    }

    const scrollBtn = dock.querySelector('#channa-dock-scroll-btn');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        startContinuousAutoScrollChat();
      });
    }

    const resetBtn = dock.querySelector('#channa-dock-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetCurrentChatVideos();
      });
    }

    const dlBtn = dock.querySelector('#channa-dock-download-btn');
    if (dlBtn) {
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerChannaBulkZipDownload();
      });
    }

    const closeBtn = dock.querySelector('#channa-dock-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setBulkMode(false);
      });
    }
  }

  function startContinuousAutoScrollChat() {
    if (isAutoScrolling) {
      stopContinuousAutoScrollChat(false);
      return;
    }

    isAutoScrolling = true;
    updateBulkDock();

    let unchangedCount = 0;
    let lastKnownCount = getComprehensiveCurrentChatVideos().length;
    let iterations = 0;

    if (autoScrollTimer) clearInterval(autoScrollTimer);
    autoScrollTimer = setInterval(() => {
      if (!isAutoScrolling) {
        clearInterval(autoScrollTimer);
        autoScrollTimer = null;
        return;
      }

      iterations++;
      const containers = findChatScrollContainers();

      try {
        // Dispatch custom events to trigger main world media extraction
        window.postMessage({ type: 'DOLA_GET_CHAT_MEDIA_REQUEST' }, '*');
        window.dispatchEvent(new CustomEvent('DOLA_GET_CHAT_MEDIA'));
        window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_FOR_ZIP' }, '*');
        window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_FOR_ZIP'));

        // Scroll all candidate containers upwards
        for (const container of containers) {
          if (container === window || container === document.body || container === document.documentElement) {
            window.scrollBy({ top: -Math.max(500, window.innerHeight * 0.8), behavior: 'smooth' });
            if (window.scrollY <= 25) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            window.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, bubbles: true, cancelable: true }));
            window.dispatchEvent(new Event('scroll'));
          } else if (container) {
            container.scrollBy({ top: -Math.max(500, container.clientHeight * 0.8), behavior: 'smooth' });
            if (container.scrollTop <= 25) {
              container.scrollTop = 0;
            }
            container.dispatchEvent(new WheelEvent('wheel', { deltaY: -500, bubbles: true, cancelable: true }));
            container.dispatchEvent(new Event('scroll', { bubbles: true }));
          }

          const firstEl = container?.firstElementChild?.firstElementChild || container?.firstElementChild;
          if (firstEl && typeof firstEl.scrollIntoView === 'function') {
            firstEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      } catch (e) {}

      // Comprehensive multi-source harvest on every step
      const currentVideos = getComprehensiveCurrentChatVideos();
      const currentCount = currentVideos.length;

      if (currentCount > lastKnownCount) {
        lastKnownCount = currentCount;
        unchangedCount = 0;
      } else {
        unchangedCount++;
      }

      updateBulkDock();

      // Give ample time for network pagination responses (16 steps ~ 11 seconds of quiet, or 90 max iterations)
      if (unchangedCount >= 16 || iterations >= 90) {
        stopContinuousAutoScrollChat(true);
      }
    }, 650);
  }

  function stopContinuousAutoScrollChat(completed = false) {
    isAutoScrolling = false;
    if (autoScrollTimer) {
      clearInterval(autoScrollTimer);
      autoScrollTimer = null;
    }
    updateBulkDock(completed);
  }

  async function triggerChannaBulkZipDownload() {
    const scopeKey = getChatScopeKey(window.location.href, document.title);
    let videos = getComprehensiveCurrentChatVideos();

    if (videos.length === 0) {
      // One quick non-blocking harvest attempt
      await deepAutoScrollChatHarvest(2, 100);
      videos = getComprehensiveCurrentChatVideos();
    }

    if (videos.length === 0) {
      alert('No videos extracted yet for this chat. Click "Auto-Scroll Chat" to load past videos first!');
      return;
    }

    // Prioritize real HTTP/HTTPS video targets for ZIP compilation
    const validHttpVideos = videos.filter(v => v && v.url && v.url.startsWith('http'));
    if (validHttpVideos.length > 0) {
      videos = validHttpVideos;
    }

    try {
      updateZipOverlay({
        stage: 'starting',
        completed: 0,
        total: videos.length,
        percent: 0
      });

      const resp = await chrome.runtime.sendMessage({
        type: 'CHANNA_RAW_VIDEO_BATCH_DOWNLOAD',
        pageUrl: window.location.href,
        videos,
        chatScopeKey: scopeKey
      });

      if (!resp?.ok) {
        updateZipOverlay({
          stage: 'error',
          error: resp?.error || resp?.reason || 'Failed to start ZIP compilation'
        });
      }
    } catch (err) {
      updateZipOverlay({
        stage: 'error',
        error: err?.message || String(err)
      });
    }
  }

  function setBulkMode(enabled) {
    isBulkModeActive = Boolean(enabled);
    isBulkModeActiveLocal = isBulkModeActive;
    window.__ctbIsBulkModeActive = isBulkModeActive;
    try {
      chrome.storage.local.set({ channa_bulk_mode: isBulkModeActive });
    } catch (e) {}
    updateBulkDock();
  }

  try {
    chrome.storage.local.get(['channa_bulk_mode'], res => {
      isBulkModeActive = Boolean(res?.channa_bulk_mode);
      isBulkModeActiveLocal = isBulkModeActive;
      window.__ctbIsBulkModeActive = isBulkModeActive;
      if (isBulkModeActive) updateBulkDock();
    });
  } catch (e) {}

  chrome.storage.onChanged.addListener((changes, area) => {
    if (changes.channa_bulk_mode !== undefined) {
      isBulkModeActive = Boolean(changes.channa_bulk_mode.newValue);
      isBulkModeActiveLocal = isBulkModeActive;
      window.__ctbIsBulkModeActive = isBulkModeActive;
      updateBulkDock();
    }
  });

  setInterval(() => {
    if (isBulkModeActive) {
      updateBulkDock();
    }
  }, 1200);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectChannaZipStyles();
      if (isBulkModeActive) updateBulkDock();
    });
  } else {
    injectChannaZipStyles();
    if (isBulkModeActive) updateBulkDock();
  }

  // Hook into video completion event (Single Unified Trigger with Clean URL Deduplication)
  window.addEventListener('DOLA_VIDEO_EXTRACTED', (e) => {
    const detail = e.detail || {};
    const videoUrl = detail.url || detail.videoUrl;
    if (!videoUrl) return;

    const cleanUrl = videoUrl.split('?')[0];
    const scopeKey = getChatScopeKey(window.location.href, document.title);
    const fp = extractVideoFingerprint(videoUrl);

    if (fp) {
      const entry = {
        url: videoUrl,
        title: detail.prompt || detail.title || detail.topicTitle || 'Dola Video',
        source: detail.source || 'fallback_api',
        pageUrl: window.location.href,
        chatScopeKey: detail.chatScopeKey || scopeKey,
        fingerprint: fp
      };
      try {
        window.__CTB_ACTIVE_CHAT_VIDEOS__ = window.__CTB_ACTIVE_CHAT_VIDEOS__ || new Map();
        window.__CTB_ACTIVE_CHAT_VIDEOS__.set(fp, entry);
      } catch (err) {}
      allExtractedChatVideos.set(fp, entry);
    }

    if (isBulkModeActive) {
      updateBulkDock();
    }

    if (processedVideos.has(cleanUrl)) {
      return;
    }
    processedVideos.add(cleanUrl);
    handleSingleVideoCompletion(videoUrl, detail.title || detail.topicTitle || '');
  });

  // Reset staging lock when user submits a new prompt
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      setTimeout(() => {
        omniRefStagedForCurrentSession = false;
        lastCapturedFrameFile = null;
        window.__CTB_OMNI_STAGING_LOCK__ = 0;
      }, 1000);
    }
  }, true);

  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest && e.target.closest('button[type="submit"], button[aria-label*="send"], button[class*="send"]');
    if (btn) {
      setTimeout(() => {
        omniRefStagedForCurrentSession = false;
        lastCapturedFrameFile = null;
        window.__CTB_OMNI_STAGING_LOCK__ = 0;
      }, 1000);
    }
  }, true);

  console.log('[ChannaTheBrand Pro] 🎬 Omni-Ref Last-Frame Continuation Active (Strict Single-Attachment On-Demand).');
})();

// ============================================================================
// 🎭 ACTOR VAULT: CONTENT SCRIPT STAGING & ATTACHMENT ENGINE (MUKAMMAL)
// 🎬 & VIDEO REF WASM / BLOB BRIDGES
// ============================================================================
(() => {
  'use strict';

  // WASM URL attribute injection for Main World access
  try {
    const wasmUrl = chrome.runtime.getURL('hevc-decode.wasm');
    document.documentElement.setAttribute('data-channa-wasm-url', wasmUrl);
  } catch (e) {}

  let cachedActorVault = null;

  // Load vault initially
  chrome.storage.local.get(['ctb_character_vault'], (res) => {
    if (res?.ctb_character_vault) {
      cachedActorVault = res.ctb_character_vault;
      broadcastActorVault();
    }
  });

  function broadcastActorVault() {
    if (!cachedActorVault) return;
    window.postMessage({ type: 'CTB_SYNC_ACTOR_VAULT_PAYLOAD', vault: cachedActorVault }, '*');
  }

  function applyCharacterDna(promptText) {
    if (!promptText || typeof promptText !== 'string') return promptText;
    if (!cachedActorVault || !cachedActorVault.activeCharacterId || cachedActorVault.autoInjectDNA === false) {
      return promptText;
    }
    const actor = (cachedActorVault.characters || []).find(c => c.id === cachedActorVault.activeCharacterId);
    if (!actor || !actor.dnaTokens) return promptText;

    const dna = actor.dnaTokens.trim();
    if (!dna || promptText.includes(dna) || (actor.name && promptText.toLowerCase().includes(actor.name.toLowerCase()))) {
      return promptText;
    }
    return `[Character DNA: ${dna}] ${promptText.trim()}`;
  }

  function findDolaComposerGlobal() {
    return (typeof window !== 'undefined' && typeof window.findDolaComposerGlobal === 'function') ? window.findDolaComposerGlobal() : null;
  }
  function injectPromptIntoComposerGlobal(text, opts) {
    return (typeof window !== 'undefined' && typeof window.injectPromptIntoComposerGlobal === 'function') ? window.injectPromptIntoComposerGlobal(text, opts) : false;
  }
  function stageReferenceImageToComposer(file, opts) {
    return (typeof window !== 'undefined' && typeof window.__CTB_stageReferenceImageToComposer === 'function') ? window.__CTB_stageReferenceImageToComposer(file, opts) : false;
  }

  let lastActorStagedId = '';
  let lastActorStagedTime = 0;

  // Window bridge listener
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'CTB_REQUEST_ACCOUNTS_SYNC') {
      try {
        if (typeof broadcastAccounts === 'function') {
          broadcastAccounts();
        } else {
          chrome.storage.local.get(['multi_profiles', 'active_profile_name'], (data) => {
            const profiles = data?.multi_profiles || {};
            const sanitizedProfiles = {};
            for (const [name, prof] of Object.entries(profiles)) {
              sanitizedProfiles[name] = {
                name: prof?.name || name,
                count: Array.isArray(prof?.cookies) ? prof.cookies.length : (prof?.count || 0),
                date: prof?.date || '',
                color: prof?.color || '#059669',
                lastUsed: prof?.lastUsed || null
              };
            }
            window.postMessage({
              type: 'CTB_SYNC_ACCOUNTS_PAYLOAD',
              profiles: sanitizedProfiles,
              activeProfile: data?.active_profile_name || ''
            }, '*');
          });
        }
      } catch (err) {}
    }
    if (e.data?.type === 'CTB_SWITCH_ACCOUNT_PROFILE' && e.data.profileName) {
      console.log('[ChannaTheBrand Pro] 🔄 Dock Switch Account triggered for:', e.data.profileName);
      chrome.runtime.sendMessage({
        action: 'SWITCH_ACCOUNT',
        profileName: e.data.profileName
      }, (resp) => {
        if (chrome.runtime.lastError) {
          console.warn('[ChannaTheBrand Pro] Switch account error:', chrome.runtime.lastError);
        } else {
          console.log('[ChannaTheBrand Pro] Switch account response:', resp);
        }
      });
    }
    if (e.data?.type === 'CTB_REQUEST_ACTOR_VAULT') {
      broadcastActorVault();
    }
    if (e.data?.type === 'CTB_SET_ACTIVE_ACTOR' && e.data.characterId) {
      chrome.storage.local.get(['ctb_character_vault'], (res) => {
        const vault = res?.ctb_character_vault || { characters: [], activeCharacterId: null };
        vault.activeCharacterId = e.data.characterId;
        chrome.storage.local.set({ ctb_character_vault: vault }, () => {
          cachedActorVault = vault;
          broadcastActorVault();
        });
      });
    }
    if (e.data?.type === 'STAGE_CHARACTER_ACTOR' && e.data.actor) {
      const actor = e.data.actor;
      const now = Date.now();
      if (actor?.id && actor.id === lastActorStagedId && (now - lastActorStagedTime) < 1200) {
        return;
      }
      lastActorStagedTime = now;
      lastActorStagedId = actor?.id || '';
      if (actor.avatarUrl && actor.avatarUrl.startsWith('data:image')) {
        try {
          const arr = actor.avatarUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          const safeName = (actor.name || 'actor').replace(/[^a-zA-Z0-9_-]/g, '_');
          const file = new File([u8arr], `${safeName}_reference.jpg`, { type: mime });
          stageReferenceImageToComposer(file, { purge: false });
        } catch (err) {}
      }
      if (actor.dnaTokens) {
        setTimeout(() => {
          const comp = findDolaComposerGlobal();
          if (comp) {
            const existing = comp.value || comp.textContent || '';
            if (!existing.includes(actor.dnaTokens)) {
              injectPromptIntoComposerGlobal(existing ? `${existing} [Character DNA: ${actor.dnaTokens}]` : `[Character DNA: ${actor.dnaTokens}] `);
            }
          }
        }, 250);
      }
    }

    // Modal se stitched storyboard image payload ko Dola composer me attach karein
    if (e.data?.type === 'STAGE_VIDEO_REF_PAYLOAD') {
      try {
        if (!e.data.alreadyStaged && e.data.fileDataUrl) {
          const arr = e.data.fileDataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) u8arr[n] = bstr.charCodeAt(n);
          const fileName = e.data.fileName || 'video_motion_reference.jpg';
          const file = new File([u8arr], fileName, { type: mime });

          stageReferenceImageToComposer(file);
        }

        // Motion choreograph prompt guide inject karein (strictly bypass Character DNA)
        if (e.data.promptGuide) {
          setTimeout(() => {
            const comp = findDolaComposerGlobal();
            if (comp) {
              const guide = e.data.promptGuide.trim();
              let cur = (comp.textContent || comp.value || '').trim();
              cur = cur.replace(/\[Character DNA:[^\]]*\]\s*/gi, '').trim();
              if (!cur.includes(guide)) {
                const combined = cur ? `${cur} ${guide}` : guide;
                injectPromptIntoComposerGlobal(combined, { skipDna: true });
              }
            }
          }, 300);
        }
      } catch (err) {
        console.warn('[Video-Ref] Staging error:', err);
      }
    }

    // 🎬 Video Grabber Bridge: Supply latest video and CORS-safe blob buffers to Main World modal
    if (e.data?.type === 'CHANNA_REQUEST_LATEST_CHAT_VIDEO') {
      let candidate = null;
      if (typeof allExtractedChatVideos !== 'undefined' && allExtractedChatVideos.size > 0) {
        const arr = Array.from(allExtractedChatVideos.values());
        candidate = arr[arr.length - 1];
      }
      if (!candidate && typeof processedVideos !== 'undefined' && processedVideos.size > 0) {
        const u = Array.from(processedVideos).pop();
        if (u) candidate = { url: u, title: 'Chat Video' };
      }
      if (!candidate) {
        const domVideos = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
        if (domVideos.length > 0) {
          const v = domVideos[domVideos.length - 1];
          const src = v.currentSrc || v.src || v.querySelector('source')?.src;
          if (src) candidate = { url: src, title: 'Chat Video' };
        }
      }
      window.postMessage({
        type: 'CHANNA_LATEST_CHAT_VIDEO_RESPONSE',
        video: candidate
      }, '*');
    }

    if (e.data?.type === 'CHANNA_FETCH_BLOB_REQ') {
      const { id, url } = e.data;
      (async () => {
        try {
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`Blob fetch status ${resp.status}`);
          const buf = await resp.arrayBuffer();
          const bytes = new Uint8Array(buf);
          let binary = '';
          const chunk = 8192;
          for (let i = 0; i < bytes.length; i += chunk) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
          }
          window.postMessage({
            type: 'CHANNA_FETCH_BLOB_RESP',
            id,
            ok: true,
            base64: btoa(binary)
          }, '*');
        } catch (err) {
          window.postMessage({
            type: 'CHANNA_FETCH_BLOB_RESP',
            id,
            ok: false,
            error: err?.message || String(err)
          }, '*');
        }
      })();
    }
  });

  // Chrome Runtime listener from Popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'CTB_SYNC_ACTOR_VAULT' && message.vault) {
      cachedActorVault = message.vault;
      broadcastActorVault();
      sendResponse({ ok: true });
      return true;
    }

    if (message?.type === 'STAGE_CHARACTER_ACTOR') {
      (async () => {
        try {
          const actor = message.actor;
          if (!actor) throw new Error('No actor data received');

          const now = Date.now();
          if (actor?.id && actor.id === lastActorStagedId && (now - lastActorStagedTime) < 1200) {
            sendResponse({ ok: true, message: 'Already staged (debounced)' });
            return;
          }
          lastActorStagedTime = now;
          lastActorStagedId = actor?.id || '';

          let file = null;
          if (actor.avatarUrl && actor.avatarUrl.startsWith('data:image')) {
            const arr = actor.avatarUrl.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            const safeName = (actor.name || 'actor').replace(/[^a-zA-Z0-9_-]/g, '_');
            file = new File([u8arr], `${safeName}_reference.jpg`, { type: mime });
          }

          if (file) {
            const staged = stageReferenceImageToComposer(file, { purge: false });
            if (staged) {
              sendResponse({ ok: true, message: 'Character staged' });
            } else {
              sendResponse({ ok: false, error: 'Could not attach image' });
            }
          } else {
            sendResponse({ ok: true, message: 'DNA locked' });
          }

          if (actor.dnaTokens) {
            setTimeout(() => {
              const comp = findDolaComposerGlobal();
              if (comp) {
                const existing = comp.value || comp.textContent || '';
                if (!existing.includes(actor.dnaTokens)) {
                  injectPromptIntoComposerGlobal(existing ? `${existing} [Character DNA: ${actor.dnaTokens}]` : `[Character DNA: ${actor.dnaTokens}] `);
                }
              }
            }, 250);
          }
        } catch (e) {
          sendResponse({ ok: false, error: e?.message || String(e) });
        }
      })();
      return true;
    }

    // 📸 Grab Current Video Frame from Chat
    if (message?.type === 'GRAB_CHAT_VIDEO_FRAME') {
      (async () => {
        try {
          const videos = Array.from(document.querySelectorAll('video')).filter(v => v.videoWidth > 0 && v.videoHeight > 0);
          if (videos.length === 0) {
            sendResponse({ ok: false, error: 'No video with loaded frames found in chat.' });
            return;
          }
          const vid = videos[videos.length - 1];
          const canvas = document.createElement('canvas');
          let w = vid.videoWidth || 640;
          let h = vid.videoHeight || 360;
          const maxDim = 512;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(vid, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          sendResponse({ ok: true, dataUrl });
        } catch (e) {
          sendResponse({ ok: false, error: e?.message || String(e) });
        }
      })();
      return true;
    }
  });

  // 🎬 Direct Document Capture Listeners for #channa-video-ref-btn (Relayed to Main World)
  document.addEventListener('click', (e) => {
    const btn = e.target?.closest ? e.target.closest('#channa-video-ref-btn') : null;
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();
      window.dispatchEvent(new CustomEvent('CHANNA_OPEN_VIDEO_REF_MODAL'));
      window.postMessage({ type: 'CHANNA_OPEN_VIDEO_REF_MODAL' }, '*');
    }
  }, true);

  document.addEventListener('pointerdown', (e) => {
    if (e.target?.closest && e.target.closest('#channa-video-ref-btn')) {
      e.stopPropagation();
      e.stopImmediatePropagation?.();
    }
  }, true);

  document.addEventListener('mousedown', (e) => {
    if (e.target?.closest && e.target.closest('#channa-video-ref-btn')) {
      e.stopPropagation();
      e.stopImmediatePropagation?.();
    }
  }, true);

  console.log('[ChannaTheBrand Pro] 🎭 Consistent Actor Vault & 🎬 Video Ref Content Script Bridges Active.');
})();

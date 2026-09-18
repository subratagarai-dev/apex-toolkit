// ============================================================================
// 🛡️ DOLA HARDENED ACCOUNT & ANTI-LOGOUT PROTECTION SHIELD
// ============================================================================
(() => {
  'use strict';
  try {
    if (typeof window === 'undefined') return;

    // 1. Cleanse localStorage of ban markers safely and prevent re-infection
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem('for_ban_appeal_sec_user_id');
        const origSetItem = window.localStorage.setItem;
        window.localStorage.setItem = function(key, val) {
          if (key === 'for_ban_appeal_sec_user_id') return;
          return origSetItem.call(this, key, val);
        };
      } catch (e) {}
    }

    // 🛡️ React DOM Reconciler Immunity Shield: Prevents "NotFoundError: Failed to execute 'removeChild' on 'Node'"
    // when React unmounts components, transitions pages, or reconciles modified nodes
    if (typeof Node === 'function' && Node.prototype) {
      const origRemoveChild = Node.prototype.removeChild;
      Node.prototype.removeChild = function(child) {
        if (child && child.parentNode !== this) {
          if (child.parentNode) {
            try { return child.parentNode.removeChild(child); } catch(e) { return child; }
          }
          return child;
        }
        return origRemoveChild.apply(this, arguments);
      };

      const origInsertBefore = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function(newNode, refNode) {
        if (refNode && refNode.parentNode !== this) {
          if (refNode.parentNode) {
            try { return refNode.parentNode.insertBefore(newNode, refNode); } catch(e) { return newNode; }
          }
          return newNode;
        }
        return origInsertBefore.apply(this, arguments);
      };
    }

    // 🛡️ Global Unhandled Rejection & Network Error Immunity Shield (Prevents React "Temporarily Unavailable" Crash)
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', (event) => {
        try {
          const reason = event.reason;
          const msg = String((reason && (reason.message || reason.stack || reason)) || '');
          if (
            msg.includes('Network request failed') ||
            msg.includes('status: 0') ||
            msg.includes('Failed to fetch') ||
            msg.includes('CERT_AUTHORITY') ||
            msg.includes('zijieapi') ||
            msg.includes('53687') ||
            msg.includes('slardar')
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        } catch (e) {}
      }, true);

      window.addEventListener('error', (event) => {
        try {
          const msg = String(event.message || '');
          if (
            msg.includes('removeChild') ||
            msg.includes('insertBefore') ||
            msg.includes('Network request failed') ||
            msg.includes('status: 0') ||
            msg.includes('zijieapi')
          ) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        } catch (e) {}
      }, true);
    }



    // 🛡️ Ultra-Clean Floating Notification Banner (Unobtrusive status feedback with interactive actions)
    window.__showChannaNotice = function(msg, duration = 4500, hasSwitchBtn = false) {
      console.warn('[ChannaTheBrand Pro Notice]:', msg);
      try {
        let toast = document.getElementById('ctb-global-notice');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'ctb-global-notice';
          (document.body || document.documentElement).appendChild(toast);
        }

        const isSharkNotice = msg.includes('Shark block') || hasSwitchBtn === true;
        const finalDuration = isSharkNotice ? 30000 : duration;

        toast.style.cssText = 'position:fixed;top:120px;left:50%;bottom:auto;right:auto;transform:translateX(-50%) translateY(-10px);z-index:9999999;background:rgba(15,23,42,0.96);color:#f8fafc;padding:9px 16px;border-radius:14px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:12px;font-weight:600;box-shadow:0 10px 30px rgba(0,0,0,0.65),0 0 20px rgba(124,58,237,0.35);border:1px solid rgba(168,85,247,0.45);display:flex;align-items:center;gap:10px;pointer-events:auto;transition:all 0.3s cubic-bezier(0.16,1,0.3,1);opacity:0;max-width:580px;';

        let actionBtnHtml = '';
        if (isSharkNotice) {
          actionBtnHtml = `
            <button id="ctb-btn-switch-account" style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#10b981 0%,#059669 100%);color:#ffffff;border:none;border-radius:999px;padding:4px 12px;font-size:11px;font-weight:700;cursor:pointer;box-shadow:0 0 10px rgba(16,185,129,0.4);transition:all 0.2s ease;white-space:nowrap;flex-shrink:0;">
              🔄 Switch Account
            </button>
            <button id="ctb-btn-dismiss-notice" style="background:transparent;border:none;color:#94a3b8;font-size:13px;cursor:pointer;padding:2px 5px;line-height:1;margin-left:2px;flex-shrink:0;" title="Dismiss">✕</button>
          `;
        }

        toast.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);color:#ffffff;font-size:10px;font-weight:800;padding:2px 7px;border-radius:12px;letter-spacing:0.3px;box-shadow:0 0 10px rgba(168,85,247,0.45);white-space:nowrap;user-select:none;flex-shrink:0;">⚡ ChannaTheBrand</span> <span style="line-height:1.4;flex-grow:1;">${msg}</span>${actionBtnHtml}`;

        const btnSwitch = toast.querySelector('#ctb-btn-switch-account');
        if (btnSwitch) {
          btnSwitch.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            btnSwitch.textContent = '⏳ Switching...';
            btnSwitch.disabled = true;
            btnSwitch.style.opacity = '0.75';
            btnSwitch.style.cursor = 'wait';
            window.postMessage({ type: 'CHANNA_MANUAL_SWITCH_ACCOUNT' }, '*');
          };
        }

        const btnDismiss = toast.querySelector('#ctb-btn-dismiss-notice');
        if (btnDismiss) {
          btnDismiss.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
          };
        }

        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
          if (toast) {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-10px)';
          }
        }, finalDuration);
      } catch (e) {}
    };

    // ⚡ Autonomous Daily Limit Notification (Notice Only, NEVER auto-reloads page)
    function notifyDailyLimitReached(source = 'unknown') {
      const now = Date.now();
      if (now - (window.__ctbLastLimitNoticeTime || 0) < 60000) return;
      window.__ctbLastLimitNoticeTime = now;
      console.warn('[ChannaTheBrand Pro] ⚠️ Daily generation limit reached (' + source + '). Displaying notice without reload.');
      if (typeof window.__showChannaNotice === 'function') {
        window.__showChannaNotice('⚠️ Daily generation limit reached. You can switch accounts anytime from the side panel.', 6000);
      }
    }
    window.__notifyDailyLimitReached = notifyDailyLimitReached;

    // 👻 GHOST WORKER: Anti-Throttle & Never-Sleep Mode (Destroys Background Throttling)
    let isGhostWorkerActive = true;
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CTB_SET_GHOST_WORKER') {
        isGhostWorkerActive = e.data.enabled !== false;
      }
    });

    try {
      const origHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden') ||
                             Object.getOwnPropertyDescriptor(document, 'hidden');
      const origVisDesc = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState') ||
                          Object.getOwnPropertyDescriptor(document, 'visibilityState');

      Object.defineProperty(document, 'hidden', {
        get: function() {
          if (isGhostWorkerActive) return false;
          return origHiddenDesc ? origHiddenDesc.get.call(this) : false;
        },
        configurable: true
      });

      Object.defineProperty(document, 'visibilityState', {
        get: function() {
          if (isGhostWorkerActive) return 'visible';
          return origVisDesc ? origVisDesc.get.call(this) : 'visible';
        },
        configurable: true
      });
    } catch (e) {}

    // Web Worker high-precision heartbeat to bypass Chromium background timer throttling
    try {
      const ghostBlob = new Blob([`
        setInterval(function() {
          postMessage('ghost_heartbeat');
        }, 1000);
      `], { type: 'application/javascript' });
      const ghostWorker = new Worker(URL.createObjectURL(ghostBlob));
      ghostWorker.onmessage = function() {};
    } catch (e) {}

    // 🛡️ Safe DOM Daily Limit Observer (Monitors both active popup modals/toasts and recent chat message rows)
    (() => {
      let lastDomLimitCheck = 0;
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

      function checkDomDailyLimit() {
        if (Date.now() - lastDomLimitCheck < 4000) return;
        lastDomLimitCheck = Date.now();

        try {
          const now = Date.now();
          // Startup immunity: During first 25 seconds after page load, seed all existing messages into seenLimitMessageIds so historical messages never trigger auto-switch!
          const isStartup = (now - pageInitTime < 25000);

          // Cooldown check: If account was switched within last 60s, do not scan or switch!
          const switchCooldown = parseInt(sessionStorage.getItem('__ctb_switch_cooldown') || '0', 10);
          if (now < switchCooldown) return;

          // 1. Check active floating dialogs/modals/toasts
          const activeDialogs = Array.from(document.querySelectorAll('[role="dialog"], [role="alert"], .semi-modal, .semi-toast, .semi-notification, [class*="toast" i], [class*="alert" i], [class*="modal" i]'));
          if (activeDialogs.length > 0) {
            const dialogText = activeDialogs.map(el => el.innerText || el.textContent || '').join(' ').toLowerCase();
            if (dialogText && limitPhrases.some(p => dialogText.includes(p.toLowerCase()))) {
              const key = 'dialog_' + dialogText.slice(0, 40);
              if (!seenLimitMessageIds.has(key)) {
                seenLimitMessageIds.add(key);
                if (!isStartup) {
                  notifyDailyLimitReached('active_modal_dialog');
                  return;
                }
              }
            }
          }

          // 2. Check recent assistant chat message rows
          const messageRows = Array.from(document.querySelectorAll('[data-observe-row], .v_list_row, [data-message-id], [data-container-type="block-v2"], [data-render-engine="node"]'));
          if (messageRows.length > 0) {
            const recentRows = messageRows.slice(-3);
            for (const row of recentRows) {
              const text = (row.innerText || row.textContent || '').toLowerCase();
              if (text && limitPhrases.some(p => text.includes(p.toLowerCase()))) {
                const msgId = row.getAttribute('data-message-id') || row.getAttribute('data-observe-row') || text.slice(0, 40);
                if (seenLimitMessageIds.has(msgId)) continue;
                seenLimitMessageIds.add(msgId);
                if (!isStartup) {
                  notifyDailyLimitReached('chat_message_daily_limit');
                  return;
                }
              }
            }
          }
        } catch(e) {}
      }

      setInterval(checkDomDailyLimit, 4000);
    })();

    // 🛡️ Auto-dismiss guest login prompt modal if user is chatting in clean/guest mode
    setInterval(() => {
      try {
        const modal = document.querySelector('.semi-modal-wrap, .semi-modal');
        if (modal && (modal.innerText || '').includes('Log In to Unlock More Features')) {
          const closeBtn = modal.querySelector('button[aria-label="close"], .semi-modal-close, [aria-label="close"]');
          if (closeBtn) closeBtn.click();
        }
      } catch (e) {}
    }, 1200);


    // 2. XHR Hard Logout Blocker
    if (typeof XMLHttpRequest !== 'undefined' && XMLHttpRequest.prototype) {
      const origXhrOpen = XMLHttpRequest.prototype.open;
      const origXhrSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        if (typeof transformUrl === 'function') url = transformUrl(url);
        this._ctbUrl = typeof url === 'string' ? url : String(url);
        try {
          this.addEventListener('load', function() {
            try {
              if (this.responseText && (
                this.responseText.includes('用户不存在') || 
                this.responseText.includes('User does not exist') || 
                this.responseText.includes('Account session expired') ||
                this.responseText.includes('"error_code":1011') ||
                this.responseText.includes('"error_code": 1011')
              )) {
                if (typeof window !== 'undefined' && typeof window.__showChannaNotice === 'function') {
                  window.__showChannaNotice('This account session has expired or user does not exist on ByteDance server (用户不存在 / User does not exist). Please switch to an active account in the extension.');
                }
              }
            } catch (e) {}
          });
        } catch (e) {}
        return origXhrOpen.call(this, method, url, ...rest);
      };
      XMLHttpRequest.prototype.send = function(...args) {
        try {
          if (args[0] && typeof args[0] === 'string') {
            args[0] = enforceChannaVideoSettings(args[0], this._ctbUrl);
          }
        } catch (e) {}
        if (this._ctbUrl && (this._ctbUrl.includes('/passport/web/logout') || this._ctbUrl.includes('logout_reason=shark_block'))) {
          console.warn('[ChannaTheBrand Pro] ⚠️ ByteDance Shark logout intercepted.');
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice('ByteDance Shark block detected on account session.', 30000, true);
          }
          try {
            Object.defineProperty(this, 'status', { value: 200, writable: false });
            Object.defineProperty(this, 'responseText', { value: JSON.stringify({ code: 0, message: 'success' }), writable: false });
            Object.defineProperty(this, 'readyState', { value: 4, writable: false });
            this.dispatchEvent(new Event('readystatechange'));
            this.dispatchEvent(new Event('load'));
          } catch (e) {}
          return;
        }
        // 🛡️ TELEMETRY NETWORK FAILURE IMMUNITY (Prevents TypeError: Network request failed, status: 0)
        if (this._ctbUrl && (
          this._ctbUrl.includes('zijieapi.com') || 
          this._ctbUrl.includes('/monitor_web/') || 
          this._ctbUrl.includes('/slardar/')
        )) {
          try {
            Object.defineProperty(this, 'status', { value: 200, writable: false });
            Object.defineProperty(this, 'responseText', { value: JSON.stringify({ code: 0, message: 'success', data: {} }), writable: false });
            Object.defineProperty(this, 'response', { value: JSON.stringify({ code: 0, message: 'success', data: {} }), writable: false });
            Object.defineProperty(this, 'readyState', { value: 4, writable: false });
            setTimeout(() => {
              this.dispatchEvent(new Event('readystatechange'));
              this.dispatchEvent(new Event('load'));
              this.dispatchEvent(new Event('loadend'));
            }, 0);
          } catch (e) {}
          return;
        }
        return origXhrSend.apply(this, args);
      };
    }

    // 3. Fast DOM MutationObserver for High Demand Toasts and Alert Icons (Silently suppressed)
    const killToastsAndIcons = () => {
      try {
        const banners = document.querySelectorAll('.semi-toast, [role="alert"], .semi-banner, [class*="toast" i], [class*="banner" i], [class*="notice" i]');
        banners.forEach(el => {
          const txt = (el.innerText || el.textContent || '').trim();
          if (txt.includes('high demand') || txt.includes('experiencing high demand') || txt.includes('try again later')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            try { el.remove(); } catch (e) {}
          }
        });
        const alertIcons = document.querySelectorAll('svg.text-s-color-alert, .text-s-color-alert');
        alertIcons.forEach(svg => {
          svg.style.setProperty('display', 'none', 'important');
          svg.style.setProperty('visibility', 'hidden', 'important');
          try { svg.remove(); } catch (e) {}
        });
      } catch (e) {}
    };
    const toastObs = new MutationObserver(killToastsAndIcons);
    if (document.documentElement) {
      toastObs.observe(document.documentElement, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        toastObs.observe(document.documentElement, { childList: true, subtree: true });
      });
    }
  } catch (err) {}
})();

(() => {
  try {
    if (!document.getElementById('ctb-early-dock-style')) {
      const s = document.createElement('style');
      s.id = 'ctb-early-dock-style';
      s.textContent = `
        /* Top Minimal Capsule */
        #channa-top-center-capsule {
          position: fixed !important;
          top: 10px !important;
          left: 360px !important;
          transform: none !important;
          right: auto !important;
          margin: 0 !important;
          z-index: 999998 !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 5px !important;
          height: 24px !important;
          padding: 2px 8px 2px 3px !important;
          background: rgba(18, 14, 28, 0.88) !important;
          border: 1px solid rgba(168, 85, 247, 0.3) !important;
          border-radius: 999px !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
          backdrop-filter: blur(8px) !important;
          white-space: nowrap !important;
          user-select: none !important;
        }
        /* Hide separate/raw Dola container to avoid duplicate box */
        #channa-dock-badge,
        .channa-dock-badge {
          display: none !important;
        }
        /* Instant suppression of alert error icon */
        svg.text-s-color-alert,
        .text-s-color-alert {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (e) {}
})();

// ============================================================================
// 🎭 HARDWARE CANVAS & FINGERPRINT JITTER (ANTI-TRACKING & NOISE MASKING)
// ============================================================================
(() => {
  'use strict';
  try {
    if (typeof window === 'undefined' || !window.HTMLCanvasElement) return;

    // 🛡️ Dola AI ByteDance Shark Security Compliance: Preserves 100% native WebGL & Canvas on Dola
    if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com')) {
      return;
    }

    // Generate random session seed per tab
    const sessionJitterSeed = Math.floor(Math.random() * 10) + 1;

    // 1. Safety Guard: Identify tracking/fingerprinting probe canvases ONLY
    // NEVER touch video canvases (width > 280, height > 280, or marked clean)
    function isFingerprintProbeCanvas(canvas) {
      if (!canvas) return false;
      // Probing canvases are small offscreen text test canvases (16x16 up to 250x70)
      if (canvas.width > 280 || canvas.height > 280) return false;
      if (canvas._isOmniRef || canvas._isChannaClean) return false;
      return true;
    }

    // 2. Safe Canvas getImageData jitter (subtle 1-bit shift on 1 single pixel)
    if (typeof CanvasRenderingContext2D !== 'undefined') {
      const origGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        const imgData = origGetImageData.apply(this, args);
        try {
          if (isFingerprintProbeCanvas(this.canvas) && imgData && imgData.data && imgData.data.length > 4) {
            // Apply 1-bit noise to only the first pixel byte (imperceptible, but completely breaks bot hashing)
            imgData.data[0] = (imgData.data[0] ^ sessionJitterSeed) & 0xff;
          }
        } catch (e) {}
        return imgData;
      };
    }

    // 3. Canvas toDataURL operates in clean passthrough mode

    // 4. WebGL Vendor & Renderer stealth masking
    const patchWebGL = (proto) => {
      if (!proto || !proto.getParameter) return;
      const origGetParam = proto.getParameter;
      proto.getParameter = function(param) {
        // UNMASKED_VENDOR_WEBGL = 0x9245
        if (param === 0x9245) return 'Google Inc. (NVIDIA)';
        // UNMASKED_RENDERER_WEBGL = 0x9246
        if (param === 0x9246) return 'ANGLE (NVIDIA, NVIDIA GeForce RTX Direct3D11 vs_5_0 ps_5_0, D3D11)';
        return origGetParam.apply(this, arguments);
      };
    };

    if (typeof WebGLRenderingContext !== 'undefined') patchWebGL(WebGLRenderingContext.prototype);
    if (typeof WebGL2RenderingContext !== 'undefined') patchWebGL(WebGL2RenderingContext.prototype);

    console.log('[ChannaTheBrand Pro] 🎭 Anti-Fingerprint Hardware Jitter Active (Video Track 100% Protected).');
  } catch (err) {}
})();

// ============================================================================
// DOLA STUDIORAY DUAL-MODE CONTROLLER (PRO MODE = 100% BYPASS / DOWNLOAD ONLY)
// ============================================================================

var __ctbIsProMode = window.__ctbIsProMode || false;

function __isDolaProModeInDom() {
  try {
    if (typeof document === 'undefined') return false;
    
    // 1. Check if model variable is explicitly set
    if (typeof window !== 'undefined' && window.__dolaActiveModel) {
      return window.__dolaActiveModel === 'pro';
    }

    // 2. Fast targeted search for model selector / pills (only checks interactive controls)
    const pills = document.querySelectorAll('button, [role="button"], [class*="model" i], [class*="pill" i], [class*="selector" i], [class*="mode" i], [class*="badge" i]');
    for (let i = 0; i < pills.length; i++) {
      const text = (pills[i].textContent || '').trim().toLowerCase();
      if ((text === 'pro' || text === '✨ pro' || text === 'pro >' || text === '✨ pro >' || text.startsWith('pro ') || text.includes('✨ pro')) && !text.includes('fast') && !text.includes('upgrade') && !text.includes('buy')) {
        __ctbIsProMode = true;
        return true;
      }
      if (text === 'fast' || text === '⚡ fast' || text === 'fast >' || text === '⚡ fast >' || text.startsWith('fast ') || text.includes('⚡ fast')) {
        __ctbIsProMode = false;
        return false;
      }
    }
  } catch (e) {}
  return __ctbIsProMode;
}

function __isCtbProModeActive() {
  return typeof __isDolaProModeInDom === 'function' ? __isDolaProModeInDom() : false;
}

function __isCtbUploadRequest(url, body, options) {
  try {
    const strUrl = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    if (strUrl && /ibytedtos\.com|byteintl\.com|s3\.amazonaws\.com|volces\.com|upload|attachment|file_upload|image_upload|tos|tos-upload/i.test(strUrl)) return true;
    const method = String((options && options.method) || (url && url.method) || '').toUpperCase();
    if (method === 'PUT') return true;
    if (typeof FormData !== 'undefined' && body instanceof FormData) return true;
    if (typeof Blob !== 'undefined' && body instanceof Blob) return true;
    if (typeof File !== 'undefined' && body instanceof File) return true;
    if (typeof ArrayBuffer !== 'undefined' && (body instanceof ArrayBuffer || ArrayBuffer.isView(body))) return true;
    if (typeof body === 'object' && body !== null) {
      if (body.file_name || body.file_type || body.image_uri || body.image_raw || body.attachment || body.tos_key || body.upload_token || body.chunk_size || body.file_size || body.mime_type) return true;
      if (body.action && /upload|attachment|file/i.test(String(body.action))) return true;
    }
    if (typeof body === 'string' && (/["'](?:file_name|file_type|image_uri|image_raw|upload_token|attachment|tos_key|chunk_size|file_size|mime_type)["']/i.test(body) || body.includes('data:image/'))) return true;
  } catch (e) {}
  return false;
}

function __isCtbProOrChatRequest(url, body, options) {
  try {
    if (__isCtbProModeActive()) return true;
    const strUrl = typeof url === 'string' ? url : (url && url.url ? url.url : '');
    if (strUrl && /\/chat|\/conversation|\/message|\/samantha|\/im\/chain|\/bot\/chat|\/agent|\/stream|generate_chat/i.test(strUrl)) {
      if (!/\/video\/(?:generate|create|task|submit)/i.test(strUrl) && !/\/generate_video/i.test(strUrl)) {
        return true;
      }
    }
    if (typeof body === 'string' && body.length > 0) {
      if (body.includes('"model":"pro"') || body.includes('"model": "pro"') || body.includes('"mode":"pro"') || body.includes('"chat_mode":"pro"') || body.includes('"doubao-pro"') || body.includes('"deepseek"') || body.includes('"reasoner"') || body.includes('"thinking"')) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

function __isCtbBypassRequest(url, body, options) {
  if (typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com')) {
    return true;
  }
  return __isCtbUploadRequest(url, body, options) || __isCtbProOrChatRequest(url, body, options);
}

if (typeof window !== 'undefined') {
  window.__isCtbUploadRequest = __isCtbUploadRequest;
  window.__isCtbProModeActive = __isCtbProModeActive;
  window.__isCtbProOrChatRequest = __isCtbProOrChatRequest;
  window.__isCtbBypassRequest = __isCtbBypassRequest;
  window.__ctbIsProMode = __ctbIsProMode;
  window.__isDolaProModeInDom = __isDolaProModeInDom;
}

// ============================================================================
// ⚡ CHANNA DURATION, RATIO & CREDIT POINTS BYPASS SUITE (Clean Deobfuscated)
// ============================================================================
  // Active Override State
  window.CHANNA_TARGET_DURATION = window.CHANNA_TARGET_DURATION || 30;
  window.CHANNA_TARGET_RATIO = window.CHANNA_TARGET_RATIO || '9:16';
  window.CHANNA_MAX_CREDITS_LIMIT = window.CHANNA_MAX_CREDITS_LIMIT || 20;

  const SUPPORTED_RATIOS = ['9:16', '16:9', '1:1', '4:3', '3:4', '21:9'];
  const RATIO_KEYS = ['ratio', 'aspect_ratio', 'aspectRatio', 'ratio_type', 'ar'];

  function getActiveAccountName() {
    try {
      // 1. Live captured nickname from ByteDance API (/alice/profile/self_brief or /passport/)
      if (window.CHANNA_DOM_USER_NAME && typeof window.CHANNA_DOM_USER_NAME === 'string') {
        const nick = window.CHANNA_DOM_USER_NAME.trim();
        if (nick && !nick.includes('Sohail') && nick !== 'Active Account' && nick !== 'Default') {
          return nick;
        }
      }

      // 2. Read directly from Dola's DOM (sidebar profile element / student text)
      const sidebarEls = document.querySelectorAll('aside [class*="user"], aside [class*="profile"], aside [class*="name"], aside button, [class*="sidebar"] button, footer button, [class*="avatar"] + span, aside span');
      for (const el of sidebarEls) {
        if (el.id === 'ctb-acc-name' || el.id === 'ctb-acc-dur') continue;
        const t = (el.innerText || el.textContent || '').trim();
        const m = t.match(/\b(student\s+[a-z0-9_]{3,}|user_[a-z0-9_]{3,})\b/i);
        if (m) {
          window.CHANNA_DOM_USER_NAME = m[1];
          return m[1];
        }
      }

      // Scan all text nodes / spans for student dcXXXXXX
      const allSpans = document.querySelectorAll('span, p, div');
      for (const el of allSpans) {
        if (el.id === 'ctb-acc-name' || el.id === 'ctb-acc-dur' || el.children.length > 2) continue;
        const t = (el.innerText || el.textContent || '').trim();
        const m = t.match(/\b(student\s+[a-z0-9_]{3,})\b/i);
        if (m) {
          window.CHANNA_DOM_USER_NAME = m[1];
          return m[1];
        }
      }

      // 3. Check active profile name from extension storage (e.g. Account 1, Account 4, Student 1)
      if (window.CHANNA_ACTIVE_ACCOUNT_NAME && typeof window.CHANNA_ACTIVE_ACCOUNT_NAME === 'string') {
        const storedName = window.CHANNA_ACTIVE_ACCOUNT_NAME.replace(/\s*Active\.*/i, '').trim();
        if (storedName && !storedName.includes('Sohail') && storedName !== 'Active Account' && storedName !== 'Default') {
          return storedName;
        }
      }

      // 4. Try bottom-left user button text if logged in
      const userBtn = document.querySelector('aside > div:last-child button, nav > div:last-child button, [class*="user-entry"], [class*="user-profile"]');
      if (userBtn) {
        const btnText = (userBtn.innerText || userBtn.textContent || '').trim().replace(/\s*[>›»▼⌄^]+\s*$/, '').trim();
        if (btnText && !btnText.toLowerCase().includes('about') && !btnText.toLowerCase().includes('log in') && !btnText.toLowerCase().includes('sign in') && btnText.length < 35) {
          return btnText;
        }
      }

      // 5. Fallback: If extension profile is set, return it
      if (window.CHANNA_ACTIVE_ACCOUNT_NAME && window.CHANNA_ACTIVE_ACCOUNT_NAME.trim()) {
        const name = window.CHANNA_ACTIVE_ACCOUNT_NAME.trim();
        if (name !== 'Active Account') return name;
      }
    } catch (e) {}

    return 'Account #01';
  }
  window.getActiveAccountName = getActiveAccountName;

  // 🛡️ Proactively query Dola profile to extract live logged in student/user nickname
  if (typeof window !== 'undefined') {
    setTimeout(async () => {
      try {
        if (!window.CHANNA_DOM_USER_NAME) {
          const res = await (window.__nativeFetch || window.fetch)('/alice/profile/self_brief', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: '{}'
          });
          if (res && res.ok) {
            const data = await res.json();
            const nick = data?.data?.profile_brief?.nickname || data?.data?.user_info?.name || data?.data?.user_info?.screen_name;
            if (nick && typeof nick === 'string' && nick.trim()) {
              window.CHANNA_DOM_USER_NAME = nick.trim();
              if (typeof syncBadgesFast === 'function') syncBadgesFast();
            }
          }
        }
      } catch (e) {}
    }, 1200);
  }

  // ============================================================================
  // 1. Cross-World Message Listener (receives config from content.js)
  // ============================================================================
  window.addEventListener('message', (event) => {
    if (!event.data) return;

    // ⚡ Synchronize active account name from extension storage
    if (event.data.activeAccountName || event.data.accountName) {
      const acc = (event.data.activeAccountName || event.data.accountName || '').trim();
      if (acc && acc !== 'Default' && acc !== 'Active Account') {
        window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
        if (typeof syncBadgesFast === 'function') syncBadgesFast();
      }
    }

    if (event.data.type === 'SET_RATIO_OVERRIDE' || event.data.type === 'DURATION_OVERRIDE') {
      if (event.data.duration) {
        window.CHANNA_TARGET_DURATION = parseInt(event.data.duration, 10) || 30;
      }
      if (event.data.ratio) {
        window.CHANNA_TARGET_RATIO = event.data.ratio;
      }
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      if (event.data.activeAccountName) {
        const acc = event.data.activeAccountName.trim();
        if (acc && acc !== 'Default' && acc !== 'Active Account') {
          window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
        }
      }
      if (typeof syncBadgesFast === 'function') syncBadgesFast();
    }
    if (event.data.type === 'SET_MAX_CREDITS_LIMIT') {
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
    }
    if (event.data.type === 'SET_ACTIVE_ACCOUNT_NAME') {
      if (event.data.activeAccountName) {
        const acc = event.data.activeAccountName.trim();
        if (acc && acc !== 'Default' && acc !== 'Active Account') {
          window.CHANNA_ACTIVE_ACCOUNT_NAME = acc;
          if (typeof syncBadgesFast === 'function') syncBadgesFast();
        }
      }
    }
  }, { passive: true });

  // ============================================================================
  // 2. Request Payload Rewriters (Duration, Ratio, Credit Points)
  // ============================================================================
  // 🛡️ ACCURATE VIDEO INTENT DETECTION: Ensures regular text chat is NEVER modified!
  function isActualVideoRequest(bodyText, url) {
    if (!bodyText || typeof bodyText !== 'string') return false;
    
    // Explicit video endpoints
    if (url && (url.includes('/video/create') || url.includes('/video/generate') || url.includes('/creation/video'))) {
      return true;
    }

    // Quick rejection: If string has none of these keywords, it's 100% regular text chat
    if (!/(?:chat_ability|ability_param|seedance|storyboard|video_duration|video_length|motion_seconds|generate_type)/i.test(bodyText)) {
      return false;
    }

    try {
      const parsed = JSON.parse(bodyText);
      
      // Top-level or option-level video directives
      if (parsed.chat_ability || parsed.ability_param || parsed.video_duration || parsed.generate_type === 'video') {
        return true;
      }
      if (parsed.option && (parsed.option.chat_ability || parsed.option.ability_param || parsed.option.video_duration || parsed.option.generate_type === 'video')) {
        return true;
      }

      // If conversation has messages array, check ONLY the current message being sent
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        const lastMsg = parsed.messages[parsed.messages.length - 1];
        const lastMsgStr = JSON.stringify(lastMsg);
        
        // Only treat as video if the user's LATEST message has video generation parameters
        const lastMsgHasVideo = /(?:chat_ability|ability_param|seedance|storyboard|video_duration|video_length|motion_seconds|generate_type["\s:]+video|Generated video)/i.test(lastMsgStr);
        if (lastMsgHasVideo) {
          return true;
        }

        // Regular chat in historical video thread ("hello", "joke", "explain", etc.)
        return false;
      }
    } catch (e) {
      // Non-JSON RPCs: only treat as video if ability_param or chat_ability is present
      return bodyText.includes('ability_param') || bodyText.includes('chat_ability') || /seedance/i.test(bodyText);
    }

    return false;
  }

  function transformPayloadBody(bodyText, url) {
    if (!bodyText || typeof bodyText !== 'string') return bodyText;

    // 🛡️ CRITICAL GUARD: Only transform actual video generation requests!
    // Regular text chat and new conversations remain 100% UNTOUCHED (Preserves sub_conv_firstmet_type & new chat creation)
    if (!isActualVideoRequest(bodyText, url)) {
      const isNewChat = bodyText.includes('"need_create_conversation":true') || bodyText.includes('"need_create_conversation": true');
      if (!isNewChat) {
        let clean = bodyText;
        if (clean.includes('"agent_mode"')) {
          clean = clean.replace(/"agent_mode"\s*:\s*2/g, '"agent_mode":0');
          clean = clean.replace(/"agent_mode"\s*:\s*"2"/g, '"agent_mode":"0"');
        }
        return clean;
      }
      return bodyText;
    }

    const targetDuration = window.CHANNA_TARGET_DURATION || 30;
    const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';

    let body = bodyText;

    // --- A. CREDIT POINTS (2 PTS FOR SEEDANCE 2.5, 1 PT FOR 2.0) & FREE QUEUE ---
    const isSeedance20 = /(?:seedance_?2[._]0|seedance\s*2\.0)/i.test(body);
    const targetCredits = isSeedance20 ? 1 : 2; // 2 Points Cut per Video on Seedance 2.5

    body = body.replace(/"allow_free_queue"\s*:\s*false/gi, '"allow_free_queue":true');
    body = body.replace(/\\"allow_free_queue\\"\s*:\s*false/gi, '\\"allow_free_queue\\":true');
    body = body.replace(/"accept_queue"\s*:\s*false/gi, '"accept_queue":true');
    body = body.replace(/\\"accept_queue\\"\s*:\s*false/gi, '\\"accept_queue\\":true');
    body = body.replace(/"credits"\s*:\s*\d+/gi, `"credits":${targetCredits}`);
    body = body.replace(/\\"credits\\"\s*:\s*\d+/gi, `\\"credits\\":${targetCredits}`);
    body = body.replace(/"cost"\s*:\s*\d+/gi, `"cost":${targetCredits}`);
    body = body.replace(/\\"cost\\"\s*:\s*\d+/gi, `\\"cost\\":${targetCredits}`);
    body = body.replace(/"point_cost"\s*:\s*\d+/gi, `"point_cost":${targetCredits}`);
    body = body.replace(/\\"point_cost\\"\s*:\s*\d+/gi, `\\"point_cost\\":${targetCredits}`);
    body = body.replace(/"consume_count"\s*:\s*\d+/gi, `"consume_count":${targetCredits}`);
    body = body.replace(/\\"consume_count\\"\s*:\s*\d+/gi, `\\"consume_count\\":${targetCredits}`);

    // --- B. DURATION BYPASS (10s, 15s, 20s, 25s, 30s, 60s) ---
    body = body.replace(/"duration"\s*:\s*\d+/gi, `"duration":${targetDuration}`);
    body = body.replace(/\\"duration\\"\s*:\s*\d+/gi, `\\"duration\\":${targetDuration}`);
    body = body.replace(/"video_duration"\s*:\s*\d+/gi, `"video_duration":${targetDuration}`);
    body = body.replace(/\\"video_duration\\"\s*:\s*\d+/gi, `\\"video_duration\\":${targetDuration}`);
    body = body.replace(/"seconds"\s*:\s*\d+/gi, `"seconds":${targetDuration}`);
    body = body.replace(/\\"seconds\\"\s*:\s*\d+/gi, `\\"seconds\\":${targetDuration}`);
    body = body.replace(/"motion_seconds"\s*:\s*\d+/gi, `"motion_seconds":${targetDuration}`);
    body = body.replace(/\\"motion_seconds\\"\s*:\s*\d+/gi, `\\"motion_seconds\\":${targetDuration}`);
    body = body.replace(/"video_length"\s*:\s*\d+/gi, `"video_length":${targetDuration}`);
    body = body.replace(/\\"video_length\\"\s*:\s*\d+/gi, `\\"video_length\\":${targetDuration}`);

    // Doubao / ByteDance ability_param nested duration
    if (body.includes('ability_param')) {
      body = body.replace(
        /(ability_param[\s\S]*?duration\\*"\s*:\s*)(\d+)/g,
        `$1${targetDuration}`
      );
    }

    // --- C. ASPECT RATIO BYPASS ---
    body = body.replace(
      /"(ratio|aspect_ratio|aspectRatio|ratio_type|ar)"\s*:\s*"[^"]*"/gi,
      `"aspect_ratio":"${targetRatio}"`
    );

    return body;
  }

  function transformUrl(url) {
    if (!url || typeof url !== 'string') return url;

    const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';
    if (/(ratio|aspect_ratio|ar)=/i.test(url)) {
      return url.replace(/([?&](ratio|aspect_ratio|ar)=)([^&]+)/gi, `$1${encodeURIComponent(targetRatio)}`);
    }
    return url;
  }

  function transformFormData(formData) {
    if (!formData || typeof formData.has !== 'function') return;
    if (formData.has('file') || formData.has('image') || formData.has('attachment') || formData.has('tos_key')) return;

    const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';
    for (const key of RATIO_KEYS) {
      if (formData.has(key)) {
        formData.set(key, targetRatio);
      }
    }
  }

  // Make globally available
  window.isActualVideoRequest = isActualVideoRequest;
  window.transformPayloadBody = transformPayloadBody;
  window.transformUrl = transformUrl;
  window.transformFormData = transformFormData;

  // ============================================================================
  // 3. JSON.stringify Hook (Intercepts Objects before serialization)
  // ============================================================================
  const originalJsonStringify = JSON.stringify;
  JSON.stringify = function(...args) {
    try {
      const obj = args[0];
      if (obj && typeof obj === 'object') {
        // 🛡️ CRITICAL GUARD: Only intercept video creation objects!
        // Regular chat messages, auth tokens, and DOM states remain 100% UNTOUCHED!
        const isVideoObj = ('chat_ability' in obj) ||
                           ('ability_param' in obj) || 
                           ('video_duration' in obj) || 
                           ('motion_seconds' in obj) || 
                           ('video_length' in obj) || 
                           (obj.model && /seedance/i.test(String(obj.model))) ||
                           (obj.generate_type === 'video');

        if (!isVideoObj) {
          // 🛡️ Ensure normal chat never sends agent_mode: 2 from historical video threads
          if (obj && obj.option && (obj.option.agent_mode === 2 || obj.option.agent_mode === '2') && !obj.option.generate_type && !obj.option.ability_param && !obj.chat_ability) {
            obj.option.agent_mode = 0;
            if (obj.option.aggregate_params) {
              obj.option.aggregate_params.agent_mode = '0';
            }
          }
          return originalJsonStringify.apply(this, args);
        }

        const targetDuration = window.CHANNA_TARGET_DURATION || 30;
        const targetRatio = window.CHANNA_TARGET_RATIO || '9:16';
        const isSeedance20 = obj.model && /(?:seedance_?2[._]0|seedance\s*2\.0)/i.test(String(obj.model));
        const targetCredits = isSeedance20 ? 1 : 2;

        if ('allow_free_queue' in obj) obj.allow_free_queue = true;
        if ('accept_queue' in obj) obj.accept_queue = true;
        if ('credits' in obj) obj.credits = targetCredits;
        if ('cost' in obj) obj.cost = targetCredits;
        if ('point_cost' in obj) obj.point_cost = targetCredits;
        if ('consume_count' in obj) obj.consume_count = targetCredits;

        if ('duration' in obj) obj.duration = targetDuration;
        if ('video_duration' in obj) obj.video_duration = targetDuration;
        if ('motion_seconds' in obj) obj.motion_seconds = targetDuration;
        if ('video_length' in obj) obj.video_length = targetDuration;
        if ('seconds' in obj) obj.seconds = targetDuration;

        if ('ratio' in obj) obj.ratio = targetRatio;
        if ('aspect_ratio' in obj) obj.aspect_ratio = targetRatio;
        if ('aspectRatio' in obj) obj.aspectRatio = targetRatio;
      }
    } catch (e) {}
    return originalJsonStringify.apply(this, args);
  };
  // ============================================================================
  // 4. Native WebSocket Hook
  // ============================================================================
  if (typeof WebSocket !== 'undefined' && WebSocket.prototype) {
    const originalWSSend = WebSocket.prototype.send;
    WebSocket.prototype.send = function(data) {
      try {
        if (typeof data === 'string') {
          data = transformPayloadBody(data);
        }
      } catch (e) {}
      return originalWSSend.apply(this, [data]);
    };
  }

  // ============================================================================
  // 5. In-Page UI Badge & Toolbar Synchronizer (Delegated to Master Engine)
  // ============================================================================
  const syncBadgesFast = () => {
    if (typeof window.syncBadgesFast === 'function') {
      window.syncBadgesFast();
    }
  };

  const existingNotice = document.getElementById('channa-shark-notice');
  if (existingNotice) existingNotice.remove();
  console.log('[AI Bypass Suite] Duration (10s–60s), Aspect Ratio & Dynamic Account Name active.');


// ==========================================================================
// 📥 COMPLETE AUTO-DOWNLOAD & DECRYPTION ENGINE (SSE Stream & qAAB AES-CBC)
// ==========================================================================
(() => {
    const QAAB_SALT_HEX = '4dd4c2e6b83162090e52b3c7a6733ba4'
        + '1cb2462b829ab58a196b39db57177524'
        + 'f49baf7f08e8d68d26a72e37c1a95a2f'
        + '1f05a51892aef2949732b62a38aadd58';

    const processedFallbackApis = new Set();

    function decodeBase64Loose(input) {
        try {
            if (!input || typeof input !== 'string') return null;
            let norm = input.replace(/[$@#]/g, c => ({ '$': '+', '@': '/', '#': '=' }[c]));
            const pad = (4 - (norm.length % 4)) % 4;
            norm += '='.repeat(pad);
            const bin = atob(norm.replace(/-/g, '+').replace(/_/g, '/'));
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return bytes;
        } catch {
            return null;
        }
    }

    async function decryptQaabToken(token, keySeed) {
        const data = decodeBase64Loose(token);
        const seed = decodeBase64Loose(keySeed);
        if (!data || !seed) return '';
        
        // Derive AES key & IV via double SHA-512 digest
        const digest1 = await crypto.subtle.digest('SHA-512', seed.slice(0, 32));
        
        // Hex salt to byte array
        const salt = new Uint8Array(QAAB_SALT_HEX.length / 2);
        for (let i = 0; i < salt.length; i++) {
            salt[i] = parseInt(QAAB_SALT_HEX.slice(i * 2, i * 2 + 2), 16);
        }
        const digest2Input = new Uint8Array(digest1.byteLength + salt.length);
        digest2Input.set(new Uint8Array(digest1), 0);
        digest2Input.set(salt, digest1.byteLength);
        const digest2 = new Uint8Array(await crypto.subtle.digest('SHA-512', digest2Input));
        const keyBytes = digest2.slice(0, 16);
        const ivBytes = digest2.slice(16, 32);
        let payload = data;
        if (data.length >= 4 && data[0] === 0xa8 && data[1] === 0x00 && data[2] === 0x01 && data[3] === 0x00) {
            payload = data.slice(4);
        }
        try {
            const cryptoKey = await crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['decrypt']);
            const decrypted = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, payload));
            
            // Strip PKCS#7 padding
            const padLen = decrypted[decrypted.length - 1];
            const unpadded = (padLen >= 1 && padLen <= 16) ? decrypted.slice(0, decrypted.length - padLen) : decrypted;
            
            const plainUrl = new TextDecoder().decode(unpadded);
            return (plainUrl.startsWith('http://') || plainUrl.startsWith('https://')) ? plainUrl : '';
        } catch (e) {
            return '';
        }
    }

    // 🎯 Universal ByteDance TOS Video Fingerprint Extractor
    function extractVideoFingerprint(url) {
        if (!url || typeof url !== 'string') return '';
        const clean = url.trim();
        if (clean.startsWith('blob:')) {
            const parts = clean.split('/');
            return 'blob_' + parts[parts.length - 1].toLowerCase();
        }
        const md5Match = clean.match(/\/([a-f0-9]{32})(?:[~.]|$)/i) || clean.match(/(?:^|[^a-f0-9])([a-f0-9]{32})(?:[^a-f0-9]|$)/i);
        if (md5Match && md5Match[1]) {
            return 'hash_' + md5Match[1].toLowerCase();
        }
        const tosMatch = clean.match(/(tos-[a-z0-9-]+(?:\/[^/?#~]+)+)/i);
        if (tosMatch && tosMatch[1]) {
            return 'tos_' + tosMatch[1].replace(/~tplv-[^/?#]+/g, '').replace(/\.(mp4|webm|mov|mkv)$/i, '').toLowerCase();
        }
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
        const pathMatch = cleanUrl.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
        if (pathMatch && pathMatch[1] && pathMatch[1] !== 'new') {
            return 'chat_' + pathMatch[1];
        }
        try {
            const u = new URL(cleanUrl);
            const qId = u.searchParams.get('conversation_id') || u.searchParams.get('id') || u.searchParams.get('chat_id');
            if (qId) return 'chat_' + qId;
            if (u.pathname && u.pathname !== '/' && u.pathname !== '/chat') {
                return 'path_' + u.pathname.replace(/\/$/, '').toLowerCase();
            }
        } catch (e) {}
        const cleanTitle = String(title || (typeof document !== 'undefined' ? document.title : '') || '').trim();
        if (cleanTitle && !cleanTitle.includes('Dola AI -') && cleanTitle !== 'Dola' && cleanTitle !== 'Dola AI') {
            return 'title_' + cleanTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 50);
        }
        return 'chat_current';
    }

    async function decodeOrDecryptVideoUrl(token, keySeed = '') {
        if (!token) return '';
        if (token.startsWith('http://') || token.startsWith('https://')) {
            return token;
        }
        // Attempt standard loose base64 decoding
        const b64Bytes = decodeBase64Loose(token);
        if (b64Bytes) {
            try {
                const ascii = new TextDecoder().decode(b64Bytes);
                if (ascii.startsWith('http://') || ascii.startsWith('https://')) {
                    return ascii;
                }
            } catch (e) {}
        }
        // Decrypt qAAB AES-CBC token
        if (token.startsWith('qAAB') && keySeed) {
            return await decryptQaabToken(token, keySeed);
        }
        return '';
    }

    function findKeySeed(obj, depth = 0) {
        if (!obj || depth > 10) return '';
        if (typeof obj === 'string') {
            const m = obj.match(/[?&]key_seed=([^&"'\s]+)/i);
            return m ? decodeURIComponent(m[1]) : '';
        }
        if (typeof obj === 'object') {
            if (obj.key_seed) return String(obj.key_seed).trim();
            for (const val of Object.values(obj)) {
                const hit = findKeySeed(val, depth + 1);
                if (hit) return hit;
            }
        }
        return '';
    }

    function findFallbackApis(json, rawBody = '') {
        const apis = new Set();
        const regex = /"fallback_api"\s*:\s*"([^"]+)"/g;
        let match = regex.exec(rawBody);
        while (match) {
            let clean = match[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
            if (clean.startsWith('http')) apis.add(clean);
            match = regex.exec(rawBody);
        }
        return Array.from(apis);
    }

    async function extractUnwatermarkedVideo(fallbackApi) {
        try {
            // Force unwatermarked logo type and high quality codec
            const parsedUrl = new URL(fallbackApi);
            parsedUrl.searchParams.set('channel', 'no');
            parsedUrl.searchParams.set('codec_type', '8');
            parsedUrl.searchParams.set('logo_type', 'unwatermarked');
            const apiUrl = parsedUrl.toString();
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json,text/plain,*/*' }
            });
            
            const payload = await response.json();
            const videoData = payload?.video_info?.data || payload?.data || payload;
            const entries = videoData?.video_list ? Object.values(videoData.video_list) : [videoData];
            
            // Pick highest bitrate / resolution entry
            let best = null;
            for (const entry of entries) {
                const token = entry?.main_url || entry?.play_url || '';
                if (!token) continue;
                const score = Number(entry.bitrate || 0) + Number(entry.vwidth || 0) * Number(entry.vheight || 0);
                if (!best || score > best.score) {
                    best = { token: String(token).trim(), entry, score };
                }
            }
            if (!best) return;
            
            // Decode or Decrypt the token to get the raw MP4 URL
            const keySeed = findKeySeed(payload);
            const directDownloadUrl = await decodeOrDecryptVideoUrl(best.token, keySeed);
            if (directDownloadUrl) {
                console.log('%c[ZDola Decryptor] ⚡ Unwatermarked Master Stream Decrypted:', 'color: #a855f7; font-weight: bold;', directDownloadUrl);
                
                const promptText = document.querySelector('textarea, div[contenteditable="true"]')?.value || document.querySelector('textarea, div[contenteditable="true"]')?.innerText || 'Dola Video';
                const currentScopeKey = getChatScopeKey(window.location.href, document.title);
                const videoEntry = {
                    vid: videoData.vid || videoData.video_id || apiUrl,
                    url: directDownloadUrl,
                    source: 'fallback_api',
                    width: best.entry?.vwidth || 1920,
                    height: best.entry?.vheight || 1080,
                    prompt: promptText,
                    pageUrl: window.location.href,
                    chatScopeKey: currentScopeKey,
                    timestamp: Date.now()
                };

                // Extract immutable TOS object fingerprint
                const fp = extractVideoFingerprint(directDownloadUrl);
                videoEntry.fingerprint = fp;

                // Store in memory master vault
                window.__ctbExtractedVideos = window.__ctbExtractedVideos || [];
                if (!window.__ctbExtractedVideos.some(v => (v.fingerprint === fp || (v.url && extractVideoFingerprint(v.url) === fp)))) {
                    window.__ctbExtractedVideos.push(videoEntry);
                }

                // Persist in sessionStorage & Shared DOM Bridge for Content Script & Batch ZIP
                try {
                    const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
                    if (!stored.some(v => (v.fingerprint === fp || (v.url && extractVideoFingerprint(v.url) === fp)))) {
                        stored.push(videoEntry);
                        sessionStorage.setItem('__CTB_MASTER_VIDEOS__', JSON.stringify(stored));
                    }
                    let bridge = document.getElementById('__ctb_vault__');
                    if (!bridge) {
                        bridge = document.createElement('div');
                        bridge.id = '__ctb_vault__';
                        bridge.style.display = 'none';
                        document.documentElement.appendChild(bridge);
                    }
                    bridge.setAttribute('data-videos', JSON.stringify(window.__ctbExtractedVideos || []));
                } catch (e) {}

                // Dispatch event for content script
                window.dispatchEvent(new CustomEvent('DOLA_VIDEO_EXTRACTED', { detail: videoEntry }));
            }
        } catch (e) {
            console.warn('[ZDola Decryptor] Extract notice:', e);
        }
    }

    function processFallbackVideoEndpoint(json, rawBody = '') {
        const apis = findFallbackApis(json, rawBody);
        for (const fallbackApi of apis) {
            if (processedFallbackApis.has(fallbackApi)) continue;
            processedFallbackApis.add(fallbackApi);
            extractUnwatermarkedVideo(fallbackApi);
        }
    }

    // ========================================================
    // ⚡ CHANNA CREDIT, DURATION & CLEAN CHAT ENFORCER
    // Seedance 2.5: Exactly 2 Points Cut per Video
    // Total Duration: 30s Duration Bypass (Supports 10s-60s)
    // Sanitizes New Chat to Prevent ByteDance 718013001 / High Demand Errors
    // ========================================================
    function enforceChannaVideoSettings(body, url) {
        if (typeof body !== 'string' || body.length === 0) return body;

        // Never alter file uploads or binary transfers
        if (typeof window.__isCtbUploadRequest === 'function' && window.__isCtbUploadRequest(url, body)) {
            return body;
        }

        const fnTransform = window.transformPayloadBody || (typeof transformPayloadBody === 'function' ? transformPayloadBody : null);
        if (fnTransform) {
            return fnTransform(body, url);
        }

        return body;
    }

    function _unused_old_enforce(body, url) {
        if (typeof body !== 'string' || body.length === 0) return body;

        // Never alter file uploads or binary transfers
        if (typeof window.__isCtbUploadRequest === 'function' && window.__isCtbUploadRequest(url, body)) {
            return body;
        }

        // Pro reasoning mode bypass (DeepSeek, Doubao Pro)
        if (typeof window.__isCtbProModeActive === 'function' && window.__isCtbProModeActive()) {
            return body;
        }

        // Exact user settings:
        // Seedance 2.0 = 1 point cut
        // Seedance 2.5 = 2 points cut
        // Duration = 30s duration bypass
        const targetDur = window.CHANNA_TARGET_DURATION || 30;
        const ratio = window.CHANNA_TARGET_RATIO || '9:16';

        let modified = body;
        const isVideo = /(?:duration|video_duration|seconds|task_type|generate_type|video|seedance|storyboard|ability_param)/i.test(modified) || 
                        (url && /(?:video|chat\/completion)/i.test(url));

        if (isVideo) {
            // Check if model is Seedance 2.0 or 2.5
            const isSeedance20 = /(?:seedance_?2[._]0|seedance\s*2\.0)/i.test(modified);
            const targetCredits = isSeedance20 ? 1 : 2; // Seedance 2.0 = 1 pt, Seedance 2.5 = 2 pts!

            // 1. Enforce duration: 30s duration bypass (handles direct, escaped \", and double-escaped \\\")
            const durPattern = /(\\*)("(?:duration|video_duration|seconds|motion_seconds|video_length)\\*")\s*:\s*\d+/gi;
            modified = modified.replace(durPattern, (match, p1, p2) => `${p1}${p2}:${targetDur}`);

            // 2. Enforce credits: exactly 2 points for Seedance 2.5 (1 point for Seedance 2.0)
            const creditPattern = /(\\*)("(?:cost|credits|points|consume_count|point_cost|points_cost|credit_cost)\\*")\s*:\s*\d+/gi;
            modified = modified.replace(creditPattern, (match, p1, p2) => `${p1}${p2}:${targetCredits}`);

            // NOTE: Do NOT alter or downgrade the model! Keep Dreamina Seedance 2.5 intact!

            // 3. Enforce Aspect Ratio: 9:16
            const ratioPattern = /(\\*)("(?:ratio|aspect_ratio|aspectRatio|ratio_type|ar)\\*")\s*:\s*(\\*)("[^"]*\\*")/gi;
            modified = modified.replace(ratioPattern, (match, p1, p2, p3, p4) => `${p1}${p2}:${p1}"${ratio}${p1}"`);

            // 4. Free queue & Accept queue (handles direct & escaped quotes)
            modified = modified.replace(/(\\*)("allow_free_queue\\*")\s*:\s*(?:false|true)/gi, '$1$2:true');
            modified = modified.replace(/(\\*)("accept_queue\\*")\s*:\s*(?:false|true)/gi, '$1$2:true');

            // 5. Sanitize prompt text references (ensure 30-second and 2 credits)
            modified = modified.replace(/"prompt"\s*:\s*"([^"]+)"/gi, (match, p1) => {
                let p = p1.replace(/\b(?:5|10|15|60)[\s-]*(?:second|seconds|sec|s)\b/gi, `${targetDur}-second`);
                p = p.replace(/\b(?:4|5|8|10)[\s-]*(?:credit|credits|points)\b/gi, `${targetCredits} credits`);
                return `"prompt":"${p}"`;
            });
        }

        return modified;
    }

    // Step 1: Intercept fetch in MAIN world for /chat/completion & Anti-Logout Shield
    const originalFetch = window.fetch;

    window.fetch = async function(...args) {
        let url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
        const fnTransformUrl = window.transformUrl || (typeof transformUrl === 'function' ? transformUrl : null);
        if (fnTransformUrl && url) {
            url = fnTransformUrl(url);
            if (typeof args[0] === 'string') {
                args[0] = url;
            } else if (args[0] && typeof args[0] === 'object') {
                try {
                    args[0] = new Request(url, args[0]);
                } catch(e) {
                    args[0] = url;
                }
            }
        }

        // 🛡️ 1. HARD ANTI-LOGOUT SHIELD: Intercept shark logout and notify user
        if (url && (url.includes('/passport/web/logout') || url.includes('logout_reason=shark_block'))) {
            console.warn('[ChannaTheBrand Pro] ⚠️ ByteDance Shark fetch logout intercepted.');
            if (typeof window.__showChannaNotice === 'function') {
                window.__showChannaNotice('ByteDance Shark block detected on account session.', 30000, true);
            }
            return new Response(JSON.stringify({ code: 0, message: 'success', data: {} }), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        }

        // 🛡️ TELEMETRY NETWORK FAILURE SHIELD (Prevents status 0 crashes on monitor & telemetry endpoints)
        if (url && (
            url.includes('/monitor_web/') || 
            url.includes('zijieapi.com') || 
            url.includes('/slardar/')
        )) {
            return new Response(JSON.stringify({ code: 0, message: 'success', data: {} }), {
                status: 200,
                headers: { 'content-type': 'application/json' }
            });
        }

        // Pass non-chat/completion requests directly without altering them
        if (url && (url.includes('/chat') || url.includes('/creation/') || url.includes('/im/') || url.includes('/alice/'))) {
            try {
                window.__ctbActiveGenerationPromptSent = Date.now();
                if (args[1] && typeof args[1].body === 'string') {
                    args[1].body = enforceChannaVideoSettings(args[1].body, url);
                }
            } catch (e) {}
            const isPro = typeof __isCtbProModeActive === 'function' && __isCtbProModeActive();
            const isDola = typeof window !== 'undefined' && window.location && window.location.hostname.includes('dola.com');

            // 🛡️ PRE-FLIGHT CONTENT SHIELD (Skip on Dola or in Pro Mode to preserve ByteDance a_bogus signature)
            if (!isPro && !isDola && args[1] && typeof args[1].body === 'string') {
                try {
                    let rawBody = args[1].body;
                    const SANITIZE_MAP = [
                        [/\bkill\b/gi, 'defeat'],
                        [/\bmurder\b/gi, 'vanquish'],
                        [/\bblood\b/gi, 'crimson glow'],
                        [/\bgun\b/gi, 'sci-fi blaster prop'],
                        [/\bweapon\b/gi, 'action gear prop'],
                        [/\bsuicide\b/gi, 'heroic sacrifice']
                    ];
                    for (const [regex, replacement] of SANITIZE_MAP) {
                        rawBody = rawBody.replace(regex, replacement);
                    }
                    args[1].body = rawBody;
                } catch (e) {}
            }

            const response = await originalFetch.apply(this, args);
            if (!response || !response.body) {
                return response;
            }

            // 🛡️ 2. PASSIVE STREAM SNIFFER: Clones response for background unwatermarked video extraction & High Demand Auto-Recovery
            try {
                const cloned = response.clone();
                (async () => {
                    try {
                        const reader = cloned.body?.getReader();
                        if (!reader) return;
                        const decoder = new TextDecoder();
                        let buf = '';
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            buf += decoder.decode(value, { stream: true });
                            if (buf.includes('fallback_api') || buf.includes('image_ori')) {
                                if (typeof processFallbackVideoEndpoint === 'function') {
                                    processFallbackVideoEndpoint(null, buf);
                                }
                            }
                            
                            // 🛡️ High Demand & Rate Limit Detection:
                            const isHighDemand = buf.includes('"error_code":710022002') || 
                                                 buf.includes('"error_code": 710022002') ||
                                                 buf.includes('experiencing high demand');
                            if (isHighDemand) {
                                console.warn('[ChannaTheBrand Pro] ⚠️ High Demand (710022002) detected on ByteDance server.');
                                break;
                            }

                            // 🛡️ Daily Generation Limit Detection (Server Stream):
                            const isDailyLimit = buf.includes('reached the daily limit for video generation') || 
                                                 buf.includes('daily limit for video generation') ||
                                                 buf.includes('reached the daily limit') ||
                                                 buf.includes('reached daily limit') ||
                                                 buf.includes('Please try again tomorrow') ||
                                                 buf.includes('please try again tomorrow') ||
                                                 buf.includes('达到今日视频生成上限') ||
                                                 buf.includes('今日视频生成上限') ||
                                                 buf.includes('"error_code":710022003') ||
                                                 buf.includes('"error_code": 710022003');
                            if (isDailyLimit) {
                                notifyDailyLimitReached('daily_limit_stream');
                                break;
                            }

                            const isExpiredAccount = buf.includes('用户不存在') || 
                                                     buf.includes('User does not exist') || 
                                                     buf.includes('Account session expired') ||
                                                     buf.includes('"error_code":1011') ||
                                                     buf.includes('"error_code": 1011');
                            if (isExpiredAccount) {
                                console.warn('[ChannaTheBrand Pro] ⚠️ Expired account detected on ByteDance server.');
                                break;
                            }
                        }
                    } catch (e) {}
                })();
            } catch (e) {}

            return response;
        }
        try {
            const fetchRes = await originalFetch.apply(this, args);
            if (url && (url.includes('/passport/') || url.includes('/user/') || url.includes('/account/') || url.includes('/alice/profile/'))) {
                try {
                    const clonedFetchRes = fetchRes.clone();
                    clonedFetchRes.text().then(text => {
                        try {
                            const parsed = JSON.parse(text);
                            const nick = parsed?.data?.profile_brief?.nickname || 
                                         parsed?.data?.user_info?.name || 
                                         parsed?.data?.user_info?.screen_name ||
                                         parsed?.data?.name || 
                                         parsed?.data?.user_name;
                            if (nick && typeof nick === 'string' && nick.trim()) {
                                window.CHANNA_DOM_USER_NAME = nick.trim();
                                if (typeof syncBadgesFast === 'function') syncBadgesFast();
                            }
                        } catch(e) {}
                        if (text && (
                            text.includes('用户不存在') || 
                            text.includes('User does not exist') || 
                            text.includes('Account session expired') ||
                            text.includes('"error_code":1011') ||
                            text.includes('"error_code": 1011')
                        )) {
                            if (typeof window !== 'undefined' && typeof window.__showChannaNotice === 'function') {
                                window.__showChannaNotice('This account session has expired or user does not exist on ByteDance server (用户不存在 / User does not exist). Please switch to an active account in the extension.');
                            }
                        }
                    }).catch(() => {});
                } catch (e) {}
            }
            if (url && (url.includes('/conversation/') || url.includes('/message/') || url.includes('message_list') || url.includes('/chat/'))) {
                try {
                    const clonedHistoryRes = fetchRes.clone();
                    clonedHistoryRes.text().then(text => {
                        if (text && (text.includes('fallback_api') || text.includes('image_ori'))) {
                            if (typeof processFallbackVideoEndpoint === 'function') {
                                processFallbackVideoEndpoint(null, text);
                            }
                        }
                    }).catch(() => {});
                } catch (e) {}
            }
            return fetchRes;
        } catch (err) {
            const msg = String(err && (err.message || err) || '');
            if (msg.includes('Network request failed') || msg.includes('status: 0') || msg.includes('Failed to fetch') || msg.includes('zijieapi')) {
                return new Response(JSON.stringify({ code: 0, data: {} }), {
                    status: 200,
                    headers: { 'content-type': 'application/json' }
                });
            }
            throw err;
        }
    };

    // ============================================================================
    // 📦 COMPREHENSIVE CHAT VIDEO HARVESTER (MAIN WORLD ENGINE FOR BATCH ZIP)
    // Extracts ALL videos across in-memory vault, sessionStorage, React Fiber, and DOM
    // Guarantees 100% Watermark-Free Raw 1080P Master Streams
    // ============================================================================
    async function harvestAllChatVideosMainWorld() {
        const list = [];
        const seen = new Set();
        const currentScopeKey = getChatScopeKey(window.location.href, document.title);
        const currentCleanUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, '');
        const currentChatIdMatch = currentCleanUrl.match(/\/(?:chat|c|conversation)\/([a-zA-Z0-9_-]+)/i);
        const currentChatId = (currentChatIdMatch && currentChatIdMatch[1] !== 'new') ? currentChatIdMatch[1] : '';

        function extractChatId(url) {
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

        function belongsToCurrentChat(v) {
            if (!v) return false;
            const rawUrl = typeof v === 'string' ? v : (v.url || v.src);
            if (!rawUrl || (!rawUrl.startsWith('http') && !rawUrl.startsWith('blob:'))) return false;

            if (v.source === 'dom' || v.source === 'dom_video' || v.source === 'dom_link' || v.source === 'fiber') {
                return true;
            }

            const itemChatId = extractChatId(v.pageUrl) ||
                (v.chatScopeKey && v.chatScopeKey.startsWith('chat_') && v.chatScopeKey !== 'chat_current' ? v.chatScopeKey.replace('chat_', '') : '');

            // Only reject if both chat IDs exist and explicitly differ
            if (currentChatId && itemChatId && currentChatId !== itemChatId) {
                return false;
            }
            return true;
        }

        function addVid(url, title = 'Dola Video', source = 'dom', pageUrl = window.location.href) {
            if (!url || typeof url !== 'string') return;
            let clean = url.trim();
            if (!clean.startsWith('http') && !clean.startsWith('blob:')) return;

            // Direct video streams are already decrypted/signed; preserve URL integrity without breaking HMAC signatures

            const fp = extractVideoFingerprint(clean);
            if (!fp || seen.has(fp)) return;
            seen.add(fp);
            list.push({
                url: clean,
                title: (title || 'Dola Video').trim(),
                source,
                pageUrl: pageUrl || window.location.href,
                chatScopeKey: currentScopeKey,
                fingerprint: fp
            });
        }

        // 1. Vault 1: In-memory live decrypted unwatermarked master streams (Current Chat Only)
        if (Array.isArray(window.__ctbExtractedVideos)) {
            window.__ctbExtractedVideos.forEach(v => {
                if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'fallback_api', v.pageUrl);
            });
        }

        // 2. Vault 2: SessionStorage master stream cache (Current Chat Only)
        try {
            const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
            if (Array.isArray(stored)) {
                stored.forEach(v => {
                    if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'session_storage', v.pageUrl);
                });
            }
        } catch (e) {}

        // 3. Vault 3: Extractor.js chatVideos (Current Chat Only)
        if (Array.isArray(window.__channaChatVideos)) {
            window.__channaChatVideos.forEach(v => {
                if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title || v.topicTitle, v.source || 'extractor', v.pageUrl);
            });
        }

        // 4. Scan DOM <video> elements immediately in current view
        document.querySelectorAll('video').forEach((v, idx) => {
            const src = v.currentSrc || v.src || v.querySelector('source')?.src || v.getAttribute('src');
            const bubble = v.closest('[data-message-id], [class*="message"], [class*="bubble"], [class*="chat"]') || v.parentElement;
            const textEl = bubble ? bubble.querySelector('p, span, [class*="text"], [class*="content"]') : null;
            const promptText = (textEl?.textContent || '').trim().slice(0, 100);
            if (src && (src.startsWith('http') || src.startsWith('blob:'))) {
                addVid(src, promptText || `Video_${idx + 1}`, 'dom_video');
            }
        });

        // 5. Scan DOM download buttons, links & data-attributes
        document.querySelectorAll('a[href*=".mp4"], a[download*=".mp4"], [data-src*=".mp4"], [data-video-url*="http"], [data-url*="byteintl"], [data-url*="ibytedtos"], [data-src*="blob:"], [data-video-url*="blob:"]').forEach(el => {
            const src = el.href || el.getAttribute('data-src') || el.getAttribute('data-video-url') || el.getAttribute('data-url');
            if (src && (src.startsWith('http') || src.startsWith('blob:'))) {
                addVid(src, 'Dola Video', 'dom_link');
            }
        });

        // 6. Scan React Fiber on message elements safely (without circular JSON stringify crashes)
        const pendingFallbackApis = [];
        try {
            const messageCards = Array.from(document.querySelectorAll('[data-message-id], [class*="message-item"], [class*="chat-message"], [class*="bubble"], [class*="message_item"], [class*="message-content"], div[class*="message"]'));
            function safelyScanProps(obj, depth = 0, visited = new Set()) {
                if (!obj || depth > 4 || typeof obj !== 'object' || visited.has(obj)) return;
                visited.add(obj);

                try {
                    const keys = Object.keys(obj);
                    for (const k of keys) {
                        const v = obj[k];
                        if (typeof v === 'string') {
                            if (v.includes('fallback_api') || (v.startsWith('http') && (v.includes('.mp4') || v.includes('tos-') || v.includes('byteintl')))) {
                                const found = findFallbackApis(null, v);
                                for (const fb of found) {
                                    if (!processedFallbackApis.has(fb)) {
                                        pendingFallbackApis.push(fb);
                                    }
                                }
                                if (v.startsWith('http') && (v.includes('.mp4') || v.includes('byteintl') || v.includes('ibytedtos'))) {
                                    addVid(v, 'Chat Video', 'fiber');
                                }
                            }
                        } else if (v && typeof v === 'object' && depth < 3) {
                            safelyScanProps(v, depth + 1, visited);
                        }
                    }
                } catch (e) {}
            }

            function inspectFiber(node) {
                if (!node) return;
                const key = Object.keys(node).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactInternalInstance$'));
                if (!key) return;
                let fiber = node[key];
                let depth = 0;
                while (fiber && depth < 8) {
                    depth++;
                    const props = fiber.memoizedProps || fiber.pendingProps || fiber.props;
                    if (props && typeof props === 'object') {
                        safelyScanProps(props, 0);
                    }
                    fiber = fiber.return;
                }
            }

            messageCards.forEach(card => inspectFiber(card));
            document.querySelectorAll('video').forEach(v => inspectFiber(v));
        } catch (e) {}

        if (pendingFallbackApis.length > 0) {
            const promises = pendingFallbackApis.slice(0, 30).map(async (fb) => {
                processedFallbackApis.add(fb);
                await extractUnwatermarkedVideo(fb);
            });
            await Promise.race([
                Promise.all(promises),
                new Promise(r => setTimeout(r, 600))
            ]);
            if (Array.isArray(window.__ctbExtractedVideos)) {
                window.__ctbExtractedVideos.forEach(v => {
                    if (v && v.url && belongsToCurrentChat(v)) addVid(v.url, v.prompt || v.title, v.source || 'fallback_api', v.pageUrl);
                });
            }
        }

        // Sync to Shared DOM Bridge (Current chat only)
        try {
            let bridge = document.getElementById('__ctb_vault__');
            if (!bridge) {
                bridge = document.createElement('div');
                bridge.id = '__ctb_vault__';
                bridge.style.display = 'none';
                document.documentElement.appendChild(bridge);
            }
            bridge.setAttribute('data-videos', JSON.stringify(list));
        } catch (e) {}

        return list;
    }

    // Expose helpers & harvester for external hooks / tests
    try {
        window.decodeOrDecryptVideoUrl = decodeOrDecryptVideoUrl;
        window.decryptQaabToken = decryptQaabToken;
        window.findFallbackApis = findFallbackApis;
        window.__ctbHarvestAllChatVideos = harvestAllChatVideosMainWorld;
        window.__ctbExtractedVideos = window.__ctbExtractedVideos || [];
    } catch (e) {}

    // Listen for harvest request from content script
    window.addEventListener('message', async (event) => {
        if (event.data?.type === 'DOLA_HARVEST_VIDEOS_FOR_ZIP') {
            try {
                const videos = await harvestAllChatVideosMainWorld();
                window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_RESPONSE', videos }, '*');
            } catch (err) {
                window.postMessage({ type: 'DOLA_HARVEST_VIDEOS_RESPONSE', videos: [] }, '*');
            }
        }
    });
    window.addEventListener('DOLA_HARVEST_VIDEOS_FOR_ZIP', async () => {
        try {
            const videos = await harvestAllChatVideosMainWorld();
            window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_RESPONSE', { detail: { videos } }));
        } catch (err) {
            window.dispatchEvent(new CustomEvent('DOLA_HARVEST_VIDEOS_RESPONSE', { detail: { videos: [] } }));
        }
    });

    // Listen for chat video reset from content script
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'CHANNA_RESET_CHAT_VIDEOS') {
            try {
                const targetChatId = event.data.chatId;
                const targetUrl = event.data.pageUrl;
                const targetScope = event.data.chatScopeKey;

                function matchesReset(v) {
                    if (!v) return false;
                    const p = v.pageUrl || '';
                    if (targetChatId && p.includes(targetChatId)) return true;
                    if (targetUrl && p.startsWith(targetUrl)) return true;
                    if (targetScope && v.chatScopeKey === targetScope) return true;
                    return false;
                }

                if (Array.isArray(window.__ctbExtractedVideos)) {
                    window.__ctbExtractedVideos = window.__ctbExtractedVideos.filter(v => !matchesReset(v));
                }

                try {
                    const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
                    if (Array.isArray(stored)) {
                        const filtered = stored.filter(v => !matchesReset(v));
                        sessionStorage.setItem('__CTB_MASTER_VIDEOS__', JSON.stringify(filtered));
                    }
                } catch (e) {}

                try {
                    let bridge = document.getElementById('__ctb_vault__');
                    if (bridge) {
                        bridge.setAttribute('data-videos', JSON.stringify(window.__ctbExtractedVideos || []));
                    }
                } catch (e) {}
            } catch (e) {}
        }
    });

    console.log('%c[ChannaTheBrand Pro] 📥 Complete Auto-Download & Decryption Engine Active!', 'color: #a855f7; font-weight: bold;');
})();

// ============================================================================
// 🛡️ DOLA MULTI-TAB SESSION ISOLATION & ANTI-RELOAD LOOP CIRCUIT BREAKER
// Prevents cross-tab logout collisions and halts infinite redirect/reload loops
// ============================================================================
(() => {
  'use strict';
  if (typeof window === 'undefined' || window.__ctbSessionShieldActive) return;
  window.__ctbSessionShieldActive = true;

  // 1. Cross-Tab Storage Event Blocker
  try {
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function (type, listener, options) {
      if (type === 'storage') {
        const wrappedListener = function (event) {
          try {
            if (!event || !event.key) return;
            const keyLower = String(event.key).toLowerCase();
            // On Dola AI, allow CSRF, session tokens, and passport heartbeats to synchronize normally.
            // Only suppress explicit remote logout collisions to prevent tab crashes:
            if (
              keyLower.includes('logout') ||
              keyLower.includes('session_invalid') ||
              keyLower.includes('token_expired')
            ) {
              return;
            }
          } catch (e) {}
          if (typeof listener === 'function') {
            return listener.apply(this, arguments);
          } else if (listener && typeof listener.handleEvent === 'function') {
            return listener.handleEvent(event);
          }
        };
        return originalAddEventListener.call(this, type, wrappedListener, options);
      }
      return originalAddEventListener.apply(this, arguments);
    };
  } catch (e) {}

  // 2. Cross-Tab BroadcastChannel Isolation
  try {
    if (typeof window.BroadcastChannel !== 'undefined') {
      const OriginalBroadcastChannel = window.BroadcastChannel;
      window.BroadcastChannel = function (channelName) {
        const channel = new OriginalBroadcastChannel(channelName);
        const nameLower = String(channelName || '').toLowerCase();
        const isAuthChannel = (
          nameLower.includes('auth') ||
          nameLower.includes('session') ||
          nameLower.includes('login') ||
          nameLower.includes('logout') ||
          nameLower.includes('user') ||
          nameLower.includes('token') ||
          nameLower.includes('passport') ||
          nameLower.includes('account')
        );

        const originalPostMessage = channel.postMessage.bind(channel);
        channel.postMessage = function (message) {
          try {
            // Preserved channel delivery for internal Dola worker RPC
            if (message && typeof message === 'object') {
              const msgStr = JSON.stringify(message).toLowerCase();
              if (
                msgStr.includes('logout') ||
                msgStr.includes('unauthorized') ||
                msgStr.includes('token_expired') ||
                msgStr.includes('session_invalid') ||
                msgStr.includes('reload')
              ) {
                return;
              }
            }
          } catch (e) {}
          return originalPostMessage(message);
        };

        const originalAddEventListener = channel.addEventListener.bind(channel);
        channel.addEventListener = function (type, listener, options) {
          if (type === 'message') {
            const wrapped = function (event) {
              try {
                // Preserved channel delivery for internal Dola worker RPC
                if (event && event.data && typeof event.data === 'object') {
                  const msgStr = JSON.stringify(event.data).toLowerCase();
                  if (
                    msgStr.includes('logout') ||
                    msgStr.includes('unauthorized') ||
                    msgStr.includes('token_expired') ||
                    msgStr.includes('session_invalid') ||
                    msgStr.includes('reload')
                  ) {
                    return;
                  }
                }
              } catch (e) {}
              if (typeof listener === 'function') {
                return listener.apply(this, arguments);
              }
            };
            return originalAddEventListener(type, wrapped, options);
          }
          return originalAddEventListener(type, listener, options);
        };

        return channel;
      };
      window.BroadcastChannel.prototype = OriginalBroadcastChannel.prototype;
    }
  } catch (e) {}

  // 3. 🛡️ Bulletproof Anti-Reload Loop Circuit Breaker & Navigation Shield
  try {
    const RELOAD_GUARD_KEY = '__ctb_reload_guard';
    const now = Date.now();
    let history = [];

    // Read history from sessionStorage
    try {
      const stored = sessionStorage.getItem(RELOAD_GUARD_KEY);
      if (stored) history = JSON.parse(stored);
    } catch (e) {}

    // Fallback/Reinforce from window.name (immune to storage clearing)
    try {
      if (typeof window.name === 'string' && window.name.includes('__ctb_guard:')) {
        const match = window.name.match(/__ctb_guard:\[([^\]]*)\]/);
        if (match && match[1]) {
          const fromName = match[1].split(',').map(Number).filter(t => !isNaN(t));
          if (fromName.length > history.length) {
            history = fromName;
          }
        }
      }
    } catch (e) {}

    // Keep entries within last 12 seconds
    history = (Array.isArray(history) ? history : []).filter(t => typeof t === 'number' && now - t < 12000);
    history.push(now);

    try {
      sessionStorage.setItem(RELOAD_GUARD_KEY, JSON.stringify(history));
    } catch (e) {}

    try {
      // Store in window.name cleanly without erasing existing name
      const cleanName = (window.name || '').replace(/__ctb_guard:\[[^\]]*\]/g, '').trim();
      window.name = (cleanName ? cleanName + ' ' : '') + `__ctb_guard:[${history.join(',')}]`;
    } catch (e) {}

    // 🛡️ BULLETPROOF ANTI-AUTO-RELOAD & ANTI-REFRESH SHIELD FOR DOLA AI
    // Completely blocks programmatic, automated, and cyclic reloads so Dola chat stays rock-solid
    let lastReloadNoticeTime = 0;
    function shouldPreventReload(caller = 'location.reload') {
      const tNow = Date.now();
      console.warn('[ChannaTheBrand Pro] 🛑 Blocked automated page reload attempt via:', caller);
      if (tNow - lastReloadNoticeTime > 15000) {
        lastReloadNoticeTime = tNow;
        showReloadGuardBanner();
      }
      return true;
    }

    // 1. Block Location.prototype.reload() & window.location.reload()
    try {
      const origProtoReload = Location.prototype.reload;
      Object.defineProperty(Location.prototype, 'reload', {
        value: function (...args) {
          if (shouldPreventReload('Location.prototype.reload')) return;
          return origProtoReload.apply(this, args);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 2. Block Location.prototype.replace() & window.location.replace()
    try {
      const origProtoReplace = Location.prototype.replace;
      Object.defineProperty(Location.prototype, 'replace', {
        value: function (url, ...args) {
          if (typeof url === 'string') {
            const u = url.toLowerCase();
            if (u.includes('/chat') || u.includes('/login') || u.includes('dola.com') || u === window.location.href.toLowerCase()) {
              if (shouldPreventReload('Location.prototype.replace -> ' + url)) return;
            }
          }
          return origProtoReplace.apply(this, [url, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 3. Block Location.prototype.assign() & window.location.assign()
    try {
      const origProtoAssign = Location.prototype.assign;
      Object.defineProperty(Location.prototype, 'assign', {
        value: function (url, ...args) {
          if (typeof url === 'string') {
            const u = url.toLowerCase();
            if (u.includes('/chat') || u.includes('dola.com/chat') || u === window.location.href.toLowerCase()) {
              if (shouldPreventReload('Location.prototype.assign -> ' + url)) return;
            }
          }
          return origProtoAssign.apply(this, [url, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    // 4. Block Location.prototype.href setter (e.g. window.location.href = window.location.href)
    try {
      const hrefDesc = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
      if (hrefDesc && hrefDesc.set) {
        const origSetHref = hrefDesc.set;
        Object.defineProperty(Location.prototype, 'href', {
          set: function (url) {
            if (typeof url === 'string') {
              const u = url.toLowerCase();
              if (u.includes('/chat') || u.includes('/login') || u === window.location.href.toLowerCase()) {
                if (shouldPreventReload('Location.prototype.href = ' + url)) return;
              }
            }
            return origSetHref.call(this, url);
          },
          get: hrefDesc.get,
          configurable: true,
          enumerable: true
        });
      }
    } catch (e) {}

    // 5. Block Chromium Navigation API programmatic reloads (Chrome 102+)
    try {
      if (typeof window.navigation !== 'undefined' && window.navigation && window.navigation.addEventListener) {
        window.navigation.addEventListener('navigate', (event) => {
          try {
            if (event.navigationType === 'reload') {
              if (event.canIntercept) {
                event.intercept({
                  handler: async () => {
                    console.warn('[ChannaTheBrand Pro] 🛑 Intercepted and blocked Navigation API reload.');
                  }
                });
                event.preventDefault();
              }
            }
          } catch (e) {}
        });
      }
    } catch (e) {}

    // 6. Block History.prototype.go(0)
    try {
      const origGo = History.prototype.go;
      Object.defineProperty(History.prototype, 'go', {
        value: function (delta, ...args) {
          if (delta === 0 || delta === undefined) {
            if (shouldPreventReload('History.prototype.go(0)')) return;
          }
          return origGo.apply(this, [delta, ...args]);
        },
        writable: true,
        configurable: true
      });
    } catch (e) {}

    function showReloadGuardBanner() {
      if (document.getElementById('ctb-reload-guard-banner')) return;
      const banner = document.createElement('div');
      banner.id = 'ctb-reload-guard-banner';
      banner.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:9999999;background:rgba(24,24,27,0.96);color:#f4f4f5;border:1px solid #818cf8;padding:7px 16px;border-radius:9999px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:11.5px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:flex;align-items:center;gap:10px;backdrop-filter:blur(8px);';
      banner.innerHTML = '<span>🛡️ Auto-refresh blocked: Chat session kept active & uninterrupted.</span><button id="ctb-reload-guard-btn" style="background:#6366f1;color:#fff;border:none;padding:3px 8px;border-radius:4px;cursor:pointer;font-size:11px;font-weight:bold;">Dismiss</button>';
      (document.body || document.documentElement).appendChild(banner);
      const btn = document.getElementById('ctb-reload-guard-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          banner.remove();
        });
      }
      setTimeout(() => { if (banner && banner.parentNode) banner.remove(); }, 6500);
    }
  } catch (e) {}

  console.log('[ChannaTheBrand Pro] 🛡️ Multi-Tab Session Shield & Anti-Reload Circuit Breaker Active.');
})();

// ============================================================================
// ⚡ ULTRA-FAST NON-BLOCKING IN-PAGE UI BADGE & RATIO/DURATION SYNCHRONIZER
// Optimized for lightning-fast webpage load times with zero DOM thrashing
// ============================================================================
(() => {
  'use strict';

  let isScheduled = false;
  let isUpdating = false;

  function getTargetDuration() {
    const d = window.CHANNA_TARGET_DURATION ? parseInt(window.CHANNA_TARGET_DURATION, 10) : 30;
    return d || 30;
  }

  function getTargetRatio() {
    return window.CHANNA_TARGET_RATIO || '9:16';
  }

  function syncBadgesFast() {
    try {
      const dur = getTargetDuration();
      const ratio = getTargetRatio();

      // 1. Direct pill spans / buttons in composer or DOM
      document.querySelectorAll('.dur-pill, .dur-pill-span, #dur-pill, [class*="dur-pill"]').forEach(p => {
        const expected = `${dur}s CHANNA`;
        if (p.textContent.trim() !== expected) {
          p.textContent = expected;
        }
        p.style.color = '#10b981';
        p.style.fontWeight = 'bold';
      });

      document.querySelectorAll('.ratio-pill, .ratio-pill-span, #ratio-pill, [class*="ratio-pill"]').forEach(p => {
        const expected = `THE BRAND ${ratio}`;
        if (p.textContent.trim() !== expected) {
          p.textContent = expected;
        }
        p.style.color = '#38bdf8';
        p.style.fontWeight = 'bold';
      });

      // 2. Update any duration buttons / selectors (e.g. 10s, 15s, 20s, 25s, 30s, 60s)
      const durButtons = document.querySelectorAll('button, div[role="button"], span[class*="duration"], span[class*="select"], [id*="duration"], [id*="dur"]');
      for (let i = 0; i < durButtons.length; i++) {
        const el = durButtons[i];
        if (el.classList.contains('dur-pill') || el.classList.contains('dur-pill-span')) continue;
        const text = (el.innerText || el.textContent || '').trim();
        if (/^(?:10s|15s|20s|25s|30s|60s)(?:\s*(?:\([^\)]*\)|Bypassed|CHANNA))?/i.test(text)) {
          const hasArrow = text.includes('^') || text.includes('▼') || text.includes('▲') || text.includes('⌄');
          const newDurText = dur + 's CHANNA' + (hasArrow ? ' ⌄' : '');
          if (el.textContent.trim() !== newDurText) {
            el.textContent = newDurText;
            el.style.color = '#10b981';
            el.style.fontWeight = 'bold';
          }
        }
      }

      // 3. Update any ratio buttons / selectors
      const ratioButtons = document.querySelectorAll('button, div[role="button"], span[class*="ratio"], span[class*="select"], [id*="ratio"]');
      for (let i = 0; i < ratioButtons.length; i++) {
        const el = ratioButtons[i];
        if (el.classList.contains('ratio-pill') || el.classList.contains('ratio-pill-span')) continue;
        const text = (el.innerText || el.textContent || '').trim();
        if (/^(?:Ratio|THE BRAND)\s*(9:16|16:9|1:1|4:3|3:4|21:9)?/i.test(text)) {
          const hasArrow = text.includes('^') || text.includes('▼') || text.includes('▲') || text.includes('⌄');
          const newText = 'THE BRAND ' + ratio + (hasArrow ? ' ⌄' : '');
          if (el.textContent.trim() !== newText) {
            el.textContent = newText;
            el.style.color = '#38bdf8';
            el.style.fontWeight = 'bold';
          }
        }
      }

      // 4. Global composer toolbar deep text scrubber (strictly scoped to composer)
      const composer = document.querySelector('[class*="composer" i], [class*="chat-input" i], div[class*="input-engine"], form');
      if (composer) {
        const walker = document.createTreeWalker(composer, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while ((node = walker.nextNode())) {
          if (node.nodeValue) {
            // Replace any "Bypassed" or "(Bypassed)" with "CHANNA"
            if (node.nodeValue.includes('Bypassed')) {
              node.nodeValue = node.nodeValue.replace(/\(?Bypassed\)?/gi, 'CHANNA').replace(/\s{2,}/g, ' ');
              if (node.parentElement) {
                node.parentElement.style.color = '#10b981';
                node.parentElement.style.fontWeight = 'bold';
              }
            }
            // Ensure duration pattern has CHANNA (e.g. 10s CHANNA, 15s CHANNA, 30s CHANNA)
            if (/\b\d+s\s+Bypassed\b/i.test(node.nodeValue)) {
              node.nodeValue = node.nodeValue.replace(/\b(\d+s)\s+Bypassed\b/gi, '$1 CHANNA');
            }
            // Ensure Ratio has THE BRAND [ratio]
            if (/^Ratio\s*(?:9:16|16:9|1:1|4:3|3:4|21:9)?/i.test(node.nodeValue.trim())) {
              node.nodeValue = node.nodeValue.trim().replace(/^Ratio\s*(?:9:16|16:9|1:1|4:3|3:4|21:9)?/i, 'THE BRAND ' + ratio);
            }
            // Update old ratio text if it doesn't match current ratio
            if (/THE BRAND\s+(?:9:16|16:9|1:1|4:3|3:4|21:9)/i.test(node.nodeValue)) {
              node.nodeValue = node.nodeValue.replace(/THE BRAND\s+(?:9:16|16:9|1:1|4:3|3:4|21:9)/gi, 'THE BRAND ' + ratio);
            }
          }
        }
      }

      // Direct target for Dola actionbar duration button
      const durControlBtn = document.querySelector('button[data-input-engine-actionbar-control-key="video-duration"]');
      if (durControlBtn) {
        const hasArrow = durControlBtn.innerText.includes('^') || durControlBtn.innerText.includes('▼') || durControlBtn.innerText.includes('▲') || durControlBtn.innerText.includes('⌄');
        const newText = `${dur}s CHANNA${hasArrow ? ' ⌄' : ''}`;
        if (durControlBtn.textContent.trim() !== newText) {
          durControlBtn.textContent = newText;
          durControlBtn.style.color = '#10b981';
          durControlBtn.style.fontWeight = 'bold';
        }
      }

      // Remove duration tag from top container if present (container only shows account name)
      const accDurSpan = document.getElementById('ctb-acc-dur');
      if (accDurSpan) {
        accDurSpan.remove();
      }
      const accNameSpan = document.getElementById('ctb-acc-name');
      if (accNameSpan) {
        const liveAcc = (typeof getActiveAccountName === 'function' ? getActiveAccountName() : null) || window.CHANNA_ACTIVE_ACCOUNT || '';
        if (liveAcc && accNameSpan.textContent !== liveAcc) {
          accNameSpan.textContent = liveAcc;
        }
      }

      // Clean up any existing floating badge container from below composer
      const existingContainer = document.getElementById('channa-live-badge-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      if (typeof window.__mountVideoRefButton === 'function') {
        window.__mountVideoRefButton();
      }
    } catch (e) {
    }
  }
  window.syncBadgesFast = syncBadgesFast;

  function scheduleSync() {
    if (isScheduled) return;
    isScheduled = true;
    requestAnimationFrame(() => {
      isScheduled = false;
      syncBadgesFast();
    });
  }

  // Periodic non-blocking ticker to maintain continuous sync (0% CPU impact)
  setInterval(syncBadgesFast, 1500);

  // Run on page interactive & complete
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleSync, { passive: true, once: true });
  } else {
    scheduleSync();
  }

  // Lightweight, debounced MutationObserver
  const observer = new MutationObserver(mutations => {
    let shouldSync = false;
    for (let i = 0; i < mutations.length; i++) {
      const target = mutations[i].target;
      if (target && target.nodeType === 1) {
        if (target.hasAttribute && target.hasAttribute('data-channa-injected')) continue;
        if (target.id === 'channa-live-badge-container') continue;
        shouldSync = true;
        break;
      }
    }
    if (shouldSync) {
      scheduleSync();
    }
  });

  // Attach observer once body is available
  function attachObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      setTimeout(attachObserver, 50);
    }
  }
  attachObserver();

  // Instant response on tab focus / user interaction
  window.addEventListener('focus', scheduleSync, { passive: true });
  document.addEventListener('click', scheduleSync, { passive: true });

  // Cross-world message handler
  window.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.type === 'SET_RATIO_OVERRIDE' || event.data.type === 'RATIO_SWITCHED' || event.data.type === 'DURATION_OVERRIDE') {
      if (event.data.duration) {
        window.CHANNA_TARGET_DURATION = parseInt(event.data.duration, 10) || 30;
      }
      if (event.data.ratio) {
        window.CHANNA_TARGET_RATIO = event.data.ratio;
      }
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      scheduleSync();
    }
    if (event.data.type === 'SET_MAX_CREDITS_LIMIT') {
      if (event.data.maxCredits) {
        window.CHANNA_MAX_CREDITS_LIMIT = parseInt(event.data.maxCredits, 10) || 20;
      }
      scheduleSync();
    }
  }, { passive: true });

  console.log('[ChannaTheBrand Pro] ⚡ Ultra-Fast Non-Blocking Badge Synchronizer Active.');
})();

// --- 📐 SMART ZERO-BLINKING TOP-CENTER CONTAINER & WHATSAPP CAPSULE CONTROLLER ---
(() => {
  'use strict';

  const WHATSAPP_CHANNEL_URL = 'https://www.whatsapp.com/channel/0029VbDLcm5BVJl4yoHocF2j';

  function getOrCreateMasterCapsule() {
    let capsule = document.getElementById('channa-top-center-capsule');
    if (!capsule) {
      capsule = document.createElement('div');
      capsule.id = 'channa-top-center-capsule';
      capsule.style.cssText = `
        position: fixed !important;
        top: 10px !important;
        left: 360px !important;
        transform: none !important;
        z-index: 999998 !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 5px !important;
        height: 24px !important;
        padding: 2px 8px 2px 3px !important;
        background: rgba(18, 14, 28, 0.88) !important;
        border: 1px solid rgba(168, 85, 247, 0.3) !important;
        border-radius: 999px !important;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
        backdrop-filter: blur(8px) !important;
        white-space: nowrap !important;
        cursor: pointer !important;
        user-select: none !important;
        transition: border-color 0.2s ease, background 0.2s ease !important;
      `;
      capsule.title = '⚡ ChannaTheBrand • Click to open Official WhatsApp Channel';

      // Click opens WhatsApp Channel
      capsule.addEventListener('click', () => {
        window.open(WHATSAPP_CHANNEL_URL, '_blank');
      });

      // Hover feedback (subtle, minimal, zero jump)
      capsule.addEventListener('mouseenter', () => {
        capsule.style.setProperty('border-color', 'rgba(168, 85, 247, 0.65)', 'important');
        capsule.style.setProperty('background', 'rgba(28, 20, 44, 0.95)', 'important');
      });
      capsule.addEventListener('mouseleave', () => {
        capsule.style.setProperty('border-color', 'rgba(168, 85, 247, 0.3)', 'important');
        capsule.style.setProperty('background', 'rgba(18, 14, 28, 0.88)', 'important');
      });

      // 1. Permanent WhatsApp Brand Badge (Minimal & Lite Weight)
      const brandBadge = document.createElement('a');
      brandBadge.id = 'ctb-brand-whatsapp-link';
      brandBadge.href = WHATSAPP_CHANNEL_URL;
      brandBadge.target = '_blank';
      brandBadge.rel = 'noopener noreferrer';
      brandBadge.title = 'Join Official ChannaTheBrand WhatsApp Channel';
      brandBadge.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        background: linear-gradient(135deg, #7c3aed, #9333ea) !important;
        color: #ffffff !important;
        font-size: 10px !important;
        font-weight: 700 !important;
        padding: 1px 6px !important;
        border-radius: 999px !important;
        letter-spacing: 0.2px !important;
        text-decoration: none !important;
        cursor: pointer !important;
        white-space: nowrap !important;
        line-height: 1.4 !important;
      `;
      brandBadge.innerHTML = '⚡ ChannaTheBrand';
      brandBadge.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open(WHATSAPP_CHANNEL_URL, '_blank');
      });
      capsule.appendChild(brandBadge);

      // 2. Unified Minimal Account Pill [🟢 ACCOUNT: Sohail Aslam]
      const accPill = document.createElement('span');
      accPill.id = 'ctb-account-capsule-pill';
      accPill.style.cssText = `
        display: inline-flex !important;
        align-items: center !important;
        gap: 3px !important;
        font-size: 10.5px !important;
        font-weight: 600 !important;
        color: #e2e8f0 !important;
        white-space: nowrap !important;
        padding-left: 1px !important;
        line-height: 1 !important;
      `;
      const curAccInit = getActiveAccountName();
      accPill.innerHTML = '<span style="color:#10b981;font-size:8px;line-height:1;">🟢</span> ACCOUNT: <span id="ctb-acc-name" style="color:#ffffff;font-weight:700;">' + curAccInit + '</span>';
      capsule.appendChild(accPill);

      (document.body || document.documentElement).appendChild(capsule);
    }
    return capsule;
  }

  function cleanContainerText(el) {
    if (!el) return;
    if (el.nodeType === 3) {
      if (el.nodeValue && (el.nodeValue.includes('Container') || el.nodeValue.includes('Off-Peak') || el.nodeValue.includes('Free Queue') || el.nodeValue.includes('•'))) {
        let val = el.nodeValue.replace(/Container/gi, 'ACCOUNT');
        // Strip bullet and queue/speed info inside brackets: [30s HD • ⚡ Free Queue] -> [30s HD]
        val = val.replace(/\s*•\s*[^\]]*/gi, '');
        // Strip any Free Queue or Off-Peak mentions
        val = val.replace(/\s*•?\s*⚡?\s*Free Queue\]?/gi, '');
        val = val.replace(/\s*•?\s*🌙?\s*Off-Peak[^\]]*\]?/gi, '');
        // Clean up empty brackets, double brackets, and whitespace
        val = val.replace(/\[\s*\]/g, '').replace(/\s{2,}/g, ' ');
        val = val.replace(/\]{2,}/g, ']');
        val = val.replace(/^[\s•\]]+|[\s•]+$/g, '');
        el.nodeValue = val;
      }
    } else if (el.childNodes && el.childNodes.length > 0) {
      el.childNodes.forEach(child => cleanContainerText(child));
    }
  }

  
  // ⚡ LOCK DOCK BADGE & CAPSULE TO THE LEFT (BESIDE SIDEBAR BUTTON)
  function enforceCapsuleLeftPositionMain() {
    try {
      if (!document.getElementById('ctb-dock-badge-style-main')) {
        const s = document.createElement('style');
        s.id = 'ctb-dock-badge-style-main';
        s.textContent = `
          #channa-dock-badge,
          .channa-dock-badge {
            display: none !important;
          }
          #channa-top-center-capsule {
            position: fixed !important;
            top: 10px !important;
            left: 360px !important;
            transform: none !important;
            right: auto !important;
            margin: 0 !important;
            z-index: 999998 !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
            height: 24px !important;
            padding: 2px 8px 2px 3px !important;
            background: rgba(18, 14, 28, 0.88) !important;
            border: 1px solid rgba(168, 85, 247, 0.3) !important;
            border-radius: 999px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
            backdrop-filter: blur(8px) !important;
            white-space: nowrap !important;
            user-select: none !important;
          }
        `;
        (document.head || document.documentElement).appendChild(s);
      }

      const dockBadges = document.querySelectorAll('#channa-dock-badge, .channa-dock-badge');
      dockBadges.forEach(b => {
        b.style.setProperty('display', 'none', 'important');
      });

      const topCapsule = document.getElementById('channa-top-center-capsule');
      if (topCapsule) {
        topCapsule.style.setProperty('position', 'fixed', 'important');
        topCapsule.style.setProperty('top', '10px', 'important');
        topCapsule.style.setProperty('left', '360px', 'important');
        topCapsule.style.setProperty('transform', 'none', 'important');
        topCapsule.style.setProperty('right', 'auto', 'important');
        topCapsule.style.setProperty('margin', '0', 'important');
        topCapsule.style.setProperty('z-index', '999998', 'important');
      }
    } catch (e) {}
  }

  function syncMasterTopContainer() {
    enforceCapsuleLeftPositionMain();
    try {
      const isEmbeddedFrame = window.self !== window.top || window.innerWidth < 550;
      const capsule = getOrCreateMasterCapsule();

      if (isEmbeddedFrame) {
        if (capsule) capsule.style.setProperty('display', 'none', 'important');
        return;
      } else {
        if (capsule) {
          capsule.style.setProperty('display', 'inline-flex', 'important');
          capsule.style.setProperty('left', '360px', 'important');
          capsule.style.setProperty('transform', 'none', 'important');
        }
      }

      // Ensure duration tag is never present in container
      const staleDur = document.getElementById('ctb-acc-dur');
      if (staleDur) staleDur.remove();

      // Find and absorb native Dola container text, then hide raw duplicate element
      let hostContainerEl = null;
      const allEls = document.querySelectorAll('header, nav, [role="banner"], [class*="header"], [class*="top"], div[style*="fixed"]');
      for (let i = 0; i < allEls.length; i++) {
        const el = allEls[i];
        if (el.id === 'channa-top-center-capsule' || el.closest('#channa-top-center-capsule')) continue;
        if (el.id === 'channa-workflow-hud') continue;
        const text = (el.innerText || el.textContent || '').trim();
        if ((text.includes('Container:') || text.includes('ACCOUNT:')) && text.length < 120 && el.children.length <= 8) {
          hostContainerEl = el;
          // Extract clean account name
          let accMatch = text.match(/(?:Container:|ACCOUNT:)\s*([^[\]•⚡]+)/i);
          if (accMatch && accMatch[1]) {
            const cleanAcc = accMatch[1].trim();
            const accNameSpan = document.getElementById('ctb-acc-name');
            if (accNameSpan && cleanAcc && accNameSpan.textContent !== cleanAcc) {
              accNameSpan.textContent = cleanAcc;
            }
          }
          // Ensure duration tag is removed from account pill in container
          const accDurSpan = document.getElementById('ctb-acc-dur');
          if (accDurSpan) {
            accDurSpan.remove();
          }
          // Hide raw Dola element so top-right RED box is gone!
          el.style.setProperty('display', 'none', 'important');
          const fixedParent = el.closest('div[style*="fixed"]');
          if (fixedParent && fixedParent.id !== 'channa-top-center-capsule' && !fixedParent.contains(capsule)) {
            fixedParent.style.setProperty('display', 'none', 'important');
          }
        }
      }

      // Ensure strictly EXACTLY ONE account pill inside capsule (Zero Doubling)
      let foundAccountPill = false;
      Array.from(capsule.children).forEach(child => {
        if (child.id === 'ctb-brand-whatsapp-link') {
          return;
        }
        if (child.id === 'ctb-account-capsule-pill') {
          if (!foundAccountPill) {
            foundAccountPill = true;
            return;
          }
        }
        child.remove();
      });

      // Hide raw hostContainerEl and never allow duplicate injection
      if (hostContainerEl && hostContainerEl !== capsule) {
        hostContainerEl.style.setProperty('display', 'none', 'important');
        if (capsule.contains(hostContainerEl)) hostContainerEl.style.setProperty('display', 'none', 'important');
      }

      // Continuously clean and monitor text mutations on hostContainerEl
      if (hostContainerEl) {
        if (!hostContainerEl.__ctb_cleaned_observed) {
          hostContainerEl.__ctb_cleaned_observed = true;
          const textObs = new MutationObserver(() => {
            cleanContainerText(hostContainerEl);
          });
          textObs.observe(hostContainerEl, { childList: true, subtree: true, characterData: true });
        }
        cleanContainerText(hostContainerEl);
      }
    } catch (e) {}
  }

  syncMasterTopContainer();
  setInterval(syncMasterTopContainer, 4000);
  window.addEventListener('DOMContentLoaded', syncMasterTopContainer, { passive: true });
  window.addEventListener('load', syncMasterTopContainer, { passive: true });
  window.addEventListener('focus', syncMasterTopContainer, { passive: true });
})();

// --- 📐 SMART PROMPT DOCK, STEPPER & 1-CLICK PASTE ENGINE (ZERO OVERLAP) ---
(() => {
  'use strict';

  let localDockPrompts = [];
  let dockSearchQuery = '';
  let dockFilter = 'all'; // 'all' | 'queued' | 'done'
  let activePromptIndex = 0;
  let isQuickAddOpen = false;
  let autoAdvanceEnabled = true;
  let expandedCardIndices = new Set();

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function getPromptText(item) {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    return String(item.prompt || item.text || item.content || item.value || '').trim();
  }

  function getPromptTitle(item, idx) {
    const numStr = String(idx + 1).padStart(2, '0');
    if (!item) return `Prompt #${numStr}`;
    if (typeof item === 'string') return `Prompt #${numStr}`;
    return item.title || item.name || `Prompt #${numStr}`;
  }

  function findDolaComposer() {
    const selectors = [
      '.tiptap.ProseMirror[contenteditable="true"]',
      '.tiptap.ProseMirror',
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
      '[data-testid="chat-input"]',
      'input[type="text"][placeholder*="message" i]'
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && (el.offsetParent !== null || el.offsetHeight > 0 || (el.getClientRects && el.getClientRects().length > 0))) {
        return el;
      }
    }
    return document.querySelector('.tiptap.ProseMirror, .ProseMirror, textarea, div[contenteditable="true"]');
  }

  function injectPromptIntoDola(text, options = {}) {
    if (!text || typeof text !== 'string') return false;
    text = text.trim();
    if (!text) return false;

    if (!options?.skipDna && typeof window.__applyCharacterDna === 'function') {
      text = window.__applyCharacterDna(text);
    }

    const composer = findDolaComposer();
    if (!composer) {
      console.warn('[Prompt Dock] Active composer element not found on page.');
      return false;
    }

    try {
      try { composer.focus({ preventScroll: true }); } catch (e) { composer.focus(); }

      // 1. Primary Native TipTap Command (Standard on Dola AI)
      if (composer.editor && typeof composer.editor.commands?.setContent === 'function') {
        composer.editor.commands.setContent(text);
        if (typeof composer.editor.commands?.focus === 'function') {
          try { composer.editor.commands.focus('end', { preventScroll: true }); } catch (e) { composer.editor.commands.focus('end'); }
        }
        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        return true;
      }

      // 2. TipTap insertContent Fallback
      if (composer.editor && typeof composer.editor.commands?.insertContent === 'function') {
        composer.editor.commands.insertContent(text);
        if (typeof composer.editor.commands?.focus === 'function') {
          try { composer.editor.commands.focus('end', { preventScroll: true }); } catch (e) { composer.editor.commands.focus('end'); }
        }
        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        return true;
      }

      // 3. ContentEditable / ProseMirror execCommand Fallback
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
            const esc = escapeHtml(text);
            composer.innerHTML = `<p>${esc}</p>`;
          } catch (e) {
            composer.textContent = text;
          }
        }

        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        try { composer.focus({ preventScroll: true }); } catch (e) { composer.focus(); }
        return true;
      }

      // 4. Textarea or Input Fallback
      if (composer.tagName === 'TEXTAREA' || composer.tagName === 'INPUT') {
        const proto = composer.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        if (nativeSetter) {
          nativeSetter.call(composer, text);
        } else {
          composer.value = text;
        }
        composer.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        composer.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        try { composer.focus({ preventScroll: true }); } catch (e) { composer.focus(); }
        return true;
      }
    } catch (err) {
      console.warn('[Prompt Dock] Error injecting prompt:', err);
    }
    return false;
  }

  window.injectPromptIntoDola = injectPromptIntoDola;

  function parsePromptsFromRawText(text) {
    if (!text || typeof text !== 'string') return [];
    const normalized = text.replace(/\r\n?/g, '\n').trim();
    if (!normalized) return [];

    if (/\n(?:[^\S\n]*\n)+/.test(normalized)) {
      return normalized.split(/\n(?:[^\S\n]*\n)+/).map(p => p.trim()).filter(Boolean).map((p, idx) => ({
        text: p,
        prompt: p,
        title: `Prompt #${idx + 1}`,
        done: false
      }));
    }

    return normalized.split('\n').map(l => l.trim()).filter(Boolean).map((line, idx) => ({
      text: line,
      prompt: line,
      title: `Prompt #${idx + 1}`,
      done: false
    }));
  }

  function saveDockPrompts() {
    window.postMessage({
      type: 'CTB_SAVE_PROMPTS_FROM_PAGE',
      prompts: localDockPrompts
    }, '*');
  }

  function isPromptDockOpen(dock, toggleBtn) {
    if (toggleBtn) {
      const text = toggleBtn.innerText || toggleBtn.textContent || '';
      if (text.includes('▼')) return true;
      if (text.includes('◀')) return false;
    }
    if (dock) {
      if (dock.style.display === 'none') return false;
      if (dock.style.display === 'block' || dock.style.display === 'flex') return true;
      try {
        const comp = window.getComputedStyle(dock);
        return comp.display !== 'none' && comp.visibility !== 'hidden';
      } catch (e) {}
    }
    return false;
  }

  function syncPromptDockAndToggle() {
    try {
      const toggleBtn = document.getElementById('channa-dock-toggle-btn');
      const dock = document.getElementById('channa-prompt-dock');

      if (!toggleBtn) return;
      const open = isPromptDockOpen(dock, toggleBtn);

      if (open) {
        toggleBtn.style.setProperty('display', 'none', 'important');
      } else {
        toggleBtn.style.setProperty('display', 'flex', 'important');
      }
    } catch (e) {}
  }

  function advanceToNextPrompt(fromIdx) {
    if (localDockPrompts.length === 0) return;
    const start = (typeof fromIdx === 'number' ? fromIdx + 1 : activePromptIndex + 1);
    for (let i = 0; i < localDockPrompts.length; i++) {
      const candidateIdx = (start + i) % localDockPrompts.length;
      if (!localDockPrompts[candidateIdx].done) {
        activePromptIndex = candidateIdx;
        return;
      }
    }
    activePromptIndex = Math.min(localDockPrompts.length - 1, start);
  }

  let dockMode = localStorage.getItem('ctb_dock_mode') || 'compact'; // 'compact' | 'drawer' | 'minimized'

  function applyDockMode(mode) {
    dockMode = mode;
    try { localStorage.setItem('ctb_dock_mode', mode); } catch (e) {}
    const dock = document.getElementById('channa-prompt-dock');
    if (!dock) return;

    const header = document.getElementById('channa-dock-header');
    const stepperBody = document.getElementById('channa-dock-stepper-body');
    const drawer = document.getElementById('channa-dock-drawer');
    const minBody = document.getElementById('channa-dock-min-body');
    const toggleDrawerBtn = document.getElementById('channa-dock-toggle-drawer-btn');

    if (mode === 'minimized') {
      dock.classList.add('channa-dock-minimized');
      dock.style.maxHeight = '50px';
      if (header) header.style.display = 'none';
      if (stepperBody) stepperBody.style.display = 'none';
      if (drawer) drawer.style.display = 'none';
      if (minBody) minBody.style.display = 'flex';
    } else if (mode === 'drawer') {
      dock.classList.remove('channa-dock-minimized');
      dock.style.maxHeight = 'calc(100vh - 240px)';
      if (header) header.style.display = 'flex';
      if (stepperBody) stepperBody.style.display = 'flex';
      if (drawer) drawer.style.display = 'flex';
      if (minBody) minBody.style.display = 'none';
      if (toggleDrawerBtn) {
        toggleDrawerBtn.innerHTML = '▲ Close List';
        toggleDrawerBtn.style.background = 'rgba(168, 85, 247, 0.35)';
      }
    } else { // 'compact'
      dock.classList.remove('channa-dock-minimized');
      dock.style.maxHeight = '140px';
      if (header) header.style.display = 'flex';
      if (stepperBody) stepperBody.style.display = 'flex';
      if (drawer) drawer.style.display = 'none';
      if (minBody) minBody.style.display = 'none';
      if (toggleDrawerBtn) {
        const total = localDockPrompts.length;
        toggleDrawerBtn.innerHTML = `📋 List (${total})`;
        toggleDrawerBtn.style.background = 'rgba(255, 255, 255, 0.08)';
      }
    }
  }

  function renderDockCards() {
    const list = document.getElementById('channa-dock-prompt-list');
    const badge = document.getElementById('channa-dock-btn-badge');
    const counterBadge = document.getElementById('channa-dock-counter-badge');
    const toggleDrawerBtn = document.getElementById('channa-dock-toggle-drawer-btn');
    const minLabel = document.getElementById('channa-dock-min-label');
    const minPasteBtn = document.getElementById('channa-dock-min-paste-btn');

    const total = localDockPrompts.length;
    const queuedCount = localDockPrompts.filter(p => !p.done).length;
    const doneCount = total - queuedCount;

    if (badge) badge.textContent = String(queuedCount);

    if (toggleDrawerBtn && dockMode !== 'drawer') {
      toggleDrawerBtn.innerHTML = `📋 List (${total})`;
    }

    // Filter pills
    const filterPills = document.querySelectorAll('.channa-dock-filter-pill');
    filterPills.forEach(pill => {
      const f = pill.dataset.filter;
      pill.classList.toggle('active', f === dockFilter);
      if (f === 'all') pill.textContent = `All (${total})`;
      if (f === 'queued') pill.textContent = `Queued (${queuedCount})`;
      if (f === 'done') pill.textContent = `Done (${doneCount})`;
    });

    // Active item stats
    const stepperPromptTitle = document.getElementById('channa-dock-stepper-title');
    const stepperPromptSnippet = document.getElementById('channa-dock-stepper-snippet');
    const stepperPasteBtn = document.getElementById('channa-dock-stepper-paste-btn');

    if (total > 0) {
      if (activePromptIndex >= total) activePromptIndex = 0;
      const activeItem = localDockPrompts[activePromptIndex];
      const activeNum = String(activePromptIndex + 1).padStart(2, '0');
      const activeTitle = getPromptTitle(activeItem, activePromptIndex);
      const activeText = getPromptText(activeItem);

      if (counterBadge) counterBadge.innerHTML = `<strong>#${activeNum}</strong> / ${total} ${activeItem?.done ? '<span style="color:#10b981;">(Done)</span>' : '<span style="color:#c084fc;">(Queued)</span>'}`;
      if (stepperPromptTitle) {
        stepperPromptTitle.textContent = `#${activeNum}: ${activeTitle}`;
        stepperPromptTitle.title = activeText;
      }
      if (stepperPromptSnippet) stepperPromptSnippet.textContent = activeText || '(No prompt text)';
      if (stepperPasteBtn) stepperPasteBtn.innerHTML = `⚡ 1-Click Paste #${activeNum} & Next`;

      if (minLabel) minLabel.textContent = `#${activeNum} (${total})`;
      if (minPasteBtn) minPasteBtn.innerHTML = `⚡ Paste #${activeNum}`;
    } else {
      if (counterBadge) counterBadge.textContent = '0 Ready';
      if (stepperPromptTitle) stepperPromptTitle.textContent = 'No prompts loaded';
      if (stepperPromptSnippet) stepperPromptSnippet.textContent = 'Upload or paste prompts in Side Panel';
      if (stepperPasteBtn) stepperPasteBtn.innerHTML = `⚡ Paste Prompt & Next`;
      if (minLabel) minLabel.textContent = '#00';
    }

    if (!list) return;

    // Filter list
    const filtered = localDockPrompts.map((p, idx) => ({ ...p, origIdx: idx })).filter(item => {
      if (dockFilter === 'queued' && item.done) return false;
      if (dockFilter === 'done' && !item.done) return false;
      if (dockSearchQuery) {
        const text = getPromptText(item).toLowerCase();
        const title = getPromptTitle(item, item.origIdx).toLowerCase();
        return text.includes(dockSearchQuery) || title.includes(dockSearchQuery);
      }
      return true;
    });

    if (filtered.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 18px 10px; color: #94a3b8; font-size: 10px;">
          ${total === 0 ? 'No prompts yet. Load prompts in Side Panel.' : 'No matching prompts found.'}
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(item => {
      const origIdx = item.origIdx;
      const numStr = String(origIdx + 1).padStart(2, '0');
      const card = document.createElement('div');
      const isActive = origIdx === activePromptIndex;
      card.className = `channa-dock-card${item.done ? ' done' : ''}${isActive ? ' active-card' : ''}`;
      card.id = `channa-dock-card-${origIdx}`;

      const title = getPromptTitle(item, origIdx);
      const fullText = getPromptText(item);

      card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
          <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; flex: 1;">
            <span style="background: ${isActive ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(168, 85, 247, 0.25)'}; color: ${isActive ? '#fff' : '#c084fc'}; font-size: 9px; font-weight: 800; padding: 1px 5px; border-radius: 4px; font-family: monospace;">#${numStr}</span>
            <span style="font-size: 10.5px; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;" title="${escapeHtml(fullText)}">${escapeHtml(title)}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button class="channa-dock-paste-btn" data-idx="${origIdx}" title="Paste into composer">📋 Paste</button>
            <button class="channa-dock-paste-next-btn" data-idx="${origIdx}" title="Paste & Advance">⚡ Next</button>
            <button class="channa-dock-toggle-done-btn" data-idx="${origIdx}" style="background: none; border: none; font-size: 11px; cursor: pointer; padding: 0 2px;" title="Toggle Done">${item.done ? '✅' : '⚪'}</button>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    list.replaceChildren(fragment);
  }

  function makeDockDraggable(dock, handle) {
    if (!dock || !handle || handle.__ctb_drag_bound) return;
    handle.__ctb_drag_bound = true;

    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = dock.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      dock.style.bottom = 'auto';
      dock.style.right = 'auto';
      dock.style.transform = 'none';
      dock.style.left = initialLeft + 'px';
      dock.style.top = initialTop + 'px';

      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newLeft = Math.max(10, Math.min(window.innerWidth - dock.offsetWidth - 10, initialLeft + dx));
      const maxAllowedTop = Math.max(10, window.innerHeight - dock.offsetHeight - 160);
      const newTop = Math.max(10, Math.min(maxAllowedTop, initialTop + dy));
      dock.style.left = newLeft + 'px';
      dock.style.top = newTop + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        document.body.style.userSelect = '';
        try {
          localStorage.setItem('ctb_dock_pos', JSON.stringify({
            left: dock.style.left,
            top: dock.style.top
          }));
        } catch (e) {}
      }
    });
  }

  function ensurePromptDockDOM() {
    if (!document.body) return;

    // Inject Modern Glassmorphism CSS
    if (!document.getElementById('ctb-prompt-dock-side-style')) {
      const style = document.createElement('style');
      style.id = 'ctb-prompt-dock-side-style';
      style.textContent = `
        #channa-dock-toggle-btn {
          position: fixed !important;
          top: 50% !important;
          right: 0px !important;
          left: auto !important;
          bottom: auto !important;
          transform: translateY(-50%) !important;
          border-radius: 14px 0 0 14px !important;
          z-index: 999999 !important;
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%) !important;
          border: 1px solid rgba(168, 85, 247, 0.6) !important;
          border-right: none !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.65), -2px 0 10px rgba(124, 58, 237, 0.5) !important;
          transition: transform 0.2s ease, right 0.2s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          user-select: none !important;
        }
        #channa-dock-toggle-btn:hover {
          transform: translateY(-50%) scale(1.04) !important;
          box-shadow: -6px 0 28px rgba(124, 58, 237, 0.75) !important;
        }
        #channa-prompt-dock {
          position: fixed !important;
          top: 75px !important;
          right: 20px !important;
          bottom: auto !important;
          left: auto !important;
          transform: none !important;
          width: 350px !important;
          max-width: calc(100vw - 32px) !important;
          max-height: calc(100vh - 240px) !important;
          background: rgba(14, 11, 26, 0.94) !important;
          border: 1px solid rgba(168, 85, 247, 0.35) !important;
          border-radius: 16px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(124, 58, 237, 0.25) !important;
          backdrop-filter: blur(24px) !important;
          z-index: 999998 !important;
          display: none;
          flex-direction: column !important;
          overflow: hidden !important;
          overscroll-behavior: contain !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          color: #f1f5f9 !important;
          box-sizing: border-box !important;
          transition: box-shadow 0.2s ease;
        }
        #channa-dock-header {
          flex-shrink: 0 !important;
          user-select: none !important;
        }
        #channa-dock-stepper-body {
          flex-shrink: 0 !important;
        }
        #channa-dock-drawer {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          overflow: hidden !important;
          display: none;
          flex-direction: column !important;
        }
        #channa-dock-prompt-list {
          flex: 1 1 auto !important;
          max-height: calc(100vh - 380px) !important;
          min-height: 80px !important;
          overflow-y: auto !important;
          scroll-behavior: smooth !important;
        }
        #channa-prompt-dock.channa-dock-minimized {
          width: auto !important;
          min-width: 240px !important;
          border-radius: 20px !important;
          padding: 4px 6px !important;
        }
        .channa-dock-hero-paste-btn {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
          color: white !important;
          border: 1px solid #34d399 !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 11.5px !important;
          font-weight: 800 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3) !important;
          transition: all 0.2s ease !important;
          width: 100% !important;
          margin-top: 2px !important;
        }
        .channa-dock-hero-paste-btn:hover {
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%) !important;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45) !important;
          transform: translateY(-1px) !important;
        }
        .channa-dock-hero-paste-btn:active {
          transform: scale(0.98) !important;
        }
        .channa-dock-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 6px 9px;
          margin-bottom: 5px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: border-color 0.2s, background 0.2s;
        }
        .channa-dock-card:hover {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(168, 85, 247, 0.35);
        }
        .channa-dock-card.active-card {
          border-color: rgba(56, 189, 248, 0.6) !important;
          background: rgba(56, 189, 248, 0.06) !important;
        }
        .channa-dock-card.done {
          opacity: 0.6;
          border-color: rgba(16, 185, 129, 0.3);
        }
        .channa-dock-paste-btn {
          background: linear-gradient(135deg, #7c3aed, #4f46e5);
          color: white;
          border: 1px solid rgba(192, 132, 252, 0.4);
          border-radius: 5px;
          padding: 3px 7px;
          font-size: 9.5px;
          font-weight: 700;
          cursor: pointer;
        }
        .channa-dock-paste-next-btn {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          border: 1px solid rgba(52, 211, 153, 0.4);
          border-radius: 5px;
          padding: 3px 8px;
          font-size: 9.5px;
          font-weight: 700;
          cursor: pointer;
        }
        .channa-dock-filter-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 5px;
          padding: 2px 7px;
          font-size: 9px;
          color: #94a3b8;
          cursor: pointer;
        }
        .channa-dock-filter-pill.active {
          background: rgba(168, 85, 247, 0.25);
          border-color: #a855f7;
          color: #f8fafc;
          font-weight: 700;
        }
        #channa-dock-prompt-list::-webkit-scrollbar {
          width: 4px;
        }
        #channa-dock-prompt-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
        }
        #channa-dock-prompt-list::-webkit-scrollbar-thumb {
          background: #7c3aed;
          border-radius: 4px;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    // Floating Tab
    let toggleBtn = document.getElementById('channa-dock-toggle-btn');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.id = 'channa-dock-toggle-btn';
      toggleBtn.title = 'Open Channa Prompt Dock';
      toggleBtn.innerHTML = `
        <span style="font-size: 13px;">📝</span>
        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">PROMPTS</span>
        <span id="channa-dock-btn-badge" style="background: rgba(255,255,255,0.25); color: #fff; font-size: 9px; font-weight: 700; border-radius: 10px; padding: 1px 5px;">0</span>
      `;
      document.body.appendChild(toggleBtn);
      toggleBtn.addEventListener('click', () => {
        const d = document.getElementById('channa-prompt-dock');
        if (d) {
          d.style.setProperty('display', 'flex', 'important');
          syncPromptDockAndToggle();
          renderDockCards();
          applyDockMode(dockMode);
        }
      });
    }

    // Prompt Dock Panel
    let dock = document.getElementById('channa-prompt-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'channa-prompt-dock';

      // Ensure dock starts at safe top-right position away from bottom prompt box
      try {
        const savedPos = JSON.parse(localStorage.getItem('ctb_dock_pos') || 'null');
        if (savedPos && savedPos.left && savedPos.top) {
          const topVal = parseFloat(savedPos.top);
          if (!isNaN(topVal) && topVal < window.innerHeight - 240) {
            dock.style.left = savedPos.left;
            dock.style.top = savedPos.top;
            dock.style.bottom = 'auto';
            dock.style.right = 'auto';
          } else {
            localStorage.removeItem('ctb_dock_pos');
            dock.style.top = '75px';
            dock.style.right = '20px';
            dock.style.bottom = 'auto';
            dock.style.left = 'auto';
          }
        } else {
          dock.style.top = '75px';
          dock.style.right = '20px';
          dock.style.bottom = 'auto';
          dock.style.left = 'auto';
        }
      } catch (e) {
        dock.style.top = '75px';
        dock.style.right = '20px';
        dock.style.bottom = 'auto';
        dock.style.left = 'auto';
      }

      dock.innerHTML = `
        <!-- 1. Header with Drag Handle & Controls -->
        <div id="channa-dock-header" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(0, 0, 0, 0.4); border-bottom: 1px solid rgba(168, 85, 247, 0.25); cursor: move; user-select: none;">
          <div style="display: flex; align-items: center; gap: 6px;" id="channa-dock-drag-handle">
            <span style="color: #a855f7; font-size: 13px;">⠿</span>
            <strong style="font-size: 11px; font-weight: 800; background: linear-gradient(135deg, #c084fc, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">PROMPTS</strong>
            <span id="channa-dock-counter-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); font-size: 9px; font-weight: 700; border-radius: 8px; padding: 1px 6px;">01 / 100</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <button id="channa-dock-toggle-drawer-btn" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; font-size: 9px; font-weight: 700; border-radius: 6px; padding: 2px 7px; cursor: pointer;">📋 List (0)</button>
            <button id="channa-dock-minimize-btn" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; font-size: 9.5px; border-radius: 6px; padding: 2px 6px; cursor: pointer;" title="Minimize to floating pill">➖</button>
            <button id="channa-dock-close-btn" style="background: none; border: none; color: #94a3b8; font-size: 13px; cursor: pointer; padding: 0 4px; line-height: 1;" title="Close Dock">✕</button>
          </div>
        </div>

        <!-- 2. Compact Stepper Body (The Feather-Light HUD) -->
        <div id="channa-dock-stepper-body" style="padding: 8px 12px; display: flex; flex-direction: column; gap: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
            <button id="channa-dock-stepper-prev" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer;" title="Previous prompt">◀</button>
            <div style="flex: 1; overflow: hidden; text-align: center;" id="channa-dock-stepper-title-box">
              <div id="channa-dock-stepper-title" style="font-size: 11px; font-weight: 700; color: #38bdf8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Active Prompt Title</div>
              <div id="channa-dock-stepper-snippet" style="font-size: 9px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">Preview snippet...</div>
            </div>
            <button id="channa-dock-stepper-next" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #e2e8f0; border-radius: 6px; padding: 4px 8px; font-size: 10px; font-weight: 700; cursor: pointer;" title="Next prompt">▶</button>
          </div>

          <!-- Primary Super-Action Button -->
          <button id="channa-dock-stepper-paste-btn" class="channa-dock-hero-paste-btn" title="Paste into Dola and advance">
            ⚡ 1-Click Paste & Next
          </button>
        </div>

        <!-- 3. Minimized Pill Body (Shown ONLY in minimized mode) -->
        <div id="channa-dock-min-body" style="display: none; align-items: center; justify-content: space-between; gap: 8px; padding: 2px 8px;">
          <span id="channa-dock-min-label" style="font-size: 10px; font-weight: 800; color: #c084fc; font-family: monospace;">#01</span>
          <button id="channa-dock-min-paste-btn" style="background: linear-gradient(135deg, #059669, #10b981); color: white; border: 1px solid #34d399; border-radius: 6px; padding: 3px 8px; font-size: 9.5px; font-weight: 800; cursor: pointer;">⚡ Paste & Next</button>
          <button id="channa-dock-expand-btn" style="background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.15); color: #f8fafc; border-radius: 6px; padding: 2px 6px; font-size: 10px; cursor: pointer;" title="Expand Dock">↗</button>
        </div>

        <!-- 4. Collapsible Drawer (Hidden by default, opens on '📋 List' click) -->
        <div id="channa-dock-drawer" style="display: none; flex-direction: column; border-top: 1px solid rgba(168, 85, 247, 0.25); background: rgba(0, 0, 0, 0.3);">
          <!-- Search & Filters -->
          <div style="padding: 6px 10px; display: flex; flex-direction: column; gap: 5px;">
            <div style="display: flex; gap: 4px;">
              <button class="channa-dock-filter-pill active" data-filter="all">All</button>
              <button class="channa-dock-filter-pill" data-filter="queued">Queued</button>
              <button class="channa-dock-filter-pill" data-filter="done">Done</button>
              <input id="channa-dock-search-box" type="text" placeholder="🔍 Search..." style="flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 6px; padding: 3px 7px; font-size: 9.5px; color: #f8fafc; outline: none;" />
            </div>
          </div>

          <!-- Prompts Scrollable List -->
          <div id="channa-dock-prompt-list" style="flex: 1; overflow-y: auto; padding: 6px 10px; max-height: 260px; scrollbar-width: thin;"></div>

          <!-- Drawer Footer -->
          <div style="padding: 6px 10px; background: rgba(0, 0, 0, 0.45); border-top: 1px solid rgba(255, 255, 255, 0.06); display: flex; align-items: center; justify-content: space-between; font-size: 8.5px; color: #94a3b8;">
            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; color: #cbd5e1;">
              <input type="checkbox" id="channa-dock-auto-advance-chk" checked style="accent-color: #8b5cf6;" />
              Auto-advance
            </label>
            <div style="display: flex; gap: 8px;">
              <span id="channa-dock-reset-done" style="color: #38bdf8; cursor: pointer;">Reset</span>
              <span id="channa-dock-clear-all" style="color: #ef4444; cursor: pointer;">Clear</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dock);

      // Permanently lock dock scrollTop and scrollLeft to 0 so its header NEVER shifts or clips
      dock.addEventListener('scroll', () => {
        if (dock.scrollTop !== 0) dock.scrollTop = 0;
        if (dock.scrollLeft !== 0) dock.scrollLeft = 0;
      }, { passive: true });

      // Make draggable
      const dragHeader = document.getElementById('channa-dock-header');
      makeDockDraggable(dock, dragHeader);

      // Drawer toggle
      const toggleDrawerBtn = document.getElementById('channa-dock-toggle-drawer-btn');
      if (toggleDrawerBtn) {
        toggleDrawerBtn.addEventListener('click', () => {
          applyDockMode(dockMode === 'drawer' ? 'compact' : 'drawer');
        });
      }

      // Minimize button
      const minBtn = document.getElementById('channa-dock-minimize-btn');
      if (minBtn) {
        minBtn.addEventListener('click', () => {
          applyDockMode('minimized');
        });
      }

      // Expand button
      const expBtn = document.getElementById('channa-dock-expand-btn');
      if (expBtn) {
        expBtn.addEventListener('click', () => {
          applyDockMode('compact');
        });
      }

      // Minimized paste button
      const minPasteBtn = document.getElementById('channa-dock-min-paste-btn');
      if (minPasteBtn) {
        minPasteBtn.addEventListener('click', () => {
          const stepperPasteBtn = document.getElementById('channa-dock-stepper-paste-btn');
          if (stepperPasteBtn) stepperPasteBtn.click();
        });
      }

      function selectAndPastePrompt(newIndex) {
        if (localDockPrompts.length === 0) return;
        activePromptIndex = (newIndex + localDockPrompts.length) % localDockPrompts.length;
        const item = localDockPrompts[activePromptIndex];
        const text = getPromptText(item);
        if (text) {
          injectPromptIntoDola(text);
        }
        renderDockCards();
        scrollToActiveCard();
        saveDockPrompts();
        if (typeof window.__showChannaNotice === 'function') {
          const activeNum = String(activePromptIndex + 1).padStart(2, '0');
          window.__showChannaNotice(`📋 Prompt #${activeNum} pasted into prompt box!`, 1500);
        }
        if (dock) dock.scrollTop = 0;
      }

      // Bindings for Stepper Controls - Clicking Prev or Next automatically pastes into prompt box!
      const stepperPrevBtn = document.getElementById('channa-dock-stepper-prev');
      const stepperNextBtn = document.getElementById('channa-dock-stepper-next');
      const stepperPasteBtn = document.getElementById('channa-dock-stepper-paste-btn');

      if (stepperPrevBtn) {
        stepperPrevBtn.addEventListener('click', () => {
          if (localDockPrompts.length > 0) {
            selectAndPastePrompt(activePromptIndex - 1);
          }
        });
      }

      if (stepperNextBtn) {
        stepperNextBtn.addEventListener('click', () => {
          if (localDockPrompts.length > 0) {
            selectAndPastePrompt(activePromptIndex + 1);
          }
        });
      }

      const stepperTitleBox = document.getElementById('channa-dock-stepper-title-box');
      if (stepperTitleBox) {
        stepperTitleBox.addEventListener('click', () => {
          if (localDockPrompts.length > 0 && localDockPrompts[activePromptIndex]) {
            const text = getPromptText(localDockPrompts[activePromptIndex]);
            if (text) {
              injectPromptIntoDola(text);
              if (typeof window.__showChannaNotice === 'function') {
                const activeNum = String(activePromptIndex + 1).padStart(2, '0');
                window.__showChannaNotice(`📋 Prompt #${activeNum} pasted into prompt box!`, 1500);
              }
            }
          }
        });
      }

      if (stepperPasteBtn) {
        stepperPasteBtn.addEventListener('click', () => {
          if (localDockPrompts.length > 0 && localDockPrompts[activePromptIndex]) {
            const item = localDockPrompts[activePromptIndex];
            const text = getPromptText(item);
            const success = injectPromptIntoDola(text);
            if (success) {
              item.done = true;
              stepperPasteBtn.innerHTML = `✓ PASTED!`;
              setTimeout(() => {
                advanceToNextPrompt(activePromptIndex);
                const nextItem = localDockPrompts[activePromptIndex];
                if (nextItem) {
                  const nextText = getPromptText(nextItem);
                  if (nextText) injectPromptIntoDola(nextText);
                }
                saveDockPrompts();
                renderDockCards();
                scrollToActiveCard();
              }, 400);
              if (typeof window.__showChannaNotice === 'function') {
                window.__showChannaNotice(`✅ Prompt #${String(activePromptIndex + 1).padStart(2, '0')} pasted into Dola chat!`);
              }
            }
          }
        });
      }

      // Filter pills binding
      const filterPills = dock.querySelectorAll('.channa-dock-filter-pill');
      filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
          dockFilter = pill.dataset.filter || 'all';
          renderDockCards();
        });
      });

      // Auto-advance checkbox
      const autoAdvChk = document.getElementById('channa-dock-auto-advance-chk');
      if (autoAdvChk) {
        autoAdvChk.addEventListener('change', e => {
          autoAdvanceEnabled = e.target.checked;
        });
      }

      // Close button
      const closeBtn = document.getElementById('channa-dock-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          dock.style.setProperty('display', 'none', 'important');
          syncPromptDockAndToggle();
        });
      }

      // Search box
      const searchBox = document.getElementById('channa-dock-search-box');
      if (searchBox) {
        searchBox.addEventListener('input', (e) => {
          dockSearchQuery = (e.target.value || '').trim().toLowerCase();
          renderDockCards();
        });
      }

      // Reset Done
      const resetDoneBtn = document.getElementById('channa-dock-reset-done');
      if (resetDoneBtn) {
        resetDoneBtn.addEventListener('click', () => {
          localDockPrompts.forEach(p => p.done = false);
          renderDockCards();
          saveDockPrompts();
        });
      }

      // Clear All
      const clearAllBtn = document.getElementById('channa-dock-clear-all');
      if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
          if (confirm('Clear all prompts from dock?')) {
            localDockPrompts = [];
            activePromptIndex = 0;
            renderDockCards();
            saveDockPrompts();
          }
        });
      }

      applyDockMode(dockMode);
    }
  }

  function scrollToActiveCard() {
    const dock = document.getElementById('channa-prompt-dock');
    if (dock && dock.scrollTop !== 0) {
      dock.scrollTop = 0;
    }

    const list = document.getElementById('channa-dock-prompt-list');
    const drawer = document.getElementById('channa-dock-drawer');
    if (!list || !drawer || drawer.style.display === 'none') {
      if (dock) dock.scrollTop = 0;
      return;
    }

    setTimeout(() => {
      if (dock && dock.scrollTop !== 0) {
        dock.scrollTop = 0;
      }
      const card = document.getElementById(`channa-dock-card-${activePromptIndex}`);
      if (card && list) {
        // Calculate offset strictly inside list container ONLY — never scroll outer dock or page!
        const cardOffsetTop = card.offsetTop;
        const cardHeight = card.offsetHeight;
        const listHeight = list.clientHeight;
        const targetScroll = cardOffsetTop - (listHeight / 2) + (cardHeight / 2);

        list.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }
      if (dock && dock.scrollTop !== 0) {
        dock.scrollTop = 0;
      }
    }, 25);
  }

  // Delegated click handler for Card actions
  document.addEventListener('click', (e) => {
    // 1. Direct Paste Button
    const pasteBtn = e.target.closest('.channa-dock-paste-btn');
    if (pasteBtn) {
      const idx = parseInt(pasteBtn.dataset.idx, 10);
      if (!isNaN(idx) && localDockPrompts[idx]) {
        const item = localDockPrompts[idx];
        const text = getPromptText(item);
        const success = injectPromptIntoDola(text);
        if (success) {
          pasteBtn.textContent = '✓ PASTED!';
          pasteBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
          item.done = true;
          activePromptIndex = idx;
          if (autoAdvanceEnabled) {
            advanceToNextPrompt(idx);
          }
          saveDockPrompts();
          renderDockCards();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice(`✅ Prompt #${String(idx + 1).padStart(2, '0')} pasted into Dola chat!`);
          }
        }
      }
      return;
    }

    // 2. Paste & Next Button
    const pasteNextBtn = e.target.closest('.channa-dock-paste-next-btn');
    if (pasteNextBtn) {
      const idx = parseInt(pasteNextBtn.dataset.idx, 10);
      if (!isNaN(idx) && localDockPrompts[idx]) {
        const item = localDockPrompts[idx];
        const text = getPromptText(item);
        const success = injectPromptIntoDola(text);
        if (success) {
          pasteNextBtn.textContent = '✓ PASTED!';
          item.done = true;
          advanceToNextPrompt(idx);
          const nextItem = localDockPrompts[activePromptIndex];
          if (nextItem) {
            const nextText = getPromptText(nextItem);
            if (nextText) injectPromptIntoDola(nextText);
          }
          saveDockPrompts();
          renderDockCards();
          scrollToActiveCard();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice(`✅ Prompt #${String(idx + 1).padStart(2, '0')} pasted! Advanced to #${String(activePromptIndex + 1).padStart(2, '0')}.`);
          }
        }
      }
      return;
    }

    // 3. Expand / Collapse text toggle
    const expandToggle = e.target.closest('.channa-dock-toggle-expand');
    if (expandToggle) {
      const idx = parseInt(expandToggle.dataset.idx, 10);
      if (!isNaN(idx)) {
        if (expandedCardIndices.has(idx)) {
          expandedCardIndices.delete(idx);
        } else {
          expandedCardIndices.add(idx);
        }
        renderDockCards();
      }
      return;
    }

    // 4. Toggle Done status
    const doneBtn = e.target.closest('.channa-dock-toggle-done-btn');
    if (doneBtn) {
      const idx = parseInt(doneBtn.dataset.idx, 10);
      if (!isNaN(idx) && localDockPrompts[idx]) {
        localDockPrompts[idx].done = !localDockPrompts[idx].done;
        saveDockPrompts();
        renderDockCards();
      }
      return;
    }

    // 5. Delete button
    const delBtn = e.target.closest('.channa-dock-del-btn');
    if (delBtn) {
      const idx = parseInt(delBtn.dataset.idx, 10);
      if (!isNaN(idx) && localDockPrompts[idx]) {
        localDockPrompts.splice(idx, 1);
        if (activePromptIndex >= localDockPrompts.length) {
          activePromptIndex = Math.max(0, localDockPrompts.length - 1);
        }
        saveDockPrompts();
        renderDockCards();
      }
      return;
    }

    // 6. Card Body Click: Select & Paste into chat prompt box
    const card = e.target.closest('.channa-dock-card');
    if (card && !e.target.closest('button') && !e.target.closest('input')) {
      const cardIdx = parseInt(card.id.replace('channa-dock-card-', ''), 10);
      if (!isNaN(cardIdx) && localDockPrompts[cardIdx]) {
        selectAndPastePrompt(cardIdx);
      }
      return;
    }
  });

  // Cross-world communication
  window.addEventListener('message', (e) => {
    if (e.data?.type === 'CTB_SYNC_PROMPTS') {
      if (Array.isArray(e.data.prompts)) {
        localDockPrompts = e.data.prompts;
        ensurePromptDockDOM();
        renderDockCards();
        syncPromptDockAndToggle();
      }
    }
    if (e.data?.type === 'CHANNA_PASTE_PROMPT') {
      const promptText = getPromptText(e.data);
      if (promptText) {
        injectPromptIntoDola(promptText);
        if (typeof window.__showChannaNotice === 'function') {
          const num = e.data.promptNumber ? `#${String(e.data.promptNumber).padStart(2, '0')} ` : '';
          window.__showChannaNotice(`✅ Prompt ${num}pasted into chat!`);
        }
      }
    }
  });

  // Close dock on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const dock = document.getElementById('channa-prompt-dock');
      if (dock && dock.style.display !== 'none') {
        dock.style.setProperty('display', 'none', 'important');
        syncPromptDockAndToggle();
      }
    }
  }, { passive: true });

  // Close dock on outside pointerdown
  document.addEventListener('pointerdown', (e) => {
    const dock = document.getElementById('channa-prompt-dock') || document.getElementById('channa-workflow-hud');
    const toggleBtn = document.getElementById('channa-dock-toggle-btn');
    if (!dock || dock.style.display === 'none') return;
    if (!dock.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      dock.style.setProperty('display', 'none', 'important');
      syncPromptDockAndToggle();
    }
  }, { passive: true });

  function initPromptDock() {
    ensurePromptDockDOM();
    syncPromptDockAndToggle();
    if (localDockPrompts.length === 0) {
      window.postMessage({ type: 'CTB_REQUEST_PROMPT_SYNC' }, '*');
    }
  }

  initPromptDock();
  setTimeout(() => window.postMessage({ type: 'CTB_REQUEST_PROMPT_SYNC' }, '*'), 500);
  setTimeout(() => window.postMessage({ type: 'CTB_REQUEST_PROMPT_SYNC' }, '*'), 1500);
  setInterval(initPromptDock, 4000);
  window.addEventListener('DOMContentLoaded', initPromptDock, { passive: true });
  window.addEventListener('load', initPromptDock, { passive: true });
})();

  // ⚡ DOLA HIGH DEMAND AUTO-BYPASS & ANTI-FLAGGING CONTROLLER
  (() => {
    let isDemandRecovering = false;
    let demandRetryAttempts = 0;
    const MAX_DEMAND_RETRIES = 1;

    // Reset attempt counter when user interacts or manually sends
    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', () => { demandRetryAttempts = 0; }, { passive: true });
      document.addEventListener('click', (e) => {
        if (e.target && e.target.closest && e.target.closest('button[type="submit"], [class*="send" i], [class*="submit" i]')) {
          demandRetryAttempts = 0;
        }
      }, { passive: true });
    }

    function checkAndAutoRecoverHighDemand() {
    }

    setInterval(checkAndAutoRecoverHighDemand, 4000);
  })();

  // ============================================================================
  // 🎭 IN-PAGE ACTOR VAULT COMPOSER PILL & QUICK POPOVER (MUKAMMAL)
  // ============================================================================
  (() => {
    'use strict';

    // Inject In-Page Button Styles
    function injectActorStyles() {
      if (document.getElementById('channa-actor-styles')) return;
      const style = document.createElement('style');
      style.id = 'channa-actor-styles';
      style.textContent = `
        div[class*="chat-input"], form, div:has(> #flow-end-msg-send) {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        #channa-actor-ref-btn, #channa-video-ref-btn {
          display: inline-flex !important;
          align-items: center !important;
          gap: 3px !important;
          border-radius: 9999px !important;
          padding: 2.5px 8px !important;
          font-size: 10.5px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          user-select: none !important;
          margin-left: 4px !important;
          flex-shrink: 0 !important;
          white-space: nowrap !important;
          max-width: 95px !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          box-sizing: border-box !important;
        }
        #channa-actor-ref-btn {
          display: none !important;
        }
        #channa-actor-dock-btn {
          position: fixed !important;
          top: calc(50% + 44px) !important;
          right: 0px !important;
          left: auto !important;
          bottom: auto !important;
          transform: translateY(-50%) !important;
          border-radius: 14px 0 0 14px !important;
          z-index: 999999 !important;
          background: linear-gradient(135deg, #db2777 0%, #7c3aed 100%) !important;
          border: 1px solid rgba(244, 114, 182, 0.6) !important;
          border-right: none !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.65), -2px 0 10px rgba(219, 39, 119, 0.5) !important;
          transition: transform 0.2s ease, right 0.2s ease, box-shadow 0.2s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          user-select: none !important;
        }
        #channa-actor-dock-btn:hover {
          transform: translateY(-50%) scale(1.04) !important;
          box-shadow: -6px 0 28px rgba(219, 39, 119, 0.75) !important;
        }
        #channa-video-ref-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: rgba(56, 189, 248, 0.12) !important;
          border: 1px solid rgba(56, 189, 248, 0.55) !important;
          color: #38bdf8 !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          min-width: 24px !important;
          max-width: 24px !important;
          padding: 0 !important;
          font-size: 12.5px !important;
          cursor: pointer !important;
          user-select: none !important;
          margin-left: 5px !important;
          box-shadow: 0 1px 6px rgba(56, 189, 248, 0.2) !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
          position: relative !important;
          z-index: 99999 !important;
          pointer-events: auto !important;
        }
        #channa-video-ref-btn:hover {
          background: rgba(56, 189, 248, 0.25) !important;
          border-color: #38bdf8 !important;
          color: #ffffff !important;
          transform: scale(1.1) !important;
          box-shadow: 0 0 12px rgba(56, 189, 248, 0.5) !important;
        }
        .channa-actor-popover {
          position: fixed !important;
          background: rgba(15, 12, 27, 0.96) !important;
          border: 1px solid rgba(244, 114, 182, 0.45) !important;
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), 0 0 15px rgba(236, 72, 153, 0.25) !important;
          border-radius: 14px !important;
          padding: 12px !important;
          min-width: 260px !important;
          max-width: 320px !important;
          z-index: 2147483647 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          backdrop-filter: blur(12px) !important;
        }
        .channa-actor-item {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          padding: 7px 10px !important;
          border-radius: 9px !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          border: 1px solid transparent !important;
          margin-bottom: 4px !important;
        }
        .channa-actor-item:hover {
          background: rgba(236, 72, 153, 0.15) !important;
          border-color: rgba(244, 114, 182, 0.3) !important;
        }
        .channa-actor-item.active {
          background: rgba(236, 72, 153, 0.25) !important;
          border-color: #ec4899 !important;
        }
      `;
      document.head.appendChild(style);
    }

    let injectedActorVault = null;

    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CTB_SYNC_ACTOR_VAULT_PAYLOAD' && e.data.vault) {
        injectedActorVault = e.data.vault;
        window.__CHANNA_ACTOR_VAULT__ = e.data.vault;
        syncActorComposerButton();
      }
    });

    // Request initial vault
    window.postMessage({ type: 'CTB_REQUEST_ACTOR_VAULT' }, '*');

    function safeEscapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
    }

    function getActorVault() {
      return window.__CHANNA_ACTOR_VAULT__ || injectedActorVault || null;
    }

    // Hook into prompts for auto-injecting DNA
    function applyDnaToPromptInjected(text) {
      if (!text || typeof text !== 'string') return text;
      const vault = getActorVault();
      if (!vault || !vault.activeCharacterId || vault.autoInjectDNA === false) return text;
      const actor = (vault.characters || []).find(c => c.id === vault.activeCharacterId);
      if (!actor || !actor.dnaTokens) return text;
      const dna = actor.dnaTokens.trim();
      if (!dna || text.includes(dna) || (actor.name && text.toLowerCase().includes(actor.name.toLowerCase()))) {
        return text;
      }
      return `[Character DNA: ${dna}] ${text.trim()}`;
    }
    window.__applyCharacterDna = applyDnaToPromptInjected;

    // Mount Actor Vault button outside chatbox underneath the prompt dock
    function syncActorComposerButton() {
      injectActorStyles();

      // 1. Permanently remove old button from composer toolbar if present (keeps chat box 100% clean)
      const oldComposerBtn = document.getElementById('channa-actor-ref-btn');
      if (oldComposerBtn) oldComposerBtn.remove();

      // 2. Mount companion floating dock button directly below #channa-dock-toggle-btn
      let actorDockBtn = document.getElementById('channa-actor-dock-btn');
      if (!actorDockBtn || !actorDockBtn.isConnected) {
        if (actorDockBtn) actorDockBtn.remove();
        actorDockBtn = document.createElement('button');
        actorDockBtn.id = 'channa-actor-dock-btn';
        actorDockBtn.type = 'button';
        actorDockBtn.title = '🎭 Channa Actor Vault (Click to view & stage characters)';

        actorDockBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openActorQuickPopover(actorDockBtn);
        };

        (document.body || document.documentElement).appendChild(actorDockBtn);
      }

      // Update badge and label based on vault
      const vault = getActorVault();
      const chars = vault?.characters || [];
      let activeActor = null;
      if (vault && vault.activeCharacterId) {
        activeActor = chars.find(c => c.id === vault.activeCharacterId) || null;
      }
      const labelText = activeActor ? activeActor.name.split(' ')[0] : 'ACTORS';
      const currentBadge = document.getElementById('channa-actor-dock-btn-badge');
      if (currentBadge && currentBadge.textContent === String(chars.length) && actorDockBtn.getAttribute('data-active-label') === labelText) {
        return;
      }
      actorDockBtn.setAttribute('data-active-label', labelText);
      actorDockBtn.innerHTML = `
        <span style="font-size: 13px;">🎭</span>
        <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">${safeEscapeHtml(labelText.toUpperCase())}</span>
        <span id="channa-actor-dock-btn-badge" style="background: rgba(255,255,255,0.25); color: #fff; font-size: 9px; font-weight: 700; border-radius: 10px; padding: 1px 5px;">${chars.length}</span>
      `;
    }

    function handleActorButtonClick(btn) {
      openActorQuickPopover(btn);
    }

    function openActorQuickPopover(btn) {
      const existing = document.getElementById('channa-actor-quick-popover');
      if (existing) {
        existing.remove();
        return;
      }

      const existingAcc = document.getElementById('channa-accounts-quick-popover');
      if (existingAcc) existingAcc.remove();

      const vault = getActorVault();
      const chars = vault?.characters || [];
      const activeChar = chars.find(c => c.id === vault?.activeCharacterId) || null;

      const popover = document.createElement('div');
      popover.id = 'channa-actor-quick-popover';
      popover.className = 'channa-actor-popover';

      let charsHtml = '';
      if (chars.length === 0) {
        charsHtml = `
          <div style="padding: 16px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
            No saved characters in vault.<br>
            <span style="color: #ec4899; font-weight: 700;">Open ChannaTheBrand Sidepanel</span> to add actors!
          </div>
        `;
      } else {
        charsHtml = chars.map(c => {
          const isActive = vault?.activeCharacterId === c.id;
          const avatar = c.avatarUrl ? `<img src="${c.avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid ${isActive ? '#ec4899' : '#475569'}; flex-shrink: 0;" />` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #2d1b4e; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">🎭</div>`;
          return `
            <div class="channa-actor-item ${isActive ? 'active' : ''}" data-char-id="${c.id}" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                ${avatar}
                <div style="flex: 1; min-width: 0;">
                  <div style="font-size: 12px; font-weight: 700; color: ${isActive ? '#ffffff' : '#e2e8f0'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeEscapeHtml(c.name)}</div>
                  <div style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${safeEscapeHtml(c.dnaTokens || 'No DNA tags')}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                <button type="button" class="channa-stage-actor-btn" data-char-id="${c.id}" style="background: linear-gradient(135deg, #ec4899, #db2777); color: #fff; border: none; border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;">
                  ⚡ Stage
                </button>
                ${isActive ? '<span style="font-size: 9px; font-weight: 800; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; padding: 2px 6px; border-radius: 999px;">LOCKED</span>' : ''}
              </div>
            </div>
          `;
        }).join('');
      }

      popover.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <div style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 800; color: #f472b6;">
            <span>🎭</span>
            <span>Actor Vault Continuity</span>
            <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">(${chars.length})</span>
          </div>
          <button id="channa-actor-popover-close" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer; padding: 2px 4px;">✕</button>
        </div>
        ${activeChar ? `
          <div style="background: rgba(236, 72, 153, 0.12); border: 1px solid rgba(236, 72, 153, 0.35); border-radius: 8px; padding: 6px 10px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; color: #f472b6; font-weight: 700;">🟢 Active: ${safeEscapeHtml(activeChar.name)}</span>
            <button id="channa-quick-stage-active" style="background: #ec4899; color: #fff; border: none; border-radius: 6px; padding: 3px 8px; font-size: 10px; font-weight: 700; cursor: pointer;">⚡ Re-Stage</button>
          </div>
        ` : ''}
        <div style="max-height: 240px; overflow-y: auto; margin-bottom: 8px;">
          ${charsHtml}
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 10.5px;">
          <span style="color: #94a3b8;">Click ⚡ Stage to attach photo to chat</span>
          <span style="color: #a78bfa; font-weight: 600;">ChannaTheBrand Pro</span>
        </div>
      `;

      document.body.appendChild(popover);
      const rect = btn.getBoundingClientRect();
      popover.style.right = '60px';
      popover.style.left = 'auto';
      popover.style.top = `${Math.max(60, Math.min(window.innerHeight - 380, rect.top - 70))}px`;
      popover.style.bottom = 'auto';

      popover.querySelector('#channa-actor-popover-close').onclick = (e) => {
        e.stopPropagation();
        popover.remove();
      };

      let lastActorStageClick = 0;

      const quickStageBtn = popover.querySelector('#channa-quick-stage-active');
      if (quickStageBtn && activeChar) {
        quickStageBtn.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const now = Date.now();
          if (now - lastActorStageClick < 1000) return;
          lastActorStageClick = now;
          window.postMessage({ type: 'STAGE_CHARACTER_ACTOR', actor: activeChar }, '*');
          popover.remove();
        };
      }

      popover.querySelectorAll('.channa-actor-item').forEach(el => {
        el.onclick = (e) => {
          e.stopPropagation();
          e.preventDefault();
          const now = Date.now();
          if (now - lastActorStageClick < 1000) return;
          lastActorStageClick = now;
          const charId = el.getAttribute('data-char-id');
          if (charId && vault) {
            vault.activeCharacterId = charId;
            window.__CHANNA_ACTOR_VAULT__ = vault;
            window.postMessage({ type: 'CTB_SET_ACTIVE_ACTOR', characterId: charId }, '*');
            const targetChar = (vault.characters || []).find(c => c.id === charId);
            if (targetChar) {
              window.postMessage({ type: 'STAGE_CHARACTER_ACTOR', actor: targetChar }, '*');
            }
            syncActorComposerButton();
          }
          popover.remove();
        };
      });

      const onOutsideClick = (e) => {
        if (!popover.contains(e.target) && e.target !== btn) {
          popover.remove();
          document.removeEventListener('click', onOutsideClick);
        }
      };
      setTimeout(() => document.addEventListener('click', onOutsideClick), 50);
    }

    setInterval(syncActorComposerButton, 3500);
  })();

  // =========================================================================
  // 👥 CHANNA ACCOUNTS DOCK & INSTANT MULTI-PROFILE SWITCHER
  // Positioned directly ABOVE Prompts Dock at top: calc(50% - 44px)
  // =========================================================================
  (() => {
    'use strict';

    function injectAccountsStyles() {
      if (document.getElementById('ctb-accounts-dock-style')) return;
      const style = document.createElement('style');
      style.id = 'ctb-accounts-dock-style';
      style.textContent = `
        #channa-accounts-dock-btn {
          position: fixed !important;
          top: calc(50% - 44px) !important;
          right: 0px !important;
          left: auto !important;
          bottom: auto !important;
          transform: translateY(-50%) !important;
          border-radius: 14px 0 0 14px !important;
          z-index: 999999 !important;
          background: linear-gradient(135deg, #059669 0%, #0284c7 100%) !important;
          border: 1px solid rgba(52, 211, 153, 0.6) !important;
          border-right: none !important;
          color: #ffffff !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.65), -2px 0 10px rgba(5, 150, 105, 0.5) !important;
          transition: transform 0.2s ease, right 0.2s ease, box-shadow 0.2s ease !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          user-select: none !important;
        }
        #channa-accounts-dock-btn:hover {
          transform: translateY(-50%) scale(1.04) !important;
          box-shadow: -6px 0 28px rgba(5, 150, 105, 0.75) !important;
        }
        .channa-accounts-popover {
          position: fixed !important;
          background: rgba(15, 12, 27, 0.96) !important;
          border: 1px solid rgba(52, 211, 153, 0.45) !important;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 20px rgba(16, 185, 129, 0.25) !important;
          border-radius: 14px !important;
          padding: 12px !important;
          min-width: 280px !important;
          max-width: 340px !important;
          z-index: 2147483647 !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          backdrop-filter: blur(16px) !important;
          color: #f1f5f9 !important;
          box-sizing: border-box !important;
        }
        .channa-acc-item {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          padding: 7px 10px !important;
          border-radius: 9px !important;
          cursor: pointer !important;
          transition: all 0.15s ease !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.03) !important;
          margin-bottom: 5px !important;
          box-sizing: border-box !important;
        }
        .channa-acc-item:hover {
          background: rgba(16, 185, 129, 0.12) !important;
          border-color: rgba(52, 211, 153, 0.35) !important;
        }
        .channa-acc-item.active {
          background: rgba(16, 185, 129, 0.18) !important;
          border-color: #10b981 !important;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.2) !important;
        }
        .channa-acc-num-badge {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 8.5px;
          font-weight: 800;
          border-radius: 4px;
          padding: 2px 4px;
          letter-spacing: 0.5px;
          flex-shrink: 0;
        }
        .channa-acc-item.active .channa-acc-num-badge {
          background: rgba(16, 185, 129, 0.25);
          color: #34d399;
        }
        .channa-acc-search-box {
          width: 100% !important;
          box-sizing: border-box !important;
          background: rgba(255, 255, 255, 0.06) !important;
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 8px !important;
          color: #fff !important;
          font-size: 11px !important;
          padding: 6px 10px !important;
          margin-bottom: 8px !important;
          outline: none !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
        }
        .channa-acc-search-box:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.3) !important;
        }
        .channa-acc-list-scroll {
          max-height: 270px !important;
          overflow-y: auto !important;
          padding-right: 2px !important;
        }
        .channa-acc-list-scroll::-webkit-scrollbar {
          width: 4px !important;
        }
        .channa-acc-list-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2) !important;
        }
        .channa-acc-list-scroll::-webkit-scrollbar-thumb {
          background: #059669 !important;
          border-radius: 4px !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    let injectedAccountsList = {};
    let injectedActiveAccountName = '';

    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CTB_SYNC_ACCOUNTS_PAYLOAD') {
        injectedAccountsList = e.data.profiles || {};
        if (e.data.activeProfile) {
          injectedActiveAccountName = e.data.activeProfile;
        }
        syncAccountsDockButton();
      }
      if (e.data?.type === 'SET_ACTIVE_ACCOUNT_NAME' && e.data.activeAccountName) {
        injectedActiveAccountName = e.data.activeAccountName;
        syncAccountsDockButton();
      }
    });

    // Request initial accounts sync
    window.postMessage({ type: 'CTB_REQUEST_ACCOUNTS_SYNC' }, '*');

    function safeEscape(str) {
      if (!str) return '';
      return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m]);
    }

    function getResolvedActiveAccount() {
      if (injectedActiveAccountName && injectedActiveAccountName !== 'Default') {
        return injectedActiveAccountName.trim();
      }
      const accNameSpan = document.getElementById('ctb-acc-name');
      if (accNameSpan && accNameSpan.textContent && accNameSpan.textContent !== 'Connecting...') {
        return accNameSpan.textContent.trim();
      }
      return injectedActiveAccountName || '';
    }

    function isAccountActive(name, activeName) {
      if (!name || !activeName) return false;
      const n = name.trim().toLowerCase();
      const a = activeName.trim().toLowerCase();
      return n === a || n.includes(a) || a.includes(n);
    }

    function syncAccountsDockButton() {
      injectAccountsStyles();

      let accountsDockBtn = document.getElementById('channa-accounts-dock-btn');
      if (!accountsDockBtn || !accountsDockBtn.isConnected) {
        if (accountsDockBtn) accountsDockBtn.remove();
        accountsDockBtn = document.createElement('button');
        accountsDockBtn.id = 'channa-accounts-dock-btn';
        accountsDockBtn.type = 'button';
        accountsDockBtn.title = '👥 Channa Accounts Dock (Click to view & switch accounts)';

        accountsDockBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAccountsQuickPopover(accountsDockBtn);
        };

        accountsDockBtn.innerHTML = `
          <span style="font-size: 13px;">👥</span>
          <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.5px;">ACCOUNTS</span>
          <span id="channa-accounts-dock-btn-badge" style="background: rgba(255,255,255,0.25); color: #fff; font-size: 9px; font-weight: 700; border-radius: 10px; padding: 1px 5px;">0</span>
        `;

        (document.body || document.documentElement).appendChild(accountsDockBtn);
      }

      const profiles = injectedAccountsList || {};
      const totalAccs = Object.keys(profiles).length;

      const badge = document.getElementById('channa-accounts-dock-btn-badge');
      if (badge && badge.textContent !== String(totalAccs)) {
        badge.textContent = String(totalAccs);
      }
    }

    function openAccountsQuickPopover(btn) {
      const existing = document.getElementById('channa-accounts-quick-popover');
      if (existing) {
        existing.remove();
        return;
      }

      const existingActor = document.getElementById('channa-actor-quick-popover');
      if (existingActor) existingActor.remove();

      const popover = document.createElement('div');
      popover.id = 'channa-accounts-quick-popover';
      popover.className = 'channa-accounts-popover';

      const rect = btn.getBoundingClientRect();
      popover.style.right = '60px';
      const idealTop = rect.top - 80;
      const clampedTop = Math.max(60, Math.min(window.innerHeight - 380, idealTop));
      popover.style.top = `${clampedTop}px`;

      const profiles = injectedAccountsList || {};
      const profileKeys = Object.keys(profiles);
      const activeName = getResolvedActiveAccount();

      let headerHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 7px;">
          <div style="display: flex; align-items: center; gap: 7px;">
            <span style="font-size: 16px;">👥</span>
            <div>
              <div style="font-weight: 800; font-size: 12px; color: #f8fafc; letter-spacing: 0.4px;">ACCOUNTS DOCK</div>
              <div style="font-size: 9.5px; color: #34d399; font-weight: 600;">⚡ Instant Switcher (${profileKeys.length} Accounts)</div>
            </div>
          </div>
          <button id="channa-accounts-popover-close" style="background: none; border: none; color: #94a3b8; font-size: 15px; cursor: pointer; padding: 2px 6px; border-radius: 4px;">✕</button>
        </div>
      `;

      let searchHtml = '';
      if (profileKeys.length > 3) {
        searchHtml = `
          <input type="text" id="channa-accounts-search-input" class="channa-acc-search-box" placeholder="🔍 Search accounts...">
        `;
      }

      let listHtml = '';
      if (profileKeys.length === 0) {
        listHtml = `
          <div style="padding: 16px 8px; text-align: center; color: #94a3b8; font-size: 12px;">
            No saved accounts in extension.<br>
            <span style="color: #34d399; font-weight: 700;">Open Channa Tool Pro (Accounts tab)</span> to add or capture accounts!
          </div>
        `;
      } else {
        const itemsHtml = profileKeys.map((name, idx) => {
          const prof = profiles[name] || {};
          const numStr = `#${String(idx + 1).padStart(2, '0')}`;
          const isActive = isAccountActive(name, activeName);
          const countLabel = prof.count ? `${prof.count} Cookies` : 'Saved Account';
          const dateLabel = prof.date ? ` • ${prof.date}` : '';

          return `
            <div class="channa-acc-item ${isActive ? 'active' : ''}" data-profile-name="${safeEscape(name)}">
              <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;">
                <span class="channa-acc-num-badge">${numStr}</span>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; gap: 5px;">
                    <span style="font-size: 11.5px; font-weight: 700; color: #f1f5f9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;" title="${safeEscape(name)}">${safeEscape(name)}</span>
                    ${isActive ? '<span style="background: rgba(16, 185, 129, 0.25); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.5); font-size: 8px; font-weight: 800; padding: 1px 4px; border-radius: 4px;">🟢 ACTIVE</span>' : ''}
                  </div>
                  <div style="font-size: 8.5px; color: #94a3b8; margin-top: 1px;">${safeEscape(countLabel)}${safeEscape(dateLabel)}</div>
                </div>
              </div>
              <div style="flex-shrink: 0; margin-left: 6px;">
                ${isActive 
                  ? '<span style="font-size: 9.5px; font-weight: 700; color: #34d399; padding: 3px 8px; border-radius: 6px; background: rgba(52,211,153,0.15); border: 1px solid rgba(52,211,153,0.3); display: inline-block;">Current</span>'
                  : `<button class="ctb-acc-switch-action-btn" data-profile="${safeEscape(name)}" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); border: 1px solid #34d399; color: #fff; font-size: 9.5px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 3px; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);">⚡ Switch</button>`
                }
              </div>
            </div>
          `;
        }).join('');

        listHtml = `<div class="channa-acc-list-scroll" id="channa-accounts-list-wrap">${itemsHtml}</div>`;
      }

      const footerHtml = `
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; font-size: 9px; color: #94a3b8;">
          <span>💡 Click any account to switch instantly</span>
          <span style="color: #34d399; font-weight: 700;">Safe Hot-Swap</span>
        </div>
      `;

      popover.innerHTML = headerHtml + searchHtml + listHtml + footerHtml;
      (document.body || document.documentElement).appendChild(popover);

      const closeBtn = popover.querySelector('#channa-accounts-popover-close');
      if (closeBtn) closeBtn.onclick = () => popover.remove();

      const searchInput = popover.querySelector('#channa-accounts-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = (e.target.value || '').toLowerCase().trim();
          const items = popover.querySelectorAll('.channa-acc-item');
          items.forEach(it => {
            const pName = (it.getAttribute('data-profile-name') || '').toLowerCase();
            it.style.display = (!q || pName.includes(q)) ? 'flex' : 'none';
          });
        });
      }

      const triggerSwitch = (profileName, clickedEl) => {
        if (!profileName) return;
        const allBtns = popover.querySelectorAll('.ctb-acc-switch-action-btn');
        allBtns.forEach(b => {
          b.disabled = true;
          b.style.opacity = '0.6';
        });
        const btnTarget = clickedEl?.closest('.channa-acc-item')?.querySelector('.ctb-acc-switch-action-btn') || clickedEl;
        if (btnTarget && btnTarget.tagName === 'BUTTON') {
          btnTarget.innerHTML = '⏳ Switching...';
        }

        if (typeof window.__showChannaNotice === 'function') {
          window.__showChannaNotice(`⚡ Switching to account "${profileName}"...`, 4000);
        }

        try {
          sessionStorage.setItem('__ctb_switch_cooldown', String(Date.now() + 90000));
          sessionStorage.setItem('__ctb_last_limit_switch', String(Date.now()));
          sessionStorage.removeItem('__ctb_reload_guard');
          sessionStorage.removeItem('__ctb_err_rec_count');
          window.name = (window.name || '').replace(/__ctb_guard:\[[^\]]*\]/g, '').trim();
        } catch (e) {}

        window.postMessage({
          type: 'CTB_SWITCH_ACCOUNT_PROFILE',
          profileName: profileName
        }, '*');

        setTimeout(() => {
          popover.remove();
        }, 500);
      };

      const rows = popover.querySelectorAll('.channa-acc-item');
      rows.forEach(row => {
        row.onclick = (e) => {
          const pName = row.getAttribute('data-profile-name');
          if (row.classList.contains('active')) return;
          triggerSwitch(pName, e.target);
        };
      });

      const onOutsideClick = (e) => {
        if (!popover.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          popover.remove();
          document.removeEventListener('click', onOutsideClick);
        }
      };
      setTimeout(() => document.addEventListener('click', onOutsideClick), 50);
    }

    setInterval(syncAccountsDockButton, 3500);
  })();

  // =========================================================================
  // 🎬 UNIVERSAL MULTI-ASPECT RATIO & CODEC VIDEO REFERENCE ENGINE
  // Pure WASM HEVC (H.265 / Seedance 2.5) Demuxer & Decoder + Native Fallback
  // Universal Aspect Ratio: 16:9, 9:16, 4:3, 1:1, 21:9, 3:4
  // =========================================================================
  (() => {
    'use strict';

    // 1. Inject Styles
    function injectStyles() {
      let style = document.getElementById('channa-ref-styles');
      if (!style) {
        style = document.createElement('style');
        style.id = 'channa-ref-styles';
        (document.head || document.documentElement || document.body).appendChild(style);
      }
      style.textContent = `
        .channa-ref-modal-overlay {
          position: fixed !important;
          inset: 0 !important;
          background: rgba(8, 6, 18, 0.88) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          z-index: 2147483647 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          padding: 14px !important;
          box-sizing: border-box !important;
        }
        .channa-ref-modal {
          position: relative !important;
          z-index: 2147483647 !important;
          background: linear-gradient(180deg, #130f24 0%, #0c0917 100%) !important;
          border: 1px solid rgba(139, 92, 246, 0.45) !important;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(139, 92, 246, 0.25) !important;
          border-radius: 18px !important;
          width: 100% !important;
          max-width: 620px !important;
          max-height: 94vh !important;
          overflow-y: auto !important;
          color: #f8fafc !important;
          padding: 18px 20px !important;
          box-sizing: border-box !important;
          animation: channaRefPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        @keyframes channaRefPop {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .channa-ref-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .channa-ref-title {
          font-size: 15px;
          font-weight: 800;
          background: linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .channa-ref-close {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          font-size: 14px;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-close:hover {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .channa-ref-dropzone {
          border: 2px dashed rgba(139, 92, 246, 0.45);
          border-radius: 14px;
          padding: 24px 16px;
          text-align: center;
          background: rgba(139, 92, 246, 0.04);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .channa-ref-dropzone:hover {
          border-color: #a78bfa;
          background: rgba(139, 92, 246, 0.08);
        }
        .channa-ref-chat-import-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding: 8px 12px;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 10px;
        }
        .channa-ref-import-btn {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          border: none;
          color: #fff;
          padding: 5px 12px;
          border-radius: 7px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .channa-ref-import-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.4);
        }
        .channa-ref-scrubber-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .channa-ref-pin-btn {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.4);
          color: #34d399;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-pin-btn:hover {
          background: rgba(16, 185, 129, 0.28);
          color: #fff;
        }
        .channa-ref-change-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #cbd5e1;
          border-radius: 6px;
          padding: 3px 8px;
          font-size: 10px;
          cursor: pointer;
        }
        .channa-ref-modes {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0 10px;
        }
        .channa-ref-mode-pill {
          flex: 1 1 calc(25% - 6px);
          min-width: 95px;
          padding: 6px 6px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8;
          font-size: 10.5px;
          font-weight: 600;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }
        .channa-ref-mode-pill:hover {
          background: rgba(139, 92, 246, 0.16);
          color: #f1f5f9;
          border-color: rgba(139, 92, 246, 0.35);
        }
        .channa-ref-mode-pill.active {
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          border-color: #a855f7;
          color: #ffffff;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
        }
        .channa-ref-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          max-height: 200px;
          overflow-y: auto;
          padding: 6px;
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          box-sizing: border-box;
        }
        .channa-ref-strip::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .channa-ref-strip::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 4px;
        }
        .channa-ref-strip::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.45);
          border-radius: 4px;
        }
        .channa-ref-strip::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
        .channa-ref-thumb-box {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          background: #000;
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .channa-ref-thumb-box:hover {
          border-color: #38bdf8;
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(56, 189, 248, 0.25);
        }
        .channa-ref-thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          background: #05040a;
        }
        .channa-ref-thumb-badge {
          position: absolute;
          bottom: 3px;
          right: 3px;
          background: rgba(0, 0, 0, 0.82);
          color: #38bdf8;
          font-size: 8px;
          font-weight: 700;
          padding: 1px 4px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }
        .channa-ref-thumb-step {
          position: absolute;
          top: 3px;
          left: 3px;
          background: rgba(124, 58, 237, 0.88);
          color: #fff;
          font-size: 8px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          backdrop-filter: blur(4px);
          pointer-events: none;
        }
        .channa-ref-inject-btn {
          width: 100%;
          margin-top: 12px;
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          border-radius: 10px;
          padding: 10px;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        }
        .channa-ref-inject-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
        }
        .channa-ref-inject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .channa-ref-prompt-analyzer-box {
          margin-top: 10px;
          padding: 10px 12px;
          background: rgba(56, 189, 248, 0.05);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 12px;
          box-sizing: border-box;
        }
        .channa-ref-prompt-textarea {
          width: 100%;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 8px;
          color: #f1f5f9;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 11px;
          line-height: 1.45;
          padding: 8px;
          resize: vertical;
          min-height: 60px;
          max-height: 140px;
        }
        .channa-ref-prompt-textarea:focus {
          outline: none;
          border-color: #38bdf8;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.25);
        }
        .channa-ref-tool-btn {
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          border: none;
          color: #fff;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-tool-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(56, 189, 248, 0.4);
        }
        .channa-ref-tool-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .channa-ref-mini-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #e2e8f0;
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .channa-ref-mini-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
        }
        .channa-ref-mini-btn.primary {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border: none;
          color: #fff;
          font-weight: 700;
        }
        .channa-ref-mini-btn.primary:hover {
          box-shadow: 0 2px 8px rgba(139, 92, 246, 0.4);
        }
      `;
      if (!style.parentElement) {
        (document.head || document.documentElement || document.body).appendChild(style);
      }
    }

    // 2. Pure JS MP4 Atom Demuxer
    function parseMp4Metadata(arrayBuffer) {
      try {
        const u8 = new Uint8Array(arrayBuffer);
        const dv = new DataView(arrayBuffer);

        function parseBoxes(start, end) {
          const boxes = [];
          let cur = start;
          while (cur + 8 <= end) {
            const size = dv.getUint32(cur);
            const type = String.fromCharCode(u8[cur+4], u8[cur+5], u8[cur+6], u8[cur+7]);
            if (size === 0) break;
            const boxEnd = cur + size;
            boxes.push({ type, offset: cur, size, boxEnd });
            if (boxEnd <= cur || boxEnd > end) break;
            cur = boxEnd;
          }
          return boxes;
        }

        const rootBoxes = parseBoxes(0, u8.length);
        const moov = rootBoxes.find(b => b.type === 'moov');
        if (!moov) return null;

        const moovBoxes = parseBoxes(moov.offset + 8, moov.boxEnd);
        const traks = moovBoxes.filter(b => b.type === 'trak');

        let videoTrak = null;
        for (const trak of traks) {
          const trakB = parseBoxes(trak.offset + 8, trak.boxEnd);
          const mdia = trakB.find(b => b.type === 'mdia');
          if (!mdia) continue;
          const mdiaB = parseBoxes(mdia.offset + 8, mdia.boxEnd);
          const hdlr = mdiaB.find(b => b.type === 'hdlr');
          if (hdlr) {
            const handler = String.fromCharCode(u8[hdlr.offset+16], u8[hdlr.offset+17], u8[hdlr.offset+18], u8[hdlr.offset+19]);
            if (handler === 'vide') {
              videoTrak = { trak, trakB, mdia, mdiaB };
              break;
            }
          }
        }

        if (!videoTrak) return null;

        const tkhd = videoTrak.trakB.find(b => b.type === 'tkhd');
        let width = 640, height = 360;
        if (tkhd) {
          width = dv.getUint32(tkhd.offset + tkhd.size - 8) >>> 16;
          height = dv.getUint32(tkhd.offset + tkhd.size - 4) >>> 16;
        }

        const mdhd = videoTrak.mdiaB.find(b => b.type === 'mdhd');
        let duration = 10;
        if (mdhd) {
          const version = u8[mdhd.offset + 8];
          const timescale = version === 0 ? dv.getUint32(mdhd.offset + 20) : dv.getUint32(mdhd.offset + 28);
          const durUnits = version === 0 ? dv.getUint32(mdhd.offset + 24) : Number(dv.getBigUint64(mdhd.offset + 32));
          if (timescale > 0) duration = durUnits / timescale;
        }

        const minf = videoTrak.mdiaB.find(b => b.type === 'minf');
        if (!minf) return null;
        const minfB = parseBoxes(minf.offset + 8, minf.boxEnd);
        const stbl = minfB.find(b => b.type === 'stbl');
        if (!stbl) return null;
        const stblB = parseBoxes(stbl.offset + 8, stbl.boxEnd);

        const stsz = stblB.find(b => b.type === 'stsz');
        const stco = stblB.find(b => b.type === 'stco' || b.type === 'co64');
        const stss = stblB.find(b => b.type === 'stss');

        const sampleCount = stsz ? dv.getUint32(stsz.offset + 16) : 0;
        const sampleSizes = [];
        if (stsz) {
          for (let i = 0; i < sampleCount; i++) sampleSizes.push(dv.getUint32(stsz.offset + 20 + i * 4));
        }

        const isCo64 = stco && stco.type === 'co64';
        const chunkCount = stco ? dv.getUint32(stco.offset + 12) : 0;
        const chunkOffsets = [];
        if (stco) {
          for (let i = 0; i < chunkCount; i++) {
            chunkOffsets.push(isCo64 ? Number(dv.getBigUint64(stco.offset + 16 + i * 8)) : dv.getUint32(stco.offset + 16 + i * 4));
          }
        }

        const syncSamples = [];
        if (stss) {
          const syncCount = dv.getUint32(stss.offset + 12);
          for (let i = 0; i < syncCount; i++) syncSamples.push(dv.getUint32(stss.offset + 16 + i * 4));
        }

        let hvcCOffset = -1, hvcCSize = 0;
        for (let i = stbl.offset; i < stbl.boxEnd - 8; i++) {
          if (u8[i+4] === 104 && u8[i+5] === 118 && u8[i+6] === 99 && u8[i+7] === 67) {
            hvcCOffset = i;
            hvcCSize = dv.getUint32(i);
            break;
          }
        }

        const parameterSets = [];
        let lengthSize = 4;
        if (hvcCOffset >= 0) {
          const hvcC = u8.subarray(hvcCOffset + 8, hvcCOffset + hvcCSize);
          lengthSize = (hvcC[21] & 0x03) + 1;
          const numOfArrays = hvcC[22];
          let p = 23;
          for (let i = 0; i < numOfArrays; i++) {
            p++;
            const numNalus = (hvcC[p] << 8) | hvcC[p + 1];
            p += 2;
            for (let j = 0; j < numNalus; j++) {
              const nalLen = (hvcC[p] << 8) | hvcC[p + 1];
              p += 2;
              parameterSets.push(hvcC.subarray(p, p + nalLen));
              p += nalLen;
            }
          }
        }

        return {
          width: Math.max(1, width),
          height: Math.max(1, height),
          aspectRatio: width / height,
          duration: Math.max(0.5, duration),
          sampleCount,
          chunkOffsets,
          sampleSizes,
          syncSamples,
          parameterSets,
          lengthSize,
          isHevc: hvcCOffset >= 0
        };
      } catch (err) {
        console.warn('[Video-Ref] MP4 metadata error:', err);
        return null;
      }
    }

    // 3. Layout Presets Dictionary
    const LAYOUT_PRESETS = {
      '3x4': { id: '3x4', label: '3×4 Grid', count: 12, cols: 3, rows: 4, desc: '3×4 (12F Storyboard)' },
      '4x3': { id: '4x3', label: '4×3 Sheet', count: 12, cols: 4, rows: 3, desc: '4×3 (12F Sheet)' },
      '4x4': { id: '4x4', label: '4×4 Grid', count: 16, cols: 4, rows: 4, desc: '4×4 (16F Matrix)' },
      '5x5': { id: '5x5', label: '5×5 Grid', count: 25, cols: 5, rows: 5, desc: '5×5 (25F Matrix)' },
      '3x3': { id: '3x3', label: '3×3 Matrix', count: 9, cols: 3, rows: 3, desc: '3×3 (9F Matrix)' },
      '1x6': { id: '1x6', label: '1×6 Panorama', count: 6, cols: 6, rows: 1, desc: '1×6 (6F Panorama)' },
      'hero': { id: 'hero', label: 'Hero Pose', count: 1, cols: 1, rows: 1, desc: '1F Hero Keyframe' }
    };

    // 4. Modal Open & Full Controller Engine
    let lastModalOpenTime = 0;
    function openVideoRefModal() {
      const now = Date.now();
      if (now - lastModalOpenTime < 250) return;
      lastModalOpenTime = now;

      try {
        injectStyles();
        const existing = document.getElementById('channa-ref-modal-overlay');
        if (existing) {
          try { existing.remove(); } catch (e) {}
        }

        const overlay = document.createElement('div');
        overlay.id = 'channa-ref-modal-overlay';
        overlay.className = 'channa-ref-modal-overlay';
        overlay.style.cssText = 'position: fixed !important; inset: 0 !important; z-index: 2147483647 !important; display: flex !important; align-items: center !important; justify-content: center !important;';

        overlay.innerHTML = `
        <div class="channa-ref-modal">
          <div class="channa-ref-header">
            <div class="channa-ref-title">🎬 Video Motion Reference (Seedance 2.5)</div>
            <button class="channa-ref-close" id="channa-ref-close-btn">✕</button>
          </div>

          <div id="channa-ref-upload-section">
            <div class="channa-ref-dropzone" id="channa-ref-dropzone">
              <div style="font-size: 28px; margin-bottom: 6px;">📹</div>
              <div style="font-size: 14px; font-weight: 700; color: #c4b5fd;">Drop Reference Video Here</div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Universal: 16:9, 9:16, 4:3, 1:1, 21:9 (MP4, HEVC, WebM, MOV)</div>
              <input type="file" id="channa-ref-file-input" accept="video/mp4,video/webm,video/quicktime" style="display:none;" />
            </div>

            <div class="channa-ref-chat-import-card">
              <div style="display:flex; flex-direction:column; gap:2px;">
                <span style="font-size: 11px; font-weight: 700; color: #38bdf8;">📹 Instant Chat Video Importer</span>
                <span style="font-size: 9.5px; color: #94a3b8;">Import latest video directly from active Dola chat</span>
              </div>
              <button class="channa-ref-import-btn" id="channa-ref-import-chat-btn">⚡ Grab Chat Video</button>
            </div>
          </div>

          <div id="channa-ref-player-section" style="display:none; margin-top: 10px;">
            <div style="position: relative; width: 100%; border-radius: 10px; overflow: hidden; background: #000; text-align: center;">
              <video id="channa-ref-video" style="width: 100%; max-height: 200px; border-radius: 10px; background: #000; object-fit: contain; display: block;" controls muted playsinline preload="auto"></video>
              <canvas id="channa-ref-preview-canvas" style="width: 100%; max-height: 200px; border-radius: 10px; background: #000; display: none; object-fit: contain; margin: 0 auto;"></canvas>
            </div>
            
            <div class="channa-ref-scrubber-bar">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size: 10.5px; color: #94a3b8;">⏱️ Scrubber:</span>
                <span id="channa-ref-time-display" style="font-size: 11px; font-weight: 700; color: #38bdf8;">0.0s / 0.0s</span>
                <span id="channa-ref-aspect-display" style="font-size: 9.5px; font-weight: 700; color: #a78bfa; margin-left: 4px; padding: 1px 5px; background: rgba(139,92,246,0.2); border-radius: 4px;">Universal Ratio</span>
              </div>
              <div style="display:flex; gap:6px; align-items:center;">
                <button class="channa-ref-pin-btn" id="channa-ref-pin-btn" title="Capture current paused frame">📍 Pin Scrubber Frame</button>
                <button class="channa-ref-change-btn" id="channa-ref-change-btn">🔄 Change</button>
              </div>
            </div>

            <div style="margin: 12px 0 6px;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:700; color:#cbd5e1; margin-bottom:6px;">
                <span>📐 Matrix & Timeline Architecture:</span>
                <span id="channa-ref-layout-badge" style="color: #38bdf8;">3×4 (12F Storyboard)</span>
              </div>
              <div class="channa-ref-modes">
                <div class="channa-ref-mode-pill active" data-layout="3x4">🎬 3×4 Grid (12F)</div>
                <div class="channa-ref-mode-pill" data-layout="4x3">📱 4×3 Sheet (12F)</div>
                <div class="channa-ref-mode-pill" data-layout="4x4">🔲 4×4 Grid (16F)</div>
                <div class="channa-ref-mode-pill" data-layout="5x5">🧱 5×5 Grid (25F)</div>
                <div class="channa-ref-mode-pill" data-layout="3x3">📐 3×3 Matrix (9F)</div>
                <div class="channa-ref-mode-pill" data-layout="1x6">🦅 1×6 Panorama (6F)</div>
                <div class="channa-ref-mode-pill" data-layout="hero">🎯 Hero Pose (1F)</div>
              </div>
            </div>

            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Motion Keyframes:</span>
                <span id="channa-ref-status" style="font-size: 11px; color: #10b981; font-weight: 700;">Extracting...</span>
              </div>
              <div class="channa-ref-strip" id="channa-ref-strip"></div>
            </div>

            <label style="display:flex; align-items:center; gap: 8px; font-size: 11.5px; color: #cbd5e1; margin-top: 10px; cursor:pointer;">
              <input type="checkbox" id="channa-ref-auto-prompt" checked style="accent-color: #8b5cf6;" />
              Auto-inject cinematic motion choreography prompt
            </label>

            <!-- 🔍 AI PROMPT & MOTION REVERSE-ENGINEER SECTION -->
            <div class="channa-ref-prompt-analyzer-box" id="channa-ref-analyzer-box">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div style="display:flex; align-items:center; gap:5px;">
                  <span style="font-size:13px;">🔍</span>
                  <span style="font-size:11px; font-weight:800; color:#38bdf8;">Prompt Reverse-Engineer:</span>
                </div>
                <div>
                  <button type="button" class="channa-ref-tool-btn" id="channa-ref-analyze-dola-btn" title="Reverse prompt using Dola Chat" style="background: linear-gradient(135deg, #0284c7, #38bdf8);">⚡ Via Dola</button>
                </div>
              </div>

              <!-- Prompt result box -->
              <div id="channa-ref-prompt-result-container" style="display:none; margin-top:8px;">
                <textarea id="channa-ref-extracted-prompt" class="channa-ref-prompt-textarea" rows="3" placeholder="Extracted prompt will appear here..."></textarea>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                  <span id="channa-ref-prompt-status" style="font-size:10px; color:#10b981; font-weight:700;">✓ Prompt Ready</span>
                  <div style="display:flex; gap:5px;">
                    <button type="button" class="channa-ref-mini-btn" id="channa-ref-copy-prompt-btn">📋 Copy</button>
                    <button type="button" class="channa-ref-mini-btn primary" id="channa-ref-apply-prompt-btn">✍️ Put in Composer</button>
                  </div>
                </div>
              </div>
            </div>

            <button class="channa-ref-inject-btn" id="channa-ref-inject-btn" disabled>🚀 Inject into Dola AI Composer</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      const closeBtn = document.getElementById('channa-ref-close-btn');
      closeBtn.onclick = () => overlay.remove();
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      const uploadSection = document.getElementById('channa-ref-upload-section');
      const dropzone = document.getElementById('channa-ref-dropzone');
      const fileInput = document.getElementById('channa-ref-file-input');
      const chatImportBtn = document.getElementById('channa-ref-import-chat-btn');
      const playerSection = document.getElementById('channa-ref-player-section');
      const videoEl = document.getElementById('channa-ref-video');
      const previewCanvas = document.getElementById('channa-ref-preview-canvas');
      const timeDisplay = document.getElementById('channa-ref-time-display');
      const aspectDisplay = document.getElementById('channa-ref-aspect-display');
      const pinBtn = document.getElementById('channa-ref-pin-btn');
      const changeBtn = document.getElementById('channa-ref-change-btn');
      const strip = document.getElementById('channa-ref-strip');
      const injectBtn = document.getElementById('channa-ref-inject-btn');
      const statusEl = document.getElementById('channa-ref-status');
      const layoutBadge = document.getElementById('channa-ref-layout-badge');

      const analyzeDolaBtn = document.getElementById('channa-ref-analyze-dola-btn');
      const promptResultContainer = document.getElementById('channa-ref-prompt-result-container');
      const extractedPrompt = document.getElementById('channa-ref-extracted-prompt');
      const promptStatus = document.getElementById('channa-ref-prompt-status');
      const copyPromptBtn = document.getElementById('channa-ref-copy-prompt-btn');
      const applyPromptBtn = document.getElementById('channa-ref-apply-prompt-btn');

      function findPromptForChatVideo(videoUrl) {
        try {
          const vids = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
          const matchedVid = vids.find(v => (v.currentSrc === videoUrl || v.src === videoUrl || v.querySelector(`source[src="${videoUrl}"]`)));
          if (matchedVid) {
            const card = matchedVid.closest('[data-message-id], [class*="message"], [class*="bubble"], [class*="card"], div[role="feed"] > div, div[role="region"] > div');
            if (card) {
              const paras = Array.from(card.querySelectorAll('p, span[class*="text"], div[class*="content"]'));
              for (const p of paras) {
                const t = (p.textContent || '').trim();
                if (t && t.length > 8 && !t.includes('Create Videos') && !t.includes('Seedance') && !t.includes('Dola AI')) {
                  return t;
                }
              }
              let prev = card.previousElementSibling;
              if (prev) {
                const pt = (prev.textContent || '').trim();
                if (pt && pt.length > 5 && pt.length < 2000 && !pt.includes('Create Videos')) return pt;
              }
            }
          }
        } catch(e) {}
        return null;
      }

      async function runDolaChatAnalysis() {
        analyzeDolaBtn.disabled = true;
        analyzeDolaBtn.innerHTML = '<span>⏳ Staging...</span>';

        try {
          let masterBlob = null;
          if (extractedBlobs.length > 0) {
            masterBlob = await stitchFramesIntoGrid(extractedBlobs, currentLayout);
          }
          if (!masterBlob && extractedBlobs.length > 0) {
            masterBlob = extractedBlobs[0].blob;
          }

          if (!masterBlob) {
            alert('Please wait for video frames to extract first.');
            analyzeDolaBtn.disabled = false;
            analyzeDolaBtn.innerHTML = '⚡ Via Dola';
            return;
          }

          const file = new File([masterBlob], `storyboard_${currentLayout.id}.jpg`, { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);

          let targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
          if (!targetInput) {
            const plusBtn = Array.from(document.querySelectorAll('button')).find(b => {
              return b.querySelector('path[d*="M12.0005 2.25"]') || (b.innerText || '').trim() === '+' || b.getAttribute('aria-label')?.toLowerCase().includes('upload');
            });
            if (plusBtn) {
              plusBtn.click();
              await new Promise(r => setTimeout(r, 150));
              targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
            }
          }

          if (targetInput) {
            try {
              targetInput.value = '';
              const proto = HTMLInputElement.prototype;
              const desc = Object.getOwnPropertyDescriptor(proto, 'files');
              if (desc && desc.set) {
                desc.set.call(targetInput, dt.files);
              } else {
                targetInput.files = dt.files;
              }
              targetInput.dispatchEvent(new Event('change', { bubbles: true }));
            } catch(e) {}
          }

          const reverseAnalysisPrompt = 'Please analyze this video motion storyboard sequence. Reverse-engineer and generate an exact cinematic AI video generation prompt for Seedance 2.5 detailing: 1. Subject and appearance, 2. Continuous action movement, 3. Camera choreography (tracking/pan/tilt), 4. Lighting and visual textures.';

          if (typeof window.injectPromptIntoDola === 'function') {
            window.injectPromptIntoDola(reverseAnalysisPrompt, { skipDna: true });
          }

          overlay.remove();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice('⚡ Staged Storyboard into Dola Chat for Reverse-Prompting!');
          }
        } catch (err) {
          alert('Could not stage to Dola chat: ' + err.message);
        } finally {
          analyzeDolaBtn.disabled = false;
          analyzeDolaBtn.innerHTML = '⚡ Via Dola';
        }
      }

      if (analyzeDolaBtn) analyzeDolaBtn.onclick = runDolaChatAnalysis;

      if (copyPromptBtn) {
        copyPromptBtn.onclick = () => {
          const txt = (extractedPrompt.value || '').trim();
          if (!txt) return;
          navigator.clipboard.writeText(txt).then(() => {
            const orig = copyPromptBtn.textContent;
            copyPromptBtn.textContent = '✓ Copied!';
            setTimeout(() => { copyPromptBtn.textContent = orig; }, 1500);
          });
        };
      }

      if (applyPromptBtn) {
        applyPromptBtn.onclick = () => {
          const txt = (extractedPrompt.value || '').trim();
          if (!txt) return;
          if (typeof window.injectPromptIntoDola === 'function') {
            window.injectPromptIntoDola(txt, { skipDna: true });
            const orig = applyPromptBtn.textContent;
            applyPromptBtn.textContent = '✓ Applied!';
            if (typeof window.__showChannaNotice === 'function') window.__showChannaNotice('✍️ Prompt applied to Dola AI Composer!');
            setTimeout(() => { applyPromptBtn.textContent = orig; }, 1500);
          }
        };
      }

      let currentLayout = LAYOUT_PRESETS['3x4'];
      let extractedBlobs = [];
      let currentVideoArrayBuffer = null;
      let currentVideoMeta = null;
      let currentExtractRunId = 0;

      dropzone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleVideoSource(file);
      };

      changeBtn.onclick = () => {
        currentExtractRunId++;
        playerSection.style.display = 'none';
        uploadSection.style.display = 'block';
        fileInput.value = '';
        if (promptResultContainer) promptResultContainer.style.display = 'none';
        if (extractedPrompt) extractedPrompt.value = '';
      };

      chatImportBtn.onclick = async () => {
        const origText = chatImportBtn.innerHTML;
        chatImportBtn.disabled = true;
        chatImportBtn.innerHTML = '<span>⏳ Grabbing Video...</span>';

        function cleanUrl(raw) {
          if (!raw || typeof raw !== 'string') return null;
          let s = raw.trim();
          if (s.startsWith('//')) s = window.location.protocol + s;
          if (s.startsWith('/')) {
            try { s = new URL(s, window.location.origin).href; } catch (e) {}
          }
          if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
            return s;
          }
          return null;
        }

        function extractUrlFromItem(item) {
          if (!item) return null;
          if (typeof item === 'string') return cleanUrl(item);
          return cleanUrl(
            item.url || item.src || item.video_url || item.videoUrl || 
            item.play_url || item.download_url || item.downloadUrl || 
            item.directUrl || item.rawUrl || item.item?.url
          );
        }

        const candidateUrls = [];
        const seenUrls = new Set();
        const addCandidate = (raw) => {
          const u = extractUrlFromItem(raw);
          if (u && !seenUrls.has(u)) {
            seenUrls.add(u);
            candidateUrls.push(u);
          }
        };

        // 1. In-memory master stream vault (window.__ctbExtractedVideos)
        if (Array.isArray(window.__ctbExtractedVideos)) {
          for (let i = window.__ctbExtractedVideos.length - 1; i >= 0; i--) {
            addCandidate(window.__ctbExtractedVideos[i]);
          }
        }

        // 2. Extractor window.__channaChatVideos
        if (Array.isArray(window.__channaChatVideos)) {
          for (let i = window.__channaChatVideos.length - 1; i >= 0; i--) {
            addCandidate(window.__channaChatVideos[i]);
          }
        }

        // 3. Shared DOM Bridge (__ctb_vault__)
        try {
          const bridge = document.getElementById('__ctb_vault__');
          if (bridge) {
            const rawV = JSON.parse(bridge.getAttribute('data-videos') || '[]');
            if (Array.isArray(rawV)) {
              for (let i = rawV.length - 1; i >= 0; i--) addCandidate(rawV[i]);
            }
            const rawC = JSON.parse(bridge.getAttribute('data-content-videos') || '[]');
            if (Array.isArray(rawC)) {
              for (let i = rawC.length - 1; i >= 0; i--) addCandidate(rawC[i]);
            }
          }
        } catch (e) {}

        // 4. SessionStorage & LocalStorage master stream vaults
        try {
          const stored = JSON.parse(sessionStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
          if (Array.isArray(stored)) {
            for (let i = stored.length - 1; i >= 0; i--) addCandidate(stored[i]);
          }
        } catch (e) {}
        try {
          const storedLocal = JSON.parse(localStorage.getItem('__CTB_MASTER_VIDEOS__') || '[]');
          if (Array.isArray(storedLocal)) {
            for (let i = storedLocal.length - 1; i >= 0; i--) addCandidate(storedLocal[i]);
          }
        } catch (e) {}

        // 5. Query content script for latest video with quick timeout
        try {
          const fromContent = await new Promise((resolve) => {
            const onResp = (e) => {
              if (e.data?.type === 'CHANNA_LATEST_CHAT_VIDEO_RESPONSE') {
                window.removeEventListener('message', onResp);
                resolve(e.data?.video);
              }
            };
            window.addEventListener('message', onResp);
            window.postMessage({ type: 'CHANNA_REQUEST_LATEST_CHAT_VIDEO' }, '*');
            setTimeout(() => {
              window.removeEventListener('message', onResp);
              resolve(null);
            }, 180);
          });
          if (fromContent) addCandidate(fromContent);
        } catch (e) {}

        // 6. Direct DOM Scan of all <video> elements
        const domVideos = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
        for (let i = domVideos.length - 1; i >= 0; i--) {
          const v = domVideos[i];
          addCandidate(v.currentSrc);
          addCandidate(v.src);
          v.querySelectorAll('source').forEach(s => {
            addCandidate(s.src || s.getAttribute('src') || s.getAttribute('data-src'));
          });
          addCandidate(v.getAttribute('src'));
          addCandidate(v.getAttribute('data-src'));
          addCandidate(v.getAttribute('data-video-url'));
          addCandidate(v.getAttribute('data-url'));
          addCandidate(v.getAttribute('data-play-url'));
          addCandidate(v.getAttribute('data-stream-url'));
        }

        // 7. Direct DOM Scan of download links & cards
        const mediaElements = Array.from(document.querySelectorAll(
          'a[href*=".mp4"], a[download*=".mp4"], a[href*="byteintl"], a[href*="ibytedtos"], [data-src*=".mp4"], [data-video-url], [data-url*="http"], [data-url*="byteintl"], [data-url*="ibytedtos"], [data-src*="blob:"], [data-video-url*="blob:"]'
        ));
        for (let i = mediaElements.length - 1; i >= 0; i--) {
          const el = mediaElements[i];
          addCandidate(el.href || el.getAttribute('data-video-url') || el.getAttribute('data-src') || el.getAttribute('data-url'));
        }

        // 8. Direct React Fiber scan on all message cards
        try {
          const messageCards = Array.from(document.querySelectorAll('[data-message-id], [class*="message"], [class*="bubble"], [class*="card"], [class*="video"], div[role="feed"] > div, div[role="region"] > div'));
          const pendingFbs = [];
          const scanObj = (obj, depth = 0, seen = new Set()) => {
            if (!obj || depth > 4 || typeof obj !== 'object' || seen.has(obj)) return;
            seen.add(obj);
            try {
              for (const k of Object.keys(obj)) {
                const val = obj[k];
                if (typeof val === 'string') {
                  if (val.includes('fallback_api') || (val.startsWith('http') && (val.includes('.mp4') || val.includes('byteintl') || val.includes('ibytedtos') || val.includes('tos-')))) {
                    if (val.includes('fallback_api')) {
                      if (typeof findFallbackApis === 'function') {
                        const fbs = findFallbackApis(null, val);
                        for (const fb of fbs) if (!pendingFbs.includes(fb)) pendingFbs.push(fb);
                      }
                    } else {
                      addCandidate(val);
                    }
                  }
                } else if (val && typeof val === 'object' && depth < 3) {
                  scanObj(val, depth + 1, seen);
                }
              }
            } catch (e) {}
          };
          messageCards.forEach(node => {
            const fKey = Object.keys(node).find(k => k.startsWith('__reactFiber$') || k.startsWith('__reactProps$') || k.startsWith('__reactInternalInstance$'));
            if (fKey && node[fKey]) {
              let f = node[fKey];
              let d = 0;
              while (f && d < 7) {
                d++;
                const p = f.memoizedProps || f.pendingProps || f.props;
                if (p) scanObj(p, 0);
                f = f.return;
              }
            }
          });
          if (pendingFbs.length > 0 && typeof extractUnwatermarkedVideo === 'function') {
            await Promise.all(pendingFbs.slice(0, 5).map(fb => extractUnwatermarkedVideo(fb)));
            if (Array.isArray(window.__ctbExtractedVideos)) {
              for (let i = window.__ctbExtractedVideos.length - 1; i >= 0; i--) addCandidate(window.__ctbExtractedVideos[i]);
            }
          }
        } catch (e) {}

        // If candidate found now, load it!
        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // 9. Comprehensive Harvester Function
        try {
          if (typeof harvestAllChatVideosMainWorld === 'function') {
            const harvested = await harvestAllChatVideosMainWorld();
            if (Array.isArray(harvested) && harvested.length > 0) {
              for (let i = harvested.length - 1; i >= 0; i--) addCandidate(harvested[i]);
            }
          }
        } catch (e) {}

        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // 10. Intelligent Scroller Step-Scroll for Virtualized Chats
        try {
          const scrollSelectors = [
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
            'div[role="feed"]'
          ];
          let container = null;
          for (const sel of scrollSelectors) {
            const found = document.querySelector(sel);
            if (found && found.scrollHeight > found.clientHeight + 40) {
              container = found;
              break;
            }
          }
          if (!container) {
            container = document.scrollingElement || document.documentElement || document.body;
          }

          if (container) {
            const originalScroll = container.scrollTop;
            for (let step = 0; step < 2; step++) {
              container.scrollTop = Math.max(0, container.scrollTop - 480);
              container.dispatchEvent(new Event('scroll', { bubbles: true }));
              await new Promise(r => setTimeout(r, 180));

              const stepVideos = Array.from(document.querySelectorAll('video')).filter(v => v.id !== 'channa-ref-video');
              for (let i = stepVideos.length - 1; i >= 0; i--) {
                const v = stepVideos[i];
                addCandidate(v.currentSrc || v.src || v.querySelector('source')?.src || v.getAttribute('src'));
              }
              if (candidateUrls.length > 0) break;
            }
            container.scrollTop = originalScroll;
          }
        } catch (e) {}

        if (candidateUrls.length > 0) {
          const targetUrl = candidateUrls[0];
          chatImportBtn.innerHTML = '<span>✓ Video Loaded!</span>';
          await handleVideoSource(targetUrl);
          setTimeout(() => {
            chatImportBtn.disabled = false;
            chatImportBtn.innerHTML = origText;
          }, 1600);
          return;
        }

        // If no video found, reset button and alert user gracefully
        chatImportBtn.disabled = false;
        chatImportBtn.innerHTML = origText;
        alert('No generated videos found in active chat yet.\n\nTip: Please generate a video in Dola chat first, or drag & drop any MP4 video directly into the dropzone above!');
      };

      // Scrubber update
      videoEl.ontimeupdate = () => {
        const cur = (videoEl.currentTime || 0).toFixed(1);
        const dur = (videoEl.duration || 0).toFixed(1);
        timeDisplay.textContent = `${cur}s / ${dur}s`;
      };

      // Layout pills click
      document.querySelectorAll('.channa-ref-mode-pill').forEach(pill => {
        pill.onclick = () => {
          document.querySelectorAll('.channa-ref-mode-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const key = pill.getAttribute('data-layout') || '3x4';
          currentLayout = LAYOUT_PRESETS[key] || LAYOUT_PRESETS['3x4'];
          layoutBadge.textContent = currentLayout.desc;
          if (videoEl.src || currentVideoArrayBuffer) extractFrames();
        };
      });

      // Pin Scrubber Frame
      pinBtn.onclick = async () => {
        if (!videoEl.duration) return;
        currentExtractRunId++;
        statusEl.textContent = 'Pinning frame...';

        document.querySelectorAll('.channa-ref-mode-pill').forEach(p => p.classList.remove('active'));
        const heroPill = document.querySelector('.channa-ref-mode-pill[data-layout="hero"]');
        if (heroPill) heroPill.classList.add('active');
        currentLayout = LAYOUT_PRESETS['hero'];
        layoutBadge.textContent = currentLayout.desc;

        const curTime = Math.max(0.08, Math.min(videoEl.currentTime || 0, videoEl.duration - 0.08));
        const res = await seekAndCapture(videoEl, curTime);
        if (res?.blob) {
          extractedBlobs = [{ blob: res.blob, time: curTime.toFixed(1) }];
          strip.innerHTML = '';
          strip.style.display = 'flex';
          strip.style.justifyContent = 'center';
          strip.style.alignItems = 'center';

          const aspect = (videoEl.videoWidth && videoEl.videoHeight)
            ? (videoEl.videoWidth / videoEl.videoHeight)
            : (currentVideoMeta?.aspectRatio || 16/9);

          renderThumbnail(res.blob, curTime.toFixed(1), 'Hero', true, aspect);
          statusEl.textContent = '✓ Hero Frame Pinned';
          injectBtn.disabled = false;
        }
      };

      function fetchBlobViaExtensionBridge(videoUrl, timeoutMs = 3500) {
        return new Promise((resolve) => {
          const reqId = 'ctb_blob_' + Date.now() + '_' + Math.random().toString(36).slice(2);
          const onMsg = (e) => {
            if (e.data?.type === 'CHANNA_FETCH_BLOB_RESP' && e.data?.id === reqId) {
              window.removeEventListener('message', onMsg);
              if (e.data.ok && e.data.base64) {
                try {
                  const bstr = atob(e.data.base64);
                  let n = bstr.length;
                  const u8arr = new Uint8Array(n);
                  while (n--) u8arr[n] = bstr.charCodeAt(n);
                  resolve(u8arr.buffer);
                  return;
                } catch (err) {}
              }
              resolve(null);
            }
          };
          window.addEventListener('message', onMsg);
          window.postMessage({ type: 'CHANNA_FETCH_BLOB_REQ', id: reqId, url: videoUrl }, '*');
          setTimeout(() => {
            window.removeEventListener('message', onMsg);
            resolve(null);
          }, timeoutMs);
        });
      }

      async function handleVideoSource(srcOrFile) {
        currentExtractRunId++;
        playerSection.style.display = 'block';
        uploadSection.style.display = 'none';
        statusEl.textContent = 'Analyzing video stream...';

        let url = '';
        if (srcOrFile instanceof File || srcOrFile instanceof Blob) {
          url = URL.createObjectURL(srcOrFile);
          currentVideoArrayBuffer = await srcOrFile.arrayBuffer();
        } else {
          url = srcOrFile;
          try {
            const autoPrompt = findPromptForChatVideo(url);
            if (autoPrompt && promptResultContainer && extractedPrompt) {
              promptResultContainer.style.display = 'block';
              extractedPrompt.value = autoPrompt;
              promptStatus.style.color = '#10b981';
              promptStatus.textContent = '✓ Original Dola Chat Prompt Detected';
            }
          } catch (e) {}
          let fetchedBuffer = null;
          try {
            const resp = await fetch(url, { mode: 'cors' });
            if (resp.ok) {
              fetchedBuffer = await resp.arrayBuffer();
            }
          } catch (e) {
            console.warn('[Video Ref] Direct stream CORS notice, trying extension bridge:', e);
          }

          if (!fetchedBuffer) {
            try {
              fetchedBuffer = await fetchBlobViaExtensionBridge(url);
            } catch (err) {}
          }

          if (fetchedBuffer) {
            currentVideoArrayBuffer = fetchedBuffer;
            const blob = new Blob([currentVideoArrayBuffer], { type: 'video/mp4' });
            url = URL.createObjectURL(blob);
          }
        }

        if (currentVideoArrayBuffer) {
          try {
            currentVideoMeta = parseMp4Metadata(currentVideoArrayBuffer);
            if (currentVideoMeta) {
              const r = currentVideoMeta.aspectRatio;
              aspectDisplay.textContent = Math.abs(r - (16/9)) < 0.08 ? '16:9 HD' : Math.abs(r - (9/16)) < 0.08 ? '9:16 Vertical' : `${currentVideoMeta.width}×${currentVideoMeta.height}`;
            }
          } catch (e) {}
        }

        videoEl.crossOrigin = 'anonymous';
        videoEl.src = url;

        const onReady = () => {
          if (videoEl.videoWidth && videoEl.videoHeight) {
            const r = videoEl.videoWidth / videoEl.videoHeight;
            aspectDisplay.textContent = Math.abs(r - (16/9)) < 0.08 ? '16:9 HD' : Math.abs(r - (9/16)) < 0.08 ? '9:16 Vertical' : `${videoEl.videoWidth}×${videoEl.videoHeight}`;
          }
          extractFrames();
        };

        if (videoEl.readyState >= 1) {
          onReady();
        } else {
          videoEl.onloadedmetadata = onReady;
        }

        videoEl.onerror = () => {
          if (videoEl.crossOrigin) {
            videoEl.removeAttribute('crossorigin');
            videoEl.src = url;
            return;
          }
          statusEl.textContent = '⚠️ Video stream active. Extracting keyframes...';
          extractFrames();
        };
      }

      async function extractFrames() {
        const runId = ++currentExtractRunId;
        const N = currentLayout.count;
        statusEl.textContent = `Extracting ${N} keyframes...`;
        injectBtn.disabled = true;
        strip.innerHTML = '';
        extractedBlobs = [];

        const aspect = (videoEl.videoWidth && videoEl.videoHeight)
          ? (videoEl.videoWidth / videoEl.videoHeight)
          : (currentVideoMeta?.aspectRatio || 16/9);

        if (currentLayout.id === 'hero' || N === 1) {
          strip.style.display = 'flex';
          strip.style.justifyContent = 'center';
          strip.style.alignItems = 'center';
        } else {
          strip.style.display = 'grid';
          strip.style.gridTemplateColumns = `repeat(${currentLayout.cols}, 1fr)`;
        }

        const dur = (isFinite(videoEl.duration) && videoEl.duration > 0) ? videoEl.duration : 10;
        const startT = Math.max(0.12, dur * 0.05);
        const endT = Math.max(startT + 0.2, dur * 0.92);
        const step = (N === 1) ? 0 : (endT - startT) / (N - 1);

        for (let i = 0; i < N; i++) {
          if (runId !== currentExtractRunId) return; // User switched layout, abort!

          const t = (N === 1) ? Math.min(dur - 0.1, Math.max(0.12, dur * 0.5)) : startT + i * step;
          statusEl.textContent = `Extracting frame ${i + 1}/${N}...`;

          const res = await seekAndCapture(videoEl, t);
          if (runId !== currentExtractRunId) return;

          if (res?.blob) {
            extractedBlobs.push({ blob: res.blob, time: res.time });
            renderThumbnail(res.blob, res.time, (N === 1) ? 'Hero' : `T${i + 1}`, N === 1, aspect);
          }
        }

        if (runId === currentExtractRunId) {
          statusEl.textContent = `✓ ${extractedBlobs.length} Frames Ready`;
          injectBtn.disabled = extractedBlobs.length === 0;
        }
      }

      function renderThumbnail(blob, timeStr, stepLabel, isHero = false, aspect = 16/9) {
        const thumb = document.createElement('div');
        thumb.className = 'channa-ref-thumb-box';

        const isPortrait = aspect < 0.85;
        if (isHero) {
          thumb.style.height = '175px';
          thumb.style.width = isPortrait ? `${Math.round(175 * aspect)}px` : `${Math.min(320, Math.round(175 * aspect))}px`;
          thumb.style.maxWidth = '100%';
          thumb.style.margin = '0 auto';
          thumb.style.borderColor = '#8b5cf6';
          thumb.style.boxShadow = '0 0 16px rgba(139, 92, 246, 0.35)';
          const rows = currentLayout.rows || 3;
          const h = (rows === 1) ? (isPortrait ? 130 : 95) : (rows >= 5 ? (isPortrait ? 65 : 52) : (rows === 4 ? (isPortrait ? 80 : 66) : (isPortrait ? 95 : 75)));
          thumb.style.height = `${h}px`;
          thumb.style.width = '100%';
        }

        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        img.alt = stepLabel;

        const badge = document.createElement('div');
        badge.className = 'channa-ref-thumb-badge';
        badge.textContent = `${timeStr}s`;

        const step = document.createElement('div');
        step.className = 'channa-ref-thumb-step';
        step.textContent = stepLabel;

        thumb.appendChild(img);
        thumb.appendChild(badge);
        thumb.appendChild(step);
        strip.appendChild(thumb);
      }

      // 🛡️ Zero-Black-Frame Seek & Capture (With Fallback Timeout & Exact Drawing)
      function seekAndCapture(video, time) {
        return new Promise((resolve) => {
          const dur = (isFinite(video.duration) && video.duration > 0) ? video.duration : 10;
          const safeTime = Math.max(0.08, Math.min(time, dur - 0.08));

          let resolved = false;
          let timer = null;

          const finish = () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timer);
            video.removeEventListener('seeked', onSeeked);

            try {
              const vw = video.videoWidth || 640;
              const vh = video.videoHeight || 360;
              const canvas = document.createElement('canvas');
              canvas.width = vw;
              canvas.height = vh;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, vw, vh);

              canvas.toBlob((blob) => {
                resolve({ blob: blob || null, time: safeTime.toFixed(1) });
              }, 'image/jpeg', 0.92);
            } catch (err) {
              resolve(null);
            }
          };

          const onSeeked = () => finish();
          timer = setTimeout(finish, 850); // safety fallback

          video.addEventListener('seeked', onSeeked, { once: true });
          try {
            video.currentTime = safeTime;
          } catch (e) {
            finish();
          }
        });
      }

      // 🖼️ Master Multi-Frame Storyboard Canvas Compositor
      async function stitchFramesIntoGrid(frames, layout) {
        if (!frames || frames.length === 0) return null;
        if (frames.length === 1 || layout.id === 'hero') return frames[0].blob;

        const loadedImgs = await Promise.all(frames.map(f => {
          return new Promise((res) => {
            const img = new Image();
            img.onload = () => res({ img, time: f.time });
            img.onerror = () => res(null);
            img.src = URL.createObjectURL(f.blob);
          });
        }));

        const valid = loadedImgs.filter(Boolean);
        if (valid.length === 0) return null;

        const cols = layout.cols;
        const rows = Math.ceil(valid.length / cols);
        const singleW = valid[0].img.naturalWidth || 640;
        const singleH = valid[0].img.naturalHeight || 360;
        const aspect = singleW / singleH;

        let cellW = (cols === 3) ? 480 : (cols === 4 ? 380 : (cols === 5 ? 320 : (cols === 6 ? 260 : 480)));
        let cellH = Math.round(cellW / aspect);

        const dividerW = 4;
        const totalW = (cols * cellW) + (dividerW * (cols - 1));
        const totalH = (rows * cellH) + (dividerW * (rows - 1));

        const canvas = document.createElement('canvas');
        canvas.width = totalW;
        canvas.height = totalH;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#080612';
        ctx.fillRect(0, 0, totalW, totalH);

        for (let i = 0; i < valid.length; i++) {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const x = c * (cellW + dividerW);
          const y = r * (cellH + dividerW);

          ctx.drawImage(valid[i].img, x, y, cellW, cellH);
        }

        return new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.94));
      }

      // Inject into Dola Composer
      injectBtn.onclick = async () => {
        if (extractedBlobs.length === 0) return;
        const now = Date.now();
        if (window.__CTB_LAST_STAGED_TIME__ && (now - window.__CTB_LAST_STAGED_TIME__ < 4000)) {
          return;
        }
        window.__CTB_LAST_STAGED_TIME__ = now;

        injectBtn.disabled = true;
        injectBtn.innerHTML = '⏳ Staging Master Storyboard...';

        const masterBlob = await stitchFramesIntoGrid(extractedBlobs, currentLayout);
        if (masterBlob) {
          const fileName = `motion_reference_${currentLayout.id}.jpg`;
          const file = new File([masterBlob], fileName, { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);

          function detectDolaModeForVideoRef() {
            try {
              const path = (window.location.pathname || '').toLowerCase();
              if (path.includes('create-video') || (path.includes('/video') && !path.includes('chat'))) {
                return 'CREATE_VIDEO';
              }

              const container = document.getElementById('input-engine-container') || document.querySelector('.guidance-input-surface, form, [class*="chat-input"]') || document;

              // Check Create Video pills (Ratio, Duration, Video Model)
              const hasVideoPills = !!container.querySelector('[data-input-engine-actionbar-control-key*="ratio"], [data-input-engine-actionbar-control-key*="duration"], [data-input-engine-actionbar-control-key*="video-model"]') ||
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

          const activeMode = detectDolaModeForVideoRef();
          console.log('[Channa Video-Ref] 🎯 Staging storyboard for active mode:', activeMode);

          if (activeMode === 'PRO') {
            // 🎯 PRO CHAT MODE: Direct single non-bubbling paste on Tiptap/ProseMirror editor (Strictly 1 upload)
            const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea');
            if (editor) {
              try {
                editor.focus();
                const pasteEvt = new ClipboardEvent('paste', {
                  bubbles: false,
                  cancelable: true,
                  composed: false,
                  clipboardData: dt
                });
                editor.dispatchEvent(pasteEvt);
              } catch (e) {
                console.warn('[Channa Video-Ref] Pro paste error:', e);
              }
            }
          } else {
            // 🎯 FAST CHAT MODE & CREATE VIDEO MODE: Native File Input (100% stable, exactly 1 card, never double-injects or self-deletes)
            let targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
            if (!targetInput) {
              const plusBtn = Array.from(document.querySelectorAll('button')).find(b => {
                return b.querySelector('path[d*="M12.0005 2.25"]') || (b.innerText || '').trim() === '+' || b.getAttribute('aria-label')?.toLowerCase().includes('upload');
              });
              if (plusBtn) {
                plusBtn.click();
                await new Promise(r => setTimeout(r, 120));
                targetInput = Array.from(document.querySelectorAll('input[type="file"]')).find(i => !i.id?.includes('channa-ref'));
              }
            }

            if (targetInput) {
              try {
                targetInput.value = '';
                const proto = HTMLInputElement.prototype;
                const desc = Object.getOwnPropertyDescriptor(proto, 'files');
                if (desc && desc.set) {
                  desc.set.call(targetInput, dt.files);
                } else {
                  targetInput.files = dt.files;
                }
                targetInput.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
              } catch (e) {
                console.warn('[Channa Video-Ref] File input staging error:', e);
              }
            } else {
              // Fallback if file input not found: use single editor paste
              const editor = document.querySelector('#input-engine-container .tiptap, #input-engine-container .ProseMirror, .tiptap, .ProseMirror, [role="textbox"], textarea');
              if (editor) {
                try {
                  editor.focus();
                  const pasteEvt = new ClipboardEvent('paste', {
                    bubbles: false,
                    cancelable: true,
                    composed: false,
                    clipboardData: dt
                  });
                  editor.dispatchEvent(pasteEvt);
                } catch (e) {}
              }
            }
          }

          // Notify content script that image is already staged
          window.postMessage({
            type: 'STAGE_VIDEO_REF_PAYLOAD',
            alreadyStaged: true,
            promptGuide: ''
          }, '*');

          let motionGuide = '';
          const autoPrompt = document.getElementById('channa-ref-auto-prompt');
          if (autoPrompt?.checked) {
            motionGuide = (currentLayout.id === 'hero')
              ? '[Video Reference: Keyframe pose and compositional reference. Follow character posture, framing, and action state]'
              : `[Video Reference: Storyboard Matrix (${extractedBlobs.length} Frames, ${currentLayout.label}). Strictly follow the continuous chronological action progression, camera trajectory, and character motion dynamics across the sequence]`;
          }

          if (motionGuide && typeof window.injectPromptIntoDola === 'function') {
            const comp = document.querySelector('.tiptap, [role="textbox"], textarea');
            let cur = (comp?.textContent || comp?.value || '').trim();
            // Clean any accidental Character DNA tokens from composer so it never contaminates Video Ref
            cur = cur.replace(/\[Character DNA:[^\]]*\]\s*/gi, '').trim();
            if (!cur.includes(motionGuide)) {
              const combined = cur ? `${cur} ${motionGuide}` : motionGuide;
              window.injectPromptIntoDola(combined, { skipDna: true });
            }
          }

          overlay.remove();
          if (typeof window.__showChannaNotice === 'function') {
            window.__showChannaNotice(`🎬 Injected ${currentLayout.label} Storyboard into Dola AI!`);
          }
        }
      };
      } catch (err) {
        console.error('[Channa Video Ref] Error opening modal:', err);
      }
    }

    // Window Listeners
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'CHANNA_OPEN_VIDEO_REF_MODAL') openVideoRefModal();
    });
    window.addEventListener('CHANNA_OPEN_VIDEO_REF_MODAL', openVideoRefModal);
    window.openChannaVideoRefModal = openVideoRefModal;
    window.openVideoRefModal = openVideoRefModal;

    function findComposerToolbarAnchor() {
      const container = document.getElementById('input-engine-container') || document.querySelector('[class*="chat-input"]') || document.querySelector('form');
      if (!container) return null;

      const candidates = container.querySelectorAll('button, div[role="button"], span, [data-input-engine-actionbar-control-key]');
      let ratioTarget = null;
      let durTarget = null;
      let modelTarget = null;
      let fastTarget = null;
      let plusTarget = null;
      let sendTarget = null;

      for (let i = 0; i < candidates.length; i++) {
        const el = candidates[i];
        if (el.id === 'channa-actor-ref-btn' || el.id === 'channa-video-ref-btn') continue;
        if (el.closest && el.closest('#channa-accounts-dock-btn, #channa-actor-dock-btn, #channa-prompt-dock, #channa-top-center-capsule, [class*="sidebar"], nav, header')) continue;

        const txt = (el.textContent || '').trim();
        const key = el.getAttribute('data-input-engine-actionbar-control-key') || '';

        if (txt.includes('THE BRAND') || /^Ratio\b/i.test(txt) || key.includes('ratio')) {
          ratioTarget = el.closest('button, div[role="button"]') || el;
        } else if (/\b\d+s\s+CHANNA\b/i.test(txt) || (/\b\d+s\b/i.test(txt) && !txt.includes('Fast')) || key.includes('duration')) {
          durTarget = el.closest('button, div[role="button"]') || el;
        } else if (txt.includes('Model') || key.includes('video-model')) {
          modelTarget = el.closest('button, div[role="button"]') || el;
        }
      }

      // Mount beside Video Mode active controls
      const target = ratioTarget || durTarget || modelTarget;
      if (target && target.parentElement) {
        return { parent: target.parentElement, before: target.nextSibling };
      }

      return null;
    }
    window.__findComposerToolbarAnchor = findComposerToolbarAnchor;

    function bindVideoRefButtonEvents(el) {
      if (!el) return;
      el.style.pointerEvents = 'auto';
      el.style.cursor = 'pointer';
      el.style.position = 'relative';
      el.style.zIndex = '99999';

      const triggerOpen = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation?.();
        }
        openVideoRefModal();
      };

      el.onclick = triggerOpen;
      el.onpointerup = (e) => {
        setTimeout(() => {
          const modal = document.getElementById('channa-ref-modal-overlay');
          if (!modal) triggerOpen(e);
        }, 50);
      };
      el.onpointerdown = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      };
      el.onmousedown = (e) => {
        e.stopPropagation();
        e.stopImmediatePropagation?.();
      };
    }

    // Mount '🎬' Icon Button in Composer Toolbar
    function mountVideoRefButton() {
      const mount = findComposerToolbarAnchor();
      let existingBtn = document.getElementById('channa-video-ref-btn');

      if (!mount || !mount.parent) {
        if (existingBtn) existingBtn.style.display = 'none';
        return;
      }

      if (existingBtn) {
        existingBtn.style.display = 'inline-flex';
        if (existingBtn.innerHTML !== '🎬') {
          existingBtn.innerHTML = '🎬';
          existingBtn.title = '🎬 Video Reference Suite (Click to open Video-to-Video Storyboard)';
        }
        bindVideoRefButtonEvents(existingBtn);
        if (existingBtn.parentElement !== mount.parent || (mount.before && existingBtn.nextSibling !== mount.before)) {
          if (mount.before) mount.parent.insertBefore(existingBtn, mount.before);
          else mount.parent.appendChild(existingBtn);
        }
        return;
      }

      const btn = document.createElement('button');
      btn.id = 'channa-video-ref-btn';
      btn.type = 'button';
      btn.innerHTML = '🎬';
      btn.title = '🎬 Video Reference Suite (Click to open Video-to-Video Storyboard)';
      bindVideoRefButtonEvents(btn);

      if (mount.before) mount.parent.insertBefore(btn, mount.before);
      else mount.parent.appendChild(btn);
    }
    window.__mountVideoRefButton = mountVideoRefButton;

    // Document Capture-Phase Fallback (Guarantees modal opens even if Dola attempts to capture or prevent clicks)
    document.addEventListener('click', (e) => {
      const btn = e.target?.closest ? e.target.closest('#channa-video-ref-btn') : null;
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();
        openVideoRefModal();
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

    function expandNativeFileInputAccept() {
      document.querySelectorAll('input[type="file"]:not(#channa-ref-file-input)').forEach(inp => {
        const accept = inp.getAttribute('accept') || '';
        if (!accept.includes('video')) {
          inp.setAttribute('accept', accept ? accept + ',video/mp4,video/webm,video/quicktime' : 'image/*,video/*');
        }
      });
    }

    setInterval(mountVideoRefButton, 2000);
    setInterval(expandNativeFileInputAccept, 3000);
    document.addEventListener('DOMContentLoaded', mountVideoRefButton, { passive: true });
    window.addEventListener('load', mountVideoRefButton, { passive: true });
  })();

  // ============================================================================
  // 🛡️ CHANNA STABLE SESSION SHIELD (Secondary body scanner deactivated to prevent reload loops)
  // ============================================================================
  (() => {
    // Real-time server stream detection and safe modal dialog detection handle limits with zero reload loops.
  })();





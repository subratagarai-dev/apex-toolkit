(function installChannaVideoZipBuilder() {
  'use strict';

  if (globalThis.__channaVideoZipBuilderInstalled) return;
  globalThis.__channaVideoZipBuilderInstalled = true;

  const BUILD_MESSAGE = 'CHANNA_BUILD_VIDEO_ZIP';
  const RELEASE_MESSAGE = 'CHANNA_RELEASE_VIDEO_ZIP';
  const PROGRESS_MESSAGE = 'CHANNA_VIDEO_ZIP_BUILD_PROGRESS';
  const PAUSE_MESSAGE = 'CHANNA_PAUSE_VIDEO_ZIP';
  const RESUME_MESSAGE = 'CHANNA_RESUME_VIDEO_ZIP';
  const CANCEL_MESSAGE = 'CHANNA_CANCEL_VIDEO_ZIP';
  const MAX_ZIP32_VALUE = 0xffffffff;
  const CONCURRENCY = 5; // 5 parallel video streams: prevents CDN choking & network timeouts

  const activeBlobUrls = new Set();
  const activeBuildControllers = new Map();
  const crcTable = createCrcTable();

  function reportProgress(buildId, progress) {
    if (!buildId) return;
    try {
      chrome.runtime.sendMessage({
        type: PROGRESS_MESSAGE,
        buildId,
        ...progress
      }, () => void chrome.runtime.lastError);
    } catch (e) {}
  }

  function createCrcTable() {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) {
        value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
      }
      table[index] = value >>> 0;
    }
    return table;
  }

  function updateCrc(crc, bytes) {
    let value = crc;
    for (let index = 0; index < bytes.length; index += 1) {
      value = crcTable[(value ^ bytes[index]) & 0xff] ^ (value >>> 8);
    }
    return value >>> 0;
  }

  function dosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    return {
      time: ((date.getHours() & 0x1f) << 11)
        | ((date.getMinutes() & 0x3f) << 5)
        | ((Math.floor(date.getSeconds() / 2)) & 0x1f),
      date: (((year - 1980) & 0x7f) << 9)
        | (((date.getMonth() + 1) & 0x0f) << 5)
        | (date.getDate() & 0x1f)
    };
  }

  function localHeader(nameBytes, crc, size, timestamp) {
    const buffer = new ArrayBuffer(30);
    const view = new DataView(buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, timestamp.time, true);
    view.setUint16(12, timestamp.date, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBytes.length, true);
    view.setUint16(28, 0, true);
    return new Uint8Array(buffer);
  }

  function centralHeader(nameBytes, crc, size, offset, timestamp) {
    const buffer = new ArrayBuffer(46);
    const view = new DataView(buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x0800, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, timestamp.time, true);
    view.setUint16(14, timestamp.date, true);
    view.setUint32(16, crc, true);
    view.setUint32(20, size, true);
    view.setUint32(24, size, true);
    view.setUint16(28, nameBytes.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, offset, true);
    return new Uint8Array(buffer);
  }

  function endOfCentralDirectory(entryCount, centralSize, centralOffset) {
    const buffer = new ArrayBuffer(22);
    const view = new DataView(buffer);
    view.setUint32(0, 0x06054b50, true);
    view.setUint16(4, 0, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, entryCount, true);
    view.setUint16(10, entryCount, true);
    view.setUint32(12, centralSize, true);
    view.setUint32(16, centralOffset, true);
    view.setUint16(20, 0, true);
    return new Uint8Array(buffer);
  }

  const FETCH_TIMEOUT_MS = 15000;

  async function fetchVideo(entry, onProgress, signal) {
    let cleanUrl = String(entry.url || '').trim();
    if (cleanUrl.startsWith('http://')) {
      cleanUrl = cleanUrl.replace(/^http:\/\//i, 'https://');
    }

    const timeoutController = new AbortController();
    let timeoutId = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

    function onParentAbort() {
      timeoutController.abort();
    }
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timeoutId);
        throw new Error('Download aborted');
      }
      signal.addEventListener('abort', onParentAbort, { once: true });
    }

    try {
      const response = await fetch(cleanUrl, {
        method: 'GET',
        redirect: 'follow',
        cache: 'no-store',
        signal: timeoutController.signal
      });
      if (!response.ok || !response.body) {
        throw new Error(`Video fetch failed (${response.status || 'network error'})`);
      }

      const reader = response.body.getReader();
      const chunks = [];
      let size = 0;
      let crc = 0xffffffff;
      const totalBytes = Number(response.headers.get('content-length'))
        || Number(entry.expectedBytes)
        || 0;
      let lastProgressAt = 0;
      onProgress?.(0, totalBytes);

      while (true) {
        if (signal?.aborted) {
          try { reader.cancel(); } catch (e) {}
          throw new Error('Download aborted');
        }

        // Reset timeout whenever active stream data is received
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);

        const { done, value } = await reader.read();
        if (done) break;
        if (!value?.length) continue;
        chunks.push(value);
        size += value.length;
        if (size > MAX_ZIP32_VALUE) {
          throw new Error('A video is too large for a standard ZIP file');
        }
        crc = updateCrc(crc, value);
        const now = Date.now();
        if (now - lastProgressAt >= 150) {
          lastProgressAt = now;
          onProgress?.(size, totalBytes);
        }
      }

      onProgress?.(size, totalBytes || size);

      const headerBytes = Number(response.headers.get('content-length')) || 0;
      if (headerBytes && size < headerBytes) {
        throw new Error(`Incomplete video received (${size} of ${headerBytes} bytes)`);
      }

      return {
        blob: new Blob(chunks, { type: 'video/mp4' }),
        size,
        crc: (crc ^ 0xffffffff) >>> 0
      };
    } catch (directErr) {
      if (signal?.aborted) throw directErr;
      // Robust background fallback: use service worker with <all_urls> privilege
      try {
        const bgResult = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'FETCH_MEDIA_BUFFER', url: cleanUrl }, res => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve(res);
          });
        });
        if (bgResult?.ok && bgResult?.base64) {
          const binary = atob(bgResult.base64);
          const len = binary.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
          const fileCrc = (updateCrc(0xffffffff, bytes) ^ 0xffffffff) >>> 0;
          onProgress?.(len, len);
          return {
            blob: new Blob([bytes], { type: 'video/mp4' }),
            size: len,
            crc: fileCrc
          };
        }
      } catch (bgErr) {}
      throw directErr;
    } finally {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', onParentAbort);
    }
  }

  async function fetchVideoWithRetry(entry, onProgress, signal, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      if (signal?.aborted) throw new Error('Download aborted');
      try {
        return await fetchVideo(entry, onProgress, signal);
      } catch (err) {
        lastError = err;
        if (signal?.aborted) throw err;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
        }
      }
    }
    throw lastError;
  }

  async function buildZip(entries, buildId) {
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 0xffff) {
      throw new Error('Invalid ZIP entry count');
    }

    const encoder = new TextEncoder();
    const timestamp = dosDateTime();
    const total = entries.length;

    const results = new Array(total);
    const activeBytes = new Array(total).fill(0);
    const expectedBytes = new Array(total).fill(0);
    let completedCount = 0;
    let nextIndex = 0;
    let maxObservedPercent = 0;
    let lastEmitTime = 0;

    function calculateTotalBatchSize(sumDownloaded) {
      let knownSum = 0;
      let knownCount = 0;

      for (let i = 0; i < total; i++) {
        const sz = results[i]?.file?.size || expectedBytes[i] || 0;
        if (sz > 0) {
          knownSum += sz;
          knownCount += 1;
        }
      }

      // If at least one video size is known, use average for unknown ones; else default to 16MB
      const avgPerVideo = knownCount > 0 ? Math.round(knownSum / knownCount) : (16 * 1024 * 1024);

      let batchTotal = 0;
      for (let i = 0; i < total; i++) {
        if (results[i]?.file?.size) {
          batchTotal += results[i].file.size;
        } else if (expectedBytes[i] > 0) {
          batchTotal += Math.max(activeBytes[i] || 0, expectedBytes[i]);
        } else {
          batchTotal += Math.max(activeBytes[i] || 0, avgPerVideo);
        }
      }

      return Math.max(sumDownloaded, batchTotal);
    }

    function emitProgress(force = false) {
      if (buildState.isCancelled) return;
      const now = Date.now();
      if (!force && now - lastEmitTime < 150) return;
      lastEmitTime = now;

      const sumDownloaded = activeBytes.reduce((a, b) => a + b, 0);
      const totalBatchSize = calculateTotalBatchSize(sumDownloaded);

      const countPercent = total > 0 ? (completedCount / total) * 100 : 0;
      const bytePercent = totalBatchSize > 0 ? (sumDownloaded / totalBatchSize) * 100 : 0;

      // Real percentage based on downloaded bytes across all videos
      let currentPercent = bytePercent > 0 ? bytePercent : countPercent;

      if (completedCount < total) {
        // While any video stream is still downloading, cap at 98.5%
        currentPercent = Math.min(98.5, currentPercent);
        maxObservedPercent = Math.min(98.5, Math.max(maxObservedPercent, currentPercent));
      } else {
        currentPercent = 100;
        maxObservedPercent = 100;
      }

      const percent = completedCount >= total ? 100 : maxObservedPercent;

      reportProgress(buildId, {
        stage: buildState.isPaused ? 'paused' : 'downloading',
        completed: completedCount,
        total,
        currentBytes: sumDownloaded,
        currentTotal: totalBatchSize,
        percent,
        isPaused: buildState.isPaused,
        concurrency: Math.min(CONCURRENCY, Math.max(1, total - completedCount))
      });
    }

    const buildState = {
      isPaused: false,
      isCancelled: false,
      abortController: new AbortController(),
      resumeResolve: null,
      emitProgress
    };
    activeBuildControllers.set(buildId, buildState);

    let keepalivePort = null;
    let keepaliveTimer = null;
    try {
      keepalivePort = chrome.runtime.connect({ name: 'CHANNA_ZIP_LIFELINE' });
      keepaliveTimer = setInterval(() => {
        try { keepalivePort?.postMessage({ ping: true, buildId }); } catch (e) {}
      }, 10000);
    } catch (e) {}

    function cleanupLifeline() {
      if (keepaliveTimer) clearInterval(keepaliveTimer);
      try { keepalivePort?.disconnect(); } catch (e) {}
    }

    async function waitIfPaused() {
      while (buildState.isPaused && !buildState.isCancelled) {
        await new Promise(resolve => {
          buildState.resumeResolve = resolve;
        });
      }
      if (buildState.isCancelled) {
        cleanupLifeline();
        throw new Error('ZIP download cancelled by user');
      }
    }

    // 1. Fast parallel HEAD probe before starting workers so total MB is known immediately
    try {
      await Promise.all(entries.map(async (entry, idx) => {
        if (entry.expectedBytes && Number(entry.expectedBytes) > 0) {
          expectedBytes[idx] = Number(entry.expectedBytes);
          return;
        }
        try {
          const cleanUrl = String(entry.url || '').split('#')[0];
          const probeCtrl = new AbortController();
          const tid = setTimeout(() => probeCtrl.abort(), 2000);
          const headResp = await fetch(cleanUrl, { method: 'HEAD', signal: probeCtrl.signal });
          clearTimeout(tid);
          const cl = Number(headResp.headers.get('content-length'));
          if (cl && cl > 0) {
            expectedBytes[idx] = cl;
          }
        } catch (e) {}
      }));
    } catch (e) {}

    // Emit initial 0% progress with exact known batch size
    emitProgress(true);

    async function worker() {
      while (nextIndex < total) {
        if (buildState.isCancelled) {
          cleanupLifeline();
          throw new Error('ZIP download cancelled by user');
        }
        await waitIfPaused();

        const index = nextIndex++;
        if (index >= total) break;

        const entry = entries[index];
        const nameBytes = encoder.encode(String(entry.name || `video_${index + 1}.mp4`));
        if (nameBytes.length > 0xffff) throw new Error('ZIP filename is too long');

        try {
          const file = await fetchVideoWithRetry(entry, (curBytes, curTotal) => {
            activeBytes[index] = curBytes;
            if (curTotal > 0) expectedBytes[index] = curTotal;
            emitProgress(false);
          }, buildState.abortController.signal);

          results[index] = { entry, nameBytes, file };
          completedCount += 1;
          activeBytes[index] = file.size;
          expectedBytes[index] = file.size;
          emitProgress(true);
        } catch (err) {
          if (buildState.isCancelled) {
            cleanupLifeline();
            throw new Error('ZIP download cancelled by user');
          }
          console.warn(`[ChannaTheBrand Video Zip] Video #${index + 1} (${entry.name}) note:`, err?.message || err);

          // Fault tolerance: Dead links generate a clean error.txt inside the ZIP archive instead of failing the whole batch
          const failNote = `Video #${index + 1} could not be downloaded (${err?.message || 'CDN/network error'}).\nURL: ${entry.url}\nPrompt: ${entry.prompt || ''}\n`;
          const failBytes = encoder.encode(failNote);
          const failBlob = new Blob([failNote], { type: 'text/plain' });
          const failNameBytes = encoder.encode(String(entry.name || `video_${index + 1}`).replace(/\.mp4$/i, '') + '_error.txt');
          results[index] = {
            entry,
            nameBytes: failNameBytes,
            file: {
              blob: failBlob,
              size: failBlob.size,
              crc: updateCrc(0xffffffff, failBytes) ^ 0xffffffff
            }
          };
          completedCount += 1;
          activeBytes[index] = failBlob.size;
          expectedBytes[index] = failBlob.size;
          emitProgress(true);
        }
      }
    }

    // Launch up to 10 parallel stream workers
    const workerPromises = [];
    const actualConcurrency = Math.min(CONCURRENCY, total);
    for (let i = 0; i < actualConcurrency; i++) {
      workerPromises.push(worker());
    }

    await Promise.all(workerPromises);

    if (buildState.isCancelled) throw new Error('ZIP download cancelled by user');

    const finalDownloaded = activeBytes.reduce((a, b) => a + b, 0);
    const finalBatchSize = calculateTotalBatchSize(finalDownloaded);
    reportProgress(buildId, {
      stage: 'packing',
      completed: total,
      total,
      currentBytes: finalDownloaded,
      currentTotal: finalBatchSize,
      percent: 100,
      isPaused: false
    });

    const zipParts = [];
    const centralParts = [];
    let offset = 0;
    let centralSize = 0;

    for (let i = 0; i < total; i++) {
      const item = results[i];
      if (!item) continue;
      const { nameBytes, file } = item;
      const local = localHeader(nameBytes, file.crc, file.size, timestamp);
      const central = centralHeader(nameBytes, file.crc, file.size, offset, timestamp);
      zipParts.push(local, nameBytes, file.blob);
      centralParts.push(central, nameBytes);
      offset += local.length + nameBytes.length + file.size;
      centralSize += central.length + nameBytes.length;
      if (offset > MAX_ZIP32_VALUE || centralSize > MAX_ZIP32_VALUE) {
        throw new Error('Combined videos are too large for a standard ZIP file');
      }
    }

    const centralOffset = offset;
    zipParts.push(...centralParts);
    zipParts.push(endOfCentralDirectory(entries.length, centralSize, centralOffset));
    const blob = new Blob(zipParts, { type: 'application/zip' });
    const blobUrl = URL.createObjectURL(blob);
    activeBlobUrls.add(blobUrl);
    activeBuildControllers.delete(buildId);
    cleanupLifeline();
    return { blobUrl, size: blob.size };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === PAUSE_MESSAGE) {
      const ctrl = activeBuildControllers.get(String(message.buildId || ''));
      if (ctrl) {
        ctrl.isPaused = true;
        if (typeof ctrl.emitProgress === 'function') {
          ctrl.emitProgress(true);
        } else {
          reportProgress(message.buildId, { stage: 'paused', isPaused: true });
        }
        sendResponse({ ok: true, isPaused: true });
      } else {
        sendResponse({ ok: false });
      }
      return false;
    }

    if (message?.type === RESUME_MESSAGE) {
      const ctrl = activeBuildControllers.get(String(message.buildId || ''));
      if (ctrl) {
        ctrl.isPaused = false;
        if (typeof ctrl.resumeResolve === 'function') {
          ctrl.resumeResolve();
          ctrl.resumeResolve = null;
        }
        if (typeof ctrl.emitProgress === 'function') {
          ctrl.emitProgress(true);
        } else {
          reportProgress(message.buildId, { stage: 'downloading', isPaused: false });
        }
        sendResponse({ ok: true, isPaused: false });
      } else {
        sendResponse({ ok: false });
      }
      return false;
    }

    if (message?.type === CANCEL_MESSAGE) {
      const ctrl = activeBuildControllers.get(String(message.buildId || ''));
      if (ctrl) {
        ctrl.isCancelled = true;
        ctrl.isPaused = false;
        try { ctrl.abortController.abort(); } catch(e) {}
        if (typeof ctrl.resumeResolve === 'function') {
          ctrl.resumeResolve();
          ctrl.resumeResolve = null;
        }
        activeBuildControllers.delete(String(message.buildId || ''));
        sendResponse({ ok: true, cancelled: true });
      } else {
        sendResponse({ ok: false });
      }
      return false;
    }

    if (message?.type === RELEASE_MESSAGE) {
      const blobUrl = String(message.blobUrl || '');
      if (blobUrl && activeBlobUrls.delete(blobUrl)) URL.revokeObjectURL(blobUrl);
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type !== BUILD_MESSAGE) return false;
    void buildZip(message.entries, message.buildId).then(result => {
      sendResponse({ ok: true, ...result });
    }).catch(error => {
      sendResponse({ ok: false, error: error?.message || String(error) });
    });
    return true;
  });
})();

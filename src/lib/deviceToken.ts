/**
 * Device Token Utility
 * Generates a stable fingerprint identifier that works across browsers on the same device
 * Uses hardware-based signals that are consistent regardless of browser
 */

const DEVICE_TOKEN_KEY = 'tappa_device_token';

/**
 * Gets WebGL renderer info (GPU-based, consistent across browsers)
 */
function getWebGLInfo(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) {
      return '';
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return '';
    }
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
    
    return `${vendor}|${renderer}`;
  } catch {
    return '';
  }
}

/**
 * Gets a canvas fingerprint based on rendering (hardware-dependent)
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return '';
    }
    
    // Use specific rendering that varies by GPU/hardware
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.font = '11pt Arial';
    ctx.fillText('DeviceFP', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('DeviceFP', 4, 45);
    
    return canvas.toDataURL();
  } catch {
    return '';
  }
}

/**
 * Gets available fonts (system-dependent, consistent across browsers)
 */
function getInstalledFonts(): string {
  const testFonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Trebuchet MS', 'Comic Sans MS', 'Impact', 'Lucida Console',
    'Tahoma', 'Palatino Linotype', 'Segoe UI', 'Roboto', 'Ubuntu',
    'Helvetica Neue', 'San Francisco', 'Apple SD Gothic Neo'
  ];
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    const baseFont = 'monospace';
    ctx.font = `72px ${baseFont}`;
    const baseWidth = ctx.measureText('mmmmmmmmmmlli').width;
    
    const detected: string[] = [];
    for (const font of testFonts) {
      ctx.font = `72px "${font}", ${baseFont}`;
      const width = ctx.measureText('mmmmmmmmmmlli').width;
      if (width !== baseWidth) {
        detected.push(font);
      }
    }
    
    return detected.join(',');
  } catch {
    return '';
  }
}

/**
 * Gets audio context fingerprint (hardware-dependent)
 */
async function getAudioFingerprint(): Promise<string> {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    
    gain.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(0);
    
    const fingerprint = `${audioContext.sampleRate}|${analyser.fftSize}|${audioContext.destination.maxChannelCount}`;
    
    oscillator.stop();
    await audioContext.close();
    
    return fingerprint;
  } catch {
    return '';
  }
}

/**
 * Generates a stable device fingerprint using hardware-based signals
 * These signals are consistent across different browsers on the same device
 */
export async function generateMiniFingerprint(): Promise<string> {
  // Hardware-based signals (consistent across browsers on same device)
  const screenInfo = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const language = navigator.language || '';
  const platform = navigator.platform || '';
  const cpuCores = navigator.hardwareConcurrency || 0;
  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 0;
  const touchPoints = navigator.maxTouchPoints || 0;
  
  // GPU/rendering fingerprint (hardware-dependent)
  const webgl = getWebGLInfo();
  const canvas = getCanvasFingerprint();
  const fonts = getInstalledFonts();
  
  // Audio fingerprint (hardware-dependent)
  const audio = await getAudioFingerprint();
  
  // Combine all hardware signals (excluding browser-specific info like userAgent)
  const payload = [
    screenInfo,
    timezone,
    language,
    platform,
    cpuCores,
    deviceMemory,
    touchPoints,
    webgl,
    canvas,
    fonts,
    audio
  ].join('||');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  
  try {
    const hashBuf = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch {
    // Fallback: simple hash simulation
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      const char = payload.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(32, '0');
  }
}

/**
 * Gets the existing device token or generates a new fingerprint
 * Token is cached in localStorage but can be regenerated if missing
 */
export async function getOrCreateDeviceToken(): Promise<string> {
  // Always generate fingerprint fresh to ensure cross-browser consistency
  const fingerprint = await generateMiniFingerprint();
  
  try {
    // Cache it for performance, but the fingerprint itself is the source of truth
    localStorage.setItem(DEVICE_TOKEN_KEY, fingerprint);
  } catch {
    // Ignore if localStorage is unavailable
  }
  
  return fingerprint;
}

/**
 * Gets the current device token (synchronous, may return null if not set)
 * For incognito, use getOrCreateDeviceToken() instead
 */
export function getDeviceToken(): string | null {
  try {
    return localStorage.getItem(DEVICE_TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Clears the device token (useful for testing or logout scenarios)
 */
export function clearDeviceToken(): void {
  try {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch {
    // Ignore if localStorage is unavailable
  }
}

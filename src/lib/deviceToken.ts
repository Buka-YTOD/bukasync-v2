/**
 * Device Token Utility
 * Generates a stable fingerprint identifier for each device/browser combination
 * Works in incognito mode using stable browser signals
 */

const DEVICE_TOKEN_KEY = 'tappa_device_token';

/**
 * Gets a simple canvas-based entropy hash
 */
function getCanvasHash(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return '';
    }
    ctx.textBaseline = 'top';
    ctx.font = '14px "Arial"';
    ctx.fillText('Fingerprint', 2, 2);
    const data = canvas.toDataURL();
    return data;
  } catch {
    return '';
  }
}

/**
 * Generates a stable fingerprint using non-invasive browser signals
 * This works in incognito mode since it doesn't rely on localStorage-generated values
 */
export async function generateMiniFingerprint(): Promise<string> {
  const ua = navigator.userAgent || '';
  const lang = navigator.language || '';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const screenSize = `${screen.width}x${screen.height}`;
  const canvas = getCanvasHash();

  const payload = `${ua}||${lang}||${timezone}||${screenSize}||${canvas}`;
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
  try {
    const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (existing) {
      return existing;
    }
    
    const newToken = await generateMiniFingerprint();
    localStorage.setItem(DEVICE_TOKEN_KEY, newToken);
    return newToken;
  } catch {
    // If localStorage is unavailable (incognito), just generate fingerprint
    return generateMiniFingerprint();
  }
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

/**
 * Device Token Utility
 * Generates a unique, persistent identifier for each device/browser combination
 * Used for session-based access control without authentication
 */

const DEVICE_TOKEN_KEY = 'tappa_device_token';

/**
 * Generates a cryptographic hash of device characteristics
 * Creates a unique fingerprint combining:
 * - Random UUID (ensures uniqueness)
 * - Timestamp (adds entropy)
 * - User agent (device identification)
 */
async function generateDeviceFingerprint(): Promise<string> {
  const randomPart = crypto.randomUUID();
  const timestamp = Date.now().toString(36);
  const userAgent = navigator.userAgent || '';
  
  // Create a combined string for hashing
  const combined = `${randomPart}-${timestamp}-${userAgent}`;
  
  // Use SubtleCrypto to create a SHA-256 hash
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return first 32 characters for a more manageable token
    return hashHex.substring(0, 32);
  } catch {
    // Fallback for browsers without SubtleCrypto
    return `${randomPart.replace(/-/g, '').substring(0, 16)}${timestamp}`;
  }
}

/**
 * Gets the existing device token or generates a new one
 * Token is persisted in localStorage for consistency across sessions
 */
export async function getOrCreateDeviceToken(): Promise<string> {
  try {
    const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
    if (existing) {
      return existing;
    }
    
    const newToken = await generateDeviceFingerprint();
    localStorage.setItem(DEVICE_TOKEN_KEY, newToken);
    return newToken;
  } catch {
    // If localStorage is unavailable, generate a session-only token
    return generateDeviceFingerprint();
  }
}

/**
 * Gets the current device token (synchronous, may return null if not set)
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

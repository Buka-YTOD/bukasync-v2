/**
 * Supabase client wrapper that includes device token in all requests
 * This enables RLS policies to verify session membership
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { getDeviceToken } from './deviceToken';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Cache for the client instance
let clientInstance: SupabaseClient<Database> | null = null;
let currentToken: string | null = null;

/**
 * Gets a Supabase client configured with the device token header
 * The client is cached and recreated only when the token changes
 */
export function getSupabaseWithToken(deviceToken: string): SupabaseClient<Database> {
  // Return cached client if token hasn't changed
  if (clientInstance && currentToken === deviceToken) {
    return clientInstance;
  }
  
  // Create new client with updated token
  currentToken = deviceToken;
  clientInstance = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        'x-device-token': deviceToken,
      },
    },
  });
  
  return clientInstance;
}

/**
 * Gets a Supabase client using the current device token from localStorage
 * Returns null if no device token is available
 */
export function getSupabaseWithCurrentToken(): SupabaseClient<Database> | null {
  const token = getDeviceToken();
  if (!token) {
    return null;
  }
  return getSupabaseWithToken(token);
}

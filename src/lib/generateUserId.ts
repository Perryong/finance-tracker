import { supabase } from './supabase';

/**
 * Generates a unique user identifier with timestamp prefix and random string
 * Format: YYYYMMDD_[20-character-string]
 * @returns Promise<string> The generated unique identifier
 * @throws Error if verification fails or database is unreachable
 */
export async function generateUserId(): Promise<string> {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  
  // Characters to use for random string generation
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  
  async function generateRandomString(length: number): Promise<string> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array)
      .map(x => chars[x % chars.length])
      .join('');
  }
  
  async function isIdUnique(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw new Error(`Database check failed: ${error.message}`);
    }
    
    return !data;
  }
  
  // Generate and verify uniqueness
  let attempts = 0;
  const maxAttempts = 5;
  
  while (attempts < maxAttempts) {
    const randomString = await generateRandomString(20);
    const userId = `${timestamp}_${randomString}`;
    
    if (await isIdUnique(userId)) {
      return userId;
    }
    
    attempts++;
  }
  
  throw new Error('Failed to generate unique user ID after maximum attempts');
}

/**
 * Validates a user ID format
 * @param userId The user ID to validate
 * @returns boolean indicating if the format is valid
 */
export function isValidUserId(userId: string): boolean {
  const pattern = /^\d{8}_[a-zA-Z0-9!@#$%^&*]{20}$/;
  return pattern.test(userId);
}
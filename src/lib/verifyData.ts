import { supabase } from './supabase';
import type { Database } from './database.types';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];

/**
 * Verifies if data was successfully saved to Supabase by comparing the saved record with the original input
 * @param tableName The name of the table to verify
 * @param id The ID of the record to verify
 * @param originalData The original data to compare against
 * @returns True if data matches exactly, false if there are discrepancies
 * @throws Error if the query fails or connection issues occur
 */
export async function verifyData<T extends TableName>(
  tableName: T,
  id: string,
  originalData: Partial<Row<T>>
): Promise<boolean> {
  try {
    // Query the specific record
    const { data: savedData, error } = await supabase
      .from(tableName)
      .select('*')
      .eq(tableName === 'user_settings' ? 'user_id' : 'id', id)
      .single();

    // Check for query errors
    if (error) {
      throw new Error(`Failed to verify data: ${error.message}`);
    }

    // If no data was found
    if (!savedData) {
      return false;
    }

    // Compare all fields from original data
    for (const [key, value] of Object.entries(originalData)) {
      // Skip comparison for timestamps if they exist in original data
      if (key === 'created_at' || key === 'updated_at') continue;

      // Handle numeric values (decimals) with precision comparison
      if (typeof value === 'number') {
        const savedValue = parseFloat(savedData[key]);
        if (Math.abs(savedValue - value) > Number.EPSILON) {
          return false;
        }
        continue;
      }

      // Handle dates
      if (value instanceof Date) {
        const savedDate = new Date(savedData[key]);
        if (savedDate.getTime() !== value.getTime()) {
          return false;
        }
        continue;
      }

      // Direct comparison for other types
      if (savedData[key] !== value) {
        return false;
      }
    }

    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Verification failed: ${error.message}`);
    }
    throw new Error('Verification failed with unknown error');
  }
}

/**
 * Example usage:
 * 
 * try {
 *   const newTransaction = {
 *     user_id: 'user123',
 *     amount: 100.50,
 *     category: 'Food',
 *     date: '2025-06-06',
 *     type: 'expense'
 *   };
 * 
 *   const { data, error } = await supabase
 *     .from('transactions')
 *     .insert(newTransaction)
 *     .select()
 *     .single();
 * 
 *   if (error || !data) throw error;
 * 
 *   const isVerified = await verifyData('transactions', data.id, newTransaction);
 *   console.log('Data verification:', isVerified ? 'successful' : 'failed');
 * } catch (error) {
 *   console.error('Error:', error);
 * }
 */
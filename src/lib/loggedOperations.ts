import { supabase } from './supabase';
import { logger } from './logger';
import type { Database } from './database.types';

type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

/**
 * Wrapper for database operations with automatic logging
 */
export class LoggedOperations {
  /**
   * Insert operation with logging
   */
  static async insert<T extends TableName>(
    table: T,
    data: Insert<T>,
    description?: string
  ): Promise<{ data: Row<T> | null; error: any }> {
    const startTime = performance.now();
    
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      const executionTime = Math.round(performance.now() - startTime);

      if (error) {
        await logger.logDatabaseOperation(
          'INSERT',
          table,
          undefined,
          undefined,
          data as Record<string, any>,
          'FAILURE',
          error.message
        );
        return { data: null, error };
      }

      await logger.logDatabaseOperation(
        'INSERT',
        table,
        result.id,
        undefined,
        result as Record<string, any>,
        'SUCCESS'
      );

      if (description) {
        await logger.info('DATABASE_OPERATION', description, {
          table,
          operation: 'INSERT',
          recordId: result.id,
          executionTimeMs: executionTime
        });
      }

      return { data: result, error: null };
    } catch (err) {
      const error = err as Error;
      await logger.error(
        'DATABASE_OPERATION',
        `Failed to insert into ${table}`,
        error.message,
        { table, operation: 'INSERT', data }
      );
      return { data: null, error };
    }
  }

  /**
   * Update operation with logging
   */
  static async update<T extends TableName>(
    table: T,
    id: string,
    updates: Update<T>,
    description?: string
  ): Promise<{ data: Row<T> | null; error: any }> {
    const startTime = performance.now();
    
    try {
      // Get current data for before/after comparison
      const { data: beforeData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { data: result, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      const executionTime = Math.round(performance.now() - startTime);

      if (error) {
        await logger.logDatabaseOperation(
          'UPDATE',
          table,
          id,
          beforeData as Record<string, any>,
          updates as Record<string, any>,
          'FAILURE',
          error.message
        );
        return { data: null, error };
      }

      await logger.logDatabaseOperation(
        'UPDATE',
        table,
        id,
        beforeData as Record<string, any>,
        result as Record<string, any>,
        'SUCCESS'
      );

      if (description) {
        await logger.info('DATABASE_OPERATION', description, {
          table,
          operation: 'UPDATE',
          recordId: id,
          executionTimeMs: executionTime
        });
      }

      return { data: result, error: null };
    } catch (err) {
      const error = err as Error;
      await logger.error(
        'DATABASE_OPERATION',
        `Failed to update ${table} record ${id}`,
        error.message,
        { table, operation: 'UPDATE', recordId: id, updates }
      );
      return { data: null, error };
    }
  }

  /**
   * Delete operation with logging
   */
  static async delete<T extends TableName>(
    table: T,
    id: string,
    description?: string
  ): Promise<{ data: Row<T> | null; error: any }> {
    const startTime = performance.now();
    
    try {
      // Get current data before deletion
      const { data: beforeData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { data: result, error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .select()
        .single();

      const executionTime = Math.round(performance.now() - startTime);

      if (error) {
        await logger.logDatabaseOperation(
          'DELETE',
          table,
          id,
          beforeData as Record<string, any>,
          undefined,
          'FAILURE',
          error.message
        );
        return { data: null, error };
      }

      await logger.logDatabaseOperation(
        'DELETE',
        table,
        id,
        beforeData as Record<string, any>,
        undefined,
        'SUCCESS'
      );

      if (description) {
        await logger.info('DATABASE_OPERATION', description, {
          table,
          operation: 'DELETE',
          recordId: id,
          executionTimeMs: executionTime
        });
      }

      return { data: result, error: null };
    } catch (err) {
      const error = err as Error;
      await logger.error(
        'DATABASE_OPERATION',
        `Failed to delete ${table} record ${id}`,
        error.message,
        { table, operation: 'DELETE', recordId: id }
      );
      return { data: null, error };
    }
  }

  /**
   * Select operation with logging (for sensitive queries)
   */
  static async select<T extends TableName>(
    table: T,
    query: any,
    description?: string
  ): Promise<{ data: Row<T>[] | null; error: any }> {
    const startTime = performance.now();
    
    try {
      const { data: result, error } = await query;
      const executionTime = Math.round(performance.now() - startTime);

      if (error) {
        await logger.warning(
          'DATABASE_OPERATION',
          `Failed to select from ${table}`,
          error.message,
          { table, operation: 'SELECT', executionTimeMs: executionTime }
        );
        return { data: null, error };
      }

      if (description) {
        await logger.debug('DATABASE_OPERATION', description, {
          table,
          operation: 'SELECT',
          resultCount: Array.isArray(result) ? result.length : 1,
          executionTimeMs: executionTime
        });
      }

      return { data: result, error: null };
    } catch (err) {
      const error = err as Error;
      await logger.error(
        'DATABASE_OPERATION',
        `Failed to select from ${table}`,
        error.message,
        { table, operation: 'SELECT' }
      );
      return { data: null, error };
    }
  }
}

// Example usage:
/*
// Insert with logging
const { data: newTransaction, error } = await LoggedOperations.insert(
  'transactions',
  {
    user_id: 'user123',
    amount: 100.50,
    category: 'Food',
    date: '2025-06-06',
    type: 'expense'
  },
  'User added new food expense transaction'
);

// Update with logging
const { data: updatedTransaction, error: updateError } = await LoggedOperations.update(
  'transactions',
  'trans123',
  { amount: 150.75 },
  'User updated transaction amount'
);

// Delete with logging
const { data: deletedTransaction, error: deleteError } = await LoggedOperations.delete(
  'transactions',
  'trans123',
  'User deleted transaction'
);
*/
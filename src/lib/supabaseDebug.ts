import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

/**
 * Comprehensive debugging utility for Supabase data insertion issues
 */
export class SupabaseDebugger {
  
  /**
   * Test basic Supabase connection and authentication
   */
  static async testConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
      // Test 1: Check if client is initialized
      if (!supabase) {
        console.error('❌ Supabase client not initialized');
        return false;
      }
      
      // Test 2: Check environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Environment check:', {
        url: supabaseUrl ? '✅ Present' : '❌ Missing',
        key: supabaseKey ? '✅ Present' : '❌ Missing'
      });
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing environment variables');
        return false;
      }
      
      // Test 3: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        return false;
      }
      
      if (!user) {
        console.error('❌ User not authenticated');
        return false;
      }
      
      console.log('✅ User authenticated:', user.id);
      
      // Test 4: Test basic table access
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Table access error:', error);
        return false;
      }
      
      console.log('✅ Database connection successful');
      return true;
      
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      return false;
    }
  }
  
  /**
   * Validate transaction data before insertion
   */
  static validateTransactionData(transactionData: any) {
    const errors: string[] = [];
    
    // Required fields check
    const requiredFields = ['amount', 'category', 'date', 'type'];
    requiredFields.forEach(field => {
      if (!transactionData[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Type validation
    if (transactionData.amount !== undefined) {
      const amount = parseFloat(transactionData.amount);
      if (isNaN(amount)) {
        errors.push('Amount must be a valid number');
      }
    }
    
    // Type constraint validation
    if (transactionData.type && !['income', 'expense'].includes(transactionData.type)) {
      errors.push('Type must be either "income" or "expense"');
    }
    
    // Date format validation
    if (transactionData.date && !Date.parse(transactionData.date)) {
      errors.push('Invalid date format');
    }
    
    return errors;
  }
  
  /**
   * Test transaction insertion with comprehensive logging
   */
  static async testTransactionInsertion() {
    console.log('🔍 Testing transaction insertion...');
    
    try {
      // Step 1: Check connection
      const connectionOk = await this.testConnection();
      if (!connectionOk) {
        return false;
      }
      
      // Step 2: Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ No authenticated user');
        return false;
      }
      
      // Step 3: Create test transaction data
      const testTransaction = {
        user_id: user.id,
        amount: 10.50,
        category: 'Test',
        date: new Date().toISOString().split('T')[0],
        type: 'expense' as const,
        notes: 'Debug test transaction'
      };
      
      // Step 4: Validate data
      const validationErrors = this.validateTransactionData(testTransaction);
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        return false;
      }
      
      console.log('📤 Inserting test transaction:', testTransaction);
      
      // Step 5: Attempt insertion
      const { data, error } = await supabase
        .from('transactions')
        .insert(testTransaction)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Insertion error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return false;
      }
      
      if (!data) {
        console.error('❌ No data returned from insertion');
        return false;
      }
      
      console.log('✅ Test transaction inserted successfully:', data);
      
      // Step 6: Verify we can read it back
      const { data: readData, error: readError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', data.id)
        .single();
      
      if (readError) {
        console.error('❌ Cannot read back inserted data:', readError);
        return false;
      }
      
      console.log('✅ Data successfully readable:', readData);
      
      // Step 7: Clean up test data
      await supabase
        .from('transactions')
        .delete()
        .eq('id', data.id);
      
      console.log('✅ Test transaction cleaned up');
      
      return true;
      
    } catch (err) {
      console.error('❌ Test insertion failed:', err);
      return false;
    }
  }
  
  /**
   * Check RLS policies for transactions table
   */
  static async checkRLSPolicies() {
    console.log('🔍 Checking RLS policies...');
    
    try {
      const { data, error } = await supabase
        .rpc('get_table_policies', { table_name: 'transactions' })
        .select();
      
      if (error) {
        console.log('ℹ️ Cannot check policies directly (expected in production)');
        return;
      }
      
      console.log('📋 RLS Policies:', data);
      
    } catch (err) {
      console.log('ℹ️ Policy check not available');
    }
  }
  
  /**
   * Run complete diagnostic
   */
  static async runDiagnostic() {
    console.log('🚀 Starting Supabase diagnostic...');
    
    const results = {
      connection: false,
      insertion: false,
      policies: false
    };
    
    // Test connection
    results.connection = await this.testConnection();
    
    // Test insertion if connection works
    if (results.connection) {
      results.insertion = await this.testTransactionInsertion();
    }
    
    // Check policies
    await this.checkRLSPolicies();
    
    // Summary
    console.log('📊 Diagnostic Summary:', results);
    
    if (results.connection && results.insertion) {
      console.log('✅ All tests passed! Your Supabase setup is working correctly.');
      toast({
        title: "Diagnostic Complete",
        description: "Supabase connection and data insertion are working correctly.",
      });
    } else {
      console.log('❌ Some tests failed. Check the console for details.');
      toast({
        title: "Diagnostic Issues Found",
        description: "Check the browser console for detailed error information.",
        variant: "destructive",
      });
    }
    
    return results;
  }
}

/**
 * Enhanced transaction creation with debugging
 */
export async function createTransactionWithDebug(transactionData: any) {
  console.log('🔄 Creating transaction with debug info...');
  
  try {
    // Step 1: Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }
    
    if (!user) {
      console.error('❌ No authenticated user');
      throw new Error('User must be authenticated to create transactions');
    }
    
    // Step 2: Prepare data with user ID
    const dataWithUserId = {
      ...transactionData,
      user_id: user.id,
      amount: parseFloat(transactionData.amount) // Ensure numeric
    };
    
    console.log('📤 Transaction data to insert:', dataWithUserId);
    
    // Step 3: Validate data
    const validationErrors = SupabaseDebugger.validateTransactionData(dataWithUserId);
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }
    
    // Step 4: Insert with comprehensive error handling
    const { data, error } = await supabase
      .from('transactions')
      .insert(dataWithUserId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Supabase insertion error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        data: dataWithUserId
      });
      
      // Provide user-friendly error messages
      let userMessage = 'Failed to create transaction';
      switch (error.code) {
        case '23505':
          userMessage = 'A transaction with this information already exists';
          break;
        case '23503':
          userMessage = 'Invalid reference to related data';
          break;
        case '23514':
          userMessage = 'Data does not meet validation requirements';
          break;
        case '42501':
          userMessage = 'Permission denied. Please check your authentication.';
          break;
        default:
          userMessage = `Database error: ${error.message}`;
      }
      
      throw new Error(userMessage);
    }
    
    if (!data) {
      console.error('❌ No data returned from insertion');
      throw new Error('No data returned from insertion');
    }
    
    console.log('✅ Transaction created successfully:', data);
    
    toast({
      title: "Success",
      description: "Transaction created successfully!",
    });
    
    return data;
    
  } catch (err) {
    console.error('❌ Transaction creation failed:', err);
    
    toast({
      title: "Error",
      description: err instanceof Error ? err.message : 'Failed to create transaction',
      variant: "destructive",
    });
    
    throw err;
  }
}
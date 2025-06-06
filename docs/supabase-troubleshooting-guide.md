# Supabase Data Insertion Troubleshooting Guide

## Overview
This guide provides a systematic approach to diagnosing why data might not be appearing in your Supabase database after insertion attempts. Follow these steps in order to identify and resolve the issue.

## 1. Verify Database Connection and API Credentials

### Check Environment Variables
First, ensure your Supabase credentials are correctly configured:

```javascript
// Check if environment variables are loaded
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

// Verify the client is initialized
import { supabase } from '@/lib/supabase';
console.log('Supabase client:', supabase);
```

### Test Basic Connection
```javascript
// Test basic connectivity
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Connection test failed:', error);
      return false;
    }
    console.log('Connection successful. Table exists.');
    return true;
  } catch (err) {
    console.error('Connection error:', err);
    return false;
  }
}
```

**Common Issues:**
- Missing or incorrect `VITE_SUPABASE_URL`
- Missing or incorrect `VITE_SUPABASE_ANON_KEY`
- Environment variables not loaded (check `.env` file location)

## 2. Check Client-Side Code for Proper Data Formatting

### Validate Data Structure Before Insertion
```javascript
// Example: Validating transaction data
function validateTransactionData(transactionData) {
  const requiredFields = ['user_id', 'amount', 'category', 'date', 'type'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!transactionData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });
  
  // Type validation
  if (typeof transactionData.amount !== 'number') {
    errors.push('Amount must be a number');
  }
  
  if (!['income', 'expense'].includes(transactionData.type)) {
    errors.push('Type must be either "income" or "expense"');
  }
  
  // Date format validation
  if (transactionData.date && !Date.parse(transactionData.date)) {
    errors.push('Invalid date format');
  }
  
  return errors;
}

// Use before insertion
const errors = validateTransactionData(newTransaction);
if (errors.length > 0) {
  console.error('Validation errors:', errors);
  return;
}
```

### Check Data Types and Formats
```javascript
// Example: Proper data formatting for insertion
const transactionData = {
  user_id: 'uuid-string', // Must be valid UUID
  amount: parseFloat(amount), // Ensure it's a number
  category: category.trim(), // Remove whitespace
  date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  type: 'expense', // Must match CHECK constraint
  notes: notes || null, // Handle empty strings
  created_at: new Date().toISOString() // Optional, has default
};
```

## 3. Confirm Table Schema Matches Data Structure

### Check Table Schema
```sql
-- Run in Supabase SQL Editor to check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
```

### Verify Constraints
```sql
-- Check constraints that might prevent insertion
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'transactions';
```

**Common Schema Issues:**
- Column names don't match (case sensitivity)
- Data types don't match (string vs number)
- Required fields are null
- Values don't meet CHECK constraints
- Foreign key references don't exist

## 4. Review Error Messages and Console Logs

### Comprehensive Error Logging
```javascript
async function insertTransactionWithLogging(transactionData) {
  console.log('Attempting to insert:', transactionData);
  
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select(); // Important: add .select() to return inserted data
    
    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { success: false, error };
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from insert operation');
      return { success: false, error: 'No data returned' };
    }
    
    console.log('Insert successful:', data);
    return { success: true, data };
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
```

### Network Tab Analysis
1. Open browser DevTools → Network tab
2. Perform the insertion operation
3. Look for the POST request to Supabase
4. Check:
   - Request payload (is data formatted correctly?)
   - Response status (200 = success, 4xx/5xx = error)
   - Response body (contains error details)

**Common Error Codes:**
- `23505`: Unique constraint violation
- `23503`: Foreign key constraint violation
- `23514`: Check constraint violation
- `42703`: Column does not exist
- `42P01`: Table does not exist

## 5. Test API Endpoint Directly

### Using Browser Console
```javascript
// Test direct insertion in browser console
const testData = {
  user_id: 'your-user-id-here',
  amount: 50.00,
  category: 'Food',
  date: '2025-01-06',
  type: 'expense',
  notes: 'Test transaction'
};

supabase
  .from('transactions')
  .insert(testData)
  .select()
  .then(({ data, error }) => {
    if (error) {
      console.error('Direct test failed:', error);
    } else {
      console.log('Direct test successful:', data);
    }
  });
```

### Using curl (Terminal/Command Prompt)
```bash
# Replace with your actual Supabase URL and API key
curl -X POST 'https://your-project.supabase.co/rest/v1/transactions' \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "user_id": "your-user-id",
    "amount": 50.00,
    "category": "Food",
    "date": "2025-01-06",
    "type": "expense",
    "notes": "Test transaction"
  }'
```

## 6. Validate Table Name and Authentication

### Check Authentication Status
```javascript
// Verify user is authenticated
async function checkAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Auth error:', error);
    return null;
  }
  
  if (!user) {
    console.error('User not authenticated');
    return null;
  }
  
  console.log('Authenticated user:', user.id);
  return user;
}
```

### Verify Table Name and RLS Policies
```javascript
// Test if table exists and is accessible
async function testTableAccess() {
  try {
    // Test read access
    const { data, error } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Table access error:', error);
      return false;
    }
    
    console.log('Table accessible for reading');
    return true;
  } catch (err) {
    console.error('Table access failed:', err);
    return false;
  }
}
```

## 7. Implement Proper Error Handling

### Robust Error Handling Pattern
```javascript
async function createTransaction(transactionData) {
  // Step 1: Validate input
  const validationErrors = validateTransactionData(transactionData);
  if (validationErrors.length > 0) {
    throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
  }
  
  // Step 2: Check authentication
  const user = await checkAuth();
  if (!user) {
    throw new Error('User must be authenticated');
  }
  
  // Step 3: Ensure user_id is set
  const dataWithUserId = {
    ...transactionData,
    user_id: user.id
  };
  
  // Step 4: Attempt insertion with comprehensive error handling
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(dataWithUserId)
      .select()
      .single();
    
    if (error) {
      // Log detailed error information
      console.error('Supabase insertion error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        data: dataWithUserId
      });
      
      // Provide user-friendly error messages
      switch (error.code) {
        case '23505':
          throw new Error('A transaction with this information already exists');
        case '23503':
          throw new Error('Invalid reference to related data');
        case '23514':
          throw new Error('Data does not meet validation requirements');
        default:
          throw new Error(`Database error: ${error.message}`);
      }
    }
    
    if (!data) {
      throw new Error('No data returned from insertion');
    }
    
    console.log('Transaction created successfully:', data);
    return data;
    
  } catch (err) {
    console.error('Transaction creation failed:', err);
    throw err;
  }
}
```

## 8. Examine Supabase Logs

### Access Supabase Dashboard Logs
1. Go to your Supabase project dashboard
2. Navigate to "Logs" section
3. Check different log types:
   - **API Logs**: Shows all API requests and responses
   - **Database Logs**: Shows SQL queries and errors
   - **Auth Logs**: Shows authentication events

### Key Information to Look For:
- Failed SQL queries
- Permission denied errors
- Constraint violations
- Connection issues
- Rate limiting

### Enable Detailed Logging
```javascript
// Add request ID for easier log tracking
const { data, error } = await supabase
  .from('transactions')
  .insert(transactionData)
  .select();

// Log the request details for correlation with Supabase logs
console.log('Request timestamp:', new Date().toISOString());
console.log('User ID:', (await supabase.auth.getUser()).data.user?.id);
```

## Common Issues and Solutions

### Issue: "Row Level Security policy violation"
**Solution:** Check RLS policies and ensure user is authenticated
```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'transactions';

-- Example policy for transactions
CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Issue: "Column 'user_id' violates not-null constraint"
**Solution:** Ensure user_id is included in insert data
```javascript
const { data: { user } } = await supabase.auth.getUser();
const transactionData = {
  ...formData,
  user_id: user.id // Ensure this is included
};
```

### Issue: "Invalid input syntax for type uuid"
**Solution:** Validate UUID format
```javascript
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### Issue: Data appears to insert but doesn't show up
**Possible Causes:**
1. RLS policy prevents reading the data back
2. Data inserted into wrong table/schema
3. Transaction rolled back due to trigger failure
4. Caching issues in the application

**Debug Steps:**
```javascript
// Immediately query for the inserted data
const { data: insertedData, error: insertError } = await supabase
  .from('transactions')
  .insert(transactionData)
  .select()
  .single();

if (insertedData) {
  // Try to read it back immediately
  const { data: readData, error: readError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', insertedData.id)
    .single();
    
  if (readError) {
    console.error('Cannot read back inserted data:', readError);
  } else {
    console.log('Data successfully inserted and readable:', readData);
  }
}
```

## Verification Checklist

Before concluding your investigation, verify:

- [ ] Environment variables are correctly set
- [ ] User is authenticated
- [ ] Data structure matches table schema
- [ ] All required fields are provided
- [ ] Data types are correct
- [ ] Foreign key references exist
- [ ] RLS policies allow the operation
- [ ] No constraint violations
- [ ] Network requests are successful
- [ ] Supabase logs show no errors
- [ ] Data can be read back after insertion

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)

Remember: Most data insertion issues are caused by authentication problems, RLS policy violations, or data validation errors. Start with these common causes before diving into more complex debugging.
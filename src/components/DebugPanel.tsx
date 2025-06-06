import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SupabaseDebugger } from '@/lib/supabaseDebug';

export const DebugPanel: React.FC = () => {
  const [isRunning, setIsRunning] = React.useState(false);
  const [results, setResults] = React.useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await SupabaseDebugger.runDiagnostic();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('Diagnostic failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Diagnostic...' : 'Run Supabase Diagnostic'}
        </Button>
        
        {results && (
          <div className="space-y-2">
            <h4 className="font-medium">Results:</h4>
            <div className="space-y-1 text-sm">
              <div className={`flex items-center ${results.connection ? 'text-green-600' : 'text-red-600'}`}>
                {results.connection ? '✅' : '❌'} Connection Test
              </div>
              <div className={`flex items-center ${results.insertion ? 'text-green-600' : 'text-red-600'}`}>
                {results.insertion ? '✅' : '❌'} Data Insertion Test
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          Check browser console for detailed logs
        </div>
      </CardContent>
    </Card>
  );
};
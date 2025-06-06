import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFinanceStore } from '@/store/financeStore';
import type { Database } from '@/lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserSettings = Database['public']['Tables']['user_settings']['Row'];

export function useAuth() {
  const [user, setUser] = useState(supabase.auth.getUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    setMonthlyIncomeTarget,
    setEmergencyFundGoal,
    setSavingAmount,
    setTotalSavings,
    theme,
  } = useFinanceStore();

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          // Get or create profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select()
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (!profile) {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
              });

            if (insertError) throw insertError;
          }

          // Get or create user settings
          const { data: settings, error: settingsError } = await supabase
            .from('user_settings')
            .select()
            .eq('user_id', session.user.id)
            .single();

          if (settingsError && settingsError.code !== 'PGRST116') {
            throw settingsError;
          }

          if (!settings) {
            const { error: insertError } = await supabase
              .from('user_settings')
              .insert({
                user_id: session.user.id,
                theme,
                total_savings: 0,
              });

            if (insertError) throw insertError;
          } else {
            // Update store with user settings
            setMonthlyIncomeTarget(settings.monthly_income_target);
            setEmergencyFundGoal(settings.emergency_fund_goal);
            setSavingAmount(settings.saving_amount);
            setTotalSavings(settings.total_savings);
          }

          setUser(session.user);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync settings changes to Supabase
  const syncSettings = async (settings: Partial<UserSettings>) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          ...settings,
        });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync settings');
    }
  };

  return {
    user,
    loading,
    error,
    syncSettings,
  };
}
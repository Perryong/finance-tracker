import { supabase } from './supabase';
import { toast } from '@/components/ui/use-toast';

export interface AuthError {
  message: string;
}

export interface AuthResponse {
  success: boolean;
  error?: AuthError;
}

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: { message: error.message } };
    }

    // Create initial profile and settings
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
      });

      await supabase.from('user_settings').insert({
        user_id: data.user.id,
        total_savings: 0,
        theme: 'light',
      });
    }

    toast({
      title: "Success",
      description: "Account created successfully! Please sign in.",
    });

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: { message: error.message } };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: { message: error.message } };
    }

    toast({
      title: "Success",
      description: "Signed in successfully!",
    });

    return { success: true };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: { message: error.message } };
  }
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
    return;
  }

  toast({
    title: "Success",
    description: "Signed out successfully!",
  });
}
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { UserSettings } from '@/types';

const LS_OURA_KEY = 'oura-token';

export interface OuraSettingsState {
  token: string;
  status: 'idle' | 'testing' | 'connected' | 'error';
  isLoading: boolean;
}

export function useOuraSettings() {
  const { user } = useAuth();
  const [state, setState] = useState<OuraSettingsState>({
    token: '',
    status: 'idle',
    isLoading: true,
  });

  const supabase = createClient();

  // Load token on mount: Supabase first, then localStorage fallback
  useEffect(() => {
    let mounted = true;

    const loadToken = async () => {
      // Always try localStorage first for immediate UI
      const localToken = typeof window !== 'undefined' ? localStorage.getItem(LS_OURA_KEY) || '' : '';
      if (mounted) {
        setState((s) => ({ ...s, token: localToken, isLoading: true }));
      }

      // If logged in, try to load from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('oura_token')
          .eq('user_id', user.id)
          .single();

        if (!error && data?.oura_token && mounted) {
          setState((s) => ({ ...s, token: data.oura_token, status: 'connected', isLoading: false }));
          // Sync localStorage too
          if (typeof window !== 'undefined') {
            localStorage.setItem(LS_OURA_KEY, data.oura_token);
          }
          return;
        }
      }

      if (mounted) {
        setState((s) => ({
          ...s,
          status: localToken ? 'connected' : 'idle',
          isLoading: false,
        }));
      }
    };

    loadToken();
    return () => { mounted = false; };
  }, [user, supabase]);

  // Save token to Supabase + localStorage
  const saveToken = useCallback(async (token: string) => {
    if (!token.trim()) return;

    setState((s) => ({ ...s, token, status: 'testing' }));

    // Test the connection first
    try {
      const res = await fetch(`/api/oura?token=${token}&date=${new Date().toISOString().split('T')[0]}`);
      if (!res.ok) throw new Error('Oura API test failed');
    } catch {
      setState((s) => ({ ...s, status: 'error' }));
      return;
    }

    // Save to localStorage (always)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_OURA_KEY, token);
    }

    // Save to Supabase if logged in
    if (user) {
      const { error } = await supabase
        .from('user_settings')
        .upsert(
          {
            user_id: user.id,
            oura_token: token,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Failed to save Oura token to Supabase:', error);
      }
    }

    setState((s) => ({ ...s, status: 'connected' }));
  }, [user, supabase]);

  // Remove token from Supabase + localStorage
  const removeToken = useCallback(async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_OURA_KEY);
    }

    if (user) {
      await supabase
        .from('user_settings')
        .update({ oura_token: null, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
    }

    setState({ token: '', status: 'idle', isLoading: false });
  }, [user, supabase]);

  return {
    token: state.token,
    status: state.status,
    isLoading: state.isLoading,
    saveToken,
    removeToken,
  };
}

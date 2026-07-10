'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isPro: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isPro: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { user: initialUser } } = await supabase.auth.getUser();
      setUser(initialUser);
      if (initialUser) {
        await loadProfile(initialUser.id);
      }
      setIsLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  const isPro = profile?.subscription_status === 'active' && 
    (profile?.subscription_tier === 'pro_monthly' || profile?.subscription_tier === 'pro_yearly');

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, isPro, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

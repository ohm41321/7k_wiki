'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/utils';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface Profile {
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    const getSessionAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile as Profile | null);
      }
      setLoading(false);
    };

    // Run once on mount
    getSessionAndProfile();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('username')
          .eq('id', session.user.id)
          .single();
        setProfile(userProfile as Profile | null);
      } else {
        setProfile(null); // Clear profile on logout
      }
      setLoading(false);
      
      // Refresh server-side components on sign-in/out
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { user, profile, loading };
}

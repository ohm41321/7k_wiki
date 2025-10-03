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
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          setUser(session.user);
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profileError) throw profileError;
          setProfile(userProfile as Profile | null);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Error getting session or profile:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    // Run once on mount
    getSessionAndProfile();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      try {
        if (session?.user) {
          setUser(session.user);
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profileError) throw profileError;
          setProfile(userProfile as Profile | null);
        } else {
          setUser(null);
          setProfile(null);
        }

        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          router.refresh();
        }
      } catch (error) {
        console.error('Error in auth state change handler:', error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { user, profile, loading };
}
import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, profile_image_url')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
      return;
    }

    setProfile(null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setUser(next?.user ?? null);
      if (next?.user) {
        loadProfile(next.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, [loadProfile]);

  const displayName =
    profile?.nickname ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    '테니스인';

  return {
    session,
    user,
    profile,
    displayName,
    loading,
    isAuthenticated: !!session,
    refreshProfile: user ? () => loadProfile(user.id) : undefined,
  };
}

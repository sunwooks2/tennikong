import { supabase } from '@/lib/supabase';

type UserEventType = 'screen_view' | 'button_tap';

let currentUserId: string | null = null;

supabase.auth.getSession().then(({ data }) => {
  currentUserId = data.session?.user.id ?? null;
});

supabase.auth.onAuthStateChange((_event, session) => {
  currentUserId = session?.user.id ?? null;
});

export function logEvent(eventType: UserEventType, name: string, meta?: Record<string, unknown>) {
  if (!currentUserId) return;

  supabase
    .from('user_events')
    .insert({ user_id: currentUserId, event_type: eventType, name, meta: meta ?? null })
    .then(
      () => {},
      () => {},
    );
}

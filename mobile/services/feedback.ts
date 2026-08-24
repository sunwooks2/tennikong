import { supabase } from '@/lib/supabase';

export type FeedbackCategory = 'feature' | 'bug' | 'other';

export interface SubmitFeedbackInput {
  userId: string;
  category: FeedbackCategory;
  content: string;
  contact?: string;
}

export async function submitFeedback(input: SubmitFeedbackInput) {
  const content = input.content.trim();
  const contact = input.contact?.trim() || null;

  const { error } = await supabase.from('feedback').insert({
    user_id: input.userId,
    category: input.category,
    content,
    contact,
  });

  if (error) throw new Error(error.message);

  // 카카오톡 알림은 부가 기능 — 실패해도 개선제안 저장 자체는 이미 끝났으므로 무시한다.
  try {
    await supabase.functions.invoke('send-feedback-kakao', {
      body: { category: input.category, content, contact: contact ?? undefined },
    });
  } catch {
    // ignore
  }
}

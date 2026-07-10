import { supabase } from '@/lib/supabase';
import type {
  CourtType,
  Match,
  MatchResult,
  MatchSet,
  MatchType,
  MonthlySummary,
  PositionType,
} from '@/types/database';
import { calculateMatchResult } from '@/utils/matchResult';
import { getMonthRange } from '@/utils/date';

const MATCH_LIST_SELECT = `
  id,
  match_date,
  match_type,
  result,
  my_name,
  partner_name,
  opponent1_name,
  opponent2_name,
  created_at,
  match_sets (set_number, my_score, opponent_score)
`;

export interface CreateMatchPayload {
  match_date: string;
  match_type: MatchType;
  court_type: CourtType;
  venue_name?: string;
  my_name: string;
  partner_name?: string;
  opponent1_name: string;
  opponent2_name?: string;
  position?: PositionType | null;
  memo?: string;
  sets: MatchSet[];
  tags: string[];
}

export async function fetchMatchesForMonth(year: number, month: number) {
  const { start, end } = getMonthRange(year, month);

  return supabase
    .from('matches')
    .select(MATCH_LIST_SELECT)
    .gte('match_date', start)
    .lte('match_date', end)
    .is('deleted_at', null)
    .order('match_date', { ascending: true })
    .order('created_at', { ascending: true });
}

export function computeMonthlySummary(
  year: number,
  month: number,
  matches: Match[],
): MonthlySummary {
  const wins = matches.filter((m) => m.result === 'win').length;
  const total = matches.length;

  return {
    year,
    month,
    total,
    wins,
    losses: total - wins,
    win_rate: total > 0 ? Math.round((wins / total) * 100) : 0,
  };
}

export function getDatesWithMatches(matches: Match[]): Set<string> {
  return new Set(matches.map((m) => m.match_date));
}

export function getMatchesForDate(matches: Match[], dateKey: string): Match[] {
  return matches.filter((m) => m.match_date === dateKey);
}

export async function fetchVenueSuggestions(query: string) {
  const q = query.trim();
  let builder = supabase
    .from('venue_aliases')
    .select('name')
    .order('use_count', { ascending: false })
    .limit(8);

  if (q.length > 0) {
    builder = builder.ilike('name', `%${q}%`);
  }

  return builder;
}

export async function fetchPlayerSuggestions(query: string) {
  const q = query.trim();
  let builder = supabase
    .from('player_aliases')
    .select('name')
    .order('use_count', { ascending: false })
    .limit(8);

  if (q.length > 0) {
    builder = builder.ilike('name', `%${q}%`);
  }

  return builder;
}

async function upsertVenueAlias(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const { data: existing } = await supabase
    .from('venue_aliases')
    .select('id, use_count')
    .eq('user_id', userId)
    .eq('name', trimmed)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('venue_aliases')
      .update({ use_count: existing.use_count + 1 })
      .eq('id', existing.id);
    return;
  }

  await supabase.from('venue_aliases').insert({
    user_id: userId,
    name: trimmed,
    use_count: 1,
  });
}

async function upsertPlayerAlias(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const { data: existing } = await supabase
    .from('player_aliases')
    .select('id, use_count')
    .eq('user_id', userId)
    .eq('name', trimmed)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('player_aliases')
      .update({ use_count: existing.use_count + 1 })
      .eq('id', existing.id);
    return;
  }

  await supabase.from('player_aliases').insert({
    user_id: userId,
    name: trimmed,
    use_count: 1,
  });
}

export async function createMatch(userId: string, payload: CreateMatchPayload) {
  const result: MatchResult | null = calculateMatchResult(payload.sets);
  if (!result) {
    throw new Error('승패를 결정할 수 없습니다. 세트 점수를 확인해 주세요.');
  }

  const { data: match, error } = await supabase
    .from('matches')
    .insert({
      user_id: userId,
      match_date: payload.match_date,
      match_type: payload.match_type,
      court_type: payload.court_type,
      venue_name: payload.venue_name?.trim() || null,
      my_name: payload.my_name.trim(),
      partner_name: payload.partner_name?.trim() || null,
      opponent1_name: payload.opponent1_name.trim(),
      opponent2_name: payload.opponent2_name?.trim() || null,
      position: payload.position ?? null,
      result,
      memo: payload.memo?.trim() || null,
      match_sets: payload.sets.map((set) => ({
        set_number: set.set_number,
        my_score: set.my_score,
        opponent_score: set.opponent_score,
      })),
      match_tags: payload.tags.map((tag) => ({ tag_name: tag })),
    })
    .select('id')
    .single();

  if (error) throw error;

  const aliasNames = [
    payload.venue_name,
    payload.my_name,
    payload.partner_name,
    payload.opponent1_name,
    payload.opponent2_name,
  ].filter((name): name is string => !!name?.trim());

  await Promise.all([
    payload.venue_name ? upsertVenueAlias(userId, payload.venue_name) : Promise.resolve(),
    ...aliasNames
      .filter((name) => name !== payload.venue_name)
      .map((name) => upsertPlayerAlias(userId, name)),
  ]);

  return match;
}

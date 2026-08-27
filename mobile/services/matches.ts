import { supabase } from '@/lib/supabase';
import type {
  CourtType,
  Match,
  MatchType,
  MonthlySummary,
} from '@/types/database';
import { getMonthRange } from '@/utils/date';
import { sortRegistrationMatches } from '@/utils/matchDisplay';
import { getMatchGames } from '@/utils/matchNormalize';
import type { ParsedMatchEntry } from '@/utils/matchForm';
import { deriveMatchParticipants, deriveMyPosition, isGuestPlaceholderName } from '@/utils/matchForm';

const MATCH_LIST_SELECT = `
  id,
  match_date,
  match_type,
  court_type,
  result,
  my_name,
  partner_name,
  opponent1_name,
  opponent2_name,
  our_fore_name,
  our_back_name,
  opponent_fore_name,
  opponent_back_name,
  position,
  my_score,
  opponent_score,
  venue_name,
  memo,
  registration_id,
  registration_order,
  created_at,
  match_games (game_number, result, my_score, opponent_score)
`;

const MATCH_DETAIL_SELECT = `
  id,
  user_id,
  match_date,
  match_type,
  court_type,
  venue_name,
  my_name,
  partner_name,
  opponent1_name,
  opponent2_name,
  position,
  our_fore_name,
  our_back_name,
  opponent_fore_name,
  opponent_back_name,
  result,
  my_score,
  opponent_score,
  memo,
  registration_id,
  registration_order,
  created_at,
  updated_at,
  match_games (game_number, result, my_score, opponent_score)
`;

export interface CreateMatchesPayload {
  match_date: string;
  court_type: CourtType;
  venue_name?: string;
  memo?: string;
  entries: ParsedMatchEntry[];
}

export interface UpdateMatchPayload {
  match_date: string;
  court_type: CourtType;
  venue_name?: string;
  memo?: string;
  entry: ParsedMatchEntry;
  registration_order?: number;
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

export async function hasAnyMatches(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

export async function fetchMostFrequentMatchType(userId: string): Promise<MatchType | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('match_type')
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return null;

  const counts = new Map<MatchType, number>();
  for (const row of data as { match_type: MatchType }[]) {
    counts.set(row.match_type, (counts.get(row.match_type) ?? 0) + 1);
  }

  let topType: MatchType | null = null;
  let topCount = 0;
  for (const [type, count] of counts) {
    if (count > topCount) {
      topType = type;
      topCount = count;
    }
  }

  return topType;
}

export async function fetchAllMatches() {
  return supabase
    .from('matches')
    .select(MATCH_LIST_SELECT)
    .is('deleted_at', null)
    .order('match_date', { ascending: false })
    .order('created_at', { ascending: false });
}

export function computeMonthlySummary(
  year: number,
  month: number,
  matches: Match[],
): MonthlySummary {
  const games = matches.flatMap((match) => getMatchGames(match));
  const wins = games.filter((game) => game.result === 'win').length;
  const losses = games.filter((game) => game.result === 'loss').length;
  const draws = games.filter((game) => game.result === 'draw').length;
  const total = games.length;
  const daysPlayed = new Set(matches.map((match) => match.match_date)).size;

  return {
    year,
    month,
    days_played: daysPlayed,
    total,
    wins,
    losses,
    draws,
    win_rate: total > 0 ? Math.round((wins / total) * 100) : 0,
  };
}

export function getDatesWithMatches(matches: Match[]): Set<string> {
  return new Set(matches.map((m) => m.match_date));
}

export function getMatchCountByDate(matches: Match[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const match of matches) {
    counts.set(match.match_date, (counts.get(match.match_date) ?? 0) + 1);
  }

  return counts;
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

function collectAliasNames(
  venueName: string | undefined,
  entries: ParsedMatchEntry[],
): string[] {
  const names = new Set<string>();

  if (venueName?.trim()) names.add(venueName.trim());

  for (const entry of entries) {
    names.add(entry.roster.player1);
    names.add(entry.roster.player2);
    names.add(entry.roster.player3);
    names.add(entry.roster.player4);
    for (const extra of entry.roster.extraPlayers) names.add(extra);
    names.add(entry.our_fore);
    names.add(entry.our_back);
    names.add(entry.opponent_fore);
    names.add(entry.opponent_back);
  }

  return [...names];
}

async function upsertAliases(
  userId: string,
  venueName: string | undefined,
  entries: ParsedMatchEntry[],
) {
  const names = collectAliasNames(venueName, entries);

  await Promise.all([
    venueName?.trim() ? upsertVenueAlias(userId, venueName) : Promise.resolve(),
    ...names
      .filter((name) => name !== venueName?.trim())
      .filter((name) => !isGuestPlaceholderName(name))
      .map((name) => upsertPlayerAlias(userId, name)),
  ]);
}

function buildMatchRow(userId: string, payload: CreateMatchesPayload, entry: ParsedMatchEntry) {
  const { roster } = entry;
  const participants = deriveMatchParticipants(roster, entry);

  return {
    user_id: userId,
    match_date: payload.match_date,
    match_type: entry.match_type,
    court_type: payload.court_type,
    venue_name: payload.venue_name?.trim() || null,
    my_name: participants.my_name,
    partner_name: participants.partner_name,
    opponent1_name: participants.opponent1_name,
    opponent2_name: participants.opponent2_name,
    our_fore_name: entry.our_fore,
    our_back_name: entry.our_back,
    opponent_fore_name: entry.opponent_fore,
    opponent_back_name: entry.opponent_back,
    position: deriveMyPosition(roster, entry.our_fore, entry.our_back),
    my_score: entry.my_score,
    opponent_score: entry.opponent_score,
    result: entry.result,
    memo: payload.memo?.trim() || null,
  };
}

export async function createMatches(
  userId: string,
  payload: CreateMatchesPayload,
  options?: { registrationId?: string; batchCreatedAt?: string; startOrder?: number },
) {
  const createdIds: string[] = [];
  const registrationId = options?.registrationId ?? crypto.randomUUID();
  const batchCreatedAt = options?.batchCreatedAt ?? new Date().toISOString();
  const batchBaseTime = new Date(batchCreatedAt).getTime();
  const startOrder = options?.startOrder ?? 0;

  try {
    for (let index = 0; index < payload.entries.length; index += 1) {
      const entry = payload.entries[index];
      const { data: match, error } = await supabase
        .from('matches')
        .insert({
          ...buildMatchRow(userId, payload, entry),
          registration_id: registrationId,
          registration_order: startOrder + index + 1,
          created_at: new Date(batchBaseTime + startOrder + index).toISOString(),
        })
        .select('id')
        .single();

      if (error) throw error;
      createdIds.push(match.id);
    }

    await upsertAliases(userId, payload.venue_name, payload.entries);
    return createdIds;
  } catch (error) {
    if (createdIds.length > 0) {
      await supabase.from('matches').delete().in('id', createdIds);
    }
    throw error;
  }
}

export async function fetchMatchById(id: string) {
  return supabase
    .from('matches')
    .select(MATCH_DETAIL_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .single();
}

export async function fetchRegistrationMatches(matchId: string): Promise<Match[]> {
  const { data: primary, error } = await fetchMatchById(matchId);

  if (error) {
    throw new Error(error.message);
  }

  if (!primary) {
    throw new Error('경기를 찾을 수 없습니다.');
  }

  const primaryMatch = primary as Match;

  if (!primaryMatch.registration_id) {
    return [primaryMatch];
  }

  const { data: registrationMatches, error: regError } = await supabase
    .from('matches')
    .select(MATCH_DETAIL_SELECT)
    .eq('user_id', primaryMatch.user_id)
    .eq('registration_id', primaryMatch.registration_id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (regError) {
    throw new Error(regError.message);
  }

  return sortRegistrationMatches(((registrationMatches as Match[]) ?? []).length > 0
    ? (registrationMatches as Match[])
    : [primaryMatch]);
}

async function ensureRegistrationId(
  matchIds: string[],
  registrationId: string | null,
): Promise<string> {
  const activeRegistrationId = registrationId ?? crypto.randomUUID();

  if (matchIds.length === 0) {
    return activeRegistrationId;
  }

  const { error } = await supabase
    .from('matches')
    .update({ registration_id: activeRegistrationId })
    .in('id', matchIds);

  if (error) {
    throw new Error(error.message);
  }

  return activeRegistrationId;
}

export async function deleteRegistration(matches: Match[]) {
  for (const match of matches) {
    await deleteMatch(match.id);
  }
}

export async function updateRegistration(
  userId: string,
  matchIds: string[],
  registrationId: string | null,
  payload: CreateMatchesPayload,
) {
  const { entries, ...shared } = payload;
  const activeRegistrationId = await ensureRegistrationId(matchIds, registrationId);

  for (let i = 0; i < entries.length; i += 1) {
    if (i < matchIds.length) {
      await updateMatch(matchIds[i], {
        ...shared,
        entry: entries[i],
        registration_order: i + 1,
      });
      continue;
    }

    await createMatches(
      userId,
      { ...shared, entries: [entries[i]] },
      {
        registrationId: activeRegistrationId,
        startOrder: i,
      },
    );
  }

  for (let i = entries.length; i < matchIds.length; i += 1) {
    await deleteMatch(matchIds[i]);
  }

  await upsertAliases(userId, payload.venue_name, entries);
}

export async function deleteMatch(id: string) {
  const { error: rpcError } = await supabase.rpc('soft_delete_match', { match_id: id });

  if (!rpcError) return;

  // RPC 미배포 시 fallback (UPDATE 후 select 없이 처리)
  const deletedAt = new Date().toISOString();
  const { error } = await supabase
    .from('matches')
    .update({ deleted_at: deletedAt })
    .eq('id', id)
    .is('deleted_at', null);

  if (error) {
    throw new Error(rpcError.message || error.message || '경기 삭제 중 오류가 발생했습니다.');
  }

  const { data, error: verifyError } = await supabase
    .from('matches')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (verifyError) {
    throw new Error(verifyError.message);
  }

  if (data) {
    throw new Error('경기를 삭제할 수 없습니다. Supabase에서 008, 009 마이그레이션을 실행해 주세요.');
  }
}

export async function updateMatch(matchId: string, payload: UpdateMatchPayload) {
  const { entry } = payload;
  const { roster } = entry;
  const participants = deriveMatchParticipants(roster, entry);

  const { error } = await supabase
    .from('matches')
    .update({
      match_date: payload.match_date,
      match_type: entry.match_type,
      court_type: payload.court_type,
      venue_name: payload.venue_name?.trim() || null,
      my_name: participants.my_name,
      partner_name: participants.partner_name,
      opponent1_name: participants.opponent1_name,
      opponent2_name: participants.opponent2_name,
      our_fore_name: entry.our_fore,
      our_back_name: entry.our_back,
      opponent_fore_name: entry.opponent_fore,
      opponent_back_name: entry.opponent_back,
      position: deriveMyPosition(roster, entry.our_fore, entry.our_back),
      my_score: entry.my_score,
      opponent_score: entry.opponent_score,
      result: entry.result,
      memo: payload.memo?.trim() || null,
      ...(payload.registration_order != null
        ? { registration_order: payload.registration_order }
        : {}),
    })
    .eq('id', matchId);

  if (error) throw error;

  await supabase.from('match_games').delete().eq('match_id', matchId);

  return { id: matchId };
}

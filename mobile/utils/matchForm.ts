import type { MatchType } from '@/types/database';
import { calculateGameResult } from '@/utils/matchResult';

export const MY_ROSTER_LABEL = '나';

export interface PlayerRoster {
  player1: string;
  player2: string;
  player3: string;
  player4: string;
}

export const ROSTER_KEYS: (keyof PlayerRoster)[] = [
  'player1',
  'player2',
  'player3',
  'player4',
];

const ROSTER_SLOT_DEFAULTS: Record<keyof PlayerRoster, string | null> = {
  player1: null,
  player2: '선수1',
  player3: '선수2',
  player4: '선수3',
};

export const GUEST_ROSTER_NAMES = ['선수1', '선수2', '선수3'] as const;

export function isGuestPlaceholderName(name: string): boolean {
  const trimmed = name.trim();
  return /^선수\d+$/.test(trimmed);
}

export interface MatchEntryInput {
  entry_number: number;
  our_fore: string;
  our_back: string;
  opponent_fore: string;
  opponent_back: string;
  my_score: string;
  opponent_score: string;
}

export interface ParsedMatchEntry {
  roster: PlayerRoster;
  our_fore: string;
  our_back: string;
  opponent_fore: string;
  opponent_back: string;
  my_score: number;
  opponent_score: number;
  result: ReturnType<typeof calculateGameResult>;
}

export function createDefaultRoster(defaultMyName: string): PlayerRoster {
  return {
    player1: defaultMyName,
    player2: '',
    player3: '',
    player4: '',
  };
}

export function getRosterSlotDisplayName(
  roster: PlayerRoster,
  key: keyof PlayerRoster,
): string {
  if (key === 'player1') {
    return roster.player1.trim() ? MY_ROSTER_LABEL : '';
  }
  const value = roster[key].trim();
  if (value) return value;
  return ROSTER_SLOT_DEFAULTS[key] ?? '';
}

export function toLineupDisplayName(
  rosterName: string | null | undefined,
  myName: string,
  emptyFallback = '',
): string {
  const name = rosterName?.trim() ?? '';
  if (!name) return emptyFallback;
  return name === myName.trim() ? MY_ROSTER_LABEL : name;
}

export function resolveLineupName(roster: PlayerRoster, selected: string): string {
  const trimmed = selected.trim();
  if (!trimmed) return '';

  const resolved = resolveRosterForSave(roster);

  if (trimmed === MY_ROSTER_LABEL) {
    return resolved.player1;
  }

  for (const key of ROSTER_KEYS) {
    if (getRosterSlotDisplayName(roster, key) === trimmed) {
      return resolved[key];
    }
  }

  return trimmed;
}

export function getSelectableRosterOptions(
  roster: PlayerRoster,
  excluded: string[] = [],
): string[] {
  const excludedSet = new Set(excluded.map((name) => name.trim()).filter(Boolean));
  return ROSTER_KEYS.map((key) => getRosterSlotDisplayName(roster, key))
    .filter((name) => name.length > 0 && !excludedSet.has(name));
}

export function resolveRosterForSave(
  roster: PlayerRoster,
  options?: { defaultMyName?: string },
): PlayerRoster {
  return {
    player1: roster.player1.trim() || options?.defaultMyName?.trim() || '나',
    player2: roster.player2.trim() || '선수1',
    player3: roster.player3.trim() || '선수2',
    player4: roster.player4.trim() || '선수3',
  };
}

/** @deprecated use getSelectableRosterOptions */
export function getRosterNames(roster: PlayerRoster | string[]): string[] {
  if (Array.isArray(roster)) return roster.filter((name) => name.trim().length > 0);
  return getSelectableRosterOptions(roster);
}

export function createEmptyEntry(entryNumber: number): MatchEntryInput {
  return {
    entry_number: entryNumber,
    our_fore: '',
    our_back: '',
    opponent_fore: '',
    opponent_back: '',
    my_score: '',
    opponent_score: '',
  };
}

function parseScore(value: string): number {
  return Number.parseInt(value.trim(), 10);
}

export function parseEntries(
  roster: PlayerRoster,
  inputs: MatchEntryInput[],
  defaultMyName?: string,
): ParsedMatchEntry[] {
  const resolvedRoster = resolveRosterForSave(roster, { defaultMyName });

  return inputs.map((entry) => {
    const myScore = parseScore(entry.my_score);
    const opponentScore = parseScore(entry.opponent_score);

    return {
      roster: resolvedRoster,
      our_fore: resolveLineupName(roster, entry.our_fore),
      our_back: resolveLineupName(roster, entry.our_back),
      opponent_fore: resolveLineupName(roster, entry.opponent_fore),
      opponent_back: resolveLineupName(roster, entry.opponent_back),
      my_score: myScore,
      opponent_score: opponentScore,
      result: calculateGameResult(myScore, opponentScore),
    };
  });
}

function hasDuplicateLineup(roster: PlayerRoster, entry: MatchEntryInput): boolean {
  const slots = [
    resolveLineupName(roster, entry.our_fore),
    resolveLineupName(roster, entry.our_back),
    resolveLineupName(roster, entry.opponent_fore),
    resolveLineupName(roster, entry.opponent_back),
  ].filter(Boolean);

  return new Set(slots).size !== slots.length;
}

export function validateMatchForm(params: {
  match_date: string;
  memo: string;
  roster: PlayerRoster;
  entryInputs: MatchEntryInput[];
}): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.match_date)) {
    return '경기일 형식이 올바르지 않습니다. (YYYY-MM-DD)';
  }

  if (params.memo.length > 200) return '메모는 200자 이하여야 합니다.';

  const allowedOptions = new Set(
    ROSTER_KEYS.map((key) => getRosterSlotDisplayName(params.roster, key)).filter(Boolean),
  );

  if (params.entryInputs.length === 0) return '최소 1경기를 입력해 주세요.';

  for (const [index, entry] of params.entryInputs.entries()) {
    const label = `경기 ${index + 1}`;

    if (!entry.our_fore.trim()) return `${label}의 우리 포를 선택해 주세요.`;
    if (!entry.our_back.trim()) return `${label}의 우리 백을 선택해 주세요.`;
    if (!entry.opponent_fore.trim()) return `${label}의 상대 포를 선택해 주세요.`;
    if (!entry.opponent_back.trim()) return `${label}의 상대 백을 선택해 주세요.`;

    if (hasDuplicateLineup(params.roster, entry)) {
      return `${label}에서 같은 선수를 중복 선택할 수 없습니다.`;
    }

    for (const slot of [
      entry.our_fore,
      entry.our_back,
      entry.opponent_fore,
      entry.opponent_back,
    ]) {
      if (!allowedOptions.has(slot.trim())) {
        return `${label}의 선수는 상단 4명 중에서 선택해 주세요.`;
      }
    }

    const hasMyScore = entry.my_score.trim().length > 0;
    const hasOppScore = entry.opponent_score.trim().length > 0;

    if (!hasMyScore || !hasOppScore) {
      return `${label}의 우리/상대 점수를 입력해 주세요.`;
    }

    const my = parseScore(entry.my_score);
    const opp = parseScore(entry.opponent_score);
    if (Number.isNaN(my) || Number.isNaN(opp)) {
      return `${label}의 점수가 올바르지 않습니다.`;
    }
    if (my < 0 || opp < 0) {
      return `${label}의 점수는 0 이상이어야 합니다.`;
    }
  }

  return null;
}

export function normalizeTag(raw: string): string {
  return raw.trim().replace(/^#+/, '');
}

export function deriveMyPosition(
  roster: PlayerRoster,
  ourFore: string,
  ourBack: string,
): 'fore' | 'back' | null {
  const resolved = resolveRosterForSave(roster);
  const me = resolved.player1;
  const fore = resolveLineupName(roster, ourFore);
  const back = resolveLineupName(roster, ourBack);

  if (fore === me || ourFore === MY_ROSTER_LABEL) return 'fore';
  if (back === me || ourBack === MY_ROSTER_LABEL) return 'back';
  return null;
}

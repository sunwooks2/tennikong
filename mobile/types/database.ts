export type MatchType =
  | 'mens_doubles'
  | 'womens_doubles'
  | 'mixed'
  | 'doubles'
  | 'singles';

export type CourtType = 'hard' | 'clay' | 'artificial_grass' | 'indoor' | 'other';
export type PositionType = 'fore' | 'back';
export type MatchResult = 'win' | 'loss';

export interface MatchSet {
  set_number: number;
  my_score: number;
  opponent_score: number;
}

export interface Match {
  id: string;
  user_id: string;
  match_date: string;
  match_type: MatchType;
  court_type: CourtType;
  venue_name: string | null;
  my_name: string;
  partner_name: string | null;
  opponent1_name: string;
  opponent2_name: string | null;
  position: PositionType | null;
  result: MatchResult;
  memo: string | null;
  created_at: string;
  updated_at: string;
  match_sets?: MatchSet[];
  match_tags?: { tag_name: string }[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  total: number;
  wins: number;
  losses: number;
  win_rate: number;
}

export interface Profile {
  id: string;
  nickname: string;
  profile_image_url: string | null;
}

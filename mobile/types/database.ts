export type MatchType =
  | 'mens_doubles'
  | 'womens_doubles'
  | 'mixed'
  | 'doubles'
  | 'singles';

export type CourtType = 'hard' | 'clay' | 'artificial_grass' | 'indoor' | 'other';
export type PositionType = 'fore' | 'back';
export type MatchResult = 'win' | 'loss' | 'draw';

export interface MatchGame {
  game_number: number;
  result: MatchResult;
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
  our_fore_name: string | null;
  our_back_name: string | null;
  opponent_fore_name: string | null;
  opponent_back_name: string | null;
  result: MatchResult;
  my_score: number | null;
  opponent_score: number | null;
  memo: string | null;
  registration_id: string | null;
  registration_order: number | null;
  created_at: string;
  updated_at: string;
  match_games?: MatchGame[];
  match_tags?: { tag_name: string }[];
}

export interface MonthlySummary {
  year: number;
  month: number;
  days_played: number;
  total: number;
  wins: number;
  losses: number;
  draws: number;
  win_rate: number;
}

export interface Profile {
  id: string;
  nickname: string;
  profile_image_url: string | null;
}

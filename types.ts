
export interface Player {
  name: string;
  class?: string; // e.g., "Warrior", "Mage"
  avatarUrl?: string;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface Sponsor {
  name: string;
  amount?: string;
  message?: string;
}

export interface Tournament {
  id: string;
  season: string;
  title: string;
  subtitle: string;
  status: 'upcoming' | 'active' | 'completed';
  date: string;
  posterUrl: string;
  format: string; // e.g., "3:3 Team Match", "2:2 Duo"
  prizePool: string;
  winner?: Team;
  runnerUp?: Team;
  sponsors: Sponsor[];
  description: string;
  videoUrls?: string[];
}

export enum ViewState {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  ABOUT = 'ABOUT',
  HALL_OF_FAME = 'HALL_OF_FAME',
}

export interface HallOfFameSponsor {
  name: string;
  title: string;
  imageUrl?: string;
}

export interface StaffMember {
  name: string;
  role: string;
  imageUrl?: string;
}

export interface BGMTrack {
  title: string;
  url: string;
}
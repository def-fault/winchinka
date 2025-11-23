
export interface Player {
  name: string;
  class?: string; // e.g., "Warrior", "Mage"
  avatarUrl?: string;
}

export interface TournamentParticipantTeam {
  name: string;
  members: (Player & { role?: string })[];
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
  participants?: TournamentParticipantTeam[];
  description: string;
  videoUrls?: string[];
}

export enum ViewState {
  LIST = 'LIST',
  DETAIL = 'DETAIL',
  ABOUT = 'ABOUT',
  HALL_OF_FAME = 'HALL_OF_FAME',
  GALLERY = 'GALLERY',
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

export interface GalleryItem {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  description?: string;
  date?: string;
}

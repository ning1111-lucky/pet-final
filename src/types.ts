export type Genre = "Pop" | "Hip-hop" | "Hiphop" | "K-pop" | "Kpop" | "EDM" | "Classical" | "Jazz" | "R&B" | "RnB" | "Country" | "Rock" | "Taiwan Indie" | "Indie" | "Mixed" | "Hidden";
export type MusicProvider = "mock" | "spotify" | "lastfm";

export type ItemPart = "clothes" | "headwear" | "accessory" | "handheld" | "shoes" | "enhance" | "final weekly pet";

export interface UserProfile {
  name: string;
  email: string;
  country: string;
  city: string;
  style?: string;
  musicProvider?: MusicProvider;
  lastfmUsername?: string;
  agreed: boolean;
}

export interface MusicItem {
  id: string; // Unique ID for this generated item
  day: number;
  part: ItemPart;
  genre: Genre;
  label: string;
  icon: string; // Emoji or identifier for CSS placeholder
  imageSrc?: string | null;
}

export interface Pet {
  id: string;
  name: string;
  mainGenre: Genre;
  subGenre: Genre;
  baseType: "O" | "G" | "B";
  items: MusicItem[];
  description: string;
  weekNumber: number;
}

export interface MapEntry {
  id: string;
  petId: string;
  ownerName: string;
  country: string;
  city: string;
  top: number;
  left: number;
  pet: Pet;
  petImage?: string | null;
  petName?: string;
  mainGenre?: Genre;
  secondGenre?: Genre;
  items?: MusicItem[];
  provider?: string | null;
}

export interface DailyMusicData {
  songCount: number;
  mainGenre: Genre;
  subGenre: Genre;
  assetGenre?: Genre;
  distribution: { genre: Genre; percentage: number }[];
  quote: string;
}

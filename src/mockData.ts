import { DailyMusicData, Genre, ItemPart, MapEntry, Pet, MusicItem, MusicProvider } from "./types";
import { generateId } from "./utils";

export const MUSIC_PROVIDER: MusicProvider = "mock";

export const GENRES: Genre[] = [
  "Pop", "Hiphop", "Kpop", "EDM", "Classical",
  "Jazz", "RnB", "Country", "Rock", "Indie"
];

export const TOTAL_DAYS = 3;

export type DaySlotConfig = {
  part: ItemPart;
  genreSource: "main" | "secondary";
  title: string;
};

export const COLLECTION_ITEM_PARTS: ItemPart[] = [
  "clothes",
  "shoes",
  "headwear",
  "handheld",
  "accessory",
];

export const DAY_SLOT_CONFIGS: Record<number, DaySlotConfig[]> = {
  1: [
    { part: "clothes", genreSource: "main", title: "主風格服裝" },
    { part: "shoes", genreSource: "secondary", title: "次風格鞋子" },
  ],
  2: [
    { part: "headwear", genreSource: "main", title: "主風格頭飾" },
    { part: "handheld", genreSource: "secondary", title: "次風格手持物" },
  ],
  3: [
    { part: "accessory", genreSource: "main", title: "主風格配件（融合特效）" },
  ],
};

export const getDaySlotConfigs = (day: number): DaySlotConfig[] => {
  if (day < 1 || day > TOTAL_DAYS) {
    return DAY_SLOT_CONFIGS[TOTAL_DAYS];
  }
  return DAY_SLOT_CONFIGS[day];
};

export const getDailyPart = (day: number): ItemPart => getDaySlotConfigs(day)[0]?.part || "accessory";

export const getCollectionSlotIndex = (part: ItemPart): number => COLLECTION_ITEM_PARTS.indexOf(part);

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function generateRandomMusicDistribution(): { genre: Genre, percentage: number }[] {
  const selected = shuffleArray(GENRES).slice(0, Math.floor(Math.random() * 4) + 3);
  const weights = selected.map(() => Math.random());
  const total = weights.reduce((a, b) => a + b, 0);

  return selected
    .map((genre, index) => ({
      genre, // casting back to Genre
      percentage: Math.round((weights[index] / total) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

// mock generator
async function getMockTodayMusicData(): Promise<DailyMusicData> {
  const distribution = generateRandomMusicDistribution();
  const topGenre = distribution[0].genre;
  const secondGenre = distribution[1]?.genre || topGenre;
  
  let mainGenreStr: string = topGenre;
  
  if (distribution[0].percentage < 45 && (distribution[0].percentage + distribution[1].percentage) >= 65) {
     mainGenreStr = "Mixed";
  } else if (distribution[0].percentage < 35 && distribution.length >= 4) {
     mainGenreStr = "Hidden";
  }

  // but for asset finding, we need a valid mapped genre. Mixed/Hidden are pseudo-genres, 
  // we fallback to topGenre when strictly assigning the true asset genre later or here.
  const assetGenre = topGenre;

  return {
    songCount: Math.floor(Math.random() * 50) + 10,
    mainGenre: mainGenreStr as Genre,
    subGenre: secondGenre,
    assetGenre: assetGenre,
    distribution: distribution,
    quote: `充滿 ${assetGenre} 氛圍的一天。`
  };
}

export async function getSpotifyTodayMusicData(): Promise<DailyMusicData> {
  const response = await fetch("/api/music/today?provider=spotify", {
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.ok !== true || !body?.data) {
    const error = typeof body?.error === "string" ? body.error : "Spotify 資料讀取失敗。";
    const enrichedError = new Error(error) as Error & { code?: string };
    if (typeof body?.code === "string") {
      enrichedError.code = body.code;
    }
    throw enrichedError;
  }

  return body.data as DailyMusicData;
}

export async function getLastFmTodayMusicData(lastfmUsername?: string): Promise<DailyMusicData> {
  const query = new URLSearchParams({ provider: "lastfm" });
  if (lastfmUsername) {
    query.set("lastfmUsername", lastfmUsername);
  }

  const response = await fetch(`/api/music/today?${query.toString()}`, {
    credentials: "include",
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.ok !== true || !body?.data) {
    const error = typeof body?.error === "string" ? body.error : "Last.fm 資料讀取失敗。";
    const enrichedError = new Error(error) as Error & { code?: string };
    if (typeof body?.code === "string") {
      enrichedError.code = body.code;
    }
    throw enrichedError;
  }

  return body.data as DailyMusicData;
}

export const getTodayMusicData = async (
  provider: MusicProvider = MUSIC_PROVIDER,
  options: { lastfmUsername?: string } = {}
): Promise<DailyMusicData> => {
  if (provider === "mock") return getMockTodayMusicData();
  if (provider === "spotify") return getSpotifyTodayMusicData();
  if (provider === "lastfm") return getLastFmTodayMusicData(options.lastfmUsername);
  return getMockTodayMusicData();
};

export const getBaseType = (genre: Genre): "O" | "G" | "B" => {
  if (["Pop", "K-pop", "R&B", "Hidden", "Mixed"].includes(genre)) return "O";
  if (["Classical", "Jazz", "Taiwan Indie"].includes(genre)) return "G";
  return "B"; // Hip-hop, EDM, Country, Rock
};

const mockItemData = (id: string, name: string, genre: Genre): MusicItem => ({
  id,
  day: 1,
  part: "clothes",
  genre,
  label: "Mock Item",
  icon: "✨"
});

const mockPetData = (id: string, name: string, mainGenre: Genre, baseType: "O" | "G" | "B"): Pet => ({
  id,
  name,
  mainGenre,
  subGenre: "Pop",
  baseType,
  items: [],
  description: "一隻來自遠方的神奇寵物。",
  weekNumber: 1
});

export const MOCK_MAP_ENTRIES: MapEntry[] = [
  { id: "1", petId: "p1", ownerName: "Alice", country: "Taiwan", city: "Taipei", top: 54, left: 72, pet: mockPetData("p1", "古典小茶", "Classical", "G") },
  { id: "2", petId: "p2", ownerName: "Ken", country: "Japan", city: "Tokyo", top: 45, left: 78, pet: mockPetData("p2", "電子小光", "EDM", "B") },
  { id: "3", petId: "p3", ownerName: "Min", country: "South Korea", city: "Seoul", top: 43, left: 74, pet: mockPetData("p3", "韓流小棉", "K-pop", "O") },
  { id: "4", petId: "p4", ownerName: "John", country: "USA", city: "New York", top: 42, left: 24, pet: mockPetData("p4", "搖滾小石", "Rock", "B") },
  { id: "5", petId: "p5", ownerName: "Emma", country: "UK", city: "London", top: 36, left: 47, pet: mockPetData("p5", "英倫小星", "Indie", "O") },
  { id: "6", petId: "p6", ownerName: "Julien", country: "France", city: "Paris", top: 41, left: 49, pet: mockPetData("p6", "爵士小霧", "Jazz", "G") },
];

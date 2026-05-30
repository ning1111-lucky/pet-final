import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, MusicItem, Pet, MapEntry, Genre, ItemPart, MusicProvider } from "./types";
import { COLLECTION_ITEM_PARTS, getBaseType, getCollectionSlotIndex, getDaySlotConfigs, MOCK_MAP_ENTRIES, TOTAL_DAYS } from "./mockData";
import { generateId } from "./utils";
import { BaseKey, getRandomBaseKey, normalizeBaseKey, normalizeStoredAssetImage, resolveAssetImage } from "./assetMap";

interface AppState {
  userProfile: UserProfile | null;
  currentMockDay: number;
  currentBaseKey: BaseKey;
  currentWeekItems: (MusicItem | null)[];
  dailyHistory: MusicItem[];
  weeklyPets: Pet[];
  mapEntries: MapEntry[];
}

interface AppContextType extends AppState {
  login: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  generateItem: (item: MusicItem) => void;
  advanceDay: () => void;
  generateWeeklyPet: (pet: Pet) => void;
  resetWeek: () => void;
  addToMap: (entry: MapEntry) => void;
  autoFillWeek: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "melody_app_state";
const INITIAL_ITEMS = Array.from({ length: COLLECTION_ITEM_PARTS.length }, () => null) as (MusicItem | null)[];
const VALID_GENRES: Genre[] = ["Pop", "Hip-hop", "Hiphop", "K-pop", "Kpop", "EDM", "Classical", "Jazz", "R&B", "RnB", "Country", "Rock", "Taiwan Indie", "Indie", "Mixed", "Hidden"];
const VALID_PARTS: ItemPart[] = ["clothes", "headwear", "accessory", "handheld", "shoes", "enhance", "final weekly pet"];

const isRecord = (value: unknown): value is Record<string, any> => typeof value === "object" && value !== null;

const normalizeGenre = (value: unknown): Genre => {
  if (typeof value !== "string") return "Pop";

  const genreMap: Record<string, Genre> = {
    "K-pop": "Kpop",
    Kpop: "Kpop",
    KPOP: "Kpop",
    kpop: "Kpop",
    Pop: "Pop",
    POP: "Pop",
    pop: "Pop",
    "R&B": "RnB",
    RnB: "RnB",
    RNB: "RnB",
    rnb: "RnB",
    Rock: "Rock",
    ROCK: "Rock",
    rock: "Rock",
    Jazz: "Jazz",
    JAZZ: "Jazz",
    jazz: "Jazz",
    Indie: "Indie",
    INDIE: "Indie",
    indie: "Indie",
    "Taiwan Indie": "Indie",
    "Hip-hop": "Hiphop",
    Hiphop: "Hiphop",
    HIPHOP: "Hiphop",
    hiphop: "Hiphop",
    Classical: "Classical",
    CLASSICAL: "Classical",
    classical: "Classical",
    Country: "Country",
    COUNTRY: "Country",
    country: "Country",
    EDM: "EDM",
    edm: "EDM",
    Mixed: "Mixed",
    Hidden: "Hidden",
  };

  const normalized = genreMap[value] || (VALID_GENRES.includes(value as Genre) ? (value as Genre) : undefined);
  return normalized || "Pop";
};

const clampDay = (value: unknown) => Math.min(Math.max(Number(value) || 1, 1), TOTAL_DAYS);

const normalizePart = (value: unknown, index = 0): ItemPart => {
  if (typeof value === "string" && VALID_PARTS.includes(value as ItemPart)) {
    return value as ItemPart;
  }

  const fallbackParts: ItemPart[] = [...COLLECTION_ITEM_PARTS];
  return fallbackParts[index] || "clothes";
};

const normalizeMusicItem = (value: unknown, index = 0): MusicItem | null => {
  if (!isRecord(value)) return null;

  const genre = normalizeGenre(value.genre);
  const part = normalizePart(value.part, index);
  const id = typeof value.id === "string" && value.id ? value.id : generateId();
  const day = clampDay(value.day ?? index + 1);

  return {
    id,
    day,
    part,
    genre,
    label: typeof value.label === "string" && value.label ? value.label : `${genre} ${part}`,
    icon: typeof value.icon === "string" && value.icon ? value.icon : "✨",
    imageSrc: normalizeStoredAssetImage(
      genre,
      part,
      typeof value.imageSrc === "string" && value.imageSrc ? value.imageSrc : null,
      `${id}:${day}`
    ),
  };
};

const normalizeItemsArray = (value: unknown, ensureWeekLength = false): (MusicItem | null)[] => {
  const safeItems = Array.isArray(value) ? value : [];
  const normalized = safeItems.slice(0, COLLECTION_ITEM_PARTS.length).map((item, index) => normalizeMusicItem(item, index));

  if (!ensureWeekLength) {
    return normalized.filter((item): item is MusicItem => Boolean(item));
  }

  const padded = Array.from({ length: COLLECTION_ITEM_PARTS.length }, (_, index) => normalized[index] || null);
  return padded;
};

const normalizePet = (value: unknown): Pet | null => {
  if (!isRecord(value)) return null;

  const mainGenre = normalizeGenre(value.mainGenre ?? value.baseGenre);
  const items = normalizeItemsArray(value.items, false) as MusicItem[];
  const fallbackSubGenre = items[1]?.genre || items[0]?.genre || mainGenre;
  const rawBaseType = value.baseType;
  const baseType = rawBaseType === "O" || rawBaseType === "G" || rawBaseType === "B" ? rawBaseType : getBaseType(mainGenre);

  return {
    id: typeof value.id === "string" && value.id ? value.id : generateId(),
    name: typeof value.name === "string" && value.name ? value.name : `${mainGenre} 音樂精靈`,
    mainGenre,
    subGenre: normalizeGenre(value.subGenre ?? fallbackSubGenre),
    baseType,
    items,
    description: typeof value.description === "string" && value.description ? value.description : `由本週的音樂行程誕生，充滿 ${mainGenre} 的氣息。`,
    weekNumber: Math.max(Number(value.weekNumber) || 1, 1),
  };
};

const normalizeMapEntry = (value: unknown): MapEntry | null => {
  if (!isRecord(value)) return null;

  const fallbackPetInput = isRecord(value.pet)
    ? value.pet
    : {
        id: value.petId,
        name: value.petName,
        mainGenre: value.mainGenre,
        subGenre: value.secondGenre,
        items: value.items,
        description: typeof value.description === "string" ? value.description : undefined,
        weekNumber: 1,
      };

  const pet = normalizePet(fallbackPetInput);
  if (!pet) return null;

  const petName = typeof value.petName === "string" && value.petName ? value.petName : pet.name;
  const mainGenre = normalizeGenre(value.mainGenre ?? pet.mainGenre);
  const secondGenre = normalizeGenre(value.secondGenre ?? pet.subGenre);
  const items = normalizeItemsArray(value.items ?? pet.items, false) as MusicItem[];
  const provider = typeof value.provider === "string" && value.provider ? value.provider : null;
  const petImage = typeof value.petImage === "string" && value.petImage ? value.petImage : null;

  return {
    id: typeof value.id === "string" && value.id ? value.id : generateId(),
    petId: typeof value.petId === "string" && value.petId ? value.petId : pet.id,
    ownerName: typeof value.ownerName === "string" && value.ownerName ? value.ownerName : "Anonymous",
    country: typeof value.country === "string" && value.country ? value.country : "Taiwan",
    city: typeof value.city === "string" && value.city ? value.city : "Taipei",
    top: Number.isFinite(Number(value.top)) ? Number(value.top) : 50,
    left: Number.isFinite(Number(value.left)) ? Number(value.left) : 50,
    pet: {
      ...pet,
      name: petName,
      mainGenre,
      subGenre: secondGenre,
      items,
    },
    petImage,
    petName,
    mainGenre,
    secondGenre,
    items,
    provider,
  };
};

const getDefaultState = (): AppState => ({
  userProfile: null,
  currentMockDay: 1,
  currentBaseKey: getRandomBaseKey(),
  currentWeekItems: [...INITIAL_ITEMS],
  dailyHistory: [],
  weeklyPets: [],
  mapEntries: [],
});

const loadStoredState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultState();
    }

    const parsed = JSON.parse(stored);
    if (!isRecord(parsed)) {
      return getDefaultState();
    }

    const safeMapEntries = (Array.isArray(parsed.mapEntries) ? parsed.mapEntries : [])
      .map(normalizeMapEntry)
      .filter((entry): entry is MapEntry => Boolean(entry))
      .filter((entry) => !MOCK_MAP_ENTRIES.some((mockEntry) => mockEntry.id === entry.id));

    return {
      userProfile: isRecord(parsed.userProfile) ? {
        name: typeof parsed.userProfile.name === "string" ? parsed.userProfile.name : "",
        email: typeof parsed.userProfile.email === "string" ? parsed.userProfile.email : "",
        country: typeof parsed.userProfile.country === "string" && parsed.userProfile.country ? parsed.userProfile.country : "Taiwan",
        city: typeof parsed.userProfile.city === "string" && parsed.userProfile.city ? parsed.userProfile.city : "Taipei",
        style: typeof parsed.userProfile.style === "string" ? parsed.userProfile.style : undefined,
        musicProvider: (typeof parsed.userProfile.musicProvider === "string" ? parsed.userProfile.musicProvider : "mock") as MusicProvider,
        lastfmUsername: typeof parsed.userProfile.lastfmUsername === "string" ? parsed.userProfile.lastfmUsername : undefined,
        agreed: Boolean(parsed.userProfile.agreed),
      } : null,
      currentMockDay: clampDay(parsed.currentMockDay ?? parsed.currentDay),
      currentBaseKey: normalizeBaseKey(parsed.currentBaseKey ?? getRandomBaseKey()),
      currentWeekItems: normalizeItemsArray(parsed.currentWeekItems, true),
      dailyHistory: normalizeItemsArray(parsed.dailyHistory, false) as MusicItem[],
      weeklyPets: (Array.isArray(parsed.weeklyPets) ? parsed.weeklyPets : [])
        .map(normalizePet)
        .filter((pet): pet is Pet => Boolean(pet)),
      mapEntries: safeMapEntries,
    };
  } catch (e) {
    console.error("Failed to load state", e);
    return getDefaultState();
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadStoredState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (profile: UserProfile) => {
    setState((s) => ({
      ...s,
      userProfile: {
        ...profile,
        musicProvider: profile.musicProvider || "mock",
        lastfmUsername: profile.lastfmUsername?.trim() || undefined,
      },
    }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setState((s) => {
      if (!s.userProfile) {
        return s;
      }

      return {
        ...s,
        userProfile: {
          ...s.userProfile,
          ...updates,
          musicProvider: (updates.musicProvider || s.userProfile.musicProvider || "mock") as MusicProvider,
          lastfmUsername: updates.lastfmUsername !== undefined
            ? updates.lastfmUsername.trim() || undefined
            : s.userProfile.lastfmUsername,
        },
      };
    });
  };

  const generateItem = (item: MusicItem) => {
    setState((s) => {
      const normalizedItem = normalizeMusicItem(item, clampDay(s.currentMockDay) - 1);
      if (!normalizedItem) {
        return s;
      }

      const targetIndex = getCollectionSlotIndex(normalizedItem.part);
      if (targetIndex === -1) {
        return s;
      }

      const newItems = [...s.currentWeekItems];
      newItems[targetIndex] = normalizedItem;

      return {
        ...s,
        currentWeekItems: newItems,
        dailyHistory: [...(Array.isArray(s.dailyHistory) ? s.dailyHistory : []), normalizedItem],
      };
    });
  };

  const advanceDay = () => {
    setState((s) => ({ ...s, currentMockDay: clampDay((s.currentMockDay || 1) + 1) }));
  };

  const generateWeeklyPet = (pet: Pet) => {
    setState((s) => {
      const safePet = normalizePet(pet);
      if (!safePet) return s;
      return { ...s, weeklyPets: [...(Array.isArray(s.weeklyPets) ? s.weeklyPets : []), safePet] };
    });
  };

  const resetWeek = () => {
    setState((s) => ({
      ...s,
      currentMockDay: 1,
      currentBaseKey: getRandomBaseKey(),
      currentWeekItems: [...INITIAL_ITEMS],
    }));
  };

  const autoFillWeek = async () => {
    const { getTodayMusicData } = await import("./mockData");
    const provider = (state.userProfile?.musicProvider || "mock") as MusicProvider;
    const lastfmUsername = state.userProfile?.lastfmUsername;

    const newItems = [...INITIAL_ITEMS];

    for (let day = 1; day <= TOTAL_DAYS; day += 1) {
      const dailyData = await getTodayMusicData(provider, { lastfmUsername });
      const mainGenre = normalizeGenre(dailyData.assetGenre || dailyData.mainGenre);
      const secondGenre = normalizeGenre(dailyData.subGenre || mainGenre);

      getDaySlotConfigs(day).forEach((slot, slotIndex) => {
        const itemGenre = slot.genreSource === "main" ? mainGenre : secondGenre;
        const targetIndex = getCollectionSlotIndex(slot.part);
        if (targetIndex === -1) {
          return;
        }

        newItems[targetIndex] = {
          id: `${day}-${slot.part}-${slotIndex}-${Math.random().toString(36).substring(2)}`,
          day,
          part: slot.part,
          genre: itemGenre,
          label: `${itemGenre} ${slot.part}`,
          icon: "✨",
          imageSrc: resolveAssetImage(itemGenre, slot.part, `${itemGenre}-${slot.part}-${day}`),
        };
      });
    }

    setState((s) => ({ ...s, currentMockDay: TOTAL_DAYS, currentWeekItems: newItems }));
  };

  const addToMap = (entry: MapEntry) => {
    setState((s) => {
      const safeEntry = normalizeMapEntry(entry);
      if (!safeEntry) return s;
      return { ...s, mapEntries: [...(Array.isArray(s.mapEntries) ? s.mapEntries : []), safeEntry] };
    });
  };

  return (
    <AppContext.Provider value={{ ...state, login, updateUserProfile, generateItem, advanceDay, generateWeeklyPet, resetWeek, addToMap, autoFillWeek }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

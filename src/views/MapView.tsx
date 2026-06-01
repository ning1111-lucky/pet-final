import React, { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { PetPlaceholder, PixelSectionTitle } from "../components/UI";
import { Genre, MapEntry, MusicItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { getBaseType, MOCK_MAP_ENTRIES } from "../mockData";

type SafeMapEntry = {
  id: string;
  ownerName: string;
  city: string;
  country: string;
  petImage: string | null;
  petName: string;
  mainGenre: Genre;
  secondGenre: Genre;
  items: MusicItem[];
  description: string;
  baseType: "O" | "G" | "B";
};

type GenreZoneKey = "kpop" | "classical" | "hiphop" | "country" | "jazz" | "indie" | "rnb" | "pop";

type ZoneConfig = {
  key: GenreZoneKey;
  slots: { left: string; top: string }[];
};

function normalizeMapEntryForView(entry: MapEntry): SafeMapEntry {
  const mainGenre = (entry.mainGenre || entry.pet?.mainGenre || "Pop") as Genre;
  const secondGenre = (entry.secondGenre || entry.pet?.subGenre || mainGenre) as Genre;
  const items = Array.isArray(entry.items) && entry.items.length > 0 ? entry.items : entry.pet?.items || [];

  return {
    id: entry.id || crypto.randomUUID(),
    ownerName: entry.ownerName || "Guest",
    city: entry.city || "Unknown",
    country: entry.country || "",
    petImage: entry.petImage || null,
    petName: entry.petName || entry.pet?.name || "未命名音樂寵物",
    mainGenre,
    secondGenre,
    items,
    description: entry.pet?.description || "這隻音樂寵物剛剛抵達世界地圖。",
    baseType: entry.pet?.baseType || getBaseType(mainGenre),
  };
}

function getGenreZoneKey(genre: Genre): GenreZoneKey {
  const normalizedGenre = genre === "K-pop" ? "Kpop" : genre === "Hip-hop" ? "Hiphop" : genre === "R&B" ? "RnB" : genre;

  if (normalizedGenre === "Kpop") return "kpop";
  if (normalizedGenre === "Classical") return "classical";
  if (normalizedGenre === "Hiphop" || normalizedGenre === "Rock" || normalizedGenre === "EDM") return "hiphop";
  if (normalizedGenre === "Country") return "country";
  if (normalizedGenre === "Jazz") return "jazz";
  if (normalizedGenre === "Indie" || normalizedGenre === "Taiwan Indie") return "indie";
  if (normalizedGenre === "RnB") return "rnb";
  return "pop";
}

const zoneConfigs: ZoneConfig[] = [
  {
    key: "kpop",
    slots: [
      { left: "18%", top: "27%" },
      { left: "24%", top: "34%" },
      { left: "28%", top: "22%" },
    ],
  },
  {
    key: "classical",
    slots: [
      { left: "50%", top: "27%" },
      { left: "43%", top: "34%" },
      { left: "57%", top: "34%" },
    ],
  },
  {
    key: "hiphop",
    slots: [
      { left: "78%", top: "27%" },
      { left: "72%", top: "34%" },
      { left: "84%", top: "34%" },
    ],
  },
  {
    key: "country",
    slots: [
      { left: "20%", top: "58%" },
      { left: "28%", top: "63%" },
      { left: "13%", top: "65%" },
    ],
  },
  {
    key: "jazz",
    slots: [
      { left: "50%", top: "54%" },
      { left: "43%", top: "61%" },
      { left: "58%", top: "62%" },
    ],
  },
  {
    key: "indie",
    slots: [
      { left: "79%", top: "58%" },
      { left: "71%", top: "64%" },
      { left: "86%", top: "65%" },
    ],
  },
  {
    key: "rnb",
    slots: [
      { left: "32%", top: "84%" },
      { left: "23%", top: "78%" },
      { left: "41%", top: "79%" },
    ],
  },
  {
    key: "pop",
    slots: [
      { left: "69%", top: "84%" },
      { left: "61%", top: "78%" },
      { left: "78%", top: "78%" },
    ],
  },
];

export const MapView: React.FC = () => {
  const { mapEntries } = useApp();
  const [selectedEntry, setSelectedEntry] = useState<SafeMapEntry | null>(null);
  const safeMapEntries = Array.isArray(mapEntries) ? mapEntries.filter(Boolean) : [];

  const allEntries = [...MOCK_MAP_ENTRIES, ...safeMapEntries].map(normalizeMapEntryForView);

  const totalPets = allEntries.length;
  const genreCounts = allEntries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.mainGenre] = (acc[entry.mainGenre] || 0) + 1;
    return acc;
  }, {});
  const topGenre = Object.entries(genreCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] || "POP";
  const latestCity = allEntries[allEntries.length - 1]?.city || "未知";

  const entriesByZone = useMemo(() => {
    const grouped = zoneConfigs.reduce<Record<GenreZoneKey, SafeMapEntry[]>>((acc, zone) => {
      acc[zone.key] = [];
      return acc;
    }, {} as Record<GenreZoneKey, SafeMapEntry[]>);

    allEntries.forEach((entry) => {
      grouped[getGenreZoneKey(entry.mainGenre)].push(entry);
    });

    return grouped;
  }, [allEntries]);

  return (
    <div className="page-stack">
      <div className="page-title-group pixel-dot-trail">
        <div className="type-caption uppercase tracking-[0.18em]">WORLD MAP</div>
        <h2 className="page-title">世界地圖</h2>
        <p className="page-subtitle">探索不同曲風區域，查看已上傳的音樂寵物與推薦世界。</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["KPOP", "CLASSICAL", "HIPHOP", "COUNTRY", "JAZZ", "INDIE", "RNB", "POP"].map((genre, index) => (
          <span key={genre} className={`info-chip ${index === 0 ? "bg-[var(--color-primary)]" : "bg-white"}`}>{genre}</span>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
      <div className="relative w-full aspect-square overflow-hidden rounded-[32px] border border-[rgba(17,17,17,0.06)] shadow-[var(--shadow-soft-lg)] bg-white p-2">
        <img
          src="/genre-map.png"
          alt="Music genre map"
          className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-[24px]"
        />

        {zoneConfigs.map((zone) => {
          const zoneEntries = entriesByZone[zone.key] || [];

          return zoneEntries.map((entry, index) => {
            const slot = zone.slots[index % zone.slots.length];

            return (
              <motion.button
                key={entry.id}
                type="button"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.35 }}
                className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: slot.left, top: slot.top }}
                onClick={() => setSelectedEntry(entry)}
              >
                  <div className="w-12 h-12 rounded-[18px] border border-[rgba(17,17,17,0.08)] bg-white/94 p-1 shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-transform overflow-hidden">
                  {entry.petImage ? (
                    <img src={entry.petImage} alt={entry.petName} className="w-full h-full object-contain scale-[0.82]" />
                  ) : (
                    <PetPlaceholder baseType={entry.baseType} className="w-full h-full scale-[0.8]" />
                  )}
                </div>
              </motion.button>
            );
          });
        })}
      </div>

      <div className="space-y-5">
      <div className="section-surface grid grid-cols-3 gap-3 text-center">
        <div className="section-plain bg-white">
          <div className="type-caption text-[var(--color-muted)]">世界寵物數</div>
          <div className="type-h2 mt-1">{totalPets}</div>
        </div>
        <div className="section-plain bg-white">
          <div className="type-caption text-[var(--color-muted)]">熱門風格</div>
          <div className="type-label mt-1 line-clamp-1">{topGenre}</div>
        </div>
        <div className="section-plain bg-white">
          <div className="type-caption text-[var(--color-muted)]">最新城市</div>
          <div className="type-label mt-1 line-clamp-1">{latestCity}</div>
        </div>
      </div>
      <div className="section-surface">
        <PixelSectionTitle title="推薦區域" subtitle="目前已解鎖的曲風會優先出現在對應世界區塊中。" variant="dark" />
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(genreCounts)
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .slice(0, 6)
            .map(([genre, count], index) => (
              <span key={genre} className={`info-chip ${index === 0 ? "bg-[var(--color-primary)]" : "bg-white"}`}>
                {genre} · {count}
              </span>
            ))}
        </div>
      </div>
      </div>
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed bottom-0 left-1/2 z-[60] w-[calc(100%-24px)] max-w-[560px] -translate-x-1/2 rounded-t-[32px] bg-[var(--color-card)] px-6 pb-12 pt-6 shadow-[0_-18px_38px_rgba(15,23,42,0.14)] md:bottom-6 md:rounded-[32px]"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <button
              className="absolute top-4 right-4 font-bold text-xl w-9 h-9 bg-[var(--color-card-secondary)] rounded-full shadow-[var(--shadow-soft)] text-[var(--color-text)] active:scale-95"
              onClick={() => setSelectedEntry(null)}
            >
              ×
            </button>

            <div className="flex flex-col items-center">
              <div className="type-caption text-[var(--color-text)] bg-[var(--color-primary)] px-3 py-1 rounded-full mb-4">
                📍 {selectedEntry.city || "未知城市"}, {selectedEntry.country || "未知國家"}
              </div>

              <div className="bg-white p-4 border border-[rgba(17,17,17,0.08)] rounded-[24px] mb-4 overflow-hidden shadow-[var(--shadow-soft)]">
                {selectedEntry.petImage ? (
                  <img src={selectedEntry.petImage} alt={selectedEntry.petName} className="w-32 h-32 object-contain rounded-md" />
                ) : (
                  <PetPlaceholder baseType={selectedEntry.baseType} className="w-32 h-32" />
                )}
              </div>

              <h3 className="type-h1 mb-1">{selectedEntry.petName}</h3>
              <div className="type-caption text-[var(--color-muted)] mb-4">
                Owner: {selectedEntry.ownerName || "Anonymous"}
              </div>

              <div className="flex space-x-2 mb-4 flex-wrap justify-center">
                <div className="info-chip">
                  主風格: {selectedEntry.mainGenre}
                </div>
                <div className="info-chip">
                  次風格: {selectedEntry.secondGenre}
                </div>
              </div>

              <div className="section-plain type-body mb-4 text-center bg-white w-full">
                "{selectedEntry.description}"
              </div>

              <div className="w-full text-left type-label mb-2 border-b border-[rgba(17,17,17,0.08)] pb-2">
                本週收集物品
              </div>
              <div className="flex flex-wrap gap-2 justify-start w-full section-plain bg-[var(--color-card-secondary)]">
                {selectedEntry.items.length > 0 ? (
                  selectedEntry.items.map((item) => (
                    <div
                      key={item.id}
                      className="w-10 h-10 rounded-[14px] border border-[rgba(17,17,17,0.08)] flex items-center justify-center text-xl bg-white shadow-[var(--shadow-soft)]"
                      title={`${item.genre} ${item.part}`}
                    >
                      {item.icon}
                    </div>
                  ))
                ) : (
                  <span className="type-caption text-[var(--color-muted)] p-2">沒有穿戴物品</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

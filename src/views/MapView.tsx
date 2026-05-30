import React, { useMemo, useState } from "react";
import { useApp } from "../AppContext";
import { PetPlaceholder } from "../components/UI";
import { Genre, MapEntry, MusicItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { getBaseType, MOCK_MAP_ENTRIES } from "../mockData";

type SafeMapEntry = {
  id: string;
  ownerName: string;
  city: string;
  country: string;
  top: number;
  left: number;
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
  label: string;
  genres: Genre[];
  className: string;
  labelClassName: string;
  slots: { left: string; top: string }[];
  landmark: React.ReactNode;
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
    top: Number.isFinite(Number(entry.top)) ? Number(entry.top) : 50,
    left: Number.isFinite(Number(entry.left)) ? Number(entry.left) : 50,
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
    label: "KPOP",
    genres: ["Kpop", "K-pop"],
    className: "top-[8%] left-[6%] w-[28%] h-[24%] bg-[linear-gradient(180deg,#f8b5db_0%,#f48ec8_100%)] rounded-[42%_38%_36%_44%/36%_42%_38%_44%] border-[3px] border-[#8f557d] shadow-[0_8px_0_#d66daf]",
    labelClassName: "bg-[#f7a7d5] border-[#8f557d] text-white",
    slots: [
      { left: "22%", top: "58%" },
      { left: "48%", top: "66%" },
      { left: "68%", top: "52%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[24%] top-[34%] w-[46%] h-[28%] rounded-xl bg-[#ea69bd] border-[3px] border-[#8f557d]" />
        <div className="absolute left-[35%] top-[24%] w-[24%] h-[10%] rounded-full bg-[#ffd4ef] border-2 border-[#8f557d]" />
        <div className="absolute left-[44%] top-[18%] text-2xl">★</div>
      </>
    ),
  },
  {
    key: "classical",
    label: "CLASSICAL",
    genres: ["Classical"],
    className: "top-[7%] left-[39%] w-[24%] h-[25%] bg-[linear-gradient(180deg,#d9ebb3_0%,#bfe093_100%)] rounded-[40%_35%_42%_38%/38%_42%_34%_46%] border-[3px] border-[#6f8d46] shadow-[0_8px_0_#9fc36b]",
    labelClassName: "bg-[#e8d0a5] border-[#87633a] text-[#6b4826]",
    slots: [
      { left: "50%", top: "60%" },
      { left: "30%", top: "70%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[30%] top-[30%] w-[40%] h-[24%] rounded-t-xl bg-[#f1deb4] border-[3px] border-[#87633a]" />
        <div className="absolute left-[28%] top-[52%] w-[44%] h-[10%] rounded-md bg-[#f1deb4] border-[3px] border-[#87633a]" />
        <div className="absolute left-[45%] top-[61%] w-[10%] h-[10%] rounded-full bg-[#73c2d6] border-2 border-[#4c8290]" />
      </>
    ),
  },
  {
    key: "hiphop",
    label: "HIPHOP",
    genres: ["Hiphop", "Hip-hop", "Rock", "EDM"],
    className: "top-[9%] right-[5%] w-[28%] h-[24%] bg-[linear-gradient(180deg,#8b93ad_0%,#5d657f_100%)] rounded-[38%_42%_40%_35%/34%_39%_46%_41%] border-[3px] border-[#384257] shadow-[0_8px_0_#4a536d]",
    labelClassName: "bg-[#7380a7] border-[#384257] text-white",
    slots: [
      { left: "30%", top: "66%" },
      { left: "58%", top: "62%" },
      { left: "74%", top: "54%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[16%] top-[30%] w-[18%] h-[25%] rounded-md bg-[#4b536a] border-[3px] border-[#2d3445]" />
        <div className="absolute left-[40%] top-[36%] w-[24%] h-[18%] rounded-md bg-[#3e465b] border-[3px] border-[#2d3445]" />
        <div className="absolute left-[70%] top-[35%] w-[12%] h-[26%] rounded-md bg-[#4b536a] border-[3px] border-[#2d3445]" />
        <div className="absolute left-[48%] top-[46%] text-lg text-[#ffbf59] font-black">YO!</div>
      </>
    ),
  },
  {
    key: "country",
    label: "COUNTRY",
    genres: ["Country"],
    className: "top-[39%] left-[6%] w-[28%] h-[26%] bg-[linear-gradient(180deg,#f0cd72_0%,#d9a957_100%)] rounded-[40%_36%_42%_38%/42%_38%_40%_36%] border-[3px] border-[#956228] shadow-[0_8px_0_#c2893f]",
    labelClassName: "bg-[#d59a56] border-[#8b5c28] text-[#fff6de]",
    slots: [
      { left: "30%", top: "70%" },
      { left: "56%", top: "60%" },
      { left: "70%", top: "72%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[14%] top-[48%] w-[22%] h-[18%] rounded-md bg-[#a66738] border-[3px] border-[#74411f]" />
        <div className="absolute left-[49%] top-[42%] w-[2%] h-[18%] bg-[#845729]" />
        <div className="absolute left-[44%] top-[35%] w-[12%] h-[12%] rotate-45 border-4 border-[#845729] border-b-0 border-r-0" />
      </>
    ),
  },
  {
    key: "jazz",
    label: "JAZZ",
    genres: ["Jazz"],
    className: "top-[36%] left-[37%] w-[28%] h-[22%] bg-[linear-gradient(180deg,#b594f1_0%,#8e71cf_100%)] rounded-[44%_40%_34%_42%/40%_36%_44%_42%] border-[3px] border-[#55408d] shadow-[0_8px_0_#7159b3]",
    labelClassName: "bg-[#9a83e0] border-[#55408d] text-white",
    slots: [
      { left: "30%", top: "70%" },
      { left: "56%", top: "62%" },
      { left: "72%", top: "50%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[34%] top-[40%] w-[30%] h-[20%] rounded-lg bg-[#694bba] border-[3px] border-[#4e367f]" />
        <div className="absolute left-[62%] top-[40%] text-4xl text-[#f5c86b]">♪</div>
      </>
    ),
  },
  {
    key: "indie",
    label: "INDIE",
    genres: ["Indie", "Taiwan Indie"],
    className: "top-[36%] right-[5%] w-[28%] h-[24%] bg-[linear-gradient(180deg,#95d69b_0%,#75b775_100%)] rounded-[38%_44%_36%_42%/40%_38%_44%_40%] border-[3px] border-[#4d7a4c] shadow-[0_8px_0_#6ca56a]",
    labelClassName: "bg-[#74b58c] border-[#4d7a4c] text-white",
    slots: [
      { left: "26%", top: "68%" },
      { left: "54%", top: "62%" },
      { left: "72%", top: "72%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[52%] top-[48%] w-[22%] h-[18%] bg-[#c59864] border-[3px] border-[#7a5737] [clip-path:polygon(50%_0%,100%_40%,100%_100%,0_100%,0_40%)]" />
        <div className="absolute left-[24%] top-[38%] flex gap-1 text-yellow-100 text-xs">
          <span>✦</span><span>✦</span><span>✦</span><span>✦</span>
        </div>
      </>
    ),
  },
  {
    key: "rnb",
    label: "RNB",
    genres: ["RnB", "R&B"],
    className: "bottom-[10%] left-[25%] w-[28%] h-[22%] bg-[linear-gradient(180deg,#7588c6_0%,#5866a4_100%)] rounded-[42%_38%_46%_34%/38%_44%_40%_42%] border-[3px] border-[#35446f] shadow-[0_8px_0_#4f5d93]",
    labelClassName: "bg-[#6377ba] border-[#35446f] text-white",
    slots: [
      { left: "28%", top: "66%" },
      { left: "52%", top: "60%" },
      { left: "70%", top: "70%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[26%] top-[44%] w-[36%] h-[14%] rounded-t-full rounded-b-lg bg-[#4f5c9e] border-[3px] border-[#35446f]" />
        <div className="absolute left-[66%] top-[48%] w-[10%] h-[12%] rounded-md bg-[#f1dbc6] border-2 border-[#7a5a4e]" />
      </>
    ),
  },
  {
    key: "pop",
    label: "POP",
    genres: ["Pop", "Mixed", "Hidden"],
    className: "bottom-[7%] right-[15%] w-[24%] h-[18%] bg-[linear-gradient(180deg,#f2a3ca_0%,#ea7eb6_100%)] rounded-[40%_46%_34%_44%/38%_42%_40%_44%] border-[3px] border-[#96597f] shadow-[0_8px_0_#cf6aa1]",
    labelClassName: "bg-[#ed8ebf] border-[#96597f] text-white",
    slots: [
      { left: "30%", top: "60%" },
      { left: "56%", top: "68%" },
      { left: "72%", top: "54%" },
    ],
    landmark: (
      <>
        <div className="absolute left-[44%] top-[36%] w-[12%] h-[18%] rounded-t-full bg-[#d36eac] border-[3px] border-[#96597f]" />
        <div className="absolute left-[48%] top-[54%] w-[4%] h-[12%] bg-[#96597f]" />
        <div className="absolute left-[28%] top-[48%] w-[10%] h-[14%] rounded-md bg-[#5b5f75]" />
        <div className="absolute left-[62%] top-[48%] w-[10%] h-[14%] rounded-md bg-[#5b5f75]" />
      </>
    ),
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
    <div className="p-4 space-y-6 pb-24">
      <div className="page-title-group">
        <h2 className="page-title">世界音樂寵物地圖</h2>
        <p className="page-subtitle">每個音樂風格都變成一座小島，生成的寵物會縮成小圖章落在自己的風格區域裡。</p>
      </div>

      <div className="relative w-full h-[640px] overflow-hidden rounded-[32px] border-[3px] border-[var(--color-brown)] shadow-[6px_6px_0_var(--color-caramel)] bg-[linear-gradient(180deg,#7bc7ff_0%,#58aef0_45%,#4b9ddc_100%)]">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0 4px, transparent 5px), radial-gradient(circle at 70% 28%, white 0 4px, transparent 5px), radial-gradient(circle at 40% 80%, white 0 4px, transparent 5px)", backgroundSize: "180px 180px" }} />
        <div className="absolute top-[5%] left-[8%] w-12 h-6 rounded-full bg-white/85" />
        <div className="absolute top-[7%] right-[10%] w-14 h-7 rounded-full bg-white/85" />
        <div className="absolute bottom-[8%] right-[6%] w-8 h-16 rounded-t-full rounded-b-md bg-white/90 border-[3px] border-[#7a6d57]" />
        <div className="absolute bottom-[8%] right-[8%] w-3 h-3 rounded-full bg-[#d6505b]" />

        {zoneConfigs.map((zone) => {
          const zoneEntries = entriesByZone[zone.key] || [];

          return (
            <div key={zone.key} className={`absolute ${zone.className}`}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                <div className={`min-w-[92px] text-center px-3 py-1 rounded-xl border-[3px] font-black tracking-[0.08em] text-sm shadow-[0_4px_0_rgba(0,0,0,0.18)] ${zone.labelClassName}`}>
                  {zone.label}
                </div>
              </div>

              <div className="absolute inset-0 rounded-[inherit]">
                <div className="absolute inset-[8%] rounded-[inherit] border border-white/25 opacity-50" />
                {zone.landmark}

                {zoneEntries.map((entry, index) => {
                  const slot = zone.slots[index % zone.slots.length];

                  return (
                    <motion.button
                      key={entry.id}
                      type="button"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", bounce: 0.38 }}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ left: slot.left, top: slot.top }}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="w-11 h-11 rounded-2xl border-[3px] border-[var(--color-brown)] bg-white/92 p-1 shadow-[0_4px_0_rgba(88,56,34,0.25)] hover:-translate-y-1 transition-transform overflow-hidden">
                        {entry.petImage ? (
                          <img src={entry.petImage} alt={entry.petName} className="w-full h-full object-contain scale-[0.88]" />
                        ) : (
                          <PetPlaceholder baseType={entry.baseType} className="w-full h-full scale-[0.82]" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-surface grid grid-cols-3 gap-3 text-center">
        <div className="section-plain bg-[var(--color-cream)]">
          <div className="type-caption text-[var(--color-muted)]">世界寵物數</div>
          <div className="type-h2 mt-1">{totalPets}</div>
        </div>
        <div className="section-plain bg-[var(--color-cream)]">
          <div className="type-caption text-[var(--color-muted)]">熱門風格</div>
          <div className="type-label mt-1 line-clamp-1">{topGenre}</div>
        </div>
        <div className="section-plain bg-[var(--color-cream)]">
          <div className="type-caption text-[var(--color-muted)]">最新城市</div>
          <div className="type-label mt-1 line-clamp-1">{latestCity}</div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-[var(--color-card)] border-t-4 border-[var(--color-brown)] rounded-t-3xl shadow-[0_-4px_0_rgba(0,0,0,0.1)] pb-12 pt-6 px-6"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <button
              className="absolute top-4 right-4 font-bold text-xl px-2 bg-[var(--color-cream)] border-2 border-[var(--color-brown)] rounded-md shadow-[2px_2px_0_var(--color-brown)] text-[var(--color-brown)] active:scale-95"
              onClick={() => setSelectedEntry(null)}
            >
              ×
            </button>

            <div className="flex flex-col items-center">
              <div className="type-caption text-[var(--color-cream)] bg-[var(--color-brown)] px-3 py-1 rounded-full mb-4">
                📍 {selectedEntry.city || "未知城市"}, {selectedEntry.country || "未知國家"}
              </div>

              <div className="bg-white p-4 border-2 border-[var(--color-brown)] border-dashed rounded-xl mb-4 overflow-hidden">
                {selectedEntry.petImage ? (
                  <img src={selectedEntry.petImage} alt={selectedEntry.petName} className="w-32 h-32 object-contain rounded-md" />
                ) : (
                  <PetPlaceholder baseType={selectedEntry.baseType} className="w-32 h-32" />
                )}
              </div>

              <h3 className="type-h1 text-[var(--color-brown)] mb-1">{selectedEntry.petName}</h3>
              <div className="type-caption text-[var(--color-caramel)] mb-4">
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

              <div className="w-full text-left type-label mb-2 text-[var(--color-brown)] border-b-2 border-dashed border-[var(--color-brown)] pb-1">
                本週收集物品
              </div>
              <div className="flex flex-wrap gap-2 justify-start w-full section-plain bg-[var(--color-cream)]">
                {selectedEntry.items.length > 0 ? (
                  selectedEntry.items.map((item) => (
                    <div
                      key={item.id}
                      className="w-10 h-10 rounded-sm border-2 border-[var(--color-brown)] flex items-center justify-center text-xl bg-white"
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

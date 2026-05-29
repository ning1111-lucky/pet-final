import React, { useState } from "react";
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

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="text-center">
        <h2 className="text-xl font-bold bg-white inline-block px-2 border-2 border-[var(--color-brown)] rounded-md shadow-sm mb-2">
          世界音樂寵物地圖
        </h2>
        <p className="text-sm opacity-80 font-bold bg-white inline-block px-1 rounded shadow-sm border border-[var(--color-brown)]">
          看看大家本週的音樂寵物出現在世界哪裡。
        </p>
      </div>

      <div
        className="relative w-full h-[400px] bg-[#E0F2FE] border-[3px] border-[var(--color-brown)] rounded-2xl overflow-hidden shadow-[4px_4px_0_var(--color-caramel)]"
        style={{ backgroundImage: "radial-gradient(#BAE6FD 2px, transparent 0)", backgroundSize: "16px 16px" }}
      >
        <div className="absolute top-[15%] left-[8%] w-[35%] h-[40%] bg-[var(--color-sand)] rounded-2xl border-2 border-[var(--color-brown)] opacity-90" />
        <div className="absolute top-[55%] left-[18%] w-[20%] h-[35%] bg-[var(--color-sand)] rounded-2xl border-2 border-[var(--color-brown)] opacity-90" />
        <div className="absolute top-[10%] left-[45%] w-[45%] h-[35%] bg-[var(--color-sand)] rounded-[24px] border-2 border-[var(--color-brown)] opacity-90" />
        <div className="absolute top-[45%] left-[42%] w-[25%] h-[35%] bg-[var(--color-sand)] rounded-[20px] border-2 border-[var(--color-brown)] opacity-90" />
        <div className="absolute top-[65%] left-[72%] w-[18%] h-[20%] bg-[var(--color-sand)] rounded-xl border-2 border-[var(--color-brown)] opacity-90" />

        {allEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute z-10 cursor-pointer transform -translate-x-1/2 -translate-y-[100%]"
            style={{ top: `${entry.top}%`, left: `${entry.left}%` }}
            onClick={() => setSelectedEntry(entry)}
          >
            <div className="relative group shadow-[2px_2px_0_var(--color-brown)]">
              <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-1 rounded-md hover:bg-[var(--color-caramel)] transition-colors">
                <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center border border-[var(--color-brown)] overflow-hidden">
                  {entry.petImage ? (
                    <img src={entry.petImage} alt={entry.petName} className="w-full h-full object-cover" />
                  ) : (
                    <PetPlaceholder baseType={entry.baseType} className="w-6 h-6" />
                  )}
                </div>
              </div>

              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[var(--color-sand)] text-[10px] border-2 border-[var(--color-brown)] px-1 font-bold whitespace-nowrap z-20 rounded-sm">
                {entry.city}
              </div>

              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--color-brown)] rotate-45 z-0" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
          <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">世界寵物數</div>
          <div className="text-lg font-bold">{totalPets}</div>
        </div>
        <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
          <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">熱門風格</div>
          <div className="text-[14px] font-bold mt-1 line-clamp-1">{topGenre}</div>
        </div>
        <div className="bg-[var(--color-cream)] border-2 border-[var(--color-brown)] p-2 rounded-lg text-center shadow-[2px_2px_0_var(--color-caramel)]">
          <div className="text-[10px] font-bold text-[var(--color-brown)] opacity-80">最新城市</div>
          <div className="text-[14px] font-bold mt-1 line-clamp-1">{latestCity}</div>
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
              <div className="text-sm font-bold text-[var(--color-cream)] bg-[var(--color-brown)] px-3 py-1 rounded-full mb-4">
                📍 {selectedEntry.city || "未知城市"}, {selectedEntry.country || "未知國家"}
              </div>

              <div className="bg-white p-4 border-2 border-[var(--color-brown)] border-dashed rounded-xl mb-4 overflow-hidden">
                {selectedEntry.petImage ? (
                  <img src={selectedEntry.petImage} alt={selectedEntry.petName} className="w-32 h-32 object-cover rounded-md" />
                ) : (
                  <PetPlaceholder baseType={selectedEntry.baseType} className="w-32 h-32" />
                )}
              </div>

              <h3 className="font-bold text-2xl text-[var(--color-brown)] mb-1 bg-[--color-cream] px-2 rounded">
                {selectedEntry.petName}
              </h3>
              <div className="text-sm font-bold text-[var(--color-caramel)] mb-4 bg-white px-2 rounded-sm border border-[var(--color-brown)]">
                Owner: {selectedEntry.ownerName || "Anonymous"}
              </div>

              <div className="flex space-x-2 text-sm mb-4 font-bold">
                <div className="bg-[var(--color-sand)] border-2 border-[var(--color-brown)] px-3 py-1 rounded-md shadow-sm">
                  主風格: {selectedEntry.mainGenre}
                </div>
                <div className="bg-[var(--color-sand)] border-2 border-[var(--color-brown)] px-3 py-1 rounded-md shadow-sm">
                  次風格: {selectedEntry.secondGenre}
                </div>
              </div>

              <div className="text-sm font-bold opacity-80 mb-4 px-4 text-center bg-white py-2 rounded-md border border-gray-200 w-full">
                "{selectedEntry.description}"
              </div>

              <div className="w-full text-left font-bold text-sm mb-2 text-[var(--color-brown)] border-b-2 border-dashed border-[var(--color-brown)] pb-1">
                本週收集物品
              </div>
              <div className="flex flex-wrap gap-2 justify-start w-full bg-[var(--color-cream)] p-2 rounded-md border-2 border-[var(--color-brown)]">
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
                  <span className="text-xs text-gray-500 font-bold p-2">沒有穿戴物品</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

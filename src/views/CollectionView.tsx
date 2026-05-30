import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, PixelItemPlaceholder } from "../components/UI";
import { Pet } from "../types";
import { motion } from "motion/react";

export const CollectionView: React.FC<{ navigateTo: (tab: "today" | "items" | "map") => void }> = ({ navigateTo }) => {
  const { currentWeekItems } = useApp();
  const [showPetResult, setShowPetResult] = useState(false);
  const [generatedPet, setGeneratedPet] = useState<Pet | null>(null);

  const safeWeekItems = Array.isArray(currentWeekItems) ? currentWeekItems : [];
  const collectedItems = safeWeekItems.slice(0, 5);
  const isWeekFull = collectedItems.every(item => item !== null);

  const handleGenPet = () => {
    // Generate pet in TodayView is better configured per instructions, 
    // but just in case we trigger it from CollectionView:
    navigateTo("today");
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="page-title-group">
        <h2 className="page-title">本週收集</h2>
        <p className="page-subtitle">先收齊五個關鍵部件，再完成本週音樂寵物。</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {collectedItems.map((item, index) => {
          if (!item) {
            return (
              <div key={index} className="aspect-square bg-[var(--color-card)] pixel-border pixel-shadow flex items-center justify-center text-[var(--color-brown)] opacity-50 relative border-dashed">
                <div className="absolute top-1 left-2 font-bold opacity-30">D{index + 1}</div>
                <div className="text-4xl">❓</div>
              </div>
            );
          }
          return (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={index} className="aspect-square bg-[var(--color-cream)] pixel-border pixel-shadow flex flex-col items-center justify-center p-2 relative">
               <div className="absolute top-1 left-2 text-xs font-bold bg-[var(--color-sand)] px-1">D{index + 1}</div>
               <PixelItemPlaceholder genre={item.genre} part={item.part} imageSrc={item.imageSrc} className="w-full h-full border-none shadow-none bg-transparent" />
            </motion.div>
          );
        })}
      </div>

      {isWeekFull && (
        <div className="section-surface text-center mt-2">
           <h3 className="type-h2 mb-2">收集完成</h3>
           <p className="type-body mb-4">你已經集滿本週五件物品，可以前往 Day 3 直接生成音樂寵物。</p>
           <Button onClick={handleGenPet} className="w-full">✨ 切換至今日（D3）確認生成音樂寵物 ✨</Button>
        </div>
      )}
    </div>
  );
};

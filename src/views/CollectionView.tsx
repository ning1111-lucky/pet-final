import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, PixelBadge, PixelItemPlaceholder, PixelSectionTitle } from "../components/UI";
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
      <div className="page-title-group pixel-dot-trail">
        <div className="type-caption uppercase tracking-[0.18em] text-white/95">ITEM REWARD</div>
        <h2 className="page-title">本週收集</h2>
        <p className="page-subtitle">像素奖励会按天掉落，先收齐五个关键部件，再完成本周音乐宠物。</p>
      </div>

      <div className="section-surface">
        <PixelSectionTitle title="COLLECTED ITEMS" subtitle="已收錄的素材會在這裡像遊戲獎勵一樣排列。" variant="dark" />
        <div className="grid grid-cols-2 gap-4 mt-4">
        {collectedItems.map((item, index) => {
          if (!item) {
            return (
              <div key={index} className="aspect-square bg-white pixel-border pixel-shadow flex items-center justify-center text-[var(--color-text)] opacity-50 relative border-dashed">
                <div className="absolute top-1 left-2 font-bold opacity-40">D{index + 1}</div>
                <div className="text-4xl">❓</div>
              </div>
            );
          }
          return (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={index} className="aspect-square bg-white pixel-border pixel-shadow flex flex-col items-center justify-center p-2 relative">
               <div className="absolute top-1 left-2 text-xs font-bold bg-[var(--color-green)] border-2 border-[var(--color-black)] px-1 rounded-md">D{index + 1}</div>
               <div className="absolute right-2 top-2"><PixelBadge className="bg-white">COLLECTED</PixelBadge></div>
               <PixelItemPlaceholder genre={item.genre} part={item.part} imageSrc={item.imageSrc} className="w-full h-full border-none shadow-none bg-transparent" />
            </motion.div>
          );
        })}
        </div>
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

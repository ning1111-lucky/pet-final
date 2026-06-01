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
    <div className="page-stack">
      <div className="page-title-group pixel-dot-trail">
        <div className="type-caption uppercase tracking-[0.18em] text-white/90">MY COLLECTION</div>
        <h2 className="page-title text-white drop-shadow-[0_3px_0_rgba(17,17,17,0.14)]">今日收錄物品</h2>
        <p className="page-subtitle text-white/85">把本週掉落的服裝、鞋子與配件整理成你的收藏頁。</p>
      </div>

      <div className="section-surface">
        <div className="flex flex-wrap gap-2 mb-4">
          <PixelBadge className="bg-[var(--color-primary)]">全部</PixelBadge>
          <PixelBadge className="bg-white">服裝</PixelBadge>
          <PixelBadge className="bg-white">鞋子</PixelBadge>
          <PixelBadge className="bg-white">配飾</PixelBadge>
        </div>
        <PixelSectionTitle title="本週收藏" subtitle="已收錄的素材會在這裡像收藏卡一樣排列。" variant="dark" />
        <div className="grid grid-cols-2 gap-4 mt-4">
        {collectedItems.map((item, index) => {
          if (!item) {
            return (
              <div key={index} className="aspect-square bg-white pixel-border pixel-shadow flex items-center justify-center text-[var(--color-text)] opacity-50 relative border-dashed rounded-[24px]">
                <div className="absolute top-1 left-2 font-bold opacity-40">D{index + 1}</div>
                <div className="text-4xl">❓</div>
              </div>
            );
          }
          return (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} key={index} className="aspect-square bg-white pixel-border pixel-shadow flex flex-col items-center justify-center p-3 relative rounded-[24px]">
               <div className="absolute top-3 left-3 text-xs font-bold bg-[var(--color-primary)] px-2 py-1 rounded-full">D{index + 1}</div>
               <div className="absolute right-3 top-3"><PixelBadge className="bg-white">COLLECTED</PixelBadge></div>
               <PixelItemPlaceholder genre={item.genre} part={item.part} imageSrc={item.imageSrc} className="w-full h-full border-none shadow-none bg-transparent" />
               <div className="mt-2 text-center">
                 <div className="type-label">{item.label || `${item.genre} ${item.part}`}</div>
                 <div className="type-caption mt-1">已收錄至本週收藏</div>
               </div>
            </motion.div>
          );
        })}
        </div>
      </div>

      {isWeekFull && (
        <div className="section-surface text-center">
           <h3 className="type-h2 mb-2">收集完成</h3>
           <p className="type-body mb-4">你已經集滿本週五件物品，可以回到今日分析完成最終寵物生成。</p>
           <Button onClick={handleGenPet} className="w-full">✨ 切換至今日（D3）確認生成音樂寵物 ✨</Button>
        </div>
      )}
    </div>
  );
};

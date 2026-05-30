import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Card, Button, PixelItemPlaceholder } from "../components/UI";
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
      <div className="text-center">
        <h2 className="text-xl font-bold bg-white inline-block px-2 border-2 border-[var(--color-brown)] rounded-md shadow-sm mb-2">本週收集</h2>
        <p className="text-sm opacity-80 font-bold bg-white inline-block px-1 rounded shadow-sm border border-gray-200">快集滿五件，解鎖音樂寵物！</p>
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
        <Card className="text-center bg-[var(--color-sand)] mt-4">
           <h3 className="font-bold text-lg mb-2">收集完成！</h3>
           <p className="text-xs mb-4">你已經集滿本週五件物品～</p>
           <Button onClick={handleGenPet} className="w-full">✨ 切換至今日（D3）確認生成音樂寵物 ✨</Button>
        </Card>
      )}
    </div>
  );
};

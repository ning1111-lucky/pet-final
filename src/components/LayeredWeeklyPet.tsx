import React from "react";
import { MusicItem } from "../types";
import { cn } from "../utils";

export const defaultPlacementMap: Record<string, any> = {
  shoes: { zIndex: 2 },
  clothes: { zIndex: 3 },
  accessory: { zIndex: 4 },
  handheld: { zIndex: 5 },
  headwear: { zIndex: 6 },
  enhance: { zIndex: 7 }
};

interface LayeredWeeklyPetProps {
  baseSrc: string | null;
  items: MusicItem[];
  className?: string;
}

export const LayeredWeeklyPet: React.FC<LayeredWeeklyPetProps> = ({ baseSrc, items, className }) => {
  return (
    <div
      className={cn(
        "relative w-[300px] h-[300px] mx-auto bg-[#FFF8EC] border-[3px] border-[#4A2C17] rounded-[18px] overflow-visible",
        className
      )}
    >
      {baseSrc ? (
        <img
          src={baseSrc}
          alt="Base Pet"
          className="absolute inset-0 w-full h-full object-contain z-[1]"
          style={{ imageRendering: "pixelated" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-6xl z-[1]">
          ✨
        </div>
      )}

      {items.map((item) => {
        if (!item?.imageSrc || !item.part) return null;
        
        const placement = defaultPlacementMap[item.part] || {};

        return (
          <img
            key={item.id}
            src={item.imageSrc}
            alt={item.part}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              imageRendering: "pixelated",
              zIndex: placement.zIndex,
            }}
          />
        );
      })}
    </div>
  );
};

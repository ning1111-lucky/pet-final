import React from "react";
import { cn } from "../utils";
import { Genre, ItemPart } from "../types";
import { getAssetErrorFallback, resolveAssetImage } from "../assetMap";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }>(({ className, variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "pixel-button font-bold px-4 py-3 select-none text-center",
        variant === "primary" ? "bg-[var(--color-caramel)] text-[var(--color-cream)]" : "bg-[var(--color-sand)] text-[var(--color-brown)]",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("bg-[var(--color-card)] pixel-border pixel-shadow p-4", className)}>
      {children}
    </div>
  );
};

// Map genre to emoji to act as placeholder until PNGs
const getGenreIcon = (genre: Genre): string => {
  const map: Record<Genre | string, string> = {
    Pop: "🎤", "Hip-hop": "🧢", "K-pop": "✨", EDM: "⚡",
    Classical: "🎻", Jazz: "🎷", "R&B": "🍷", Country: "🤠",
    Rock: "🎸", "Taiwan Indie": "🛵", Mixed: "🌀", Hidden: "🌟"
  };
  return map[genre] || "🎵";
};

// Map part to a base symbol
const getPartIcon = (part: ItemPart): string => {
  const map: Record<ItemPart | string, string> = {
    clothes: "👕", headwear: "👒", accessory: "💍", handheld: "🪄", shoes: "👞", enhance: "✨", "final weekly pet": "🥚"
  };
  return map[part] || "🧩";
};

export const PixelItemPlaceholder: React.FC<{
  genre: Genre;
  part: ItemPart;
  label?: string;
  imageSrc?: string | null;
  className?: string;
}> = ({ genre, part, label, imageSrc, className }) => {
  // Check if we have a real PNG mapped for this genre and part.
  const imagePath: string | null = imageSrc || resolveAssetImage(genre, part, `${genre}-${part}`) || null;
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [imagePath]);

  return (
    <div className={cn("flex flex-col items-center justify-center p-2 bg-[var(--color-cream)] border-2 border-dashed border-[var(--color-brown)] rounded-sm overflow-hidden relative group", className)}>
      {imagePath && !imageFailed ? (
        <div className="flex flex-col items-center">
          <img
            src={imagePath}
            alt={`${genre} ${part}`}
            className="w-16 h-16 object-contain"
            style={{ imageRendering: "pixelated" }}
            onError={(event) => {
              const fallback = getAssetErrorFallback(genre, part, imagePath, `${genre}-${part}`);
              if (fallback && fallback !== imagePath) {
                (event.currentTarget as HTMLImageElement).src = fallback;
                return;
              }
              setImageFailed(true);
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="text-3xl relative">
            <span>{getPartIcon(part)}</span>
            <span className="absolute bottom-[-4px] right-[-4px] text-lg bg-[var(--color-cream)] rounded-full pt-1">{getGenreIcon(genre)}</span>
          </div>
          <div className="mt-2 text-[10px] font-bold text-center text-red-500">缺少素材：{genre} {part}</div>
        </div>
      )}
      {label && <div className="mt-2 text-[10px] font-bold text-center leading-tight truncate">{label}</div>}
    </div>
  );
};

export const PetPlaceholder: React.FC<{
  baseType: "O" | "G" | "B";
  className?: string;
}> = ({ baseType, className }) => {
  // CSS drawn base body
  let shapeClass = "";
  if (baseType === "O") shapeClass = "rounded-full w-24 h-24";
  if (baseType === "G") shapeClass = "rounded-t-full rounded-b-xl w-20 h-28";
  if (baseType === "B") shapeClass = "rounded-xl w-24 h-24";

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className={cn("bg-[var(--color-cream)] border-[4px] border-[var(--color-brown)] relative shadow-inner overflow-hidden flex items-center justify-center", shapeClass)}>
        {/* Eyes */}
        <div className="absolute top-[35%] flex w-full justify-center space-x-6">
          <div className="w-2 h-2 bg-[var(--color-brown)] rounded-full"></div>
          <div className="w-2 h-2 bg-[var(--color-brown)] rounded-full"></div>
        </div>
        {/* Blush */}
        <div className="absolute top-[45%] flex w-full justify-center space-x-8 opacity-60">
          <div className="w-3 h-1.5 bg-[var(--color-blush)] rounded-full"></div>
          <div className="w-3 h-1.5 bg-[var(--color-blush)] rounded-full"></div>
        </div>
        {/* Mouth */}
        <div className="absolute top-[45%] w-3 h-2 border-b-2 border-r-2 border-[var(--color-brown)] rounded-br-full transform rotate-45"></div>
      </div>
    </div>
  );
};

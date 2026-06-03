import React from "react";
import { cn } from "../utils";
import { Genre, ItemPart, MusicItem } from "../types";
import { getAssetErrorFallback, resolveAssetImage } from "../assetMap";

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "pink" | "blue" }>(({ className, variant = "primary", ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "pixel-button type-button select-none text-center",
        variant === "primary" && "pixel-button-primary",
        variant === "secondary" && "pixel-button-secondary",
        variant === "pink" && "pixel-button-pink",
        variant === "blue" && "pixel-button-blue",
        className,
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
export const PixelButton = Button;

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("pixel-card", className)}>{children}</div>;
};
export const PixelCard = Card;

export const PixelBadge = ({ children, className, tone = "default" }: { children: React.ReactNode; className?: string; tone?: "default" | "green" | "pink" | "yellow" | "blue" }) => (
  <span className={cn("info-chip", `info-chip-${tone}`, className)}>{children}</span>
);

export const PixelSectionTitle = ({
  eyebrow,
  title,
  subtitle,
  className,
  variant = "light",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  variant?: "light" | "dark";
}) => (
  <div className={cn("page-title-group", className)}>
    {eyebrow ? <div className={cn("type-caption uppercase tracking-[0.18em]", variant === "light" ? "text-white/90" : "text-[var(--color-muted)]")}>{eyebrow}</div> : null}
    <h2 className={cn(variant === "light" ? "page-title" : "type-h2 text-[var(--color-text)]")}>{title}</h2>
    {subtitle ? <p className={cn(variant === "light" ? "page-subtitle" : "type-body text-[var(--color-muted)]")}>{subtitle}</p> : null}
  </div>
);

export const PixelProgressBar = ({
  segments,
}: {
  segments: Array<{ label: string; percentage: number; color: string }>;
}) => (
  <div className="pixel-progress">
    <div className="flex h-full overflow-hidden rounded-[999px]">
      {segments.map((segment, index) => (
        <div
          key={`${segment.label}-${index}`}
          className="flex h-full items-center justify-center overflow-hidden whitespace-nowrap text-[8px] font-black text-[var(--color-text)]"
          style={{ width: `${segment.percentage}%`, backgroundColor: segment.color }}
        >
          {segment.percentage > 12 ? segment.label : ""}
        </div>
      ))}
    </div>
  </div>
);

export const PixelStatusBar = ({ gems = 120, level = 1, progress = 32 }: { gems?: number; level?: number; progress?: number }) => (
  <div className="pixel-status-bar">
    <div className="pixel-status-left">
      <div className="pixel-avatar-box">🐱</div>
      <div className="pixel-level-stack">
        <div className="pixel-level-label">LV.{String(level).padStart(2, "0")}</div>
        <div className="pixel-mini-progress">
          <span style={{ width: `${Math.max(12, Math.min(100, progress))}%` }} />
        </div>
      </div>
    </div>
    <div className="pixel-status-right">
      <div className="pixel-gem-chip">💎 {gems}</div>
      <button type="button" className="pixel-icon-btn" aria-label="add gems">＋</button>
      <button type="button" className="pixel-icon-btn" aria-label="menu">☰</button>
    </div>
  </div>
);

export const PixelLogoTitle = ({ title, subtitle, kicker, className }: { title: string; subtitle?: string; kicker?: string; className?: string }) => (
  <div className={cn("pixel-logo-title", className)}>
    {kicker ? <div className="pixel-logo-kicker">{kicker}</div> : null}
    <div className="pixel-logo-main">{title}</div>
    {subtitle ? <div className="pixel-logo-subtitle">{subtitle}</div> : null}
  </div>
);

export const WindowTitleBar = ({ title, tone = "pink", children }: { title: string; tone?: "pink" | "yellow" | "green" | "blue"; children?: React.ReactNode }) => (
  <div className={cn("retro-window-titlebar", `tone-${tone}`)}>
    <span>{title}</span>
    <div className="retro-window-controls">{children ?? <><i /> <i /> <i /></>}</div>
  </div>
);

export const RetroWindow = ({ title, tone = "pink", className, children, bodyClassName }: { title: string; tone?: "pink" | "yellow" | "green" | "blue"; className?: string; bodyClassName?: string; children: React.ReactNode }) => (
  <section className={cn("retro-window", className)}>
    <WindowTitleBar title={title} tone={tone} />
    <div className={cn("retro-window-body", bodyClassName)}>{children}</div>
  </section>
);

export const PixelProgress = ({ label, value, max, color = "var(--color-primary)" }: { label?: string; value: number; max: number; color?: string }) => {
  const safeMax = Math.max(1, max);
  const percentage = Math.max(0, Math.min(100, (value / safeMax) * 100));

  return (
    <div className="pixel-progress-stack">
      {label ? <div className="pixel-progress-label">{label}</div> : null}
      <div className="pixel-progress-large">
        <span style={{ width: `${percentage}%`, background: color }} />
      </div>
      <div className="pixel-progress-value">{value} / {max}</div>
    </div>
  );
};

const getGenreIcon = (genre: Genre): string => {
  const map: Record<Genre | string, string> = {
    Pop: "🎤", "Hip-hop": "🧢", "K-pop": "✨", EDM: "⚡",
    Classical: "🎻", Jazz: "🎷", "R&B": "🍷", Country: "🤠",
    Rock: "🎸", "Taiwan Indie": "🛵", Mixed: "🌀", Hidden: "🌟"
  };
  return map[genre] || "🎵";
};

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
  const imagePath: string | null = imageSrc || resolveAssetImage(genre, part, `${genre}-${part}`) || null;
  const [imageFailed, setImageFailed] = React.useState(false);

  React.useEffect(() => {
    setImageFailed(false);
  }, [imagePath]);

  return (
    <div className={cn("flex flex-col items-center justify-center p-2 bg-[var(--color-card-secondary)] border border-[rgba(17,17,17,0.08)] rounded-[18px] overflow-hidden relative group", className)}>
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
            <span className="absolute bottom-[-4px] right-[-4px] text-lg bg-white rounded-full pt-1">{getGenreIcon(genre)}</span>
          </div>
          <div className="type-caption mt-2 text-center text-red-500">缺少素材：{genre} {part}</div>
        </div>
      )}
      {label && <div className="type-caption mt-2 text-center leading-tight truncate">{label}</div>}
    </div>
  );
};

export const PixelItemCard = ({ item, fallbackDay, className }: { item?: MusicItem | null; fallbackDay?: number; className?: string }) => {
  if (!item) {
    return (
      <div className={cn("pixel-item-card opacity-70", className)}>
        <div className="pixel-item-thumb flex items-center justify-center text-3xl">❔</div>
        <div className="pixel-item-name">未解鎖</div>
        <div className="pixel-item-stars">☆ ☆ ☆</div>
      </div>
    );
  }

  return (
    <div className={cn("pixel-item-card", className)}>
      <div className="pixel-item-day">D{item.sourceDay || fallbackDay || 1}</div>
      <div className="pixel-item-thumb">
        <PixelItemPlaceholder genre={item.genre} part={item.part} imageSrc={item.imageSrc} className="w-full h-full border-none shadow-none bg-transparent" />
      </div>
      <div className="pixel-item-name">{item.label || `${item.genre} ${item.part}`}</div>
      <div className="pixel-item-stars">★ ★ ★</div>
    </div>
  );
};

export const PixelPetPreview = ({ imageSrc, title, subtitle, className }: { imageSrc?: string | null; title?: string; subtitle?: string; className?: string }) => (
  <div className={cn("pixel-pet-preview", className)}>
    <div className="pixel-pet-preview-frame">
      {imageSrc ? <img src={imageSrc} alt={title || "pet"} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} /> : <img src="/base-1.png" alt="pet base" className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />}
    </div>
    {title ? <div className="pixel-pet-preview-title">{title}</div> : null}
    {subtitle ? <div className="pixel-pet-preview-subtitle">{subtitle}</div> : null}
  </div>
);

export const PixelMap = ({ children }: { children: React.ReactNode }) => <div className="pixel-map-surface">{children}</div>;

export const PetPlaceholder: React.FC<{
  baseType: "O" | "G" | "B";
  className?: string;
}> = ({ baseType, className }) => {
  let shapeClass = "";
  if (baseType === "O") shapeClass = "rounded-full w-24 h-24";
  if (baseType === "G") shapeClass = "rounded-t-full rounded-b-xl w-20 h-28";
  if (baseType === "B") shapeClass = "rounded-xl w-24 h-24";

  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <div className={cn("bg-white border border-[rgba(17,17,17,0.08)] relative shadow-inner overflow-hidden flex items-center justify-center", shapeClass)}>
        <div className="absolute top-[35%] flex w-full justify-center space-x-6">
          <div className="w-2 h-2 bg-[var(--color-text)] rounded-full"></div>
          <div className="w-2 h-2 bg-[var(--color-text)] rounded-full"></div>
        </div>
        <div className="absolute top-[45%] flex w-full justify-center space-x-8 opacity-60">
          <div className="w-3 h-1.5 bg-[var(--color-pink)] rounded-full"></div>
          <div className="w-3 h-1.5 bg-[var(--color-pink)] rounded-full"></div>
        </div>
        <div className="absolute top-[45%] w-3 h-2 border-b-2 border-r-2 border-[var(--color-text)] rounded-br-full transform rotate-45"></div>
      </div>
    </div>
  );
};

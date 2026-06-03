import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, Card, Input } from "pixel-retroui";
import { PixelBadge, PixelSectionTitle } from "../components/UI";
import { motion } from "motion/react";
import { MusicProvider } from "../types";

const RetroButton = Button as unknown as React.ComponentType<React.PropsWithChildren<Record<string, unknown>>>;

const retroCardProps = {
  bg: "var(--color-card)",
  textColor: "var(--color-text)",
  borderColor: "var(--color-black)",
  shadowColor: "var(--color-black)",
  style: { fontFamily: "var(--font-body)" } as React.CSSProperties,
};

const retroInputProps = {
  bg: "var(--color-card)",
  textColor: "var(--color-text)",
  borderColor: "var(--color-black)",
  style: {
    fontFamily: "var(--font-body)",
    width: "100%",
    "--input-custom-bg": "var(--color-card)",
    "--input-custom-text": "var(--color-text)",
    "--input-custom-border": "var(--color-black)",
  } as React.CSSProperties & Record<string, string>,
};

function getButtonTheme(variant: "primary" | "secondary" = "primary") {
  if (variant === "secondary") {
    return {
      bg: "var(--color-card)",
      textColor: "var(--color-text)",
      shadow: "var(--color-black)",
      borderColor: "var(--color-black)",
    } as const;
  }

  return {
    bg: "var(--color-primary)",
    textColor: "var(--color-text)",
    shadow: "var(--color-black)",
    borderColor: "var(--color-black)",
  } as const;
}

async function readApiJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const rawText = await response.text().catch(() => "");
  if (!rawText.trim()) {
    return { error: "同步失敗，請重試" };
  }

  try {
    const parsed = JSON.parse(rawText);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : { error: "同步失敗，請重試" };
  } catch {
    return { error: rawText.trim() || "同步失敗，請重試" };
  }
}

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("");
  const [musicProvider, setMusicProvider] = useState<MusicProvider>("spotify");
  const [lastfmUsername, setLastfmUsername] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const needsLastFmUsername = musicProvider === "lastfm";
    if (name && email && country && city && agreed && (!needsLastFmUsername || lastfmUsername.trim())) {
      setSubmitError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/notion/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            country,
            city,
            style,
            musicProvider,
            lastfmUsername,
          }),
        });

        const data = await readApiJsonResponse(response);
        if (!response.ok || data.ok !== true) {
          throw new Error(typeof data.error === "string" ? data.error : "Notion 使用者同步失敗");
        }

        login({ name, email, country, city, style, musicProvider, lastfmUsername, agreed });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Notion 使用者同步失敗");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const providerOptions: Array<{
    value: MusicProvider;
    badge: string;
    title: string;
    subtitle: string;
    hint: string;
  }> = [
    {
      value: "spotify",
      badge: "SPOTIFY",
      title: "Spotify 直連",
      subtitle: "授權讀取最近播放、常聽藝人與音樂風格",
      hint: "最像真正使用情境，點下去後會跳轉到 Spotify 完成授權。",
    },
    {
      value: "lastfm",
      badge: "SYNC",
      title: "通用同步模式",
      subtitle: "適用 YouTube Music、Apple Music、網易雲與其他可同步到 Last.fm 的平台",
      hint: "只要你的播放器能同步到 Last.fm，就能用最近播放紀錄產生音樂寵物。",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-stack">
      <div className="w-full space-y-[18px]">
        <Card {...retroCardProps} className="pixel-card flex items-center justify-between gap-4 bg-[var(--color-card-secondary)] px-4 py-4 !m-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border-[3px] border-[var(--color-black)] bg-[var(--color-pink)] shadow-[4px_4px_0_var(--color-black)] text-[28px]">
              ♪
            </div>
            <div className="min-w-0">
              <div className="text-[1.1rem] font-extrabold leading-none text-[var(--color-text)]">Playlist Pet</div>
              <div className="type-caption mt-1 text-[var(--color-text-secondary)]">把你的聽歌紀錄孵化成音樂寵物</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="收藏"
            className="flex h-14 w-14 items-center justify-center rounded-[20px] border-[3px] border-[var(--color-black)] bg-white shadow-[4px_4px_0_var(--color-black)] text-[28px] leading-none"
          >
            ♡
          </button>
        </Card>

        <Card {...retroCardProps} className="pixel-card bg-white px-5 py-5 !m-0">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <PixelBadge className="bg-[var(--color-primary)] text-[var(--color-text)]">MUSIC PET HATCH</PixelBadge>
              <div className="space-y-3">
                <h1 className="text-left text-[2rem] font-extrabold leading-[1.08] tracking-[-0.04em] text-[var(--color-text)]">
                  把你的聽歌紀錄
                  <br />
                  孵化成寵物
                </h1>
                <p className="type-body text-[var(--color-text)] opacity-90">
                  連結音樂來源，收集 3 天素材，最後生成專屬於你的音樂寵物。
                </p>
              </div>
            </div>

            <div className="w-[108px] flex-shrink-0 space-y-3">
              <div className="rounded-[22px] border-[3px] border-[var(--color-black)] bg-[#eef6ff] p-2 shadow-[4px_4px_0_var(--color-black)]">
                <img src="/base-1.png" alt="music pet hero" className="w-full rounded-[18px] bg-white p-2" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <RetroButton
            type="button"
            {...getButtonTheme(musicProvider === "spotify" ? "primary" : "secondary")}
            onClick={() => setMusicProvider("spotify")}
            className="!m-0 !w-full !px-4 !py-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Spotify 直連
          </RetroButton>
          <RetroButton
            type="button"
            {...getButtonTheme(musicProvider === "lastfm" ? "primary" : "secondary")}
            onClick={() => setMusicProvider("lastfm")}
            className="!m-0 !w-full !px-4 !py-3"
            style={{ fontFamily: "var(--font-body)" }}
          >
            通用同步模式
          </RetroButton>
        </div>

        <Card {...retroCardProps} className="w-full px-5 py-5 bg-white !m-0">
          <div className="space-y-5">
            <PixelSectionTitle
              eyebrow="STEP 1"
              title="選擇你的音樂入口"
              subtitle="正式版保留兩種方式：Spotify 直連，或透過 Last.fm 做通用同步。"
              variant="dark"
              className="items-start text-left"
            />

            <div className="grid grid-cols-1 gap-3">
              {providerOptions.map((option) => {
                const selected = musicProvider === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMusicProvider(option.value)}
                    className="text-left transition-transform hover:-translate-y-0.5"
                  >
                    <Card
                      bg={selected ? "var(--color-primary)" : "var(--color-card)"}
                      textColor="var(--color-text)"
                      borderColor="var(--color-black)"
                      shadowColor="var(--color-black)"
                      style={{ fontFamily: "var(--font-body)" }}
                      className="!m-0 rounded-[24px] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full border border-[rgba(17,17,17,0.08)] bg-white px-3 py-1 type-caption">
                            {option.badge}
                          </div>
                          <div className="type-label text-[18px]">{option.title}</div>
                          <div className="type-body opacity-90">{option.subtitle}</div>
                        </div>
                        <div
                          className={[
                            "mt-1 h-6 w-6 flex-shrink-0 rounded-full border",
                            selected ? "border-[rgba(17,17,17,0.12)] bg-white shadow-[inset_0_0_0_6px_var(--color-primary-strong)]" : "border-[rgba(17,17,17,0.12)] bg-white",
                          ].join(" ")}
                        />
                      </div>
                      <div className="type-caption mt-2 leading-relaxed text-[var(--color-muted)]">{option.hint}</div>
                    </Card>
                  </button>
                );
              })}
            </div>

            {musicProvider === "lastfm" && (
              <div className="rounded-[24px] border border-[rgba(17,17,17,0.06)] bg-[var(--color-card-secondary)] p-4 shadow-[var(--shadow-soft)]">
                <div className="type-label text-[var(--color-text)]">通用同步模式帳號</div>
                <p className="type-caption mt-2 leading-relaxed text-[var(--color-muted)]">
                  這個模式適合 YouTube Music、Apple Music、網易雲音樂，或任何能同步到 Last.fm 的播放器。
                </p>
                <Input
                  {...retroInputProps}
                  required
                  value={lastfmUsername}
                  onChange={e => setLastfmUsername(e.target.value)}
                  className="w-full !mt-3"
                  placeholder="輸入你的 Last.fm 使用者名稱"
                />
              </div>
            )}
          </div>
        </Card>

        <Card {...retroCardProps} className="w-full px-5 py-5 bg-white !m-0">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <PixelSectionTitle eyebrow="STEP 2" title="建立你的音樂護照" variant="dark" className="items-start text-left" />

            <div className="grid gap-4">
              <div className="flex flex-col space-y-1">
                <label className="type-label text-[var(--color-text)]">姓名 / 暱稱</label>
                <Input {...retroInputProps} required value={name} onChange={e => setName(e.target.value)} className="w-full" />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="type-label text-[var(--color-text)]">Email</label>
                <Input {...retroInputProps} required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full" />
              </div>
            </div>
            <div className="grid gap-4">
              <div className="flex min-w-0 flex-col space-y-1">
                <label className="type-label text-[var(--color-text)]">國家 / 地區</label>
                <Input {...retroInputProps} required value={country} onChange={e => setCountry(e.target.value)} className="w-full" />
              </div>
              <div className="flex min-w-0 flex-col space-y-1">
                <label className="type-label text-[var(--color-text)]">城市</label>
                <Input {...retroInputProps} required value={city} onChange={e => setCity(e.target.value)} className="w-full" />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="type-label text-[var(--color-text)]">穿搭風格 (選填)</label>
              <Input {...retroInputProps} value={style} onChange={e => setStyle(e.target.value)} className="w-full" placeholder="例：日系、Y2K" />
            </div>

            <label className="flex cursor-pointer items-start space-x-2 rounded-[18px] border border-[rgba(17,17,17,0.06)] bg-[var(--color-card-secondary)] px-3 py-3 shadow-[var(--shadow-soft)]">
              <input required type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 flex-shrink-0" />
              <span className="type-caption leading-relaxed opacity-90">我同意將音樂紀錄用於生成音樂寵物與研究展示。</span>
            </label>

            {submitError && (
              <div className="type-caption rounded-[18px] border border-red-200 bg-red-50 px-3 py-3 text-red-600">
                {submitError}
              </div>
            )}

            <div className="pt-2">
              <RetroButton
                type="submit"
                {...getButtonTheme("primary")}
                className="w-full !m-0 !py-4 !text-[1rem]"
                disabled={isSubmitting || !name || !email || !country || !city || !agreed || (musicProvider === "lastfm" && !lastfmUsername.trim())}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {isSubmitting ? "正在建立音樂護照..." : "開始音樂旅程"}
              </RetroButton>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, Card, PixelBadge, PixelSectionTitle } from "../components/UI";
import { motion } from "motion/react";
import { MusicProvider } from "../types";

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[100dvh]">
      <div className="w-full max-w-[390px] space-y-5">
        <section className="pixel-card relative overflow-hidden bg-[var(--color-card)] px-6 pt-6 pb-6 mx-0">
          <div className="absolute top-4 right-4 text-[20px] leading-none text-[var(--color-pink)]">♡</div>
          <div className="absolute bottom-5 right-6 text-[18px] leading-none text-[var(--color-yellow)]">✦</div>

          <div className="grid grid-cols-[1fr_106px] gap-4 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <PixelBadge className="bg-[var(--color-green)]">MUSIC PET HATCH</PixelBadge>
                <h1 className="text-[var(--color-text)] text-left text-[2.2rem] font-extrabold leading-[1.02] tracking-[-0.045em]">
                  把你的
                  <br />
                  聽歌紀錄
                  <br />
                  孵化成寵物
                </h1>
                <p className="type-body max-w-[208px] text-[var(--color-text)] opacity-90">
                  連接音樂來源、收集 3 天素材，最後生成一隻屬於你的像素音樂寵物。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={musicProvider === "spotify" ? "primary" : "secondary"}
                  onClick={() => setMusicProvider("spotify")}
                  className="!px-4 !py-2"
                >
                  Spotify 直連
                </Button>
                <Button
                  type="button"
                  variant={musicProvider === "lastfm" ? "primary" : "secondary"}
                  onClick={() => setMusicProvider("lastfm")}
                  className="!px-4 !py-2"
                >
                  通用同步模式
                </Button>
              </div>
            </div>

            <div className="relative h-[180px]">
              <div className="absolute left-0 top-7 w-[82px] rounded-[18px] border-[3px] border-[var(--color-black)] bg-[#fff8ec] p-2 shadow-[4px_4px_0_var(--color-black)] rotate-[-8deg]">
                <img src="/base-1.png" alt="music pet card" className="w-full rounded-[16px] bg-[#ffe3d8] p-2" />
                <div className="type-caption mt-2">Pet Seed</div>
                <div className="type-label mt-1">Day 1-3</div>
              </div>
              <div className="absolute right-0 top-0 w-[86px] rounded-[18px] border-[3px] border-[var(--color-black)] bg-[#fff8ec] p-2 shadow-[4px_4px_0_var(--color-black)] rotate-[7deg]">
                <img src="/base-2.png" alt="music pet companion" className="w-full rounded-[16px] bg-[#d8e9ff] p-2" />
                <div className="type-caption mt-2">Source</div>
                <div className="type-label mt-1">Connect</div>
              </div>
              <div className="absolute right-1 bottom-2 w-[78px] rounded-[16px] border-[3px] border-[var(--color-black)] bg-[var(--color-green)] px-3 py-2 shadow-[4px_4px_0_var(--color-black)]">
                <div className="type-label">Ready</div>
                <div className="type-caption mt-1">to hatch</div>
              </div>
            </div>
          </div>
        </section>

        <Card className="w-full px-5 py-5 space-y-5 bg-white">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
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
                    className={[
                      "text-left rounded-[20px] border-[4px] p-4 transition-all",
                      selected
                        ? "border-[var(--color-black)] shadow-[6px_6px_0_var(--color-black)] -translate-y-0.5 bg-[var(--color-green)]"
                        : "border-[var(--color-black)] shadow-[4px_4px_0_rgba(17,17,17,0.14)] hover:-translate-y-0.5 bg-white",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="inline-flex rounded-full border-[3px] border-[var(--color-black)] bg-white px-3 py-1 type-caption">
                          {option.badge}
                        </div>
                        <div className="type-label text-[18px]">{option.title}</div>
                        <div className="type-body opacity-85">{option.subtitle}</div>
                      </div>
                      <div
                        className={[
                          "w-6 h-6 rounded-full border-[2px] flex-shrink-0 mt-1",
                          selected ? "border-[var(--color-black)] bg-[var(--color-yellow)] shadow-[inset_0_0_0_4px_white]" : "border-[var(--color-black)] bg-white",
                        ].join(" ")}
                      />
                    </div>
                    <div className="type-caption text-[var(--color-muted)] mt-3 leading-relaxed">
                      {option.hint}
                    </div>
                  </button>
                );
              })}
            </div>

            {musicProvider === "lastfm" && (
              <div className="rounded-[22px] border-[4px] border-[var(--color-black)] bg-white p-4 shadow-[4px_4px_0_rgba(17,17,17,0.18)]">
                <div className="type-label text-[var(--color-text)]">通用同步模式帳號</div>
                <p className="type-caption text-[var(--color-muted)] mt-2 leading-relaxed">
                  這個模式適合 YouTube Music、Apple Music、網易雲音樂，或任何能同步到 Last.fm 的播放器。
                </p>
                <input
                  required
                  value={lastfmUsername}
                  onChange={e => setLastfmUsername(e.target.value)}
                  className="pixel-input mt-3"
                  placeholder="輸入你的 Last.fm 使用者名稱"
                />
              </div>
            )}

            <PixelSectionTitle eyebrow="STEP 2" title="建立你的音樂護照" variant="dark" className="items-start text-left" />

            <div className="flex flex-col space-y-1">
              <label className="type-label text-[var(--color-text)]">姓名 / 暱稱</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="pixel-input" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="type-label text-[var(--color-text)]">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="pixel-input" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1 min-w-0">
                <label className="type-label text-[var(--color-text)]">國家 / 地區</label>
                <input required value={country} onChange={e => setCountry(e.target.value)} className="pixel-input" />
              </div>
              <div className="flex flex-col space-y-1 min-w-0">
                <label className="type-label text-[var(--color-text)]">城市</label>
                <input required value={city} onChange={e => setCity(e.target.value)} className="pixel-input" />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="type-label text-[var(--color-text)]">穿搭風格 (選填)</label>
              <input value={style} onChange={e => setStyle(e.target.value)} className="pixel-input" placeholder="例：日系、Y2K" />
            </div>

            <label className="flex items-start space-x-2 cursor-pointer rounded-[18px] border-[3px] border-[var(--color-black)] bg-white px-3 py-3 shadow-[3px_3px_0_rgba(17,17,17,0.1)]">
              <input required type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 flex-shrink-0 w-4 h-4" />
              <span className="type-caption opacity-90 leading-relaxed">我同意將音樂紀錄用於生成音樂寵物與研究展示。</span>
            </label>

            {submitError && (
              <div className="type-caption text-red-600 rounded-[18px] border border-red-200 bg-red-50 px-3 py-3">
                {submitError}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full !py-4 !text-[1rem]"
                disabled={isSubmitting || !name || !email || !country || !city || !agreed || (musicProvider === "lastfm" && !lastfmUsername.trim())}
              >
                {isSubmitting ? "正在建立音樂護照..." : "開始音樂旅程"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

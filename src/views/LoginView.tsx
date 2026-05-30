import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, Card } from "../components/UI";
import { motion } from "motion/react";
import { MusicProvider } from "../types";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const needsLastFmUsername = musicProvider === "lastfm";
    if (name && email && country && city && agreed && (!needsLastFmUsername || lastfmUsername.trim())) {
      login({ name, email, country, city, style, musicProvider, lastfmUsername, agreed });
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
        <section className="relative overflow-hidden rounded-[32px] border-[3px] border-[var(--color-brown)] bg-[linear-gradient(135deg,#e6ff36_0%,#d4ff4d_46%,#f4f0e6_46%,#f4f0e6_100%)] px-5 pt-5 pb-6 shadow-[8px_8px_0_var(--color-brown)]">
          <div className="absolute -top-2 left-3 text-[42px] leading-none">✳</div>
          <div className="absolute top-4 right-4 text-[34px] leading-none">♡</div>

          <div className="grid grid-cols-[1fr_120px] gap-4 items-start">
            <div className="space-y-4 pt-8">
              <div className="space-y-2">
                <div className="type-caption uppercase tracking-[0.18em] text-[var(--color-brown)]/70">
                  Music Pet Hatch
                </div>
                <h1 className="type-h1 text-[44px] leading-[0.92]">
                  把你的
                  <br />
                  聽歌紀錄
                  <br />
                  孵化成寵物
                </h1>
                <p className="type-body max-w-[180px] opacity-80">
                  連接音樂來源、收集 3 天素材，最後生成一隻屬於你的像素音樂寵物。
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="info-chip bg-white/90">Spotify 直連</span>
                <span className="info-chip bg-white/90">通用同步模式</span>
              </div>
            </div>

            <div className="relative h-[196px]">
              <div className="absolute left-1 top-7 w-[88px] rounded-[22px] border-[3px] border-[var(--color-brown)] bg-[#fff8ec] p-2 shadow-[4px_4px_0_var(--color-brown)] rotate-[-10deg]">
                <img src="/base-1.png" alt="music pet card" className="w-full rounded-[16px] bg-[#ffe3d8] p-2" />
                <div className="type-caption mt-2">Pet Seed</div>
                <div className="type-label mt-1">Day 1-3</div>
              </div>
              <div className="absolute right-0 top-0 w-[92px] rounded-[22px] border-[3px] border-[var(--color-brown)] bg-[#fff8ec] p-2 shadow-[4px_4px_0_var(--color-brown)] rotate-[8deg]">
                <img src="/base-2.png" alt="music pet companion" className="w-full rounded-[16px] bg-[#d8e9ff] p-2" />
                <div className="type-caption mt-2">Source</div>
                <div className="type-label mt-1">Connect</div>
              </div>
              <div className="absolute right-3 bottom-2 w-[84px] rounded-[18px] border-[3px] border-[var(--color-brown)] bg-[#fff8ec] px-3 py-2 shadow-[4px_4px_0_var(--color-brown)]">
                <div className="type-label">Ready</div>
                <div className="type-caption mt-1">to hatch</div>
              </div>
            </div>
          </div>
        </section>

        <Card className="w-full rounded-[28px] px-5 py-5">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <div className="space-y-1">
              <div className="type-caption uppercase tracking-[0.16em] text-[var(--color-caramel)]">Step 1</div>
              <h2 className="type-h2">選擇你的音樂入口</h2>
              <p className="type-body opacity-80">正式版保留兩種方式：Spotify 直連，或透過 Last.fm 做通用同步。</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {providerOptions.map((option) => {
                const selected = musicProvider === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMusicProvider(option.value)}
                    className={[
                      "text-left rounded-[24px] border-[3px] p-4 transition-all bg-white",
                      selected
                        ? "border-[var(--color-brown)] shadow-[6px_6px_0_var(--color-caramel)] -translate-y-0.5"
                        : "border-[var(--color-line)] shadow-[3px_3px_0_rgba(88,56,34,0.12)] hover:border-[var(--color-brown)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="inline-flex rounded-full border-[2px] border-[var(--color-brown)] bg-[var(--color-cream)] px-3 py-1 type-caption">
                          {option.badge}
                        </div>
                        <div className="type-label text-[18px]">{option.title}</div>
                        <div className="type-body opacity-85">{option.subtitle}</div>
                      </div>
                      <div
                        className={[
                          "w-6 h-6 rounded-full border-[2px] flex-shrink-0 mt-1",
                          selected
                            ? "border-[var(--color-brown)] bg-[#d4ff4d] shadow-[inset_0_0_0_4px_white]"
                            : "border-[var(--color-line)] bg-white",
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
              <div className="rounded-[22px] border-[3px] border-[var(--color-brown)] bg-white p-4 shadow-[4px_4px_0_rgba(88,56,34,0.12)]">
                <div className="type-label">通用同步模式帳號</div>
                <p className="type-caption text-[var(--color-muted)] mt-2 leading-relaxed">
                  這個模式適合 YouTube Music、Apple Music、網易雲音樂，或任何能同步到 Last.fm 的播放器。
                </p>
                <input
                  required
                  value={lastfmUsername}
                  onChange={e => setLastfmUsername(e.target.value)}
                  className="w-full min-w-0 pixel-border p-3 mt-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]"
                  placeholder="輸入你的 Last.fm 使用者名稱"
                />
              </div>
            )}

            <div className="space-y-1">
              <div className="type-caption uppercase tracking-[0.16em] text-[var(--color-caramel)]">Step 2</div>
              <h2 className="type-h2">建立你的音樂護照</h2>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="type-label">姓名 / 暱稱</label>
              <input required value={name} onChange={e => setName(e.target.value)} className="w-full min-w-0 pixel-border p-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="type-label">Email</label>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-w-0 pixel-border p-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1 min-w-0">
                <label className="type-label">國家 / 地區</label>
                <input required value={country} onChange={e => setCountry(e.target.value)} className="w-full min-w-0 pixel-border p-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
              </div>
              <div className="flex flex-col space-y-1 min-w-0">
                <label className="type-label">城市</label>
                <input required value={city} onChange={e => setCity(e.target.value)} className="w-full min-w-0 pixel-border p-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              <label className="type-label">穿搭風格 (選填)</label>
              <input value={style} onChange={e => setStyle(e.target.value)} className="w-full min-w-0 pixel-border p-3 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" placeholder="例：日系、Y2K" />
            </div>

            <label className="flex items-start space-x-2 cursor-pointer rounded-[18px] border-[2px] border-[var(--color-line)] bg-white px-3 py-3">
              <input required type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 flex-shrink-0 w-4 h-4" />
              <span className="type-caption opacity-90 leading-relaxed">我同意將音樂紀錄用於生成音樂寵物與研究展示。</span>
            </label>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full !py-4 !text-[1rem] bg-[#d4ff4d] !text-[var(--color-brown)]"
                disabled={!name || !email || !country || !city || !agreed || (musicProvider === "lastfm" && !lastfmUsername.trim())}
              >
                開始音樂旅程
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </motion.div>
  );
};

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
    title: string;
    subtitle: string;
    hint: string;
  }> = [
    {
      value: "spotify",
      title: "連接 Spotify",
      subtitle: "授權讀取最近播放與常聽風格",
      hint: "最接近真實使用情境，之後會跳轉 Spotify 授權。",
    },
    {
      value: "lastfm",
      title: "使用 Last.fm",
      subtitle: "輸入使用者名稱讀取近期紀錄",
      hint: "不用額外登入 Spotify，適合已有 Last.fm 帳號的使用者。",
    },
    {
      value: "mock",
      title: "先用體驗模式",
      subtitle: "快速測流程，不連接真實音樂資料",
      hint: "適合先看畫面、素材與生成流程。",
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 sm:p-6 flex flex-col items-center justify-center min-h-[100dvh]">
      <div className="w-full max-w-[360px] page-title-group mb-6 sm:mb-8">
        <h1 className="type-h1">Melody寵物地圖</h1>
        <p className="type-body opacity-80">你的每日音樂，化為圖鑑收藏。</p>
      </div>
      
      <Card className="w-full max-w-[360px]">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="type-label">姓名 / 暱稱</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="type-label">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col space-y-1 min-w-0">
              <label className="type-label">國家 / 地區</label>
              <input required value={country} onChange={e => setCountry(e.target.value)} className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
            <div className="flex flex-col space-y-1 min-w-0">
              <label className="type-label">城市</label>
              <input required value={city} onChange={e => setCity(e.target.value)} className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="type-label">穿搭風格 (選填)</label>
            <input value={style} onChange={e => setStyle(e.target.value)} className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" placeholder="例：日系、Y2K" />
          </div>
          <div className="section-plain bg-white p-3">
            <div className="type-label mb-2">連接音樂來源</div>
            <p className="type-caption text-[var(--color-muted)] mb-3">
              先選擇這次要用哪一種音樂紀錄來源，再開始你的音樂寵物旅程。
            </p>
            <div className="grid grid-cols-1 gap-3">
              {providerOptions.map((option) => {
                const selected = musicProvider === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMusicProvider(option.value)}
                    className={[
                      "text-left rounded-2xl border-[3px] p-4 transition-all",
                      selected
                        ? "bg-[var(--color-cream)] border-[var(--color-caramel)] shadow-[4px_4px_0_var(--color-caramel)]"
                        : "bg-white border-[var(--color-line)] shadow-[3px_3px_0_rgba(88,56,34,0.12)] hover:border-[var(--color-brown)]",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="type-label">{option.title}</div>
                        <div className="type-body mt-1 opacity-85">{option.subtitle}</div>
                      </div>
                      <div
                        className={[
                          "w-5 h-5 rounded-full border-[2px] flex-shrink-0 mt-1",
                          selected
                            ? "border-[var(--color-caramel)] bg-[var(--color-caramel)] shadow-[inset_0_0_0_3px_var(--color-cream)]"
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
          </div>
          {musicProvider === "lastfm" && (
            <div className="section-plain bg-white flex flex-col space-y-2">
              <label className="type-label">Last.fm 使用者名稱</label>
              <p className="type-caption text-[var(--color-muted)]">
                這會用來讀取你的近期聆聽紀錄與藝人風格標籤。
              </p>
              <input
                required
                value={lastfmUsername}
                onChange={e => setLastfmUsername(e.target.value)}
                className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]"
                placeholder="例如：musiclover123"
              />
            </div>
          )}
          <label className="flex items-start space-x-2 mt-4 cursor-pointer">
            <input required type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 flex-shrink-0 w-4 h-4" />
            <span className="type-caption opacity-90 leading-tight">我同意將音樂紀錄用於生成音樂寵物與研究展示。</span>
          </label>
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={!name || !email || !country || !city || !agreed || (musicProvider === "lastfm" && !lastfmUsername.trim())}
            >
              開始音樂旅程
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

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
          <div className="section-plain bg-white">
            <div className="type-label mb-3">音樂資料來源</div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "spotify", label: "Spotify（授權讀取最近播放與常聽風格）" },
                { value: "lastfm", label: "Last.fm（輸入使用者名稱）" },
                { value: "mock", label: "Mock（測試模式）" },
              ].map((option) => (
                <label key={option.value} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="music-provider"
                    value={option.value}
                    checked={musicProvider === option.value}
                    onChange={() => setMusicProvider(option.value as MusicProvider)}
                    className="mt-1 flex-shrink-0"
                  />
                  <span className="type-caption leading-tight">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          {musicProvider === "lastfm" && (
            <div className="flex flex-col space-y-1">
              <label className="type-label">Last.fm 使用者名稱</label>
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

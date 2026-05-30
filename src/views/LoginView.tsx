import React, { useState } from "react";
import { useApp } from "../AppContext";
import { Button, Card } from "../components/UI";
import { motion } from "motion/react";

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [style, setStyle] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && country && city && agreed) {
      login({ name, email, country, city, style, agreed });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 flex flex-col items-center justify-center min-h-[100dvh]">
      <div className="w-full max-w-[360px] page-title-group mb-8">
        <h1 className="type-h1">Melody寵物地圖</h1>
        <p className="type-body opacity-80">你的每日音樂，化為圖鑑收藏。</p>
      </div>
      
      <Card className="w-full max-w-[360px]">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-1">
            <label className="type-label">姓名 / 暱稱</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="type-label">Email</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
          </div>
          <div className="flex space-x-2">
            <div className="flex flex-col space-y-1 flex-1">
              <label className="type-label">國家 / 地區</label>
              <input required value={country} onChange={e => setCountry(e.target.value)} className="pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
            <div className="flex flex-col space-y-1 flex-1">
              <label className="type-label">城市</label>
              <input required value={city} onChange={e => setCity(e.target.value)} className="pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" />
            </div>
          </div>
          <div className="flex flex-col space-y-1">
            <label className="type-label">穿搭風格 (選填)</label>
            <input value={style} onChange={e => setStyle(e.target.value)} className="pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]" placeholder="例：日系、Y2K" />
          </div>
          <label className="flex items-start space-x-2 mt-4 cursor-pointer">
            <input required type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 flex-shrink-0 w-4 h-4" />
            <span className="type-caption opacity-90 leading-tight">我同意將音樂紀錄用於設計研究展示（不串接真實資料庫）。</span>
          </label>
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={!name || !email || !country || !city || !agreed}>開始音樂旅程</Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

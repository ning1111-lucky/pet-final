import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../AppContext";
import { MusicProvider } from "../types";
import homeBg from "../assets/pixel/backgrounds/home-bg.png";
import {
  PixelBadge,
  PixelButton,
  PixelIcon,
  PixelIconType,
  PixelStatusBar,
  RetroWindow,
} from "../components/UI";

type OnboardingStep = "home" | "source" | "passport";

const providerOptions: Array<{
  value: MusicProvider;
  badge: string;
  title: string;
  subtitle: string;
  hint: string;
  icon: PixelIconType;
  buttonLabel: string;
  tone: "green" | "blue";
}> = [
  {
    value: "spotify",
    badge: "SPOTIFY",
    title: "Spotify 直連",
    subtitle: "快速連結你的 Spotify 帳號，取得近期播放與常聽風格。",
    hint: "登入後即可開始每日素材孵化。",
    icon: "headphone",
    buttonLabel: "CONNECT SPOTIFY",
    tone: "green",
  },
  {
    value: "lastfm",
    badge: "SYNC",
    title: "通用同步模式",
    subtitle: "透過 Last.fm 同步其他音樂平台資料。",
    hint: "適合 YouTube Music、Apple Music 與其他同步平台。",
    icon: "globe",
    buttonLabel: "SYNC MODE",
    tone: "blue",
  },
];

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

function PixelGameboy() {
  return (
    <div className="pixel-prop-gameboy" aria-hidden="true">
      <div className="pixel-prop-screen" />
      <div className="pixel-prop-controls">
        <span className="pixel-dpad" />
        <span className="pixel-button-cluster" />
      </div>
    </div>
  );
}

function PixelDecorationLayer() {
  return (
    <div className="home-decoration-layer" aria-hidden="true">
      <div className="home-prop home-prop-gameboy">
        <PixelGameboy />
      </div>
      <div className="home-prop home-prop-headphone">
        <PixelIcon type="headphone" size={54} />
      </div>
      <div className="home-prop home-prop-cassette">
        <PixelIcon type="cassette" size={50} />
      </div>

      <span className="home-prop home-prop-note-a">
        <PixelIcon type="music-note" size={18} />
      </span>
      <span className="home-prop home-prop-note-b">
        <PixelIcon type="music-note" size={16} />
      </span>
      <span className="home-prop home-prop-note-c">
        <PixelIcon type="music-note" size={14} />
      </span>
      <span className="home-prop home-prop-heart-a">
        <PixelIcon type="heart" size={16} />
      </span>
      <span className="home-prop home-prop-heart-b">
        <PixelIcon type="heart" size={14} />
      </span>
      <span className="home-prop home-prop-star-a">
        <PixelIcon type="star" size={18} />
      </span>
      <span className="home-prop home-prop-star-b">
        <PixelIcon type="star" size={14} />
      </span>
      <span className="home-prop home-prop-spark-a">
        <PixelIcon type="spark" size={14} />
      </span>
      <span className="home-prop home-prop-spark-b">
        <PixelIcon type="spark" size={18} />
      </span>

      <span className="home-confetti home-confetti-pink home-confetti-1" />
      <span className="home-confetti home-confetti-yellow home-confetti-2" />
      <span className="home-confetti home-confetti-blue home-confetti-3" />
      <span className="home-confetti home-confetti-green home-confetti-4" />
      <span className="home-confetti home-confetti-pink home-confetti-5" />
      <span className="home-confetti home-confetti-yellow home-confetti-6" />
      <span className="home-confetti home-confetti-blue home-confetti-7" />
      <span className="home-confetti home-confetti-green home-confetti-8" />
      <span className="home-confetti home-confetti-pink home-confetti-9" />
      <span className="home-confetti home-confetti-yellow home-confetti-10" />
      <span className="home-confetti home-confetti-blue home-confetti-11" />
      <span className="home-confetti home-confetti-green home-confetti-12" />
    </div>
  );
}

function PixelPinkCat() {
  return (
    <div className="stage-pet stage-pet-pink" aria-hidden="true">
      <div className="stage-pet-sprite">
        <svg viewBox="0 0 16 16" className="pixel-character-sprite" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
          <rect x="4" y="1" width="2" height="2" fill="#111" />
          <rect x="10" y="1" width="2" height="2" fill="#111" />
          <rect x="5" y="1" width="1" height="1" fill="#ff7fbf" />
          <rect x="10" y="1" width="1" height="1" fill="#ff7fbf" />
          <rect x="3" y="3" width="10" height="8" fill="#111" />
          <rect x="4" y="3" width="8" height="8" fill="#ff9dd6" />
          <rect x="4" y="11" width="3" height="2" fill="#111" />
          <rect x="9" y="11" width="3" height="2" fill="#111" />
          <rect x="5" y="11" width="2" height="2" fill="#ff9dd6" />
          <rect x="9" y="11" width="2" height="2" fill="#ff9dd6" />
          <rect x="5" y="6" width="2" height="2" fill="#fff" />
          <rect x="9" y="6" width="2" height="2" fill="#fff" />
          <rect x="6" y="7" width="1" height="1" fill="#111" />
          <rect x="9" y="7" width="1" height="1" fill="#111" />
          <rect x="6" y="8" width="1" height="1" fill="#ffb7d5" />
          <rect x="9" y="8" width="1" height="1" fill="#ffb7d5" />
          <rect x="7" y="8" width="2" height="1" fill="#111" />
          <rect x="7" y="9" width="2" height="1" fill="#111" />
          <rect x="2" y="8" width="1" height="3" fill="#111" />
          <rect x="13" y="8" width="1" height="3" fill="#111" />
          <rect x="2" y="9" width="1" height="2" fill="#ff9dd6" />
          <rect x="13" y="9" width="1" height="2" fill="#ff9dd6" />
        </svg>
      </div>
      <div className="stage-pet-bubble">
        <PixelIcon type="heart" size={12} />
      </div>
    </div>
  );
}

function PixelBlueCat() {
  return (
    <div className="stage-pet stage-pet-blue" aria-hidden="true">
      <div className="stage-pet-sprite">
        <svg viewBox="0 0 16 16" className="pixel-character-sprite" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
          <rect x="4" y="1" width="2" height="2" fill="#111" />
          <rect x="10" y="1" width="2" height="2" fill="#111" />
          <rect x="5" y="1" width="1" height="1" fill="#8ac6ff" />
          <rect x="10" y="1" width="1" height="1" fill="#8ac6ff" />
          <rect x="3" y="3" width="10" height="8" fill="#111" />
          <rect x="4" y="3" width="8" height="8" fill="#6fd0ff" />
          <rect x="4" y="11" width="3" height="2" fill="#111" />
          <rect x="9" y="11" width="3" height="2" fill="#111" />
          <rect x="5" y="11" width="2" height="2" fill="#6fd0ff" />
          <rect x="9" y="11" width="2" height="2" fill="#6fd0ff" />
          <rect x="5" y="6" width="2" height="2" fill="#fff" />
          <rect x="9" y="6" width="2" height="2" fill="#fff" />
          <rect x="6" y="7" width="1" height="1" fill="#111" />
          <rect x="9" y="7" width="1" height="1" fill="#111" />
          <rect x="6" y="8" width="1" height="1" fill="#b7ff5e" />
          <rect x="9" y="8" width="1" height="1" fill="#b7ff5e" />
          <rect x="7" y="8" width="2" height="1" fill="#111" />
          <rect x="7" y="9" width="2" height="1" fill="#111" />
          <rect x="2" y="8" width="1" height="3" fill="#111" />
          <rect x="13" y="8" width="1" height="3" fill="#111" />
          <rect x="2" y="9" width="1" height="2" fill="#6fd0ff" />
          <rect x="13" y="9" width="1" height="2" fill="#6fd0ff" />
        </svg>
      </div>
      <div className="stage-pet-headphone">
        <PixelIcon type="headphone" size={18} />
      </div>
      <div className="stage-pet-bubble">
        <PixelIcon type="heart" size={12} />
      </div>
    </div>
  );
}

function PixelPetEgg() {
  return (
    <div className="stage-egg" aria-hidden="true">
      <div className="stage-egg-nest" />
      <div className="stage-egg-shell">
        <svg viewBox="0 0 18 20" className="pixel-egg-sprite" xmlns="http://www.w3.org/2000/svg" shapeRendering="crispEdges">
          <rect x="6" y="1" width="6" height="1" fill="#111" />
          <rect x="4" y="2" width="2" height="1" fill="#111" />
          <rect x="12" y="2" width="2" height="1" fill="#111" />
          <rect x="3" y="3" width="1" height="2" fill="#111" />
          <rect x="14" y="3" width="1" height="2" fill="#111" />
          <rect x="2" y="5" width="1" height="8" fill="#111" />
          <rect x="15" y="5" width="1" height="8" fill="#111" />
          <rect x="3" y="13" width="1" height="3" fill="#111" />
          <rect x="14" y="13" width="1" height="3" fill="#111" />
          <rect x="4" y="16" width="2" height="1" fill="#111" />
          <rect x="12" y="16" width="2" height="1" fill="#111" />
          <rect x="6" y="17" width="6" height="1" fill="#111" />
          <rect x="4" y="3" width="10" height="13" fill="#fff5df" />
          <rect x="3" y="5" width="12" height="8" fill="#fff5df" />
          <rect x="8" y="5" width="2" height="2" fill="#ff8ec4" />
          <rect x="7" y="7" width="4" height="1" fill="#ff8ec4" />
          <rect x="6" y="8" width="1" height="2" fill="#111" />
          <rect x="11" y="8" width="1" height="2" fill="#111" />
          <rect x="7" y="9" width="4" height="1" fill="#111" />
        </svg>
      </div>
    </div>
  );
}

function HomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="page-stack home-screen">
      <PixelStatusBar />
      <section className="home-start-scene" style={{ backgroundImage: `url(${homeBg})` }}>
        <PixelDecorationLayer />

        <div className="home-logo-stack">
          <div className="home-logo-title home-logo-title-playlist">PLAYLIST</div>
          <div className="home-logo-title home-logo-title-pet">PET</div>
        </div>

        <p className="home-logo-subtitle">把你的聽歌紀錄孵化成音樂寵物</p>

        <div className="home-slogan-bar">
          <span className="home-slogan-icon">
            <PixelIcon type="heart" size={14} />
          </span>
          <span>PRESS START TO HATCH!</span>
          <span className="home-slogan-icon">
            <PixelIcon type="music-note" size={14} />
          </span>
        </div>

        <div className="home-stage">
          <PixelPinkCat />
          <PixelPetEgg />
          <PixelBlueCat />
        </div>
      </section>

      <RetroWindow title="開始音樂旅程" tone="pink" className="home-start-window" bodyClassName="window-stack-tight text-center home-start-window-body">
        <p className="window-copy home-start-copy">
          連結你的音樂帳號，
          <br />
          讓 <strong>Playlist Pet</strong> 開始認識你的音樂宇宙！
        </p>
        <PixelButton variant="pink" className="w-full justify-center home-start-button" onClick={onStart}>
          START
        </PixelButton>
      </RetroWindow>
    </div>
  );
}

function SourceSelectView({
  onChoose,
  onBack,
}: {
  onChoose: (provider: MusicProvider) => void;
  onBack: () => void;
}) {
  return (
    <div className="page-stack">
      <PixelStatusBar />
      <PixelLogoTitle
        kicker="MUSIC SOURCE"
        title="音樂入口"
        subtitle="選擇你的音樂入口，讓 Playlist Pet 開始同步你的聲音宇宙。"
      />

      <RetroWindow title="音樂入口" tone="yellow">
        <div className="source-screen-stack">
          {providerOptions.map((option) => (
            <div key={option.value} className="source-window-card source-window-card-large">
              <div className="source-window-card-head">
                <div className="source-window-icon"><PixelIcon type={option.icon} size={28} /></div>
                <div className="source-window-copy">
                  <div className="source-window-copy-row source-window-copy-row-start">
                    <PixelBadge tone={option.tone}>{option.badge}</PixelBadge>
                  </div>
                  <h3 className="window-mini-title">{option.title}</h3>
                  <p className="window-copy">{option.subtitle}</p>
                  <p className="window-hint">{option.hint}</p>
                </div>
              </div>
              <PixelButton
                className="w-full justify-center"
                variant={option.value === "spotify" ? "primary" : "blue"}
                onClick={() => onChoose(option.value)}
              >
                {option.buttonLabel}
              </PixelButton>
            </div>
          ))}

          <PixelButton variant="secondary" className="w-full justify-center" onClick={onBack}>
            BACK
          </PixelButton>
        </div>
      </RetroWindow>
    </div>
  );
}

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [step, setStep] = useState<OnboardingStep>("home");
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

  const selectedProvider = useMemo(
    () => providerOptions.find((option) => option.value === musicProvider) || providerOptions[0],
    [musicProvider]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const needsLastFmUsername = musicProvider === "lastfm";
    if (!(name && email && country && city && agreed && (!needsLastFmUsername || lastfmUsername.trim()))) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/notion/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
  };

  const handleChooseProvider = (provider: MusicProvider) => {
    setMusicProvider(provider);
    setStep("passport");
  };

  if (step === "home") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-stack">
        <HomeScreen onStart={() => setStep("source")} />
      </motion.div>
    );
  }

  if (step === "source") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-stack">
        <SourceSelectView onChoose={handleChooseProvider} onBack={() => setStep("home")} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-stack">
      <PixelStatusBar />

      <PixelLogoTitle
        kicker="MUSIC PASSPORT"
        title="音樂護照"
        subtitle="完成旅程設定，然後開始收集 3 天素材。"
      />

      <RetroWindow title="建立你的音樂護照" tone="green">
        <div className="passport-provider-banner">
          <div>
            <div className="window-label">已選音樂入口</div>
            <div className="window-mini-title mt-1">{selectedProvider.title}</div>
          </div>
          <PixelBadge tone={musicProvider === "spotify" ? "green" : "blue"}>{selectedProvider.badge}</PixelBadge>
        </div>

        <form onSubmit={handleSubmit} className="passport-form-grid">
          <label className="passport-field">
            <span className="window-label">姓名 / 暱稱</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="例如：Aning" className="pixel-input" />
          </label>
          <label className="passport-field">
            <span className="window-label">Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="pixel-input" />
          </label>
          <label className="passport-field">
            <span className="window-label">國家 / 地區</span>
            <input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="台灣" className="pixel-input" />
          </label>
          <label className="passport-field">
            <span className="window-label">城市</span>
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="台北" className="pixel-input" />
          </label>
          <label className="passport-field">
            <span className="window-label">穿搭風格（選填）</span>
            <input value={style} onChange={(event) => setStyle(event.target.value)} placeholder="Y2K、復古、街頭…" className="pixel-input" />
          </label>

          {musicProvider === "lastfm" && (
            <label className="passport-field">
              <span className="window-label">Last.fm 使用者名稱</span>
              <input value={lastfmUsername} onChange={(event) => setLastfmUsername(event.target.value)} placeholder="例如：musiclover123" className="pixel-input" />
            </label>
          )}

          <label className="passport-checkbox-row">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
            <span>我同意將音樂紀錄用於設計展示研究（不串接真實資料庫）。</span>
          </label>

          {submitError ? <div className="window-error">{submitError}</div> : null}

          <div className="passport-actions">
            <PixelButton
              type="submit"
              className="w-full justify-center"
              disabled={isSubmitting || !agreed || !name || !email || !country || !city || (musicProvider === "lastfm" && !lastfmUsername.trim())}
            >
              {isSubmitting ? "同步中..." : "開始音樂旅程"}
            </PixelButton>
            <PixelButton type="button" variant="secondary" className="w-full justify-center" onClick={() => setStep("source")}>
              BACK
            </PixelButton>
          </div>
        </form>
      </RetroWindow>
    </motion.div>
  );
};

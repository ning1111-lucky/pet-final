import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useApp } from "../AppContext";
import { MusicProvider } from "../types";
import { PixelBadge, PixelButton, PixelLogoTitle, PixelStatusBar, RetroWindow } from "../components/UI";

type OnboardingStep = "home" | "source" | "passport";

const providerOptions: Array<{
  value: MusicProvider;
  badge: string;
  title: string;
  subtitle: string;
  hint: string;
  icon: string;
  buttonLabel: string;
}> = [
  {
    value: "spotify",
    badge: "SPOTIFY",
    title: "Spotify 直連",
    subtitle: "快速連結你的 Spotify 帳號，取得近期播放與常聽風格。",
    hint: "授權後即可開始每日素材孵化。",
    icon: "🎧",
    buttonLabel: "CONNECT SPOTIFY",
  },
  {
    value: "lastfm",
    badge: "SYNC",
    title: "通用同步模式",
    subtitle: "透過 Last.fm 同步其他音樂平台資料。",
    hint: "適合 YouTube Music、Apple Music 與其他同步平台。",
    icon: "🌍",
    buttonLabel: "SYNC MODE",
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
                <div className="source-window-icon">{option.icon}</div>
                <div className="source-window-copy">
                  <div className="source-window-copy-row source-window-copy-row-start">
                    <PixelBadge tone={option.value === "spotify" ? "green" : "blue"}>{option.badge}</PixelBadge>
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

  if (step === "source") {
    return <SourceSelectView onChoose={handleChooseProvider} onBack={() => setStep("home")} />;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="page-stack">
      <PixelStatusBar />

      {step === "home" ? (
        <>
          <PixelLogoTitle
            kicker="PRESS START TO HATCH!"
            title="PLAYLIST PET"
            subtitle="把你的聽歌紀錄孵化成音樂寵物"
            className="home-screen-title"
          />

          <section className="home-stage-screen">
            <span className="home-stage-spark spark-a">✦</span>
            <span className="home-stage-spark spark-b">♪</span>
            <span className="home-stage-spark spark-c">✿</span>
            <span className="home-stage-spark spark-d">★</span>
            <span className="home-stage-spark spark-e">♫</span>
            <div className="home-stage-icon icon-left-top">🎵</div>
            <div className="home-stage-icon icon-right-top">🎧</div>
            <div className="home-stage-icon icon-right-bottom">📼</div>
            <div className="home-stage-pet is-left">🐱</div>
            <div className="home-stage-egg">
              <div className="home-stage-egg-note">♪</div>
            </div>
            <div className="home-stage-pet is-right">😺</div>
          </section>

          <RetroWindow title="開始音樂旅程" tone="pink">
            <div className="window-stack-tight text-center">
              <p className="window-copy">
                連結你的音樂帳號，
                <br />
                讓 <strong>Playlist Pet</strong> 開始認識你的音樂宇宙！
              </p>
              <PixelButton variant="pink" className="w-full justify-center" onClick={() => setStep("source")}>
                START
              </PixelButton>
            </div>
          </RetroWindow>
        </>
      ) : (
        <>
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
        </>
      )}
    </motion.div>
  );
};

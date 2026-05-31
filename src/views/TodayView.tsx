import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { Button, PixelItemPlaceholder } from "../components/UI";
import { getBaseType, getCollectionSlotIndex, getDaySlotConfigs, getTodayMusicData, TOTAL_DAYS } from "../mockData";
import { DailyMusicData, MusicItem, Genre, MapEntry, Pet, GeminiAssetAnalysis } from "../types";
import { generateId } from "../utils";
import { motion } from "motion/react";
import { baseShapeMap, resolveAssetImage } from "../assetMap";

const GENERATED_WEEKLY_PET_IMAGE_KEY = "generatedWeeklyPetImage";

export function normalizeGenre(genre: string): string {
  const map: Record<string, string> = {
    "K-pop": "Kpop",
    Kpop: "Kpop",
    KPOP: "Kpop",
    kpop: "Kpop",
    Pop: "Pop",
    POP: "Pop",
    pop: "Pop",
    "R&B": "RnB",
    RnB: "RnB",
    RNB: "RnB",
    rnb: "RnB",
    Rock: "Rock",
    ROCK: "Rock",
    rock: "Rock",
    Jazz: "Jazz",
    JAZZ: "Jazz",
    jazz: "Jazz",
    Indie: "Indie",
    "Taiwan Indie": "Indie",
    INDIE: "Indie",
    indie: "Indie",
    "Hip-hop": "Hiphop",
    Hiphop: "Hiphop",
    HIPHOP: "Hiphop",
    hiphop: "Hiphop",
    Classical: "Classical",
    CLASSICAL: "Classical",
    classical: "Classical",
    Country: "Country",
    COUNTRY: "Country",
    country: "Country",
    EDM: "EDM",
    edm: "EDM",
  };

  return map[genre] || genre;
}

function getStoredGeneratedImage(): string | null {
  try {
    return localStorage.getItem(GENERATED_WEEKLY_PET_IMAGE_KEY);
  } catch {
    return null;
  }
}

async function readApiJsonResponse(response: Response): Promise<Record<string, unknown>> {
  const rawText = await response.text().catch(() => "");
  const fallbackError = "生成失敗，請重試";

  if (!rawText.trim()) {
    return {
      ok: false,
      error: fallbackError,
    };
  }

  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, unknown>;
    }
  } catch {
    if (!response.ok) {
      return {
        ok: false,
        error: rawText.trim() || fallbackError,
      };
    }
  }

  return {
    ok: false,
    error: response.ok ? fallbackError : rawText.trim() || fallbackError,
  };
}

async function appendImageAssetToFormData(formData: FormData, fieldName: string, source: string) {
  try {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${fieldName}`);
    }

    const blob = await response.blob();
    const cleanPath = source.split("?")[0];
    const extension = cleanPath.includes(".") ? cleanPath.split(".").pop() || "png" : "png";
    const mimeType = blob.type || (extension === "jpg" || extension === "jpeg" ? "image/jpeg" : "image/png");
    const file = new File([blob], `${fieldName}.${extension}`, { type: mimeType });
    formData.append(fieldName, file);
  } catch {
    formData.append(fieldName, source);
  }
}

function extractAssetKeyFromPath(value: string | null | undefined): string {
  if (!value) return "";
  const cleanPath = value.split("?")[0] || "";
  const filename = cleanPath.split("/").pop() || "";
  return filename.replace(/\.[a-z0-9]+$/i, "");
}

async function syncUserProfileToNotion(profile: {
  name: string;
  email: string;
  country: string;
  city: string;
  style?: string;
  musicProvider: string;
  lastfmUsername?: string;
}) {
  const response = await fetch("/api/notion/sync-user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  const data = await readApiJsonResponse(response);
  if (!response.ok || data.ok !== true) {
    throw new Error(typeof data.error === "string" ? data.error : "Notion 使用者同步失敗");
  }
}

export const TodayView: React.FC<{ navigateTo: (tab: "today" | "items" | "map") => void }> = ({ navigateTo }) => {
  const {
    currentMockDay,
    currentBaseKey,
    currentWeekItems,
    generateItem,
    advanceDay,
    resetWeek,
    generateWeeklyPet,
    addToMap,
    autoFillWeek,
    userProfile,
    updateUserProfile,
  } = useApp();

  const [mockMusic, setMockMusic] = useState<DailyMusicData | null>(null);
  const [showGenAnim, setShowGenAnim] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(Boolean(getStoredGeneratedImage()));
  const [imgLoadError, setImgLoadError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(() => getStoredGeneratedImage());
  const [generatedPetProvider, setGeneratedPetProvider] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<GeminiAssetAnalysis | null>(null);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [notionPromptContext, setNotionPromptContext] = useState("");
  const [musicLoadError, setMusicLoadError] = useState<string | null>(null);
  const [musicLoadCode, setMusicLoadCode] = useState<string | null>(null);
  const [spotifyConnected, setSpotifyConnected] = useState<boolean | null>(null);
  const [spotifyDisplayName, setSpotifyDisplayName] = useState<string | null>(null);
  const [showMusicSourcePanel, setShowMusicSourcePanel] = useState(false);
  const [draftLastfmUsername, setDraftLastfmUsername] = useState(userProfile?.lastfmUsername || "");
  const [selectedBase, setSelectedBase] = useState<string | null>(null);
  const [selectedClothes, setSelectedClothes] = useState<string | null>(null);
  const [selectedShoes, setSelectedShoes] = useState<string | null>(null);
  const [selectedHeadwear, setSelectedHeadwear] = useState<string | null>(null);
  const [selectedHandheld, setSelectedHandheld] = useState<string | null>(null);
  const [selectedAccessory, setSelectedAccessory] = useState<string | null>(null);
  const [showDevTools, setShowDevTools] = useState(false);
  const [titleTapCount, setTitleTapCount] = useState(0);

  const safeDay = Math.min(Math.max(Number(currentMockDay) || 1, 1), TOTAL_DAYS);
  const safeWeekItems = Array.isArray(currentWeekItems) ? currentWeekItems : [];
  const daySlotConfigs = getDaySlotConfigs(safeDay);
  const activeMusicProvider = userProfile?.musicProvider || "mock";
  const distribution = Array.isArray(mockMusic?.distribution) ? mockMusic.distribution : [];
  const primarySuggestedGenre = normalizeGenre((mockMusic?.assetGenre || mockMusic?.mainGenre || "Pop") as string) as Genre;
  const secondarySuggestedGenre = normalizeGenre((mockMusic?.subGenre || primarySuggestedGenre) as string) as Genre;

  const getCollectedItemByPart = (part: string) => {
    const index = getCollectionSlotIndex(part as MusicItem["part"]);
    return index >= 0 ? safeWeekItems[index] : null;
  };

  const todaysPreviewItems = daySlotConfigs.map((slot, index) => {
    const genre = (slot.genreSource === "main" ? primarySuggestedGenre : secondarySuggestedGenre) as Genre;
    return {
      id: `${safeDay}-${slot.part}-${index}`,
      day: safeDay,
      part: slot.part,
      genre,
      label: slot.title,
      icon: "✨",
      imageSrc: resolveAssetImage(genre, slot.part, `${genre}-${slot.part}-${safeDay}`),
    } as MusicItem;
  });
  const todaysGeneratedItems = daySlotConfigs
    .map((slot) => getCollectedItemByPart(slot.part))
    .filter((item): item is MusicItem => Boolean(item));
  const hasGeneratedToday = todaysGeneratedItems.length === daySlotConfigs.length;

  useEffect(() => {
    setDraftLastfmUsername(userProfile?.lastfmUsername || "");
  }, [userProfile?.lastfmUsername]);

  useEffect(() => {
    let active = true;
    setShowGenAnim(false);
    setMusicLoadError(null);
    setMusicLoadCode(null);

    getTodayMusicData(activeMusicProvider, {
      lastfmUsername: userProfile?.lastfmUsername,
    })
      .then((data) => {
        if (!active) return;
        setMockMusic(data);
      })
      .catch((error: Error & { code?: string }) => {
        if (!active) return;
        setMockMusic(null);
        setMusicLoadError(error.message || "音樂資料讀取失敗。");
        setMusicLoadCode(error.code || null);
      });

    return () => {
      active = false;
    };
  }, [safeDay, activeMusicProvider, userProfile?.lastfmUsername]);

  useEffect(() => {
    if (activeMusicProvider !== "spotify") {
      setSpotifyConnected(null);
      setSpotifyDisplayName(null);
      return;
    }

    let active = true;
    fetch("/api/spotify/session", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        if (data?.ok === true && data.connected) {
          setSpotifyConnected(true);
          setSpotifyDisplayName(typeof data.displayName === "string" ? data.displayName : "Spotify User");
          return;
        }
        setSpotifyConnected(false);
        setSpotifyDisplayName(null);
      })
      .catch(() => {
        if (!active) return;
        setSpotifyConnected(false);
        setSpotifyDisplayName(null);
      });

    return () => {
      active = false;
    };
  }, [activeMusicProvider]);

  const collectedItems = safeWeekItems
    .slice(0, 5)
    .filter((item): item is MusicItem => Boolean(item?.genre && item?.part && item?.imageSrc));
  const isComplete = collectedItems.length === 5;
  const isPetGenerationStage = safeDay === TOTAL_DAYS && isComplete;

  const genreCounts: Record<string, number> = {};
  collectedItems.forEach((item) => {
    genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
  });

  let mainGenre: Genre = (collectedItems[0]?.genre || "Pop") as Genre;
  let subGenre: Genre = (collectedItems[1]?.genre || "Pop") as Genre;
  let maxCount = 0;
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mainGenre = genre as Genre;
    }
  });

  let subMaxCount = 0;
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (genre !== mainGenre && count > subMaxCount) {
      subMaxCount = count;
      subGenre = genre as Genre;
    }
  });

  if (Object.keys(genreCounts).length === 1) {
    subGenre = mainGenre;
  }

  const baseImageSrc = baseShapeMap[currentBaseKey] || baseShapeMap["base-1"];
  const clothesItem = getCollectedItemByPart("clothes");
  const shoesItem = getCollectedItemByPart("shoes");
  const headwearItem = getCollectedItemByPart("headwear");
  const handheldItem = getCollectedItemByPart("handheld");
  const accessoryItem = getCollectedItemByPart("accessory");

  useEffect(() => {
    setSelectedBase(baseImageSrc);
    setSelectedClothes(clothesItem?.imageSrc || null);
    setSelectedShoes(shoesItem?.imageSrc || null);
    setSelectedHeadwear(headwearItem?.imageSrc || null);
    setSelectedHandheld(handheldItem?.imageSrc || null);
    setSelectedAccessory(accessoryItem?.imageSrc || null);
  }, [
    baseImageSrc,
    clothesItem?.imageSrc,
    shoesItem?.imageSrc,
    headwearItem?.imageSrc,
    handheldItem?.imageSrc,
    accessoryItem?.imageSrc,
  ]);

  const clearGeneratedWeeklyPetImage = () => {
    setGeneratedImageUrl(null);
    setError(null);
    setImgLoading(false);
    setImgLoadError(false);
    setImgLoaded(false);
    setGeneratedPetProvider(null);
    setAnalysis(null);
    setFinalPrompt("");

    try {
      localStorage.removeItem(GENERATED_WEEKLY_PET_IMAGE_KEY);
    } catch {
      // Ignore storage cleanup errors and keep the UI responsive.
    }
  };

  const handleGenerate = () => {
    if (!mockMusic) return;

    setShowGenAnim(true);
    setTimeout(() => {
      todaysPreviewItems.forEach((item) => {
        generateItem({
          ...item,
          id: generateId(),
          label: `${item.genre} ${item.part}`,
        });
      });
    }, 600);
  };

  const analyzeAndGeneratePet = async () => {
    if (!selectedBase || !selectedClothes || !selectedShoes || !selectedHeadwear || !selectedHandheld || !selectedAccessory) {
      setError("缺少 base 或素材圖片，請先完成 5 個素材收集。");
      return;
    }

    if (generatedImageUrl && !window.confirm("重新生成會覆蓋目前圖片，確定嗎？")) {
      return;
    }

    setError(null);
    setAnalysis(null);
    setFinalPrompt("");
    setNotionPromptContext("");
    setGeneratedImageUrl(null);
    setGeneratedPetProvider(null);
    setImgLoading(false);
    setImgLoadError(false);
    setImgLoaded(false);

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      await Promise.all([
        appendImageAssetToFormData(formData, "base", selectedBase),
        appendImageAssetToFormData(formData, "clothes", selectedClothes),
        appendImageAssetToFormData(formData, "shoes", selectedShoes),
        appendImageAssetToFormData(formData, "headwear", selectedHeadwear),
        appendImageAssetToFormData(formData, "handheld", selectedHandheld),
        appendImageAssetToFormData(formData, "accessory", selectedAccessory),
      ]);
      formData.append("mainGenre", mainGenre);
      formData.append("subGenre", subGenre);

      const analyzeResponse = await fetch("/api/analyze-assets", {
        method: "POST",
        body: formData,
      });
      const analyzeData = await readApiJsonResponse(analyzeResponse);
      if (!analyzeResponse.ok || !analyzeData.analysis || typeof analyzeData.analysis !== "object") {
        const message = typeof analyzeData.error === "string" ? analyzeData.error : "素材分析失敗，請重試";
        throw new Error(message);
      }

      const parsedAnalysis = analyzeData.analysis as unknown as GeminiAssetAnalysis;
      setAnalysis(parsedAnalysis);
      setFinalPrompt(parsedAnalysis.final_prompt_en || "");
      setNotionPromptContext(
        analyzeData.notion && typeof analyzeData.notion === "object" && typeof (analyzeData.notion as Record<string, unknown>).promptContext === "string"
          ? (((analyzeData.notion as Record<string, unknown>).promptContext as string) || "").trim()
          : ""
      );
      setIsAnalyzing(false);

      setIsGenerating(true);
      setImgLoading(true);
      const generateResponse = await fetch("/api/generate-pet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis: parsedAnalysis,
        }),
      });

      const generateData = await readApiJsonResponse(generateResponse);
      if (!generateResponse.ok || typeof generateData.imageUrl !== "string" || !generateData.imageUrl) {
        const message = typeof generateData.error === "string" ? generateData.error : "生成失敗，請重試";
        throw new Error(message);
      }

      setGeneratedImageUrl(generateData.imageUrl);
      setGeneratedPetProvider("leonardo");
      try {
        localStorage.setItem(GENERATED_WEEKLY_PET_IMAGE_KEY, generateData.imageUrl);
      } catch {
        // Ignore quota errors so the generated image can still be displayed.
      }

      try {
        const weeklyRunResponse = await fetch("/api/notion/weekly-run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionName: `${userProfile?.name || "Anonymous"} - ${mainGenre} Week`,
            userName: userProfile?.name || "Anonymous",
            musicSource: activeMusicProvider,
            lastfmUsername: userProfile?.lastfmUsername || "",
            mainGenreKey: mainGenre,
            secondaryGenreKey: subGenre,
            analysisType:
              mockMusic?.mainGenre === "Mixed"
                ? "mixed"
                : mockMusic?.mainGenre === "Hidden"
                  ? "hidden"
                  : "pure",
            listenCount: mockMusic?.songCount || 0,
            day1ClothesKey: extractAssetKeyFromPath(selectedClothes),
            day1ShoesKey: extractAssetKeyFromPath(selectedShoes),
            day2HeadwearKey: extractAssetKeyFromPath(selectedHeadwear),
            day2HandheldKey: extractAssetKeyFromPath(selectedHandheld),
            day3AccessoryKey: extractAssetKeyFromPath(selectedAccessory),
            baseKey: currentBaseKey,
            finalPrompt: parsedAnalysis.final_prompt_en || "",
            petImageUrl: generateData.imageUrl,
            status: "generated",
          }),
        });

        const weeklyRunData = await readApiJsonResponse(weeklyRunResponse);
        if (!weeklyRunResponse.ok || weeklyRunData.ok !== true) {
          throw new Error(typeof weeklyRunData.error === "string" ? weeklyRunData.error : "Notion 生成紀錄同步失敗");
        }
      } catch (syncError) {
        setError(syncError instanceof Error ? `寵物已生成，但同步到 Notion 失敗：${syncError.message}` : "寵物已生成，但同步到 Notion 失敗");
      }
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "生成失敗，請重試";
      setError(message);
      setImgLoading(false);
      setImgLoadError(false);
      setImgLoaded(false);
    } finally {
      setIsAnalyzing(false);
      setIsGenerating(false);
    }
  };

  const handleDeployToMap = () => {
    if (!isComplete || !generatedImageUrl) return;

    const petId = generateId();
    const petName = `${mainGenre} 音樂精靈`;
    const newPet: Pet = {
      id: petId,
      name: petName,
      mainGenre,
      subGenre,
      baseType: getBaseType(mainGenre),
      weekNumber: 1,
      description: `由本週的音樂行程誕生，充滿 ${mainGenre} 的氣息。`,
      items: collectedItems,
    };
    generateWeeklyPet(newPet);

    const mapEntry: MapEntry = {
      id: generateId(),
      petId,
      pet: newPet,
      petImage: generatedImageUrl,
      petName,
      ownerName: userProfile?.name || "Anonymous",
      country: userProfile?.country || "Taiwan",
      city: userProfile?.city || "Taipei",
      mainGenre,
      secondGenre: subGenre,
      items: collectedItems,
      provider: generatedPetProvider || "leonardo",
      top: 50 + (Math.random() - 0.5) * 10,
      left: 50 + (Math.random() - 0.5) * 10,
    };

    addToMap(mapEntry);
    clearGeneratedWeeklyPetImage();
    resetWeek();
    navigateTo("map");
  };

  const handleConnectSpotify = () => {
    window.location.href = "/api/spotify/auth";
  };

  const handleDisconnectSpotify = () => {
    window.location.href = "/api/spotify/logout";
  };

  const handleResetWeek = () => {
    clearGeneratedWeeklyPetImage();
    resetWeek();
  };

  const handleAutoFillWeek = async () => {
    clearGeneratedWeeklyPetImage();
    await autoFillWeek();
  };

  const handleSecretTitleTap = () => {
    setTitleTapCount((count) => {
      const nextCount = count + 1;
      if (nextCount >= 5) {
        setShowDevTools((value) => !value);
        return 0;
      }
      return nextCount;
    });
  };

  useEffect(() => {
    if (titleTapCount === 0) return undefined;

    const timeoutId = window.setTimeout(() => {
      setTitleTapCount(0);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [titleTapCount]);

  const providerLabel =
    activeMusicProvider === "spotify"
      ? "Spotify 直連"
      : activeMusicProvider === "lastfm"
        ? "通用同步模式"
        : "體驗模式";

  const handleProviderChange = (provider: "mock" | "spotify" | "lastfm") => {
    updateUserProfile({ musicProvider: provider });
    if (userProfile) {
      syncUserProfileToNotion({
        name: userProfile.name,
        email: userProfile.email,
        country: userProfile.country,
        city: userProfile.city,
        style: userProfile.style,
        musicProvider: provider,
        lastfmUsername: provider === "lastfm" ? userProfile.lastfmUsername : "",
      }).catch(() => {
        // Keep source switching responsive even if Notion sync fails.
      });
    }
    if (provider !== "lastfm") {
      setShowMusicSourcePanel(false);
    }
  };

  const handleSaveLastfmUsername = () => {
    const nextProfile = {
      musicProvider: "lastfm",
      lastfmUsername: draftLastfmUsername.trim(),
    } as const;
    updateUserProfile(nextProfile);
    if (userProfile) {
      syncUserProfileToNotion({
        name: userProfile.name,
        email: userProfile.email,
        country: userProfile.country,
        city: userProfile.city,
        style: userProfile.style,
        musicProvider: "lastfm",
        lastfmUsername: draftLastfmUsername.trim(),
      }).catch(() => {
        // Keep Last.fm save responsive even if Notion sync fails.
      });
    }
    setShowMusicSourcePanel(false);
  };

  if (!mockMusic && !musicLoadError) {
    return <div className="p-8 text-center type-body">加載今日音樂數據...</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="page-title-group" onClick={handleSecretTitleTap}>
        <h2 className="page-title">
          {isPetGenerationStage ? "音樂寵物生成" : "今日音樂分析"}
        </h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="info-chip">
            Day {safeDay}/{TOTAL_DAYS}
          </span>
          <span className="type-caption text-[var(--color-muted)]">Data Source: {providerLabel}</span>
          {activeMusicProvider === "spotify" && spotifyConnected && spotifyDisplayName && (
            <span className="type-caption text-[var(--color-muted)]">Connected: {spotifyDisplayName}</span>
          )}
        </div>
      </div>

      <section className="section-surface space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="type-label">音樂來源</div>
            <div className="type-body mt-1">
              {activeMusicProvider === "spotify"
                ? "Spotify 已連接後會直接讀近期播放與常聽風格。"
                : activeMusicProvider === "lastfm"
                  ? "目前使用通用同步模式，透過 Last.fm 讀取近期紀錄。"
                  : "目前是體驗模式，使用隨機示範資料。"}
            </div>
          </div>
          <div className="info-chip">{providerLabel}</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setShowMusicSourcePanel((value) => !value)}>
            切換音樂來源
          </Button>
          {activeMusicProvider === "spotify" && (
            <Button onClick={handleConnectSpotify}>
              {spotifyConnected ? "重新連接 Spotify" : "連接 Spotify"}
            </Button>
          )}
        </div>

        {showMusicSourcePanel && (
          <div className="section-plain bg-white space-y-3">
            <div className="type-caption text-[var(--color-muted)]">
              切換後，之後的音樂分析會改讀新的來源；目前已收集的素材不會被清掉。
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleProviderChange("spotify")}
                className={`text-left rounded-xl border-[2px] px-4 py-3 ${activeMusicProvider === "spotify" ? "border-[var(--color-caramel)] bg-[var(--color-cream)]" : "border-[var(--color-line)] bg-white"}`}
              >
                <div className="type-label">Spotify</div>
                <div className="type-caption text-[var(--color-muted)] mt-1">Spotify 直連，授權後直接讀最近播放與常聽風格。</div>
              </button>
              <button
                type="button"
                onClick={() => handleProviderChange("lastfm")}
                className={`text-left rounded-xl border-[2px] px-4 py-3 ${activeMusicProvider === "lastfm" ? "border-[var(--color-caramel)] bg-[var(--color-cream)]" : "border-[var(--color-line)] bg-white"}`}
              >
                <div className="type-label">通用同步模式</div>
                <div className="type-caption text-[var(--color-muted)] mt-1">適合 YouTube Music、Apple Music、網易雲與其他可同步到 Last.fm 的平台。</div>
              </button>
            </div>

            {(activeMusicProvider === "lastfm" || showMusicSourcePanel) && (
              <div className="space-y-2 pt-1">
                <label className="type-label">Last.fm 使用者名稱</label>
                <input
                  value={draftLastfmUsername}
                  onChange={(event) => setDraftLastfmUsername(event.target.value)}
                  className="w-full min-w-0 pixel-border p-2 bg-[var(--color-cream)] outline-none focus:border-[var(--color-caramel)]"
                  placeholder="例如：musiclover123"
                />
                <div className="flex justify-end">
                  <Button
                    variant="secondary"
                    onClick={handleSaveLastfmUsername}
                    disabled={!draftLastfmUsername.trim()}
                  >
                    儲存 Last.fm 帳號
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {musicLoadError && (
        <section className="section-surface text-center space-y-4">
          <div>
            <h3 className="type-h2 mb-2">音樂資料尚未就緒</h3>
            <p className="type-body text-red-600">{musicLoadError}</p>
          </div>

          {activeMusicProvider === "spotify" && (
            <div className="flex flex-col gap-3">
              <Button onClick={handleConnectSpotify}>
                連接 Spotify
              </Button>
              {spotifyConnected && (
                <Button variant="secondary" onClick={handleDisconnectSpotify}>
                  解除 Spotify 連線
                </Button>
              )}
            </div>
          )}

          {activeMusicProvider === "lastfm" && musicLoadCode === "LASTFM_USERNAME_REQUIRED" && (
            <div className="type-caption text-[var(--color-muted)]">
              目前登入資料沒有 Last.fm 使用者名稱，請重新登入並填寫。
            </div>
          )}
        </section>
      )}

      {mockMusic && (
        <section className="section-surface flex flex-col space-y-4">
          <div>
            <h3 className="type-h2 text-center">相關數據</h3>
          </div>

          <div className="metric-row">
            <div className="type-label">聽歌數量</div>
            <div className="type-h2">{mockMusic.songCount} 首</div>
          </div>

          <div className="metric-row">
            <div className="type-label">分析類型</div>
            <div className="info-chip">
              {mockMusic.mainGenre === "Mixed" ? "混合型" : mockMusic.mainGenre === "Hidden" ? "隱藏版" : "純粹型"}
            </div>
          </div>

          <div className="metric-row">
            <div className="type-label">推薦主風格</div>
            <div className="type-h2">{normalizeGenre((mockMusic.assetGenre || mockMusic.mainGenre) as string).toUpperCase()}</div>
          </div>

          <div className="metric-row">
            <div className="type-label">推薦次風格</div>
            <div className="type-h2">{normalizeGenre((mockMusic.subGenre || "Pop") as string).toUpperCase()}</div>
          </div>

          <div className="section-plain">
            <div className="type-label mb-2">音樂風格分佈</div>
            <div className="flex h-4 bg-[var(--color-cream)] pixel-border overflow-hidden">
              {distribution.map((item, index) => (
                <div
                  key={item.genre}
                  className="h-full border-r-2 border-[var(--color-brown)] last:border-r-0 flex items-center justify-center text-[8px] font-bold overflow-hidden whitespace-nowrap text-[var(--color-cream)]"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor:
                      index === 0
                        ? "var(--color-caramel)"
                        : index === 1
                          ? "var(--color-blush)"
                          : "var(--color-sand)",
                  }}
                >
                  {item.percentage > 10 ? item.genre : ""}
                </div>
              ))}
            </div>
          </div>

          <div className="section-plain bg-[var(--color-cream)] text-center italic">
            "{mockMusic.quote}"
          </div>
        </section>
      )}

      {mockMusic && !hasGeneratedToday && (
        <section className="section-surface text-center">
          <h3 className="type-h2 mb-3">
            今日生成組合
          </h3>
          <p className="type-body mb-4">
            今天會同時使用主風格與次風格來生成素材。
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {todaysPreviewItems.map((item) => (
              <div key={item.id} className="section-plain bg-white">
                <div className="type-caption mb-2 text-[var(--color-brown)]">{item.label}</div>
                <PixelItemPlaceholder
                  genre={item.genre}
                  part={item.part}
                  imageSrc={item.imageSrc}
                  className="w-full h-24 border-none shadow-none bg-transparent"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-center space-y-4">
            {showGenAnim ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-2 gap-3 w-full"
              >
                {todaysPreviewItems.map((item) => (
                  <PixelItemPlaceholder
                    key={item.id}
                    genre={item.genre}
                    part={item.part}
                    imageSrc={item.imageSrc}
                    className="w-full h-24"
                  />
                ))}
              </motion.div>
            ) : (
              <div className="type-body text-[var(--color-muted)]">
                Day {safeDay} 會生成 {daySlotConfigs.map((slot) => slot.part).join(" + ")}
              </div>
            )}

            {!showGenAnim ? (
              <Button onClick={handleGenerate} className="w-full !py-2">
                確認今日分析並生成素材
              </Button>
            ) : (
              <div className="min-h-[40px]" />
            )}
            {todaysPreviewItems.some((item) => !item.imageSrc) && !showGenAnim && (
              <div className="type-caption text-red-600 mt-2">
                有素材缺失，請檢查今日對應的圖片檔。
              </div>
            )}
          </div>
        </section>
      )}

      {hasGeneratedToday && (
        <section className="section-surface text-center">
          <h3 className="type-h2 mb-4">
            Day {safeDay} 已收錄素材
          </h3>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`grid gap-3 ${todaysGeneratedItems.length > 1 ? "grid-cols-2" : "grid-cols-1"} items-start`}
          >
            {todaysGeneratedItems.map((item) => (
              <div key={item.id} className="section-plain flex flex-col items-center justify-center space-y-3 min-h-[160px] bg-white">
                <PixelItemPlaceholder
                  genre={item.genre}
                  part={item.part}
                  label={item.label}
                  imageSrc={item.imageSrc}
                  className="w-32 h-32"
                />
                <div className="type-caption text-[var(--color-caramel)]">
                  已收錄至本週收藏
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      )}

      {isPetGenerationStage && (
        <section className="section-surface text-center">
          <h3 className="type-h2 mb-2">確認生成音樂寵物</h3>
          <p className="type-body mb-4">
            系統會先將 base 與 5 個素材交給 Gemini 分析，再把整理好的 final prompt 交給 Leonardo 生成最終寵物圖。
          </p>

          <div className="mb-4">
            <div className="type-h2">{mainGenre} 音樂精靈</div>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <span className="info-chip">主：{mainGenre}</span>
              <span className="info-chip bg-white">副：{subGenre}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4 section-plain bg-[var(--color-panel)]">
            {[
              { key: "base", src: selectedBase, label: "base" },
              { key: "clothes", src: selectedClothes, label: "clothes" },
              { key: "shoes", src: selectedShoes, label: "shoes" },
              { key: "headwear", src: selectedHeadwear, label: "headwear" },
              { key: "handheld", src: selectedHandheld, label: "handheld" },
              { key: "accessory", src: selectedAccessory, label: "accessory" },
            ].map((item) => (
              <div
                key={item.key}
                className="aspect-square bg-white border-2 border-[var(--color-line)] flex items-center justify-center p-1 rounded-md"
              >
                <img
                  src={item.src || undefined}
                  alt={item.label}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(event) => ((event.currentTarget as HTMLImageElement).style.display = "none")}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="type-caption text-red-600 bg-red-50 border border-red-200 p-2 rounded mb-4">
              {error}
            </div>
          )}

          {(isAnalyzing || analysis || finalPrompt) && (
            <div className="section-plain bg-white text-left mb-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="type-label">素材分析結果</div>
                {isAnalyzing && <div className="type-caption text-[var(--color-muted)]">正在分析素材…</div>}
              </div>

              {notionPromptContext && (
                <div className="space-y-1">
                  <div className="type-label">Notion 風格參考</div>
                  <div className="type-caption text-[var(--color-muted)] whitespace-pre-wrap">
                    {notionPromptContext}
                  </div>
                </div>
              )}

              {analysis && (
                <div className="space-y-2">
                  <div className="type-caption"><span className="font-semibold">Base：</span>{analysis.base_description}</div>
                  <div className="type-caption"><span className="font-semibold">Clothes：</span>{analysis.clothes_description}</div>
                  <div className="type-caption"><span className="font-semibold">Shoes：</span>{analysis.shoes_description}</div>
                  <div className="type-caption"><span className="font-semibold">Headwear：</span>{analysis.headwear_description}</div>
                  <div className="type-caption"><span className="font-semibold">Handheld：</span>{analysis.handheld_description}</div>
                  <div className="type-caption"><span className="font-semibold">Accessory：</span>{analysis.accessory_description}</div>
                  <div className="type-caption"><span className="font-semibold">Style Summary：</span>{analysis.style_summary}</div>
                </div>
              )}

              {finalPrompt && (
                <div className="space-y-1">
                  <div className="type-label">Gemini final_prompt_en</div>
                  <pre className="whitespace-pre-wrap break-words rounded-xl border-2 border-[var(--color-line)] bg-[var(--color-cream)] p-3 text-xs leading-6 text-[var(--color-brown)]">
                    {finalPrompt}
                  </pre>
                </div>
              )}

              {isGenerating && (
                <div className="type-caption text-[var(--color-muted)]">正在生成寵物…</div>
              )}
            </div>
          )}

          {generatedImageUrl ? (
            <div className="mb-6 flex flex-col items-center">
              <div className="w-48 h-48 border-4 border-dashed border-[var(--color-brown)] rounded-xl bg-white p-2 shadow-[4px_4px_0_var(--color-caramel)] relative overflow-hidden">
                {imgLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 type-caption text-[var(--color-muted)] text-center px-2 border-2 border-dashed border-gray-300">
                    正在載入圖片...
                  </div>
                )}
                {imgLoadError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 type-caption text-red-500 text-center p-2 border-2 border-dashed border-red-200">
                    圖片暫時載入失敗，請重新生成或稍後再試。
                  </div>
                )}
                <img
                  src={generatedImageUrl}
                  alt="Generated Pet"
                  className="w-full h-full object-contain relative z-0"
                  onLoad={() => {
                    setImgLoading(false);
                    setImgLoadError(false);
                    setImgLoaded(true);
                  }}
                  onError={() => {
                    setImgLoading(false);
                    setImgLoadError(true);
                    setImgLoaded(false);
                  }}
                />
              </div>

              {imgLoaded && !imgLoadError && (
                <div className="type-caption text-green-600 mt-2 bg-green-50 px-2 py-1 rounded-sm border border-green-200">
                  生成成功！
                </div>
              )}

              <div className="mt-4 w-full">
                <Button
                  onClick={analyzeAndGeneratePet}
                  className="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                  disabled={isAnalyzing || isGenerating}
                >
                  {isAnalyzing ? "正在分析素材..." : isGenerating ? "正在生成寵物..." : "重新分析並生成"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <Button
                onClick={analyzeAndGeneratePet}
                className="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                disabled={isAnalyzing || isGenerating}
              >
                {isAnalyzing ? "正在分析素材..." : isGenerating ? "正在生成寵物..." : "分析並生成"}
              </Button>
            </div>
          )}
        </section>
      )}

      <Button
        onClick={handleDeployToMap}
        className="w-full py-3"
        disabled={!generatedImageUrl || isAnalyzing || isGenerating}
      >
        放到地圖上
      </Button>

      {showDevTools && (
        <div className="section-divider pt-4 flex flex-wrap gap-2 justify-center mt-8">
          <div className="w-full text-center type-label mb-1">DEV TOOLS</div>
          <Button
            variant="secondary"
            onClick={advanceDay}
            className="!p-2"
            disabled={safeDay >= TOTAL_DAYS}
          >
            模擬下一天
          </Button>
          <Button variant="secondary" onClick={handleResetWeek} className="!p-2">
            重置本週
          </Button>
          <Button variant="secondary" onClick={handleAutoFillWeek} className="!p-2 opacity-80">
            一鍵生成三天
          </Button>
        </div>
      )}
    </div>
  );
};

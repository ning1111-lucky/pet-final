import React, { useEffect, useState } from "react";
import { useApp } from "../AppContext";
import { Button, PixelItemPlaceholder } from "../components/UI";
import { getBaseType, getCollectionSlotIndex, getDaySlotConfigs, getTodayMusicData, MUSIC_PROVIDER, TOTAL_DAYS } from "../mockData";
import { DailyMusicData, MusicItem, Genre, MapEntry, Pet } from "../types";
import { generateId } from "../utils";
import { motion } from "motion/react";
import { baseShapeMap, getAssetErrorFallback, resolveAssetImage } from "../assetMap";

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

function buildFinalPetPrompt(
  weekItems: MusicItem[],
  mainGenre: string,
  secondGenre: string,
  baseKey: string
): string | null {
  if (weekItems.length < 5) return null;

  const findGenreByPart = (part: string) => weekItems.find((item) => item?.part === part)?.genre || "Unknown genre";

  return `Redraw one final weekly music pet using the provided base character image and selected weekly item images.

Weekly music identity:
Main genre: ${mainGenre}
Secondary genre: ${secondGenre}
Random base reference: ${baseKey}

Selected item references:
Day 1 clothes: ${findGenreByPart("clothes")} inspired main outfit
Day 1 shoes: ${findGenreByPart("shoes")} inspired secondary footwear
Day 2 headwear: ${findGenreByPart("headwear")} inspired headwear
Day 2 handheld: ${findGenreByPart("handheld")} inspired handheld object
Day 3 accessory: ${findGenreByPart("accessory")} inspired accessory with a subtle integrated music aura

Instructions:
preserve the base character silhouette and proportions.
Preserve the front-facing pose.
Use selected item images as outfit and accessory references.
Redraw them naturally onto the character.
Do not collage or paste raw images.
Keep the same cute pet identity as the base character.
Keep the lower body readable and let both shoes stay clearly visible.
Keep the handheld object beside the body instead of blocking the feet.
Output one cohesive full-body pixel-art character.
Soft pixel art, warm creamy colors, dark brown outlines.
Centered front view, no text, no watermark.`;
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
  } = useApp();

  const [mockMusic, setMockMusic] = useState<DailyMusicData | null>(null);
  const [showGenAnim, setShowGenAnim] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImgErr, setGeneratedImgErr] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(Boolean(getStoredGeneratedImage()));
  const [imgLoadError, setImgLoadError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [generatedPetImage, setGeneratedPetImage] = useState<string | null>(() => getStoredGeneratedImage());
  const [generatedPetProvider, setGeneratedPetProvider] = useState<string | null>(null);

  const safeDay = Math.min(Math.max(Number(currentMockDay) || 1, 1), TOTAL_DAYS);
  const safeWeekItems = Array.isArray(currentWeekItems) ? currentWeekItems : [];
  const daySlotConfigs = getDaySlotConfigs(safeDay);
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
    let active = true;
    setShowGenAnim(false);

    getTodayMusicData(MUSIC_PROVIDER).then((data) => {
      if (!active) return;
      setMockMusic(data);
    });

    return () => {
      active = false;
    };
  }, [safeDay]);

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
  const finalPetPrompt = isComplete ? buildFinalPetPrompt(collectedItems, mainGenre, subGenre, currentBaseKey) : null;

  const clearGeneratedWeeklyPetImage = () => {
    setGeneratedPetImage(null);
    setGeneratedImgErr(null);
    setImgLoading(false);
    setImgLoadError(false);
    setImgLoaded(false);
    setGeneratedPetProvider(null);

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

  const generateWeeklyPetImage = async () => {
    if (!finalPetPrompt) {
      setGeneratedImgErr("尚未產生本週寵物提示詞。");
      return;
    }

    if (generatedPetImage && !window.confirm("重新生成會覆蓋目前圖片，確定嗎？")) {
      return;
    }

    setIsGenerating(true);
    setGeneratedImgErr(null);
    setImgLoading(true);
    setImgLoadError(false);
    setImgLoaded(false);

    try {
      const response = await fetch("/api/generate-weekly-pet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPetPrompt,
          baseImagePath: baseImageSrc,
          itemImagePaths: collectedItems.map((item) => item.imageSrc).filter((imageSrc): imageSrc is string => typeof imageSrc === "string" && imageSrc.length > 0),
        }),
      });

      const data = await readApiJsonResponse(response);
      if (!response.ok || data.ok !== true) {
        const message =
          typeof data.error === "string" && data.error
            ? data.error
            : "生成失敗，請重試";
        throw new Error(message);
      }

      if (typeof data.imageUrl !== "string" || !data.imageUrl) {
        throw new Error("生成失敗，請重試");
      }

      setGeneratedPetImage(data.imageUrl);
      setGeneratedPetProvider("leonardo");
      try {
        localStorage.setItem(GENERATED_WEEKLY_PET_IMAGE_KEY, data.imageUrl);
      } catch {
        // Ignore quota errors so the generated image can still be displayed.
      }
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "生成失敗，請重試";
      setGeneratedImgErr(message);
      setImgLoading(false);
      setImgLoadError(false);
      setImgLoaded(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeployToMap = () => {
    if (!isComplete || !generatedPetImage) return;

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
      petImage: generatedPetImage,
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

  const handleResetWeek = () => {
    clearGeneratedWeeklyPetImage();
    resetWeek();
  };

  const handleAutoFillWeek = async () => {
    clearGeneratedWeeklyPetImage();
    await autoFillWeek();
  };

  if (!mockMusic) {
    return <div className="p-8 text-center type-body">加載今日音樂數據...</div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="page-title-group">
        <h2 className="page-title">
          {isPetGenerationStage ? "音樂寵物生成" : "今日音樂分析"}
        </h2>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="info-chip">
            Day {safeDay}/{TOTAL_DAYS}
          </span>
          <span className="type-caption text-[var(--color-muted)]">Data Source: {MUSIC_PROVIDER.toUpperCase()}</span>
        </div>
      </div>

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
            系統已根據這 3 天收集的 5 個音樂物品，整理出完整寵物生成提示詞。
          </p>

          <div className="mb-4">
            <div className="type-h2">{mainGenre} 音樂精靈</div>
            <div className="flex justify-center gap-2 mt-2 flex-wrap">
              <span className="info-chip">主：{mainGenre}</span>
              <span className="info-chip bg-white">副：{subGenre}</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4 section-plain bg-[var(--color-panel)]">
            {collectedItems.map((item) => (
              <div
                key={item.id}
                className="aspect-square bg-white border-2 border-[var(--color-line)] flex items-center justify-center p-1 rounded-md"
              >
                <img
                  src={item.imageSrc || undefined}
                  alt={item.part}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                  onError={(event) => {
                    const fallback = getAssetErrorFallback(item.genre, item.part, item.imageSrc, item.id);
                    if (fallback && fallback !== item.imageSrc) {
                      (event.currentTarget as HTMLImageElement).src = fallback;
                      return;
                    }
                    (event.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {generatedImgErr && (
            <div className="type-caption text-red-600 bg-red-50 border border-red-200 p-2 rounded mb-4">
              {generatedImgErr}
            </div>
          )}

          {generatedPetImage ? (
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
                  src={generatedPetImage}
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
                  onClick={generateWeeklyPetImage}
                  className="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                  disabled={isGenerating}
                >
                  {isGenerating ? "正在生成本週音樂寵物，可能需要幾秒鐘。" : "重新生成本週音樂寵物"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <Button
                onClick={generateWeeklyPetImage}
                className="w-full py-3 text-white bg-blue-500 hover:bg-blue-600 border-blue-700"
                disabled={isGenerating}
              >
                {isGenerating ? "正在生成本週音樂寵物，可能需要幾秒鐘。" : "生成本週音樂寵物"}
              </Button>
            </div>
          )}
        </section>
      )}

      <Button
        onClick={handleDeployToMap}
        className="w-full py-3"
        disabled={!generatedPetImage || isGenerating}
      >
        放到地圖上
      </Button>

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
    </div>
  );
};

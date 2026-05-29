import dotenv from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";

type ApiRequest = {
  method?: string;
  body?: {
    prompt?: unknown;
    baseImagePath?: unknown;
    itemImagePaths?: unknown;
  } | null;
};

type ApiResponse = {
  setHeader?: (name: string, value: string | string[]) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
  };
};

type JsonObject = Record<string, unknown>;

const POLLINATIONS_EDITS_URL = "https://gen.pollinations.ai/v1/images/edits";
const POLLINATIONS_MEDIA_UPLOAD_URL = "https://media.pollinations.ai/upload";
const POLLINATIONS_MODELS = ["nanobanana", "seedream"] as const;
const MAX_PROMPT_LENGTH = 2400;
const PUBLIC_DIR = path.join(process.cwd(), "public");

dotenv.config({ path: ".env.local" });
dotenv.config();

function jsonResponse(res: ApiResponse, statusCode: number, body: JsonObject) {
  return res.status(statusCode).json(body);
}

function buildEditPrompt(prompt: string): string {
  const normalizedPrompt = prompt.replace(/\s+/g, " ").trim();
  const hardRequirements = [
    "preserve the base character silhouette and proportions",
    "use selected item images as outfit and accessory references",
    "redraw them naturally onto the character",
    "do not collage or paste raw images",
    "output one cohesive full-body pixel-art character",
    "keep the same cute pet identity as the base image",
    "soft pixel art, warm creamy colors, dark brown outlines",
    "no text, no watermark, centered front view",
  ].join(", ");

  const combinedPrompt = `${normalizedPrompt}. ${hardRequirements}.`;
  return combinedPrompt.slice(0, MAX_PROMPT_LENGTH).trim();
}

function sanitizePublicAssetPath(assetPath: string): string | null {
  if (!assetPath.startsWith("/")) {
    return null;
  }

  const decodedPath = decodeURIComponent(assetPath);
  const resolvedPath = path.resolve(PUBLIC_DIR, `.${decodedPath}`);

  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    return null;
  }

  return resolvedPath;
}

function getMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

async function readAssetBlob(assetPath: string): Promise<{ blob: Blob; filename: string }> {
  const resolvedPath = sanitizePublicAssetPath(assetPath);
  if (!resolvedPath) {
    throw new Error(`無效的素材路徑：${assetPath}`);
  }

  const fileBuffer = await readFile(resolvedPath);
  const filename = path.basename(resolvedPath);

  return {
    blob: new Blob([fileBuffer], { type: getMimeType(resolvedPath) }),
    filename,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = "Pollinations 圖片編輯暫時失敗，請稍後再試。";
  const rawText = await response.text().catch(() => "");
  if (!rawText.trim()) {
    return fallbackMessage;
  }

  try {
    const parsed = JSON.parse(rawText) as JsonObject;
    if (typeof parsed.error === "string" && parsed.error) {
      return parsed.error;
    }
    const nestedError = parsed.error as JsonObject | undefined;
    if (nestedError && typeof nestedError.message === "string" && nestedError.message) {
      return nestedError.message;
    }
    if (typeof parsed.message === "string" && parsed.message) {
      return parsed.message;
    }
  } catch {
    return rawText.trim() || fallbackMessage;
  }

  return rawText.trim() || fallbackMessage;
}

async function readJsonResponse(response: Response): Promise<JsonObject | null> {
  const rawText = await response.text().catch(() => "");
  if (!rawText.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawText);
    return parsed && typeof parsed === "object" ? (parsed as JsonObject) : null;
  } catch {
    return null;
  }
}

async function uploadGeneratedImage(
  imageBuffer: Uint8Array,
  contentType: string,
  apiKey: string,
  filename: string
): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", new Blob([imageBuffer], { type: contentType }), filename);

    const response = await fetch(POLLINATIONS_MEDIA_UPLOAD_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await readJsonResponse(response);
    return typeof payload?.url === "string" && payload.url ? payload.url : null;
  } catch {
    return null;
  }
}

async function requestImageEdit(options: {
  apiKey: string;
  model: (typeof POLLINATIONS_MODELS)[number];
  prompt: string;
  baseImagePath: string;
  itemImagePaths: string[];
}): Promise<{ imageUrl: string; model: string }> {
  const formData = new FormData();
  const imagePaths = [options.baseImagePath, ...options.itemImagePaths];

  for (const imagePath of imagePaths) {
    const asset = await readAssetBlob(imagePath);
    formData.append("image", asset.blob, asset.filename);
  }

  formData.append("prompt", options.prompt);
  formData.append("model", options.model);
  formData.append("size", "1024x1024");
  formData.append("response_format", "url");

  const response = await fetch(POLLINATIONS_EDITS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const payload = await readJsonResponse(response);
  const imageEntry = Array.isArray(payload?.data) ? (payload.data[0] as JsonObject | undefined) : undefined;

  if (imageEntry && typeof imageEntry.url === "string" && imageEntry.url) {
    return {
      imageUrl: imageEntry.url,
      model: options.model,
    };
  }

  if (imageEntry && typeof imageEntry.b64_json === "string" && imageEntry.b64_json) {
    const imageBuffer = Buffer.from(imageEntry.b64_json, "base64");
    const uploadedImageUrl = await uploadGeneratedImage(
      imageBuffer,
      "image/png",
      options.apiKey,
      `weekly-pet-${options.model}.png`
    );

    return {
      imageUrl: uploadedImageUrl || `data:image/png;base64,${imageEntry.b64_json}`,
      model: options.model,
    };
  }

  throw new Error("Pollinations 沒有回傳可用的編輯圖片結果。");
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") {
    res.setHeader?.("Allow", "POST");
    return jsonResponse(res, 405, { ok: false, error: "只支援 POST 請求。" });
  }

  const prompt = req.body?.prompt;
  const baseImagePath = req.body?.baseImagePath;
  const itemImagePaths = req.body?.itemImagePaths;

  if (typeof prompt !== "string" || !prompt.trim()) {
    return jsonResponse(res, 400, { ok: false, error: "缺少 prompt，請重新生成 Day 7 提示詞後再試。" });
  }

  if (typeof baseImagePath !== "string" || !baseImagePath.trim()) {
    return jsonResponse(res, 400, { ok: false, error: "缺少 base 角色圖片，請重新整理後再試。" });
  }

  if (!Array.isArray(itemImagePaths) || itemImagePaths.length === 0) {
    return jsonResponse(res, 400, { ok: false, error: "缺少本週素材圖片，請確認 Day 1 到 Day 6 都已生成。" });
  }

  const safeItemImagePaths = itemImagePaths.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  if (safeItemImagePaths.length === 0) {
    return jsonResponse(res, 400, { ok: false, error: "缺少有效的素材圖片路徑，請重新生成本週物品後再試。" });
  }

  const apiKey = process.env.POLLINATIONS_KEY;
  if (!apiKey) {
    return jsonResponse(res, 500, {
      ok: false,
      error: "Pollinations API key 尚未設定，請先在 Vercel 環境變數加入 POLLINATIONS_KEY。",
    });
  }

  const finalPrompt = buildEditPrompt(prompt);
  const attemptErrors: string[] = [];

  for (const model of POLLINATIONS_MODELS) {
    try {
      const result = await requestImageEdit({
        apiKey,
        model,
        prompt: finalPrompt,
        baseImagePath,
        itemImagePaths: safeItemImagePaths,
      });

      return jsonResponse(res, 200, {
        ok: true,
        imageUrl: result.imageUrl,
        provider: "pollinations",
        model: result.model,
      });
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : `模型 ${model} 編輯失敗。`;
      attemptErrors.push(`${model}: ${message}`);
    }
  }

  console.error("Pollinations weekly pet edit failed:", attemptErrors);
  return jsonResponse(res, 502, {
    ok: false,
    error: attemptErrors[attemptErrors.length - 1] || "Pollinations 圖片編輯暫時失敗，請稍後再試。",
  });
}

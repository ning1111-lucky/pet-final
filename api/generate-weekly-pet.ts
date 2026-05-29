import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
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

const GEMINI_IMAGE_MODELS = ["gemini-3.1-flash-image", "gemini-2.5-flash-image"] as const;
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
    "centered front view, no text, no watermark",
  ].join(", ");

  return `${normalizedPrompt}. ${hardRequirements}.`.slice(0, MAX_PROMPT_LENGTH).trim();
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

async function readAssetInlineData(assetPath: string): Promise<{ inlineData: { mimeType: string; data: string } }> {
  const resolvedPath = sanitizePublicAssetPath(assetPath);
  if (!resolvedPath) {
    throw new Error(`無效的素材路徑：${assetPath}`);
  }

  const fileBuffer = await readFile(resolvedPath);
  return {
    inlineData: {
      mimeType: getMimeType(resolvedPath),
      data: fileBuffer.toString("base64"),
    },
  };
}

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
}

function extractErrorMessage(error: unknown, fallback = "Gemini 圖片生成暫時失敗，請稍後再試。") {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error) {
    return error;
  }

  return fallback;
}

async function requestGeminiImageEdit(options: {
  apiKey: string;
  model: (typeof GEMINI_IMAGE_MODELS)[number];
  prompt: string;
  baseImagePath: string;
  itemImagePaths: string[];
}): Promise<{ imageUrl: string; model: string }> {
  const ai = new GoogleGenAI({ apiKey: options.apiKey });
  const imageParts = await Promise.all(
    [options.baseImagePath, ...options.itemImagePaths].map((imagePath) => readAssetInlineData(imagePath))
  );

  const response = await ai.models.generateContent({
    model: options.model,
    contents: [
      ...imageParts,
      {
        text: options.prompt,
      },
    ],
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error("Gemini 沒有回傳可用的圖片結果。");
  }

  return {
    imageUrl: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${imagePart.inlineData.data}`,
    model: options.model,
  };
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

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return jsonResponse(res, 500, {
      ok: false,
      error: "Gemini API key 尚未設定，請先在 .env.local 或部署環境中加入 GEMINI_API_KEY。",
    });
  }

  const finalPrompt = buildEditPrompt(prompt);
  const attemptErrors: string[] = [];

  for (const model of GEMINI_IMAGE_MODELS) {
    try {
      const result = await requestGeminiImageEdit({
        apiKey,
        model,
        prompt: finalPrompt,
        baseImagePath,
        itemImagePaths: safeItemImagePaths,
      });

      return jsonResponse(res, 200, {
        ok: true,
        imageUrl: result.imageUrl,
        provider: "gemini",
        model: result.model,
      });
    } catch (error) {
      attemptErrors.push(`${model}: ${extractErrorMessage(error)}`);
    }
  }

  console.error("Gemini weekly pet edit failed:", attemptErrors);
  return jsonResponse(res, 502, {
    ok: false,
    error: attemptErrors[attemptErrors.length - 1] || "Gemini 圖片生成暫時失敗，請稍後再試。",
  });
}

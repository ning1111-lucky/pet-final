import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import generateWeeklyPetHandler from "./api/generate-weekly-pet";

function createJsonResponder(res: {
  statusCode: number;
  setHeader: (name: string, value: string | string[]) => void;
  end: (chunk?: string) => void;
}) {
  return {
    setHeader(name: string, value: string | string[]) {
      res.setHeader(name, value);
    },
    status(code: number) {
      res.statusCode = code;
      return {
        json(body: unknown) {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(body));
        },
      };
    },
  };
}

async function readRequestBody(req: {
  on: (event: string, handler: (chunk?: Buffer) => void) => void;
}): Promise<Record<string, unknown> | null> {
  const chunks: Buffer[] = [];

  return new Promise((resolve) => {
    req.on("data", (chunk) => {
      if (chunk) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
    });

    req.on("end", () => {
      const text = Buffer.concat(chunks).toString("utf8").trim();
      if (!text) {
        resolve(null);
        return;
      }

      try {
        const parsed = JSON.parse(text);
        resolve(parsed && typeof parsed === "object" ? parsed : null);
      } catch {
        resolve({ __invalidJson: true });
      }
    });
  });
}

function localApiPlugin(): Plugin {
  return {
    name: "local-pollinations-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname !== "/api/generate-weekly-pet") {
          next();
          return;
        }

        const responder = createJsonResponder(res);

        try {
          const body = await readRequestBody(req);
          if (body && "__invalidJson" in body) {
            responder.status(400).json({ ok: false, error: "請求格式錯誤，JSON 內容無法解析。" });
            return;
          }

          await generateWeeklyPetHandler(
            {
              method: req.method,
              body,
            },
            responder
          );
        } catch (error) {
          console.error("Local /api/generate-weekly-pet middleware failed:", error);
          responder.status(500).json({ ok: false, error: "生成失敗，請重試" });
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});

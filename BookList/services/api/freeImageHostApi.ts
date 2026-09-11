import { z } from "zod";
import { FREEIMAGEHOST_CONFIG } from "../config";

const TIMEOUT_MS = 10000;
const OPEN_CORS_UPLOAD_URL =
  "https://litterbox.catbox.moe/resources/internals/api.php";

const freeImageHostResponseSchema = z.object({
  status_code: z.number().optional(),
  image: z
    .object({
      url: z.string().optional(),
      display_url: z.string().optional(),
    })
    .optional(),
  url: z.string().optional(),
});

async function uploadToOpenHost(
  cleanBase64: string,
  signal: AbortSignal,
): Promise<string | null> {
  try {
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("time", "72h");
    formData.append("fileToUpload", blob, "cover.jpg");

    const response = await fetch(OPEN_CORS_UPLOAD_URL, {
      method: "POST",
      body: formData,
      signal,
    });

    if (!response.ok) return null;
    const text =
      typeof response.text === "function" ? await response.text() : "";
    const imageUrl = text.trim();
    return imageUrl.startsWith("http") ? imageUrl : null;
  } catch {
    return null;
  }
}

/**
 * Uploads a base64 encoded image to a remote image host.
 * On Web, uses a CORS-enabled endpoint to avoid browser ERR_FAILED CORS blocks.
 * On Native, uses FreeImageHost directly.
 * Degrades silently to null on any failure (like openLibraryApi), ensuring the UI never breaks.
 *
 * @param base64Image Raw base64 string or data URI (e.g. data:image/jpeg;base64,...)
 * @returns Remote hosted image URL, or null if upload fails.
 */
export async function uploadCoverToFreeImageHost(
  base64Image: string,
): Promise<string | null> {
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const isWeb =
    typeof window !== "undefined" && typeof window.document !== "undefined";

  try {
    // 1. On Web, prioritize open CORS host because FreeImageHost lacks Access-Control-Allow-Origin
    if (isWeb) {
      const webResult = await uploadToOpenHost(cleanBase64, controller.signal);
      if (webResult) return webResult;
    }

    // 2. On native or fallback, attempt FreeImageHost if API key is present
    const apiKey = FREEIMAGEHOST_CONFIG.apiKey;
    if (apiKey) {
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("action", "upload");
      formData.append("source", cleanBase64);
      formData.append("format", "json");

      const response = await fetch(FREEIMAGEHOST_CONFIG.uploadUrl, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (response.ok) {
        const parsed = freeImageHostResponseSchema.safeParse(
          await response.json(),
        );
        if (parsed.success) {
          const imageUrl =
            parsed.data.image?.url ||
            parsed.data.image?.display_url ||
            parsed.data.url;
          if (imageUrl) return imageUrl;
        }
      }
    }

    // 3. Fallback to open host if not already tried
    if (!isWeb) {
      return await uploadToOpenHost(cleanBase64, controller.signal);
    }

    return null;
  } catch {
    // Silent degradation: when remote image host is unavailable or blocked, gracefully return null.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

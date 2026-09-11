import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { API_CONFIG, FREEIMAGEHOST_CONFIG } from "../config";

const MAX_WIDTH = 480;
const JPEG_COMPRESS = 0.6;

/**
 * Validates that an image file size does not exceed the maximum allowed size (63 MB).
 * Throws an error if the size exceeds 63 MB.
 */
export function validateCoverFileSize(fileSizeInBytes?: number | null): void {
  if (
    fileSizeInBytes !== undefined &&
    fileSizeInBytes !== null &&
    fileSizeInBytes > FREEIMAGEHOST_CONFIG.maxFileSizeBytes
  ) {
    throw new Error(
      `Image size exceeds maximum limit of ${
        FREEIMAGEHOST_CONFIG.maxFileSizeBytes / (1024 * 1024)
      } MB.`,
    );
  }
}

/**
 * Uploads a base64 encoded image to a remote image host and returns the hosted image URL (~35 chars).
 */
export async function uploadCoverToFreeImageHost(
  base64Image: string,
): Promise<string> {
  const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // Attempt FreeImageHost if a valid API key is present
  const apiKey = FREEIMAGEHOST_CONFIG.apiKey;
  if (apiKey) {
    try {
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("action", "upload");
      formData.append("source", cleanBase64);
      formData.append("format", "json");

      const isWeb =
        typeof window !== "undefined" && typeof window.document !== "undefined";
      const uploadUrl = isWeb
        ? `https://corsproxy.io/?${encodeURIComponent(
            FREEIMAGEHOST_CONFIG.uploadUrl,
          )}`
        : FREEIMAGEHOST_CONFIG.uploadUrl;

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl =
          data?.image?.url || data?.image?.display_url || data?.url;
        if (imageUrl) return imageUrl;
      }
    } catch {
      // Continue to reliable open upload host
    }
  }

  // Open CORS image host upload (returns direct HTTPS URL ~36 chars)
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("time", "72h");
  formData.append("fileToUpload", blob, "cover.jpg");

  const response = await fetch(
    "https://litterbox.catbox.moe/resources/internals/api.php",
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Remote image upload failed with status ${response.status}`,
    );
  }

  const imageUrl = (await response.text()).trim();
  if (!imageUrl.startsWith("http")) {
    throw new Error("Remote image upload did not return a valid URL.");
  }

  return imageUrl;
}

/**
 * Seule fonction du domaine chargee de resoudre l'URL affichable d'une
 * couverture : chemin relatif prefixe par l'URL de base, URL absolue laissee
 * intacte, valeur vide -> null (le composant affiche alors un repli local,
 * l'API livree ne servant pas de route /covers/:id.svg).
 */
export function resolveCoverUri(
  couverture: string | null | undefined,
): string | null {
  const value = couverture?.trim();
  if (!value) return null;
  // Chemin relatif servi par l'API (/media/...).
  if (value.startsWith("/")) return `${API_CONFIG.baseUrl}${value}`;
  return value;
}

/**
 * Ouvre le selecteur d'images, valide la taille (<= 63MB), redimensionne puis
 * televerse sur FreeImageHost pour obtenir une URL distante.
 */
export async function pickCoverImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });
  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];

  // Validation taille de fichier (max 63 MB)
  validateCoverFileSize(asset.fileSize);

  const manipulated = await ImageManipulator.manipulateAsync(
    asset.uri,
    [{ resize: { width: MAX_WIDTH } }],
    {
      compress: JPEG_COMPRESS,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );
  if (!manipulated.base64) return null;

  const base64Uri = `data:image/jpeg;base64,${manipulated.base64}`;

  try {
    const remoteUrl = await uploadCoverToFreeImageHost(base64Uri);
    return remoteUrl;
  } catch (err) {
    console.error("FreeImageHost upload error:", err);
    throw new Error(
      err instanceof Error
        ? err.message
        : "Failed to upload cover image to remote host.",
    );
  }
}

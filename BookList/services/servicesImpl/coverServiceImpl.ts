import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { API_CONFIG, FREEIMAGEHOST_CONFIG } from "../config";
import { uploadCoverToFreeImageHost } from "../api/freeImageHostApi";

export { uploadCoverToFreeImageHost } from "../api/freeImageHostApi";

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
 * Resolves the displayable URL for a book cover:
 * prefixes relative paths with base API URL, leaves absolute URLs intact,
 * returns null when empty.
 */
export function resolveCoverUri(
  couverture: string | null | undefined,
): string | null {
  const value = couverture?.trim();
  if (!value) return null;
  if (value.startsWith("/")) return `${API_CONFIG.baseUrl}${value}`;
  return value;
}

/**
 * Opens image picker, validates file size (<= 63MB), resizes and compresses image,
 * then uploads to remote image host.
 * Degrades gracefully to null if remote upload is unavailable.
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

  // File size validation (max 63 MB)
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

  return await uploadCoverToFreeImageHost(base64Uri);
}

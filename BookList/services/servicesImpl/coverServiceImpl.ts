import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

// Redimensionnement client : evite le 413 en gardant un base64 leger.
const MAX_WIDTH = 480;
const JPEG_COMPRESS = 0.6;

/**
 * Seule fonction du domaine chargee de resoudre l'URL affichable d'une
 * couverture (data URI, URL distante, ou null -> pas de couverture).
 */
export function resolveCoverUri(
  couverture: string | null | undefined,
): string | null {
  if (!couverture || couverture.trim().length === 0) return null;
  return couverture;
}

/**
 * Ouvre le selecteur d'images, redimensionne cote client puis encode en
 * m (data URI) pour rester sous la limite de payload de l'API.
 * Retourne null si l'utilisateur annule ou refuse la permission.
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

  return `data:image/jpeg;base64,${manipulated.base64}`;
}

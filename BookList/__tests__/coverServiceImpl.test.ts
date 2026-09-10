import {
  resolveCoverUri,
  pickCoverImage,
} from "../services/servicesImpl/coverServiceImpl";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock("expo-image-manipulator", () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: "jpeg" },
}));

describe("resolveCoverUri", () => {
  it("returns null for null, undefined or blank values", () => {
    expect(resolveCoverUri(null)).toBeNull();
    expect(resolveCoverUri(undefined)).toBeNull();
    expect(resolveCoverUri("   ")).toBeNull();
  });

  it("returns the value unchanged when a cover is present", () => {
    expect(resolveCoverUri("/covers/42.svg")).toBe("/covers/42.svg");
    expect(resolveCoverUri("https://example.com/cover.png")).toBe(
      "https://example.com/cover.png",
    );
  });
});

describe("pickCoverImage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns null when the media library permission is refused", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: false });

    const result = await pickCoverImage();

    expect(result).toBeNull();
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("returns null when the user cancels the selection", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const result = await pickCoverImage();

    expect(result).toBeNull();
  });

  it("resizes the picked image and returns a base64 data URI", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///tmp/photo.jpg" }],
    });
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      base64: "AAAA",
    });

    const result = await pickCoverImage();

    expect(ImageManipulator.manipulateAsync).toHaveBeenCalledWith(
      "file:///tmp/photo.jpg",
      [{ resize: { width: 480 } }],
      expect.objectContaining({ compress: 0.6, base64: true }),
    );
    expect(result).toBe("data:image/jpeg;base64,AAAA");
  });

  it("returns null when the manipulator does not produce a base64 payload", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///tmp/photo.jpg" }],
    });
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      base64: undefined,
    });

    const result = await pickCoverImage();

    expect(result).toBeNull();
  });
});

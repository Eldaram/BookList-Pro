import {
  resolveCoverUri,
  pickCoverImage,
  validateCoverFileSize,
  uploadCoverToFreeImageHost,
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

describe("validateCoverFileSize", () => {
  it("does not throw for valid file sizes under 63MB", () => {
    expect(() => validateCoverFileSize(10 * 1024 * 1024)).not.toThrow();
    expect(() => validateCoverFileSize(63 * 1024 * 1024)).not.toThrow();
    expect(() => validateCoverFileSize(undefined)).not.toThrow();
  });

  it("throws an error when file size exceeds 63MB", () => {
    expect(() => validateCoverFileSize(64 * 1024 * 1024)).toThrow(
      "Image size exceeds maximum limit of 63 MB.",
    );
  });
});

describe("uploadCoverToFreeImageHost", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as jest.Mock;
  });

  it("sends request to remote host and returns the uploaded image URL", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "https://litter.catbox.moe/test.png",
      json: async () => ({
        status_code: 200,
        image: { url: "https://freeimage.host/i/test.jpg" },
      }),
    });

    const url = await uploadCoverToFreeImageHost("data:image/jpeg;base64,AAAA");

    expect(url).toBe("https://freeimage.host/i/test.jpg");
  });

  it("throws error when API response is not ok", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Error",
    });

    await expect(
      uploadCoverToFreeImageHost("data:image/jpeg;base64,AAAA"),
    ).rejects.toThrow("Remote image upload failed with status 500");
  });
});

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
    global.fetch = jest.fn() as jest.Mock;
  });

  it("returns null when the media library permission is refused", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: false });

    const result = await pickCoverImage();

    expect(result).toBeNull();
    expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
  });

  it("throws when picked file exceeds 63MB", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///tmp/huge.jpg", fileSize: 70 * 1024 * 1024 }],
    });

    await expect(pickCoverImage()).rejects.toThrow(
      "Image size exceeds maximum limit of 63 MB.",
    );
  });

  it("resizes the picked image, uploads to remote host and returns remote URL", async () => {
    (
      ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock
    ).mockResolvedValue({ granted: true });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///tmp/photo.jpg", fileSize: 5 * 1024 * 1024 }],
    });
    (ImageManipulator.manipulateAsync as jest.Mock).mockResolvedValue({
      base64: "AAAA",
    });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: async () => "https://litter.catbox.moe/photo.jpg",
      json: async () => ({
        image: { url: "https://freeimage.host/i/photo.jpg" },
      }),
    });

    const result = await pickCoverImage();

    expect(result).toBe("https://freeimage.host/i/photo.jpg");
  });
});

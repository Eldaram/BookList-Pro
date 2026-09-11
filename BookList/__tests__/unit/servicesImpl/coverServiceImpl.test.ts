import {
  resolveCoverUri,
  pickCoverImage,
} from "../../../services/servicesImpl/coverServiceImpl";
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

describe("Covers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resolveCoverUri: null when empty, unchanged value otherwise", () => {
    expect(resolveCoverUri(null)).toBeNull();
    expect(resolveCoverUri("   ")).toBeNull();
    expect(resolveCoverUri("https://example.com/cover.png")).toBe(
      "https://example.com/cover.png",
    );
  });

  it("pickCoverImage: resizes the picked image into a base64 data URI", async () => {
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
});

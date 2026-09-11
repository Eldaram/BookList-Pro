import { uploadCoverToFreeImageHost } from "../../../services/api/freeImageHostApi";

const globalFetch = global.fetch;

describe("FreeImageHost API client", () => {
  afterAll(() => {
    global.fetch = globalFetch;
  });

  it("returns the hosted image URL on successful upload", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        image: { url: "https://freeimage.host/images/sample.jpg" },
      }),
    }) as unknown as typeof fetch;

    const url = await uploadCoverToFreeImageHost("data:image/jpeg;base64,AAAA");

    expect(url).toBe("https://freeimage.host/images/sample.jpg");
  });

  it("silently degrades to null when remote host is unavailable", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const url = await uploadCoverToFreeImageHost("AAAA");

    expect(url).toBeNull();
  });

  it("silently degrades to null on non-200 HTTP responses", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
    }) as unknown as typeof fetch;

    const url = await uploadCoverToFreeImageHost("AAAA");

    expect(url).toBeNull();
  });
});

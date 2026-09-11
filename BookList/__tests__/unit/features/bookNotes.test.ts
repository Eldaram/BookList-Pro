import { booksList } from "../../../features/books/booksList";
import { httpClient } from "../../../services/api/httpClient";
import { BookNote } from "../../../domain/book";

jest.mock("../../../services/api/httpClient", () => ({
  httpClient: { request: jest.fn() },
}));

const makeNote = (overrides: Partial<BookNote> = {}): BookNote => ({
  id: "note-1",
  livreId: "uuid-1",
  contenu: "Très bon premier chapitre.",
  createdAt: "2026-09-10T10:00:00Z",
  ...overrides,
});

describe("Reading notes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles the full note lifecycle through the facade", async () => {
    // Création
    const created = makeNote();
    (httpClient.request as jest.Mock).mockResolvedValueOnce(created);
    const note = await booksList.createNote("uuid-1", created.contenu);
    expect(httpClient.request).toHaveBeenCalledWith(
      "/books/uuid-1/notes",
      expect.objectContaining({
        method: "POST",
        body: { contenu: created.contenu },
      }),
    );
    expect(note).toEqual(created);

    // Lecture
    (httpClient.request as jest.Mock).mockResolvedValueOnce([created]);
    const notes = await booksList.getNotes("uuid-1");
    expect(notes).toHaveLength(1);

    // Suppression
    (httpClient.request as jest.Mock).mockResolvedValueOnce(undefined);
    await booksList.deleteNote("uuid-1", "note-1");
    expect(httpClient.request).toHaveBeenLastCalledWith(
      "/books/uuid-1/notes/note-1",
      { method: "DELETE" },
    );
  });
});

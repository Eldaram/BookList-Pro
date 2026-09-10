import { notesApi } from "../services/api/notesApi";
import { noteServiceImpl } from "../services/servicesImpl/noteServiceImpl";
import { booksList } from "../features/books/booksList";
import { httpClient } from "../services/api/httpClient";
import { bookNoteSchema, bookNotesSchema } from "../services/api/schemas";
import { BookNote } from "../domain/book";

jest.mock("../services/api/httpClient", () => ({
  httpClient: { request: jest.fn() },
}));

const makeNote = (overrides: Partial<BookNote> = {}): BookNote => ({
  id: "note-1",
  livreId: "uuid-1",
  contenu: "Très bon premier chapitre.",
  createdAt: "2026-09-10T10:00:00Z",
  ...overrides,
});

describe("Book Notes Feature Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("notesApi", () => {
    it("fetches notes with GET /books/:id/notes and validates the schema", async () => {
      const notes = [makeNote()];
      (httpClient.request as jest.Mock).mockResolvedValue(notes);

      const result = await notesApi.getNotes("uuid-1");

      expect(httpClient.request).toHaveBeenCalledWith("/books/uuid-1/notes", {
        method: "GET",
        schema: bookNotesSchema,
      });
      expect(result).toEqual(notes);
    });

    it("creates a note with POST /books/:id/notes and the contenu body", async () => {
      const created = makeNote({ id: "note-2", contenu: "Nouvelle note" });
      (httpClient.request as jest.Mock).mockResolvedValue(created);

      const result = await notesApi.createNote("uuid-1", "Nouvelle note");

      expect(httpClient.request).toHaveBeenCalledWith("/books/uuid-1/notes", {
        method: "POST",
        body: { contenu: "Nouvelle note" },
        schema: bookNoteSchema,
      });
      expect(result).toEqual(created);
    });

    it("deletes a note with DELETE /books/:id/notes/:noteId", async () => {
      (httpClient.request as jest.Mock).mockResolvedValue(undefined);

      await notesApi.deleteNote("uuid-1", "note-1");

      expect(httpClient.request).toHaveBeenCalledWith(
        "/books/uuid-1/notes/note-1",
        { method: "DELETE" },
      );
    });

    it("propagates errors thrown by the http client", async () => {
      const error = { type: "NETWORK", message: "offline" };
      (httpClient.request as jest.Mock).mockRejectedValue(error);

      await expect(notesApi.getNotes("uuid-1")).rejects.toEqual(error);
    });
  });

  describe("noteServiceImpl", () => {
    it("delegates getNotes to notesApi", async () => {
      const notes = [makeNote()];
      (httpClient.request as jest.Mock).mockResolvedValue(notes);

      const result = await noteServiceImpl.getNotes("uuid-1");

      expect(result).toEqual(notes);
    });

    it("delegates createNote to notesApi", async () => {
      const created = makeNote({ id: "note-3" });
      (httpClient.request as jest.Mock).mockResolvedValue(created);

      const result = await noteServiceImpl.createNote("uuid-1", "Texte");

      expect(result).toEqual(created);
    });
  });

  describe("booksList facade", () => {
    it("exposes getNotes through the facade", async () => {
      const notes = [makeNote(), makeNote({ id: "note-2" })];
      (httpClient.request as jest.Mock).mockResolvedValue(notes);

      const result = await booksList.getNotes("uuid-1");

      expect(result).toHaveLength(2);
      expect(result).toEqual(notes);
    });

    it("exposes createNote through the facade", async () => {
      const created = makeNote({ id: "note-4", contenu: "Via facade" });
      (httpClient.request as jest.Mock).mockResolvedValue(created);

      const result = await booksList.createNote("uuid-1", "Via facade");

      expect(result.contenu).toBe("Via facade");
    });

    it("exposes deleteNote through the facade", async () => {
      (httpClient.request as jest.Mock).mockResolvedValue(undefined);

      await booksList.deleteNote("uuid-1", "note-1");

      expect(httpClient.request).toHaveBeenCalledWith(
        "/books/uuid-1/notes/note-1",
        { method: "DELETE" },
      );
    });
  });
});

import { httpClient } from "./httpClient";
import { bookNoteSchema, bookNotesSchema } from "./schemas";
import { BookNote } from "../../domain/book";

class NotesApi {
  async getNotes(bookId: string): Promise<BookNote[]> {
    return httpClient.request<BookNote[]>(`/books/${bookId}/notes`, {
      method: "GET",
      schema: bookNotesSchema,
    });
  }

  async createNote(bookId: string, contenu: string): Promise<BookNote> {
    return httpClient.request<BookNote>(`/books/${bookId}/notes`, {
      method: "POST",
      body: { contenu },
      schema: bookNoteSchema,
    });
  }

  async deleteNote(bookId: string, noteId: string): Promise<void> {
    return httpClient.request<void>(`/books/${bookId}/notes/${noteId}`, {
      method: "DELETE",
    });
  }
}

export const notesApi = new NotesApi();

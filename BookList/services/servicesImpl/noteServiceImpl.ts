import { notesApi } from "../api/notesApi";
import { BookNote } from "../../domain/book";

/**
 * Service encapsulating notesApi for reading-note operations on a book.
 */
class NoteServiceImpl {
  async getNotes(bookId: string): Promise<BookNote[]> {
    return notesApi.getNotes(bookId);
  }

  async createNote(bookId: string, contenu: string): Promise<BookNote> {
    return notesApi.createNote(bookId, contenu);
  }

  async deleteNote(bookId: string, noteId: string): Promise<void> {
    return notesApi.deleteNote(bookId, noteId);
  }
}

export const noteServiceImpl = new NoteServiceImpl();

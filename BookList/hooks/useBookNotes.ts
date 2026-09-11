import { useCallback, useEffect, useState } from "react";
import { BookNote } from "../domain/book";
import { AppError, toAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";

export function useBookNotes(bookId: string | undefined) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    booksList
      .getNotes(bookId)
      .then((fetched) => {
        if (cancelled) return;
        setNotes(fetched);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(toAppError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const addNote = useCallback(
    async (contenu: string): Promise<boolean> => {
      if (!bookId) return false;
      setSaving(true);
      try {
        const created = await booksList.createNote(bookId, contenu);
        setNotes((prev) => [created, ...prev]);
        setError(null);
        return true;
      } catch (err) {
        setError(toAppError(err));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [bookId],
  );

  const removeNote = useCallback(
    async (noteId: string) => {
      if (!bookId) return;
      const previous = notes;
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      try {
        await booksList.deleteNote(bookId, noteId);
        setError(null);
      } catch (err) {
        setNotes(previous);
        setError(toAppError(err));
      }
    },
    [bookId, notes],
  );

  return { notes, loading, saving, error, addNote, removeNote };
}

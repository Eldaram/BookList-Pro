import { useEffect, useState } from "react";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";
//Ajoute la couverture des livres dans le hook useBooks

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await booksList.getBooks();
        setBooks(response.items);
      } catch (err) {
        setError(
          isAppError(err)
            ? err
            : { type: "NETWORK", message: "Unexpected error", cause: err },
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  return { books, loading, error };
}

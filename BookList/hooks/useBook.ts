import { useEffect, useState } from 'react';
import { Book } from '../domain/book';
import { AppError, isAppError } from '../domain/error';
import { booksList } from '../features/books/booksList';

export function useBook(id: string | undefined) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        setBook(await booksList.getBookById(id));
      } catch (err) {
        setError(
          isAppError(err)
            ? err
            : { type: 'NETWORK', message: 'Unexpected error', cause: err }
        );
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  return { book, loading, error };
}

import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Book } from "../domain/book";
import { AppError, isAppError } from "../domain/error";
import { booksList } from "../features/books/booksList";
//Ajoute la couverture des livres dans le hook useBooks

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const hasLoadedOnce = useRef(false);

  // Refetch a chaque prise de focus : la liste reste montee en arriere-plan
  // par le tab navigator, donc une suppression/creation ailleurs ne la met
  // pas a jour sans ce mecanisme.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const fetchBooks = async () => {
        if (!hasLoadedOnce.current) setLoading(true);
        try {
          const response = await booksList.getBooks();
          if (!active) return;
          setBooks(response.items);
          setError(null);
        } catch (err) {
          if (!active) return;
          setError(
            isAppError(err)
              ? err
              : { type: "NETWORK", message: "Unexpected error", cause: err },
          );
        } finally {
          if (active) {
            setLoading(false);
            hasLoadedOnce.current = true;
          }
        }
      };
      fetchBooks();
      return () => {
        active = false;
      };
    }, []),
  );

  return { books, loading, error };
}

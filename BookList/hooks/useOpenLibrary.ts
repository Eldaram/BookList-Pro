import { useEffect, useState } from "react";
import {
  OpenLibraryEnrichment,
  searchByTitle,
} from "../services/api/openLibraryApi";
import { useDebouncedValue } from "./useDebouncedValue";

export function useOpenLibrary(titre: string | undefined) {
  const [enrichment, setEnrichment] = useState<OpenLibraryEnrichment | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const debouncedTitre = useDebouncedValue(titre);

  useEffect(() => {
    let cancelled = false;

    if (!debouncedTitre) {
      Promise.resolve().then(() => {
        if (!cancelled) {
          setEnrichment(null);
          setLoading(false);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (!cancelled) setLoading(true);
    });

    searchByTitle(debouncedTitre)
      .then((result) => {
        if (!cancelled) setEnrichment(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedTitre]);

  return { enrichment, loading };
}

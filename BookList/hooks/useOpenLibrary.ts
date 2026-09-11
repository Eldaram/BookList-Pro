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
    if (!debouncedTitre) return;

    let cancelled = false;

    const fetchEnrichment = async () => {
      setLoading(true);
      try {
        const result = await searchByTitle(debouncedTitre);
        if (!cancelled) {
          setEnrichment(result);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchEnrichment();

    return () => {
      cancelled = true;
    };
  }, [debouncedTitre]);

  return {
    enrichment: debouncedTitre ? enrichment : null,
    loading: debouncedTitre ? loading : false,
  };
}

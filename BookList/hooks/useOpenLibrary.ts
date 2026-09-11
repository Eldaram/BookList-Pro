import { useEffect, useState } from "react";
import {
  OpenLibraryEnrichment,
  searchByTitle,
} from "../services/api/openLibraryApi";
import { useDebouncedValue } from "./useDebouncedValue";

export function useOpenLibrary(titre: string | undefined) {
  // Memorized result with its title: enrichment is derived on render,
  // so an empty or changing title never displays a stale result.
  const [lastResult, setLastResult] = useState<{
    titre: string;
    enrichment: OpenLibraryEnrichment | null;
  } | null>(null);
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
          setLastResult({ titre: debouncedTitre, enrichment: result });
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

  const enrichment =
    lastResult && lastResult.titre === debouncedTitre
      ? lastResult.enrichment
      : null;

  return { enrichment, loading };
}

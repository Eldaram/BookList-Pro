import { useEffect, useState } from "react";
import {
  OpenLibraryEnrichment,
  searchByTitle,
} from "../services/api/openLibraryApi";
import { useDebouncedValue } from "./useDebouncedValue";

// Enrichissement OpenLibrary d'une fiche : jamais d'etat erreur,
// l'indisponibilite se traduit par enrichment=null (degradation silencieuse).
export function useOpenLibrary(titre: string | undefined) {
  const [enrichment, setEnrichment] = useState<OpenLibraryEnrichment | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const debouncedTitre = useDebouncedValue(titre);

  useEffect(() => {
    if (!debouncedTitre) return;
    let cancelled = false;
    setLoading(true);
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

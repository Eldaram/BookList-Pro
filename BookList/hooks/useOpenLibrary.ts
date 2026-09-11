import { useEffect, useState } from "react";
import {
  OpenLibraryEnrichment,
  searchByTitle,
} from "../services/api/openLibraryApi";
import { useDebouncedValue } from "./useDebouncedValue";

// Enrichissement OpenLibrary d'une fiche : jamais d'etat erreur,
// l'indisponibilite se traduit par enrichment=null (degradation silencieuse).
export function useOpenLibrary(titre: string | undefined) {
  // Resultat memorise avec son titre : l'enrichissement est derive au rendu,
  // un titre vide ou change n'affiche donc jamais le resultat precedent.
  const [lastResult, setLastResult] = useState<{
    titre: string;
    enrichment: OpenLibraryEnrichment | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const debouncedTitre = useDebouncedValue(titre);

  useEffect(() => {
    if (!debouncedTitre) return;
    let cancelled = false;
    setLoading(true);
    searchByTitle(debouncedTitre)
      .then((result) => {
        if (!cancelled) {
          setLastResult({ titre: debouncedTitre, enrichment: result });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
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

// hooks/use-candidates.ts
import { useState, useEffect } from "react";
import type { Candidate } from "../services/candidates-service";
import { getCandidates } from "../services/candidates-service";

export function useCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    getCandidates()
      .then((data) => {
        setCandidates(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load candidates");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { candidates, loading, error };
}

import { useEffect, useState } from "react";
import { fetchTests, Test } from "../services/test-service";

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchTests()
      .then((data) => setTests(data))
      .catch(() => setError("Failed to fetch tests"))
      .finally(() => setLoading(false));
  }, []);

  return { tests, loading, error };
}

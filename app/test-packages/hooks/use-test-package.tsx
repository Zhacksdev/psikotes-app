"use client";

import { useEffect, useState } from "react";
import { fetchTests, Test } from "../services/test-package-service";

export function useTests() {
  const [tests, setTests] = useState<Test[]>([]); // ✅ default array kosong
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchTests();
        setTests(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { tests, loading, error };
}

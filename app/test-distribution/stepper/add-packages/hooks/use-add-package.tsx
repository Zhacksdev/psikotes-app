"use client";

import { useEffect, useState } from "react";
import { fetchPackages, TestPackage } from "../services/add-package-service";

export function useAddPackage() {
  const [packages, setPackages] = useState<TestPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchPackages();
      setPackages(data);
      setLoading(false);
    }
    load();
  }, []);

  return { packages, loading };
}

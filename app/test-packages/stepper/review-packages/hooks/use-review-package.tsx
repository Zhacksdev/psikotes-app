import { useState } from "react";
import { saveReviewPackageAPI } from "../service/review-package-service";

export function useReviewPackage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const saveReviewPackage = async () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("testPackage");
      if (!raw) throw new Error("No package data found in localStorage");

      const packageData = JSON.parse(raw);
      await saveReviewPackageAPI(packageData);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { saveReviewPackage, loading, error, success };
}

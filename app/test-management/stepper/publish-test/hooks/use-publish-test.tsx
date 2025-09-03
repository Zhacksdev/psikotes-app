// pages/stepper/publish-test/hooks/use-publish-test.ts
import { useState } from "react";
import { publishTestToAPI } from "../service/publish-test-service";

export function usePublishTest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

const publishTest = async () => {
  setLoading(true);
  try {
    await publishTestToAPI({ testName: "Sample Test", targetPosition: "Managerial" });
    setSuccess(true);
  } catch (err: unknown) {  // Menggunakan 'unknown' untuk menangani error secara lebih aman
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unknown error occurred");
    }
  } finally {
    setLoading(false);
  }
};

  return { publishTest, loading, error, success };
}

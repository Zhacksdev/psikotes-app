import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth-service";

export function useAuthFormState() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setLoading(true);
    try {
      await authService.login(email, password);
      router.push("/dashboard");
      // Delay 1 detik (1000ms) sebelum redirect
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleSubmit,
  };
}

import { useEffect, useState } from "react";

export function useRememberMe() {
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");

  // Saat mount: load rememberMe & rememberedEmail dari localStorage
  useEffect(() => {
    const savedRemember = localStorage.getItem("rememberMe") === "true";
    setRemember(savedRemember);
    if (savedRemember) {
      const savedEmail = localStorage.getItem("rememberedEmail") || "";
      setEmail(savedEmail);
    }
  }, []);

  // Setiap remember/email berubah, update localStorage
  useEffect(() => {
    if (remember) {
      localStorage.setItem("rememberMe", "true");
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("rememberedEmail");
    }
  }, [remember, email]);

  const toggleRemember = () => setRemember(v => !v);

  return { remember, toggleRemember, email, setEmail };
}

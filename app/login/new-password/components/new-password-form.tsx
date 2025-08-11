"use client";
import { useState } from "react";
import PasswordInput from "../../components/password-input";
import { Button } from "@/components/ui/button";

export default function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirm) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Password confirmation does not match.");
      return;
    }
    setError(null);
    // Placeholder: API request to reset password
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center space-y-4 py-10">
        <h2 className="font-bold text-lg">Password changed successfully!</h2>
        <p className="text-gray-500 text-sm">
          You can now log in using your new password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-3xl font-bold mb-2">Create New Password</h2>
      <p className="text-gray-500 text-sm">
        For your security, choose a strong password (min. 6 characters, a mix of
        letters, numbers, and symbols).
      </p>
      <PasswordInput
        value={password}
        onChange={setPassword}
        placeholder="New Password"
      />
      <PasswordInput
        value={confirm}
        onChange={setConfirm}
        placeholder="Confirm New Password"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <Button type="submit" className="w-full font-semibold">
        Reset Password
      </Button>
    </form>
  );
}

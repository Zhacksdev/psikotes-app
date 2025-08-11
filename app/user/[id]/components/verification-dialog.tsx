// src/app/users/[id]/components/VerificationDialog.tsx
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import candidateService from "../services/candidate-service";

export function VerificationDialog({
  onVerify,
}: {
  onVerify: (nik: string) => void;
}) {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const data = await candidateService.verifyCandidate(nik);
    setLoading(false);
    if (data) onVerify(nik);
    else alert("NIK tidak terdaftar.");
  };

  return (
    <Dialog open>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Verifikasi Kandidat</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Masukkan NIK"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          className="mb-4"
        />
        <Button onClick={handleVerify} disabled={loading || !nik}>
          {loading ? "Memverifikasi..." : "Verifikasi"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

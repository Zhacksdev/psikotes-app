"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import type { Candidate } from "../service/candidate-distribution-service";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: Candidate) => Promise<void>;
  saving?: boolean;
  error?: string | null;
};

export default function AddCandidateDialog({ open, onOpenChange, onSave, saving, error }: Props) {
  const [form, setForm] = useState<Candidate>({ nik: "", name: "", email: "", phone: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave(form);
    setForm({ nik: "", name: "", email: "", phone: "" });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md p-0 rounded-2xl max-h-[100vh] ">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold pt-4 sm:pt-6 px-4 sm:px-8">
            Add New Candidate
          </DialogTitle>
        </DialogHeader>

        <form className="p-4 sm:p-8 pt-2 space-y-4 sm:space-y-6 overflow-y-auto" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm py-2 px-3 bg-red-50 rounded-md border border-red-100">
              {error}
            </div>
          )}

          {/* NIK */}
          <div>
            <label className="block text-sm mb-1 font-semibold">
              NIK (National Identity Number)
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.nik}
                onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                placeholder="e.g. 3271061702980001"
                required
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Budi Santoso"
                required
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="e.g. budi@example.com"
                required
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +62 812 3456 7890"
                required
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)} 
              disabled={!!saving}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-500 text-white w-full sm:w-auto order-1 sm:order-2" 
              disabled={!!saving}
            >
              {saving ? "Saving..." : "Save Candidate"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
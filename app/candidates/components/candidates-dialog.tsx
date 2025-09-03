// components/CandidateEditDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, User, Mail, Phone } from "lucide-react";
import type { Candidate } from "../services/candidates-service";

interface FormData {
  nik: string;
  name: string;
  email: string;
  phone: string;
}

export interface CandidateEditDialogProps {
  candidate: Candidate & { phone: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: Candidate & { phone: string }) => void;
}

export function CandidateEditDialog({
  candidate,
  open,
  onOpenChange,
  onSave,
}: CandidateEditDialogProps) {
  const [form, setForm] = useState<FormData>({
    nik: "",
    name: "",
    email: "",
    phone: "",
  });

  // Reset form saat kandidat berubah
  useEffect(() => {
    setForm({ nik: "", name: "", email: "", phone: "" });
  }, [candidate]);

  const FIELDS: {
    label: string;
    name: keyof FormData;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    placeholder: string;
  }[] = [
    {
      label: "NIK (National Identity Number)",
      name: "nik",
      icon: FileText,
      placeholder: candidate.nik,
    },
    {
      label: "Full Name",
      name: "name",
      icon: User,
      placeholder: candidate.name,
    },
    {
      label: "Email",
      name: "email",
      icon: Mail,
      placeholder: candidate.email,
    },
    {
      label: "Phone Number",
      name: "phone",
      icon: Phone,
      placeholder: candidate.phone,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Candidate</DialogTitle>
          <DialogDescription>
            Ubah data kandidat, lalu klik Save.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {FIELDS.map(({ label, name, icon: Icon, placeholder }) => (
            <div key={name} className="space-y-1">
              <Label htmlFor={name} className="text-sm">
                {label}
              </Label>
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2">
                <Icon className="w-5 h-5 text-gray-400" />
                <Input
                  id={name}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [name]: e.target.value,
                    }))
                  }
                  className="ml-2 border-none focus:ring-0"
                />
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const updated: Candidate & { phone: string } = {
                ...candidate,
                nik: form.nik || candidate.nik,
                name: form.name || candidate.name,
                email: form.email || candidate.email,
                phone: form.phone || candidate.phone,
              };
              onSave(updated);
              onOpenChange(false);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

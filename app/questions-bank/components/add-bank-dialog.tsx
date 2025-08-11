"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Target,
  Brain,
  Book,
  Rocket,
  FileText,
  BadgeInfo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  createBank,
  type QuestionBank,
} from "../services/bank-question-service";

type AddBankDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (bank: QuestionBank) => void;
};

type IconKey = "Target" | "Brain" | "Book" | "Rocket";

const ICONS: Record<IconKey, LucideIcon> = {
  Target,
  Brain,
  Book,
  Rocket,
};

export default function AddBankDialog({
  open,
  onOpenChange,
  onCreated,
}: AddBankDialogProps) {
  const [iconKey, setIconKey] = useState<IconKey>("Target");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const CurrentIcon = useMemo<LucideIcon>(() => ICONS[iconKey] ?? FileText, [iconKey]);

  async function onSubmit() {
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      // default test type biar kompatibel dengan service
      const bank = createBank({
        name: name.trim(),
        icon: iconKey,
        testType: "DISC",
      });
      onCreated?.(bank);
      setName("");
      setIconKey("Target");
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 👇 dialog lebih sempit */}
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl">New Question Bank</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Icon preview + Add Icon (rata tengah) */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-full border-2 border-dashed border-blue-200 bg-blue-50/40 text-blue-600 grid place-items-center">
                <CurrentIcon className="h-6 w-6" />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" className="shadow-sm">Add Icon</Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="center">
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ICONS) as IconKey[]).map((k) => {
                      const Ico = ICONS[k];
                      const active = iconKey === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setIconKey(k)}
                          className={`flex items-center gap-2 border rounded-lg px-2 py-2 hover:bg-muted ${
                            active ? "border-blue-500 bg-blue-50" : ""
                          }`}
                        >
                          <Ico className="h-4 w-4" />
                          <span className="text-xs">{k}</span>
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Bank Name (rata tengah) */}
          <div className="space-y-2 text-center">
            <Label>Bank Name</Label>
            <div className="relative">
              <BadgeInfo className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Cepat Teliti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Footer tombol di tengah */}
        <DialogFooter className="mt-4 justify-center gap-2 sm:justify-center">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!name.trim() || submitting}>
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

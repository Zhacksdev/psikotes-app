// app/questions-bank/components/bank-question-content.tsx
"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BankSkeleton from "./card-skeleton";
import { useBankQuestion } from "../hooks/use-bank-question";

import {
  Target,
  Brain,
  MessageSquare,
  Rocket,
  Settings,
  FileText,
  NotepadText,
  Paperclip,
  Plus,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { QuestionBank } from "../services/bank-question-service";

/* =========================
   ICON MAP + TYPE GUARD
   ========================= */
const ICON_MAP = {
  Target,
  Brain,
  MessageSquare,
  Rocket,
  Settings,
} as const;

type IconKey = keyof typeof ICON_MAP;

function isIconKey(x: string): x is IconKey {
  return x in ICON_MAP;
}

type Props = {
  /** buka stepper Add Questions dengan data bank terpilih */
  onStartAddQuestions?: (bank: QuestionBank) => void;
};

export default function BankQuestionContent({ onStartAddQuestions }: Props) {
  const { banks, loading, removeBank } = useBankQuestion();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    // sort terbaru dulu
    const sorted = [...banks].sort((a, b) => b.createdAt - a.createdAt);

    if (!q) return sorted;
    return sorted.filter((b) => b.name.toLowerCase().includes(q));
  }, [banks, search]);

  const handleStart = (bank: QuestionBank) => {
    onStartAddQuestions?.(bank);
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Search bank..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search question bank"
        />
      </div>

      {/* Loading */}
      {loading && <BankSkeleton />}

      {/* Empty global */}
      {!loading && banks.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Belum ada question bank. Klik <span className="font-medium">+ Add New Test</span> untuk membuat.
        </div>
      )}

      {/* No result for query */}
      {!loading && banks.length > 0 && filtered.length === 0 && (
        <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
          Nggak ketemu hasil untuk “{search}”.
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {!loading &&
          filtered.map((b) => {
            const Icon: LucideIcon = isIconKey(b.icon) ? ICON_MAP[b.icon] : FileText;

            return (
              <div
                key={b.id}
                className="group flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-black/5 transition hover:shadow-sm"
              >
                {/* kiri */}
                <div className="flex min-w-0 items-start gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-xl border border-blue-200 bg-blue-50 text-blue-600">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{b.name}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className="flex items-center gap-1.5 border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 md:text-xs md:px-2.5">
                        <NotepadText className="h-3.5 w-3.5" aria-hidden />
                        <span className="tabular-nums">{b.questions?.length ?? 0}</span>
                        <span className="hidden md:inline">Questions</span>
                      </Badge>
                      <Badge className="flex items-center gap-1.5 border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 md:text-xs md:px-2.5">
                        <Paperclip className="h-3.5 w-3.5" aria-hidden />
                        <span className="tabular-nums">{b.importSessions ?? 0}</span>
                        <span className="hidden md:inline">Import Sessions</span>
                      </Badge>
                      <Badge variant="secondary" className="px-2 py-0.5 text-[11px] md:text-xs">
                        {b.testType}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* kanan */}
                <div className="flex items-center gap-2">
                  {/* mobile */}
                  <div className="flex gap-2 md:hidden">
                    <Button
                      size="icon"
                      aria-label={`Add questions for ${b.name}`}
                      title="Add"
                      onClick={() => handleStart(b)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      aria-label={`Delete ${b.name}`}
                      title="Delete"
                      onClick={() => removeBank(b.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* desktop */}
                  <div className="hidden items-center gap-2 md:flex">
                    <Button size="sm" onClick={() => handleStart(b)}>
                      Add
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => removeBank(b.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// app/questions-bank/stepper/add-question.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  NotepadText,
  FileSpreadsheet,
  Plus,
  Edit3,
  Trash2,
} from "lucide-react";

import type { QuestionBank } from "../services/bank-question-service";
import type {
  Question as StepQuestion,
  QuestionType,
  MediaType,
} from "./services/add-question-bank-service";

import AddQuestionDialog from "./dialogs/add-question-dialog";
import EditQuestionDialog from "./dialogs/edit-question-dialog";
import ImportCsvDialog from "./dialogs/import-csv-dialog";

type Props = {
  bank: QuestionBank;
  questions: StepQuestion[];
  onDelete: (id: string) => void;
  onCancel: () => void;
  onSave: () => void;
  onAddOne?: (q: StepQuestion) => void;
  onEditOne?: (id: string, data: Omit<StepQuestion, "id">) => void;
  onImport?: (qs: StepQuestion[]) => void;
};

export default function AddQuestionsStep({
  bank,
  questions,
  onDelete,
  onCancel,
  onSave,
  onAddOne,
  onEditOne,
  onImport,
}: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const editingQuestion = useMemo(
    () => questions.find((q) => q.id === editingId) ?? null,
    [editingId, questions]
  );

  const openAdd = () => setAddOpen(true);
  const openEdit = (id: string) => {
    setEditingId(id);
    setEditOpen(true);
  };
  const openImport = () => setImportOpen(true);

  const handleAddSave = async (data: Omit<StepQuestion, "id">) => {
    const q: StepQuestion = { id: crypto.randomUUID(), ...data };
    onAddOne?.(q);
    setAddOpen(false);
  };

  const handleEditSave = async (id: string, data: Omit<StepQuestion, "id">) => {
    onEditOne?.(id, data);
    setEditOpen(false);
    setEditingId(null);
  };

  const parseCsv = async (file: File): Promise<StepQuestion[]> => {
    const raw = await file.text();
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return [];

    const headerCols = lines[0].split(/[,;]\s*/);
    const headerLooksLike =
      headerCols.some((h) => /^text$/i.test(h)) ||
      /(^|,|\|)text($|,|\|)/i.test(lines[0]);

    const rows = headerLooksLike ? lines.slice(1) : lines;

    const out: StepQuestion[] = [];
    for (const row of rows) {
      const cols = row
        .split(/[,;](?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim());

      const [text, category, type, mediaUrl, mediaType] = cols;
      if (!text) continue;

      out.push({
        id: crypto.randomUUID(),
        type: (type as QuestionType) || (bank.testType as QuestionType),
        text,
        category: category || "-",
        mediaUrl: mediaUrl || undefined,
        mediaType: (mediaType as MediaType) || undefined,
      });
    }
    return out;
  };

  const handleUploadCSV = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "csv") {
        throw new Error("Hanya mendukung .csv untuk saat ini.");
      }
      const qs = await parseCsv(file);
      if (qs.length === 0)
        throw new Error("CSV kosong atau tidak valid. Minimal kolom `text` harus ada.");
      onImport?.(qs);
      setImportOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-xs text-muted-foreground">
        <span>Question Bank</span>
        <span className="mx-2">/</span>
        <span className="font-medium text-foreground">Add Questions</span>
      </div>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600">
            <Users className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{bank.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className="border border-blue-200 bg-blue-50 text-blue-600 text-xs font-medium">
                <NotepadText className="mr-1.5 h-3.5 w-3.5" />
                <span className="tabular-nums">{questions.length}</span>
                <span className="hidden md:inline">&nbsp;Questions</span>
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {bank.testType}
              </Badge>
            </div>
          </div>
        </div>

        {/* Import */}
        <div className="flex items-center gap-2">
          <Button
            className="hidden md:flex bg-blue-500 hover:bg-blue-600 text-white"
            size="sm"
            type="button"
            onClick={openImport}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Import Question
          </Button>
          <Button
            className="md:hidden bg-blue-500 hover:bg-blue-600 text-white"
            size="icon"
            type="button"
            title="Import"
            onClick={openImport}
          >
            <FileSpreadsheet className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add New Question */}
      <button
        type="button"
        onClick={openAdd}
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/30 py-6 text-sm text-muted-foreground transition hover:bg-muted/30"
      >
        <Plus className="h-4 w-4" />
        Add New Question
      </button>

      {/* List pertanyaan */}
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="flex items-center justify-between rounded-xl bg-white py-3 pl-4 pr-3 ring-1 ring-black/5"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="grid h-7 w-7 place-items-center rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-600">
                {i + 1}
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-[11px] font-medium text-muted-foreground">Question:</div>
                <div className="truncate font-medium">{q.text}</div>
                {q.category && q.category !== "-" && (
                  <div className="mt-1 text-[10px] text-muted-foreground">#{q.category}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-2 md:hidden">
                <Button size="icon" variant="secondary" title="Edit" type="button" onClick={() => openEdit(q.id)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" title="Delete" type="button" onClick={() => onDelete(q.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="hidden gap-2 md:flex">
                <Button size="sm" className="bg-neutral-900 text-white hover:bg-neutral-800" type="button" onClick={() => openEdit(q.id)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" type="button" onClick={() => onDelete(q.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {questions.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Belum ada pertanyaan.
          </div>
        )}
      </div>

      {/* Footer tombol kanan */}
      <div className="flex justify-end gap-2 mt-7">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Back
        </Button>
        <Button type="button" onClick={onSave} className="bg-blue-500 hover:bg-blue-600 text-white">
          Save
        </Button>
      </div>

      {/* Dialogs */}
      <AddQuestionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        activeType={bank.testType as QuestionType}
        onSave={handleAddSave}
      />
      <EditQuestionDialog
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v) setEditingId(null);
        }}
        question={editingQuestion}
        onSave={handleEditSave}
      />
      <ImportCsvDialog
        open={importOpen}
        onOpenChange={(v) => {
          setImportOpen(v);
          if (!v) {
            setUploadError(null);
            setUploading(false);
          }
        }}
        onUploadCSV={handleUploadCSV}
        uploading={uploading}
        error={uploadError}
      />
    </div>
  );
}

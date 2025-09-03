"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/icon-mapping";
import {
  Search,
  FileSpreadsheet,
  BookPlus,
  Edit,
  Clock,
  ListOrdered,
  BriefcaseBusiness,
  Trash,
} from "lucide-react";

/* ===========================
   DIALOGS
   =========================== */
import AddQuestionDialog from "./dialogs/add-question-dialog";
import ImportQuestionDialog, {
  DialogQuestion,
} from "./dialogs/import-question-dialog";
import EditQuestionDialog from "./dialogs/edit-question-dialog";

/* ===========================
   SERVICES & TYPES
   =========================== */
import {
  QuestionType,
  addQuestion,
  Question,
} from "./service/manage-question-service";

/* ===========================
   HOOKS
   =========================== */
import { useManageQuestions } from "./hooks/use-manage-question";

/* ============================================================================
   COMPONENT PROPS
   ============================================================================ */
type ManageQuestionsProps = {
  testName: string;
  testIcon: keyof typeof ICON_MAP;
  targetPosition: string;
  allowedTypes?: QuestionType[];
  onNext: () => void;
  onBack: () => void;
  testId: string;
};

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */
export default function ManageQuestions({
  testName,
  testIcon,
  targetPosition,
  allowedTypes = ["DISC", "CAAS", "Fast Accuracy"],
  onNext,
  onBack,
  testId,
}: ManageQuestionsProps) {
  const [activeType, setActiveType] = useState<QuestionType>(allowedTypes[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  /* ========================================================================
     DATA & ACTIONS
     ======================================================================== */
  const {
    questions,
    search,
    setSearch,
    loading,
    handleDelete,
    duration,
    setDuration,
    questionCount,
    setQuestionCount,
    handleUpdate,
    config,
    syncToTest,
  } = useManageQuestions(activeType, testId);

  /* ========================================================================
     SAFETY CHECK
     ======================================================================== */
  useEffect(() => {
    if (!allowedTypes.includes(activeType)) {
      setActiveType(allowedTypes[0]);
    }
  }, [allowedTypes, activeType]);

  /* ========================================================================
     TABS
     ======================================================================== */
  const TABS = useMemo(
    () =>
      allowedTypes.map((t) => ({
        key: t,
        label: t,
      })),
    [allowedTypes]
  );

  /* ========================================================================
     IMPORT DUMMY BANK
     ======================================================================== */
  const questionBank: DialogQuestion[] = useMemo(() => {
    const seed: DialogQuestion[] = [
      { id: "b1", text: "Saya suka mengambil kendali ketika bekerja dalam tim", tags: ["Team Work", "DISC"] },
      { id: "b2", text: "Saya menikmati bertemu orang baru dalam acara sosial", tags: ["Leadership", "DISC"] },
      { id: "b3", text: "Saya fokus saat bekerja di bawah tekanan waktu", tags: ["CAAS", "Speed"] },
      { id: "b4", text: "Angka 1289 + 376 adalah 1665", tags: ["Fast Accuracy", "True/False"] },
    ];
    return seed.filter((q) =>
      activeType === "DISC"
        ? q.tags.includes("DISC")
        : activeType === "CAAS"
        ? q.tags.includes("CAAS")
        : q.tags.includes("Fast Accuracy")
    );
  }, [activeType]);

  /* ========================================================================
     UTILS
     ======================================================================== */
  function buildPayloadFromImport(
    item: Omit<DialogQuestion, "id">,
    type: QuestionType
  ): Omit<Question, "id"> {
    const base = { type, text: item.text, category: item.tags?.[0] || "General" };
    if (type === "DISC") return { ...base, options: { D: "", I: "", S: "", C: "" } };
    if (type === "CAAS") return { ...base, options: { A: "", B: "", C: "", D: "" }, answer: "A" };
    return { ...base, options: { True: "", False: "" }, answer: "True" };
  }

  /* ========================================================================
     VALIDATION
     ======================================================================== */
  const totalDuration = Object.values(config).reduce(
    (sum, c) => sum + (parseInt(c.duration || "0", 10) || 0),
    0
  );
  const totalCount = Object.values(config).reduce(
    (sum, c) => sum + (parseInt(c.count || "0", 10) || 0),
    0
  );

  const nextDisabled = totalDuration <= 0 || totalCount <= 0;

  /* ========================================================================
     HANDLERS
     ======================================================================== */
  const handleAddQuestion = async (data: Omit<Question, "id">) => {
    await addQuestion(testId, data);
  };

  const handleImportQuestions = async (selected: Omit<DialogQuestion, "id">[]) => {
    for (const item of selected) {
      const payload = buildPayloadFromImport(item, activeType);
      await addQuestion(testId, payload);
    }
  };

  const handleCSVUpload = async (file: File) => {
    console.log("CSV uploaded:", file.name);
  };

  /* ========================================================================
     EDIT STATE
     ======================================================================== */
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  /* ========================================================================
     RENDER
     ======================================================================== */
  return (
    <div className="w-full sm:px-2 md:px-4 lg:px-8 py-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-blue-200 border-2 bg-white text-blue-500 text-2xl sm:text-3xl shadow shrink-0">
            {ICON_MAP[testIcon]}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-base sm:text-xl font-bold truncate">{testName}</h2>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs sm:text-sm flex-wrap">
              <span className="flex items-center gap-2 truncate">
                <BriefcaseBusiness className="w-4 h-4" />
                {targetPosition}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center justify-between">
          <h2 className="hidden sm:block text-base sm:text-lg font-semibold">Test Question</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={() => setShowImportModal(true)} variant="outline" className="border border-gray-200 flex-1 sm:flex-none">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="sm:hidden">Import</span>
              <span className="hidden sm:inline">Import Question</span>
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="flex-1 sm:flex-none">
              <BookPlus className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mb-5">
        <div className="rounded-xl bg-muted/60 p-1.5 sm:p-2">
          <div className={`grid grid-cols-${TABS.length} gap-1 sm:gap-2`}>
            {TABS.map((tab) => {
              const active = activeType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveType(tab.key)}
                  className={cn(
                    "group w-full rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center transition",
                    active ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="text-xs sm:text-sm font-semibold">{tab.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TEST CONFIG (per type) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Test Duration</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="E.g. 30"
              className="pl-9 text-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/\D/, ""))}
              inputMode="numeric"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Question Count</label>
          <div className="relative">
            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="15"
              className="pl-9 text-sm"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value.replace(/\D/, ""))}
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY TOTAL */}
      <div className="text-xs sm:text-sm text-gray-500 mb-4">
        Total Duration: <span className="font-semibold">{totalDuration} min</span> | Total Questions:{" "}
        <span className="font-semibold">{totalCount}</span>
      </div>

      {/* SEARCH */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Search questions..." className="pl-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* LIST HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm sm:text-base">Question List</h3>
        <Button size="icon" variant={editMode ? "secondary" : "ghost"} onClick={() => setEditMode((v) => !v)}>
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* QUESTION LIST */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : questions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Belum ada pertanyaan</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-xl border bg-white px-3 sm:px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground mb-1">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px]">
                  {idx + 1}
                </div>
                <span>Question:</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm sm:text-base font-medium">{q.text}</p>
                {editMode && (
                  <div className="shrink-0 flex gap-1">
                    <Button size="icon" variant="outline" className="w-8 h-8" onClick={() => { setEditing(q); setEditOpen(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="destructive" className="w-8 h-8" onClick={() => handleDelete(q.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 pt-8">
        <Button variant="outline" type="button" onClick={onBack}>Back</Button>
        <Button
          type="button"
          onClick={async () => { await syncToTest(); onNext(); }}
          disabled={nextDisabled}
        >
          Next
        </Button>
      </div>

      {/* DIALOGS */}
      <AddQuestionDialog open={showAddModal} onOpenChange={setShowAddModal} activeType={activeType} onSave={handleAddQuestion} />
      <ImportQuestionDialog
        open={showImportModal}
        onOpenChange={setShowImportModal}
        questionBank={questionBank}
        onImport={handleImportQuestions}
        onUploadCSV={handleCSVUpload}
      />
      <EditQuestionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        question={editing}
        onSave={async (id, data) => { await handleUpdate(id, data); setEditOpen(false); setEditing(null); }}
      />
    </div>
  );
}

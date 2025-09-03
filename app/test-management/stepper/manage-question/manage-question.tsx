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
}: ManageQuestionsProps) {
  /* ==========================================================================
     UI STATE MANAGEMENT
     ========================================================================== */
  const [activeType, setActiveType] = useState<QuestionType>(allowedTypes[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  /* ==========================================================================
     DATA & ACTIONS FROM CUSTOM HOOK
     ========================================================================== */
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
  } = useManageQuestions(activeType);

  /* ==========================================================================
     SAFETY CHECK: Ensure activeType is valid when allowedTypes changes
     ========================================================================== */
  useEffect(() => {
    if (!allowedTypes.includes(activeType)) {
      setActiveType(allowedTypes[0]);
    }
  }, [allowedTypes, activeType]);

  /* ==========================================================================
     TAB CONFIGURATION
     ========================================================================== */
  const TABS: Array<{ key: QuestionType; label: string }> = [
    { key: "DISC", label: "DISC" },
    { key: "CAAS", label: "CAAS" },
    { key: "Fast Accuracy", label: "Fast Accuracy" },
  ];

  /* ==========================================================================
     MOCK QUESTION BANK DATA (Replace with API call)
     ========================================================================== */
  const questionBank: DialogQuestion[] = useMemo(() => {
    const seed: DialogQuestion[] = [
      {
        id: "b1",
        text: "Saya suka mengambil kendali ketika bekerja dalam tim",
        tags: ["Team Work", "DISC"],
      },
      {
        id: "b2",
        text: "Saya menikmati bertemu orang baru dalam acara sosial",
        tags: ["Leadership", "DISC"],
      },
      {
        id: "b3",
        text: "Saya fokus saat bekerja di bawah tekanan waktu",
        tags: ["CAAS", "Speed"],
      },
      {
        id: "b4",
        text: "Angka 1289 + 376 adalah 1665",
        tags: ["Fast Accuracy", "True/False"],
      },
    ];
    return seed.filter((q) =>
      activeType === "DISC"
        ? q.tags.includes("DISC")
        : activeType === "CAAS"
        ? q.tags.includes("CAAS")
        : q.tags.includes("Fast Accuracy")
    );
  }, [activeType]);

  /* ==========================================================================
     UTILITY FUNCTIONS
     ========================================================================== */

  /**
   * Transform imported question data to match service requirements
   */
  function buildPayloadFromImport(
    item: Omit<DialogQuestion, "id">,
    type: QuestionType
  ): Omit<Question, "id"> {
    const base = {
      type,
      text: item.text,
      category: item.tags?.[0] || "General",
    };

    if (type === "DISC") {
      return { ...base, options: { D: "", I: "", S: "", C: "" } };
    }
    if (type === "CAAS") {
      return { ...base, options: { A: "", B: "", C: "", D: "" }, answer: "A" };
    }
    // Fast Accuracy
    return { ...base, options: { True: "", False: "" }, answer: "True" };
  }

  /* ==========================================================================
     VALIDATION FOR NEXT BUTTON
     ========================================================================== */
  const nextDisabled =
    !duration ||
    !questionCount ||
    Number(questionCount) <= 0 ||
    questions.length === 0;

  /* ==========================================================================
     EVENT HANDLERS
     ========================================================================== */

  const handleAddQuestion = async (data: Omit<Question, "id">) => {
    try {
      await addQuestion(data);
      // TODO: refresh list (re-fetch/pull dari service di hook)
    } catch (error) {
      console.error("Failed to add question:", error);
      // TODO: Show error toast
    }
  };

  const handleImportQuestions = async (
    selected: Omit<DialogQuestion, "id">[]
  ) => {
    try {
      for (const item of selected) {
        const payload = buildPayloadFromImport(item, activeType);
        await addQuestion(payload);
      }
      // TODO: refresh list (re-fetch/pull dari service di hook)
    } catch (error) {
      console.error("Failed to import questions:", error);
      // TODO: Show error toast
    }
  };

  const handleCSVUpload = async (file: File) => {
    try {
      // TODO: parse file & push hasilnya via addQuestion(...)
      console.log("CSV uploaded:", file.name);
    } catch (error) {
      console.error("Failed to upload CSV:", error);
      // TODO: Show error toast
    }
  };

  /* ==========================================================================
    EDIT QUESTION
     ========================================================================== */
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);

  /* ==========================================================================
     RENDER COMPONENT
     ========================================================================== */
  return (
    <div className="w-full px-3 sm:px-6 md:px-8 lg:px-16 py-6 sm:py-8">
      {/* =================================================================
          HEADER SECTION - Test Information
          ================================================================= */}
      <div className="flex flex-col gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-blue-200 border-2 bg-white text-blue-500 text-2xl sm:text-3xl shadow shrink-0">
            {ICON_MAP[testIcon]}
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-base sm:text-xl font-bold truncate">
              {testName}
            </h2>
            <div className="flex items-center gap-3 mt-1 text-gray-500 text-xs sm:text-sm flex-wrap">
              <span className="flex items-center gap-2 truncate">
                <BriefcaseBusiness className="w-4 h-4" />
                {targetPosition}
              </span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS - Add/Import Questions */}
        <div className="flex items-center justify-between">
          {/* Title - Hidden on mobile */}
          <h2 className="hidden sm:block text-base sm:text-lg font-semibold">
            Test Question
          </h2>

          {/* Buttons - Full width on mobile, auto width on desktop */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="border border-gray-200 flex-1 sm:flex-none"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              <span className="sm:hidden">Import</span>
              <span className="hidden sm:inline">Import Question</span>
            </Button>

            <Button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-none"
            >
              <BookPlus className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Question</span>
            </Button>
          </div>
        </div>
      </div>

      {/* =================================================================
          QUESTION TYPE TABS
          ================================================================= */}
      <div className="mb-5">
        <div className="rounded-xl bg-muted/60 p-1.5 sm:p-2">
          <div className="grid grid-cols-3 gap-1 sm:gap-2">
            {TABS.map((tab) => {
              const active = activeType === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveType(tab.key)}
                  className={cn(
                    "group w-full rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center transition",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    active
                      ? "bg-white shadow text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-pressed={active}
                >
                  <div className="text-xs sm:text-sm font-semibold">
                    {tab.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* =================================================================
          TEST CONFIGURATION - Duration & Count
          ================================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
        {/* Test Duration */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">
            Test Duration
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="E.g. 30 for 30 minutes"
              className="pl-9 text-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/\D/, ""))}
              inputMode="numeric"
            />
          </div>
        </div>

        {/* Question Count */}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">
            Question Count
          </label>
          <div className="relative">
            <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="15"
              className="pl-9 text-sm"
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(e.target.value.replace(/\D/, ""))
              }
              inputMode="numeric"
            />
          </div>
        </div>
      </div>

      {/* =================================================================
          SEARCH BAR
          ================================================================= */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search questions..."
            className="pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* =================================================================
          QUESTION LIST HEADER WITH EDIT TOGGLE
          ================================================================= */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm sm:text-base">Question List</h3>
        <Button
          size="icon"
          variant={editMode ? "secondary" : "ghost"}
          onClick={() => setEditMode((v) => !v)}
          aria-label="Toggle Edit Mode"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>

      {/* =================================================================
          QUESTIONS LIST
          ================================================================= */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading...</p>
      ) : questions.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Belum ada pertanyaan
        </p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-xl border bg-white px-3 sm:px-4 py-3"
            >
              {/* Question Number Label */}
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-muted-foreground mb-1">
                <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px]">
                  {idx + 1}
                </div>
                <span>Question:</span>
              </div>

              {/* Question Text & Edit Actions */}
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm sm:text-base font-medium leading-relaxed">
                  {q.text}
                </p>

                {editMode && (
                  <div className="shrink-0 flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="w-8 h-8"
                      title="Edit"
                      onClick={() => {
                        setEditing(q);
                        setEditOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="w-8 h-8"
                      title="Delete"
                      onClick={() => handleDelete(q.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================
          NAVIGATION FOOTER
          ================================================================= */}
      {/* ===== NAV ===== */}
      <div className="flex justify-end gap-3 pt-8">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          className="min-w-[90px] px-6 py-2"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`min-w-[90px] px-6 py-2 ${
            nextDisabled
              ? "bg-blue-100 text-blue-400"
              : "bg-blue-500 text-white"
          }`}
        >
          Next
        </Button>
      </div>

      {/* =================================================================
          MODAL DIALOGS
          ================================================================= */}
      <AddQuestionDialog
        open={showAddModal}
        onOpenChange={setShowAddModal}
        activeType={activeType}
        onSave={handleAddQuestion}
      />

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
        onSave={async (id, data) => {
          await handleUpdate(id, data); // pakai dari useManageQuestions
          setEditOpen(false);
          setEditing(null);
        }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

import TitleBar from "./components/title-bar";
import BankQuestionContent from "./components/bank-question-content";
import AddBankDialog from "./components/add-bank-dialog";

import AddQuestionsStep from "./stepper/add-question";
import type { QuestionBank } from "./services/bank-question-service";
import type { Question, QuestionType } from "./stepper/services/add-question-bank-service";

// dummy function
const getDummyQuestions = (type: QuestionType): Question[] => [
  {
    id: crypto.randomUUID(),
    type,
    text: "Saya suka bekerja sama dalam tim untuk mencapai tujuan bersama",
    category: "teamwork",
  },
  {
    id: crypto.randomUUID(),
    type,
    text: "Saya merasa nyaman berbicara di depan umum",
    category: "leadership",
  },
];

export default function QuestionBankPage() {
  const [openAddBank, setOpenAddBank] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [stepOpen, setStepOpen] = useState(false);
  const [activeBank, setActiveBank] = useState<QuestionBank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const startAddQuestions = (bank: QuestionBank) => {
    setActiveBank(bank);
    setQuestions(getDummyQuestions(bank.testType)); // ✅ seed 2 dummy
    setStepOpen(true);
  };

  const handleCancel = () => {
    setStepOpen(false);
    setActiveBank(null);
    setQuestions([]);
  };

  const handleSave = () => {
    // TODO: simpan ke API / storage
    setStepOpen(false);
    setActiveBank(null);
    setQuestions([]);
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-white">
        <TopBar />

        <main className="flex-1 px-8 pt-2 pb-8">
          {!stepOpen && (
            <>
              <TitleBar onAdd={() => setOpenAddBank(true)} />
              <BankQuestionContent
                key={reloadKey}
                onStartAddQuestions={startAddQuestions}
              />
            </>
          )}

          {stepOpen && activeBank && (
            <AddQuestionsStep
              bank={activeBank}
              questions={questions}
              onDelete={(id) =>
                setQuestions((prev) => prev.filter((q) => q.id !== id))
              }
              onAddOne={(q) => setQuestions((prev) => [...prev, q])}
              onEditOne={(id, data) =>
                setQuestions((prev) =>
                  prev.map((q) => (q.id === id ? { ...q, ...data } : q))
                )
              }
              onImport={(qs) => setQuestions((prev) => [...prev, ...qs])}
              onCancel={handleCancel}
              onSave={handleSave}
            />
          )}
        </main>
      </div>

      <AddBankDialog
        open={openAddBank}
        onOpenChange={setOpenAddBank}
        onCreated={() => setReloadKey((k) => k + 1)}
      />
    </div>
  );
}

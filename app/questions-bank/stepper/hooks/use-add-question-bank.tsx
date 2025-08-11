"use client";

import { useState } from "react";
import {
  getBankById,
  upsertQuestions,
  seedSampleQuestionsIfEmpty,
  parseCsvToQuestions,
  type QuestionBank,
  type Question,
  type QuestionType,
} from "../services/add-question-bank-service";

export function useAddQuestions() {
  const [open, setOpen] = useState(false);
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [items, setItems] = useState<Question[]>([]);

  function openFor(bankId: string) {
    seedSampleQuestionsIfEmpty(bankId);
    const b = getBankById(bankId);
    if (!b) return;
    setBank(b);
    setItems(b.questions ?? []);
    setOpen(true);
  }

  function close() { setOpen(false); setBank(null); setItems([]); }

  function addOne(payload: Omit<Question, "id">) {
    setItems(prev => [...prev, { ...payload, id: crypto.randomUUID() }]);
  }
  function editOne(id: string, payload: Omit<Question, "id">) {
    setItems(prev => prev.map(q => (q.id === id ? { ...payload, id } : q)));
  }
  function remove(id: string) {
    setItems(prev => prev.filter(q => q.id !== id));
  }

  async function importCsv(file: File, type: QuestionType) {
    const qs = await parseCsvToQuestions(file, type);
    setItems(prev => [...prev, ...qs]);
  }

  function save() { if (bank) upsertQuestions(bank.id, items); }

  return { open, bank, items, setItems, openFor, close, addOne, editOne, remove, importCsv, save };
}

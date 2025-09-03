// app/test-packages/stepper/service/manage-question-service.ts
import { Test } from "../../../services/test-package-service";

export type QuestionType = "DISC" | "CAAS" | "Fast Accuracy";

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  category: string;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video";
  options?: Record<string, string>;
  answer?: string;
};

const STORAGE_KEY = "tests"; // simpan terpisah dari tests



// ===================================
// API CRUD QUESTION
// ===================================

// GET list pertanyaan berdasarkan type & testId
export async function getQuestions(type: QuestionType, testId?: string): Promise<Question[]> {
  const all: Record<string, Question[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const forTest = all[testId || "global"] || [];
  return forTest.filter((q) => q.type === type);
}

// ADD
export async function addQuestion(testId: string, data: Omit<Question, "id">): Promise<void> {
  const all: Record<string, Question[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const newQ: Question = { ...data, id: Date.now().toString() };

  const list = all[testId] || [];
  all[testId] = [...list, newQ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// UPDATE
export async function updateQuestion(testId: string, id: string, data: Partial<Question>): Promise<void> {
  const all: Record<string, Question[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const list = all[testId] || [];

  all[testId] = list.map((q) => (q.id === id ? { ...q, ...data } : q));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// DELETE
export async function deleteQuestion(testId: string, id: string): Promise<void> {
  const all: Record<string, Question[]> = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const list = all[testId] || [];

  all[testId] = list.filter((q) => q.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ===================================
// UPDATE TEST PACKAGE (durasi & jumlah soal)
// ===================================
export async function updateTest(
  testId: string,
  data: { questions: number; duration: string }
): Promise<void> {
  const saved: Test[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  const idx = saved.findIndex((t) => t.id.toString() === testId);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
}
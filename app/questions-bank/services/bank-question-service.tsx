export type TestType = "DISC" | "CAAS" | "Fast Accuracy";

export type Question = {
  id: string;
  text: string;
  tags?: string[];
  type?: "single" | "multiple" | "scale";
};

export type QuestionBank = {
  id: string;
  name: string;
  icon: string;
  testType: TestType;
  questions: Question[];          // selalu kosong saat seeding
  importSessions: number;
  createdAt: number;
};

const STORAGE_KEY = "bank_questions_v1";

function read(): QuestionBank[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}
function write(data: QuestionBank[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Seed BANK ONLY (tanpa questions) */
export function seedBanksIfEmpty() {
  if (read().length) return;
  const now = Date.now();
  write([
    {
      id: crypto.randomUUID(),
      name: "DISC",
      icon: "Target",
      testType: "DISC",
      questions: [],
      importSessions: 2,
      createdAt: now - 1000,
    },
    {
      id: crypto.randomUUID(),
      name: "CAAS",
      icon: "Brain",
      testType: "CAAS",
      questions: [],
      importSessions: 3,
      createdAt: now - 500,
    },
    {
      id: crypto.randomUUID(),
      name: "Fast Accuracy",
      icon: "Rocket",
      testType: "Fast Accuracy",
      questions: [],
      importSessions: 2,
      createdAt: now - 200,
    },
  ]);
}

export function getBanks() { return read(); }
export function getBankById(id: string) { return read().find(b => b.id === id); }

export function createBank(input: { name: string; icon: string; testType: TestType }) {
  const banks = read();
  const bank: QuestionBank = {
    id: crypto.randomUUID(),
    name: input.name,
    icon: input.icon,
    testType: input.testType,
    questions: [],
    importSessions: 0,
    createdAt: Date.now(),
  };
  banks.unshift(bank);
  write(banks);
  return bank;
}

export function addQuestion(bankId: string, question: Question) {
  const banks = read();
  const idx = banks.findIndex((b) => b.id === bankId);
  if (idx === -1) return;
  banks[idx].questions.push(question);
  write(banks);
}

export function deleteBank(id: string) {
  write(read().filter((b) => b.id !== id));
}

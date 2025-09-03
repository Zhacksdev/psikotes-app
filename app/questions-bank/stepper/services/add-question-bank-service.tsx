export type QuestionType = "DISC" | "CAAS" | "Fast Accuracy";

export type MediaType = "image" | "audio" | "video";

export type Question = {
  id: string;
  type: QuestionType;
  text: string;
  category?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  options?: Record<string, string>;
  answer?: string;
  tags?: string[];
};

export type QuestionBank = {
  id: string;
  name: string;
  icon: string;
  testType: QuestionType;
  questions: Question[];
  importSessions: number;
  createdAt: number;
};

const KEY = "bank_questions_v1";

/* ====== READ & WRITE LOCAL STORAGE ====== */
function read(): QuestionBank[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
function write(data: QuestionBank[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(data));
  }
}

/* ====== GET BANK BY ID ====== */
export function getBankById(id: string) {
  return read().find((b) => b.id === id);
}

/* ====== UPDATE / UPSERT QUESTIONS ====== */
export function upsertQuestions(bankId: string, qs: Question[]) {
  const all = read();
  const i = all.findIndex((b) => b.id === bankId);
  if (i === -1) return;
  all[i].questions = qs;
  write(all);
}

/* ====== SEED DUMMY BANK + QUESTIONS ====== */
export function seedSampleBankIfEmpty() {
  const all = read();
  if (all.length > 0) return; // kalau udah ada, skip

  const newBank: QuestionBank = {
    id: crypto.randomUUID(),
    name: "Sample Bank DISC",
    icon: "BookOpen",
    testType: "DISC",
    questions: [
      {
        id: crypto.randomUUID(),
        type: "DISC",
        text: "Saya suka mengambil kendali ketika bekerja dalam tim",
        category: "Teamwork",
        mediaType: "image",
        mediaUrl: "https://via.placeholder.com/150",
        options: { A: "Setuju", B: "Tidak Setuju" },
        answer: "A",
        tags: ["leadership", "inisiatif"]
      },
      {
        id: crypto.randomUUID(),
        type: "DISC",
        text: "Saya selalu memeriksa ulang pekerjaan saya untuk memastikan keakuratannya",
        category: "Detail Oriented",
        mediaType: "image",
        mediaUrl: "https://via.placeholder.com/150",
        options: { A: "Setuju", B: "Tidak Setuju" },
        answer: "A",
        tags: ["teliti", "akurasi"]
      }
    ],
    importSessions: 0,
    createdAt: Date.now()
  };

  write([newBank]);
}

/* ====== SEED QUESTIONS UNTUK BANK TERTENTU ====== */
export function seedSampleQuestionsIfEmpty(bankId: string) {
  const all = read();
  const i = all.findIndex((b) => b.id === bankId);
  if (i === -1 || all[i].questions.length > 0) return;
  const t = all[i].testType;
  all[i].questions = [
    { id: crypto.randomUUID(), type: t, text: "Saya suka mengambil kendali ketika bekerja dalam tim" },
    { id: crypto.randomUUID(), type: t, text: "Saya menikmati bertemu orang baru dalam acara sosial" },
  ];
  write(all);
}

/* ====== PARSE CSV KE QUESTIONS ====== */
export async function parseCsvToQuestions(file: File, type: QuestionType) {
  const txt = await file.text();
  const lines = txt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0].split(",").map((x) => x.trim().toLowerCase());
  const hasText = header.includes("text");
  const rows = hasText ? lines.slice(1) : lines;

  return rows
    .map((row) => {
      const cols = row.split(",");
      const text = hasText
        ? (cols[header.indexOf("text")] || "").trim()
        : (cols[0] || "").trim();
      return text ? { id: crypto.randomUUID(), type, text, category: "-" } : null;
    })
    .filter(Boolean) as Question[];
}

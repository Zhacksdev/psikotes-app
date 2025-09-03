// services/test-package-service.ts
export interface Test {
  id: string;             // pakai string biar konsisten
  name: string;
  category: string;
  types: string[];
  questions: number;
  duration: string;
}

const STORAGE_KEY = "tests";

/* ============================
   Helper function
============================ */
function loadTests(): Test[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function persistTests(tests: Test[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests));
}

/* ============================
   CRUD Functions
============================ */
export function updateTest(id: string, data: Partial<Test>): Test | null {
  const saved = loadTests();
  const idx = saved.findIndex((t) => t.id === id);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...data };
    persistTests(saved);
    return saved[idx];
  }
  return null;
}

// Ambil semua tests dari localStorage
export async function fetchTests(): Promise<Test[]> {
  const saved = loadTests();
  if (saved.length > 0) return saved;

  // Dummy initial (kalau kosong)
  const dummy: Test[] = [
    {
      id: Date.now().toString(),
      name: "Leadership Assessment",
      category: "Managerial",
      types: ["DISC", "CAAS"],
      questions: 15,
      duration: "20 min",
    },
    {
      id: (Date.now() + 1).toString(),
      name: "Focus & Accuracy Test",
      category: "All Candidates",
      types: ["DISC", "CAAS", "Fast Accuracy"],
      questions: 50,
      duration: "60 min",
    },
  ];

  persistTests(dummy);
  return dummy;
}

// Simpan / replace semua tests
export function saveTests(tests: Test[]) {
  persistTests(tests);
}

// Tambah 1 test
export async function addTest(test: Test): Promise<Test> {
  const saved = loadTests();
  saved.push(test);
  persistTests(saved);
  return test;
}

// services/test-distribution-service.ts

export interface Distribution {
  id: string;
  testName: string;
  category: string; // contoh: "Managerial", "Fresh Graduates", "All Candidates"
  startDate: string | null;
  endDate: string | null;
  candidatesTotal: number;  // total kandidat
  status: "Draft" | "Scheduled" | "Ongoing" | "Completed" | "Expired";
}

const STORAGE_KEY = "test_distributions";

/* ============================
   UTIL PERSISTENCE
   ============================ */
function loadDistributions(): Distribution[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function persistDistributions(items: Distribution[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/* ============================
   FETCH
   ============================ */
export async function fetchDistributions(): Promise<Distribution[]> {
  const saved = loadDistributions();
  if (saved.length > 0) return saved;

  // Dummy awal
  const dummy: Distribution[] = [
    {
      id: Date.now().toString(),
      testName: "Leadership Assessment",
      category: "Managerial",
      startDate: "2025-06-30",
      endDate: "2025-07-05",
      candidatesTotal: 78,
      status: "Completed",
    },
    {
      id: (Date.now() + 1).toString(),
      testName: "Focus & Accuracy Test",
      category: "All Candidates",
      startDate: "2025-06-25",
      endDate: "2025-06-30",
      candidatesTotal: 120,
      status: "Ongoing",
    },
    {
      id: (Date.now() + 2).toString(),
      testName: "Entry-Level Psychotest",
      category: "Fresh Graduates",
      startDate: null,
      endDate: null,
      candidatesTotal: 32,
      status: "Draft",
    },
    {
      id: (Date.now() + 3).toString(),
      testName: "Emotional Intelligence",
      category: "HR Staff",
      startDate: "2025-06-11",
      endDate: "2025-06-20",
      candidatesTotal: 82,
      status: "Expired",
    },
  ];

  persistDistributions(dummy);
  return dummy;
}

/* ============================
   CREATE
   ============================ */
export async function addDistribution(item: Distribution): Promise<Distribution> {
  const saved = loadDistributions();
  saved.push(item);
  persistDistributions(saved);
  return item;
}

/* ============================
   UPDATE
   ============================ */
export async function updateDistribution(
  id: string,
  data: Partial<Distribution>
): Promise<Distribution | null> {
  const saved = loadDistributions();
  const idx = saved.findIndex((t) => t.id === id);
  if (idx >= 0) {
    saved[idx] = { ...saved[idx], ...data };
    persistDistributions(saved);
    return saved[idx];
  }
  return null;
}

/* ============================
   DELETE
   ============================ */
export async function deleteDistribution(id: string): Promise<void> {
  const saved = loadDistributions();
  const filtered = saved.filter((t) => t.id !== id);
  persistDistributions(filtered);
}

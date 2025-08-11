// services/resultsService.ts
export interface Result {
  candidateId: string;
  avatarUrl: string;
  name: string;
  email: string;
  position: string;
  types: string[];
  period: string;
  status: "Completed" | "Ongoing";
}

export interface ResultDetail {
  candidateId: string;
  candidateName: string;
  scores: Array<{ testName: string; date: string; score: number }>;
}

// Data dummy untuk daftar
const DUMMY_RESULTS: Result[] = [
  {
    candidateId: "1",
    avatarUrl: "/avatars/rivaldi.jpg",
    name: "Muhammad Rivaldi Fatah",
    email: "rivaldir7@gmail.com",
    position: "UI/UX Designer",
    types: ["DISC", "CAAS"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "2",
    avatarUrl: "/avatars/dicky.jpg",
    name: "Dicky Zanuar Saputra",
    email: "dzsaputra@gmail.com",
    position: "Quality Assurance",
    types: ["DISC", "CAAS", "Fast Accuracy"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "3",
    avatarUrl: "/avatars/bryan.jpg",
    name: "Bryan Pratama",
    email: "bryanpra08@gmail.com",
    position: "Engineer",
    types: ["CAAS"],
    period: "25 Jun 2025",
    status: "Completed",
  },
  {
    candidateId: "4",
    avatarUrl: "/avatars/fahmi.jpg",
    name: "Fahmi Tio Maulana",
    email: "maulanaft@gmail.com",
    position: "Frontend Dev",
    types: ["Fast Accuracy"],
    period: "25 Jun 2025",
    status: "Completed",
  },
];

// Data dummy untuk detail per kandidat
const DUMMY_DETAILS: Record<string, ResultDetail> = {
  "1": {
    candidateId: "1",
    candidateName: "Muhammad Rivaldi Fatah",
    scores: [
      { testName: "Leadership Assessment", date: "30 Jun 2025", score: 85 },
      { testName: "Focus & Accuracy Test", date: "25 Jun 2025", score: 92 },
    ],
  },
  "2": {
    candidateId: "2",
    candidateName: "Dicky Zanuar Saputra",
    scores: [
      { testName: "Quality Analysis", date: "25 Jun 2025", score: 88 },
    ],
  },
  "3": {
    candidateId: "3",
    candidateName: "Bryan Pratama",
    scores: [
      { testName: "Entry-Level Psychotest", date: "21 Jun 2025", score: 79 },
    ],
  },
  "4": {
    candidateId: "4",
    candidateName: "Fahmi Tio Maulana",
    scores: [
      { testName: "Emotional Intelligence", date: "11 Jun 2025", score: 73 },
    ],
  },
};

// Simulasi panggilan API
export async function getResults(): Promise<Result[]> {
  // simulasi network delay
  await new Promise((r) => setTimeout(r, 300));
  return DUMMY_RESULTS;
}

export async function getResultDetail(candidateId: string): Promise<ResultDetail> {
  await new Promise((r) => setTimeout(r, 300));
  // fallback jika tidak ditemukan
  return (
    DUMMY_DETAILS[candidateId] || {
      candidateId,
      candidateName: "Unknown",
      scores: [],
    }
  );
}

// Dummy export functions
export function exportAllResults(): void {
  console.log("Export all results (dummy)");
}

export function exportResultPdf(candidateId: string): void {
  console.log(`Export PDF for candidate ${candidateId} (dummy)`);
}

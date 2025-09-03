// src/app/users/[id]/services/candidateService.ts

// ----- Types -----
export interface TestInfo {
  id: string;
  name: string;
  questionCount: number;
  duration: number;
}

export interface Candidate {
  nik: string;
  name: string;
  email: string;
  position: string;
  phone: string;
  status: string;
  tests: TestInfo[];
}

// ----- Dummy Data -----
const dummyCandidates: Candidate[] = [
  {
    nik: "1234567890",
    name: "Test User",
    email: "test@example.com",
    position: "UI/UX Design",
    phone: "0812345678",
    status: "Active",
    tests: [
      { id: "disc", name: "DISC Assessment", questionCount: 20, duration: 10 },
      { id: "caas", name: "CAAS Evaluation", questionCount: 15, duration: 8 },
      { id: "fast", name: "Fast Accuracy", questionCount: 10, duration: 5 },
    ],
  },
];

// ----- Service Object -----
const candidateService = {
  /**
   * Verifies a candidate by NIK.
   * @param nik Candidate NIK
   * @returns Candidate data (including tests) or null if not found
   */
  verifyCandidate: async (nik: string): Promise<Candidate | null> => {
    const candidate = dummyCandidates.find((c) => c.nik === nik) || null;
    return candidate;
  },

  /**
   * Fetches test info array for a given candidate NIK.
   * @param nik Candidate NIK
   * @returns Array of TestInfo (empty if none)
   */
  getTests: async (nik: string): Promise<TestInfo[]> => {
    const candidate = dummyCandidates.find((c) => c.nik === nik);
    return candidate ? candidate.tests : [];
  },
};

// ----- Default Export -----
export default candidateService;

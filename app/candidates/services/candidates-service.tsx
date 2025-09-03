// services/candidates-service.ts
export type Candidate = {
  id: string;
  name: string;
  email: string;
  nik: string;
  position: string;
  periodStart: string; // e.g. "2025-06-25"
  periodEnd: string;   // e.g. "2025-06-30"
  status: "Active" | "Pending" | "Completed" | "Expired";
};

// Dummy data:
const DUMMY_CANDIDATES: Candidate[] = [
  {
    id: "1",
    name: "Muhammad Rivaldi Fatah",
    email: "rivaldir7@gmail.com",
    nik: "38421938093572290",
    position: "UI/UX Designer",
    periodStart: "2025-06-25",
    periodEnd: "2025-06-30",
    status: "Active",
  },
  {
    id: "2",
    name: "Dicky Zanuar Saputra",
    email: "dzsaputra@gmail.com",
    nik: "38421938093572290",
    position: "Quality Assurance",
    periodStart: "2025-06-25",
    periodEnd: "2025-06-30",
    status: "Active",
  },
  {
    id: "3",
    name: "Bryan Pratama",
    email: "bryanpra08@gmail.com",
    nik: "38421938093572290",
    position: "Engineer",
    periodStart: "2025-06-25",
    periodEnd: "2025-06-30",
    status: "Active",
  },
  {
    id: "4",
    name: "Fahmi Tio Maulana",
    email: "maulanaft@gmail.com",
    nik: "38421938093572290",
    position: "Frontend Dev",
    periodStart: "2025-06-25",
    periodEnd: "2025-06-30",
    status: "Active",
  },
];

// Sementara kembalikan dummy, nanti diganti fetch ke API nyata
export async function getCandidates(): Promise<Candidate[]> {
  // simulasi delay
  await new Promise((r) => setTimeout(r, 300));
  return DUMMY_CANDIDATES;
}

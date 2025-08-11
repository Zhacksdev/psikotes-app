// import axios from "axios";

// Type untuk Test (pindahkan di paling atas file ini)
export interface Test {
  id: number;
  name: string;
  category: string;
  startedDate: string;
  types: string[];
  questions: number;
  duration: string;
  status: string;
}

// const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function fetchTests(): Promise<Test[]> {
  return [
    {
      id: 1,
      name: "Leadership Assessment",
      category: "Managerial",
      startedDate: "30 Jun 2025",
      types: ["DISC", "CAAS"],
      questions: 15,
      duration: "20 min",
      status: "Completed",
    },
    {
      id: 2,
      name: "Focus & Accuracy Test",
      category: "All Candidates",
      startedDate: "25 Jun 2025",
      types: ["DISC", "CAAS", "Fast Accuracy"],
      questions: 50,
      duration: "60 min",
      status: "Ongoing",
    },
    {
      id: 3,
      name: "Entry-Level Psychotest",
      category: "Fresh Graduates",
      startedDate: "21 Jun 2025",
      types: ["CAAS"],
      questions: 30,
      duration: "15 min",
      status: "Draft",
    },
    {
      id: 4,
      name: "Emotional Intelligence",
      category: "HR Staff",
      startedDate: "11 Jun 2025",
      types: ["Fast Accuracy"],
      questions: 50,
      duration: "60 min",
      status: "Expired",
    },
  ];
}
import { Test } from "../../../services/test-package-service";

export interface ReviewPackage {
  id: string; // ✅ konsisten pakai string
  name: string;
  category: string;
  questions: number;
  duration: string;
  tests?: {
    key: string;
    title: string;
    questions: number;
    duration: number;
  }[];
}

const STORAGE_KEY = "tests";

export async function saveReviewPackageAPI(packageData: ReviewPackage) {
  if (typeof window === "undefined") return packageData;

  const saved: Test[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // ✅ mapping ReviewPackage → Test
  const mapped: Test = {
    id: packageData.id,
    name: packageData.name,
    category: packageData.category,
    types: packageData.tests?.map((t) => t.key) || [],
    questions: packageData.questions,
    duration: packageData.duration,
  };

  const idx = saved.findIndex((t) => t.id === packageData.id);
  if (idx !== -1) {
    saved[idx] = mapped;
  } else {
    saved.push(mapped);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

  return mapped;
}

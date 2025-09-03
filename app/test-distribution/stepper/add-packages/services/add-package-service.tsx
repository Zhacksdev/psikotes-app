export interface TestPackage {
  id: string;
  name: string;
  duration: string;
  questions: number;
  target: string;
}

const STORAGE_KEY = "test_packages";

const dummyPackages: TestPackage[] = [
  { id: "pkg1", name: "DISC Personality Test", duration: "60 menit", questions: 50, target: "Staff" },
  { id: "pkg2", name: "CAAS Cognitive Ability Test", duration: "45 menit", questions: 40, target: "Officer" },
  { id: "pkg3", name: "Fast Accuracy Test", duration: "30 menit", questions: 25, target: "Intern" },
];

function loadPackages(): TestPackage[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function persistPackages(items: TestPackage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function fetchPackages(): Promise<TestPackage[]> {
  const saved = loadPackages();
  if (saved.length > 0) return saved;
  persistPackages(dummyPackages);
  return dummyPackages;
}

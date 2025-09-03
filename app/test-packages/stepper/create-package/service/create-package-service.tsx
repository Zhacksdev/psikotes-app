// services/create-package-service.ts
import { Test, addTest } from "../../../services/test-package-service";

export interface CreateTestPayload {
  icon: string;
  testName: string;
  targetPosition: string;
  accessType: string;
  sequence: string[];
  template: string | null;
}

export async function createNewTest(payload: CreateTestPayload) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const newTest: Test = {
    id: Date.now().toString(),       // konsisten string ID
    name: payload.testName,          // mapping ke Test.name
    category: payload.targetPosition, // mapping ke Test.category
    types: payload.sequence || [],    // mapping ke Test.types
    questions: 0,                     // default awal
    duration: "0 min",                // default awal
    // NOTE: kalau mau, bisa extend Test model utk simpan `icon` & `accessType`
  };

  await addTest(newTest); // pakai helper biar konsisten
  return newTest;
}

export interface CreateTestPayload {
  icon: string;
  testName: string;
  targetPosition: string;
  accessType: string;
  sequence: string[];
  template: string | null;
}

export async function createNewTest(payload: CreateTestPayload) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  console.log("[DUMMY] createNewTest payload:", payload);
  return {
    id: Math.floor(Math.random() * 100000),
    ...payload,
    createdAt: new Date().toISOString(),
  };
}

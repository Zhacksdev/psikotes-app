// pages/stepper/publish-test/service/publish-test-service.ts
export async function publishTestToAPI(testData: { testName: string; targetPosition: string }) {
  // Logika penerbitan tes ke backend (dummy service)
  try {
    const response = await fetch("/api/publish-test", {
      method: "POST",
      body: JSON.stringify(testData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to publish test");
    return data;
  } catch (error) {
    throw new Error("Network error: " + error);
  }
}

// app/test-packages/stepper/hooks/use-manage-question.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Question,
  QuestionType,
  getQuestions,
  deleteQuestion,
  updateQuestion,
  updateTest,
} from "../service/manage-question-service";

// tipe untuk config per test type
type TestConfig = {
  duration: string;
  count: string;
};

export function useManageQuestions(
  selectedType: QuestionType,
  testId?: string
) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // simpan config untuk semua tipe test
  const [config, setConfig] = useState<Record<QuestionType, TestConfig>>({
    DISC: { duration: "", count: "" },
    CAAS: { duration: "", count: "" },
    "Fast Accuracy": { duration: "", count: "" },
  });

  /* ================================================================
   * FETCH DATA berdasarkan activeType
   * ================================================================ */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getQuestions(selectedType);
      setQuestions(data);
      setLoading(false);
    };
    fetchData();
  }, [selectedType]);

  /* ================================================================
   * ACTIONS
   * ================================================================ */
  // DELETE
  const handleDelete = async (id: string) => {
    if (!testId) return;
    await deleteQuestion(testId, id); // ✅ pass testId
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  // UPDATE
  const handleUpdate = async (id: string, data: Partial<Question>) => {
    if (!testId) return;
    await updateQuestion(testId, id, data); // ✅ pass testId
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...data } : q))
    );
  };

  /* ================================================================
   * CONFIG SETTERS
   * ================================================================ */
  const setDuration = (val: string) => {
    setConfig((prev) => ({
      ...prev,
      [selectedType]: { ...prev[selectedType], duration: val },
    }));
  };

  const setQuestionCount = (val: string) => {
    setConfig((prev) => ({
      ...prev,
      [selectedType]: { ...prev[selectedType], count: val },
    }));
  };

  const duration = config[selectedType].duration;
  const questionCount = config[selectedType].count;

  /* ================================================================
   * SYNC ke TEST (dan simpan ke localStorage untuk Step 3)
   * ================================================================ */
  const syncToTest = async () => {
    try {
      // 🔑 simpan detail config per type ke localStorage
      localStorage.setItem("testConfigs", JSON.stringify(config));

      if (testId) {
        const totalDuration = Object.values(config).reduce(
          (sum, c) => sum + (parseInt(c.duration || "0", 10) || 0),
          0
        );

        const totalCount = Object.values(config).reduce(
          (sum, c) => sum + (parseInt(c.count || "0", 10) || 0),
          0
        );

        await updateTest(testId, {
          questions: totalCount,
          duration: `${totalDuration} min`,
        });
      }

      console.log("✅ Config saved to localStorage:", config);
    } catch (err) {
      console.error("❌ Failed to sync config", err);
    }
  };

  return {
    questions,
    loading,
    search,
    setSearch,

    duration,
    setDuration,
    questionCount,
    setQuestionCount,

    handleDelete,
    handleUpdate,
    syncToTest,

    config, // expose semua config kalau mau dipakai di summary
  };
}

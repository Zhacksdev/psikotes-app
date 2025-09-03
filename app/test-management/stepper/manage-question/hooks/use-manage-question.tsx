// hooks/use-manage-question.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type Question,
  type QuestionType,
} from "../service/manage-question-service";

/** Simpan duration & preferensi count per tipe */
type ConfigMap = Record<QuestionType, { duration: string; countPref: string }>;

const DEFAULT_CONFIG: ConfigMap = {
  DISC: { duration: "30", countPref: "" },           // "" = ikut total soal
  CAAS: { duration: "25", countPref: "" },
  "Fast Accuracy": { duration: "10", countPref: "" },
};

const LS_KEY = "psikotes:test-configs";

function loadConfig(): ConfigMap {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ConfigMap>;
    // merge default supaya key selalu lengkap
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      DISC: { ...DEFAULT_CONFIG.DISC, ...(parsed?.DISC ?? {}) },
      CAAS: { ...DEFAULT_CONFIG.CAAS, ...(parsed?.CAAS ?? {}) },
      "Fast Accuracy": {
        ...DEFAULT_CONFIG["Fast Accuracy"],
        ...(parsed?.["Fast Accuracy"] ?? {}),
      },
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function useManageQuestions(selectedType: QuestionType) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // ====== config per tipe: duration + preferensi count (bisa kosong)
  const [config, setConfig] = useState<ConfigMap>(() => loadConfig());

  // persist setiap ganti
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEY, JSON.stringify(config));
    }
  }, [config]);

  // getters/setters duration
  const duration = config[selectedType]?.duration ?? "";
  const setDuration = useCallback(
    (v: string) =>
      setConfig((prev) => ({
        ...prev,
        [selectedType]: { ...prev[selectedType], duration: v },
      })),
    [selectedType]
  );

  // preferensi count (string angka, "" = ikuti total soal)
  const setQuestionCount = useCallback(
    (v: string) => {
      const digits = v.replace(/\D/g, ""); // hanya angka
      setConfig((prev) => ({
        ...prev,
        [selectedType]: {
          ...prev[selectedType],
          countPref: digits, // simpan apa adanya (clamp dilakukan saat render)
        },
      }));
    },
    [selectedType]
  );

  // ====== fetch daftar soal per tipe + pencarian
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getQuestions(selectedType, search);
      setAllQuestions(data);
    } finally {
      setLoading(false);
    }
  }, [selectedType, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ====== derive visible questions: slice sesuai effectiveCount
  const totalQuestions = allQuestions.length;
  const pref = config[selectedType]?.countPref ?? "";
  const prefNum = pref === "" ? totalQuestions : parseInt(pref, 10) || 0;
  const effectiveCount = Math.min(Math.max(prefNum, 0), totalQuestions);
  const questions = allQuestions.slice(0, effectiveCount);

  // nilai yang ditampilkan di input = effective (sudah di-clamp)
  const questionCount = String(effectiveCount);

  // ====== CRUD lalu refresh
  async function handleAdd(q: Omit<Question, "id">) {
    await addQuestion(q);
    fetchQuestions();
  }
  async function handleUpdate(id: string, data: Partial<Question>) {
    await updateQuestion(id, data);
    fetchQuestions();
  }
  async function handleDelete(id: string) {
    await deleteQuestion(id);
    fetchQuestions();
  }

  return {
    // list hasil filter + info tambahan
    questions,
    totalQuestions, // kalau mau tampil "10 dari 20", gunakan ini di UI
    loading,

    // search
    search,
    setSearch,

    // actions
    handleAdd,
    handleUpdate,
    handleDelete,
    fetchQuestions,

    // config per tipe
    duration,
    setDuration,
    questionCount,     // angka yang dipakai & ditampilkan
    setQuestionCount,  // preferensi user (filter); "" = semua soal
  };
}

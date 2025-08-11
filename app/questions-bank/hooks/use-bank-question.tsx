// app/questions-bank/hooks/use-bank-question.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getBanks,
  seedBanksIfEmpty,
  createBank,
  deleteBank,
  type QuestionBank,
  type TestType,
} from "../services/bank-question-service";

export function useBankQuestion() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    Promise.resolve()
      .then(() => getBanks())
      .then(setBanks)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // seed BANK ONLY (tanpa questions)
    seedBanksIfEmpty();
    refresh();
  }, [refresh]);

  function addBank(name: string, icon: string, testType: TestType) {
    setLoading(true);
    createBank({ name, icon, testType });
    refresh();
  }

  function removeBank(id: string) {
    setLoading(true);
    deleteBank(id);
    refresh();
  }

  return { banks, loading, addBank, removeBank, refresh };
}

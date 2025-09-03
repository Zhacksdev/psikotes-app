"use client";

import { useCallback, useState } from "react";
import {
  Candidate,
  getCandidatesAPI,
  addCandidateAPI,
  removeCandidateAPI,
  importCandidatesAPI,
  updateCandidateAPI,
} from "../service/candidate-distribution-service";

export type UseManageCandidatesReturn = {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  setError: (v: string | null) => void;

  refreshCandidates: () => Promise<void>;
  addCandidate: (candidate: Candidate) => Promise<void>;
  removeCandidate: (nik: string) => Promise<void>;
  importCandidates: (file: File) => Promise<void>;
  updateCandidate: (payload: Candidate) => Promise<void>;

  handleAddCandidate: (candidate: Candidate) => Promise<void>;
  handleRemoveCandidate: (nik: string) => Promise<void>;
  handleImportCandidates: (file: File) => Promise<void>;
  handleUpdateCandidate: (payload: Candidate) => Promise<void>;
};

export function useManageCandidates(): UseManageCandidatesReturn {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidatesAPI();
      setCandidates(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat kandidat.");
    } finally {
      setLoading(false);
    }
  }, []);

  const addCandidate = useCallback(async (candidate: Candidate) => {
    setLoading(true);
    setError(null);
    try {
      const isDup = candidates.some(
        (c) =>
          c.nik === candidate.nik ||
          c.email.toLowerCase() === candidate.email.toLowerCase()
      );
      if (isDup) throw new Error("NIK/Email sudah terdaftar.");
      await addCandidateAPI(candidate);
      await refreshCandidates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal tambah kandidat.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [candidates, refreshCandidates]);

  const removeCandidate = useCallback(async (nik: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeCandidateAPI(nik);
      await refreshCandidates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal hapus kandidat.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshCandidates]);

  const importCandidates = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      await importCandidatesAPI(file);
      await refreshCandidates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal import kandidat.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshCandidates]);

  const updateCandidate = useCallback(async (payload: Candidate) => {
    setLoading(true);
    setError(null);
    try {
      if (!payload?.nik) throw new Error("NIK kandidat tidak boleh kosong.");
      await updateCandidateAPI(payload);
      await refreshCandidates();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal mengubah kandidat.");
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshCandidates]);

  return {
    candidates, loading, error, setError,
    refreshCandidates, addCandidate, removeCandidate, importCandidates, updateCandidate,
    handleAddCandidate: addCandidate,
    handleRemoveCandidate: removeCandidate,
    handleImportCandidates: importCandidates,
    handleUpdateCandidate: updateCandidate,
  };
}

import { useCallback, useState } from "react";
import {
  Candidate,
  getCandidatesAPI,
  addCandidateAPI,
  removeCandidateAPI,
  importCandidatesAPI, // <-- terima File
  updateCandidateAPI,   // <-- PASTIKAN ada di service
} from "../service/manage-candidates-service";

export type UseManageCandidatesReturn = {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  setError: (v: string | null) => void;

  refreshCandidates: () => Promise<void>;
  addCandidate: (candidate: Candidate) => Promise<void>;
  removeCandidate: (nik: string) => Promise<void>;
  importCandidates: (file: File) => Promise<void>;
  updateCandidate: (payload: Candidate) => Promise<void>; // <-- BARU

  // alias lama (opsional, buat kompatibilitas)
  handleAddCandidate: (candidate: Candidate) => Promise<void>;
  handleRemoveCandidate: (nik: string) => Promise<void>;
  handleImportCandidates: (file: File) => Promise<void>;
  handleUpdateCandidate: (payload: Candidate) => Promise<void>; // <-- BARU
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

  const addCandidate = useCallback(
    async (candidate: Candidate) => {
      setLoading(true);
      setError(null);
      try {
        // (opsional) guard duplikat cepat di client
        const isDup = candidates.some(
          (c) =>
            c.nik === candidate.nik ||
            c.email.toLowerCase() === candidate.email.toLowerCase()
        );
        if (isDup) {
          throw new Error("NIK/Email sudah terdaftar.");
        }

        await addCandidateAPI(candidate);
        await refreshCandidates();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal tambah kandidat.";
        setError(msg);
        throw e; // biar caller tahu gagal (mis. untuk toast)
      } finally {
        setLoading(false);
      }
    },
    [candidates, refreshCandidates]
  );

  const removeCandidate = useCallback(
    async (nik: string) => {
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
    },
    [refreshCandidates]
  );

  const importCandidates = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        await importCandidatesAPI(file); // <-- pastikan service menerima File
        await refreshCandidates();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Gagal import kandidat.");
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshCandidates]
  );

  /** =========================
   * UPDATE CANDIDATE (BARU)
   * - Menerima payload Candidate penuh
   * - Key yang dipakai: nik
   * - Panggil service -> refresh
   * ========================= */
  const updateCandidate = useCallback(
    async (payload: Candidate) => {
      setLoading(true);
      setError(null);
      try {
        // (opsional) validasi sederhana di client
        if (!payload?.nik) {
          throw new Error("NIK kandidat tidak boleh kosong.");
        }
        await updateCandidateAPI(payload);
        await refreshCandidates();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Gagal mengubah kandidat.";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [refreshCandidates]
  );

  // alias lama (biar kode lama tetap jalan)
  const handleAddCandidate = addCandidate;
  const handleRemoveCandidate = removeCandidate;
  const handleImportCandidates = importCandidates;
  const handleUpdateCandidate = updateCandidate; // <-- alias

  return {
    candidates,
    loading,
    error,
    setError,
    refreshCandidates,
    addCandidate,
    removeCandidate,
    importCandidates,
    updateCandidate,
    handleAddCandidate,
    handleRemoveCandidate,
    handleImportCandidates,
    handleUpdateCandidate,
  };
}

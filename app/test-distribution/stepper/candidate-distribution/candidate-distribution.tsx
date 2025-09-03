// app/test-distribution/stepper/candidate-distribution/candidate-distribution.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  MoreVertical,
  Eye,
  RefreshCcw,
  Trash2,
  FileSpreadsheet,
  Loader2,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import SessionDate from "./dialogs/session-date";

import { useManageCandidates } from "./hooks/use-candidate-distribution";
import type { Candidate } from "./service/candidate-distribution-service";
import { useMakeSession } from "../../hooks/use-make-session";

// dialogs
import AddCandidateDialog from "./dialogs/add-candidates-dialog";
import ImportCandidatesDialog from "./dialogs/import-candidates-dialog";
import CandidateDetailDialog from "./dialogs/candidate-detail-dialog";

/* =============================
   helpers
   ============================= */
function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 1)
    .toUpperCase();
}
function shortName(name: string) {
  return name.split(" ").slice(0, 1).join(" ");
}
function mailInvite({
  to,
  name,
  link,
  subject = "Undangan Tes Psikotes",
}: {
  to: string;
  name: string;
  link: string;
  subject?: string;
}) {
  const body = `Hai ${name},

Anda diundang mengikuti Tes Psikotes.

Silakan akses link berikut untuk mengerjakan tes:
${link}

Terima kasih.`;
  window.open(
    `mailto:${to}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`,
    "_blank"
  );
}

type Props = {
  onBack: () => void;
  onNext: () => void; // dipakai juga untuk Finish
};

/* =============================
   COMPONENT
   ============================= */
export default function CandidatesDistributions({ onBack, onNext }: Props) {
  // global state antar step
  const {
    sessionStart,
    setSessionStart,
    sessionEnd,
    setSessionEnd,
    sentAll,
    markAsSentAll,
    setCandidatesTotal,
  } = useMakeSession();

  // local candidates state
  const {
    candidates,
    loading,
    error,
    setError,
    addCandidate,
    importCandidates,
    refreshCandidates,
    updateCandidate,
    removeCandidate,
  } = useManageCandidates();

  // dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);

  // flags
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sending, setSending] = useState(false);

  const testId = "tes1234";

  // status styel
  const STATUS_STYLE: Record<string, string> = {
    Pending: "border-blue-200 bg-blue-50 text-blue-600",
    Invited: "border-green-200 bg-green-50 text-green-600",
  };

  useEffect(() => {
    refreshCandidates();
  }, [refreshCandidates]);

  // sinkron jumlah kandidat ke global
  useEffect(() => {
    setCandidatesTotal(candidates.length);
  }, [candidates.length, setCandidatesTotal]);

  /* =========== actions =========== */
  async function handleAdd(form: Candidate) {
    try {
      setSaving(true);
      setError(null);
      await addCandidate(form);
      const link = `${window.location.origin}/test/${testId}?nik=${form.nik}`;
      mailInvite({ to: form.email, name: form.name, link });
      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleImport(file: File) {
    try {
      setUploading(true);
      setError(null);
      await importCandidates(file);
      setImportOpen(false);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdate(payload: Candidate) {
    try {
      setUpdating(true);
      setError(null);
      await updateCandidate(payload);
      setDetailOpen(false);
      setSelected(null);
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove(nik: string) {
    if (!confirm("Yakin ingin menghapus kandidat ini?")) return;
    await removeCandidate(nik);
  }

  async function handleSendAll() {
    if (!sessionStart || !sessionEnd) {
      alert("Pilih start & end date dulu.");
      return;
    }
    if (candidates.length === 0) {
      alert("Tambahkan minimal 1 kandidat.");
      return;
    }
    setSending(true);
    try {
      for (const c of candidates) {
        if (c.status !== "Invited") {
          await updateCandidate({ ...c, status: "Invited" });
        }
      }
      markAsSentAll();

      // ✅ langsung ke step 3
      onNext();
    } finally {
      setSending(false);
    }
  }

  /* =============================
     RENDER
     ============================= */
  return (
    <div className="w-full px-4 sm:px-6 md:px-8 py-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
        <div>
          {/* Judul halaman */}
          <h2 className="font-bold text-2xl mb-1">Manage Candidates</h2>
          <p className="text-gray-500 text-sm mb-6">
            Add candidates from candidates menu or CSV
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            disabled={loading || sentAll}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            Import Candidates
          </Button>
          <Button
            onClick={() => {
              setAddOpen(true);
              setError(null);
            }}
            disabled={sentAll}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Candidates
          </Button>
        </div>
      </div>

      {/* ===== LIST ===== */}
      {candidates.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400 text-sm">
          Belum ada kandidat. Tambahkan kandidat terlebih dahulu.
        </div>
      ) : (
        <div className="flex flex-col space-y-3 mb-10">
          {candidates.map((c) => (
            <div
              key={c.nik}
              className="relative flex flex-col sm:flex-row items-start sm:items-center bg-white border rounded-xl px-4 py-3 w-full hover:bg-blue-50 gap-3"
            >
              {/* Row actions & status */}
              <div className="absolute right-3 top-3 flex items-center gap-2">
                <span
                  className={`hidden sm:inline-block px-2 py-[2px] rounded-md text-[11px] font-medium ${
                    STATUS_STYLE[c.status || "Pending"]
                  }`}
                >
                  {c.status || "Pending"}
                </span>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-8 h-8 p-0"
                      disabled={sentAll}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelected(c);
                        setDetailOpen(true);
                      }}
                      disabled={sentAll}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View / Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const link = `${window.location.origin}/test/${testId}?nik=${c.nik}`;
                        mailInvite({
                          to: c.email,
                          name: c.name,
                          link,
                          subject: "Resend Link Tes Psikotes",
                        });
                      }}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> Resend
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleRemove(c.nik)}
                      className="text-red-600"
                      disabled={sentAll}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Avatar & Info */}
              <div className="flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-black">
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {shortName(c.name)}
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {c.email}
                  </div>
                </div>
              </div>

              {/* Status mobile */}
              <div className="sm:hidden mt-1">
                <span
                  className={`inline-block px-2 py-[2px] rounded-md text-[11px] font-medium ${
                    STATUS_STYLE[c.status || "Pending"]
                  }`}
                >
                  {c.status || "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== SESSION SETTINGS ===== */}
      <div className="mb-8">
        <h3 className="font-bold text-lg mb-3">Session Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SessionDate
            label="Start Date"
            value={sessionStart}
            onChange={setSessionStart}
            disabled={sentAll}
          />
          <SessionDate
            label="End Date"
            value={sessionEnd}
            onChange={setSessionEnd}
            disabled={sentAll}
          />
        </div>
        {sentAll && (
          <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
            <Check className="w-4 h-4" /> Invitations sent — schedule locked.
          </p>
        )}
      </div>

      {/* ===== NAV ===== */}
      <div className="flex justify-between gap-3 pt-8">
        <Button variant="outline" type="button" onClick={onBack}>
          Back
        </Button>

        <div className="flex gap-2">
          {/* STEP 2 -> ada Send All */}
          {!sentAll && (
            <Button
              type="button"
              onClick={handleSendAll}
              disabled={
                sending ||
                !sessionStart ||
                !sessionEnd ||
                candidates.length === 0
              }
              className="bg-blue-500 text-white"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {sending ? "Sending..." : "Send All"}
            </Button>
          )}

          {/* STEP 3 -> hanya tombol Finish */}
          {sentAll && (
            <Button
              type="button"
              onClick={onNext}
              className="bg-green-500 text-white"
            >
              Finish
            </Button>
          )}
        </div>
      </div>

      {/* ===== DIALOGS ===== */}
      <AddCandidateDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleAdd}
        saving={saving}
        error={error}
      />
      <ImportCandidatesDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onUpload={handleImport}
        uploading={uploading}
        error={error}
      />
      <CandidateDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        candidate={selected}
        onSave={handleUpdate}
        saving={updating}
        error={error}
      />
    </div>
  );
}

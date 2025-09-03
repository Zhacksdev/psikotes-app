"use client";

/**
 * ManageCandidates
 * - UI daftar kandidat + actions
 * - Memakai 2 dialog terpisah: AddCandidateDialog & ImportCandidatesDialog
 * - State/CRUD di-orchestrate oleh hook useManageCandidates
 *
 * Catatan maintenance:
 * - Dropdown menu di tiap row kandidat memakai shadcn DropdownMenu (Radix)
 * - Posisi menu DISET selalu muncul "di bawah" tombol (three dots) pakai side="bottom"
 * - align="end" agar kanan menu sejajar dengan tombol (lebih rapi ketika banyak aksi)
 * - sideOffset untuk jarak vertikal, collisionPadding untuk hindari tabrakan di layar kecil
 */

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Users,
  MoreVertical,
  Eye,
  RefreshCcw,
  Trash2,
  FileSpreadsheet,
  BriefcaseBusiness,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ICON_MAP } from "@/lib/icon-mapping";
import { useManageCandidates } from "./hooks/use-manage-candidates";
import type { Candidate } from "./service/manage-candidates-service";

import AddCandidateDialog from "./dialogs/add-candidates-dialog";
import ImportCandidatesDialog from "./dialogs/import-candidates-dialog";
import CandidateDetailDialog from "./dialogs/candidate-detail-dialog";

/* ===== Helpers lokal (tanpa lib terpisah) ===== */
// generate inisial (maks 2 huruf) untuk avatar bulat
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
// tampilkan nama pendek (2 kata pertama)
function shortName(name: string) {
  return name.split(" ").slice(0, 2).join(" ");
}
// util kirim email undangan via mailto
function sendInvitationEmail({
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
    `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    "_blank"
  );
}

type Props = {
  testName: string;
  testIcon: keyof typeof ICON_MAP;
  targetPosition?: string;
  onNext: () => void;
  onBack: () => void;
};

export default function ManageCandidates({
  testName,
  testIcon,
  targetPosition,
  onNext,
  onBack,
}: Props) {
  const {
    candidates,
    loading,
    error,
    setError,
    addCandidate,
    importCandidates,
    refreshCandidates,
    updateCandidate, // <-- tarik dari hook
  } = useManageCandidates();

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [saving, setSaving] = useState(false);       // add
  const [uploading, setUploading] = useState(false); // import
  const [updating, setUpdating] = useState(false);   // <-- update (baru)

  // TODO: ambil dari props/router bila sudah ada
  const testId = "tes1234";

  useEffect(() => {
    refreshCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================
   * ADD
   * ========================= */
  async function handleAdd(form: Candidate) {
    try {
      setSaving(true);
      setError(null);
      await addCandidate(form);

      const linkTes = `${window.location.origin}/test/${testId}?nik=${form.nik}`;
      sendInvitationEmail({ to: form.email, name: form.name, link: linkTes });

      setAddOpen(false);
    } finally {
      setSaving(false);
    }
  }

  /* =========================
   * IMPORT
   * ========================= */
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

  const nextDisabled = candidates.length === 0;

  /* =========================
   * VIEW / EDIT
   * ========================= */
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Candidate | null>(null);

  // <-- HANDLE UPDATE (baru)
  async function handleUpdate(payload: Candidate) {
    try {
      setUpdating(true);
      setError(null);
      await updateCandidate(payload); // panggil hook
      setDetailOpen(false);
      setSelected(null);
    } catch {
      // error sudah ditangani di hook via setError
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="w-full px-2 sm:px-6 md:px-8 lg:px-16 py-8">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full border-blue-200 border-2 bg-white text-blue-500 text-3xl shadow shrink-0">
            {ICON_MAP[testIcon]}
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <h2 className="text-lg sm:text-xl font-bold truncate">{testName}</h2>
            <div className="flex items-center gap-4 mt-1 text-gray-500 text-xs sm:text-sm flex-wrap">
              <span className="flex items-center gap-2 truncate">
                <BriefcaseBusiness className="w-4 h-4 sm:w-4 sm:h-4" />
                {targetPosition}
              </span>
              <span className="flex items-center gap-2 truncate">
                <Users className="w-4 h-4" />
                {candidates.length}
              </span>
            </div>
          </div>
        </div>

        {/* ===== ACTIONS ===== */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="font-medium border bg-white shadow-none px-4 py-2 text-sm w-full sm:w-auto flex items-center justify-center"
            onClick={() => setImportOpen(true)}
            disabled={loading}
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Import Candidates
          </Button>
          <Button
            onClick={() => {
              setAddOpen(true);
              setError(null);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-3">Manage Candidates</h3>

      {/* ===== EMPTY STATE ===== */}
      {candidates.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center min-h-[120px] mb-4 text-gray-400 text-sm">
          Tambahkan kandidat pertama Anda untuk memulai
        </div>
      )}

      {/* ===== LIST ===== */}
      <div className="flex flex-col items-center space-y-5 mb-10">
        {candidates.map((c, idx) => (
          <div
            key={c.nik + idx}
            className="relative flex flex-col sm:flex-row items-start sm:items-center bg-white border rounded-2xl px-4 py-4 w-full transition hover:bg-blue-50 gap-4"
          >
            {/* Row actions & status */}
            <div className="absolute right-4 top-4 flex flex-row items-center gap-2">
              {/* Badge status (desktop) */}
              <span className="hidden sm:inline-block border border-blue-200 bg-blue-50 text-blue-600 px-2 py-[2px] rounded-lg text-[11px] font-medium">
                {c.status || "Pending"}
              </span>

              {/* ===== DROPDOWN MENU: SELALU DI BAWAH TOMBOL ===== */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-9 h-9 p-0 border border-gray-100 hover:bg-blue-50 transition"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  sideOffset={6}
                  avoidCollisions
                  collisionPadding={12}
                  className="min-w-[200px] z-50 shadow-lg"
                >
                  <DropdownMenuItem
                    onClick={() => {
                      setSelected(c);
                      setDetailOpen(true);
                    }}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" /> View / Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => {
                      const link = `${window.location.origin}/test/${"tes1234"}?nik=${c.nik}`;
                      sendInvitationEmail({
                        to: c.email,
                        name: c.name,
                        link,
                        subject: "Resend Link Tes Psikotes",
                      });
                    }}
                    className="gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> Resend Invitation
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => alert(`Remove: ${c.name}`)}
                    className="gap-2 text-red-600 focus:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Candidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Avatar & Info */}
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-700 border border-blue-200 shadow-sm">
                {getInitials(c.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate">{shortName(c.name)}</div>
                <div className="text-gray-500 text-xs truncate">{c.email}</div>
              </div>
            </div>

            {/* Status untuk mobile */}
            <div className="mt-2 flex sm:hidden items-end w-full">
              <span className="inline-block border border-blue-200 bg-blue-50 text-blue-600 px-2 py-[2px] rounded-lg text-[11px] font-medium shadow-sm">
                {c.status || "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== NAV ===== */}
      <div className="flex justify-end gap-3 pt-8">
        <Button
          variant="outline"
          type="button"
          onClick={onBack}
          className="min-w-[90px] px-6 py-2"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`min-w-[90px] px-6 py-2 ${
            nextDisabled ? "bg-blue-100 text-blue-400" : "bg-blue-500 text-white"
          }`}
        >
          Next
        </Button>
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
        onSave={handleUpdate}              // <-- pakai handler update
        saving={updating}                  // <-- status loading khusus update
        error={error}
      />
    </div>
  );
}

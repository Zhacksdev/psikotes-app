// modules/candidates/service/manage-candidates-service.ts

export type Candidate = {
  nik: string;
  name: string;
  email: string;
  phone: string;
  status?: "Pending" | "Active" | "Inactive";
};

const LS_KEY = "psikotes:candidates";

/* ============================================================================
   STORAGE HELPERS
   - readStore: baca dari localStorage; inject 1 dummy jika kosong
   - writeStore: tulis list ke localStorage
   ============================================================================ */
function readStore(): Candidate[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(LS_KEY);
  try {
    let arr = raw ? (JSON.parse(raw) as Candidate[]) : [];

    // Jika kosong, sisipkan 1 data dummy lalu persist
    if (!Array.isArray(arr) || arr.length === 0) {
      arr = [
        {
          nik: "001",
          name: "John Doe",
          email: "johndoe@example.com",
          phone: "081234567890",
          status: "Active",
        },
      ];
      writeStore(arr);
    }

    return Array.isArray(arr) ? arr : [];
  } catch {
    // Jika parsing gagal, fallback ke dummy lalu persist
    const fallback: Candidate[] = [
      {
        nik: "001",
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "081234567890",
        status: "Active",
      },
    ];
    writeStore(fallback);
    return fallback;
  }
}

function writeStore(list: Candidate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(list));
}

/* ============================================================================
   PUBLIC APIs (untuk hook/useManageCandidates)
   ============================================================================ */
export async function getCandidatesAPI(): Promise<Candidate[]> {
  return readStore();
}

export async function addCandidateAPI(data: Candidate): Promise<Candidate> {
  const list = readStore();

  // Guard duplikat di sisi service (nik/email)
  const dup = list.find(
    (x) =>
      x.nik === data.nik ||
      x.email.trim().toLowerCase() === data.email.trim().toLowerCase()
  );
  if (dup) throw new Error("NIK/Email sudah terdaftar.");

  const item: Candidate = {
    nik: data.nik.trim(),
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone?.trim() ?? "",
    status: data.status ?? "Pending",
  };

  writeStore([...list, item]);
  return item;
}

export async function removeCandidateAPI(nik: string): Promise<void> {
  const list = readStore();
  writeStore(list.filter((c) => c.nik !== nik));
}

/**
 * UPDATE kandidat berdasarkan NIK.
 * - Merge field baru ke existing (NIK tetap jadi primary key & tidak boleh diubah).
 * - Cegah tabrakan email dengan kandidat lain.
 */
export async function updateCandidateAPI(data: Candidate): Promise<Candidate> {
  const list = readStore();
  const idx = list.findIndex((x) => x.nik === data.nik);
  if (idx === -1) throw new Error("Kandidat tidak ditemukan.");

  const nextEmail = (data.email ?? "").trim().toLowerCase();
  if (!nextEmail) throw new Error("Email tidak boleh kosong.");

  // Cek email bentrok dengan kandidat lain (yang NIK-nya berbeda)
  const emailClash = list.some(
    (x, i) =>
      i !== idx && x.email.trim().toLowerCase() === nextEmail
  );
  if (emailClash) throw new Error("Email sudah digunakan kandidat lain.");

  const updated: Candidate = {
    ...list[idx],
    // nik tidak boleh berubah
    nik: list[idx].nik,
    name: (data.name ?? list[idx].name).trim(),
    email: (data.email ?? list[idx].email).trim(),
    phone: (data.phone ?? list[idx].phone).trim(),
    status:
      data.status === "Active" || data.status === "Inactive" || data.status === "Pending"
        ? data.status
        : list[idx].status ?? "Pending",
  };

  list[idx] = updated;
  writeStore(list);
  return updated;
}

/**
 * Import dari file CSV/XLS(tersimpan sebagai CSV). Parsenya simpel (tanpa library):
 * - Header wajib ada: nik,name,email (phone/status opsional)
 * - Baris kosong di-skip
 * - Duplikat (nik/email) di-skip
 * Return: daftar kandidat yang berhasil ditambahkan
 */
export async function importCandidatesAPI(file: File): Promise<Candidate[]> {
  const text = await file.text();
  const rows = parseCSV(text); // -> array of record (lowercased keys)

  const store = readStore();
  const existingNik = new Set(store.map((x) => x.nik));
  const existingEmail = new Set(store.map((x) => x.email.toLowerCase()));

  const added: Candidate[] = [];

  for (const r of rows) {
    const nik = (r.nik || "").trim();
    const name = (r.name || "").trim();
    const email = (r.email || "").trim();
    const phone = (r.phone || "").trim();
    const statusRaw = (r.status || "").trim();

    if (!nik || !name || !email) continue; // minimal fields
    if (existingNik.has(nik) || existingEmail.has(email.toLowerCase())) continue;

    const status: Candidate["status"] =
      statusRaw === "Active" || statusRaw === "Inactive" ? statusRaw : "Pending";

    added.push({ nik, name, email, phone, status });
    existingNik.add(nik);
    existingEmail.add(email.toLowerCase());
  }

  if (added.length) writeStore([...store, ...added]);
  return added;
}

/* ============================================================================
   CSV PARSER MINIMAL (tanpa lib)
   ============================================================================ */
// Hasil parse: array object dengan key lowercase sesuai header
function parseCSV(csv: string): Array<Record<string, string>> {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  const out: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    if (cols.every((c) => c.trim() === "")) continue;

    const rec: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      rec[headers[j]] = (cols[j] ?? "").replace(/^\s*"?|"?\s*$/g, "");
    }
    out.push(rec);
  }
  return out;
}

/**
 * Split satu baris CSV memperhatikan tanda kutip ganda.
 * Mendukung: "nilai, dengan, koma", escaping "" di dalam kutip.
 */
function splitCSVLine(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // double quote di dalam quoted -> treat as literal quote
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++; // skip next
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      res.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  res.push(cur);
  return res;
}

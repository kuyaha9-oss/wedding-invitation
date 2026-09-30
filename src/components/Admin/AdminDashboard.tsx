import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  FileArchive,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Music,
  Palette,
  Plus,
  Printer,
  QrCode,
  Save,
  Search,
  Settings,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { invalidateConfigCache } from "../../hooks/useConfig";
import InvitationManager from "../InvitationManager";
import QRCodeManager from "../QRCodeManager";

interface RSVP {
  id: number;
  guest_name: string;
  attendance: "hadir" | "tidak_hadir" | "ragu";
  guest_count: number;
  message: string;
  created_at: string;
}

interface Wish {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

const DataTable = <T extends { id: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onBulkDelete,
}: {
  data: T[];
  columns: {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
  }[];
  onEdit?: (item: T) => void;
  onDelete?: (id: number) => void;
  onBulkDelete?: (ids: number[]) => void;
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);
  useEffect(() => {
    setSelected([]);
  }, [data]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelected(paginatedData.map((d) => d.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const executeBulkDelete = () => {
    if (onBulkDelete && selected.length > 0) {
      if (confirm(`Yakin hapus ${selected.length} data terpilih?`)) {
        onBulkDelete(selected);
        setSelected([]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size}>
                {size} Data
              </option>
            ))}
          </select>
          {onBulkDelete && selected.length > 0 && (
            <button
              type="button"
              onClick={executeBulkDelete}
              className="flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" /> Hapus ({selected.length})
            </button>
          )}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2 pr-4 pl-10 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase dark:bg-slate-900/50 dark:text-slate-400">
              <tr>
                {onBulkDelete && (
                  <th className="w-4 px-6 py-4">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((d) => selected.includes(d.id))
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                )}
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-6 py-4 font-bold ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length + (onBulkDelete ? 2 : onEdit ? 1 : 0)
                    }
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    {onBulkDelete && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.includes(item.id)}
                          onChange={() => handleSelectOne(item.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={`px-6 py-4 ${col.className || ""}`}
                      >
                        {typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(item)}
                              className="rounded p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Yakin hapus data ini?"))
                                  onDelete(item.id);
                              }}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Halaman {filteredData.length === 0 ? 0 : page} dari {totalPages}{" "}
          (Total {filteredData.length} Data)
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

type BankAccount = { bank: string; number: string; name: string };
type StoryItem = { date: string; title: string; desc: string };
type Guest = {
  id: number;
  name: string;
  slug: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
};

const parseJson = <T,>(value: string | undefined, fallback: T): T => {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const isoToInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const eventPatch = (prefix: "AKAD" | "RESEPSI", start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end || start);
  const id = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return {
    [`${prefix}_DAY`]: new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
    }).format(startDate),
    [`${prefix}_DATE`]: id
      .format(startDate)
      .replace(/^[^,]+,\s*/, ""),
    [`${prefix}_START`]: startDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    [`${prefix}_END`]: endDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    [`${prefix}_ISO_START`]: startDate.toISOString(),
    [`${prefix}_ISO_END`]: endDate.toISOString(),
  };
};

const Field = ({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <label className={wide ? "space-y-1.5 md:col-span-2" : "space-y-1.5"}>
    <span className="block text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
      {label}
    </span>
    {children}
  </label>
);

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
    <div className="mb-6 flex items-center gap-3">
      <Icon className="h-5 w-5 text-blue-600" />
      <h3 className="font-serif text-lg font-bold text-slate-800 italic dark:text-white">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const UploadInput = ({
  label,
  value,
  kind,
  onChange,
}: {
  label: string;
  value: string;
  kind: "image" | "audio";
  onChange: (value: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);
      const res = await fetch("/api/upload", {
        method: "POST",
        body,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal");
      onChange(data.url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label} wide>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={kind === "audio" ? "/uploads/audio/music.mp3" : "/uploads/images/foto.webp"}
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
          <input
            type="file"
            className="hidden"
            accept={kind === "audio" ? "audio/*" : "image/*"}
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </label>
      </div>
      {value && kind === "image" && (
        <img src={value} alt={label} className="mt-3 h-32 w-full rounded-lg object-cover" />
      )}
      {value && kind === "audio" && (
        <audio src={value} controls className="mt-3 w-full" />
      )}
    </Field>
  );
};

const SettingsTab: React.FC = () => {
  const [rawConfig, setRawConfig] = useState<Record<string, string>>({});
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [gallery, setGallery] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);

  useEffect(() => {
    fetch("/api/config/full", { credentials: "include" })
      .then((r) => r.json())
      .then((full) => {
        setRawConfig(full);
        setBanks(parseJson(full.BANK_ACCOUNTS, []));
        setStories(parseJson(full.LOVE_STORY, []));
        setGallery(parseJson(full.GALLERY_IMAGES, []));
        setLoading(false);
      })
      .catch(() => {
        fetch("/api/config", { credentials: "include" })
          .then((r) => r.json())
          .then((data) => {
            setRawConfig(data);
            setBanks(parseJson(data.BANK_ACCOUNTS, []));
            setStories(parseJson(data.LOVE_STORY, []));
            setGallery(parseJson(data.GALLERY_IMAGES, []));
            setLoading(false);
          });
      });
  }, []);

  const handleChange = (key: string, value: string) => {
    setRawConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...rawConfig,
        BANK_ACCOUNTS: JSON.stringify(banks),
        LOVE_STORY: JSON.stringify(stories),
        GALLERY_IMAGES: JSON.stringify(gallery),
        ...(rawConfig.AKAD_START_INPUT
          ? eventPatch(
              "AKAD",
              rawConfig.AKAD_START_INPUT,
              rawConfig.AKAD_END_INPUT || rawConfig.AKAD_START_INPUT
            )
          : {}),
        ...(rawConfig.RESEPSI_START_INPUT
          ? eventPatch(
              "RESEPSI",
              rawConfig.RESEPSI_START_INPUT,
              rawConfig.RESEPSI_END_INPUT || rawConfig.RESEPSI_START_INPUT
            )
          : {}),
      };
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        invalidateConfigCache();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const restoreBackup = async () => {
    if (!backupFile || !confirm("Restore backup akan mengganti data RSVP, ucapan, dan daftar tamu. Lanjutkan?")) return;
    const body = await backupFile.text();
    const res = await fetch("/api/backup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body,
    });
    if (res.ok) window.location.reload();
    else alert("Restore gagal.");
  };

  const updateArray = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    patch: Partial<T>
  ) => setter((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const moveArray = <T,>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    direction: -1 | 1
  ) =>
    setter((items) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return items;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Perubahan akan langsung diterapkan setelah disimpan.
        </p>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 ${
            saved
              ? "bg-green-500"
              : "bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Tersimpan!" : "Simpan Semua"}
        </button>
      </div>

      <Section title="Mempelai" icon={Users}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["BRIDE_NICKNAME", "Nama Panggilan Wanita"],
            ["BRIDE_FULLNAME", "Nama Lengkap Wanita"],
            ["BRIDE_PARENTS", "Orang Tua Wanita"],
            ["BRIDE_INSTAGRAM", "Instagram Wanita"],
            ["GROOM_NICKNAME", "Nama Panggilan Pria"],
            ["GROOM_FULLNAME", "Nama Lengkap Pria"],
            ["GROOM_PARENTS", "Orang Tua Pria"],
            ["GROOM_INSTAGRAM", "Instagram Pria"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input className={inputClass} value={rawConfig[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} />
            </Field>
          ))}
          <UploadInput label="Foto Mempelai Wanita" kind="image" value={rawConfig.BRIDE_IMAGE ?? ""} onChange={(v) => handleChange("BRIDE_IMAGE", v)} />
          <UploadInput label="Foto Mempelai Pria" kind="image" value={rawConfig.GROOM_IMAGE ?? ""} onChange={(v) => handleChange("GROOM_IMAGE", v)} />
        </div>
      </Section>

      <Section title="Acara & Venue" icon={Settings}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Venue"><input className={inputClass} value={rawConfig.VENUE_NAME ?? ""} onChange={(e) => handleChange("VENUE_NAME", e.target.value)} /></Field>
          <Field label="Kota Hero"><input className={inputClass} value={rawConfig.HERO_CITY ?? ""} onChange={(e) => handleChange("HERO_CITY", e.target.value)} /></Field>
          <Field label="Alamat Lengkap" wide><textarea rows={3} className={inputClass} value={rawConfig.VENUE_ADDRESS ?? ""} onChange={(e) => handleChange("VENUE_ADDRESS", e.target.value)} /></Field>
          <Field label="Latitude"><input className={inputClass} value={rawConfig.VENUE_LAT ?? ""} onChange={(e) => handleChange("VENUE_LAT", e.target.value)} /></Field>
          <Field label="Longitude"><input className={inputClass} value={rawConfig.VENUE_LNG ?? ""} onChange={(e) => handleChange("VENUE_LNG", e.target.value)} /></Field>
          <Field label="Judul Akad"><input className={inputClass} value={rawConfig.AKAD_TITLE ?? ""} onChange={(e) => handleChange("AKAD_TITLE", e.target.value)} /></Field>
          <Field label="Akad Mulai"><input type="datetime-local" className={inputClass} value={rawConfig.AKAD_START_INPUT ?? isoToInput(rawConfig.AKAD_ISO_START)} onChange={(e) => handleChange("AKAD_START_INPUT", e.target.value)} /></Field>
          <Field label="Akad Selesai"><input type="datetime-local" className={inputClass} value={rawConfig.AKAD_END_INPUT ?? isoToInput(rawConfig.AKAD_ISO_END)} onChange={(e) => handleChange("AKAD_END_INPUT", e.target.value)} /></Field>
          <Field label="Judul Resepsi"><input className={inputClass} value={rawConfig.RESEPSI_TITLE ?? ""} onChange={(e) => handleChange("RESEPSI_TITLE", e.target.value)} /></Field>
          <Field label="Resepsi Mulai"><input type="datetime-local" className={inputClass} value={rawConfig.RESEPSI_START_INPUT ?? isoToInput(rawConfig.RESEPSI_ISO_START)} onChange={(e) => handleChange("RESEPSI_START_INPUT", e.target.value)} /></Field>
          <Field label="Resepsi Selesai"><input type="datetime-local" className={inputClass} value={rawConfig.RESEPSI_END_INPUT ?? isoToInput(rawConfig.RESEPSI_ISO_END)} onChange={(e) => handleChange("RESEPSI_END_INPUT", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Media" icon={ImageIcon}>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadInput label="Hero Image" kind="image" value={rawConfig.HERO_IMAGE ?? ""} onChange={(v) => handleChange("HERO_IMAGE", v)} />
          <UploadInput label="Musik Background" kind="audio" value={rawConfig.MUSIC_URL ?? ""} onChange={(v) => handleChange("MUSIC_URL", v)} />
          <Field label="Maks Tamu RSVP"><input type="number" className={inputClass} value={rawConfig.RSVP_MAX_GUESTS ?? ""} onChange={(e) => handleChange("RSVP_MAX_GUESTS", e.target.value)} /></Field>
        </div>
      </Section>

      <Section title="Galeri" icon={ImageIcon}>
        <div className="mb-4 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            <Upload className="h-4 w-4" /> Upload Banyak Foto
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  const body = new FormData();
                  body.append("file", file);
                  body.append("kind", "image");
                  const res = await fetch("/api/upload", { method: "POST", body, credentials: "include" });
                  const data = await res.json();
                  if (res.ok) setGallery((items) => [...items, data.url]);
                }
              }}
            />
          </label>
          <button type="button" onClick={() => setGallery((items) => [...items, ""])} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold">
            <Plus className="h-4 w-4" /> Tambah URL
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {gallery.map((url, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              {url && <img src={url} alt="" className="mb-3 h-36 w-full rounded-lg object-cover" />}
              <input className={inputClass} value={url} onChange={(e) => setGallery((items) => items.map((item, i) => i === index ? e.target.value : item))} />
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => moveArray(setGallery, index, -1)} className="rounded border px-2 py-1 text-xs">Naik</button>
                <button type="button" onClick={() => moveArray(setGallery, index, 1)} className="rounded border px-2 py-1 text-xs">Turun</button>
                <button type="button" onClick={() => setGallery((items) => items.filter((_, i) => i !== index))} className="ml-auto rounded border border-red-200 px-2 py-1 text-xs text-red-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Rekening Bank" icon={FileArchive}>
        <div className="space-y-3">
          {banks.map((bank, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_1fr_1fr_auto] dark:border-slate-700">
              <input className={inputClass} placeholder="Bank" value={bank.bank} onChange={(e) => updateArray(setBanks, index, { bank: e.target.value })} />
              <input className={inputClass} placeholder="Nomor" value={bank.number} onChange={(e) => updateArray(setBanks, index, { number: e.target.value })} />
              <input className={inputClass} placeholder="Atas Nama" value={bank.name} onChange={(e) => updateArray(setBanks, index, { name: e.target.value })} />
              <button type="button" onClick={() => setBanks((items) => items.filter((_, i) => i !== index))} className="rounded-lg border border-red-200 px-3 text-red-600">Hapus</button>
            </div>
          ))}
          <button type="button" onClick={() => setBanks((items) => [...items, { bank: "", number: "", name: "" }])} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Tambah Rekening</button>
        </div>
      </Section>

      <Section title="Love Story" icon={MessageCircle}>
        <div className="space-y-3">
          {stories.map((story, index) => (
            <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[160px_1fr_auto] dark:border-slate-700">
              <input className={inputClass} placeholder="Tanggal/Tahun" value={story.date} onChange={(e) => updateArray(setStories, index, { date: e.target.value })} />
              <input className={inputClass} placeholder="Judul" value={story.title} onChange={(e) => updateArray(setStories, index, { title: e.target.value })} />
              <button type="button" onClick={() => setStories((items) => items.filter((_, i) => i !== index))} className="rounded-lg border border-red-200 px-3 text-red-600">Hapus</button>
              <textarea className={`${inputClass} md:col-span-3`} rows={2} placeholder="Cerita" value={story.desc} onChange={(e) => updateArray(setStories, index, { desc: e.target.value })} />
            </div>
          ))}
          <button type="button" onClick={() => setStories((items) => [...items, { date: "", title: "", desc: "" }])} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white"><Plus className="h-4 w-4" /> Tambah Cerita</button>
        </div>
      </Section>

      <Section title="Teks, Tema, Telegram, dan Admin" icon={Palette}>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["TEXT_SALAM_OPENING", "Salam Pembuka", "input"],
            ["TEXT_QUOTE_SOURCE", "Sumber Kutipan", "input"],
            ["TEXT_SIGNATURE", "Tanda Tangan", "input"],
            ["TEXT_FAMILY", "Nama Keluarga", "input"],
            ["TEXT_GIFT_TITLE", "Judul Hadiah", "input"],
            ["TEXT_QUOTE_AR_RUM", "Kutipan Ar-Rum", "textarea"],
            ["TEXT_INVITATION", "Kalimat Undangan", "textarea"],
            ["TEXT_CLOSING", "Teks Penutup", "textarea"],
            ["TEXT_SALAM_CLOSING", "Salam Penutup", "input"],
            ["TEXT_GIFT_DESC", "Deskripsi Hadiah", "textarea"],
          ].map(([key, label, type]) => (
            <Field key={key} label={label} wide={type === "textarea"}>
              {type === "textarea" ? (
                <textarea rows={3} className={inputClass} value={rawConfig[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} />
              ) : (
                <input className={inputClass} value={rawConfig[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} />
              )}
            </Field>
          ))}
          <Field label="Warna Utama"><input type="color" className="h-12 w-full rounded-lg border" value={rawConfig.THEME_PRIMARY ?? "#0f172a"} onChange={(e) => handleChange("THEME_PRIMARY", e.target.value)} /></Field>
          <Field label="Warna Aksen"><input type="color" className="h-12 w-full rounded-lg border" value={rawConfig.THEME_ACCENT ?? "#7dd3fc"} onChange={(e) => handleChange("THEME_ACCENT", e.target.value)} /></Field>
          <Field label="Background"><input type="color" className="h-12 w-full rounded-lg border" value={rawConfig.THEME_BACKGROUND ?? "#fafaf9"} onChange={(e) => handleChange("THEME_BACKGROUND", e.target.value)} /></Field>
          <Field label="Font Style"><select className={inputClass} value={rawConfig.THEME_FONT_STYLE ?? "classic"} onChange={(e) => handleChange("THEME_FONT_STYLE", e.target.value)}><option value="classic">Classic</option><option value="modern">Modern</option><option value="romantic">Romantic</option></select></Field>
          <Field label="Dark Default"><select className={inputClass} value={rawConfig.THEME_DARK_DEFAULT ?? "false"} onChange={(e) => handleChange("THEME_DARK_DEFAULT", e.target.value)}><option value="false">Light</option><option value="true">Dark</option></select></Field>
          <Field label="Telegram Bot Token"><input className={inputClass} value={rawConfig.TELEGRAM_BOT_TOKEN ?? ""} onChange={(e) => handleChange("TELEGRAM_BOT_TOKEN", e.target.value)} /></Field>
          <Field label="Telegram Chat ID"><input className={inputClass} value={rawConfig.TELEGRAM_CHAT_ID ?? ""} onChange={(e) => handleChange("TELEGRAM_CHAT_ID", e.target.value)} /></Field>
          <Field label="Username Admin"><input className={inputClass} value={rawConfig.ADMIN_USERNAME ?? "admin"} onChange={(e) => handleChange("ADMIN_USERNAME", e.target.value)} /></Field>
          <Field label="Password Baru"><input type="password" className={inputClass} value={rawConfig.ADMIN_PASSWORD_NEW ?? ""} onChange={(e) => handleChange("ADMIN_PASSWORD_NEW", e.target.value)} placeholder="Kosongkan jika tidak diganti" /></Field>
        </div>
      </Section>

      <Section title="Backup & Restore" icon={FileArchive}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <a href="/api/backup" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white">
            <Download className="h-4 w-4" /> Export Backup
          </a>
          <input type="file" accept="application/json" onChange={(e) => setBackupFile(e.target.files?.[0] || null)} className={inputClass} />
          <button type="button" onClick={restoreBackup} className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white">
            Restore Backup
          </button>
        </div>
      </Section>

      <div className="flex justify-end pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 ${
            saved
              ? "bg-green-500"
              : "bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          }`}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? "Tersimpan!" : "Simpan Semua"}
        </button>
      </div>
    </div>
  );
};

const GuestManager: React.FC<{ siteUrl: string }> = ({ siteUrl }) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [csv, setCsv] = useState("");

  const loadGuests = async () => {
    const res = await fetch("/api/guests", { credentials: "include" });
    setGuests(await res.json());
  };

  useEffect(() => {
    loadGuests();
  }, []);

  const saveGuest = async () => {
    if (!form.name.trim()) return;
    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setForm({ name: "", phone: "", address: "", notes: "" });
    await loadGuests();
  };

  const importCsv = async () => {
    const guests = csv
      .split(/\r?\n/)
      .map((line) => line.split(",").map((item) => item.trim()))
      .filter(([name]) => name)
      .map(([name, phone = "", address = "", notes = ""]) => ({
        name,
        phone,
        address,
        notes,
      }));
    if (guests.length === 0) return;
    await fetch("/api/guests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ guests }),
    });
    setCsv("");
    await loadGuests();
  };

  const deleteGuest = async (id: number) => {
    if (!confirm("Hapus tamu ini?")) return;
    await fetch("/api/guests", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id }),
    });
    await loadGuests();
  };

  const exportCsv = () => {
    const rows = [["name", "slug", "phone", "address", "notes"], ...guests.map((g) => [g.name, g.slug, g.phone || "", g.address || "", g.notes || ""])];
    const content = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "wedding-guests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const base = siteUrl.replace(/\/$/, "");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="mb-4 font-serif text-xl font-bold italic">Tambah Tamu</h3>
        <div className="grid gap-3 md:grid-cols-4">
          <input className={inputClass} placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className={inputClass} placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className={inputClass} placeholder="Alamat" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button onClick={saveGuest} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white">
            <UserPlus className="h-4 w-4" /> Simpan
          </button>
          <textarea className={`${inputClass} md:col-span-4`} rows={2} placeholder="Catatan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-xl font-bold italic">Import / Export</h3>
          <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
        <textarea className={inputClass} rows={4} placeholder="Format CSV: Nama,Phone,Alamat,Catatan" value={csv} onChange={(e) => setCsv(e.target.value)} />
        <button onClick={importCsv} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">Import CSV</button>
      </div>

      <DataTable
        data={guests}
        columns={[
          { header: "Nama", accessor: "name", className: "font-medium" },
          { header: "Slug", accessor: "slug" },
          {
            header: "Link",
            accessor: (item) => {
              const url = `${base}/tamu/${item.slug}`;
              return (
                <button onClick={() => navigator.clipboard.writeText(url)} className="inline-flex items-center gap-2 rounded bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-700">
                  <Copy className="h-3 w-3" /> Copy
                </button>
              );
            },
          },
          { header: "Phone", accessor: (item) => item.phone || "-" },
        ]}
        onDelete={(id) => deleteGuest(id)}
      />
    </div>
  );
};

const UploadManager: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const loadFiles = async () => {
    const res = await fetch("/api/uploads", { credentials: "include" });
    setFiles(await res.json());
  };
  useEffect(() => {
    loadFiles();
  }, []);
  const deleteFile = async (file: any) => {
    const force = file.used
      ? confirm("File ini masih dipakai di setting. Tetap hapus?")
      : confirm("Hapus file ini?");
    if (!force) return;
    const res = await fetch("/api/uploads", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url: file.url, force: file.used }),
    });
    if (res.ok) await loadFiles();
    else alert("Gagal hapus file.");
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {files.length === 0 && (
        <div className="md:col-span-3 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-700 dark:bg-slate-800">
          Belum ada file upload.
        </div>
      )}
      {files.map((file) => (
        <div key={file.url} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          {file.type === "image" ? (
            <img src={file.url} alt={file.name} className="mb-3 h-40 w-full rounded-xl object-cover" />
          ) : (
            <div className="mb-3 flex h-40 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900">
              <Music className="h-10 w-10 text-slate-400" />
            </div>
          )}
          <p className="truncate text-sm font-bold">{file.name}</p>
          <p className="mt-1 text-xs text-slate-400">{Math.round(file.size / 1024)} KB {file.used ? "• dipakai" : ""}</p>
          {file.type === "audio" && <audio src={file.url} controls className="mt-3 w-full" />}
          <div className="mt-3 flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(file.url)} className="flex-1 rounded-lg border px-3 py-2 text-xs font-bold"><Copy className="mr-1 inline h-3 w-3" /> URL</button>
            <button onClick={() => deleteFile(file)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"><Trash2 className="h-3 w-3" /></button>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = ({
  initialRsvps,
  initialWishes,
  siteUrl,
}: {
  initialRsvps: RSVP[];
  initialWishes: Wish[];
  siteUrl: string;
}) => {
  const [activeTab, setActiveTab] = useState<
    "rsvp" | "wishes" | "guests" | "uploads" | "qr" | "pdf" | "settings"
  >("rsvp");
  const [rsvps, setRsvps] = useState(initialRsvps);
  const [wishes, setWishes] = useState(initialWishes);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (type: "rsvp" | "wish", ids: number[]) => {
    if (ids.length === 0) return;
    setIsDeleting(true);
    try {
      const actionKey = type === "rsvp" ? "delete_rsvp" : "delete_wish";
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionKey, ids }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (type === "rsvp")
          setRsvps((prev) => prev.filter((i) => !ids.includes(i.id)));
        if (type === "wish")
          setWishes((prev) => prev.filter((i) => !ids.includes(i.id)));
      } else {
        alert("Gagal menghapus: " + (json.error || "Unknown Error"));
      }
    } catch {
      alert("Error Network.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (type: "rsvp" | "wish", id: number, data: any) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type === "rsvp" ? "update_rsvp" : "update_wish",
          id,
          data,
        }),
      });
      if (res.ok) {
        if (type === "rsvp") {
          setRsvps((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...data } : item))
          );
        } else {
          setWishes((prev) =>
            prev.map((item) => (item.id === id ? { ...item, ...data } : item))
          );
        }
        setIsModalOpen(false);
      } else {
        alert("Gagal update data.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "rsvp", label: "Data RSVP", icon: Users },
    { id: "wishes", label: "Ucapan & Doa", icon: MessageCircle },
    { id: "guests", label: "Tamu", icon: UserPlus },
    { id: "uploads", label: "Upload", icon: Upload },
    { id: "qr", label: "QR Generator", icon: QrCode },
    { id: "pdf", label: "Design PDF", icon: Printer },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <div>
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-2xl">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="text-lg font-bold text-slate-700">
              Menghapus Data...
            </span>
          </div>
        </div>
      )}

      <div className="mb-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rsvp" && (
        <div className="animate-reveal space-y-6">
          <div className="flex justify-end">
            <a
              href="/api/export-rsvp"
              target="_blank"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-green-700"
            >
              <Download className="h-4 w-4" /> EXPORT CSV
            </a>
          </div>
          <DataTable
            data={rsvps}
            columns={[
              {
                header: "Nama Tamu",
                accessor: "guest_name",
                className: "font-medium",
              },
              {
                header: "Status",
                accessor: (item) => (
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                      item.attendance === "hadir"
                        ? "bg-green-100 text-green-700"
                        : item.attendance === "tidak_hadir"
                          ? "bg-red-100 text-red-700"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {item.attendance.replace("_", " ")}
                  </span>
                ),
              },
              { header: "Pax", accessor: "guest_count" },
              {
                header: "Pesan",
                accessor: (item) => (
                  <span className="block max-w-[200px] truncate text-slate-500">
                    {item.message}
                  </span>
                ),
              },
              {
                header: "Waktu",
                accessor: (item) =>
                  new Date(item.created_at).toLocaleDateString("id-ID"),
              },
            ]}
            onEdit={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onDelete={(id) => handleDelete("rsvp", [id])}
            onBulkDelete={(ids) => handleDelete("rsvp", ids)}
          />
        </div>
      )}

      {activeTab === "wishes" && (
        <div className="animate-reveal space-y-6">
          <div className="flex justify-end">
            <a
              href="/api/export-wishes"
              target="_blank"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
            >
              <Download className="h-4 w-4" /> EXPORT CSV
            </a>
          </div>
          <DataTable
            data={wishes}
            columns={[
              {
                header: "Nama Pengirim",
                accessor: "name",
                className: "font-medium",
              },
              {
                header: "Ucapan",
                accessor: (item) => (
                  <span className="block max-w-[300px] text-wrap text-slate-500 italic">
                    "{item.message}"
                  </span>
                ),
              },
              {
                header: "Waktu",
                accessor: (item) =>
                  new Date(item.created_at).toLocaleDateString("id-ID"),
              },
            ]}
            onEdit={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onDelete={(id) => handleDelete("wish", [id])}
            onBulkDelete={(ids) => handleDelete("wish", ids)}
          />
        </div>
      )}

      {activeTab === "guests" && (
        <div className="animate-reveal">
          <GuestManager siteUrl={siteUrl} />
        </div>
      )}

      {activeTab === "uploads" && (
        <div className="animate-reveal">
          <UploadManager />
        </div>
      )}

      {activeTab === "qr" && (
        <div className="animate-reveal rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <QRCodeManager siteUrl={siteUrl} />
        </div>
      )}

      {activeTab === "pdf" && (
        <div className="animate-reveal rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <InvitationManager siteUrl={siteUrl} />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="animate-reveal">
          <SettingsTab />
        </div>
      )}

      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold dark:text-white">Edit Data</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                handleUpdate(
                  activeTab === "rsvp" ? "rsvp" : "wish",
                  editingItem.id,
                  data
                );
              }}
              className="space-y-4"
            >
              {activeTab === "rsvp" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Nama Tamu
                    </label>
                    <input
                      name="guest_name"
                      defaultValue={editingItem.guest_name}
                      className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Status
                      </label>
                      <select
                        name="attendance"
                        defaultValue={editingItem.attendance}
                        className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      >
                        <option value="hadir">Hadir</option>
                        <option value="ragu">Ragu</option>
                        <option value="tidak_hadir">Tidak Hadir</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Pax
                      </label>
                      <input
                        type="number"
                        name="guest_count"
                        defaultValue={editingItem.guest_count}
                        min={1}
                        className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Pesan
                    </label>
                    <textarea
                      name="message"
                      defaultValue={editingItem.message}
                      className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Nama Pengirim
                    </label>
                    <input
                      name="name"
                      defaultValue={editingItem.name}
                      className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Ucapan
                    </label>
                    <textarea
                      name="message"
                      defaultValue={editingItem.message}
                      className="w-full rounded-lg border p-2 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                      rows={5}
                      required
                    />
                  </div>
                </>
              )}
              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.resolve(process.cwd(), "database");
const DB_FILE = path.join(DB_DIR, "wedding.db");
const OLD_DB_FILE = path.resolve(process.cwd(), "wedding.db");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

if (fs.existsSync(OLD_DB_FILE) && !fs.existsSync(DB_FILE)) {
  fs.renameSync(OLD_DB_FILE, DB_FILE);
}

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS rsvps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    phone TEXT,
    attendance TEXT,
    guest_count INTEGER,
    message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_credentials (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const DEFAULT_CONFIG: Record<string, string> = {
  BRIDE_NICKNAME: "Fey",
  BRIDE_FULLNAME: "Fera Oktapia",
  BRIDE_PARENTS: "Putri tercinta dari Bpk. [Nama Ayah] & Ibu [Nama Ibu]",
  BRIDE_INSTAGRAM: "feraoktapia___",
  BRIDE_IMAGE: "https://placehold.co/600x800?text=Fey+Portrait",
  GROOM_NICKNAME: "Yaya",
  GROOM_FULLNAME: "Yahya Zulfikri",
  GROOM_PARENTS: "Putra tercinta dari Bpk. [Nama Ayah] & Ibu [Nama Ibu]",
  GROOM_INSTAGRAM: "zulfikriyahya_",
  GROOM_IMAGE: "https://placehold.co/600x800?text=Yaya+Portrait",
  VENUE_NAME: "The Royal Azure Ballroom",
  VENUE_ADDRESS: "Jl. Taman Makam Pahlawan No.48, Kab. Pandeglang, Banten",
  GIFT_PHYSICAL_ADDRESS:
    "Jl. Taman Makam Pahlawan No.48, Kab. Pandeglang, Banten",
  VENUE_LAT: "-6.3032707",
  VENUE_LNG: "106.1011039",
  AKAD_TITLE: "Akad Nikah",
  AKAD_DAY: "Minggu",
  AKAD_DATE: "11 Oktober 2025",
  AKAD_START: "08:00",
  AKAD_END: "10:00",
  AKAD_ISO_START: "2025-10-11T08:00:00+07:00",
  AKAD_ISO_END: "2025-10-11T10:00:00+07:00",
  RESEPSI_TITLE: "Resepsi Pernikahan",
  RESEPSI_DAY: "Minggu",
  RESEPSI_DATE: "11 Oktober 2025",
  RESEPSI_START: "11:00",
  RESEPSI_END: "14:00",
  RESEPSI_ISO_START: "2025-10-11T11:00:00+07:00",
  RESEPSI_ISO_END: "2025-10-11T14:00:00+07:00",
  HERO_IMAGE:
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
  HERO_CITY: "Kab. Pandeglang, Banten",
  MUSIC_URL: "https://www.bensound.com/bensound-music/bensound-forever.mp3",
  RSVP_MAX_GUESTS: "20",
  BANK_ACCOUNTS: JSON.stringify([
    { bank: "Bank BCA", number: "1234567890", name: "Fera Oktapia" },
    { bank: "Bank Mandiri", number: "0987655432", name: "Yahya Zulfikri" },
  ]),
  LOVE_STORY: JSON.stringify([
    {
      date: "2020",
      title: "Awal Pertemuan",
      desc: "Atas izin Allah, kami dipertemukan dalam suasana yang sederhana namun penuh makna.",
    },
    {
      date: "2022",
      title: "Menjalin Harapan",
      desc: "Dengan niat baik, kami memutuskan untuk saling mengenal dan membangun komitmen menuju ridho-Nya.",
    },
    {
      date: "2025",
      title: "Ikatan Suci",
      desc: "Insya Allah, kami memantapkan hati untuk menyempurnakan separuh agama dalam ikatan pernikahan.",
    },
  ]),
  GALLERY_IMAGES: JSON.stringify([
    "https://placehold.co/800x1200?text=Moment+1",
    "https://placehold.co/1200x800?text=Moment+2",
    "https://placehold.co/800x800?text=Moment+3",
    "https://placehold.co/800x1200?text=Moment+4",
    "https://placehold.co/1200x800?text=Moment+5",
    "https://placehold.co/800x1200?text=Moment+6",
  ]),
  TEXT_SALAM_OPENING: "Assalamu'alaikum Warahmatullahi Wabarakatuh",
  TEXT_QUOTE_AR_RUM: `"Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."`,
  TEXT_QUOTE_SOURCE: "QS. Ar-Rum: 21",
  TEXT_INVITATION:
    "Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i, kawan, dan sahabat, untuk memberikan doa restu pada acara pernikahan kami:",
  TEXT_CLOSING:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kami.",
  TEXT_SALAM_CLOSING: "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
  TEXT_SIGNATURE: "Kami yang berbahagia,",
  TEXT_FAMILY: "Kel. Bpk [Ayah Pria] & Kel. Bpk [Ayah Wanita]",
  TEXT_GIFT_TITLE: "Tanda Kasih",
  TEXT_GIFT_DESC:
    "Kehadiran dan doa restu Anda adalah hadiah terbaik bagi kami. Namun, jika Anda ingin memberikan tanda kasih dalam bentuk lain, kami menerimanya dengan segala kerendahan hati.",
  TELEGRAM_BOT_TOKEN: "",
  TELEGRAM_CHAT_ID: "",
  THEME_PRIMARY: "#0f172a",
  THEME_ACCENT: "#7dd3fc",
  THEME_BACKGROUND: "#fafaf9",
  THEME_DARK_DEFAULT: "false",
  THEME_FONT_STYLE: "classic",
};

const insertDefault = db.prepare(
  "INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)"
);
const insertMany = db.transaction(() => {
  for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
    insertDefault.run(key, value);
  }
});
insertMany();

const hashPassword = (password: string, salt: string): string =>
  crypto.pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");

const defaultAdmin = db
  .prepare("SELECT id FROM admin_credentials WHERE id = 1")
  .get();

if (!defaultAdmin) {
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "P@ssw0rd";
  const salt = crypto.randomBytes(16).toString("hex");
  db.prepare(
    "INSERT INTO admin_credentials (id, username, password_hash, salt) VALUES (1, ?, ?, ?)"
  ).run(username, hashPassword(password, salt), salt);
}

export const getConfig = (): Record<string, string> => {
  const rows = db.prepare("SELECT key, value FROM config").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
};

export const setConfig = (key: string, value: string): void => {
  db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)").run(
    key,
    value
  );
};

export const verifyAdmin = (username: string, password: string): boolean => {
  const row = db
    .prepare(
      "SELECT username, password_hash, salt FROM admin_credentials WHERE id = 1"
    )
    .get() as
    | { username: string; password_hash: string; salt: string }
    | undefined;
  if (!row || row.username !== username) return false;
  const attempted = hashPassword(password, row.salt);
  return crypto.timingSafeEqual(
    Buffer.from(attempted, "hex"),
    Buffer.from(row.password_hash, "hex")
  );
};

export const updateAdminCredentials = (
  username: string,
  password?: string
): void => {
  const current = db
    .prepare("SELECT password_hash, salt FROM admin_credentials WHERE id = 1")
    .get() as { password_hash: string; salt: string } | undefined;
  const salt = password ? crypto.randomBytes(16).toString("hex") : current?.salt;
  const passwordHash =
    password && salt ? hashPassword(password, salt) : current?.password_hash;
  if (!salt || !passwordHash) throw new Error("Admin credential missing");
  db.prepare(
    `INSERT OR REPLACE INTO admin_credentials
      (id, username, password_hash, salt, updated_at)
     VALUES (1, ?, ?, ?, ?)`
  ).run(username, passwordHash, salt, new Date().toISOString());
};

export const getAdminUsername = (): string => {
  const row = db
    .prepare("SELECT username FROM admin_credentials WHERE id = 1")
    .get() as { username: string } | undefined;
  return row?.username || "admin";
};

export const getDbPath = () => DB_FILE;
export default db;

"use client";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: "user" | "lawyer" | "visitor";
  createdAt: string;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: UserAccount["role"];
  token: string;
  expiry: number;
}

const ACCOUNTS_KEY = "user_accounts";
const SESSION_KEY = "user_session";

function generateId(): string {
  return `u-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

/** SHA‑256 hash via Web Crypto API */
async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAccounts(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as UserAccount[]) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/** Register a new user account. Returns error string or null on success. */
export async function registerUser(
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserAccount["role"] = "user"
): Promise<string | null> {
  const accounts = getAccounts();
  if (accounts.find((a) => a.email === email)) {
    return "البريد الإلكتروني مسجل بالفعل";
  }
  const passwordHash = await hashPassword(password);
  accounts.push({
    id: generateId(),
    name,
    email,
    phone,
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  });
  saveAccounts(accounts);
  return null;
}

/** Log in with email + password. Returns true on success. Also grants admin panel access. */
export async function loginUser(email: string, password: string): Promise<boolean> {
  const accounts = getAccounts();
  const hash = await hashPassword(password);
  const user = accounts.find((a) => a.email === email && a.passwordHash === hash);
  if (!user) return false;
  const expiry = Date.now() + 1000 * 60 * 60 * 24;
  const token = crypto.randomUUID();
  const session: UserSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
    expiry,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // NOTE: Admin access should only be granted through admin-login, not user login
  return true;
}

/** Check if a user is currently logged in. */
export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as UserSession;
    return !!session.token && session.expiry > Date.now();
  } catch {
    return false;
  }
}

/** Get current user session, or null if not logged in. */
export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as UserSession;
    if (!session.token || session.expiry <= Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Log out the current user (clears both user and admin sessions). */
export function logoutUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("admin_session");
}

/** Seed initial demo accounts if none exist. Uses pre‑computed SHA‑256 hashes for demo passwords. */
export function seedDemoAccounts(): void {
  const accounts = getAccounts();
  if (accounts.length > 0) return;

  const demos: UserAccount[] = [
    {
      id: generateId(),
      name: "أحمد المحامي",
      email: "lawyer@qanuni.iq",
      phone: "+9647701112233",
      passwordHash: "1f650d62c28eab1cc5f7f3552a5b3cc900c0fb81a9be3fd1df96b7f593f7f00c",
      role: "lawyer",
      createdAt: "2025-06-01T00:00:00.000Z",
    },
    {
      id: generateId(),
      name: "سارة الزائر",
      email: "visitor@qanuni.iq",
      phone: "+9647801112233",
      passwordHash: "a4d8cdc9d06f1031d0b82f9e90d40bd9e358b53fbd89fec09e4557b328e8a850",
      role: "visitor",
      createdAt: "2025-06-15T00:00:00.000Z",
    },
  ];
  saveAccounts(demos);
}

// localStorage helpers with in-memory fallback (Safari private mode).

const memory = new Map<string, string>();

function get(key: string): string | null {
  try {
    const value = localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    // fall through to memory
  }
  return memory.get(key) ?? null;
}

function set(key: string, value: string): void {
  memory.set(key, value);
  try {
    localStorage.setItem(key, value);
  } catch {
    // memory already holds the value
  }
}

function remove(key: string): void {
  memory.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // memory already cleared
  }
}

export interface StoredParticipant {
  participantId: string;
  displayName: string;
}

const participantKey = (code: string) => `cp:participant:${code.toUpperCase()}`;
const ADMIN_TOKEN_KEY = "cp:admin-token";

export function getStoredParticipant(code: string): StoredParticipant | null {
  const raw = get(participantKey(code));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredParticipant>;
    if (typeof parsed.participantId === "string" && typeof parsed.displayName === "string") {
      return { participantId: parsed.participantId, displayName: parsed.displayName };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveParticipant(code: string, participant: StoredParticipant): void {
  set(participantKey(code), JSON.stringify(participant));
}

export function getAdminToken(): string | null {
  return get(ADMIN_TOKEN_KEY);
}

export function saveAdminToken(token: string): void {
  set(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken(): void {
  remove(ADMIN_TOKEN_KEY);
}

// localStorage helpers with in-memory fallback (Safari private mode).

const memory = new Map<string, string>();

function get(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function set(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    memory.delete(key);
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
    return JSON.parse(raw) as StoredParticipant;
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

export function buildJoinUrl(code: string): string {
  return `${window.location.origin}/join?code=${encodeURIComponent(code)}`;
}

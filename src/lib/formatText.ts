// Lightweight rich text for question bodies: **bold**, _italic_, and auto-linked URLs.
// Returns an HTML string so it can be dropped straight into the DOM where a question renders.
const URL_RE = /(https?:\/\/[^\s]+)/g;

export function formatText(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(URL_RE, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
}

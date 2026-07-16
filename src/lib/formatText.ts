// Lightweight rich text for question bodies: **bold**, _italic_, and auto-linked URLs.
// Returns an HTML string so it can be dropped straight into the DOM where a question renders.
// Only http(s) URLs are linked, so schemes like javascript: stay inert text.
const URL_RE = /(https?:\/\/[^\s]+)/g;

const ESCAPE_RE = /[&<>"']/g;
const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(input: string): string {
  return input.replace(ESCAPE_RE, (char) => ESCAPES[char]);
}

// Escaping must run before the formatting regexes: escaping afterwards would undo the
// <b>/<i>/<a> tags this function itself generates.
export function formatText(input: string): string {
  return escapeHtml(input)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(URL_RE, '<a href="$1" target="_blank" rel="noreferrer">$1</a>');
}

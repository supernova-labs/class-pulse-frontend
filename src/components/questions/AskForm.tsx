import { useState } from "react";

const MAX_LENGTH = 240;

interface AskFormProps {
  onSubmit: (body: string) => Promise<unknown>;
}

export function AskForm({ onSubmit }: AskFormProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = body.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setBody("");
    } catch {
      setError("Não foi possível enviar sua pergunta. Tente de novo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={MAX_LENGTH}
          placeholder="Escreva sua pergunta"
          aria-label="Escreva sua pergunta"
          className="min-w-0 flex-1 rounded-xl border border-surface bg-surface/40 px-4 py-3 placeholder:text-muted-strong focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!trimmed || sending}
          className="shrink-0 rounded-xl bg-accent px-5 py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Enviar
        </button>
      </div>
      <div className="flex justify-between text-xs text-muted-strong">
        {error ? <span className="text-danger">{error}</span> : <span />}
        {body.length > MAX_LENGTH - 60 && (
          <span>
            {body.length}/{MAX_LENGTH}
          </span>
        )}
      </div>
    </form>
  );
}

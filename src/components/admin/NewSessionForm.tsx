import { useState } from "react";
import { ApiError } from "../../api/client";
import { Spinner } from "../ui/Spinner";

interface NewSessionFormProps {
  hasActiveSession: boolean;
  onCreate: (name: string) => Promise<unknown>;
}

export function NewSessionForm({ hasActiveSession, onCreate }: NewSessionFormProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (hasActiveSession) {
    return (
      <p className="mt-2 text-sm text-muted-strong">Encerre a sessão ativa para criar uma nova.</p>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate(trimmed);
      setName("");
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? "Já existe uma sessão ativa — encerre-a primeiro."
          : "Não foi possível criar a sessão.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap gap-2">
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Nome da sessão (ex.: Workshop — turma 2)"
        aria-label="Nome da sessão"
        maxLength={120}
        className="min-w-0 flex-1 rounded-xl border border-surface bg-surface/40 px-4 py-2.5 text-sm placeholder:text-muted-strong focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={!name.trim() || busy}
        aria-busy={busy}
        className="flex shrink-0 items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {busy ? <Spinner /> : "+"} {busy ? "Criando…" : "Nova sessão"}
      </button>
      {error && (
        <p role="alert" className="w-full text-sm text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

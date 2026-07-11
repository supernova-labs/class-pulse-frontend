import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../api/client";
import { useParticipant } from "../hooks/useParticipant";

export default function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(searchParams.get("code")?.toUpperCase() ?? "");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const { join } = useParticipant(code);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || joining) return;
    setJoining(true);
    setError(null);
    try {
      await join(trimmedCode, name.trim() || undefined);
      navigate(`/s/${trimmedCode}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Código não encontrado. Confere com o telão?");
      } else if (err instanceof ApiError && err.status === 409) {
        setError("Essa sessão já foi encerrada.");
      } else {
        setError("Algo deu errado. Tente de novo.");
      }
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-90 rounded-3xl border border-surface bg-gradient-to-b from-surface/40 to-transparent p-8 shadow-[0_0_60px_rgb(124_108_255/0.08)]"
      >
        <h1 className="text-center text-3xl font-semibold">Class Pulse</h1>
        <p className="mt-2 text-center text-sm text-muted">Entre com o código do workshop</p>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
          placeholder="POR-8841"
          aria-label="Código do workshop"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="mt-6 w-full rounded-xl border border-surface bg-background/60 px-4 py-3 text-center font-mono text-lg tracking-[0.2em] placeholder:text-muted-strong focus:border-accent focus:outline-none"
        />
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome (opcional)"
          aria-label="Seu nome (opcional)"
          maxLength={60}
          className="mt-3 w-full rounded-xl border border-surface bg-background/60 px-4 py-3 text-center placeholder:text-muted-strong focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={!code.trim() || joining}
          className="mt-5 w-full rounded-xl bg-accent py-3 font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {joining ? "Entrando…" : "Entrar"}
        </button>
        <p className="mt-4 text-center text-xs text-muted-strong">
          Sem nome? Você aparece como “Guest”.
        </p>
      </form>
    </main>
  );
}

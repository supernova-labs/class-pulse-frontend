import { useState } from "react";
import { ApiError } from "../../api/client";
import { Spinner } from "../ui/Spinner";

interface AdminLoginProps {
  onLogin: (password: string) => Promise<void>;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onLogin(password);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? "Senha incorreta."
          : "Não foi possível conectar. Tente de novo.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-glow p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-90 rounded-3xl border border-surface bg-glow-card p-8"
      >
        <h1 className="text-center text-2xl font-semibold">
          Class Pulse <span className="font-normal text-muted">Gestão</span>
        </h1>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha de admin"
          aria-label="Senha de admin"
          className="mt-6 w-full rounded-xl border border-surface bg-background/60 px-4 py-3 text-center placeholder:text-muted-strong focus:border-accent focus:outline-none"
        />
        {error && (
          <p role="alert" className="mt-3 text-center text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={!password || busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-white shadow-[0_0_32px_rgb(124_108_255/0.25)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {busy && <Spinner />}
          Entrar
        </button>
      </form>
    </main>
  );
}

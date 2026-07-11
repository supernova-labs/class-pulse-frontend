import { useState } from "react";

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
    } catch {
      setError("Senha incorreta.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-90 rounded-3xl border border-surface bg-gradient-to-b from-surface/40 to-transparent p-8"
      >
        <h1 className="text-center text-2xl font-semibold">
          Class Pulse <span className="font-normal text-muted">Gestão</span>
        </h1>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Senha de admin"
          aria-label="Senha de admin"
          className="mt-6 w-full rounded-xl border border-surface bg-background/60 px-4 py-3 text-center placeholder:text-muted-strong focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-3 text-center text-sm text-danger">{error}</p>}
        <button
          type="submit"
          disabled={!password || busy}
          className="mt-5 w-full rounded-xl bg-accent py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}

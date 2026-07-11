import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <p className="font-mono text-muted">404</p>
      <p>Essa página não existe.</p>
      <Link to="/join" className="text-accent-soft underline">
        Ir para o início
      </Link>
    </main>
  );
}

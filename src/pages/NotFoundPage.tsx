import { Link } from "react-router";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <p className="font-mono text-muted">404</p>
      <h1 className="text-base font-normal">Essa página não existe.</h1>
      <Link to="/join" className="text-accent-soft underline">
        Ir para o início
      </Link>
    </main>
  );
}

import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // surface crashes during development; hook a monitoring service here later
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          role="alert"
          className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center"
        >
          <h1 className="text-xl font-semibold">Algo deu errado.</h1>
          <p className="text-sm text-muted">Recarregue a página para continuar.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-white"
          >
            Recarregar
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}

interface SpinnerProps {
  className?: string;
}

// loading spinner shown inside buttons during async actions
export function Spinner({ className = "" }: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={`inline-block size-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white ${className}`}
    />
  );
}

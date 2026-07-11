interface VoteButtonProps {
  votes: number;
  voted: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export function VoteButton({ votes, voted, disabled, onClick }: VoteButtonProps) {
  return (
    <button
      type="button"
      aria-label={voted ? "Remover voto" : "Votar"}
      aria-pressed={voted}
      disabled={disabled}
      onClick={onClick}
      className={`flex w-11 shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 font-mono text-sm transition-colors ${
        voted
          ? "border-accent bg-accent/20 text-accent-soft"
          : "border-surface text-muted hover:border-muted-strong"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span aria-hidden className="text-[10px] leading-none">
        ▲
      </span>
      <span className="leading-none">{votes}</span>
    </button>
  );
}

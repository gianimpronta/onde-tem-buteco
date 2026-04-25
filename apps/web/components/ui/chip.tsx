type ChipProps = {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
};

export function Chip({ active, children, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition",
        active
          ? "border-tinto-700 bg-tinto-700 text-primary-ink"
          : "border-line bg-surface-alt text-ink-soft hover:border-tinto-700 hover:text-ink",
      ].join(" ")}
    >
      {active && <span className="h-1.5 w-1.5 rounded-full bg-primary-ink" aria-hidden />}
      {children}
    </button>
  );
}

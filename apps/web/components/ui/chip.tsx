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
          ? "border-tinto-700 bg-tinto-700 text-primary-ink dark:border-brand dark:bg-surface-alt dark:text-brand"
          : "border-line bg-surface-alt text-ink-soft hover:border-tinto-700 hover:text-ink dark:hover:border-brand",
      ].join(" ")}
    >
      {active && (
        <span className="h-1.5 w-1.5 rounded-full bg-primary-ink dark:bg-brand" aria-hidden />
      )}
      {children}
    </button>
  );
}

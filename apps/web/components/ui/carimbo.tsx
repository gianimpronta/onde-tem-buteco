type CarimboProps = {
  nome: string;
  bairro?: string;
  numero?: string;
  size?: "lg" | "sm" | "xs";
  color?: "tinto" | "mostarda" | "mata";
};

const sizeConfig = {
  lg: { dim: "w-24 h-24", border: "border-2", title: "text-[13px]", rotate: "-rotate-6" },
  sm: { dim: "w-14 h-14", border: "border-2", title: "text-[8px]", rotate: "-rotate-3" },
  xs: { dim: "w-8 h-8", border: "border", title: "text-[6.5px]", rotate: "" },
};

const colorConfig = {
  tinto: "border-tinto-700 text-tinto-700 dark:border-brand dark:text-brand",
  mostarda: "border-mostarda-700 text-mostarda-700 dark:border-accent dark:text-accent",
  mata: "border-mata-700 text-mata-700 dark:border-positive dark:text-positive",
};

export function Carimbo({ nome, bairro, numero, size = "lg", color = "tinto" }: CarimboProps) {
  const { dim, border, title, rotate } = sizeConfig[size];
  const showDetails = size === "lg";
  return (
    <div
      className={[
        "relative flex flex-col items-center justify-center rounded-full text-center leading-none",
        dim,
        border,
        rotate,
        colorConfig[color],
      ].join(" ")}
      aria-label={`Carimbo: ${nome}`}
    >
      <span
        className="pointer-events-none absolute inset-1 rounded-full border border-dashed border-current opacity-70"
        aria-hidden
      />
      <span className={["font-display font-bold tracking-tight", title].join(" ")}>{nome}</span>
      {showDetails && bairro && (
        <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.15em]">{bairro}</span>
      )}
      {showDetails && numero && (
        <span className="mt-1 font-mono text-[9px] opacity-75">{numero}</span>
      )}
    </div>
  );
}

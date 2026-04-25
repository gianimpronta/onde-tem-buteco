type CarimboProps = {
  nome: string;
  bairro?: string;
  numero?: string;
  size?: "lg" | "sm" | "xs";
  color?: "tinto" | "mostarda" | "mata";
};

const sizeConfig = {
  lg: { dim: "w-24 h-24", text: "text-[11px]", rotate: "-rotate-6" },
  sm: { dim: "w-14 h-14", text: "text-[9px]", rotate: "-rotate-3" },
  xs: { dim: "w-8 h-8", text: "text-[6px]", rotate: "" },
};

const colorConfig = {
  tinto: "border-tinto-700 text-tinto-700",
  mostarda: "border-mostarda-700 text-mostarda-700",
  mata: "border-mata-700 text-mata-700",
};

export function Carimbo({
  nome,
  bairro,
  numero,
  size = "lg",
  color = "tinto",
}: CarimboProps) {
  const { dim, text, rotate } = sizeConfig[size];
  const showDetails = size === "lg";
  return (
    <div
      className={[
        "relative flex flex-col items-center justify-center rounded-full border-2 font-mono text-center leading-tight",
        dim,
        text,
        rotate,
        colorConfig[color],
      ].join(" ")}
      aria-label={`Carimbo: ${nome}`}
    >
      {showDetails && numero && <span className="font-bold">{numero}</span>}
      <span className="font-semibold">{nome}</span>
      {showDetails && bairro && <span className="opacity-70">{bairro}</span>}
    </div>
  );
}

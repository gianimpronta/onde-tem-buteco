import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const [session, { callbackUrl }] = await Promise.all([auth(), searchParams]);
  const safeCallbackUrl = callbackUrl?.startsWith("/") ? callbackUrl : "/";

  if (session) {
    redirect(safeCallbackUrl);
    return null;
  }

  const destination = safeCallbackUrl;

  return (
    <main className="grao flex min-h-screen items-center justify-center bg-cream-50">
      <div className="animate-fade-slide-up flex w-full max-w-[260px] flex-col items-center gap-6 px-6">
        {/* Logo */}
        <div
          className="grid flex-shrink-0 place-items-center rounded-[28px] shadow-[0_8px_24px_rgba(140,66,30,.35)]"
          style={{
            width: 120,
            height: 120,
            background: "linear-gradient(135deg, var(--mostarda-500), var(--terracota-500))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="Onde Tem Buteco" width={102} height={102} />
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-display text-2xl font-bold leading-[1.05] tracking-[-0.02em] text-breu-900">
            Continue o rolê de buteco.
          </h1>
          <p
            className="font-mono text-[11px] leading-[1.55]"
            style={{ color: "rgba(74,20,15,0.62)" }}
          >
            Favoritos, carimbos e roteiro —<br />
            sempre onde você parou.
          </p>
        </div>

        {/* Botão Google */}
        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: destination });
          }}
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-[10px] rounded-full border border-[#dadce0] bg-white px-4 py-[11px] shadow-[0_1px_4px_rgba(0,0,0,.12)] transition-shadow duration-150 hover:shadow-[0_2px_8px_rgba(0,0,0,.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tinto-700 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span
              className="text-[13px] font-medium tracking-[0.01em] text-[#3c4043]"
              style={{ fontFamily: "Roboto, ui-sans-serif, sans-serif" }}
            >
              Entrar com Google
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}

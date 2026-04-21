import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function Header() {
  const session = await auth();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <header className="rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Comida di Buteco
            </p>
            <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Onde Tem Buteco
            </p>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              href="/butecos"
              className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/20"
            >
              Ver botecos
            </Link>
            {session ? (
              <>
                <Link
                  href="/minha-conta"
                  className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-amber-600 dark:hover:bg-amber-900/20"
                >
                  Minha Conta
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
                  >
                    Sair
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
              >
                Login
              </Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
    </div>
  );
}

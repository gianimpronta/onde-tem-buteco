import Link from "next/link";
import { isE2EFixtureMode } from "@/lib/public-butecos";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default async function Header() {
  const session = isE2EFixtureMode() ? null : await import("@/lib/auth").then(({ auth }) => auth());

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-8">
      <header className="rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-wordmark.svg"
              alt="Onde Tem Buteco"
              height={48}
              className="h-12 w-auto"
            />
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
                    const { signOut } = await import("@/lib/auth");
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

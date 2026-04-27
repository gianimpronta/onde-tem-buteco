import Link from "next/link";
import { isE2EFixtureMode } from "@/lib/public-butecos";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button, buttonClassName } from "@/components/ui/button";

export default async function Header() {
  const session = isE2EFixtureMode() ? null : await import("@/lib/auth").then(({ auth }) => auth());

  return (
    <header className="w-full border-b border-line-soft bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <img src="/logo-wordmark.svg" height={32} alt="Onde tem buteco" className="h-8 w-auto" />
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/butecos"
            className="hidden font-body text-[14px] font-medium text-ink-soft transition hover:text-primary sm:inline"
          >
            Ver botecos
          </Link>
          {session ? (
            <>
              <Link
                href="/minha-conta"
                className="hidden font-body text-[14px] font-medium text-ink-soft transition hover:text-primary sm:inline"
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
                <Button type="submit" variant="ghost" size="sm">
                  Sair
                </Button>
              </form>
            </>
          ) : (
            <Link href="/login" className={buttonClassName({ variant: "primary", size: "sm" })}>
              Login
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

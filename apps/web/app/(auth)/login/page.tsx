import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button
          type="submit"
          className="px-6 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
        >
          Entrar com Google
        </button>
      </form>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

type ButecoActionPanelProps = {
  butecoId: string;
  loginHref: string;
  isAuthenticated: boolean;
  initialIsFavorito: boolean;
  initialIsVisitado: boolean;
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

async function mutateButecoAction(
  butecoId: string,
  action: "favoritar" | "desfavoritar" | "visitar"
) {
  const response = await fetch("/api/butecos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ butecoId, action }),
  });

  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Não foi possível atualizar a ação.");
  }
}

export default function ButecoActionPanel({
  butecoId,
  loginHref,
  isAuthenticated,
  initialIsFavorito,
  initialIsVisitado,
}: ButecoActionPanelProps) {
  const [isFavorito, setIsFavorito] = useState(initialIsFavorito);
  const [isVisitado, setIsVisitado] = useState(initialIsVisitado);
  const [pendingAction, setPendingAction] = useState<"favorito" | "visita" | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleFavoritoClick() {
    const action = isFavorito ? "desfavoritar" : "favoritar";
    setPendingAction("favorito");
    setFeedback(null);

    try {
      await mutateButecoAction(butecoId, action);
      setIsFavorito(!isFavorito);
      setFeedback({
        type: "success",
        message: isFavorito ? "Buteco removido dos favoritos." : "Buteco adicionado aos favoritos.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a ação.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function handleVisitaClick() {
    setPendingAction("visita");
    setFeedback(null);

    try {
      await mutateButecoAction(butecoId, "visitar");
      setIsVisitado(true);
      setFeedback({
        type: "success",
        message: "Visita registrada com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Não foi possível atualizar a ação.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Suas ações</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Salve este buteco ou registre que ele já entrou no seu roteiro.
      </p>

      {!isAuthenticated ? (
        <div className="mt-4">
          <Link
            href={loginHref}
            className="inline-flex rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600"
          >
            Faça login para favoritar e registrar visita
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleFavoritoClick}
            disabled={pendingAction !== null}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:border-amber-400 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-100 dark:hover:border-amber-500 dark:hover:bg-amber-950/40"
          >
            {isFavorito ? "Remover dos favoritos" : "Favoritar"}
          </button>
          <button
            type="button"
            onClick={handleVisitaClick}
            disabled={isVisitado || pendingAction !== null}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-800/70"
          >
            {isVisitado ? "Visitado" : "Marcar como visitado"}
          </button>
        </div>
      )}

      {feedback ? (
        <p
          className={`mt-3 text-sm ${
            feedback.type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}

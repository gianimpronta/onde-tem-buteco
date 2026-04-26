"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <section className="mt-8 rounded-[14px] border border-line-soft bg-surface-alt p-5">
      <h2 className="font-display text-[18px] font-semibold text-ink">Suas ações</h2>
      <p className="mt-1 font-body text-[14px] text-ink-soft">
        Salve este buteco ou registre que ele já entrou no seu roteiro.
      </p>

      {!isAuthenticated ? (
        <div className="mt-4">
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 font-body text-[14px] font-medium text-primary-ink transition hover:bg-terracota-600"
          >
            Faça login para favoritar e registrar visita
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="primary"
            onClick={handleVisitaClick}
            disabled={isVisitado || pendingAction !== null}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isVisitado ? "Visitado" : "Marcar como visitado"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleFavoritoClick}
            disabled={pendingAction !== null}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isFavorito ? "Remover dos favoritos" : "Favoritar"}
          </Button>
        </div>
      )}

      {feedback ? (
        <p
          className={`mt-3 font-body text-[13px] ${
            feedback.type === "error" ? "text-danger" : "text-positive"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  );
}

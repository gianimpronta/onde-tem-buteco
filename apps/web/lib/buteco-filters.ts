import type { Prisma } from "@/app/generated/prisma/client";

export type ButecoSearchFilters = {
  bairro?: string;
  cidade?: string;
  q?: string;
};

function normalizeFilterValue(value?: string): string | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue;
}

export function normalizeButecoFilters(filters: ButecoSearchFilters): ButecoSearchFilters {
  return {
    cidade: normalizeFilterValue(filters.cidade),
    bairro: normalizeFilterValue(filters.bairro),
    q: normalizeFilterValue(filters.q),
  };
}

export function buildButecoWhere(filters: ButecoSearchFilters): Prisma.ButecoWhereInput {
  const normalizedFilters = normalizeButecoFilters(filters);

  return {
    ...(normalizedFilters.cidade ? { cidade: normalizedFilters.cidade } : {}),
    ...(normalizedFilters.bairro ? { bairro: normalizedFilters.bairro } : {}),
    ...(normalizedFilters.q
      ? {
          OR: [
            { nome: { contains: normalizedFilters.q, mode: "insensitive" } },
            { petiscoNome: { contains: normalizedFilters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export function countActiveButecoFilters(filters: ButecoSearchFilters): number {
  const normalizedFilters = normalizeButecoFilters(filters);

  return [normalizedFilters.cidade, normalizedFilters.bairro, normalizedFilters.q].filter(Boolean)
    .length;
}

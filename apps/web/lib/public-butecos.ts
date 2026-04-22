import {
  buildButecoWhere,
  normalizeButecoFilters,
  type ButecoSearchFilters,
} from "@/lib/buteco-filters";

export type PublicButecoListItem = {
  slug: string;
  nome: string;
  cidade: string;
  bairro: string | null;
  petiscoNome: string | null;
};

export type PublicButecoMapItem = {
  slug: string;
  nome: string;
  bairro: string | null;
  lat: number;
  lng: number;
};

export type PublicButecoDetail = {
  slug: string;
  nome: string;
  cidade: string;
  bairro: string | null;
  endereco: string;
  telefone: string | null;
  horario: string | null;
  petiscoNome: string | null;
  petiscoDesc: string | null;
  fotoUrl: string | null;
};

type PublicButecoRecord = PublicButecoDetail & {
  lat: number | null;
  lng: number | null;
};

const e2eFixtureButecos: PublicButecoRecord[] = [
  {
    slug: "bar-do-zeca",
    nome: "Bar do Zeca",
    cidade: "Belo Horizonte",
    bairro: "Savassi",
    endereco: "Rua dos Testes, 123 - Savassi, Belo Horizonte - MG",
    telefone: "(31) 3333-1111",
    horario: "Seg a Sáb, 18h às 23h",
    petiscoNome: "Bolinho da Casa",
    petiscoDesc: "Bolinho crocante de carne com molho da casa.",
    fotoUrl: null,
    lat: -19.9385,
    lng: -43.9342,
  },
  {
    slug: "cantin-do-joao",
    nome: "Cantin do João",
    cidade: "Belo Horizonte",
    bairro: "Centro",
    endereco: "Av. Brasil, 456 - Centro, Belo Horizonte - MG",
    telefone: "(31) 3333-2222",
    horario: "Ter a Dom, 17h às 23h",
    petiscoNome: "Torresmo Mineiro",
    petiscoDesc: "Torresmo pururuca com limão e mandioca.",
    fotoUrl: null,
    lat: -19.9191,
    lng: -43.9386,
  },
  {
    slug: "esquina-da-celia",
    nome: "Esquina da Célia",
    cidade: "Contagem",
    bairro: "Eldorado",
    endereco: "Rua Principal, 789 - Eldorado, Contagem - MG",
    telefone: "(31) 3333-3333",
    horario: "Qua a Dom, 18h às 22h",
    petiscoNome: "Trem Bão",
    petiscoDesc: "Linguiça artesanal com mandioca cremosa.",
    fotoUrl: null,
    lat: -19.9321,
    lng: -44.0534,
  },
];

export function isE2EFixtureMode(): boolean {
  return process.env.E2E_USE_FIXTURES === "true";
}

function sortByName<T extends { nome: string }>(items: T[]): T[] {
  return [...items].sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}

function filterFixtureButecos(filters: ButecoSearchFilters): PublicButecoRecord[] {
  const normalizedFilters = normalizeButecoFilters(filters);
  const where = buildButecoWhere(normalizedFilters);

  return sortByName(e2eFixtureButecos).filter((buteco) => {
    if (where.cidade && buteco.cidade !== where.cidade) {
      return false;
    }

    if (where.bairro && buteco.bairro !== where.bairro) {
      return false;
    }

    if (!where.OR) {
      return true;
    }

    return where.OR.some((condition) => {
      const containsValue =
        "nome" in condition ? condition.nome?.contains : condition.petiscoNome?.contains;

      if (!containsValue) {
        return false;
      }

      const query = containsValue.toLocaleLowerCase("pt-BR");
      return (
        buteco.nome.toLocaleLowerCase("pt-BR").includes(query) ||
        buteco.petiscoNome?.toLocaleLowerCase("pt-BR").includes(query) === true
      );
    });
  });
}

export async function getHomeData() {
  if (isE2EFixtureMode()) {
    const butecosComMapa = sortByName(e2eFixtureButecos).flatMap((buteco) => {
      if (buteco.lat === null || buteco.lng === null) {
        return [];
      }

      return [
        {
          slug: buteco.slug,
          nome: buteco.nome,
          bairro: buteco.bairro,
          lat: buteco.lat,
          lng: buteco.lng,
        } satisfies PublicButecoMapItem,
      ];
    });

    return {
      total: e2eFixtureButecos.length,
      butecosComMapa,
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const [total, butecos] = await Promise.all([
    prisma.buteco.count(),
    prisma.buteco.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
      },
      orderBy: { nome: "asc" },
      select: {
        slug: true,
        nome: true,
        bairro: true,
        lat: true,
        lng: true,
      },
    }),
  ]);

  const butecosComMapa = butecos.flatMap((buteco) => {
    if (buteco.lat === null || buteco.lng === null) {
      return [];
    }

    return [{ ...buteco, lat: buteco.lat, lng: buteco.lng }];
  });

  return { total, butecosComMapa };
}

export async function getButecosPageData(filters: ButecoSearchFilters) {
  if (isE2EFixtureMode()) {
    const normalizedFilters = normalizeButecoFilters(filters);
    const filteredButecos = filterFixtureButecos(normalizedFilters);
    const cidades = [...new Set(e2eFixtureButecos.map((buteco) => buteco.cidade))].sort(
      (left, right) => left.localeCompare(right, "pt-BR")
    );
    const bairros = [
      ...new Set(
        e2eFixtureButecos
          .filter(
            (buteco) => !normalizedFilters.cidade || buteco.cidade === normalizedFilters.cidade
          )
          .flatMap((buteco) => (buteco.bairro ? [buteco.bairro] : []))
      ),
    ].sort((left, right) => left.localeCompare(right, "pt-BR"));

    return {
      cidades,
      bairros,
      butecos: filteredButecos.map(
        ({ slug, nome, cidade, bairro, petiscoNome }) =>
          ({
            slug,
            nome,
            cidade,
            bairro,
            petiscoNome,
          }) satisfies PublicButecoListItem
      ),
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const normalizedFilters = normalizeButecoFilters(filters);

  const [cidades, bairros, butecos] = await Promise.all([
    prisma.buteco.findMany({
      select: { cidade: true },
      distinct: ["cidade"],
      orderBy: { cidade: "asc" },
    }),
    prisma.buteco.findMany({
      where: {
        bairro: { not: null },
        ...(normalizedFilters.cidade ? { cidade: normalizedFilters.cidade } : {}),
      },
      select: { bairro: true },
      distinct: ["bairro"],
      orderBy: { bairro: "asc" },
    }),
    prisma.buteco.findMany({
      where: buildButecoWhere(normalizedFilters),
      orderBy: { nome: "asc" },
      select: {
        slug: true,
        nome: true,
        cidade: true,
        bairro: true,
        petiscoNome: true,
      },
    }),
  ]);

  return {
    cidades: cidades.map(({ cidade }) => cidade),
    bairros: bairros.flatMap(({ bairro }) => (bairro ? [bairro] : [])),
    butecos,
  };
}

export async function getButecoBySlug(slug: string): Promise<PublicButecoDetail | null> {
  if (isE2EFixtureMode()) {
    const buteco = e2eFixtureButecos.find((item) => item.slug === slug);

    if (!buteco) {
      return null;
    }

    return {
      slug: buteco.slug,
      nome: buteco.nome,
      cidade: buteco.cidade,
      bairro: buteco.bairro,
      endereco: buteco.endereco,
      telefone: buteco.telefone,
      horario: buteco.horario,
      petiscoNome: buteco.petiscoNome,
      petiscoDesc: buteco.petiscoDesc,
      fotoUrl: buteco.fotoUrl,
    };
  }

  const { prisma } = await import("@/lib/prisma");
  return prisma.buteco.findUnique({
    where: { slug },
  });
}

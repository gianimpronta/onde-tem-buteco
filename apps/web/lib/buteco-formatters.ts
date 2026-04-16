export function generateSlug(nome: string): string {
  const slug = nome
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-");

  let trimmedSlug = slug;

  while (trimmedSlug.startsWith("-")) {
    trimmedSlug = trimmedSlug.slice(1);
  }

  while (trimmedSlug.endsWith("-")) {
    trimmedSlug = trimmedSlug.slice(0, -1);
  }

  return trimmedSlug;
}

export function formatAddress(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");
}

export function formatPhone(phone?: string | null): string | null {
  if (!phone) return null;

  const digits = phone.replaceAll(/\D/g, "");

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone.trim() || null;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const safePage = Math.max(page, 1);
  const safePageSize = Math.max(pageSize, 1);
  const start = (safePage - 1) * safePageSize;

  return items.slice(start, start + safePageSize);
}

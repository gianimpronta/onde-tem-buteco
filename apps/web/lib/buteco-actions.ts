export type ButecoAction = "favoritar" | "desfavoritar" | "visitar";

const VALID_ACTIONS: readonly ButecoAction[] = [
  "favoritar",
  "desfavoritar",
  "visitar",
];

export function isValidAction(action: string): action is ButecoAction {
  return (VALID_ACTIONS as readonly string[]).includes(action);
}

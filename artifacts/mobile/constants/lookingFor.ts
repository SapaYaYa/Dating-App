export const LOOKING_FOR_OPTIONS = [
  "Men",
  "Women",
  "Non-binary",
  "Trans Men",
  "Trans Women",
  "Everyone",
] as const;

export type LookingForOption = (typeof LOOKING_FOR_OPTIONS)[number];

export const DEFAULT_LOOKING_FOR: LookingForOption[] = ["Everyone"];

export function normalizeLookingFor(values?: readonly string[]): LookingForOption[] {
  if (!values?.length || values.includes("Everyone")) {
    return [...DEFAULT_LOOKING_FOR];
  }

  const valid = LOOKING_FOR_OPTIONS.filter(
    (option) => option !== "Everyone" && values.includes(option),
  );

  return valid.length > 0 ? valid : [...DEFAULT_LOOKING_FOR];
}

export function toggleLookingForSelection(
  selected: readonly string[],
  option: LookingForOption,
): LookingForOption[] {
  if (option === "Everyone") {
    return [...DEFAULT_LOOKING_FOR];
  }

  const current = normalizeLookingFor(selected).filter(
    (value) => value !== "Everyone",
  );
  const next = current.includes(option)
    ? current.filter((value) => value !== option)
    : [...current, option];

  return next.length > 0 ? next : [...DEFAULT_LOOKING_FOR];
}
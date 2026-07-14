const UNIT_MS: Record<string, number> = {
  min: 60_000,
  minute: 60_000,
  hr: 3_600_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
  month: 2_629_800_000,
  year: 31_557_600_000,
};

/** Parses "30 mins ago" / "2 hours ago" / "3 days ago" into an approximate
 *  ISO timestamp — the relative-time format most Madara-family sites show
 *  in their chapter lists instead of an absolute date. */
export function parseRelativeAgo(text: string, now = Date.now()): string | undefined {
  const match = text.trim().match(/^(\d+)\s+([a-z]+?)s?\s+ago$/i);
  if (!match) return undefined;
  const amount = Number.parseInt(match[1], 10);
  const unitMs = UNIT_MS[match[2].toLowerCase()];
  if (!unitMs) return undefined;
  return new Date(now - amount * unitMs).toISOString();
}

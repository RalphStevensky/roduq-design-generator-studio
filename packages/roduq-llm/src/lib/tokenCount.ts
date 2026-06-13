/**
 * Rough token estimate (~4 chars/token heuristic). Good enough for budgeting
 * and Mock usage; real per-provider tokenizers are a later refinement.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/** Split a string into chunks of at most `size` chars (for chunked streaming). */
export function chunkString(text: string, size: number): string[] {
  if (size <= 0) return [text];
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) {
    out.push(text.slice(i, i + size));
  }
  return out.length > 0 ? out : [""];
}

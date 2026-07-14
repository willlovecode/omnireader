// Minimal <p>-tag splitter for the plain, sanitized HTML the Source interface
// promises (see ChapterContent in Source.ts). Not a general HTML renderer —
// real source content may need one; deferred until step 3+ when there's
// actual source HTML to test against.
export function htmlToParagraphs(html: string): string[] {
  return html
    .split(/<\/p>/i)
    .map((chunk) => chunk.replace(/<[^>]+>/g, '').trim())
    .filter((text) => text.length > 0);
}

import slugify from 'slugify';
import { customAlphabet } from 'nanoid';

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export function makeSlug(parts: Array<string | undefined | null>): string {
  const base = parts
    .filter(Boolean)
    .map((p) =>
      slugify(String(p), {
        lower: true,
        strict: true, // remove punctuation
        locale: 'tr',
        trim: true,
      })
    )
    .filter(Boolean)
    .join('-')
    .replace(/-+/g, '-'); // collapse multiple dashes

  return `${base}-${nano()}`; // ensures uniqueness
}

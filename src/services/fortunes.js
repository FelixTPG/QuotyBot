import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fortunes use the classic Unix `fortune` format: entries separated by a line
// containing only "%", with an optional trailing attribution line ("-- Author").
// Same source tradition as the Nothing "Fortunes" community widget (the
// bmc/fortunes database, CC BY 4.0) — drop more such files in to extend it.
const FORTUNES = readFileSync(join(__dirname, 'fortunes.txt'), 'utf8')
  .replace(/\r/g, '')
  .split(/^%$/m)
  .map(block => block.trim())
  .filter(Boolean)
  .map(parseEntry);

function parseEntry(block) {
  const lines = block.split('\n');
  // Attribution lines start with a dash run — any kind (-- , —, ―, –). \p{Pd}
  // covers every Unicode dash, so it works across fortune files.
  const attribution = lines.length > 1 && lines.at(-1).match(/^\s*\p{Pd}{1,3}\s+(.+)$/u);
  const body = (attribution ? lines.slice(0, -1) : lines).join('\n');
  return { text: reflow(body).trim(), author: attribution ? attribution[1].trim() : null };
}

// Source files hard-wrap prose at a fixed margin. Reflow those wraps back into
// continuous paragraphs, but keep intentional breaks: blank lines (paragraphs),
// short lines (poems/lists) and aligned text (tables/ASCII art) are left as-is.
function reflow(text) {
  const lines = text.split('\n');
  let out = lines[0] ?? '';
  for (let i = 1; i < lines.length; i++) {
    const prev = lines[i - 1];
    const cur = lines[i];
    const wrapped =
      prev.trim().length >= 45 && // previous line ran to the margin
      cur.trim().length > 0 && // current line has content
      !/\S {2,}\S/.test(prev) && // neither line is intentionally spaced
      !/\S {2,}\S/.test(cur);
    out += wrapped ? ` ${cur.trim()}` : `\n${cur}`;
  }
  return out;
}

export function getFortune() {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
}

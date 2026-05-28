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
  if (attribution) {
    return { text: lines.slice(0, -1).join('\n').trim(), author: attribution[1].trim() };
  }
  return { text: block, author: null };
}

export function getFortune() {
  return FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
}

const BASE_URL = (process.env.QUOTABLE_API_URL || 'https://api.quotable.io').replace(/\/$/, '');

// Fetches a random quote from the Quotable API.
//
// Uses /quotes/random (the non-deprecated endpoint), which returns an *array*
// of quote objects. Quote object shape:
//   { _id, content, author, authorSlug, length, tags[] }
// Useful query params (not used here, but available): limit (1-50), minLength,
// maxLength, tags ("a,b" = AND, "a|b" = OR), author (name/slug, pipe-separated).
//
// The legacy /random endpoint returns a single object instead of an array, so
// we tolerate both shapes in case QUOTABLE_API_URL points at an older mirror.
export async function getFortune() {
  const res = await fetch(`${BASE_URL}/quotes/random`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(2500),
  });
  if (!res.ok) throw new Error(`Quotable responded ${res.status}`);

  const data = await res.json();
  const quote = Array.isArray(data) ? data[0] : data;
  if (!quote?.content) throw new Error('Unexpected Quotable response');

  return { text: quote.content, author: quote.author || 'Unknown' };
}

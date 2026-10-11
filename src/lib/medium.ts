/**
 * Medium RSS → posts, at build time. Dependency-free so it also runs under plain Node
 * (see scripts/refresh-medium-cache.ts).
 *
 * Medium's feed only contains your ~10 most recent posts, so fetched posts are merged with the
 * cached JSON (deduped by URL). Older posts therefore stay listed as long as they are in the cache.
 */

export interface Post {
  title: string;
  url: string;
  /** ISO 8601 */
  date: string;
  excerpt: string;
  tags: string[];
}

const EXCERPT_LENGTH = 180;

const ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

/** Remove tags, scripts, figures and captions; collapse whitespace. */
export function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<(script|style|figure|figcaption|pre|h[1-6])[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(p|h\d|li|blockquote)>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max = EXCERPT_LENGTH): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 20)).replace(/[\s.,;:!?—–-]+$/, '')}…`;
}

/** Read one tag's text content (handles CDATA). */
function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  const cdata = m[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return cdata ? cdata[1] : decodeEntities(m[1]);
}

function allTags(xml: string, name: string): string[] {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'gi');
  return [...xml.matchAll(re)].map((m) => m[1].replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '').trim());
}

/** Drop Medium's tracking query string (?source=rss-…). */
function cleanUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.search = '';
    return u.toString();
  } catch {
    return url.trim();
  }
}

export function parseFeed(xml: string): Post[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items
    .map((item) => {
      const title = stripHtml(tag(item, 'title'));
      const html = tag(item, 'content:encoded') || tag(item, 'description');
      // Medium often repeats the title as the first heading; drop it from the excerpt.
      let text = stripHtml(html);
      if (title && text.startsWith(title)) text = text.slice(title.length).trim();
      const date = new Date(tag(item, 'pubDate') || tag(item, 'atom:updated'));
      return {
        title,
        url: cleanUrl(tag(item, 'link') || tag(item, 'guid')),
        date: Number.isNaN(date.valueOf()) ? new Date(0).toISOString() : date.toISOString(),
        excerpt: truncate(text),
        tags: allTags(item, 'category'),
      } satisfies Post;
    })
    .filter((p) => p.title && p.url);
}

export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

/** Union by URL; `primary` wins on conflicts. */
export function mergePosts(primary: Post[], secondary: Post[]): Post[] {
  const map = new Map<string, Post>();
  for (const p of secondary) map.set(p.url, p);
  for (const p of primary) map.set(p.url, p);
  return sortPosts([...map.values()]);
}

export async function fetchFeed(username: string, timeoutMs = 10_000): Promise<Post[]> {
  const handle = username.replace(/^@/, '');
  const res = await fetch(`https://medium.com/feed/@${encodeURIComponent(handle)}`, {
    headers: { 'user-agent': 'Mozilla/5.0 (portfolio build; +https://astro.build)', accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  if (!/<rss[\s>]/i.test(xml)) throw new Error('response is not an RSS feed');
  return parseFeed(xml);
}

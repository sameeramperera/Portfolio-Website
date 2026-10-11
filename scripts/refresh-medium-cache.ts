/**
 * Fetch the Medium feed and merge it into src/data/medium-cache.json.
 * Run with: npm run medium:refresh   (Node ≥ 22.18, which runs TypeScript natively)
 * Commit the updated JSON so older posts (beyond Medium's ~10-item feed) stay listed.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { mediumUsername } from '../src/config.ts';
import { fetchFeed, mergePosts, type Post } from '../src/lib/medium.ts';

const file = new URL('../src/data/medium-cache.json', import.meta.url);
const current = JSON.parse(await readFile(file, 'utf8'));
// Drop the shipped placeholder entries once real data arrives.
const existing = (current.posts as Post[]).filter((p) => !p.url.includes('/@your-username/'));

const fresh = await fetchFeed(mediumUsername);
const posts = mergePosts(fresh, existing);

await writeFile(
  file,
  `${JSON.stringify({ _comment: current._comment, updated: new Date().toISOString(), posts }, null, 2)}\n`,
);
console.log(`Fetched ${fresh.length}, cache now holds ${posts.length} posts.`);

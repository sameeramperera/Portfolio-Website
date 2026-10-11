import { mediumUsername } from '@/config';
import cache from '@/data/medium-cache.json';
import { fetchFeed, mergePosts, sortPosts, type Post } from './medium';

let pending: Promise<Post[]> | undefined;

/**
 * All Medium posts, newest first. Fetched once per build and shared by every page.
 * Never throws: if Medium is unreachable the cached JSON is used instead.
 */
export function getPosts(): Promise<Post[]> {
  pending ??= (async () => {
    const cached = sortPosts(cache.posts as Post[]);
    try {
      const fresh = await fetchFeed(mediumUsername);
      console.log(`[medium] fetched ${fresh.length} posts for @${mediumUsername}`);
      return mergePosts(fresh, cached);
    } catch (err) {
      console.warn(`[medium] fetch failed (${(err as Error).message}); using ${cached.length} cached posts`);
      return cached;
    }
  })();
  return pending;
}

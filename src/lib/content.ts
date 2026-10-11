import { getCollection } from 'astro:content';

export async function getProjects() {
  const all = await getCollection('projects', ({ data }) => !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Current roles first, then by start date, newest first. */
export async function getExperience() {
  const all = await getCollection('experience');
  return all.sort((a, b) => (b.data.end ?? '9999').localeCompare(a.data.end ?? '9999') || b.data.start.localeCompare(a.data.start));
}

/** Ongoing first, then newest first. */
export async function getEducation() {
  const all = await getCollection('education');
  return all.sort((a, b) => (b.data.end ?? '9999').localeCompare(a.data.end ?? '9999') || b.data.start.localeCompare(a.data.start));
}

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** One Markdown file per role in src/content/experience/. */
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    role: z.string(),
    company: z.string(),
    companyUrl: z.url().optional(),
    location: z.string(),
    /** "YYYY-MM" */
    start: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM'),
    /** "YYYY-MM", or omit for a current role. */
    end: z.string().regex(/^\d{4}-\d{2}$/, 'Use YYYY-MM').optional(),
    highlights: z.array(z.string()).max(6).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

/** One Markdown file per degree / course in src/content/education/. */
const education = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/education' }),
  schema: z.object({
    qualification: z.string(),
    institution: z.string(),
    institutionUrl: z.url().optional(),
    location: z.string().optional(),
    /** "YYYY" or "YYYY-MM" */
    start: z.string().regex(/^\d{4}(-\d{2})?$/, 'Use YYYY or YYYY-MM'),
    /** "YYYY" or "YYYY-MM", or omit if still studying. */
    end: z.string().regex(/^\d{4}(-\d{2})?$/, 'Use YYYY or YYYY-MM').optional(),
    /** e.g. "First Class Honours", "GPA 3.8/4.0" */
    grade: z.string().optional(),
    highlights: z.array(z.string()).max(6).default([]),
  }),
});

/** One Markdown file per project in src/content/projects/. The body renders on /projects/<slug>. */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    github: z.url().optional(),
    live: z.url().optional(),
    /** Company the project was built for/with. Omit for a personal project. */
    company: z.string().nullish(),
    companyUrl: z.url().optional(),
    /** Show on the home page. */
    featured: z.boolean().default(false),
    /** Lower numbers sort first. */
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { experience, education, projects };

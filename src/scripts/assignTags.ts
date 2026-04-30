import { db } from '../db/index.js';
import { resourceTags } from '../db/schema/resourceTags.js';
import { resourceTagsResources } from '../db/schema/resourceTagsResources.js';

const resourceTagMap: Record<string, string[]> = {
  // Build a CRUD Rest API with Node.js, Express, PostgreSQL
  '088c6fa4-fa81-4427-adff-ffa1da3804e9': ['Node.js', 'REST API', 'database'],

  // TanStack Start Full Course
  '306695be-5a4a-46eb-a442-051138c303be': ['React', 'TypeScript', 'JavaScript'],

  // Full Stack Code Snippet App - React, Next.js
  '3a7247cf-a7d2-4559-aa7f-ca01700f7f07': ['React', 'TypeScript', 'JavaScript'],

  // TanStack Query masterclass
  '81a83eb6-2df0-40b4-9e13-404de7fd778f': ['React', 'JavaScript'],

  // Complete Backend One Shot - Node, Express, MongoDB
  'a42e3e22-c97d-4e4e-a64c-d727804f1ecc': ['Node.js', 'REST API', 'database'],

  // React Native Crash Course
  'a4b152fb-e460-4186-abfd-241afadcf068': ['React', 'JavaScript'],

  // Real-Time Messenger Clone - Next.js
  'a627a661-3da8-41e5-b971-8e9de3069e8d': [
    'React',
    'TypeScript',
    'authentication',
    'database',
  ],

  // Git for Beginner playlist
  'bdf513b5-abd2-4966-8a0d-ce0bcf7d4d77': ['git'],

  // MERN Authentication System
  'c1058c74-fd2d-4a29-88cd-9c6bf413437a': [
    'Node.js',
    'authentication',
    'JavaScript',
  ],

  // 40 Days of JavaScript
  'c572dc12-47b7-4b77-88f5-b8dab7f18674': ['JavaScript', 'async'],

  // Let's go with golang
  'c6e09925-0678-4b0d-804e-992f14df8aae': ['Go'],

  // TanStack Router Tutorial
  'e0cc74c3-2aac-46a2-8cf7-8b42fa017847': ['React', 'TypeScript', 'JavaScript'],

  // Master Rate Limiting - System Design
  'e8b2f3d6-26bf-4f7f-b689-2d27d996f14b': ['Node.js', 'JavaScript'],

  // Complete Authentication System - JWT
  'e91ad7c2-f2f5-42d3-aa94-5bc7b965cd33': ['Node.js', 'authentication'],

  // Tailwind Series 2025
  'ecfe01f4-793a-49e1-9838-053104491c62': ['Tailwind', 'CSS'],
};

async function seedResourceTagResources() {
  const allTags = await db.select().from(resourceTags);
  const tagByName = Object.fromEntries(allTags.map((t) => [t.name, t.id]));

  const rows = Object.entries(resourceTagMap).flatMap(
    ([resourceId, tagNames]) =>
      tagNames
        .filter((name) => tagByName[name])
        .map((name) => ({
          resourceId,
          resourceTagsId: tagByName[name] as string,
        }))
  );

  await db.insert(resourceTagsResources).values(rows);
}

seedResourceTagResources();

import { db } from '../db';
import { tags } from '../db/schema';

const tagsArray = [
  { name: 'beginner-friendly', displayName: 'Beginner Friendly' },
  { name: 'intermediate', displayName: 'Intermediate' },
  { name: 'advanced', displayName: 'Advanced' },
  { name: 'well-explained', displayName: 'Well Explained' },
  { name: 'confusing', displayName: 'Confusing' },
  { name: 'outdated', displayName: 'Outdated' },
  { name: 'updated', displayName: 'Updated' },
  { name: 'deep-dive', displayName: 'Deep Dive' },
  { name: 'project-based', displayName: 'Project Based' },
  { name: 'theory-focused', displayName: 'Theory Focused' },
];

async function createTags() {
  await db.insert(tags).values(tagsArray);
}

createTags();

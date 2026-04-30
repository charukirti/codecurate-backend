import { db } from '../db/index.js';
import { resourceTags } from '../db/schema/resourceTags.js';
import { resourceTagsSynonyms } from '../db/schema/resourceTagsSynonyms.js';

const resourceTagsArray = [
  { name: 'JavaScript' },
  { name: 'TypeScript' },
  { name: 'React' },
  { name: 'Node.js' },
  { name: 'Python' },
  { name: 'Rust' },
  { name: 'Go' },
  { name: 'Java' },
  { name: 'C' },
  { name: 'C++' },
  { name: 'C#' },
  { name: 'HTML' },
  { name: 'CSS' },
  { name: 'Tailwind' },
  { name: 'async' },
  { name: 'REST API' },
  { name: 'database' },
  { name: 'authentication' },
  { name: 'testing' },
  { name: 'git' },
];

const synonymsMap: Record<string, string[]> = {
  JavaScript: ['js', 'es6', 'es2015', 'ecmascript', 'vanilla js'],
  TypeScript: ['ts'],
  React: ['reactjs', 'react.js'],
  'Node.js': ['node', 'nodejs', 'backend js'],
  Python: ['py'],
  Rust: ['rs'],
  Go: ['golang'],
  Java: ['jvm'],
  'C++': ['cpp', 'c plus plus'],
  'C#': ['csharp', 'dotnet', '.net'],
  HTML: ['html5', 'markup'],
  CSS: ['css3', 'styling', 'styles'],
  Tailwind: ['tailwindcss', 'tailwind css'],
  async: ['asynchronous', 'promises', 'async await', 'callbacks'],
  'REST API': ['rest', 'api', 'http'],
  database: ['db', 'sql', 'query'],
  authentication: ['auth', 'jwt', 'login', 'oauth'],
  testing: ['test', 'unit test', 'jest', 'vitest'],
  git: ['github', 'version control'],
};

async function seedResourceTags() {
  const inserted = await db
    .insert(resourceTags)
    .values(resourceTagsArray)
    .returning();

  const synonymRows = inserted.flatMap((tag) => {
    const synonyms = synonymsMap[tag.name] ?? [];
    return synonyms.map((synonym) => ({ tag_id: tag.id, synonyms: synonym }));
  });

  if (synonymRows.length > 0) {
    await db.insert(resourceTagsSynonyms).values(synonymRows);
  }
}

seedResourceTags();

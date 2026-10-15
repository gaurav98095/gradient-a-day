import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const notesDir = new URL('./notes/', import.meta.url);
const files = (await readdir(notesDir)).filter(file => file.endsWith('.md')).sort().reverse();
await writeFile(join(notesDir.pathname, 'index.json'), JSON.stringify({ files }, null, 2) + '\n');
console.log(`Indexed ${files.length} Markdown note${files.length === 1 ? '' : 's'}.`);

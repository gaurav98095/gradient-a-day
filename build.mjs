import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const notesDir = new URL('./notes/', import.meta.url);
async function findMarkdownFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes:true });
  const files = [];
  for (const entry of entries) {
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await findMarkdownFiles(new URL(`${entry.name}/`, directory), relativePath));
    else if (entry.name.endsWith('.md')) files.push(relativePath);
  }
  return files;
}

const files = (await findMarkdownFiles(notesDir)).sort().reverse();
await writeFile(join(notesDir.pathname, 'index.json'), JSON.stringify({ files }, null, 2) + '\n');
console.log(`Indexed ${files.length} Markdown note${files.length === 1 ? '' : 's'}.`);

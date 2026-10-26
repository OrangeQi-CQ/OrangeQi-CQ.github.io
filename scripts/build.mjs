import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const notesRoot = join(root, 'notes');
const decodeEntities = (value) => value.replace(/&(?:amp|lt|gt|quot|#39|#\d+|#x[\da-f]+);/gi, (entity) => {
  const named = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
  if (named[entity.toLowerCase()]) return named[entity.toLowerCase()];
  const code = entity[2].toLowerCase() === 'x' ? Number.parseInt(entity.slice(3, -1), 16) : Number.parseInt(entity.slice(2, -1), 10);
  return Number.isInteger(code) && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
});

const readMeta = (html, name) => {
  for (const [, rawAttributes] of html.matchAll(/<meta\b([^>]*)>/gi)) {
    const attributes = Object.fromEntries([...rawAttributes.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)]
      .map(([, key, doubleQuoted, singleQuoted, unquoted]) => [key.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted]));
    if (attributes.name?.toLowerCase() === name.toLowerCase()) return decodeEntities(attributes.content || '').trim();
  }
  return '';
};

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }
  return files;
};

const topicConfig = JSON.parse(await readFile(join(root, 'data', 'topics.json'), 'utf8'));
const topicIds = new Set(topicConfig.topics.map((topic) => topic.id));
const notes = [];
const aliases = [];

for (const file of (await walk(notesRoot)).sort()) {
  const html = await readFile(file, 'utf8');
  const title = readMeta(html, 'note:title');
  const topic = readMeta(html, 'note:topic');
  const date = readMeta(html, 'note:date');
  const updated = readMeta(html, 'note:updated');
  const summary = readMeta(html, 'note:summary');
  const tags = readMeta(html, 'note:tags').split(',').map((tag) => tag.trim()).filter(Boolean);
  const relativePath = relative(notesRoot, file).split(sep).join('/');
  if (!title || !topic || !updated || !summary) throw new Error(`Missing note metadata: notes/${relativePath}`);
  if (!topicIds.has(topic)) throw new Error(`Unknown topic "${topic}": notes/${relativePath}`);
  for (const [label, value] of [['date', date], ['updated', updated]]) {
    if (!value && label === 'date') continue;
    const parsedDate = new Date(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== value) {
      throw new Error(`Invalid ${label} "${value}": notes/${relativePath}`);
    }
  }
  if (summary.length > 220) throw new Error(`Summary exceeds 220 characters: notes/${relativePath}`);
  const textContent = decodeEntities(html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  notes.push({ title, topic, date, updated, summary, tags, path: relativePath, featured: readMeta(html, 'note:featured') === 'true', content: textContent });

  const legacyPath = readMeta(html, 'note:path').replaceAll('\\', '/');
  if (legacyPath && legacyPath !== relativePath && !legacyPath.startsWith('/') && !legacyPath.split('/').includes('..')) {
    aliases.push({ legacyPath, targetPath: `notes/${relativePath}` });
  }
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, 'index.html'), join(dist, 'index.html'));
await cp(join(root, 'assets'), join(dist, 'assets'), { recursive: true });
await cp(join(root, 'data'), join(dist, 'data'), { recursive: true });
await cp(notesRoot, join(dist, 'notes'), { recursive: true });
await cp(join(root, 'CNAME'), join(dist, 'CNAME'));

const noteIndex = { domains: topicConfig.domains, topics: topicConfig.topics, notes };
await writeFile(join(dist, 'data', 'notes.json'), `${JSON.stringify(noteIndex, null, 2)}\n`);
for (const { legacyPath, targetPath } of aliases) {
  const aliasFile = resolve(dist, legacyPath);
  if (!aliasFile.startsWith(`${dist}${sep}`)) throw new Error(`Unsafe legacy path: ${legacyPath}`);
  const redirect = relative(dirname(aliasFile), join(dist, targetPath)).split(sep).map((part) => part === '..' || part === '.' ? part : encodeURIComponent(part)).join('/');
  await mkdir(dirname(aliasFile), { recursive: true });
  await writeFile(aliasFile, `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${redirect}"><link rel="canonical" href="/${targetPath.split('/').map(encodeURIComponent).join('/')}"><title>笔记已迁移</title></head><body><p>笔记已迁移：<a href="${redirect}">前往新地址</a></p></body></html>\n`);
}

console.log(`Built ${notes.length} notes and ${aliases.length} legacy redirects into dist/`);

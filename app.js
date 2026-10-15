const state = { topic:'All', view:'notes', notes:[] };
const $ = (selector) => document.querySelector(selector);
const dateText = new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }).format(new Date());
$('#edition-date').textContent = dateText;
$('#footer-date').textContent = dateText;

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta:{}, body:markdown };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const separator = line.indexOf(':');
    if (separator < 0) return;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    meta[key] = value;
  });
  return { meta, body:match[2].trim() };
}

function renderMarkdown(markdown) {
  return markdown.split(/\n\s*\n/).map(block => {
    const text = block.trim();
    if (!text) return '';
    if (text.startsWith('> ')) return `<p class="pull-quote">${escapeHtml(text.slice(2))}</p>`;
    if (/^(?:- |\* )/.test(text)) return `<ul>${text.split('\n').map(item => `<li>${inlineMarkdown(item.replace(/^[-*] /, ''))}</li>`).join('')}</ul>`;
    return `<p>${inlineMarkdown(text.replace(/\n/g, ' '))}</p>`;
  }).join('');
}

function inlineMarkdown(text) {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code>$1</code>');
}

function escapeHtml(text) { return text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character])); }

function renderTopicPills() {
  const topics = [...new Set(state.notes.map(note => String(note.topic || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (state.topic !== 'All' && !topics.includes(state.topic)) state.topic = 'All';
  $('#topic-pills').innerHTML = ['All', ...topics].map(topic => `<button class="pill ${state.topic === topic ? 'active' : ''}" data-topic="${escapeHtml(topic)}">${escapeHtml(topic)}</button>`).join('');
}

function render() {
  const visible = state.notes.filter(note => state.topic === 'All' || note.topic === state.topic);
  $('#empty-state').hidden = visible.length !== 0;
  const noteCard = (note, featured = false) => `<article class="note ${featured ? 'top-note' : ''} ${featured && !note.image ? 'text-only-note' : ''}">
    ${featured && state.topic === 'All' ? '<span class="top-label">• Recent note</span>' : ''}
    <div class="note-meta"><span class="topic">${escapeHtml(note.topic)}</span> · ${escapeHtml(note.author)} · <a href="${escapeHtml(note.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(note.source)} ↗</a></div>
    <h2><a href="${escapeHtml(note.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(note.title)}</a></h2>
    ${note.image ? `<img class="note-banner" src="${escapeHtml(note.image)}" alt="${escapeHtml(note.title)}" />` : ''}
    <div class="note-body">${state.view === 'titles' ? '' : renderMarkdown(note.body)}</div>
  </article>`;
  if (!visible.length) { $('#notes').innerHTML = ''; return; }
  const columnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3;
  const columns = Array.from({ length:columnCount }, () => []);
  visible.slice(1).forEach((note, index) => columns[index % columnCount].push(note));
  $('#notes').innerHTML = `${noteCard(visible[0], true)}<div class="note-grid">${columns.map(column => `<div class="note-column">${column.map(note => noteCard(note)).join('')}</div>`).join('')}</div>`;
}

async function loadNotes() {
  try {
    const manifest = await fetch('notes/index.json').then(response => response.json());
    state.notes = await Promise.all(manifest.files.map(async file => {
      const markdown = await fetch(`notes/${file}`).then(response => response.text());
      const parsed = parseFrontMatter(markdown);
      return { ...parsed.meta, body:parsed.body };
    }));
    state.notes.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    renderTopicPills();
  } catch (error) {
    $('#notes').innerHTML = '<section class="empty-state"><p>Notes could not be loaded. Run <code>node build.mjs</code> once, then open the site from a local server.</p></section>';
  }
  render();
}

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'theme') document.body.classList.toggle('night');
  if (action === 'home') { state.topic = 'All'; document.querySelectorAll('[data-topic]').forEach(p => p.classList.toggle('active', p.dataset.topic === 'All')); render(); window.scrollTo({ top:0, behavior:'smooth' }); }
  if (action === 'about') alert('Gradient a day is a small, personal archive for turning reading into memory. Add one Markdown file per reading note.');
});

$('#topic-pills').addEventListener('click', (event) => { const pill = event.target.closest('[data-topic]'); if (!pill) return; state.topic = pill.dataset.topic; document.querySelectorAll('[data-topic]').forEach(p => p.classList.toggle('active', p === pill)); render(); });
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; document.querySelectorAll('[data-view]').forEach(p => p.classList.toggle('active', p === button)); render(); }));
let previousColumnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3;
window.addEventListener('resize', () => { const nextColumnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3; if (nextColumnCount !== previousColumnCount) { previousColumnCount = nextColumnCount; render(); } });
loadNotes();

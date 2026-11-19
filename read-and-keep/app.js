const rows = document.querySelector('#paper-rows');
const paperCount = document.querySelector('#paper-count');
const dialog = document.querySelector('#paper-dialog');
const closeButton = document.querySelector('#close-dialog');
const dialogKicker = document.querySelector('#dialog-kicker');
const dialogTitle = document.querySelector('#dialog-title');
const dialogLink = document.querySelector('#dialog-link');
const dialogNotes = document.querySelector('#dialog-notes');
const searchInput = document.querySelector('#paper-search');
const filterStatus = document.querySelector('#filter-status');
const paperById = new Map();
let allPapers = [];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function formatPaperDate(value = '') {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!match) return { meta: {}, body: markdown };

  const meta = {};
  let activeList = null;
  match[1].split('\n').forEach(line => {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && activeList) {
      meta[activeList].push(listItem[1].trim());
      return;
    }

    const field = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!field) return;
    const [, key, rawValue] = field;
    if (key === 'ideas' || key === 'takeaways' || key === 'notes') {
      meta[key] = [];
      activeList = key;
    } else {
      meta[key] = rawValue.trim().replace(/^['"]|['"]$/g, '');
      activeList = null;
    }
  });
  return { meta, body: (match[2] || '').trim() };
}

function listMarkup(items = []) {
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function renderRows(papers) {
  paperById.clear();
  rows.innerHTML = papers.length ? papers.map(paper => `<tr>
    <td>
      <div class="paper-heading">
        <span class="row-number">${escapeHtml(paper.index)}</span>
        <button class="paper-title" type="button" data-paper-id="${escapeHtml(paper.id)}">${escapeHtml(paper.title)}</button>
      </div>
      <div class="paper-meta-row">
        <a class="paper-link" href="${escapeHtml(paper.url)}" target="_blank" rel="noreferrer">Open actual paper ↗</a>
        <span class="paper-meta">${escapeHtml(paper.authors)} · ${escapeHtml(paper.year)}</span>
      </div>
    </td>
    <td class="date-cell"><time datetime="${escapeHtml(paper.date)}">${escapeHtml(formatPaperDate(paper.date))}</time></td>
    <td class="category-cell"><span class="category-label">${escapeHtml(paper.category)}</span></td>
    <td class="takeaways">${listMarkup(paper.takeaways)}</td>
  </tr>`).join('') : '<tr><td colspan="4" class="empty-filter-cell"><strong>No papers match these filters.</strong><br>Try a different title or clear the filters.</td></tr>';
  papers.forEach(paper => paperById.set(paper.id, paper));
  const total = allPapers.length;
  paperCount.textContent = papers.length === total
    ? `${total} paper${total === 1 ? '' : 's'}`
    : `${papers.length} of ${total} papers`;
  filterStatus.textContent = `${papers.length} matching paper${papers.length === 1 ? '' : 's'}`;
}

function applyFilters() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const filtered = allPapers.filter(paper => {
    const matchesTitle = !query || paper.title.toLocaleLowerCase().includes(query);
    return matchesTitle;
  });
  renderRows(filtered);
}

function clearFilters() {
  searchInput.value = '';
  renderRows(allPapers);
  searchInput.focus();
}

async function loadPapers() {
  if (window.location.protocol === 'file:') {
    paperCount.textContent = 'Local server needed';
    rows.innerHTML = '<tr><td colspan="4" class="loading-cell"><strong>Open this page through a local server.</strong><br>From the project folder, run <code>python3 -m http.server 8000</code>, then visit <code>http://localhost:8000/read-and-keep/</code>.</td></tr>';
    return;
  }

  try {
    const pageUrl = new URL(window.location.href);
    if (pageUrl.pathname.endsWith('/index.html')) {
      pageUrl.pathname = pageUrl.pathname.slice(0, -'index.html'.length);
    } else if (!pageUrl.pathname.endsWith('/')) {
      pageUrl.pathname += '/';
    }
    const papersUrl = new URL('papers/', pageUrl);
    const manifestResponse = await fetch(new URL('index.json', papersUrl), { cache: 'no-store' });
    if (!manifestResponse.ok) throw new Error('Could not load paper index');
    const manifest = await manifestResponse.json();
    allPapers = await Promise.all(manifest.files.map(async file => {
      const response = await fetch(new URL(file, papersUrl), { cache: 'no-store' });
      if (!response.ok) throw new Error(`Could not load ${file}`);
      const parsed = parseFrontMatter(await response.text());
      return { ...parsed.meta, id: file };
    }));
    allPapers.sort((a, b) => Number(b.index) - Number(a.index));
    renderRows(allPapers);
  } catch (error) {
    paperCount.textContent = 'Paper index unavailable';
    rows.innerHTML = '<tr><td colspan="4" class="loading-cell"><strong>Could not load the Markdown paper files.</strong><br>Check that the local server is running and that the URL is <code>/read-and-keep/</code>.</td></tr>';
    console.error(error);
  }
}

function openPaper(id) {
  const paper = paperById.get(id);
  if (!paper) return;
  dialogKicker.textContent = `${paper.index} · ${formatPaperDate(paper.date)} · ${paper.category} · ${paper.authors} · ${paper.year}`;
  dialogTitle.textContent = paper.title;
  dialogLink.href = paper.url;
  const detailedNotes = [...new Set([...(paper.ideas || []), ...(paper.notes || [])].filter(Boolean))];
  dialogNotes.innerHTML = listMarkup(detailedNotes);
  dialog.showModal();
  requestAnimationFrame(() => dialog.classList.add('is-open'));
}

function closePaper() {
  if (!dialog.open) return;
  dialog.classList.remove('is-open');
  window.setTimeout(() => dialog.close(), 220);
}

rows.addEventListener('click', event => {
  const button = event.target.closest('[data-paper-id]');
  if (button) openPaper(button.dataset.paperId);
});
searchInput.addEventListener('input', applyFilters);
document.addEventListener('keydown', event => {
  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
  if (event.key === '/' && !isTyping && !dialog.open) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && !dialog.open && searchInput.value) clearFilters();
});
closeButton.addEventListener('click', closePaper);
dialog.addEventListener('cancel', event => { event.preventDefault(); closePaper(); });
dialog.addEventListener('click', event => { if (event.target === dialog) closePaper(); });
dialog.addEventListener('close', () => dialog.classList.remove('is-open'));

loadPapers();

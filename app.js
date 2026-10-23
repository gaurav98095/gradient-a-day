const state = { topics:[], mode:'brief', notes:[], detail:null };
const $ = (selector) => document.querySelector(selector);
const dateText = new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' }).format(new Date());
$('#edition-date').textContent = dateText;

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
  const lines = markdown.split('\n');
  const output = [];
  let paragraph = [];
  let list = [];
  let listType = null;
  let code = null;
  let codeLanguage = '';
  let math = null;

  const flushParagraph = () => {
    if (paragraph.length) output.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length) output.push(`<${listType}>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</${listType}>`);
    list = [];
    listType = null;
  };

  lines.forEach(line => {
    if (line.trim().startsWith('```')) {
      if (code === null) { flushParagraph(); flushList(); code = []; codeLanguage = line.trim().slice(3).trim().toLowerCase(); }
      else { output.push(renderCodeBlock(code.join('\n'), codeLanguage)); code = null; codeLanguage = ''; }
      return;
    }
    if (line.trim() === '$$') {
      if (math === null) { flushParagraph(); flushList(); math = []; }
      else { output.push(renderMathBlock(math.join('\n'))); math = null; }
      return;
    }
    if (math !== null) { math.push(line); return; }
    if (code !== null) { code.push(line); return; }
    if (!line.trim()) { flushParagraph(); flushList(); return; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); output.push(`<h${heading[1].length + 1}>${inlineMarkdown(heading[2])}</h${heading[1].length + 1}>`); return; }
    if (/^(?:- |\* )/.test(line)) { flushParagraph(); if (listType !== 'ul') { flushList(); listType = 'ul'; } list.push(line.replace(/^[-*] /, '')); return; }
    if (/^\d+\. /.test(line)) { flushParagraph(); if (listType !== 'ol') { flushList(); listType = 'ol'; } list.push(line.replace(/^\d+\. /, '')); return; }
    if (line.startsWith('> ')) { flushParagraph(); flushList(); output.push(`<p class="pull-quote">${inlineMarkdown(line.slice(2))}</p>`); return; }
    flushList(); paragraph.push(line.trim());
  });
  if (code !== null) output.push(renderCodeBlock(code.join('\n'), codeLanguage));
  if (math !== null) output.push(renderMathBlock(math.join('\n')));
  flushParagraph();
  flushList();
  return output.join('');
}

function renderCodeBlock(code, language = '') {
  const highlighted = language === 'python' || language === 'py' ? highlightPython(code) : escapeHtml(code);
  const label = language ? language.toUpperCase() : 'CODE';
  return `<div class="code-block"><div class="code-toolbar"><span class="code-language">${escapeHtml(label)}</span><button class="copy-code" type="button" data-copy-code="${escapeHtml(code)}">Copy</button></div><pre><code class="language-${escapeHtml(language)}">${highlighted}</code></pre></div>`;
}

function highlightPython(code) {
  const tokenPattern = /(#.*$|"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\b(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|if|import|in|is|match|not|or|pass|raise|return|try|while|with|yield)\b|\b(?:True|False|None)\b|\b(?:print|len|range|enumerate|zip|sum|map|filter|super|isinstance)\b)/gm;
  return code.split(tokenPattern).map((part, index, parts) => {
    if (!part) return '';
    const escaped = escapeHtml(part);
    if (/^#/.test(part)) return `<span class="syntax-comment">${escaped}</span>`;
    if (/^(?:\"\"\"|'''|\"|')/.test(part)) return `<span class="syntax-string">${escaped}</span>`;
    if (/^\d/.test(part)) return `<span class="syntax-number">${escaped}</span>`;
    if (/^(?:True|False|None)$/.test(part)) return `<span class="syntax-constant">${escaped}</span>`;
    if (/^(?:print|len|range|enumerate|zip|sum|map|filter|super|isinstance)$/.test(part)) return `<span class="syntax-builtin">${escaped}</span>`;
    if (/^(?:and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|finally|for|from|if|import|in|is|match|not|or|pass|raise|return|try|while|with|yield)$/.test(part)) return `<span class="syntax-keyword">${escaped}</span>`;
    return escaped;
  }).join('');
}

function renderMathBlock(expression) {
  return `<div class="math-block" role="math">${renderMathExpression(expression)}</div>`;
}

function renderMathExpression(expression) {
  return escapeHtml(expression)
    .replace(/\\operatorname\{([^}]+)\}/g, '$1')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{e\^\{([^}]+)\}\}\{\\sum_?j e\^\{([^}]+)\}\}/g, '<span class="fraction"><span class="numerator">e<sup>$1</sup></span><span class="denominator"><span class="sum-operator"><span class="sum-symbol">∑</span><span class="sum-lower">j</span></span> e<sup>$2</sup></span></span>')
    .replace(/\\frac\{e\^\{([^}]+)\}\}\{\\sum_\{([^}]+)\}\^\{([^}]+)\} e\^\{([^}]+)\}\}/g, '<span class="fraction"><span class="numerator">e<sup>$1</sup></span><span class="denominator"><span class="sum-operator"><span class="sum-upper">$3</span><span class="sum-symbol">∑</span><span class="sum-lower">$2</span></span> e<sup>$4</sup></span></span>')
    .replace(/\\frac\{e\^\{([^}]+)\}\}\{([^{}]+)\}/g, '<span class="fraction"><span class="numerator">e<sup>$1</sup></span><span class="denominator">$2</span></span>')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '<span class="fraction"><span class="numerator">$1</span><span class="denominator">$2</span></span>')
    .replace(/\\sum(?:_\{([^}]+)\}|_([A-Za-z0-9]+))(?:\^\{([^}]+)\}|\^([A-Za-z0-9]+))?/g, (_, lowerLong, lowerShort, upperLong, upperShort) => `<span class="sum-operator">${upperLong || upperShort ? `<span class="sum-upper">${upperLong || upperShort}</span>` : ''}<span class="sum-symbol">∑</span><span class="sum-lower">${lowerLong || lowerShort}</span></span>`)
    .replace(/\\sum/g, '∑')
    .replace(/\\max/g, 'max')
    .replace(/\\ell/g, 'ℓ')
    .replace(/\\qquad/g, ' ')
    .replace(/\\quad/g, ' ')
    .replace(/\\in/g, '∈')
    .replace(/\\,/g, ' ')
    .replace(/\\cdot/g, '·')
    .replace(/\\ldots/g, '…')
    .replace(/\\approx/g, '≈')
    .replace(/\\times/g, '×')
    .replace(/\\left|\\right/g, '')
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
    .replace(/\^([A-Za-z0-9])/g, '<sup>$1</sup>')
    .replace(/_([A-Za-z0-9])/g, '<sub>$1</sub>')
    .replace(/[{}]/g, '');
}

function inlineMarkdown(text) {
  const mathParts = [];
  const withMathPlaceholders = text.replace(/\$([^$\n]+)\$|\\\(([^\n]+?)\\\)/g, (_, dollarExpression, parenExpression) => {
    const expression = dollarExpression || parenExpression;
    mathParts.push(`\\(${expression}\\)`);
    return `@@MATH_${mathParts.length - 1}@@`;
  });
  return escapeHtml(withMathPlaceholders)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img class="inline-note-image" src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/@@MATH_(\d+)@@/g, (_, index) => renderMathExpression(mathParts[Number(index)].slice(2, -2)));
}

function escapeHtml(text) { return text.replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character])); }

function renderSource(note) {
  if (note.mode === 'lab') {
    return note.url ? `<a href="${escapeHtml(note.url)}" target="_blank" rel="noreferrer">GitHub ↗</a>` : '';
  }
  if (!note.source) return '';
  return note.url
    ? `<a href="${escapeHtml(note.url)}" target="_blank" rel="noreferrer">${escapeHtml(note.source)} ↗</a>`
    : escapeHtml(note.source);
}

function renderTopicPills() {
  const modeNotes = state.notes.filter(note => state.mode === 'All' || note.mode === state.mode);
  const topics = [...new Set(modeNotes.map(note => String(note.topic || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  state.topics = state.topics.filter(topic => topics.includes(topic));
  const selection = state.topics.length ? state.topics.join(', ') : 'All';
  $('#topic-pills').innerHTML = `<button class="filter-toggle" type="button" data-filter-toggle aria-haspopup="true" aria-expanded="false">${escapeHtml(selection)} <span aria-hidden="true">⌄</span></button><div class="filter-options"><button class="pill ${state.topics.length ? '' : 'active'}" data-topic-all>All</button>${topics.map(topic => `<button class="pill ${state.topics.includes(topic) ? 'active' : ''}" data-topic="${escapeHtml(topic)}">${escapeHtml(topic)}</button>`).join('')}</div>`;
}

function renderModePills() {
  const modes = [...new Set(state.notes.map(note => String(note.mode || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  if (!modes.includes(state.mode)) state.mode = modes.includes('brief') ? 'brief' : modes[0] || '';
  $('#mode-pills').innerHTML = `<button class="filter-toggle" type="button" data-filter-toggle aria-haspopup="true" aria-expanded="false">${escapeHtml(state.mode)} <span aria-hidden="true">⌄</span></button><div class="filter-options">${modes.map(mode => `<button class="pill ${state.mode === mode ? 'active' : ''}" data-mode="${escapeHtml(mode)}">${escapeHtml(mode)}</button>`).join('')}</div>`;
}

function render() {
  if (state.detail) { renderDetail(state.detail); return; }
  const visible = state.notes.filter(note => (!state.topics.length || state.topics.includes(note.topic)) && (state.mode === 'All' || note.mode === state.mode));
  $('#empty-state').hidden = visible.length !== 0;
  const noteCard = (note, featured = false) => `<article class="note ${featured ? 'top-note' : ''} ${featured && !note.image ? 'text-only-note' : ''}">
    ${featured && !state.topics.length ? '<span class="top-label">• Recent note</span>' : ''}
    <div class="note-meta"><span class="topic">${escapeHtml(note.topic)}</span>${note.mode === 'lab' ? '' : ` · ${escapeHtml(note.author)}`}${renderSource(note) ? ` · ${renderSource(note)}` : ''}</div>
    <h2>${note.mode === 'lab' ? `<a href="?note=${encodeURIComponent(note.file)}">${escapeHtml(note.title)}</a>` : escapeHtml(note.title)}</h2>
    ${note.image ? `<img class="note-banner" src="${escapeHtml(note.image)}" alt="${escapeHtml(note.title)}" />` : ''}
    <div class="note-body">${renderMarkdown(note.mode === 'lab' ? (note.summary || note.body.split(/\n\s*\n/)[0]) : note.body)}</div>
  </article>`;
  if (!visible.length) { $('#notes').innerHTML = ''; return; }
  const columnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3;
  const columns = Array.from({ length:columnCount }, () => []);
  visible.slice(1).forEach((note, index) => columns[index % columnCount].push(note));
  $('#notes').innerHTML = `${noteCard(visible[0], true)}<div class="note-grid">${columns.map(column => `<div class="note-column">${column.map(note => noteCard(note)).join('')}</div>`).join('')}</div>`;
}

function renderDetail(note) {
  $('#note-filters').hidden = false;
  $('#empty-state').hidden = true;
  $('#notes').innerHTML = `<article class="full-note">
    <a class="back-link" href="index.html">← Back to notes</a>
    <div class="note-meta"><span class="topic">${escapeHtml(note.topic)}</span>${note.mode === 'lab' ? '' : ` · ${escapeHtml(note.author)}`}${renderSource(note) ? ` · ${renderSource(note)}` : ''}</div>
    <h2>${escapeHtml(note.title)}</h2>
    ${note.image ? `<img class="note-banner" src="${escapeHtml(note.image)}" alt="${escapeHtml(note.title)}" />` : ''}
    <div class="note-body">${renderMarkdown(note.body)}</div>
  </article>`;
}

async function loadNotes() {
  try {
    const manifest = await fetch('notes/index.json').then(response => response.json());
    state.notes = await Promise.all(manifest.files.map(async file => {
      const markdown = await fetch(`notes/${file}`).then(response => response.text());
      const parsed = parseFrontMatter(markdown);
      return { ...parsed.meta, body:parsed.body, file };
    }));
    state.notes.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
    renderTopicPills();
    renderModePills();
  } catch (error) {
    $('#notes').innerHTML = '<section class="empty-state"><p>Notes could not be loaded. Run <code>node build.mjs</code> once, then open the site from a local server.</p></section>';
  }
  const requestedNote = new URLSearchParams(window.location.search).get('note');
  const detailNote = state.notes.find(note => note.file === requestedNote);
  if (detailNote) {
    state.detail = detailNote;
    state.mode = detailNote.mode || state.mode;
    state.topics = detailNote.topic ? [detailNote.topic] : [];
    renderModePills();
    renderTopicPills();
    renderDetail(detailNote);
  }
  else render();
}

document.addEventListener('click', (event) => {
  const copyButton = event.target.closest('[data-copy-code]');
  if (copyButton) {
    navigator.clipboard?.writeText(copyButton.dataset.copyCode || '').then(() => {
      copyButton.textContent = 'Copied';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 1400);
    });
    return;
  }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (action === 'theme') document.body.classList.toggle('night');
  if (action === 'home') { state.detail = null; state.topics = []; state.mode = 'brief'; history.replaceState({}, '', 'index.html'); renderTopicPills(); document.querySelectorAll('[data-topic]').forEach(p => p.classList.remove('active')); document.querySelectorAll('[data-mode]').forEach(p => p.classList.toggle('active', p.dataset.mode === 'brief')); render(); window.scrollTo({ top:0, behavior:'smooth' }); }
  if (action === 'about') alert('Gradient a day is a small, personal archive for turning reading into memory. Add one Markdown file per reading note.');
});

let lastFilterClick = { kind:'', value:'', time:0 };
function isSecondFilterClick(kind, value) {
  const now = Date.now();
  const isDouble = lastFilterClick.kind === kind && lastFilterClick.value === value && now - lastFilterClick.time < 450;
  lastFilterClick = { kind, value, time:now };
  return isDouble;
}

$('#topic-pills').addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-filter-toggle]');
  if (toggle) {
    const menu = toggle.closest('.filter-menu');
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    return;
  }
  const all = event.target.closest('[data-topic-all]');
  if (all) {
    state.detail = null;
    state.topics = [];
    history.replaceState({}, '', 'index.html');
    renderTopicPills();
    render();
    return;
  }
  const pill = event.target.closest('[data-topic]');
  if (!pill) return;
  state.detail = null;
  const topic = pill.dataset.topic;
  const doubleClick = isSecondFilterClick('topic', topic);
  state.topics = doubleClick || state.topics.includes(topic)
    ? state.topics.filter(selected => selected !== topic)
    : [...state.topics, topic];
  history.replaceState({}, '', 'index.html');
  renderTopicPills();
  render();
});

$('#mode-pills').addEventListener('click', (event) => {
  const toggle = event.target.closest('[data-filter-toggle]');
  if (toggle) {
    const menu = toggle.closest('.filter-menu');
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    return;
  }
  const pill = event.target.closest('[data-mode]');
  if (!pill) return;
  state.detail = null;
  state.mode = isSecondFilterClick('mode', pill.dataset.mode) ? 'brief' : pill.dataset.mode;
  history.replaceState({}, '', 'index.html');
  renderTopicPills();
  renderModePills();
  render();
});
document.addEventListener('click', (event) => {
  if (event.target.closest('.filter-menu')) return;
  document.querySelectorAll('.filter-menu.open').forEach(menu => {
    menu.classList.remove('open');
    menu.querySelector('[data-filter-toggle]')?.setAttribute('aria-expanded', 'false');
  });
});
let previousColumnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3;
window.addEventListener('resize', () => { const nextColumnCount = window.innerWidth <= 700 ? 1 : window.innerWidth <= 980 ? 2 : 3; if (nextColumnCount !== previousColumnCount) { previousColumnCount = nextColumnCount; render(); } });
loadNotes();

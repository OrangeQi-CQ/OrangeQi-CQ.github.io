const state = { notes: [], topics: [], domains: [], topic: 'all', domain: 'all', query: '', sort: 'updated' };
const $ = (selector, root = document) => root.querySelector(selector);
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('orangeqi-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('orangeqi-theme');
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('[data-theme-toggle]')?.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
}

function activeTopics() {
  return state.topics.filter((topic) => state.domain === 'all' || topic.domain === state.domain);
}

function renderTopics() {
  const counts = Object.fromEntries(state.topics.map((topic) => [topic.id, state.notes.filter((note) => note.topic === topic.id).length]));
  const topics = activeTopics();
  const topicMarkup = topics.map((topic) => `
    <button class="topic-filter${state.topic === topic.id ? ' is-active' : ''}" type="button" data-category="${escapeHTML(topic.id)}" aria-pressed="${state.topic === topic.id}">
      <span>${escapeHTML(topic.label)}</span><span class="topic-count">${counts[topic.id] || 0}</span>
    </button>`).join('');
  $('#topic-list').innerHTML = `<button class="topic-filter${state.topic === 'all' ? ' is-active' : ''}" type="button" data-category="all" aria-pressed="${state.topic === 'all'}"><span>全部笔记</span><span class="topic-count">${state.notes.filter((note) => state.domain === 'all' || topicFor(note.topic)?.domain === state.domain).length}</span></button>${topicMarkup}`;
  $$('[data-category]').forEach((button) => button.addEventListener('click', () => {
    state.topic = button.dataset.category;
    renderTopics();
    renderNotes();
  }));
}

function topicFor(id) {
  return state.topics.find((topic) => topic.id === id);
}

function visibleNotes() {
  let notes = state.notes.filter((note) => {
    const topic = topicFor(note.topic);
    if (state.domain !== 'all' && topic?.domain !== state.domain) return false;
    if (state.topic !== 'all' && note.topic !== state.topic) return false;
    if (!state.query) return true;
    const searchable = `${note.title} ${note.summary} ${note.tags.join(' ')} ${topic?.label || ''} ${note.content || ''}`.toLocaleLowerCase();
    return state.query.split(/\s+/).every((term) => searchable.includes(term));
  });
  if (state.sort === 'title') notes.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
  else if (state.sort === 'recorded') notes.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title, 'zh-CN'));
  else notes.sort((a, b) => (b.updated || '').localeCompare(a.updated || '') || (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title, 'zh-CN'));
  return notes;
}

function renderNotes() {
  const notes = visibleNotes();
  const domain = state.domains.find((item) => item.id === state.domain);
  const selectedTopic = topicFor(state.topic);
  $('#notes-heading').textContent = selectedTopic?.label || domain?.title || '全部笔记';
  $('#result-count').textContent = `${notes.length} 篇`;
  $('#empty-state').hidden = notes.length !== 0;
  $('#note-list').innerHTML = notes.map((note, index) => {
    const topic = topicFor(note.topic);
    const tags = note.tags.slice(0, 2).map((tag) => `<span class="note-tag">#${escapeHTML(tag)}</span>`).join('');
    return `<article class="note-row">
      <span class="note-number">${String(index + 1).padStart(2, '0')}</span>
      <div class="note-main"><a class="note-title" href="/${note.path.split('/').map(encodeURIComponent).join('/')}">${escapeHTML(note.title)}</a>
      <p class="note-summary">${escapeHTML(note.summary)}</p>
      <div class="note-meta"><span class="note-category">${escapeHTML(topic?.label || '')}</span>${tags}</div></div>
      <div class="note-dates"><time datetime="${escapeHTML(note.updated || '')}"><span>更新</span> ${escapeHTML(note.updated || '未知')}</time>${note.date ? `<time datetime="${escapeHTML(note.date)}"><span>记录</span> ${escapeHTML(note.date)}</time>` : '<span><span>记录</span> 未注明</span>'}</div>
    </article>`;
  }).join('');
}

function renderDomainCounts() {
  for (const domain of state.domains) {
    const element = $(`[data-domain-count="${domain.id}"]`);
    if (element) element.textContent = String(state.notes.filter((note) => topicFor(note.topic)?.domain === domain.id).length);
  }
  const count = $('[data-note-count]');
  if (count) count.textContent = String(state.notes.length).padStart(2, '0');
  const domainCount = $('[data-topic-count]');
  if (domainCount) domainCount.textContent = String(state.domains.length).padStart(2, '0');
  const latest = state.notes.map((note) => note.updated).filter(Boolean).sort().at(-1);
  const latestDate = $('[data-latest-date]');
  if (latestDate) latestDate.textContent = latest ? latest.slice(0, 4) : '持续';
  const allCount = $('[data-all-count]');
  if (allCount) allCount.textContent = String(state.notes.length);
}

function setDomain(domain) {
  state.domain = domain;
  state.topic = 'all';
  $$('[data-domain-filter]').forEach((button) => {
    const active = button.dataset.domainFilter === domain;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  renderTopics();
  renderNotes();
}

async function init() {
  initTheme();
  const search = $('#note-search');
  const sort = $('#note-sort');
  search?.addEventListener('input', () => { state.query = search.value.trim().toLocaleLowerCase(); renderNotes(); });
  sort?.addEventListener('change', () => { state.sort = sort.value; renderNotes(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) { event.preventDefault(); search?.focus(); }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; state.query = ''; renderNotes(); search.blur(); }
  });
  $$('[data-domain-filter]').forEach((button) => button.addEventListener('click', () => setDomain(button.dataset.domainFilter)));
  const year = $('[data-current-year]');
  if (year) year.textContent = new Date().getFullYear();
  try {
    const response = await fetch('/data/notes.json');
    if (!response.ok) throw new Error(`Index request failed (${response.status})`);
    const index = await response.json();
    state.notes = index.notes;
    state.topics = index.topics;
    state.domains = index.domains;
    renderDomainCounts();
    renderTopics();
    renderNotes();
    const featured = index.notes.find((note) => note.featured) || index.notes[0];
    if (featured) {
      const card = $('[data-featured-note]');
      card.href = `/${featured.path.split('/').map(encodeURIComponent).join('/')}`;
      $('[data-featured-title]').textContent = featured.title;
      $('[data-featured-summary]').textContent = featured.summary;
      $('[data-featured-category]').textContent = topicFor(featured.topic)?.label || '';
    }
  } catch (error) {
    $('#result-count').textContent = '索引未载入';
    $('#note-list').innerHTML = `<p class="empty-state">无法载入笔记索引。请检查网络连接后重新载入页面。<br /><small>${escapeHTML(error.message)}</small></p>`;
  }
}

function $$(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

init();

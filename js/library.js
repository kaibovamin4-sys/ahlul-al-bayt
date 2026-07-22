// ── LIBRARY ──
(function() {
  let BOOKS = [];
  let activeLang = 'all';
  let activeCat = 'all';
  let searchQuery = '';

  const LANG_LABELS = { all: 'Все языки', ru: 'Русский', az: 'Азербайджанский', uz: 'Узбекский', tj: 'Таджикский' };

  fetch('data/books.json')
    .then(r => r.json())
    .then(data => {
      BOOKS = data;
      buildFilters();
      render();
    })
    .catch(err => {
      console.error('Failed to load books:', err);
      const grid = document.getElementById('libGrid');
      if (grid) grid.innerHTML = '<div class="lib-empty-text" style="grid-column:1/-1;text-align:center;padding:40px;">Не удалось загрузить библиотеку</div>';
    });

  function buildFilters() {
    // Language filters
    const langs = ['all', ...new Set(BOOKS.map(b => b.lang))];
    const langWrap = document.getElementById('libLangFilters');
    langWrap.innerHTML = langs.map(l =>
      `<button class="lib-filter-btn ${l === 'all' ? 'active' : ''}" data-lang="${l}">${LANG_LABELS[l] || l}</button>`
    ).join('');
    langWrap.querySelectorAll('.lib-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLang = btn.dataset.lang;
        langWrap.querySelectorAll('.lib-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });

    // Category filters
    const cats = ['all', ...new Set(BOOKS.map(b => b.category))];
    const catNames = { all: 'Все темы' };
    BOOKS.forEach(b => { catNames[b.category] = b.category_name; });
    const catWrap = document.getElementById('libCatFilters');
    catWrap.innerHTML = cats.map(c =>
      `<button class="lib-filter-btn ${c === 'all' ? 'active' : ''}" data-cat="${c}">${catNames[c]}</button>`
    ).join('');
    catWrap.querySelectorAll('.lib-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        catWrap.querySelectorAll('.lib-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  const searchInput = document.getElementById('libSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      render();
    });
  }

  function render() {
    const grid = document.getElementById('libGrid');
    const empty = document.getElementById('libEmpty');
    const countEl = document.getElementById('libCount');
    if (!grid) return;

    let filtered = BOOKS.filter(b => {
      if (activeLang !== 'all' && b.lang !== activeLang) return false;
      if (activeCat !== 'all' && b.category !== activeCat) return false;
      if (searchQuery && !b.title.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      countEl.textContent = '';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = filtered.map(b => `
      <div class="lib-card">
        <div class="lib-card-top">
          <div class="lib-card-cat">${b.category_name}</div>
          <div class="lib-card-lang">${LANG_LABELS[b.lang]}</div>
        </div>
        <div class="lib-card-title">${b.title}</div>
        <div class="lib-card-bottom">
          <span class="lib-card-size">${b.size_mb} МБ</span>
          <a href="${b.file}" download class="lib-card-dl">Скачать →</a>
        </div>
      </div>
    `).join('');

    countEl.textContent = `Показано ${filtered.length} из ${BOOKS.length} книг`;
  }
})();

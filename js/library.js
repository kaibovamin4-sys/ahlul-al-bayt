// ── LIBRARY ──
(function() {
  let BOOKS = [];
  let activeLang = 'all';
  let activeCat = 'all';
  let searchQuery = '';

  const LANG_LABELS = { all: 'Все языки', ru: 'Русский', az: 'Азербайджанский', uz: 'Узбекский', tj: 'Таджикский' };
  const ORNAMENTS = ['۞', '❋', '✦', '◈', '❖'];

  fetch('data/books.json')
    .then(r => r.json())
    .then(data => {
      BOOKS = data;
      buildStats();
      buildLangTabs();
      buildCatSelect();
      render();
    })
    .catch(err => {
      console.error('Failed to load books:', err);
      const grid = document.getElementById('libGrid');
      if (grid) grid.innerHTML = '<div class="lib-empty"><div class="lib-empty-icon">⚠</div><div class="lib-empty-text">Не удалось загрузить библиотеку</div></div>';
    });

  function buildStats() {
    const wrap = document.getElementById('libStats');
    if (!wrap) return;
    const langs = new Set(BOOKS.map(b => b.lang));
    const totalSize = BOOKS.reduce((s, b) => s + (b.size_mb || 0), 0);
    wrap.innerHTML = `
      <div class="lib-stat">
        <div class="lib-stat-num">${BOOKS.length}</div>
        <div class="lib-stat-label">Книг</div>
      </div>
      <div class="lib-stat">
        <div class="lib-stat-num">${langs.size}</div>
        <div class="lib-stat-label">Языка</div>
      </div>
      <div class="lib-stat">
        <div class="lib-stat-num">${(totalSize / 1024).toFixed(1)}</div>
        <div class="lib-stat-label">ГБ текста</div>
      </div>
    `;
  }

  function buildLangTabs() {
    const wrap = document.getElementById('libLangTabs');
    if (!wrap) return;
    const langs = ['all', ...new Set(BOOKS.map(b => b.lang))];
    wrap.innerHTML = langs.map(l => {
      const count = l === 'all' ? BOOKS.length : BOOKS.filter(b => b.lang === l).length;
      return `<button class="lib-lang-tab ${l === 'all' ? 'active' : ''}" data-lang="${l}">${LANG_LABELS[l] || l}<span class="count">${count}</span></button>`;
    }).join('');
    wrap.querySelectorAll('.lib-lang-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeLang = btn.dataset.lang;
        wrap.querySelectorAll('.lib-lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
    });
  }

  function buildCatSelect() {
    const sel = document.getElementById('libCatSelect');
    if (!sel) return;
    const catNames = { all: 'Все темы' };
    BOOKS.forEach(b => { catNames[b.category] = b.category_name; });
    const cats = Object.keys(catNames);
    sel.innerHTML = cats.map(c => `<option value="${c}">${catNames[c]}</option>`).join('');
    sel.addEventListener('change', () => {
      activeCat = sel.value;
      render();
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
    const countEl = document.getElementById('libCount');
    if (!grid) return;

    let filtered = BOOKS.filter(b => {
      if (activeLang !== 'all' && b.lang !== activeLang) return false;
      if (activeCat !== 'all' && b.category !== activeCat) return false;
      if (searchQuery && !b.title.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (!filtered.length) {
      grid.innerHTML = `<div class="lib-empty"><div class="lib-empty-icon">📚</div><div class="lib-empty-text">Ничего не найдено</div></div>`;
      countEl.textContent = '';
      return;
    }

    grid.innerHTML = filtered.map((b, i) => {
      const ornament = ORNAMENTS[i % ORNAMENTS.length];
      return `
      <div class="lib-book" style="animation-delay:${Math.min(i * 0.02, 0.6)}s" onclick='openBookReader(${JSON.stringify(b).replace(/'/g, "&apos;")})'>
        <div class="lib-cover">
          <div class="lib-cover-lang-badge">${LANG_LABELS[b.lang]}</div>
          <div class="lib-cover-ornament">${ornament}</div>
          <div class="lib-cover-title">${b.title}</div>
        </div>
        <div class="lib-book-meta">
          <span class="lib-book-cat">${b.category_name}</span>
          <span class="lib-book-size">${b.size_mb} МБ</span>
        </div>
      </div>`;
    }).join('');

    countEl.textContent = `Показано ${filtered.length} из ${BOOKS.length} книг`;
  }

  // ── BOOK READER ──
  window.openBookReader = function(book) {
    const overlay = document.getElementById('libReaderOverlay');
    const title = document.getElementById('libReaderTitle');
    const dl = document.getElementById('libReaderDownload');
    const frame = document.getElementById('libReaderFrame');
    const loading = document.getElementById('libReaderLoading');

    title.textContent = book.title;
    dl.href = book.file;
    dl.setAttribute('download', book.title + '.pdf');

    frame.style.display = 'none';
    loading.style.display = 'flex';
    frame.src = book.file;

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

    frame.onload = () => {
      loading.style.display = 'none';
      frame.style.display = 'block';
    };
    // Fallback: show iframe after timeout even if onload doesn't fire (cross-origin PDFs)
    setTimeout(() => {
      loading.style.display = 'none';
      frame.style.display = 'block';
    }, 2500);
  };

  window.closeBookReader = function() {
    const overlay = document.getElementById('libReaderOverlay');
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.getElementById('libReaderFrame').src = '';
      document.body.style.overflow = '';
    }, 350);
  };
})();

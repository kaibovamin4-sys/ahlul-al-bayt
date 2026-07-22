// ── LIBRARY ──
(function() {
  let BOOKS = [];
  let activeLang = 'all';
  let activeCat = 'all';
  let searchQuery = '';
  let visibleCount = 16;
  const PAGE_SIZE = 16;

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
        visibleCount = PAGE_SIZE;
        wrap.querySelectorAll('.lib-lang-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(true);
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
      visibleCount = PAGE_SIZE;
      render(true);
    });
  }

  const searchInput = document.getElementById('libSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      visibleCount = PAGE_SIZE;
      render(true);
    });
  }

  function getFiltered() {
    return BOOKS.filter(b => {
      if (activeLang !== 'all' && b.lang !== activeLang) return false;
      if (activeCat !== 'all' && b.category !== activeCat) return false;
      if (searchQuery && !b.title.toLowerCase().includes(searchQuery)) return false;
      return true;
    });
  }

  function render(scrollToTop) {
    const grid = document.getElementById('libGrid');
    const countEl = document.getElementById('libCount');
    if (!grid) return;

    const filtered = getFiltered();

    if (!filtered.length) {
      grid.innerHTML = `<div class="lib-empty"><div class="lib-empty-icon">📚</div><div class="lib-empty-text">Ничего не найдено</div></div>`;
      countEl.innerHTML = '';
      if (scrollToTop) document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const toShow = filtered.slice(0, visibleCount);

    grid.innerHTML = toShow.map((b, i) => {
      const ornament = ORNAMENTS[i % ORNAMENTS.length];
      return `
      <div class="lib-book" style="animation-delay:${Math.min(i * 0.02, 0.4)}s" onclick='openBookReader(${JSON.stringify(b).replace(/'/g, "&apos;")})'>
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

    const remaining = filtered.length - toShow.length;
    let countHtml = `<span>Показано ${toShow.length} из ${filtered.length}</span>`;
    if (remaining > 0) {
      countHtml += `<button class="lib-more-btn" id="libMoreBtn">Показать ещё ${Math.min(remaining, PAGE_SIZE)} →</button>`;
    }
    countEl.innerHTML = countHtml;

    const moreBtn = document.getElementById('libMoreBtn');
    if (moreBtn) {
      moreBtn.addEventListener('click', () => {
        visibleCount += PAGE_SIZE;
        render(false);
      });
    }

    if (scrollToTop) {
      document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ── BOOK READER (PDF.js) ──
  let pdfDoc = null;
  let currentPage = 1;
  let renderingPage = false;

  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  window.openBookReader = function(book) {
    const overlay = document.getElementById('libReaderOverlay');
    const title = document.getElementById('libReaderTitle');
    const dl = document.getElementById('libReaderDownload');
    const loading = document.getElementById('libReaderLoading');
    const errorBox = document.getElementById('libReaderError');
    const errorDl = document.getElementById('libReaderErrorDl');
    const pagesWrap = document.getElementById('libPdfPages');
    const footer = document.getElementById('libReaderFooter');

    title.textContent = book.title;
    dl.href = book.file;
    dl.setAttribute('download', book.title + '.pdf');
    errorDl.href = book.file;
    errorDl.setAttribute('download', book.title + '.pdf');

    loading.style.display = 'flex';
    errorBox.style.display = 'none';
    pagesWrap.innerHTML = '';
    footer.style.display = 'none';

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('open'), 10);
    document.body.style.overflow = 'hidden';

    pdfDoc = null;
    currentPage = 1;

    if (!window.pdfjsLib) {
      loading.style.display = 'none';
      errorBox.style.display = 'flex';
      return;
    }

    pdfjsLib.getDocument({ url: book.file, withCredentials: false }).promise
      .then(doc => {
        pdfDoc = doc;
        loading.style.display = 'none';
        footer.style.display = 'flex';
        updatePageInfo();
        renderPage(1);
      })
      .catch(err => {
        console.error('PDF load error:', err);
        loading.style.display = 'none';
        errorBox.style.display = 'flex';
      });
  };

  function renderPage(num) {
    if (!pdfDoc || renderingPage) return;
    renderingPage = true;
    const pagesWrap = document.getElementById('libPdfPages');

    pdfDoc.getPage(num).then(page => {
      const containerWidth = pagesWrap.clientWidth - 32;
      const baseViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / baseViewport.width, 2.2);
      const viewport = page.getViewport({ scale: scale * (window.devicePixelRatio || 1) });

      const canvas = document.createElement('canvas');
      canvas.className = 'lib-pdf-canvas';
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = (viewport.width / (window.devicePixelRatio || 1)) + 'px';
      canvas.style.height = (viewport.height / (window.devicePixelRatio || 1)) + 'px';

      const ctx = canvas.getContext('2d');
      pagesWrap.innerHTML = '';
      pagesWrap.appendChild(canvas);
      pagesWrap.scrollTop = 0;

      return page.render({ canvasContext: ctx, viewport }).promise;
    }).then(() => {
      renderingPage = false;
      currentPage = num;
      updatePageInfo();
    }).catch(err => {
      console.error('Render error:', err);
      renderingPage = false;
    });
  }

  function updatePageInfo() {
    const info = document.getElementById('libPageInfo');
    const prev = document.getElementById('libPagePrev');
    const next = document.getElementById('libPageNext');
    if (!pdfDoc || !info) return;
    info.textContent = `${currentPage} / ${pdfDoc.numPages}`;
    prev.disabled = currentPage <= 1;
    next.disabled = currentPage >= pdfDoc.numPages;
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'libPagePrev' && pdfDoc && currentPage > 1) {
      renderPage(currentPage - 1);
    }
    if (e.target.id === 'libPageNext' && pdfDoc && currentPage < pdfDoc.numPages) {
      renderPage(currentPage + 1);
    }
  });

  document.addEventListener('keydown', e => {
    const overlay = document.getElementById('libReaderOverlay');
    if (!overlay || !overlay.classList.contains('open') || !pdfDoc) return;
    if (e.key === 'ArrowLeft' && currentPage > 1) renderPage(currentPage - 1);
    if (e.key === 'ArrowRight' && currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
  });

  window.closeBookReader = function() {
    const overlay = document.getElementById('libReaderOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.getElementById('libPdfPages').innerHTML = '';
      document.body.style.overflow = '';
      pdfDoc = null;
      currentPage = 1;
    }, 350);
  };
})();

// ── DUA PAGE ──
let DUA_DATA = {};

fetch('data/duas.json')
  .then(r => r.json())
  .then(data => { DUA_DATA = data; })
  .catch(err => console.error('Failed to load duas:', err));

function openDua(key) {
  const data = DUA_DATA[key];
  const page = document.getElementById('duaPage');
  const content = document.getElementById('duaPageContent');
  const label = document.getElementById('duaPageLabel');

  if (!data) {
    content.innerHTML = '<div style="font-family:Cormorant Garamond,serif;font-size:22px;color:var(--text-dim);font-style:italic;padding:60px 0;">Текст этого дуа скоро будет добавлен...</div>';
    label.textContent = 'Дуа и Зияраты';
    page.style.display = 'block';
    setTimeout(() => { page.style.opacity = '1'; }, 10);
    document.body.style.overflow = 'hidden';
    return;
  }

  label.textContent = data.label;

  const headers = `
    <div class="dua-col-headers">
      <div class="dua-col-header">Арабский текст</div>
      <div class="dua-col-header">Транскрипция</div>
      <div class="dua-col-header">Перевод</div>
    </div>`;

  let html = `
    <div class="dua-page-title">${data.title}</div>
    <span class="dua-page-arabic-title">${data.arabic_title}</span>
    <div class="dua-page-desc">${data.desc}</div>
    ${headers}
  `;

  data.verses.forEach(v => {
    if (v.section) {
      html += `<div class="dua-section-divider">${v.section}</div>${headers}`;
    } else {
      html += `<div class="dua-verse">
        <div class="dua-verse-ar">${v.ar}</div>
        <div class="dua-verse-trans">${v.tr}</div>
        <div class="dua-verse-ru">${v.ru}</div>
      </div>`;
    }
  });

  content.innerHTML = html;
  page.style.display = 'block';
  setTimeout(() => { page.style.opacity = '1'; }, 10);
  document.body.style.overflow = 'hidden';
  page.scrollTop = 0;
}

function closeDua() {
  const page = document.getElementById('duaPage');
  if (!page) return;
  page.style.opacity = '0';
  setTimeout(() => {
    page.style.display = 'none';
    document.body.style.overflow = '';
  }, 400);
}

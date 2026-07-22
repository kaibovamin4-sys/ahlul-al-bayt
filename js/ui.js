// ── THEME TOGGLE ──
const toggle = document.getElementById('themeToggle');
let dark = true;
toggle.addEventListener('click', () => {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? '' : 'light');
  toggle.textContent = dark ? '☽' : '☀';
});

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── MOBILE NAV ──
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
}

// ── SCROLL TO SECTION ──
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── REVEAL ON SCROLL ──
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── Q&A TOGGLE ──
function toggleQA(item) {
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.qa-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

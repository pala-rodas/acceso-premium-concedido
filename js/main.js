/* ===== BURGER MENU ===== */
(function () {
  const btn = document.getElementById('burger-btn');
  const drawer = document.getElementById('menu-drawer');
  const overlay = document.getElementById('menu-overlay');
  const closeBtn = document.getElementById('menu-close');

  if (!btn || !drawer) return;

  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';
  const adminLinks = document.querySelectorAll('.admin-only');
  if (isAdmin) adminLinks.forEach(el => el.style.display = 'block');

  function open() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  closeBtn.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // Mark active link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-drawer nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (currentPath === href || (currentPath === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

/* ===== PARALLAX HERO ===== */
(function () {
  const inner = document.getElementById('hero-parallax');
  if (!inner) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        inner.style.transform = `translateY(${y * 0.3}px)`;
        inner.style.opacity = Math.max(0, 1 - y / 600);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

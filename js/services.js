/* ===== SERVICES PAGE ===== */
(async function () {
  let services = [];
  let filtered = [];
  let activeFilter = 'all';
  let drawerIndex = 0;

  const grid = document.getElementById('services-grid');
  const upcomingGrid = document.getElementById('upcoming-grid');
  const filters = document.querySelectorAll('.filter-btn');
  const drawer = document.getElementById('service-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerClose = document.getElementById('drawer-close');
  const drawerPrev = document.getElementById('drawer-prev');
  const drawerNext = document.getElementById('drawer-next');
  const drawerContent = document.getElementById('drawer-content');

  try {
    const res = await fetch('data/services.json');
    const data = await res.json();
    services = data.services;
  } catch (e) {
    if (grid) grid.innerHTML = '<p style="color:#bbb;text-align:center;padding:40px;">Error cargando servicios.</p>';
    return;
  }

  const activeServices = services.filter(s => s.status === 'active');
  const upcomingServices = services.filter(s => s.status === 'upcoming');

  function categoryLabel(cat) {
    const map = {
      presencial: 'Presencial',
      distancia: 'Distancia',
      fisico: 'Físico',
      emocional: 'Emocional',
      upcoming: 'Próximamente'
    };
    return map[cat] || cat;
  }

  function pillClass(cat) {
    const map = {
      presencial: 'pill--presencial',
      distancia: 'pill--distancia',
      fisico: 'pill--fisico',
      emocional: 'pill--emocional'
    };
    return map[cat] || 'pill--gold';
  }

  function renderGrid() {
    if (!grid) return;

    filtered = activeFilter === 'all'
      ? activeServices
      : activeServices.filter(s => s.category === activeFilter);

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color:#bbb;text-align:center;padding:40px;grid-column:1/-1;">No hay servicios en esta categoría.</p>';
      return;
    }

    grid.innerHTML = filtered.map((s, i) => `
      <div class="card service-card" data-index="${i}" role="button" tabindex="0" aria-label="Ver detalle: ${s.name}">
        <div class="service-card__top">
          <span class="pill ${pillClass(s.category)}">${categoryLabel(s.category)}</span>
        </div>
        <h3>${s.name}</h3>
        <p class="short-desc">${s.shortDesc}</p>
        <div class="service-card__footer">
          <span class="cost-mini">${s.cost}</span>
          <span style="font-size:0.8rem;color:var(--gold);">Ver detalle →</span>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.service-card').forEach(card => {
      const open = () => openDrawer(parseInt(card.dataset.index));
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    });
  }

  function renderUpcoming() {
    if (!upcomingGrid || upcomingServices.length === 0) return;

    upcomingGrid.innerHTML = upcomingServices.map(s => `
      <div class="card service-card upcoming">
        <div class="service-card__top">
          <span class="pill pill--upcoming">Próximamente</span>
        </div>
        <h3>${s.name}</h3>
        <p class="short-desc">${s.shortDesc}</p>
        <div class="service-card__footer">
          <span class="cost-mini">${s.cost}</span>
        </div>
      </div>
    `).join('');
  }

  function openDrawer(index) {
    drawerIndex = index;
    renderDrawerContent();
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function renderDrawerContent() {
    const s = filtered[drawerIndex];
    if (!s || !drawerContent) return;

    drawerPrev.disabled = drawerIndex === 0;
    drawerNext.disabled = drawerIndex === filtered.length - 1;

    const componentsHTML = s.components
      ? `<h4>Componentes del servicio</h4>
         <ul>${s.components.map(c => `<li>${c}</li>`).join('')}</ul>`
      : '';

    const benefitsHTML = s.benefits
      ? `<h4>Beneficios</h4>
         <ul>${s.benefits.map(b => `<li>${b}</li>`).join('')}</ul>`
      : '';

    const sideEffectsHTML = s.sideEffects
      ? `<h4>Efectos secundarios</h4>
         <ul>${s.sideEffects.map(e => `<li>${e}</li>`).join('')}</ul>`
      : '';

    const noteHTML = (s.technicalNote || s.promotionalNote)
      ? `<div class="drawer-note">${s.technicalNote || s.promotionalNote}</div>`
      : '';

    const functionHTML = s.function
      ? `<h4>Función</h4><p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:24px;font-style:italic;">${s.function}</p>`
      : '';

    drawerContent.innerHTML = `
      <span class="pill ${pillClass(s.category)}" style="margin-bottom:8px;">${categoryLabel(s.category)}</span>
      <h3>${s.name}</h3>
      <p class="description">${s.description}</p>
      <div class="cost">${s.cost}</div>
      ${componentsHTML}
      ${benefitsHTML}
      ${sideEffectsHTML}
      ${functionHTML}
      ${noteHTML}
    `;
  }

  // Filter buttons
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderGrid();
    });
  });

  // Drawer navigation
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  if (drawerPrev) {
    drawerPrev.addEventListener('click', () => {
      if (drawerIndex > 0) { drawerIndex--; renderDrawerContent(); }
    });
  }
  if (drawerNext) {
    drawerNext.addEventListener('click', () => {
      if (drawerIndex < filtered.length - 1) { drawerIndex++; renderDrawerContent(); }
    });
  }

  document.addEventListener('keydown', e => {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'ArrowLeft' && drawerIndex > 0) { drawerIndex--; renderDrawerContent(); }
    if (e.key === 'ArrowRight' && drawerIndex < filtered.length - 1) { drawerIndex++; renderDrawerContent(); }
  });

  renderGrid();
  renderUpcoming();

  // Auto-open drawer if ?service=ID comes from home page cards
  const serviceParam = new URLSearchParams(window.location.search).get('service');
  if (serviceParam) {
    const targetIndex = filtered.findIndex(s => s.id === serviceParam);
    if (targetIndex !== -1) {
      openDrawer(targetIndex);
    } else {
      // Service might be in a different category — reset filter to all and retry
      activeFilter = 'all';
      renderGrid();
      filters.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      const retryIndex = filtered.findIndex(s => s.id === serviceParam);
      if (retryIndex !== -1) openDrawer(retryIndex);
    }
  }
})();

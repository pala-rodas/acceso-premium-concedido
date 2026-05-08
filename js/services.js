/* ===== SERVICES PAGE ===== */
(async function () {
  let services = [];
  let filtered = [];
  let activeFilter = 'all';
  let searchQuery = '';
  let drawerIndex = 0;

  const grid = document.getElementById('services-grid');
  const upcomingGrid = document.getElementById('upcoming-grid');
  const filters = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('service-search');
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
      proximamente: 'Próximamente'
    };
    return map[cat] || cat;
  }

  function renderPills(categories) {
    const cats = Array.isArray(categories) ? categories : [categories];
    return cats
      .filter(c => c !== 'proximamente')
      .map(c => `<span class="pill pill--cat">${categoryLabel(c)}</span>`)
      .join('');
  }

  function renderGrid() {
    if (!grid) return;

    if (searchQuery) {
      filtered = activeServices.filter(s =>
        s.name.toLowerCase().includes(searchQuery)
      );
    } else if (activeFilter === 'all') {
      filtered = activeServices;
    } else if (activeFilter === 'proximamente') {
      filtered = upcomingServices;
    } else {
      filtered = activeServices.filter(s =>
        Array.isArray(s.category)
          ? s.category.includes(activeFilter)
          : s.category === activeFilter
      );
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<p style="color:#bbb;text-align:center;padding:40px;grid-column:1/-1;">No se encontraron servicios con ese nombre.</p>';
      return;
    }

    const isUpcoming = !searchQuery && activeFilter === 'proximamente';
    grid.innerHTML = filtered.map((s, i) => `
      <div class="card service-card${isUpcoming ? ' upcoming' : ''}" data-index="${i}" role="button" tabindex="0" aria-label="Ver detalle: ${s.name}">
        <div class="service-card__top">
          ${isUpcoming
            ? '<span class="pill pill--upcoming">Próximamente</span>'
            : renderPills(s.category)}
        </div>
        <h3>${s.name}</h3>
        <p class="short-desc">${s.shortDesc}</p>
        <div class="service-card__footer">
          <span class="cost-mini">${s.cost}</span>
          <button class="btn-detail">Ver detalle →</button>
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

    upcomingGrid.innerHTML = upcomingServices.map((s, i) => `
      <div class="card service-card upcoming" data-upcoming-index="${i}" role="button" tabindex="0" aria-label="Ver detalle: ${s.name}">
        <div class="service-card__top">
          <span class="pill pill--upcoming">Próximamente</span>
        </div>
        <h3>${s.name}</h3>
        <p class="short-desc">${s.shortDesc}</p>
        <div class="service-card__footer">
          <span class="cost-mini">${s.cost}</span>
          <button class="btn-detail">Ver detalle →</button>
        </div>
      </div>
    `).join('');

    upcomingGrid.querySelectorAll('.service-card').forEach(card => {
      const open = () => {
        const idx = parseInt(card.dataset.upcomingIndex);
        filtered = upcomingServices;
        openDrawer(idx);
      };
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
    });
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

    const pillsHTML = Array.isArray(s.category) && !s.category.includes('proximamente')
      ? renderPills(s.category)
      : '<span class="pill pill--upcoming">Próximamente</span>';

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

    const technicalNoteHTML = s.technicalNote
      ? `<div class="drawer-note">${s.technicalNote}</div>`
      : '';

    const promotionalNoteHTML = s.promotionalNote
      ? `<div class="drawer-note drawer-note--promo">${s.promotionalNote}</div>`
      : '';

    const functionHTML = s.function
      ? `<h4>Función</h4><p style="font-size:0.88rem;color:var(--text-secondary);margin-bottom:24px;font-style:italic;">${s.function}</p>`
      : '';

    drawerContent.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">${pillsHTML}</div>
      <h3>${s.name}</h3>
      <p class="description">${s.description}</p>
      <div class="cost">${s.cost}</div>
      ${componentsHTML}
      ${benefitsHTML}
      ${sideEffectsHTML}
      ${functionHTML}
      ${technicalNoteHTML}
      ${promotionalNoteHTML}
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

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      renderGrid();
    });
  }

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

  // Legend accordion
  const legend = document.getElementById('payment-legend');
  const legendToggle = document.getElementById('legend-toggle');
  if (legend && legendToggle) {
    legendToggle.addEventListener('click', () => {
      const isOpen = legend.classList.toggle('open');
      legendToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  renderGrid();
  renderUpcoming();

  // Auto-open drawer if ?service=ID comes from home page cards
  const serviceParam = new URLSearchParams(window.location.search).get('service');
  if (serviceParam) {
    const targetIndex = filtered.findIndex(s => s.id === serviceParam);
    if (targetIndex !== -1) {
      openDrawer(targetIndex);
    } else {
      activeFilter = 'all';
      renderGrid();
      filters.forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
      const retryIndex = filtered.findIndex(s => s.id === serviceParam);
      if (retryIndex !== -1) openDrawer(retryIndex);
    }
  }
})();

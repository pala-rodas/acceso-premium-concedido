/* ===== INVOICES PAGE ===== */
(async function () {
  let invoices = [];
  let services = [];
  let currentInvoiceId = null;

  const isAdmin = new URLSearchParams(window.location.search).get('admin') === '1';

  const monthTabs = document.getElementById('month-tabs');
  const invoiceView = document.getElementById('invoice-view');
  const historialList = document.getElementById('historial-list');
  const globalTotals = document.getElementById('global-totals');
  const adminSection = document.getElementById('admin-section');
  const adminBanner = document.getElementById('admin-banner');

  try {
    const [invRes, svcRes] = await Promise.all([
      fetch('data/invoices.json'),
      fetch('data/services.json')
    ]);
    const invData = await invRes.json();
    const svcData = await svcRes.json();
    invoices = invData.invoices;
    services = svcData.services;
  } catch (e) {
    if (invoiceView) invoiceView.innerHTML = '<p style="color:#bbb;text-align:center;padding:40px;">Error cargando facturas.</p>';
    return;
  }

  const published = invoices.filter(i => i.status === 'published');

  // ===== UNIT LABELS =====
  function unitLabel(key, val) {
    const labels = {
      besos: 'B', abrazos: 'A', noches: 'N', comidas: 'C',
      horas: 'H', planes: 'P', sonrisas: 'S', mensajesEmocionales: 'ME', sesiones: 'Ses'
    };
    const names = {
      besos: 'besos', abrazos: 'abrazos', noches: 'noches', comidas: 'comidas',
      horas: 'horas', planes: 'planes', sonrisas: 'sonrisas', mensajesEmocionales: 'mensajes', sesiones: 'sesiones'
    };
    return `${val} ${names[key] || key}`;
  }

  function totalString(total) {
    return Object.entries(total)
      .map(([k, v]) => unitLabel(k, v))
      .join(' · ');
  }

  // ===== RENDER MONTH TABS =====
  function renderTabs() {
    if (!monthTabs) return;
    monthTabs.innerHTML = published.map(inv => `
      <button class="month-tab${inv.id === currentInvoiceId ? ' active' : ''}"
              data-id="${inv.id}">${inv.month}</button>
    `).join('');

    monthTabs.querySelectorAll('.month-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        currentInvoiceId = btn.dataset.id;
        renderTabs();
        renderInvoice();
      });
    });
  }

  // ===== RENDER INVOICE =====
  function renderInvoice() {
    if (!invoiceView) return;
    const inv = published.find(i => i.id === currentInvoiceId);
    if (!inv) { invoiceView.innerHTML = ''; return; }

    const dateStr = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    const rowsHTML = inv.items.map(item => {
      const costStr = Object.entries(item.cost).map(([k, v]) => unitLabel(k, v)).join(' + ');
      return `
        <tr>
          <td>
            <div class="td-name">${item.serviceName}</div>
            <div class="td-type">${item.type}${item.quantity > 1 ? ` × ${item.quantity}` : ''}</div>
          </td>
          <td>${costStr}</td>
        </tr>
      `;
    }).join('');

    const totalsHTML = Object.entries(inv.total).map(([k, v]) => `
      <div class="total-item">
        <div class="t-label">${k.charAt(0).toUpperCase() + k.slice(1)}</div>
        <div class="t-value">${v}</div>
      </div>
    `).join('');

    invoiceView.innerHTML = `
      <div class="invoice-doc">
        <div class="invoice-header">
          <div>
            <div class="inv-ref">Factura afectiva</div>
            <h2>${inv.month}</h2>
            <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:6px;">Ref. PAU & ZABI-${inv.id}</div>
          </div>
          <div class="invoice-meta">
            <div class="inv-label">Fecha de emisión</div>
            <div class="inv-value">${dateStr}</div>
            <div class="inv-label">Estado</div>
            <div class="inv-value" style="color:#86efac;">Publicada</div>
          </div>
        </div>
        <div class="invoice-parties">
          <div class="invoice-party">
            <div class="p-label">Proveedora</div>
            <div class="p-name">Paula Rodas Ruiz</div>
            <div class="p-detail">Barcelona, España</div>
          </div>
          <div class="invoice-party">
            <div class="p-label">Clienta</div>
            <div class="p-name">Zabi</div>
            <div class="p-detail">Madrid, España · 621 km</div>
          </div>
        </div>
        <div class="invoice-table">
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th style="text-align:right;">Coste</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
        <div class="invoice-total">${totalsHTML}</div>
        ${inv.note ? `<div class="invoice-note">"${inv.note}"</div>` : ''}
      </div>
    `;
  }

  // ===== RENDER HISTORIAL =====
  function renderHistorial() {
    if (!historialList) return;

    historialList.innerHTML = `<div class="accordion">${
      published.map(inv => `
        <div class="accordion-item">
          <button class="accordion-trigger" aria-expanded="false" data-target="acc-${inv.id}">
            <span class="acc-month">${inv.month}</span>
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:0.8rem;color:var(--text-secondary);font-weight:400;">${totalString(inv.total)}</span>
              <span class="acc-arrow">▾</span>
            </div>
          </button>
          <div class="accordion-body" id="acc-${inv.id}">
            <table style="width:100%;border-collapse:collapse;">
              ${inv.items.map(item => `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:10px 0;font-size:0.875rem;">${item.serviceName}</td>
                  <td style="padding:10px 0;font-size:0.875rem;text-align:right;color:var(--gold);font-family:Georgia,serif;">
                    ${Object.entries(item.cost).map(([k, v]) => unitLabel(k, v)).join(' + ')}
                  </td>
                </tr>
              `).join('')}
            </table>
            ${inv.note ? `<p style="font-size:0.8rem;font-style:italic;color:#bbb;margin-top:16px;">"${inv.note}"</p>` : ''}
          </div>
        </div>
      `).join('')
    }</div>`;

    historialList.querySelectorAll('.accordion-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        const body = document.getElementById(btn.dataset.target);
        btn.setAttribute('aria-expanded', !isOpen);
        body.classList.toggle('open', !isOpen);
      });
    });
  }

  // ===== RENDER GLOBAL TOTALS =====
  function renderGlobalTotals() {
    if (!globalTotals) return;

    const totals = {};
    published.forEach(inv => {
      Object.entries(inv.total).forEach(([k, v]) => {
        totals[k] = (totals[k] || 0) + v;
      });
    });

    globalTotals.innerHTML = `
      <div class="resumen-total">
        <div class="r-label">Totales acumulados · Desde noviembre 2025</div>
        <div class="r-values">
          ${Object.entries(totals).map(([k, v]) => `<span>${v}</span> ${k}`).join(' · ')}
        </div>
      </div>
    `;
  }

  // ===== ADMIN: INVOICE GENERATOR =====
  function initAdmin() {
    if (!adminSection) return;
    adminSection.style.display = 'block';
    if (adminBanner) adminBanner.style.display = 'block';

    const activeServices = services.filter(s => s.status === 'active');

    adminSection.innerHTML = `
      <div class="admin-section">
        <h2>Generador de factura mensual</h2>
        <p style="font-size:0.875rem;color:var(--admin);margin-bottom:28px;opacity:0.8;">
          Activa los servicios del mes, ajusta cantidades y copia el JSON resultante para subir a GitHub.
        </p>

        <div class="form-group">
          <label>Mes (formato: YYYY-MM)</label>
          <input type="text" id="admin-month-id" placeholder="2026-06" />
        </div>
        <div class="form-group">
          <label>Nombre del mes</label>
          <input type="text" id="admin-month-name" placeholder="Junio 2026" />
        </div>

        <div style="margin-bottom:24px;">
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--admin);font-weight:600;margin-bottom:16px;">
            Servicios del mes
          </div>
          ${activeServices.map(s => `
            <div class="admin-service-row">
              <input type="checkbox" id="chk-${s.id}" data-service-id="${s.id}" />
              <label for="chk-${s.id}">${s.name}</label>
              <span style="font-size:0.78rem;color:#888;">${s.cost}</span>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:0.75rem;color:#aaa;">×</span>
                <input type="number" id="qty-${s.id}" value="1" min="1" max="99" style="opacity:0.4;" disabled />
              </div>
            </div>
          `).join('')}
        </div>

        <div class="form-group">
          <label>Nota del mes (opcional)</label>
          <textarea id="admin-note" placeholder="Algo sobre este mes..."></textarea>
        </div>

        <div class="admin-total" id="admin-total-preview">
          Selecciona servicios para ver el total.
        </div>

        <button class="btn btn--admin" id="generate-json-btn" style="margin-bottom:16px;">
          Generar JSON
        </button>

        <div id="json-output" style="display:none;">
          <div class="json-preview" id="json-text"></div>
          <div class="admin-note">
            <strong>¿Cómo publicar?</strong><br>
            1. Copia el JSON de arriba.<br>
            2. Abre <code>data/invoices.json</code> en GitHub.<br>
            3. Haz click en el lápiz ✏️ para editar.<br>
            4. Pega el JSON nuevo en el campo "invoices" (añade la nueva factura al array).<br>
            5. Guarda el commit. GitHub Pages actualizará automáticamente.
          </div>
          <button class="btn btn--ghost" id="copy-json-btn" style="margin-top:12px;">
            Copiar al portapapeles
          </button>
        </div>
      </div>
    `;

    // Enable/disable quantity inputs
    adminSection.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', () => {
        const qty = document.getElementById(`qty-${chk.dataset.serviceId}`);
        qty.disabled = !chk.checked;
        qty.style.opacity = chk.checked ? '1' : '0.4';
        updateAdminTotal();
      });
    });

    adminSection.querySelectorAll('input[type="number"]').forEach(inp => {
      inp.addEventListener('input', updateAdminTotal);
    });

    function updateAdminTotal() {
      const total = {};
      adminSection.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
        const s = services.find(sv => sv.id === chk.dataset.serviceId);
        if (!s || !s.costDetail) return;
        Object.entries(s.costDetail).forEach(([k, v]) => {
          total[k] = (total[k] || 0) + v;
        });
      });

      const preview = document.getElementById('admin-total-preview');
      if (Object.keys(total).length === 0) {
        preview.textContent = 'Selecciona servicios para ver el total.';
      } else {
        preview.textContent = 'Total estimado: ' + Object.entries(total).map(([k, v]) => `${v} ${k}`).join(' · ');
      }
    }

    document.getElementById('generate-json-btn').addEventListener('click', () => {
      const id = document.getElementById('admin-month-id').value.trim();
      const name = document.getElementById('admin-month-name').value.trim();
      const note = document.getElementById('admin-note').value.trim();

      if (!id || !name) {
        alert('Completa el ID y el nombre del mes.');
        return;
      }

      const items = [];
      const total = {};

      adminSection.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
        const s = services.find(sv => sv.id === chk.dataset.serviceId);
        if (!s) return;
        const qty = parseInt(document.getElementById(`qty-${s.id}`).value) || 1;

        const cost = {};
        if (s.costDetail) {
          Object.entries(s.costDetail).forEach(([k, v]) => {
            cost[k] = v;
            total[k] = (total[k] || 0) + v * qty;
          });
        }

        items.push({
          serviceId: s.id,
          serviceName: s.name,
          type: 'prestación',
          quantity: qty,
          cost
        });
      });

      const newInvoice = { id, month: name, status: 'published', items, total };
      if (note) newInvoice.note = note;

      const allInvoices = [...invoices, newInvoice];
      const json = JSON.stringify({ invoices: allInvoices }, null, 2);

      const output = document.getElementById('json-output');
      const jsonText = document.getElementById('json-text');
      output.style.display = 'block';
      jsonText.textContent = json;
    });

    document.getElementById('copy-json-btn')?.addEventListener('click', () => {
      const text = document.getElementById('json-text').textContent;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-json-btn');
        btn.textContent = '¡Copiado!';
        setTimeout(() => { btn.textContent = 'Copiar al portapapeles'; }, 2000);
      });
    });
  }

  // ===== INIT =====
  if (published.length > 0) {
    currentInvoiceId = published[published.length - 1].id;
  }

  renderTabs();
  renderInvoice();
  renderHistorial();
  renderGlobalTotals();

  if (isAdmin) initAdmin();
})();

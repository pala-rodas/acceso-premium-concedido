/* ===== ACCESO PREMIUM ===== */
(function () {
  // --- CONFIGURACIÓN DE CÓDIGO ---
  // Por defecto el código es la fecha actual en formato DDMM (ej: 16 de mayo → 1605)
  // Para usar un código fijo, descomenta esta constante y úsala en validateAccess():
  // const FIXED_CODE = '1605';

  function getTodayCode() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    return dd + mm;
  }

  function validateAccess(inputCode) {
    // Para código fijo: return inputCode === FIXED_CODE;
    return inputCode === getTodayCode();
  }

  function showMainContent() {
    const overlay = document.getElementById("access-overlay");
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.transition = "opacity 0.3s";
      setTimeout(() => overlay.remove(), 300);
    }
    document.body.style.overflow = "";
  }

  function showAccessForm() {
    const overlay = document.createElement("div");
    overlay.id = "access-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;background:var(--bg);z-index:9999;" +
      "display:flex;align-items:center;justify-content:center;padding:24px;";

    overlay.innerHTML = `
      <div style="text-align:center;max-width:360px;width:100%;">
        <div class="divider" style="margin:0 auto 40px;">— ✦ —</div>
        <span class="label" style="display:block;margin-bottom:16px;">PAU &amp; ZABI · 2026</span>
        <h2 style="font-family:var(--font-serif);font-size:clamp(1.4rem,4vw,2rem);font-weight:normal;margin-bottom:12px;color:var(--text);">Acceso restringido</h2>
        <p style="color:var(--text-secondary);font-size:0.95rem;margin-bottom:32px;">Introduce tu código premium</p>
        <input
          id="access-input"
          type="text"
          inputmode="numeric"
          pattern="[0-9]*"
          maxlength="4"
          placeholder="0000"
          autocomplete="off"
          style="display:block;width:100%;max-width:180px;margin:0 auto 8px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-btn);font-family:var(--font-sans);font-size:1.6rem;letter-spacing:0.4em;text-align:center;color:var(--text);outline:none;transition:border-color 0.2s;"
        />
        <p style="font-size:0.72rem;color:var(--text-muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:28px;">Formato: DDMM</p>
        <button id="access-btn" class="btn btn--solid" style="width:100%;justify-content:center;">Activar acceso</button>
        <p id="access-error" style="color:var(--gold-dark);font-size:0.85rem;margin-top:16px;min-height:1.4em;font-style:italic;"></p>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const input = overlay.querySelector("#access-input");
    const btn = overlay.querySelector("#access-btn");
    const error = overlay.querySelector("#access-error");

    input.addEventListener("focus", () => {
      input.style.borderColor = "var(--gold)";
    });
    input.addEventListener("blur", () => {
      input.style.borderColor = "var(--border)";
    });

    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "").slice(0, 4);
      error.textContent = "";
      if (input.value.length === 4) attempt();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });
    btn.addEventListener("click", attempt);

    function attempt() {
      if (validateAccess(input.value)) {
        localStorage.setItem("premiumAccessGranted", "1");
        showMainContent();
      } else {
        error.textContent = "Código incorrecto. Pista: hoy es importante.";
        input.style.borderColor = "var(--gold-dark)";
        input.value = "";
        setTimeout(() => input.focus(), 0);
      }
    }

    input.focus();
  }

  if (!localStorage.getItem("premiumAccessGranted")) {
    showAccessForm();
  }
})();

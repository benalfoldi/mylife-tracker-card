/**
 * MyLife Tracker Lovelace card v1.3 — themed compact table
 */
const MLTC_VERSION = "1.3.0";
const MLTC_STYLE_ID = "mylife-tracker-card-styles-v4";

const MLTC_LOGO_SVG = `<svg viewBox="0 0 100 100" width="18" height="18" aria-hidden="true">
  <defs><linearGradient id="mlg" x1="15" y1="15" x2="85" y2="85"><stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#1e3a8a"/></linearGradient></defs>
  <path d="M50 14L16 44H30V84H70V44H84L50 14Z" stroke="url(#mlg)" stroke-width="8" stroke-linejoin="round" fill="none"/>
  <path d="M50 72V42M50 42L36 56M50 42L64 56" stroke="url(#mlg)" stroke-width="8" stroke-linecap="round"/>
</svg>`;

const MLTC_BILL_COLS = {
  type: { label: "Típus", w: "24%" },
  household: { label: "HH", w: "12%" },
  period: { label: "Időszak", w: "14%" },
  due_date: { label: "Határidő", w: "16%" },
  amount: { label: "Összeg", w: "18%", num: true },
  note: { label: "Megj.", w: "22%" },
};

const MLTC_EXTRA_COLS = {
  description: { label: "Leírás", w: "34%" },
  type: { label: "Típus", w: "12%" },
  household: { label: "HH", w: "10%" },
  period: { label: "Időszak", w: "12%" },
  due_date: { label: "Határidő", w: "14%" },
  amount: { label: "Összeg", w: "18%", num: true },
};

const MLTC_DOC_COLS = {
  name: { label: "Név", w: "30%" },
  person: { label: "Személy", w: "16%" },
  type: { label: "Típus", w: "14%" },
  date: { label: "Lejárat", w: "16%" },
  days: { label: "Nap", w: "10%", num: true },
};

function mltcIsDark(hass) {
  try {
    const th = hass?.selectedTheme;
    if (th && hass.themes?.[th]?.modes?.dark) return true;
    if (hass.themes?.darkMode) return true;
  } catch (_e) { /* ignore */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function mltcEnsureStyles() {
  let el = document.getElementById(MLTC_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = MLTC_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    mylife-tracker-card { display: block; }
    mylife-tracker-card ha-card {
      --ha-card-border-width: 0px;
      --ha-card-box-shadow: 0 2px 8px rgba(11,19,43,.12);
      overflow: hidden;
      border-radius: 12px;
    }

    /* Brand tokens (MyLife app) */
    .mltc {
      --mltc-navy: #0b132b;
      --mltc-navy-mid: #0d1b2a;
      --mltc-teal: #10b981;
      --mltc-teal-lt: #34d399;
      --mltc-ios: #007ba7;
      --mltc-blue: #1a6fd4;
      --mltc-amber: #d97706;
      --mltc-red: #dc2626;
      --mltc-surface: var(--card-background-color, var(--ha-card-background, #fff));
      --mltc-surface2: var(--secondary-background-color, #f8fafc);
      --mltc-text: var(--primary-text-color, #1e293b);
      --mltc-muted: var(--secondary-text-color, #64748b);
      --mltc-border: var(--divider-color, rgba(15,23,42,.1));
      font: 0.72rem/1.2 var(--ha-font-family, 'Segoe UI', Roboto, sans-serif);
      color: var(--mltc-text);
      background: var(--mltc-surface);
    }
    .mltc--dark {
      --mltc-surface2: var(--secondary-background-color, #1c2230);
      --ha-card-box-shadow: 0 2px 12px rgba(0,0,0,.45);
    }

    /* ── Brand header (matches app nav) ── */
    .mltc--brand .mltc-bar {
      background: linear-gradient(135deg, var(--mltc-navy) 0%, var(--mltc-navy-mid) 100%);
      border-bottom: 1px solid rgba(255,255,255,.08);
      color: #e6edf3;
      box-shadow: 0 2px 8px rgba(11,19,43,.25);
    }
    .mltc--brand .mltc-bar-title { color: #fff; letter-spacing: .01em; }
    .mltc--brand .mltc-bar-sub { color: rgba(255,255,255,.55); }
    .mltc--brand .mltc-logo {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
    }

    /* ── HA-native header ── */
    .mltc--ha .mltc-bar {
      background: var(--mltc-surface2);
      border-bottom: 1px solid var(--mltc-border);
    }
    .mltc--ha .mltc-logo {
      background: linear-gradient(135deg, rgba(20,184,166,.15), rgba(30,58,138,.12));
      border: 1px solid var(--mltc-border);
    }

    .mltc-bar {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 8px 10px;
    }
    .mltc-brand { display: flex; align-items: center; gap: 8px; min-width: 0; }
    .mltc-logo {
      width: 30px; height: 30px; border-radius: 8px;
      display: grid; place-items: center; flex-shrink: 0;
    }
    .mltc-bar-title { font-weight: 700; font-size: 0.82rem; line-height: 1.1; }
    .mltc-bar-sub { font-size: 0.62rem; margin-top: 2px; }

    .mltc-pills { display: flex; gap: 4px; flex-shrink: 0; }
    .mltc-pill {
      min-width: 1.3rem; padding: 0 7px; height: 1.3rem; line-height: 1.3rem;
      border-radius: 999px; font-size: 0.68rem; font-weight: 700; text-align: center;
    }
    .mltc-pill--a { background: var(--mltc-teal); color: #fff; }
    .mltc-pill--d { background: var(--mltc-amber); color: #fff; }
    .mltc-pill--p { background: var(--mltc-red); color: #fff; }
    .mltc-pill--z { opacity: .3; background: var(--mltc-border); color: var(--mltc-muted); }

    .mltc-sec { border-bottom: 1px solid var(--mltc-border); }
    .mltc-sec:last-child { border-bottom: none; }
    .mltc-sec-h {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 10px 3px; font-size: 0.62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .06em;
      color: var(--mltc-muted);
      border-left: 3px solid var(--mltc-teal);
      margin: 6px 8px 0;
      padding-left: 8px;
    }
    .mltc-sec-h--extra { border-left-color: var(--mltc-ios); }
    .mltc-sec-h--doc { border-left-color: var(--mltc-amber); }

    .mltc-scroll {
      max-height: var(--mltc-h, 110px); overflow: auto;
      margin: 0; padding: 2px 6px 6px;
    }
    .mltc-scroll::-webkit-scrollbar { width: 4px; height: 4px; }
    .mltc-scroll::-webkit-scrollbar-thumb {
      background: var(--mltc-teal); border-radius: 4px; opacity: .5;
    }

    .mltc-tbl { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .mltc-tbl th {
      padding: 3px 6px; font-size: 0.58rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .05em;
      color: var(--mltc-muted);
      text-align: left;
      border-bottom: 2px solid var(--mltc-border);
      background: var(--mltc-surface2);
      position: sticky; top: 0; z-index: 1;
    }
    .mltc--brand .mltc-tbl th {
      background: rgba(16,185,129,.06);
      border-bottom-color: rgba(16,185,129,.2);
    }
    .mltc-tbl td {
      padding: 3px 6px; height: 1.4rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      border-bottom: 1px solid var(--mltc-border);
      vertical-align: middle;
    }
    .mltc-tbl tr:last-child td { border-bottom: none; }
    .mltc-tbl tbody tr:nth-child(even) td { background: rgba(16,185,129,.04); }
    .mltc--dark .mltc-tbl tbody tr:nth-child(even) td { background: rgba(255,255,255,.03); }
    .mltc-tbl tbody tr:hover td { background: rgba(16,185,129,.1); }
    .mltc-tbl .n {
      text-align: right; font-variant-numeric: tabular-nums;
      font-weight: 700; color: var(--mltc-blue);
    }
    .mltc--dark .mltc-tbl .n { color: #5eb0ff; }
    .mltc-tbl tr.bad td { color: var(--mltc-red); }
    .mltc-tbl tr.warn td { color: var(--mltc-amber); }

    .mltc-foot {
      padding: 2px 10px 6px; font-size: 0.58rem;
      color: var(--mltc-muted); text-align: right;
    }
    .mltc-ok {
      padding: 14px; text-align: center; font-size: 0.75rem;
      color: var(--mltc-teal); font-weight: 600;
    }
    .mltc--brand .mltc-ok { background: rgba(16,185,129,.06); }
    .mltc-err { padding: 10px; color: var(--mltc-red); font-size: 0.75rem; }
  `;
}

function mltcEsc(t) {
  return String(t ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mltcMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency", currency: currency || "HUF", maximumFractionDigits: 0,
    }).format(n);
  } catch (_e) {
    return `${n.toLocaleString("hu-HU")} Ft`;
  }
}

function mltcPeriod(year, month) {
  if (!year || !month) return "—";
  return `${year}/${String(month).padStart(2, "0")}`;
}

/** Drop items with billing year strictly before minYear. */
function mltcFilterYear(items, minYear) {
  const min = Number(minYear) || 2025;
  return (items || []).filter((i) => {
    const yr = Number(i.year);
    return Number.isFinite(yr) && yr >= min;
  });
}

function mltcCols(all, selected) {
  const keys = Array.isArray(selected) && selected.length ? selected : Object.keys(all);
  return keys.filter((k) => all[k]);
}

function mltcTable(allCols, selectedCols, rows, rowCls) {
  const cols = mltcCols(allCols, selectedCols);
  if (!cols.length) return '<div class="mltc-ok">—</div>';
  if (!rows.length) return '<div class="mltc-ok">—</div>';
  const th = cols.map((k) => {
    const c = allCols[k];
    return `<th class="${c.num ? "n" : ""}" style="width:${c.w}">${mltcEsc(c.label)}</th>`;
  }).join("");
  const tr = rows.map((r) => {
    const td = cols.map((k) => {
      const c = allCols[k];
      return `<td class="${c.num ? "n" : ""}">${mltcEsc(r[k] ?? "—")}</td>`;
    }).join("");
    const cls = rowCls ? rowCls(r) : "";
    return `<tr class="${cls}">${td}</tr>`;
  }).join("");
  return `<table class="mltc-tbl"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

class MyLifeTrackerCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:mylife-tracker-card",
      entity: "sensor.mylife_tracker_status",
      min_year: 2025,
      max_rows: 8,
      max_height: 110,
      show_header: true,
      show_bills: true,
      show_extra_costs: true,
      show_documents: false,
      theme: "brand",
      bill_columns: ["type", "household", "period", "amount"],
      extra_columns: ["description", "period", "amount"],
      doc_columns: ["name", "date", "days"],
    };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("entity required");
    const defaults = MyLifeTrackerCard.getStubConfig();
    this._config = {
      ...defaults,
      ...config,
      min_year: Number(config.min_year ?? defaults.min_year) || 2025,
      max_rows: Number(config.max_rows ?? defaults.max_rows) || 8,
      max_height: Number(config.max_height ?? defaults.max_height) || 110,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 2;
  }

  _billRow(b) {
    return {
      type: b.type || "—",
      household: b.household_id || "—",
      period: mltcPeriod(b.year, b.month),
      due_date: b.due_date ? String(b.due_date).slice(0, 10) : "—",
      amount: mltcMoney(b.amount, b.currency),
      note: (b.note || "").slice(0, 24) || "—",
    };
  }

  _extraRow(x) {
    return {
      description: (x.description || x.type || "—").slice(0, 28),
      type: x.type || "—",
      household: x.household_id || "—",
      period: mltcPeriod(x.year, x.month),
      due_date: x.due_date ? String(x.due_date).slice(0, 10) : "—",
      amount: mltcMoney(x.amount, x.currency),
    };
  }

  _docRow(d) {
    const days = Number(d.days);
    return {
      name: (d.name || d.type || "—").slice(0, 20),
      person: d.person || "—",
      type: d.type || "—",
      date: d.date || "—",
      days: Number.isFinite(days) ? String(days) : "—",
      _days: days,
    };
  }

  _sec(title, table, total, max, secClass = "") {
    const more = total > max ? `<div class="mltc-foot">+${total - max} további</div>` : "";
    return `
      <div class="mltc-sec">
        <div class="mltc-sec-h ${secClass}">${mltcEsc(title)} <span style="opacity:.7">(${total})</span></div>
        <div class="mltc-scroll">${table}</div>
        ${more}
      </div>`;
  }

  _render() {
    if (!this._config || !this._hass) return;
    mltcEnsureStyles();

    const cfg = this._config;
    const st = this._hass.states[cfg.entity];
    if (!st) {
      this.innerHTML = `<ha-card><div class="mltc-err">Missing: ${mltcEsc(cfg.entity)}</div></ha-card>`;
      return;
    }

    const a = st.attributes || {};
    const minY = Number(cfg.min_year) || 2025;
    const maxR = Number(cfg.max_rows) || 8;
    const maxH = Number(cfg.max_height) || 110;

    const bills = mltcFilterYear(a.unpaid_bills || [], minY);
    const extra = mltcFilterYear(a.unpaid_extra_costs || [], minY);
    const docs = [...(a.expired_docs || []), ...(a.warning_docs || [])];

    const payN = bills.length + extra.length;
    const docN = docs.length;
    const totalN = payN + docN;

    const pill = (n, on, cls) =>
      `<span class="mltc-pill ${n ? cls : "mltc-pill--z"}">${n}</span>`;

    const parts = [];
    if (cfg.show_bills !== false) {
      parts.push(this._sec(
        "Számlák",
        mltcTable(MLTC_BILL_COLS, cfg.bill_columns, bills.slice(0, maxR).map((b) => this._billRow(b))),
        bills.length,
        maxR,
        ""
      ));
    }
    if (cfg.show_extra_costs !== false) {
      parts.push(this._sec(
        "Extra költségek",
        mltcTable(MLTC_EXTRA_COLS, cfg.extra_columns, extra.slice(0, maxR).map((x) => this._extraRow(x))),
        extra.length,
        maxR,
        "mltc-sec-h--extra"
      ));
    }
    if (cfg.show_documents !== false) {
      parts.push(this._sec(
        "Okmányok",
        mltcTable(MLTC_DOC_COLS, cfg.doc_columns, docs.slice(0, maxR).map((d) => this._docRow(d)), (r) =>
          r._days < 0 ? "bad" : r._days <= 60 ? "warn" : ""
        ),
        docs.length,
        maxR,
        "mltc-sec-h--doc"
      ));
    }

    const theme = cfg.theme === "ha" ? "ha" : "brand";
    const dark = mltcIsDark(this._hass) ? " mltc--dark" : "";

    const hdr = cfg.show_header !== false ? `
      <div class="mltc-bar">
        <div class="mltc-brand">
          <div class="mltc-logo">${MLTC_LOGO_SVG}</div>
          <div>
            <div class="mltc-bar-title">MyLife Tracker</div>
            <div class="mltc-bar-sub">≥ ${minY} · v${MLTC_VERSION}</div>
          </div>
        </div>
        <div class="mltc-pills">
          ${pill(totalN, totalN > 0, "mltc-pill--a")}
          ${pill(docN, docN > 0, "mltc-pill--d")}
          ${pill(payN, payN > 0, "mltc-pill--p")}
        </div>
      </div>` : "";

    const body = parts.length && (bills.length || extra.length || docs.length)
      ? parts.join("")
      : '<div class="mltc-ok">✓ Nincs függő tétel</div>';

    this.innerHTML = `
      <ha-card>
        <div class="mltc mltc--${theme}${dark}" style="--mltc-h:${maxH}px">${hdr}${body}</div>
      </ha-card>`;
  }
}

class MyLifeTrackerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...MyLifeTrackerCard.getStubConfig(), ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _emit() {
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _set(key, val) {
    this._config = { ...this._config, [key]: val };
    this._emit();
  }

  _colBox(title, prefix, allCols, selected) {
    const sel = new Set(selected || []);
    const boxes = Object.entries(allCols).map(([k, c]) =>
      `<label style="display:block;font-size:11px;margin:2px 0">
        <input type="checkbox" data-p="${prefix}" data-k="${k}" ${sel.has(k) ? "checked" : ""}/> ${mltcEsc(c.label)}
      </label>`
    ).join("");
    return `<fieldset style="margin:0;padding:6px 8px;border:1px solid var(--divider-color,#ddd)">
      <legend style="font-size:11px">${mltcEsc(title)}</legend>${boxes}</fieldset>`;
  }

  _render() {
    const c = this._config;
    this.innerHTML = `
      <div style="padding:10px;display:flex;flex-direction:column;gap:8px;font-size:12px">
        <div style="font-weight:700;color:var(--primary-color)">MyLife card v${MLTC_VERSION}</div>
        <label>Theme
          <select class="theme" style="width:100%;margin-top:2px">
            <option value="brand">MyLife brand (navy + teal)</option>
            <option value="ha">Home Assistant native</option>
          </select>
        </label>
        <label>Entity<input class="e" style="width:100%;margin-top:2px"/></label>
        <label>Min year (hide older)<input class="y" type="number" style="width:100%;margin-top:2px"/></label>
        <label>Max rows<input class="r" type="number" min="3" max="30" style="width:100%;margin-top:2px"/></label>
        <label>Max height px<input class="h" type="number" min="60" max="300" style="width:100%;margin-top:2px"/></label>
        <label><input class="hdr" type="checkbox"/> Header</label>
        <label><input class="sb" type="checkbox"/> Számlák</label>
        ${this._colBox("Számla oszlopok", "bill", MLTC_BILL_COLS, c.bill_columns)}
        <label><input class="se" type="checkbox"/> Extra</label>
        ${this._colBox("Extra oszlopok", "extra", MLTC_EXTRA_COLS, c.extra_columns)}
        <label><input class="sd" type="checkbox"/> Okmány</label>
        ${this._colBox("Okmány oszlopok", "doc", MLTC_DOC_COLS, c.doc_columns)}
      </div>`;

    const q = (s) => this.querySelector(s);
    q(".e").value = c.entity || "";
    q(".theme").value = c.theme === "ha" ? "ha" : "brand";
    q(".y").value = c.min_year ?? 2025;
    q(".r").value = c.max_rows ?? 8;
    q(".h").value = c.max_height ?? 110;
    q(".hdr").checked = c.show_header !== false;
    q(".sb").checked = c.show_bills !== false;
    q(".se").checked = c.show_extra_costs !== false;
    q(".sd").checked = c.show_documents !== false;

    q(".e").onchange = (e) => this._set("entity", e.target.value);
    q(".theme").onchange = (e) => this._set("theme", e.target.value);
    q(".y").onchange = (e) => this._set("min_year", Number(e.target.value) || 2025);
    q(".r").onchange = (e) => this._set("max_rows", Number(e.target.value) || 8);
    q(".h").onchange = (e) => this._set("max_height", Number(e.target.value) || 110);
    q(".hdr").onchange = (e) => this._set("show_header", e.target.checked);
    q(".sb").onchange = (e) => this._set("show_bills", e.target.checked);
    q(".se").onchange = (e) => this._set("show_extra_costs", e.target.checked);
    q(".sd").onchange = (e) => this._set("show_documents", e.target.checked);

    ["bill", "extra", "doc"].forEach((p) => {
      const key = `${p}_columns`;
      this.querySelectorAll(`input[data-p="${p}"]`).forEach((el) => {
        el.onchange = () => {
          const cols = [...this.querySelectorAll(`input[data-p="${p}"]:checked`)].map((x) => x.dataset.k);
          this._set(key, cols.length ? cols : Object.keys(
            p === "bill" ? MLTC_BILL_COLS : p === "extra" ? MLTC_EXTRA_COLS : MLTC_DOC_COLS
          ));
        };
      });
    });
  }
}

customElements.define("mylife-tracker-card", MyLifeTrackerCard);
customElements.define("mylife-tracker-card-editor", MyLifeTrackerCardEditor);

window.customCards = window.customCards.filter((c) => c.type !== "mylife-tracker-card");
window.customCards.push({
  type: "mylife-tracker-card",
  name: `MyLife Tracker Card v${MLTC_VERSION}`,
  description: "Compact table — bills, extra costs, documents",
  preview: true,
  version: MLTC_VERSION,
});

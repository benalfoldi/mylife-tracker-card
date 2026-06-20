/**
 * MyLife Tracker Lovelace card — compact table layout
 */
const MLTC_STYLE_ID = "mylife-tracker-card-styles-v2";

const MLTC_BILL_COLS = {
  type: { label: "Típus", width: "22%" },
  household: { label: "HH", width: "14%" },
  period: { label: "Időszak", width: "14%" },
  due_date: { label: "Határidő", width: "16%" },
  amount: { label: "Összeg", width: "18%", align: "right" },
  note: { label: "Megjegyzés", width: "28%" },
};

const MLTC_EXTRA_COLS = {
  description: { label: "Leírás", width: "30%" },
  type: { label: "Típus", width: "14%" },
  household: { label: "HH", width: "12%" },
  period: { label: "Időszak", width: "14%" },
  due_date: { label: "Határidő", width: "14%" },
  amount: { label: "Összeg", width: "16%", align: "right" },
};

const MLTC_DOC_COLS = {
  name: { label: "Név", width: "28%" },
  person: { label: "Személy", width: "18%" },
  type: { label: "Típus", width: "14%" },
  date: { label: "Lejárat", width: "16%" },
  days: { label: "Nap", width: "10%", align: "right" },
};

function mltcEnsureStyles() {
  let style = document.getElementById(MLTC_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = MLTC_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    mylife-tracker-card { display: block; }
    .mltc { font-size: 0.78rem; line-height: 1.25; }
    .mltc-bar {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 8px 10px; border-bottom: 1px solid rgba(128,128,128,.2);
      background: var(--secondary-background-color);
    }
    .mltc-bar-title { font-weight: 700; font-size: 0.82rem; white-space: nowrap; }
    .mltc-bar-meta { font-size: 0.68rem; opacity: .65; }
    .mltc-pills { display: flex; gap: 4px; flex-shrink: 0; }
    .mltc-pill {
      min-width: 1.4rem; padding: 1px 7px; border-radius: 999px;
      font-size: 0.72rem; font-weight: 700; text-align: center;
    }
    .mltc-pill--on { background: var(--primary-color); color: var(--text-primary-color,#fff); }
    .mltc-pill--off { background: var(--divider-color, rgba(128,128,128,.25)); opacity: .55; }
    .mltc-pill--warn { background: #d97706; color: #fff; }
    .mltc-pill--bad { background: #dc2626; color: #fff; }
    .mltc-block { padding: 6px 8px 8px; }
    .mltc-block + .mltc-block { border-top: 1px solid rgba(128,128,128,.15); }
    .mltc-block-title {
      font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .04em; opacity: .75; margin: 0 0 4px 2px;
    }
    .mltc-scroll { max-height: var(--mltc-max-h, 140px); overflow: auto; }
    .mltc-table {
      width: 100%; border-collapse: collapse; table-layout: fixed;
    }
    .mltc-table th, .mltc-table td {
      padding: 3px 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      border-bottom: 1px solid rgba(128,128,128,.12);
    }
    .mltc-table th {
      font-size: 0.66rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: .03em; opacity: .7; text-align: left;
      position: sticky; top: 0; background: var(--card-background-color, var(--ha-card-background, #fff));
      z-index: 1;
    }
    .mltc-table tr:last-child td { border-bottom: none; }
    .mltc-table tr:nth-child(even) td { background: rgba(128,128,128,.06); }
    .mltc-table .num { text-align: right; font-variant-numeric: tabular-nums; }
    .mltc-table .warn td { color: #d97706; }
    .mltc-table .bad td { color: #dc2626; font-weight: 600; }
    .mltc-empty { padding: 10px; text-align: center; opacity: .65; font-size: 0.76rem; }
    .mltc-more { text-align: center; font-size: 0.68rem; opacity: .6; padding-top: 3px; }
    .mltc-ok { padding: 14px; text-align: center; opacity: .75; font-size: 0.8rem; }
    .mltc-err { padding: 12px; color: var(--error-color,#c62828); }
  `;
}

function mltcEsc(t) {
  return String(t ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function mltcMoney(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  try {
    return new Intl.NumberFormat("hu-HU", {
      style: "currency", currency: currency || "HUF", maximumFractionDigits: 0,
    }).format(n);
  } catch (_e) {
    return `${n.toLocaleString("hu-HU")} ${currency || "HUF"}`;
  }
}

function mltcPeriod(year, month) {
  if (!year || !month) return "—";
  return `${year}/${String(month).padStart(2, "0")}`;
}

function mltcFilterYear(items, minYear) {
  const y = Number(minYear) || 2025;
  return (items || []).filter((i) => {
    const yr = Number(i.year);
    return !Number.isFinite(yr) || yr >= y;
  });
}

function mltcPickCols(allCols, selected) {
  const keys = Array.isArray(selected) && selected.length ? selected : Object.keys(allCols);
  return keys.filter((k) => allCols[k]);
}

function mltcTable(allCols, selectedCols, rows, rowClassFn) {
  const cols = mltcPickCols(allCols, selectedCols);
  if (!cols.length) return '<div class="mltc-empty">Nincs oszlop beállítva</div>';
  if (!rows.length) return '<div class="mltc-empty">—</div>';
  const head = cols.map((k) => {
    const c = allCols[k];
    const cls = c.align === "right" ? " num" : "";
    return `<th class="${cls.trim()}" style="width:${c.width}">${mltcEsc(c.label)}</th>`;
  }).join("");
  const body = rows.map((r) => {
    const cls = rowClassFn ? rowClassFn(r) : "";
    const tds = cols.map((k) => {
      const c = allCols[k];
      const align = c.align === "right" ? " num" : "";
      return `<td class="${align.trim()}">${mltcEsc(r[k] ?? "—")}</td>`;
    }).join("");
    return `<tr class="${cls}">${tds}</tr>`;
  }).join("");
  return `<table class="mltc-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

class MyLifeTrackerCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:mylife-tracker-card",
      entity: "sensor.mylife_tracker_status",
      min_year: 2025,
      max_rows: 10,
      show_header: true,
      show_bills: true,
      show_extra_costs: true,
      show_documents: true,
      bill_columns: ["type", "household", "period", "amount"],
      extra_columns: ["description", "period", "amount"],
      doc_columns: ["name", "date", "days"],
    };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Set entity to sensor.mylife_tracker_status");
    this._config = { ...MyLifeTrackerCard.getStubConfig(), ...config };
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
      due_date: b.due_date || "—",
      amount: mltcMoney(b.amount, b.currency),
      note: (b.note || "").slice(0, 40) || "—",
    };
  }

  _extraRow(x) {
    return {
      description: (x.description || x.type || "—").slice(0, 32),
      type: x.type || "—",
      household: x.household_id || "—",
      period: mltcPeriod(x.year, x.month),
      due_date: x.due_date || "—",
      amount: mltcMoney(x.amount, x.currency),
    };
  }

  _docRow(d) {
    const days = Number(d.days);
    return {
      name: d.name || d.type || "—",
      person: d.person || "—",
      type: d.type || "—",
      date: d.date || "—",
      days: Number.isFinite(days) ? String(days) : "—",
      _days: days,
    };
  }

  _section(title, tableHtml, total, maxRows) {
    const more = total > maxRows ? `<div class="mltc-more">+${total - maxRows} további</div>` : "";
    return `
      <div class="mltc-block">
        <div class="mltc-block-title">${mltcEsc(title)} (${total})</div>
        <div class="mltc-scroll">${tableHtml}</div>
        ${more}
      </div>`;
  }

  _render() {
    if (!this._config || !this._hass) return;
    mltcEnsureStyles();

    const cfg = this._config;
    const state = this._hass.states[cfg.entity];
    if (!state) {
      this.innerHTML = `<ha-card><div class="mltc-err">Entity not found: ${mltcEsc(cfg.entity)}</div></ha-card>`;
      return;
    }

    const a = state.attributes || {};
    const minYear = Number(cfg.min_year) || 2025;
    const maxRows = Number(cfg.max_rows) || 10;
    const maxH = Number(cfg.max_height) || 140;

    const billsAll = mltcFilterYear(a.unpaid_bills || [], minYear);
    const extraAll = mltcFilterYear(a.unpaid_extra_costs || [], minYear);
    const docsAll = [...(a.expired_docs || []), ...(a.warning_docs || [])];

    const badge = Number(state.state ?? a.badge_count ?? 0);
    const docsBadge = Number(a.docs_badge_count ?? 0);
    const payBadge = Number(a.payments_badge_count ?? 0);

    const pill = (n, cls) =>
      `<span class="mltc-pill ${n ? cls : "mltc-pill--off"}">${n}</span>`;

    const parts = [];
    if (cfg.show_bills !== false) {
      const rows = billsAll.slice(0, maxRows).map((b) => this._billRow(b));
      parts.push(this._section(
        "Függő számlák",
        mltcTable(MLTC_BILL_COLS, cfg.bill_columns, rows),
        billsAll.length,
        maxRows
      ));
    }
    if (cfg.show_extra_costs !== false) {
      const rows = extraAll.slice(0, maxRows).map((x) => this._extraRow(x));
      parts.push(this._section(
        "Extra költségek",
        mltcTable(MLTC_EXTRA_COLS, cfg.extra_columns, rows),
        extraAll.length,
        maxRows
      ));
    }
    if (cfg.show_documents !== false) {
      const rows = docsAll.slice(0, maxRows).map((d) => this._docRow(d));
      parts.push(this._section(
        "Okmányok",
        mltcTable(MLTC_DOC_COLS, cfg.doc_columns, rows, (r) =>
          r._days < 0 ? "bad" : r._days <= 60 ? "warn" : ""
        ),
        docsAll.length,
        maxRows
      ));
    }

    const header = cfg.show_header !== false ? `
      <div class="mltc-bar">
        <div>
          <div class="mltc-bar-title">MyLife Tracker</div>
          <div class="mltc-bar-meta">≥ ${minYear} · ${mltcEsc(
            new Date(a.last_updated || state.last_changed).toLocaleString("hu-HU", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
            })
          )}</div>
        </div>
        <div class="mltc-pills">
          ${pill(badge, "mltc-pill--on")}
          ${pill(docsBadge, "mltc-pill--warn")}
          ${pill(payBadge, "mltc-pill--bad")}
        </div>
      </div>` : "";

    const body = parts.length
      ? parts.join("")
      : '<div class="mltc-ok">✓ Nincs függő tétel</div>';

    this.innerHTML = `
      <ha-card>
        <div class="mltc" style="--mltc-max-h:${maxH}px">
          ${header}
          ${body}
        </div>
      </ha-card>
    `;
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

  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _colChecks(prefix, allCols, selected) {
    const sel = new Set(selected || []);
    return Object.entries(allCols).map(([k, c]) => `
      <label style="display:block;font-size:12px;">
        <input type="checkbox" data-col="${prefix}" data-key="${k}" ${sel.has(k) ? "checked" : ""}/>
        ${mltcEsc(c.label)} (${k})
      </label>`).join("");
  }

  _readCols(prefix) {
    return [...this.querySelectorAll(`input[data-col="${prefix}"]:checked`)].map((el) => el.dataset.key);
  }

  _render() {
    const c = this._config;
    this.innerHTML = `
      <div style="padding:12px;display:flex;flex-direction:column;gap:10px;font-size:13px;">
        <label>Entity<input class="entity" style="width:100%;margin-top:4px;" /></label>
        <label>Min year (hide older)<input class="min-year" type="number" style="width:100%;margin-top:4px;" /></label>
        <label>Max rows per section<input class="max-rows" type="number" min="3" max="50" style="width:100%;margin-top:4px;" /></label>
        <label>Max height (px)<input class="max-height" type="number" min="80" max="400" style="width:100%;margin-top:4px;" /></label>
        <label><input class="show-header" type="checkbox"/> Show header bar</label>
        <label><input class="show-bills" type="checkbox"/> Bills section</label>
        <fieldset style="border:1px solid #ccc;padding:8px;"><legend>Bill columns</legend>
          ${this._colChecks("bill", MLTC_BILL_COLS, c.bill_columns)}
        </fieldset>
        <label><input class="show-extra" type="checkbox"/> Extra costs section</label>
        <fieldset style="border:1px solid #ccc;padding:8px;"><legend>Extra columns</legend>
          ${this._colChecks("extra", MLTC_EXTRA_COLS, c.extra_columns)}
        </fieldset>
        <label><input class="show-docs" type="checkbox"/> Documents section</label>
        <fieldset style="border:1px solid #ccc;padding:8px;"><legend>Document columns</legend>
          ${this._colChecks("doc", MLTC_DOC_COLS, c.doc_columns)}
        </fieldset>
      </div>`;

    const set = (sel, val) => { const el = this.querySelector(sel); if (el) el.value = val; };
    set(".entity", c.entity || "sensor.mylife_tracker_status");
    set(".min-year", c.min_year ?? 2025);
    set(".max-rows", c.max_rows ?? 10);
    set(".max-height", c.max_height ?? 140);
    this.querySelector(".show-header").checked = c.show_header !== false;
    this.querySelector(".show-bills").checked = c.show_bills !== false;
    this.querySelector(".show-extra").checked = c.show_extra_costs !== false;
    this.querySelector(".show-docs").checked = c.show_documents !== false;

    const bind = (sel, key, parse = (v) => v) => {
      this.querySelector(sel)?.addEventListener("change", (ev) => {
        const v = ev.target.type === "checkbox" ? ev.target.checked : parse(ev.target.value);
        this._update(key, v);
      });
    };
    bind(".entity", "entity");
    bind(".min-year", "min_year", (v) => Number(v) || 2025);
    bind(".max-rows", "max_rows", (v) => Number(v) || 10);
    bind(".max-height", "max_height", (v) => Number(v) || 140);
    bind(".show-header", "show_header");
    bind(".show-bills", "show_bills");
    bind(".show-extra", "show_extra_costs");
    bind(".show-docs", "show_documents");

    ["bill", "extra", "doc"].forEach((prefix) => {
      const key = `${prefix === "bill" ? "bill" : prefix === "extra" ? "extra" : "doc"}_columns`;
      this.querySelectorAll(`input[data-col="${prefix}"]`).forEach((el) => {
        el.addEventListener("change", () => this._update(key, this._readCols(prefix)));
      });
    });
  }
}

customElements.define("mylife-tracker-card", MyLifeTrackerCard);
customElements.define("mylife-tracker-card-editor", MyLifeTrackerCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "mylife-tracker-card",
  name: "MyLife Tracker Card",
  description: "Compact table card for MyLife Tracker alerts",
  preview: true,
});

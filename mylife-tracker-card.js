/**
 * MyLife Tracker Lovelace card v1.2 — compact table
 */
const MLTC_VERSION = "1.2.0";
const MLTC_STYLE_ID = "mylife-tracker-card-styles-v3";

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

function mltcEnsureStyles() {
  let el = document.getElementById(MLTC_STYLE_ID);
  if (!el) {
    el = document.createElement("style");
    el.id = MLTC_STYLE_ID;
    document.head.appendChild(el);
  }
  el.textContent = `
    mylife-tracker-card { display: block; }
    mylife-tracker-card ha-card { --ha-card-border-width: 0px; }
    .mltc { font: 0.72rem/1.2 var(--ha-font-family, Roboto, sans-serif); color: var(--primary-text-color); }
    .mltc-bar {
      display: flex; align-items: center; justify-content: space-between; gap: 6px;
      padding: 6px 10px; background: var(--secondary-background-color);
      border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.3));
    }
    .mltc-bar-title { font-weight: 700; font-size: 0.8rem; }
    .mltc-bar-sub { font-size: 0.65rem; opacity: .6; margin-top: 1px; }
    .mltc-pills { display: flex; gap: 3px; }
    .mltc-pill {
      min-width: 1.25rem; padding: 0 6px; height: 1.25rem; line-height: 1.25rem;
      border-radius: 10px; font-size: 0.68rem; font-weight: 700; text-align: center;
    }
    .mltc-pill--a { background: var(--primary-color); color: var(--text-primary-color,#fff); }
    .mltc-pill--d { background: #b45309; color: #fff; }
    .mltc-pill--p { background: #b91c1c; color: #fff; }
    .mltc-pill--z { opacity: .35; background: var(--divider-color, #ccc); }
    .mltc-sec { border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.2)); }
    .mltc-sec:last-child { border-bottom: none; }
    .mltc-sec-h {
      padding: 4px 10px 2px; font-size: 0.62rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .05em; opacity: .65;
    }
    .mltc-scroll {
      max-height: var(--mltc-h, 110px); overflow: auto;
      margin: 0; padding: 0;
    }
    .mltc-tbl {
      width: 100%; border-collapse: collapse; table-layout: fixed;
    }
    .mltc-tbl th {
      padding: 2px 6px; font-size: 0.6rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .04em; opacity: .55;
      text-align: left; border-bottom: 1px solid var(--divider-color, rgba(127,127,127,.35));
      background: var(--card-background-color, var(--ha-card-background));
      position: sticky; top: 0; z-index: 1;
    }
    .mltc-tbl td {
      padding: 3px 6px; height: 1.35rem; max-height: 1.35rem;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      border-bottom: 1px solid rgba(127,127,127,.1);
      vertical-align: middle;
    }
    .mltc-tbl tr:last-child td { border-bottom: none; }
    .mltc-tbl tbody tr:hover td { background: rgba(var(--rgb-primary-color,3,169,244),.08); }
    .mltc-tbl .n { text-align: right; font-variant-numeric: tabular-nums; font-weight: 600; }
    .mltc-tbl tr.bad td { color: #c62828; }
    .mltc-tbl tr.warn td { color: #e65100; }
    .mltc-foot { padding: 2px 10px 5px; font-size: 0.6rem; opacity: .5; text-align: right; }
    .mltc-ok { padding: 12px; text-align: center; opacity: .65; font-size: 0.75rem; }
    .mltc-err { padding: 10px; color: var(--error-color,#c62828); font-size: 0.75rem; }
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

  _sec(title, table, total, max) {
    const more = total > max ? `<div class="mltc-foot">+${total - max} more</div>` : "";
    return `
      <div class="mltc-sec">
        <div class="mltc-sec-h">${mltcEsc(title)} (${total})</div>
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
        maxR
      ));
    }
    if (cfg.show_extra_costs !== false) {
      parts.push(this._sec(
        "Extra",
        mltcTable(MLTC_EXTRA_COLS, cfg.extra_columns, extra.slice(0, maxR).map((x) => this._extraRow(x))),
        extra.length,
        maxR
      ));
    }
    if (cfg.show_documents !== false) {
      parts.push(this._sec(
        "Okmány",
        mltcTable(MLTC_DOC_COLS, cfg.doc_columns, docs.slice(0, maxR).map((d) => this._docRow(d)), (r) =>
          r._days < 0 ? "bad" : r._days <= 60 ? "warn" : ""
        ),
        docs.length,
        maxR
      ));
    }

    const hdr = cfg.show_header !== false ? `
      <div class="mltc-bar">
        <div>
          <div class="mltc-bar-title">MyLife</div>
          <div class="mltc-bar-sub">≥${minY} · v${MLTC_VERSION}</div>
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
        <div class="mltc" style="--mltc-h:${maxH}px">${hdr}${body}</div>
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
    q(".y").value = c.min_year ?? 2025;
    q(".r").value = c.max_rows ?? 8;
    q(".h").value = c.max_height ?? 110;
    q(".hdr").checked = c.show_header !== false;
    q(".sb").checked = c.show_bills !== false;
    q(".se").checked = c.show_extra_costs !== false;
    q(".sd").checked = c.show_documents !== false;

    q(".e").onchange = (e) => this._set("entity", e.target.value);
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

/**
 * MyLife Tracker Lovelace cards v1.5 — full table + compact glance
 */
const MLTC_VERSION = "1.6.3";

const MLTC_BILL_COLS = {
  type: { label: "Típus", w: "18%", chip: true },
  household: { label: "HH", w: "12%" },
  period: { label: "Időszak", w: "14%" },
  due_date: { label: "Határidő", w: "16%" },
  amount: { label: "Összeg", w: "18%", num: true },
  note: { label: "Megj.", w: "22%" },
};

const MLTC_EXTRA_COLS = {
  description: { label: "Leírás", w: "32%" },
  type: { label: "Típus", w: "14%", chip: true },
  household: { label: "HH", w: "10%" },
  period: { label: "Időszak", w: "12%" },
  due_date: { label: "Határidő", w: "14%" },
  amount: { label: "Összeg", w: "18%", num: true },
};

const MLTC_DOC_COLS = {
  name: { label: "Név", w: "30%" },
  person: { label: "Személy", w: "16%" },
  type: { label: "Típus", w: "14%", chip: true },
  date: { label: "Lejárat", w: "16%" },
  days: { label: "Nap", w: "10%", num: true },
};

function mltcLogoSvg() {
  const id = "mlg" + Math.random().toString(36).slice(2, 8);
  return `<svg viewBox="0 0 100 100" width="20" height="20" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="15" y1="15" x2="85" y2="85">
      <stop offset="0%" stop-color="#14b8a6"/><stop offset="100%" stop-color="#1e3a8a"/>
    </linearGradient></defs>
    <path d="M50 14L16 44H30V84H70V44H84L50 14Z" stroke="url(#${id})" stroke-width="8" stroke-linejoin="round" fill="none"/>
    <path d="M50 72V42M50 42L36 56M50 42L64 56" stroke="url(#${id})" stroke-width="8" stroke-linecap="round"/>
  </svg>`;
}

function mltcIsDark(hass) {
  try {
    const th = hass?.selectedTheme;
    if (th && hass.themes?.[th]?.modes?.dark) return true;
    if (hass.themes?.darkMode) return true;
  } catch (_e) { /* ignore */ }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function mltcStyles(dark, theme) {
  const isBrand = theme !== "ha";
  return `
    :host { display: block; }
    * { box-sizing: border-box; }
    ha-card {
      display: block;
      overflow: hidden;
      border-radius: 14px;
      --ha-card-border-width: 0px;
      --ha-card-box-shadow: 0 4px 18px rgba(11,19,43,${dark ? ".55" : ".14"});
    }
    .card {
      --navy: #0b132b;
      --navy2: #102a43;
      --teal: #10b981;
      --teal-bg: #ecfdf5;
      --ios: #007ba7;
      --blue: #1a6fd4;
      --amber: #d97706;
      --red: #dc2626;
      --bg: ${dark ? "#161b22" : "#ffffff"};
      --bg2: ${dark ? "#1c2230" : "#f8fafc"};
      --bg3: ${dark ? "#232d3f" : "#f0fdfa"};
      --text: ${dark ? "#e6edf3" : "#1e293b"};
      --muted: ${dark ? "#8b949e" : "#64748b"};
      --line: ${dark ? "rgba(255,255,255,.1)" : "rgba(15,23,42,.08)"};
      font: 12px/1.3 'Segoe UI', Roboto, system-ui, sans-serif;
      color: var(--text);
      background: var(--bg);
    }
    .hdr {
      display: flex; align-items: center; justify-content: space-between; gap: 10px;
      padding: 12px 14px;
      background: ${isBrand
    ? "linear-gradient(135deg, var(--navy) 0%, var(--navy2) 100%)"
    : "var(--bg2)"};
      color: ${isBrand ? "#fff" : "var(--text)"};
      border-bottom: 1px solid ${isBrand ? "rgba(255,255,255,.1)" : "var(--line)"};
    }
    .hdr-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .logo {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: ${isBrand ? "rgba(255,255,255,.1)" : "var(--bg3)"};
      border: 1px solid ${isBrand ? "rgba(255,255,255,.15)" : "var(--line)"};
    }
    .title { font-size: 14px; font-weight: 700; letter-spacing: .01em; }
    .sub { font-size: 10px; opacity: .65; margin-top: 2px; }
    .stats { display: flex; gap: 6px; flex-shrink: 0; }
    .stat {
      display: flex; flex-direction: column; align-items: center;
      min-width: 34px; padding: 4px 8px; border-radius: 10px;
      background: ${isBrand ? "rgba(255,255,255,.12)" : "var(--bg2)"};
      border: 1px solid ${isBrand ? "rgba(255,255,255,.1)" : "var(--line)"};
    }
    .stat-val { font-size: 13px; font-weight: 800; line-height: 1; }
    .stat-lbl { font-size: 8px; text-transform: uppercase; opacity: .7; margin-top: 2px; letter-spacing: .04em; }
    .stat--on .stat-val { color: ${isBrand ? "#34d399" : "var(--teal)"}; }
    .stat--doc .stat-val { color: var(--amber); }
    .stat--pay .stat-val { color: var(--red); }
    .stat--z { opacity: .35; }

    .body { padding: 8px 10px 10px; display: flex; flex-direction: column; gap: 8px; }
    .panel {
      border: 1px solid var(--line); border-radius: 10px;
      overflow: hidden; background: var(--bg2);
    }
    .panel-h {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 10px; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
      background: ${dark ? "rgba(255,255,255,.04)" : "rgba(16,185,129,.06)"};
      border-bottom: 1px solid var(--line);
      border-left: 3px solid var(--accent, var(--teal));
    }
    .panel-h--extra { --accent: var(--ios); }
    .panel-h--doc { --accent: var(--amber); }
    .panel-count {
      font-size: 10px; font-weight: 800; color: var(--text);
      background: var(--bg); border: 1px solid var(--line);
      border-radius: 999px; padding: 1px 8px;
    }
    .scroll {
      max-height: var(--max-h, 120px); overflow: auto;
    }
    .scroll::-webkit-scrollbar { width: 5px; }
    .scroll::-webkit-scrollbar-thumb { background: var(--teal); border-radius: 4px; }

    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th {
      padding: 5px 8px; font-size: 9px; font-weight: 700;
      text-transform: uppercase; letter-spacing: .05em; color: var(--muted);
      text-align: left; background: var(--bg);
      border-bottom: 1px solid var(--line);
      position: sticky; top: 0; z-index: 1;
    }
    td {
      padding: 5px 8px; height: 26px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      border-bottom: 1px solid var(--line);
      vertical-align: middle; font-size: 11px;
    }
    tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: ${dark ? "rgba(255,255,255,.02)" : "rgba(16,185,129,.03)"}; }
    tbody tr:hover td { background: ${dark ? "rgba(16,185,129,.12)" : "rgba(16,185,129,.08)"}; }
    .num { text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; color: var(--blue); }
    tr.bad td { color: var(--red); }
    tr.warn td { color: var(--amber); }

    .chip {
      display: inline-block; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
      padding: 1px 7px; border-radius: 999px; font-size: 10px; font-weight: 600;
      background: ${dark ? "rgba(16,185,129,.15)" : "var(--teal-bg)"};
      color: ${dark ? "#34d399" : "#0f6e56"};
      border: 1px solid ${dark ? "rgba(16,185,129,.25)" : "#a7f3d0"};
    }
    .empty {
      padding: 12px; text-align: center; font-size: 11px; color: var(--muted);
    }
    .ok {
      margin: 4px 0; padding: 16px; text-align: center; border-radius: 10px;
      background: ${dark ? "rgba(16,185,129,.1)" : "var(--teal-bg)"};
      color: var(--teal); font-weight: 600; font-size: 12px;
    }
    .more { padding: 4px 10px 6px; font-size: 9px; color: var(--muted); text-align: right; }
    .err { padding: 14px; color: var(--red); }

    /* ── Compact / glance layout ── */
    .card--compact .hdr { padding: 8px 12px; }
    .card--compact .logo { width: 28px; height: 28px; border-radius: 8px; }
    .card--compact .logo svg { width: 16px; height: 16px; }
    .card--compact .title { font-size: 12px; }
    .card--compact .sub { display: none; }
    .card--compact .stat { min-width: 28px; padding: 3px 6px; border-radius: 8px; }
    .card--compact .stat-val { font-size: 12px; }
    .card--compact .stat-lbl { font-size: 7px; }
    .compact-row {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 8px 12px 10px;
      background: var(--bg2);
      border-top: 1px solid var(--line);
    }
    .compact-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 600;
      border: 1px solid var(--line); background: var(--bg);
      white-space: nowrap;
    }
    .compact-chip--z { opacity: .45; }
    .compact-chip--pay { border-color: rgba(220,38,38,.35); color: var(--red); }
    .compact-chip--doc { border-color: rgba(217,119,6,.35); color: var(--amber); }
    .compact-chip--ok {
      border-color: rgba(16,185,129,.35); color: var(--teal);
      background: ${dark ? "rgba(16,185,129,.1)" : "var(--teal-bg)"};
    }
    .compact-n { font-weight: 800; font-variant-numeric: tabular-nums; }
    .compact-ok {
      padding: 10px 12px; text-align: center; font-size: 11px;
      color: var(--teal); font-weight: 600;
      background: ${dark ? "rgba(16,185,129,.08)" : "var(--teal-bg)"};
    }
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

function mltcFilterYear(items, minYear) {
  const min = Number(minYear) || 2025;
  return (items || []).filter((i) => {
    const yr = Number(i.year);
    return Number.isFinite(yr) && yr >= min;
  });
}

function mltcHasFilter(arr) {
  return Array.isArray(arr) && arr.length > 0;
}

function mltcStrList(arr) {
  return mltcHasFilter(arr) ? new Set(arr.map((x) => String(x))) : null;
}

/** Filter bills/extra by household_id and user_ids (empty filter = show all). */
function mltcFilterHouseholdUser(items, households, users) {
  const hhSet = mltcStrList(households);
  const userSet = mltcStrList(users);
  if (!hhSet && !userSet) return items || [];
  return (items || []).filter((item) => {
    const hh = String(item.household_id ?? "");
    if (hhSet && !hhSet.has(hh)) return false;
    if (!userSet) return true;
    const uids = Array.isArray(item.user_ids) ? item.user_ids.map(String) : [];
    if (!uids.length) return true;
    return uids.some((u) => userSet.has(u));
  });
}

/** Filter documents by user_id and/or person label. */
function mltcFilterDocs(docs, users, persons) {
  const userSet = mltcStrList(users);
  const personSet = mltcStrList(persons);
  if (!userSet && !personSet) return docs || [];
  return (docs || []).filter((d) => {
    const uid = d.user_id != null && d.user_id !== "" ? String(d.user_id) : "";
    const person = String(d.person ?? "");
    if (userSet && uid && userSet.has(uid)) return true;
    if (personSet && person && personSet.has(person)) return true;
    if (userSet && !personSet) return false;
    if (personSet && !userSet) return personSet.has(person);
    return false;
  });
}

function mltcHasListData(a) {
  if (!a) return false;
  return Array.isArray(a.unpaid_bills)
    || Array.isArray(a.unpaid_extra_costs)
    || (a.household_labels && Object.keys(a.household_labels).length > 0);
}

/** Status sensor has lists + labels; count sensors (badge_count, etc.) do not. */
function mltcResolveDataEntity(hass, entity) {
  if (!hass || !entity) return entity;
  const attrs = hass.states[entity]?.attributes;
  if (mltcHasListData(attrs)) return entity;
  const ids = Object.keys(hass.states || {});
  const prefer = ids.find((e) => e.includes("mylife_tracker") && e.endsWith("_status"));
  if (prefer && mltcHasListData(hass.states[prefer].attributes)) return prefer;
  const prefix = entity.includes(".") ? entity.slice(0, entity.lastIndexOf("_")) : "";
  if (prefix) {
    const sibling = ids.find((e) => e.startsWith(prefix + "_") && e.endsWith("_status"));
    if (sibling && mltcHasListData(hass.states[sibling].attributes)) return sibling;
  }
  return ids.find((e) => e.includes("mylife_tracker") && mltcHasListData(hass.states[e].attributes)) || entity;
}

function mltcDataAttributes(hass, entity) {
  const id = mltcResolveDataEntity(hass, entity);
  return hass?.states[id]?.attributes || {};
}

function mltcLabel(map, id) {
  if (id == null || id === "") return "";
  const key = String(id);
  return (map && map[key]) || key;
}

function mltcDiscoverFilters(hass, entity) {
  const out = { households: [], users: [], persons: [], dataEntity: entity, needsStatus: false };
  if (!hass || !entity) return out;
  const dataEntity = mltcResolveDataEntity(hass, entity);
  out.dataEntity = dataEntity;
  out.needsStatus = dataEntity !== entity;
  const a = mltcDataAttributes(hass, entity);
  const hhLabels = a.household_labels || {};
  const userLabels = a.user_labels || {};
  const hhs = new Set(Object.keys(hhLabels));
  const users = new Set(Object.keys(userLabels));
  const persons = new Set();
  [...(a.unpaid_bills || []), ...(a.unpaid_extra_costs || [])].forEach((i) => {
    if (i.household_id) hhs.add(String(i.household_id));
    (i.user_ids || []).forEach((u) => users.add(String(u)));
  });
  [...(a.expired_docs || []), ...(a.warning_docs || [])].forEach((d) => {
    if (d.person) persons.add(String(d.person));
    if (d.user_id) users.add(String(d.user_id));
  });
  out.households = [...hhs].sort((x, y) => mltcLabel(hhLabels, x).localeCompare(mltcLabel(hhLabels, y), "hu"))
    .map((id) => ({ id, label: mltcLabel(hhLabels, id) }));
  out.users = [...users].sort((x, y) => mltcLabel(userLabels, x).localeCompare(mltcLabel(userLabels, y), "hu"))
    .map((id) => ({ id, label: mltcLabel(userLabels, id) }));
  out.persons = [...persons].sort((x, y) => x.localeCompare(y, "hu")).map((id) => ({ id, label: id }));
  return out;
}

function mltcNormFilterArrays(cfg) {
  const keys = [
    "bill_households", "bill_users",
    "extra_households", "extra_users",
    "doc_users", "doc_persons",
  ];
  const out = { ...cfg };
  keys.forEach((k) => {
    out[k] = Array.isArray(cfg[k]) ? cfg[k].map(String) : [];
  });
  return out;
}

function mltcCols(all, selected) {
  const keys = Array.isArray(selected) && selected.length ? selected : Object.keys(all);
  return keys.filter((k) => all[k]);
}

function mltcCell(key, val, col) {
  const v = val ?? "—";
  if (col.chip && v !== "—") return `<span class="chip">${mltcEsc(v)}</span>`;
  if (col.num) return `<span class="num">${mltcEsc(v)}</span>`;
  return mltcEsc(v);
}

function mltcTable(allCols, selectedCols, rows, rowCls) {
  const cols = mltcCols(allCols, selectedCols);
  if (!cols.length || !rows.length) return '<div class="empty">—</div>';
  const th = cols.map((k) => {
    const c = allCols[k];
    return `<th class="${c.num ? "num" : ""}" style="width:${c.w}">${mltcEsc(c.label)}</th>`;
  }).join("");
  const tr = rows.map((r) => {
    const td = cols.map((k) => {
      const c = allCols[k];
      const cls = c.num ? "num" : "";
      return `<td class="${cls}">${mltcCell(k, r[k], c)}</td>`;
    }).join("");
    return `<tr class="${rowCls ? rowCls(r) : ""}">${td}</tr>`;
  }).join("");
  return `<table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>`;
}

class MyLifeTrackerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  static getStubConfig(hass, entities, entitiesFallback) {
    const pool = [...(entities || []), ...(entitiesFallback || [])];
    const fromPool = pool.find((e) => e.includes("mylife_tracker") && e.endsWith("_status"))
      || pool.find((e) => e.includes("mylife_tracker"));
    const entity = fromPool
      || (hass && Object.keys(hass.states || {}).find((e) => e.includes("mylife_tracker") && e.endsWith("_status")))
      || (hass && Object.keys(hass.states || {}).find((e) => e.includes("mylife_tracker")))
      || "sensor.mylife_tracker_status";
    return {
      entity,
      layout: "full",
      min_year: 2025,
      max_rows: 8,
      max_height: 120,
      show_header: true,
      show_bills: true,
      show_extra_costs: true,
      show_documents: false,
      theme: "brand",
      bill_columns: ["type", "household", "period", "amount"],
      extra_columns: ["description", "type", "period", "amount"],
      doc_columns: ["name", "date", "days"],
      bill_households: [],
      bill_users: [],
      extra_households: [],
      extra_users: [],
      doc_users: [],
      doc_persons: [],
    };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("entity required");
    const d = MyLifeTrackerCard.getStubConfig();
    this._config = mltcNormFilterArrays({
      ...d, ...config,
      min_year: Number(config.min_year ?? d.min_year) || 2025,
      max_rows: Number(config.max_rows ?? d.max_rows) || 8,
      max_height: Number(config.max_height ?? d.max_height) || 120,
    });
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return this._config?.layout === "compact" ? 1 : 2;
  }

  getGridOptions() {
    if (this._config?.layout === "compact") {
      return { rows: 1, columns: 6, min_rows: 1, min_columns: 3 };
    }
    return { rows: 2, columns: 12, min_rows: 2, min_columns: 6 };
  }

  _billRow(b, hhLabels) {
    return {
      type: b.type || "—",
      household: mltcLabel(hhLabels, b.household_id) || "—",
      period: mltcPeriod(b.year, b.month),
      due_date: b.due_date ? String(b.due_date).slice(0, 10) : "—",
      amount: mltcMoney(b.amount, b.currency),
      note: (b.note || "").slice(0, 24) || "—",
    };
  }

  _extraRow(x, hhLabels) {
    return {
      description: (x.description || x.type || "—").slice(0, 32),
      type: x.type || "—",
      household: mltcLabel(hhLabels, x.household_id) || "—",
      period: mltcPeriod(x.year, x.month),
      due_date: x.due_date ? String(x.due_date).slice(0, 10) : "—",
      amount: mltcMoney(x.amount, x.currency),
    };
  }

  _docRow(d) {
    const days = Number(d.days);
    return {
      name: (d.name || d.type || "—").slice(0, 22),
      person: d.person || "—",
      type: d.type || "—",
      date: d.date || "—",
      days: Number.isFinite(days) ? String(days) : "—",
      _days: days,
    };
  }

  _panel(title, table, total, max, cls = "") {
    const more = total > max ? `<div class="more">+${total - max} további</div>` : "";
    const inner = total ? `<div class="scroll">${table}</div>${more}` : '<div class="empty">Nincs tétel</div>';
    return `
      <div class="panel">
        <div class="panel-h ${cls}">
          <span>${mltcEsc(title)}</span>
          <span class="panel-count">${total}</span>
        </div>
        ${inner}
      </div>`;
  }

  _compactChip(label, count, cls) {
    const z = count ? "" : " compact-chip--z";
    return `<span class="compact-chip ${cls}${z}"><span class="compact-n">${count}</span> ${mltcEsc(label)}</span>`;
  }

  _renderCompact(cfg, theme, dark, bills, extra, docs, payN, docN, totalN, minY) {
    const stat = (val, lbl, cls) =>
      `<div class="stat ${val ? cls : "stat--z"}"><span class="stat-val">${val}</span><span class="stat-lbl">${lbl}</span></div>`;

    const hdr = `
      <div class="hdr">
        <div class="hdr-left">
          <div class="logo">${mltcLogoSvg()}</div>
          <div><div class="title">MyLife</div><div class="sub">≥ ${minY}</div></div>
        </div>
        <div class="stats">
          ${stat(totalN, "Össz", "stat--on")}
          ${stat(docN, "Okm", "stat--doc")}
          ${stat(payN, "Fiz", "stat--pay")}
        </div>
      </div>`;

    const chips = [];
    if (cfg.show_bills !== false) chips.push(this._compactChip("számla", bills.length, bills.length ? "compact-chip--pay" : ""));
    if (cfg.show_extra_costs !== false) chips.push(this._compactChip("extra", extra.length, extra.length ? "compact-chip--pay" : ""));
    if (cfg.show_documents !== false) chips.push(this._compactChip("okmány", docs.length, docs.length ? "compact-chip--doc" : ""));

    const body = totalN
      ? `<div class="compact-row">${chips.join("")}</div>`
      : `<div class="compact-ok">✓ Minden rendben</div>`;

    return `
      <style>${mltcStyles(dark, theme)}</style>
      <ha-card>
        <div class="card card--compact">${hdr}${body}</div>
      </ha-card>`;
  }

  _render() {
    if (!this._config || !this._hass || !this.shadowRoot) return;

    const cfg = this._config;
    const st = this._hass.states[cfg.entity];
    const theme = cfg.theme === "ha" ? "ha" : "brand";
    const dark = mltcIsDark(this._hass);

    if (!st) {
      this.shadowRoot.innerHTML = `
        <style>${mltcStyles(dark, theme)}</style>
        <ha-card><div class="err">Missing: ${mltcEsc(cfg.entity)}</div></ha-card>`;
      return;
    }

    const a = mltcDataAttributes(this._hass, cfg.entity);
    const hhLabels = a.household_labels || {};
    const minY = Number(cfg.min_year) || 2025;
    const maxR = Number(cfg.max_rows) || 8;
    const maxH = Number(cfg.max_height) || 120;

    const bills = mltcFilterHouseholdUser(
      mltcFilterYear(a.unpaid_bills || [], minY),
      cfg.bill_households,
      cfg.bill_users
    );
    const extra = mltcFilterHouseholdUser(
      mltcFilterYear(a.unpaid_extra_costs || [], minY),
      cfg.extra_households,
      cfg.extra_users
    );
    const docs = mltcFilterDocs(
      [...(a.expired_docs || []), ...(a.warning_docs || [])],
      cfg.doc_users,
      cfg.doc_persons
    );
    const payN = bills.length + extra.length;
    const docN = docs.length;
    const totalN = payN + docN;

    if (cfg.layout === "compact") {
      this.shadowRoot.innerHTML = this._renderCompact(cfg, theme, dark, bills, extra, docs, payN, docN, totalN, minY);
      return;
    }

    const stat = (val, lbl, cls) =>
      `<div class="stat ${val ? cls : "stat--z"}"><span class="stat-val">${val}</span><span class="stat-lbl">${lbl}</span></div>`;

    const hdr = cfg.show_header !== false ? `
      <div class="hdr">
        <div class="hdr-left">
          <div class="logo">${mltcLogoSvg()}</div>
          <div>
            <div class="title">MyLife Tracker</div>
            <div class="sub">≥ ${minY} · v${MLTC_VERSION}</div>
          </div>
        </div>
        <div class="stats">
          ${stat(totalN, "Össz", "stat--on")}
          ${stat(docN, "Okm", "stat--doc")}
          ${stat(payN, "Fiz", "stat--pay")}
        </div>
      </div>` : "";

    const parts = [];
    if (cfg.show_bills !== false) {
      parts.push(this._panel(
        "Számlák",
        mltcTable(MLTC_BILL_COLS, cfg.bill_columns, bills.slice(0, maxR).map((b) => this._billRow(b, hhLabels))),
        bills.length, maxR
      ));
    }
    if (cfg.show_extra_costs !== false) {
      parts.push(this._panel(
        "Extra költségek",
        mltcTable(MLTC_EXTRA_COLS, cfg.extra_columns, extra.slice(0, maxR).map((x) => this._extraRow(x, hhLabels))),
        extra.length, maxR, "panel-h--extra"
      ));
    }
    if (cfg.show_documents !== false) {
      parts.push(this._panel(
        "Okmányok",
        mltcTable(MLTC_DOC_COLS, cfg.doc_columns, docs.slice(0, maxR).map((d) => this._docRow(d)), (r) =>
          r._days < 0 ? "bad" : r._days <= 60 ? "warn" : ""
        ),
        docs.length, maxR, "panel-h--doc"
      ));
    }

    const hasData = bills.length || extra.length || docs.length;
    const body = hasData
      ? `<div class="body">${parts.join("")}</div>`
      : `<div class="ok">✓ Minden rendben</div>`;

    this.shadowRoot.innerHTML = `
      <style>${mltcStyles(dark, theme)}</style>
      <ha-card>
        <div class="card" style="--max-h:${maxH}px">
          ${hdr}
          ${body}
        </div>
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
    if (this._config) this._render();
  }

  _set(key, val) {
    this._config = { ...this._config, [key]: val };
    this.dispatchEvent(new CustomEvent("config-changed", {
      detail: { config: this._config }, bubbles: true, composed: true,
    }));
  }

  _filterBox(title, configKey, options, selected, emptyHint) {
    const sel = new Set((selected || []).map(String));
    if (!options.length) {
      return `<fieldset style="margin:0;padding:6px 8px;border:1px solid #ccc">
        <legend style="font-size:11px">${mltcEsc(title)}</legend>
        <div style="font-size:10px;color:#888">${mltcEsc(emptyHint || "Nincs adat")}</div>
      </fieldset>`;
    }
    return `<fieldset style="margin:0;padding:6px 8px;border:1px solid #ccc">
      <legend style="font-size:11px">${mltcEsc(title)} <span style="font-weight:400;opacity:.7">(üres = mind)</span></legend>
      ${options.map((o) =>
    `<label style="display:block;font-size:11px;margin:2px 0">
          <input type="checkbox" data-fk="${mltcEsc(configKey)}" data-fv="${mltcEsc(o.id)}" ${sel.has(String(o.id)) ? "checked" : ""}/> ${mltcEsc(o.label)}
        </label>`
  ).join("")}
    </fieldset>`;
  }

  _colBox(title, prefix, allCols, selected) {
    const sel = new Set(selected || []);
    return `<fieldset class="mltc-cols-fs" style="margin:0;padding:6px 8px;border:1px solid #ccc">
      <legend style="font-size:11px">${mltcEsc(title)}</legend>
      ${Object.entries(allCols).map(([k, c]) =>
    `<label style="display:block;font-size:11px;margin:2px 0">
          <input type="checkbox" data-p="${prefix}" data-k="${k}" ${sel.has(k) ? "checked" : ""}/> ${mltcEsc(c.label)}
        </label>`
  ).join("")}
    </fieldset>`;
  }

  _render() {
    const c = this._config;
    if (!c) return;
    const disc = mltcDiscoverFilters(this._hass, c.entity);
    const emptyHint = disc.needsStatus
      ? `Használd: ${disc.dataEntity} (a számláló entity-nek nincs listája)`
      : "Nincs adat — frissítsd az integrációt (deploy + HACS update), majd várj egy poll ciklust";
    const entityNote = disc.needsStatus
      ? `<div style="font-size:10px;color:#d97706;padding:4px 6px;background:#fffbeb;border-radius:6px">
          Szűrők és táblázat: <strong>${mltcEsc(disc.dataEntity)}</strong>
          (a ${mltcEsc(c.entity)} csak szám — ajánlott: Status entity)
        </div>`
      : "";
    this.innerHTML = `
      <div style="padding:10px;display:flex;flex-direction:column;gap:8px;font-size:12px">
        <div style="font-weight:700;color:#10b981">MyLife card v${MLTC_VERSION}</div>
        ${entityNote}
        <label>Layout
          <select class="layout" style="width:100%;margin-top:2px">
            <option value="full">Full (tables)</option>
            <option value="compact">Compact (badges only)</option>
          </select>
        </label>
        <label>Theme<select class="theme" style="width:100%;margin-top:2px">
          <option value="brand">MyLife brand</option><option value="ha">HA native</option>
        </select></label>
        <label>Entity<input class="e" style="width:100%;margin-top:2px"/></label>
        <label>Min year<input class="y" type="number" style="width:100%;margin-top:2px"/></label>
        <label>Max rows<input class="r" type="number" min="3" max="30" style="width:100%;margin-top:2px"/></label>
        <label>Max height px<input class="h" type="number" min="60" max="300" style="width:100%;margin-top:2px"/></label>
        <label><input class="hdr" type="checkbox"/> Header</label>
        <label><input class="sb" type="checkbox"/> Számlák</label>
        ${this._filterBox("Számlák — háztartás", "bill_households", disc.households, c.bill_households, emptyHint)}
        ${this._filterBox("Számlák — felhasználók", "bill_users", disc.users, c.bill_users, emptyHint)}
        ${this._colBox("Számla oszlopok", "bill", MLTC_BILL_COLS, c.bill_columns)}
        <label><input class="se" type="checkbox"/> Extra</label>
        ${this._filterBox("Extra — háztartás", "extra_households", disc.households, c.extra_households, emptyHint)}
        ${this._filterBox("Extra — felhasználók", "extra_users", disc.users, c.extra_users, emptyHint)}
        ${this._colBox("Extra oszlopok", "extra", MLTC_EXTRA_COLS, c.extra_columns)}
        <label><input class="sd" type="checkbox"/> Okmány</label>
        ${this._filterBox("Okmány — felhasználó (id)", "doc_users", disc.users, c.doc_users, emptyHint)}
        ${this._filterBox("Okmány — személy (név)", "doc_persons", disc.persons, c.doc_persons, emptyHint)}
        ${this._colBox("Okmány oszlopok", "doc", MLTC_DOC_COLS, c.doc_columns)}
      </div>`;

    const q = (s) => this.querySelector(s);
    const isCompact = c.layout === "compact";
    q(".e").value = c.entity || "";
    q(".layout").value = c.layout === "compact" ? "compact" : "full";
    q(".theme").value = c.theme === "ha" ? "ha" : "brand";
    q(".y").value = c.min_year ?? 2025;
    q(".r").value = c.max_rows ?? 8;
    q(".h").value = c.max_height ?? 120;
    q(".hdr").checked = c.show_header !== false;
    q(".sb").checked = c.show_bills !== false;
    q(".se").checked = c.show_extra_costs !== false;
    q(".sd").checked = c.show_documents !== false;

    // Hide table-only options in compact mode
    ["r", "h"].forEach((cls) => {
      const el = q(`.${cls}`)?.closest("label");
      if (el) el.style.display = isCompact ? "none" : "";
    });
    this.querySelectorAll(".mltc-cols-fs").forEach((fs) => {
      fs.style.display = isCompact ? "none" : "";
    });

    q(".e").onchange = (e) => { this._set("entity", e.target.value); this._render(); };
    q(".layout").onchange = (e) => { this._set("layout", e.target.value); this._render(); };
    q(".theme").onchange = (e) => this._set("theme", e.target.value);
    q(".y").onchange = (e) => this._set("min_year", Number(e.target.value) || 2025);
    q(".r").onchange = (e) => this._set("max_rows", Number(e.target.value) || 8);
    q(".h").onchange = (e) => this._set("max_height", Number(e.target.value) || 120);
    q(".hdr").onchange = (e) => this._set("show_header", e.target.checked);
    q(".sb").onchange = (e) => this._set("show_bills", e.target.checked);
    q(".se").onchange = (e) => this._set("show_extra_costs", e.target.checked);
    q(".sd").onchange = (e) => this._set("show_documents", e.target.checked);

    ["bill_households", "bill_users", "extra_households", "extra_users", "doc_users", "doc_persons"].forEach((key) => {
      this.querySelectorAll(`input[data-fk="${key}"]`).forEach((el) => {
        el.onchange = () => {
          const vals = [...this.querySelectorAll(`input[data-fk="${key}"]:checked`)].map((x) => x.dataset.fv);
          this._set(key, vals);
        };
      });
    });

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

/** Compact glance card — same data, badge-only layout */
class MyLifeTrackerGlanceCard extends MyLifeTrackerCard {
  static getStubConfig() {
    return {
      ...MyLifeTrackerCard.getStubConfig(),
      layout: "compact",
      show_documents: false,
    };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    super.setConfig({ ...config, layout: "compact" });
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return { rows: 1, columns: 6, min_rows: 1, min_columns: 3 };
  }
}

customElements.define("mylife-tracker-glance-card", MyLifeTrackerGlanceCard);

function mltcEntitySuggestion(type, layout) {
  return (hass, entityId) => {
    if (!entityId.includes("mylife_tracker")) return null;
    const cfg = { type: `custom:${type}`, entity: entityId };
    if (layout) cfg.layout = layout;
    return { config: cfg };
  };
}

function mltcRegisterCards() {
  // Never reassign window.customCards — HA holds a reference to the original array.
  if (!window.customCards) window.customCards = [];
  const upsert = (def) => {
    const i = window.customCards.findIndex((c) => c && c.type === def.type);
    if (i >= 0) window.customCards[i] = def;
    else window.customCards.push(def);
  };
  upsert({
    type: "mylife-tracker-card",
    name: "MyLife Tracker",
    description: "Bills and documents table (full or compact layout)",
    preview: true,
    version: MLTC_VERSION,
    documentationURL: "https://github.com/benalfoldi/mylife-tracker-card",
    getEntitySuggestion: mltcEntitySuggestion("mylife-tracker-card", "full"),
  });
  upsert({
    type: "mylife-tracker-glance-card",
    name: "MyLife Tracker Glance",
    description: "Compact badge-only status tile",
    preview: true,
    version: MLTC_VERSION,
    documentationURL: "https://github.com/benalfoldi/mylife-tracker-card",
    getEntitySuggestion: mltcEntitySuggestion("mylife-tracker-glance-card"),
  });
}

mltcRegisterCards();

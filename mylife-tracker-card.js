/**
 * MyLife Tracker Lovelace card
 */
const MLTC_STYLE_ID = "mylife-tracker-card-styles";

function mltcEnsureStyles() {
  if (document.getElementById(MLTC_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = MLTC_STYLE_ID;
  style.textContent = `
    mylife-tracker-card {
      display: block;
    }
    .mltc-wrap {
      padding: 0;
      overflow: hidden;
    }
    .mltc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 16px 16px 10px;
      background: linear-gradient(135deg, rgba(20,184,166,.14), rgba(30,58,138,.10));
      border-bottom: 1px solid rgba(var(--rgb-primary-text-color, 0,0,0), .08);
    }
    .mltc-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }
    .mltc-logo {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #14b8a6, #1e3a8a);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .mltc-title {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
    }
    .mltc-updated {
      font-size: 0.72rem;
      opacity: 0.65;
      margin-top: 2px;
    }
    .mltc-chips {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
    }
    .mltc-chip {
      min-width: 2rem;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      text-align: center;
      line-height: 1.2;
    }
    .mltc-chip--total {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .mltc-chip--docs {
      background: #d97706;
      color: #fff;
    }
    .mltc-chip--pay {
      background: #dc2626;
      color: #fff;
    }
    .mltc-chip--zero {
      opacity: 0.45;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
    }
    .mltc-body {
      padding: 8px 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .mltc-section {
      border: 1px solid rgba(var(--rgb-primary-text-color, 0,0,0), .08);
      border-radius: 14px;
      overflow: hidden;
      background: var(--card-background-color, var(--ha-card-background, var(--secondary-background-color)));
    }
    .mltc-section-hdr {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      background: var(--secondary-background-color);
    }
    .mltc-section-count {
      font-size: 0.75rem;
      opacity: 0.7;
      font-weight: 600;
      text-transform: none;
      letter-spacing: 0;
    }
    .mltc-list {
      max-height: 220px;
      overflow-y: auto;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .mltc-row {
      display: grid;
      grid-template-columns: 36px 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 10px;
      border-radius: 12px;
      background: var(--secondary-background-color);
    }
    .mltc-row--warn { box-shadow: inset 3px 0 0 #d97706; }
    .mltc-row--bad { box-shadow: inset 3px 0 0 #dc2626; }
    .mltc-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      font-size: 1rem;
      background: rgba(var(--rgb-primary-color, 3,169,244), .12);
    }
    .mltc-main { min-width: 0; }
    .mltc-name {
      font-weight: 650;
      font-size: 0.92rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mltc-meta {
      font-size: 0.76rem;
      opacity: 0.72;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mltc-amt {
      font-weight: 700;
      font-size: 0.86rem;
      white-space: nowrap;
      text-align: right;
    }
    .mltc-empty {
      padding: 14px 12px;
      text-align: center;
      font-size: 0.85rem;
      opacity: 0.7;
    }
    .mltc-more {
      padding: 0 12px 10px;
      font-size: 0.76rem;
      opacity: 0.65;
      text-align: center;
    }
    .mltc-all-clear {
      padding: 28px 16px;
      text-align: center;
    }
    .mltc-all-clear-icon {
      font-size: 2rem;
      margin-bottom: 8px;
    }
    .mltc-error {
      padding: 16px;
      color: var(--error-color, #b91c1c);
      font-size: 0.9rem;
    }
  `;
  document.head.appendChild(style);
}

function mltcEsc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function mltcBillIcon(type) {
  const map = {
    gaz: "🔥",
    viz: "💧",
    villany: "⚡",
    internet: "🌐",
    mobilok: "📱",
    szemét: "🗑️",
    kozos: "🏢",
  };
  const key = String(type || "").toLowerCase();
  return map[key] || "🧾";
}

class MyLifeTrackerCard extends HTMLElement {
  static getStubConfig() {
    return {
      type: "custom:mylife-tracker-card",
      entity: "sensor.mylife_tracker_status",
      max_items: 8,
    };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Set entity to sensor.mylife_tracker_status");
    this._config = {
      max_items: 8,
      show_bills: true,
      show_extra_costs: true,
      show_documents: true,
      ...config,
    };
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 3;
  }

  _money(amount, currency) {
    const n = Number(amount);
    if (!Number.isFinite(n)) return "—";
    const cur = currency || "HUF";
    try {
      return new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0,
      }).format(n);
    } catch (_e) {
      return `${n.toLocaleString("hu-HU")} ${cur}`;
    }
  }

  _period(year, month) {
    if (!year || !month) return "";
    return `${year}. ${String(month).padStart(2, "0")}.`;
  }

  _fmtUpdated(raw) {
    if (!raw) return "—";
    try {
      return new Date(raw).toLocaleString("hu-HU", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_e) {
      return raw;
    }
  }

  _section(title, icon, items, emptyText, maxItems, rowHtml) {
    if (!items.length) {
      return `
        <div class="mltc-section">
          <div class="mltc-section-hdr"><span>${icon} ${mltcEsc(title)}</span><span class="mltc-section-count">0</span></div>
          <div class="mltc-empty">${mltcEsc(emptyText)}</div>
        </div>`;
    }
    const shown = items.slice(0, maxItems);
    const more = items.length - shown.length;
    return `
      <div class="mltc-section">
        <div class="mltc-section-hdr">
          <span>${icon} ${mltcEsc(title)}</span>
          <span class="mltc-section-count">${items.length}</span>
        </div>
        <div class="mltc-list">${shown.map(rowHtml).join("")}</div>
        ${more > 0 ? `<div class="mltc-more">+${more} további tétel</div>` : ""}
      </div>`;
  }

  _render() {
    if (!this._config || !this._hass) return;
    mltcEnsureStyles();

    const state = this._hass.states[this._config.entity];
    if (!state) {
      this.innerHTML = `<ha-card><div class="mltc-error">Entity not found: ${mltcEsc(this._config.entity)}</div></ha-card>`;
      return;
    }

    const a = state.attributes || {};
    const docsBadge = Number(a.docs_badge_count ?? 0);
    const paymentsBadge = Number(a.payments_badge_count ?? 0);
    const badge = Number(state.state ?? a.badge_count ?? 0);
    const unpaidBills = a.unpaid_bills || [];
    const unpaidExtra = a.unpaid_extra_costs || [];
    const warningDocs = a.warning_docs || [];
    const expiredDocs = a.expired_docs || [];
    const maxItems = Number(this._config.max_items) || 8;

    const chip = (val, cls) =>
      `<span class="mltc-chip ${cls}${val ? "" : " mltc-chip--zero"}" title="${cls}">${val}</span>`;

    const billSection = this._config.show_bills !== false
      ? this._section(
          "Függő számlák",
          "🧾",
          unpaidBills,
          "Nincs függő számla",
          maxItems,
          (b) => `
            <div class="mltc-row">
              <div class="mltc-icon">${mltcBillIcon(b.type)}</div>
              <div class="mltc-main">
                <div class="mltc-name">${mltcEsc(b.type || "számla")} · ${mltcEsc(b.household_id || "")}</div>
                <div class="mltc-meta">${mltcEsc(this._period(b.year, b.month))}${b.due_date ? ` · határidő ${mltcEsc(b.due_date)}` : ""}</div>
              </div>
              <div class="mltc-amt">${mltcEsc(this._money(b.amount, b.currency))}</div>
            </div>`
        )
      : "";

    const extraSection = this._config.show_extra_costs !== false
      ? this._section(
          "Extra költségek",
          "💳",
          unpaidExtra,
          "Nincs függő extra költség",
          maxItems,
          (x) => `
            <div class="mltc-row">
              <div class="mltc-icon">💳</div>
              <div class="mltc-main">
                <div class="mltc-name">${mltcEsc(x.description || x.type || "extra")}</div>
                <div class="mltc-meta">${mltcEsc(x.household_id || "")} · ${mltcEsc(this._period(x.year, x.month))}</div>
              </div>
              <div class="mltc-amt">${mltcEsc(this._money(x.amount, x.currency))}</div>
            </div>`
        )
      : "";

    const docs = [...expiredDocs, ...warningDocs];
    const docSection = this._config.show_documents !== false
      ? this._section(
          "Okmány figyelmeztetések",
          "📄",
          docs,
          "Nincs lejáró okmány",
          maxItems,
          (d) => {
            const overdue = (d.days ?? 0) < 0;
            const daysLabel = overdue
              ? `${Math.abs(d.days)} napja lejárt`
              : `${d.days} nap van hátra`;
            return `
            <div class="mltc-row ${overdue ? "mltc-row--bad" : "mltc-row--warn"}">
              <div class="mltc-icon">📄</div>
              <div class="mltc-main">
                <div class="mltc-name">${mltcEsc(d.name || d.type || "okmány")}</div>
                <div class="mltc-meta">${mltcEsc(d.person || "")}${d.person ? " · " : ""}${mltcEsc(d.date || "")} · ${mltcEsc(daysLabel)}</div>
              </div>
            </div>`;
          }
        )
      : "";

    const hasAlerts = unpaidBills.length || unpaidExtra.length || docs.length;
    const body = hasAlerts
      ? `<div class="mltc-body">${billSection}${extraSection}${docSection}</div>`
      : `<div class="mltc-all-clear"><div class="mltc-all-clear-icon">✅</div><div>Minden rendben — nincs függő tétel.</div></div>`;

    this.innerHTML = `
      <ha-card>
        <div class="mltc-wrap">
          <div class="mltc-header">
            <div class="mltc-brand">
              <div class="mltc-logo">🏠</div>
              <div>
                <div class="mltc-title">MyLife Tracker</div>
                <div class="mltc-updated">${mltcEsc(this._fmtUpdated(a.last_updated || state.last_changed))}</div>
              </div>
            </div>
            <div class="mltc-chips">
              ${chip(badge, "mltc-chip--total")}
              ${chip(docsBadge, "mltc-chip--docs")}
              ${chip(paymentsBadge, "mltc-chip--pay")}
            </div>
          </div>
          ${body}
        </div>
      </ha-card>
    `;
  }
}

class MyLifeTrackerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { max_items: 8, ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _update(key, value) {
    this._config = { ...this._config, [key]: value };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _render() {
    if (!this._config) return;
    this.innerHTML = `
      <div class="card-config" style="padding:12px;display:flex;flex-direction:column;gap:12px;">
        <label>Status entity<input class="entity" type="text" style="width:100%;margin-top:4px;" /></label>
        <label>Max items per section<input class="max-items" type="number" min="3" max="30" style="width:100%;margin-top:4px;" /></label>
        <label><input class="show-bills" type="checkbox" /> Show unpaid bills</label>
        <label><input class="show-extra" type="checkbox" /> Show unpaid extra costs</label>
        <label><input class="show-docs" type="checkbox" /> Show document alerts</label>
      </div>
    `;
    const bind = (sel, key, parser = (v) => v) => {
      const el = this.querySelector(sel);
      if (!el) return;
      if (el.type === "checkbox") el.checked = this._config[key] !== false;
      else el.value = this._config[key] ?? "";
      el.addEventListener("change", (ev) => {
        const val = ev.target.type === "checkbox" ? ev.target.checked : parser(ev.target.value);
        this._update(key, val);
      });
    };
    bind(".entity", "entity");
    bind(".max-items", "max_items", (v) => Number(v) || 8);
    bind(".show-bills", "show_bills");
    bind(".show-extra", "show_extra_costs");
    bind(".show-docs", "show_documents");
    this.querySelector(".entity").value = this._config.entity || "sensor.mylife_tracker_status";
    this.querySelector(".max-items").value = this._config.max_items ?? 8;
  }
}

customElements.define("mylife-tracker-card", MyLifeTrackerCard);
customElements.define("mylife-tracker-card-editor", MyLifeTrackerCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "mylife-tracker-card",
  name: "MyLife Tracker Card",
  description: "Badges, unpaid bills, and document expiry alerts from MyLife Tracker",
  preview: true,
});

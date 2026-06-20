/**
 * MyLife Tracker Lovelace card — shows badges, unpaid bills, and document alerts.
 *
 * Requires the MyLife Tracker HACS integration (sensor with list attributes).
 */
class MyLifeTrackerCard extends HTMLElement {
  static getStubConfig() {
    return { type: "custom:mylife-tracker-card", entity: "sensor.mylife_tracker_status" };
  }

  static getConfigElement() {
    return document.createElement("mylife-tracker-card-editor");
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Set entity to sensor.mylife_tracker_status");
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return 4;
  }

  _money(amount, currency) {
    if (amount == null || amount === "") return "—";
    const n = Number(amount);
    const cur = currency || "HUF";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0,
      }).format(n);
    } catch (_e) {
      return `${n} ${cur}`;
    }
  }

  _period(year, month) {
    if (!year || !month) return "";
    return `${year}/${String(month).padStart(2, "0")}`;
  }

  _renderSection(title, items, emptyText, rowFn) {
    if (!items || !items.length) {
      return `<div class="section"><div class="section-title">${title}</div><div class="empty">${emptyText}</div></div>`;
    }
    const rows = items.map(rowFn).join("");
    return `<div class="section"><div class="section-title">${title}</div><div class="list">${rows}</div></div>`;
  }

  _render() {
    if (!this._config || !this._hass) return;

    const state = this._hass.states[this._config.entity];
    if (!state) {
      this.innerHTML = `<ha-card header="MyLife Tracker"><div class="error">Entity not found: ${this._config.entity}</div></ha-card>`;
      return;
    }

    const a = state.attributes || {};
    const docsBadge = a.docs_badge_count ?? 0;
    const paymentsBadge = a.payments_badge_count ?? 0;
    const badge = state.state ?? a.badge_count ?? 0;
    const unpaidBills = a.unpaid_bills || [];
    const unpaidExtra = a.unpaid_extra_costs || [];
    const warningDocs = a.warning_docs || [];
    const expiredDocs = a.expired_docs || [];
    const updated = a.last_updated || state.last_changed;

    const showBills = this._config.show_bills !== false;
    const showExtra = this._config.show_extra_costs !== false;
    const showDocs = this._config.show_documents !== false;

    const billSection = showBills
      ? this._renderSection(
          `Unpaid bills (${unpaidBills.length})`,
          unpaidBills,
          "No unpaid bills",
          (b) => `
            <div class="row">
              <div class="row-main">
                <span class="row-title">${b.type || "bill"} · ${b.household_id || ""}</span>
                <span class="row-sub">${this._period(b.year, b.month)}${b.due_date ? ` · due ${b.due_date}` : ""}</span>
              </div>
              <div class="row-amount">${this._money(b.amount, b.currency)}</div>
            </div>`
        )
      : "";

    const extraSection = showExtra
      ? this._renderSection(
          `Unpaid extra costs (${unpaidExtra.length})`,
          unpaidExtra,
          "No unpaid extra costs",
          (x) => `
            <div class="row">
              <div class="row-main">
                <span class="row-title">${x.description || x.type || "extra"}</span>
                <span class="row-sub">${x.household_id || ""} · ${this._period(x.year, x.month)}</span>
              </div>
              <div class="row-amount">${this._money(x.amount, x.currency)}</div>
            </div>`
        )
      : "";

    const docSection = showDocs
      ? this._renderSection(
          `Document alerts (${warningDocs.length + expiredDocs.length})`,
          [...expiredDocs, ...warningDocs],
          "No document alerts",
          (d) => {
            const tone = (d.days ?? 0) < 0 ? "bad" : "warn";
            const daysLabel =
              (d.days ?? 0) < 0
                ? `${Math.abs(d.days)} days overdue`
                : `${d.days} days left`;
            return `
            <div class="row ${tone}">
              <div class="row-main">
                <span class="row-title">${d.name || d.type || "document"}</span>
                <span class="row-sub">${d.person || ""} · ${d.date || ""} · ${daysLabel}</span>
              </div>
            </div>`;
          }
        )
      : "";

    this.innerHTML = `
      <ha-card>
        <div class="header">
          <div class="title">MyLife Tracker</div>
          <div class="badges">
            <span class="badge total" title="Total badge count">${badge}</span>
            <span class="badge docs" title="Documents">${docsBadge}</span>
            <span class="badge pay" title="Payments">${paymentsBadge}</span>
          </div>
        </div>
        <div class="meta">Updated ${updated}</div>
        ${billSection}
        ${extraSection}
        ${docSection}
      </ha-card>
    `;

    if (!this._stylesAttached) {
      this._stylesAttached = true;
      const style = document.createElement("style");
      style.textContent = `
        ha-card {
          padding: 12px 16px 16px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }
        .title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .badges {
          display: flex;
          gap: 6px;
        }
        .badge {
          min-width: 1.6rem;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 700;
          text-align: center;
          color: var(--primary-text-color);
          background: var(--secondary-background-color);
        }
        .badge.total { background: var(--primary-color); color: var(--text-primary-color, #fff); }
        .badge.docs { background: #b45309; color: #fff; }
        .badge.pay { background: #b91c1c; color: #fff; }
        .meta {
          font-size: 0.75rem;
          opacity: 0.7;
          margin-bottom: 12px;
        }
        .section { margin-top: 10px; }
        .section-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          opacity: 0.75;
          margin-bottom: 6px;
        }
        .list { display: flex; flex-direction: column; gap: 6px; }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 10px;
          background: var(--secondary-background-color);
        }
        .row.warn { border-left: 3px solid #d97706; }
        .row.bad { border-left: 3px solid #dc2626; }
        .row-main { min-width: 0; }
        .row-title {
          display: block;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .row-sub {
          display: block;
          font-size: 0.78rem;
          opacity: 0.75;
        }
        .row-amount {
          font-weight: 700;
          white-space: nowrap;
        }
        .empty, .error {
          font-size: 0.85rem;
          opacity: 0.7;
          padding: 4px 0;
        }
      `;
      this.appendChild(style);
    }
  }
}

class MyLifeTrackerCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
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
        <label>
          Status entity
          <input class="entity" type="text" style="width:100%;margin-top:4px;" />
        </label>
        <label><input class="show-bills" type="checkbox" /> Show unpaid bills</label>
        <label><input class="show-extra" type="checkbox" /> Show unpaid extra costs</label>
        <label><input class="show-docs" type="checkbox" /> Show document alerts</label>
      </div>
    `;

    const entity = this.querySelector(".entity");
    entity.value = this._config.entity || "sensor.mylife_tracker_status";
    entity.addEventListener("change", (ev) => this._update("entity", ev.target.value));

    const bills = this.querySelector(".show-bills");
    bills.checked = this._config.show_bills !== false;
    bills.addEventListener("change", (ev) => this._update("show_bills", ev.target.checked));

    const extra = this.querySelector(".show-extra");
    extra.checked = this._config.show_extra_costs !== false;
    extra.addEventListener("change", (ev) => this._update("show_extra_costs", ev.target.checked));

    const docs = this.querySelector(".show-docs");
    docs.checked = this._config.show_documents !== false;
    docs.addEventListener("change", (ev) => this._update("show_documents", ev.target.checked));
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

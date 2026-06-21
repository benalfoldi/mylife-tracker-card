# MyLife Tracker Card

Lovelace cards for the [MyLife Tracker Home Assistant integration](https://github.com/benalfoldi/mylife-tracker-home-assistant): a **full table** card and a **compact glance** card.

Requires the integration to be installed and configured with *your* MyLife Tracker server URL and API key.

## Install via HACS

1. **HACS → Frontend → ⋮ → Custom repositories**
2. URL: `https://github.com/benalfoldi/mylife-tracker-card` — category **Lovelace**
3. Install **MyLife Tracker Card** → hard-refresh dashboard (Ctrl+F5)

## Full table card

```yaml
type: custom:mylife-tracker-card
entity: sensor.mylife_tracker_status
layout: full
theme: brand
min_year: 2025
max_rows: 8
max_height: 120
show_bills: true
show_extra_costs: true
show_documents: false
bill_columns:
  - type
  - household
  - period
  - amount
extra_columns:
  - description
  - period
  - amount
```

## Compact glance card

Small badge-only card for dashboards — counts only, no tables. Add via card picker as **MyLife Tracker Glance**, or set `layout: compact` on the main card:

```yaml
type: custom:mylife-tracker-glance-card
entity: sensor.mylife_tracker_status
theme: brand
min_year: 2025
show_bills: true
show_extra_costs: true
show_documents: false
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `entity` | required | Status sensor from the integration |
| `layout` | `full` | `full` = tables; `compact` = header + count badges only |
| `theme` | `brand` | `brand` = MyLife navy/teal; `ha` = native HA colors |
| `min_year` | `2025` | Hide items with billing year before this |
| `max_rows` | `8` | Rows per section (full layout only) |
| `max_height` | `120` | Scroll area height in px (full layout only) |
| `bill_columns` / `extra_columns` / `doc_columns` | see example | Customize table columns (full layout, UI editor) |

### Column keys

**Bills:** `type`, `household`, `period`, `due_date`, `amount`, `note`

**Extra costs:** `description`, `type`, `household`, `period`, `due_date`, `amount`

**Documents:** `name`, `person`, `type`, `date`, `days`

## Requires

- [MyLife Tracker integration](https://github.com/benalfoldi/mylife-tracker-home-assistant) installed in Home Assistant

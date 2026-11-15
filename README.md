# MyLife Tracker Card

Lovelace cards for the [MyLife Tracker Home Assistant integration](https://github.com/benalfoldi/mylife-tracker-home-assistant): bills/docs cards plus **education** cards (múlt heti osztályzatok, következő hét házi, órarend).

Requires the integration to be installed and configured with *your* MyLife Tracker server URL and API key. Integration **v1.1.0+** exposes `sensor.mylife_tracker_education`.

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
| `bill_households` / `bill_users` | `[]` (all) | Filter számlák by household id and assigned user ids |
| `extra_households` / `extra_users` | `[]` (all) | Filter extra costs by household and users |
| `doc_users` / `doc_persons` | `[]` (all) | Filter okmányok by user id and/or person name |
| `bill_columns` / `extra_columns` / `doc_columns` | see example | Customize table columns (full layout, UI editor) |

### Column keys

**Bills:** `type`, `household`, `period`, `due_date`, `amount`, `note`

**Extra costs:** `description`, `type`, `household`, `period`, `due_date`, `amount`

**Documents:** `name`, `person`, `type`, `date`, `days`

## Education cards (v1.7+)

Point each card at `sensor.mylife_tracker_education` (created by integration v1.1+).

### Heti osztályzatok (compact)

```yaml
type: custom:mylife-edu-grades-card
entity: sensor.mylife_tracker_education
```

### Házi (compact — today through next Sunday)

```yaml
type: custom:mylife-edu-homework-card
entity: sensor.mylife_tracker_education
```

### Órarend (current week)

Shared left time column, F|B side-by-side, striped period rows:

```yaml
type: custom:mylife-edu-timetable-card
entity: sensor.mylife_tracker_education
```

## Requires

- [MyLife Tracker integration](https://github.com/benalfoldi/mylife-tracker-home-assistant) installed in Home Assistant (v1.1.0+ for education cards)

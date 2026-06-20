# MyLife Tracker Card

Compact **table** Lovelace card for the [MyLife Tracker Home Assistant integration](https://github.com/benalfoldi/mylife-tracker-home-assistant).

Requires the integration to be installed and configured with *your* MyLife Tracker server URL and API key.

## Install via HACS

1. **HACS → Frontend → ⋮ → Custom repositories**
2. URL: `https://github.com/benalfoldi/mylife-tracker-card` — category **Lovelace**
3. Install **MyLife Tracker Card** → hard-refresh dashboard (Ctrl+F5)

## Example YAML

```yaml
type: custom:mylife-tracker-card
entity: sensor.mylife_tracker_status
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

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `entity` | required | Status sensor from the integration |
| `theme` | `brand` | `brand` = MyLife navy/teal; `ha` = native HA colors |
| `min_year` | `2025` | Hide items with billing year before this |
| `max_rows` | `8` | Rows per section |
| `max_height` | `120` | Scroll area height (px) |
| `bill_columns` / `extra_columns` / `doc_columns` | see example | Customize table columns (UI editor) |

### Column keys

**Bills:** `type`, `household`, `period`, `due_date`, `amount`, `note`

**Extra costs:** `description`, `type`, `household`, `period`, `due_date`, `amount`

**Documents:** `name`, `person`, `type`, `date`, `days`

## Requires

- [MyLife Tracker integration](https://github.com/benalfoldi/mylife-tracker-home-assistant) installed in Home Assistant

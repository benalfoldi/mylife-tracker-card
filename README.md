# MyLife Tracker Card

Compact **table** Lovelace card for the [MyLife Tracker integration](../home-assistant/).

## Install via HACS

1. **HACS → Frontend → ⋮ → Custom repositories**
2. URL: `https://github.com/benalfoldi/mylife-tracker-card` — category **Lovelace**
3. Install **MyLife Tracker Card** → hard-refresh dashboard (Ctrl+F5)

## Example YAML

```yaml
type: custom:mylife-tracker-card
entity: sensor.mylife_tracker_status
min_year: 2025
max_rows: 8
max_height: 120
show_header: true
show_bills: true
show_extra_costs: false
show_documents: true
bill_columns:
  - type
  - household
  - period
  - amount
extra_columns:
  - description
  - period
  - amount
doc_columns:
  - name
  - date
  - days
```

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `entity` | required | Status sensor |
| `min_year` | `2025` | Hide items with billing year before this (client-side filter) |
| `max_rows` | `10` | Rows per section |
| `max_height` | `140` | Scroll area height (px) |
| `show_header` | `true` | Compact title + badge pills |
| `show_bills` / `show_extra_costs` / `show_documents` | `true` | Toggle sections |
| `bill_columns` | type, household, period, amount | Pick columns (UI editor has checkboxes) |
| `extra_columns` | description, period, amount | Extra cost columns |
| `doc_columns` | name, date, days | Document columns |

### Bill column keys

`type`, `household`, `period`, `due_date`, `amount`, `note`

### Extra column keys

`description`, `type`, `household`, `period`, `due_date`, `amount`

### Document column keys

`name`, `person`, `type`, `date`, `days`

## Requires

- [MyLife Tracker integration](../home-assistant/)
- Server `ha_status.py` deployed (filters unpaid items to year ≥ 2025 for API/badge counts)

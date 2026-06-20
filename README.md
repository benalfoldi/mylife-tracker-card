# MyLife Tracker Card

Lovelace dashboard card for the [MyLife Tracker Home Assistant integration](../home-assistant/).

Shows total badge counts plus lists of unpaid bills, unpaid extra costs, and document expiry alerts.

## Install via HACS

1. Publish this `home-assistant-card/` folder as a **standalone GitHub repo**
2. **HACS → Frontend → ⋮ → Custom repositories**
3. Add the repo URL, category **Lovelace**
4. Search **MyLife Tracker Card** → **Download**
5. **Settings → Dashboards → Resources** — HACS usually adds the resource automatically; if not, add:
   - URL: `/hacsfiles/mylife-tracker-card/mylife-tracker-card.js`
   - Type: JavaScript module

## Usage

Add a card in the UI (**MyLife Tracker Card**) or YAML:

```yaml
type: custom:mylife-tracker-card
entity: sensor.mylife_tracker_status
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `entity` | required | Status sensor from the integration |
| `show_bills` | `true` | Show unpaid bills section |
| `show_extra_costs` | `true` | Show unpaid extra costs section |
| `show_documents` | `true` | Show warning/expired documents |

## Requires

- [MyLife Tracker integration](../home-assistant/) installed and configured
- The integration's **Status** sensor entity

## Screenshot layout

- Header with total / documents / payments badge pills
- Last updated timestamp
- Collapsible-style sections for bills, extra costs, and documents

## Manual install (no HACS)

Copy `mylife-tracker-card.js` to `/config/www/community/mylife-tracker-card/` and add the resource in Lovelace.

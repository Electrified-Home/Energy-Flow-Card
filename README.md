# Energy Flow Card

A Home Assistant dashboard card that focuses on clearly configuring and validating energy flows between the grid, home load, batteries, and on-site production (solar, wind, etc.). The current milestone emphasizes easy configuration with a live edit view and a simple preview harness.

## Prerequisites

- Node.js 20+
- pnpm (Corepack recommended)

Install dependencies after cloning:

```bash
pnpm install
```

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev -- --open test.html` | Start Vite in dev mode and open the preview harness. |
| `pnpm build` | Type-check and bundle the card plus preview files. Outputs to `dist/`. |
| `pnpm preview` | Serve the production build for inspection. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Run Vitest in watch mode. |

## Preview Harness (`test.html`)

`test.html` mirrors the Home Assistant edit dialog without requiring Home Assistant to be running. Use it to:

1. Experiment with card configuration fields.
2. Randomize or reset mock sensor values to watch the visualization respond.
3. Verify that configuration validation behaves as expected before deploying.

Launch it via the dev server:

```bash
pnpm dev -- --open test.html
```

## Configuration Schema

The card expects the standard Lovelace custom card structure with type `custom:energy-flow-card`. A minimal example:

```yaml
type: custom:energy-flow-card
entities:
  grid: sensor.grid_exchange_power
  home: sensor.home_load_power
  battery: sensor.battery_flow_power
  production: sensor.solar_inverter_power
display:
  unit: kW
  decimals: 1
```

Rules enforced today:

- Provide at least two entity IDs (for example `grid` and `home`).
- Entity IDs must follow the `domain.object_id` format.
- `display.decimals` is clamped between 0 and 3.

## Testing Strategy

The Vitest suite currently focuses on configuration normalization and validation logic. As the visualization evolves, extend the tests to cover rendering helpers and data-mapping utilities.

## Next Steps

- Hook the visualization to real Home Assistant energy statistics.
- Iterate on the flow diagram aesthetics (arrows, animations, thresholds).
- Add screenshot tests to guard against accidental regressions.

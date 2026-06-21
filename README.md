# Robot Vacuum Cleaner — Local Web App

A modern, self‑hosted dashboard to control a **Tuya‑based robot vacuum entirely on your local network** — no cloud account, no vendor app. The app talks to the robot directly over the Tuya **local** protocol; only the optional floor map is pulled from the Tuya cloud.

> Originally built for a **Rowenta X‑Plorer** (a re‑branded Tuya vacuum), but it works with any Tuya `sd` robot vacuum that exposes the standard data points listed below.

A small Python server exposes a JSON API and serves a React dashboard. English is the default UI language, with a one‑click switch to Ukrainian.

---

## Features

- **Live status** (polled every 5 s): state, battery, current session area/time, faults
- **Control**: start · pause · resume · return to dock · finish · find robot / silence
- **Cleaning settings**: mode (smart / zone / room / spot), suction, water flow, volume, do‑not‑disturb
- **Manual drive**: on‑screen D‑pad **+ WASD + Space (stop)**, with a 1–5 speed slider
  (the robot has no speed channel, so lower speeds are emulated with short PWM pulses)
- **Maintenance**: side/main brush, filter and mop‑cloth life with reset, plus map reset
- **Statistics** and **live charts** (Recharts)
- **Floor map** via the Tuya cloud (optional)
- **i18n**: English (default) / Ukrainian
- **Responsive**: sidebar on desktop, bottom navigation on phones; dark UI, SVG icons only

## Tech stack

- **Backend** — Python standard‑library HTTP server, [`tinytuya`](https://github.com/jasonacox/tinytuya) for the local protocol, [`tuya-vacuum`](https://pypi.org/project/tuya-vacuum/) for the map.
- **Frontend** — React 19 + Vite + TypeScript + Tailwind CSS v4 + Recharts + lucide-react.

## Requirements

- **Python** 3.10+ (3.12 recommended)
- **Node.js** 18+ and npm
- A **Tuya‑compatible robot vacuum** on the same LAN, plus its **Device ID** and **Local Key**

---

## 1 · Get your Device ID and Local Key

These two secrets are needed for local control. The easiest path is via a free Tuya IoT Cloud project:

1. Add the robot to the **Smart Life** app (or **Tuya Smart**). It can stay in the vendor app too.
2. Create a free project at **https://iot.tuya.com** → *Cloud → Development → Create Cloud Project*.
   Pick **Smart Home** and the **Data Center** that matches your account region (e.g. *Central Europe*).
   Copy the **Access ID / Client ID** and **Access Secret / Client Secret**.
3. In the project: *Devices → Link App Account → Add App Account*, then scan the QR code in
   **Smart Life → Me → scan**. Your devices (incl. the vacuum) now appear under *Devices → All Devices*.
4. Extract the Local Key with the tinytuya wizard:

   ```bash
   pip install tinytuya
   python -m tinytuya wizard
   ```

   Enter your Access ID / Secret, any Device ID, region (`eu`, …). It writes `devices.json`
   containing each device's `id`, **`key` (the Local Key)** and protocol `version` (3.3 / 3.4 / 3.5).

## 2 · Configure

Copy the example env file and fill in your values:

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

```ini
VACUUM_DEVICE_ID=...        # your robot's Device ID
VACUUM_DEVICE_IP=192.168.x.x    # the robot's LAN IP — find it in your router (see note)
VACUUM_LOCAL_KEY=...        # your robot's Local Key
VACUUM_VERSION=3.5          # protocol version from devices.json
# Optional — only for the floor map:
VACUUM_CLOUD_ORIGIN=https://openapi.tuyaeu.com
VACUUM_CLOUD_CLIENT=...
VACUUM_CLOUD_SECRET=...
# Server:
VACUUM_HOST=127.0.0.1       # 0.0.0.0 to reach it from other devices on the LAN
VACUUM_PORT=8765
```

> **Find the robot's IP** in your router's admin page → *connected devices / DHCP client list*
> (look for the vacuum). Give it a **static / reserved lease** so the address doesn't change.

`.env` is git‑ignored — your secrets never get committed.

## 3 · Build and run

```bash
pip install tinytuya tuya-vacuum
cd frontend
npm install
npm run build
cd ..
python server.py
```

Open **http://127.0.0.1:8765**

---

## Development (hot reload)

Run the API and the Vite dev server in two terminals:

```bash
python server.py                  # terminal 1 — API on :8765
cd frontend && npm run dev        # terminal 2 — UI on :5173 (proxies /api → :8765)
```

Open **http://127.0.0.1:5173**

## Access from your phone

Set `VACUUM_HOST=0.0.0.0` in `.env`, restart `server.py`, then open
`http://<this-PC-IP>:8765` on a phone connected to the same Wi‑Fi.

## Floor map (optional, free)

The full map bitmap isn't exposed locally, so it's fetched from the Tuya cloud. The realtime‑map
endpoint needs a **free** subscription:

> `iot.tuya.com` → your Cloud project → **Service API → Go to Authorize** → subscribe (Free Trial)
> to **“Smart Home Basic Service”** and anything containing **“Sweeper” / “Map”**.

Until that's enabled, the **Map** tab shows these exact steps. The robot must also have built a map
(run a full clean once).

---

## API

| Method & path | Description |
|---|---|
| `GET /api/status` | JSON of the current state (DP mapped to friendly fields) |
| `GET /api/action?action=<a>&value=<v>` | Run a command (see below) |
| `GET /api/map` | PNG of the map, or `{"ok":false,"error":"SUBSCRIBE"}` |

Actions: `start, pause, resume, home, break, locate_on, locate_off, mode, suction, water, volume, disturb, drive, reset_map, reset_edge_brush, reset_roll_brush, reset_filter, reset_duster_cloth`.

## Data points (DP)

| DP | code | type | meaning |
|----|------|------|---------|
| 1  | power_go | bool | start / resume |
| 2  | pause | bool | pause |
| 3  | switch_charge | bool | return to dock |
| 4  | mode | enum | smart, zone, pose, part, chargego |
| 5  | status | enum (read) | charging, standby, cleaning, paused, goto_charge… |
| 6  | clean_time | int | session minutes |
| 7  | clean_area | int | session m² |
| 8  | battery | int | battery % |
| 9  | suction | enum | gentle, normal, strong |
| 10 | cistern | enum | low, middle, high (water) |
| 11 | seek | bool | locate sound |
| 12 | direction | enum | forward, backward, turn_left, turn_right, stop |
| 13 | reset_map | bool | reset saved map |
| 16 | request | enum | get_map, get_path, get_both |
| 17 / 19 / 21 / 23 | edge_brush / roll_brush / filter / duster_cloth | int | consumable life |
| 18 / 20 / 22 / 24 | reset_* | bool | reset the matching counter |
| 25 | switch_disturb | bool | do not disturb |
| 26 | volume | int | volume % |
| 27 | break_clean | bool | finish cleaning |
| 28 | fault | bitmap | 0 = no errors |
| 29 / 30 / 31 | total_area / total_count / total_time | int | lifetime totals |

## Project structure

```
.
├── server.py            # backend: JSON API (/api/*) + serves frontend/dist
├── cli.py               # optional command-line control
├── .env.example         # copy to .env and fill in (secrets stay local)
├── frontend/            # React app (Vite + TS + Tailwind + Recharts)
│   └── src/             # components / pages / hooks / i18n / lib
└── README.md
```

## Notes & caveats

- **Unofficial** — not affiliated with Tuya or any vacuum vendor. Use at your own risk.
- Commands travel locally with ~100–300 ms latency (normal for Tuya).
- No dedicated motor‑speed DP, so manual driving uses PWM‑style pulses for speeds below 5.
- After changing the frontend, rebuild with `npm run build` so the server serves fresh assets.

## License

Released under the [MIT License](LICENSE).

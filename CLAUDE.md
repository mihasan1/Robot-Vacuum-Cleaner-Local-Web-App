# CLAUDE.md — Robot Vacuum Local Web App

Контекст проєкту для Claude Code. Локальне керування **Tuya-роботом-пилососом**
напряму в локальній мережі, без хмари. Початково зроблено під Rowenta X-Plorer
(у Tuya — «Serie 140+»), але працює з будь-яким Tuya-пилососом (категорія `sd`)
зі стандартними DP. Керування через `tinytuya`. Публічна назва застосунку — **RoboVac**.

Публічний репозиторій: https://github.com/mihasan1/Robot-Vacuum-Cleaner-Local-Web-App

## Поточний стан

Готово: сучасний темний дашборд (React 19 + Vite + TypeScript + Tailwind v4,
графіки Recharts, іконки lucide — **лише SVG, без emoji**), бекенд `server.py`
(JSON-API + роздача зібраного фронтенду), CLI `cli.py`, **i18n** (English за
замовчуванням + Українська з перемикачем), карта приміщення з хмари Tuya.
Секрети — у `.env` (`VACUUM_*`), README англійською для публічного репо.

## Структура

```
.
├── server.py            # бекенд: JSON-API (/api/*) + роздача frontend/dist
├── cli.py               # CLI-пульт (status/start/home/...); читає .env
├── .env                 # СЕКРЕТИ (VACUUM_*, у .gitignore — не комітити!)
├── .env.example         # шаблон
├── README.md            # публічна інструкція (англійською)
├── LICENSE              # MIT
├── frontend/            # React-додаток (Vite + TS + Tailwind + Recharts)
│   └── src/
│       ├── i18n/        # en.ts (джерело), uk.ts (дзеркало), index.tsx (LangProvider)
│       ├── components/  # ui.tsx, Sidebar, Topbar, MobileNav, LangToggle, картки, графіки, MapView, Toast
│       ├── pages/       # Dashboard, MapPage, Maintenance, Statistics, Settings
│       ├── hooks/       # useStatus (полінг 5 c), useDrive (WASD + ШІМ-швидкість)
│       ├── lib/         # types.ts, api.ts, meta.tsx (іконки/тони/опції/statusMeta/formatLife)
│       ├── app-context.tsx  # useApp(): status + online + history + act()
│       └── App.tsx      # LangProvider > ToastProvider > AppProvider > shell
└── CLAUDE.md            # цей файл
```

## Запуск

```
pip install tinytuya tuya-vacuum
cd frontend && npm install && npm run build && cd ..
python server.py
# → http://127.0.0.1:8765
```

Розробка (гаряче перезавантаження): `python server.py` (API :8765) + в іншому
терміналі `cd frontend && npm run dev` (UI :5173, проксі `/api` → :8765).
Телефон/інший ПК у мережі: `VACUUM_HOST=0.0.0.0` у `.env`.

## i18n

- Рядки — у `frontend/src/i18n/en.ts` (джерело істини) та `uk.ts` (точне дзеркало ключів).
- `useT()` → `t(key, params?)`; підстановка `{name}`/`{n}`/`{time}`. English за замовчуванням,
  fallback на en, вибір у `localStorage`. Перемикач — `LangToggle` (топбар + Налаштування).
- Опції/статуси несуть **ключі** перекладу (`meta.tsx`), а не готовий текст.
- **Додаючи рядок — додавай ключ у ОБИДВА словники** (`en.ts` і `uk.ts`).
- Бекенд віддає короткі англ. лейбли у `/api/action`, але фронт локалізує тости сам.

## API endpoints

- `GET /api/status` — JSON стану (мапить DP → зрозумілі поля)
- `GET /api/action?action=<a>&value=<v>` — команда (`server.do_action`)
- `GET /api/map` — PNG карти або `{"ok":false,"error":"SUBSCRIBE"}`

Дії: `start, pause, resume, home, break, locate_on, locate_off, mode, suction,
water, volume, disturb, drive, reset_map, reset_edge_brush, reset_roll_brush,
reset_filter, reset_duster_cloth`.

## Параметри (у `.env`, префікс `VACUUM_`)

```
VACUUM_DEVICE_ID=…        VACUUM_LOCAL_KEY=…   (!!! секрет)
VACUUM_DEVICE_IP=192.168.0.91                 VACUUM_VERSION=3.5
VACUUM_CLOUD_ORIGIN=https://openapi.tuyaeu.com
VACUUM_CLOUD_CLIENT=…     VACUUM_CLOUD_SECRET=…  (!!! секрет)
VACUUM_HOST=127.0.0.1     VACUUM_PORT=8765
```
Реальні значення лише у `.env` (gitignored). `server.py` і `cli.py` мають
вбудований мінімальний парсер `.env` (без зовнішніх залежностей).

## Карта DP (data points)

| DP | code | тип | значення |
|----|------|-----|----------|
| 1  | power_go | bool | старт/продовжити |
| 2  | pause | bool | пауза |
| 3  | switch_charge | bool | на базу |
| 4  | mode | enum | smart, zone, pose, part, chargego |
| 5  | status | enum (read) | charging, standby, cleaning, paused, goto_charge… |
| 6  | clean_time | int | хв (поточна сесія) |
| 7  | clean_area | int | м² (поточна сесія) |
| 8  | battery | int | % заряду |
| 9  | suction | enum | gentle, normal, strong |
| 10 | cistern | enum | low, middle, high (вода) |
| 11 | seek | bool | звук «знайти робота» |
| 12 | direction | enum | forward, backward, turn_left, turn_right, stop |
| 13 | reset_map | bool | скинути карту |
| 16 | request | enum | get_map, get_path, get_both |
| 17/19/21/23 | edge_brush/roll_brush/filter/duster_cloth | int | ресурс витратників |
| 18/20/22/24 | reset_* | bool | скидання відповідних лічильників |
| 25 | switch_disturb | bool | не турбувати |
| 26 | volume | int | гучність % |
| 27 | break_clean | bool | завершити прибирання |
| 28 | fault | bitmap | 0 = немає помилок |
| 29/30/31 | total_area/total_count/total_time | int | підсумки |

## Карта приміщення (хмара)

Повний бітмап локально НЕ віддається — карта тягнеться з хмари Tuya бібліотекою
`tuya-vacuum`. Realtime-map потребує безкоштовної підписки:
`iot.tuya.com` → Cloud-проєкт → **Service API → Go to Authorize** → підписатись на
«Smart Home Basic Service» + усе зі словом «Sweeper»/«Map». Поки не підписано —
`/api/map` повертає `{"ok":false,"error":"SUBSCRIBE"}`, а вкладка «Карта» показує інструкцію.

## Залежності

Бекенд: `tinytuya` (локальний протокол), `tuya-vacuum` (карта; тягне `httpx`,
`Pillow`, `lz4`). Python 3.12.
Фронтенд: Node 18+/npm. React 19, Vite 6, Tailwind v4, Recharts 3, lucide-react,
`@fontsource-variable/inter`, `react-is` (peer для Recharts).

## Застереження / TODO

- Секрети лише у `.env` (`VACUUM_*`). Особисті нотатки користувача
  (`Setup_Guide_Smart_Life_Tuya.md`, `Історія_сесії.md`) — у `.gitignore`, не публікуються.
- IP робота — у `.env` (`VACUUM_DEVICE_IP`); закріпити DHCP-резервацією в роутері.
- Немає окремого DP швидкості руху — швидкість лише ШІМ-емуляція (`useDrive.ts`).
- Карта потребує безкоштовної підписки на хмарний map-API Tuya (див. вище).
- Після зміни фронтенду — `npm run build`, щоб бекенд віддавав свіжий `dist`.
- Команди йдуть локально (~100–300 мс затримка) — нормально для Tuya.
```

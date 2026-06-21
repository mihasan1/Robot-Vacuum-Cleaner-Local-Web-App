#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local control backend for a Tuya robot vacuum + static hosting of the React UI.

Talks to the robot directly on the LAN (no cloud); the floor map is fetched from
the Tuya cloud separately.

Architecture:
    * JSON API under /api/*   (status / action / map)
    * static files of the built React frontend from frontend/dist under /

Secrets and parameters are read from a .env file (see .env.example).

Run (normal mode, after building the frontend):
    pip install tinytuya tuya-vacuum
    cd frontend && npm install && npm run build && cd ..
    python server.py
    # -> http://127.0.0.1:8765

Run (frontend dev mode, hot reload):
    terminal 1:  python server.py             # API on :8765
    terminal 2:  cd frontend && npm run dev    # UI on :5173 (proxies /api -> :8765)

To reach it from a phone / another PC on the network, set VACUUM_HOST=0.0.0.0 in .env.
"""

import io
import os
import json
import threading
import mimetypes
import posixpath
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

import tinytuya

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.join(BASE_DIR, "frontend", "dist")


# ─────────── Minimal .env loader (no external dependency) ───────────
def load_env(path):
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            key, val = key.strip(), val.strip()
            if len(val) >= 2 and val[0] in "\"'" and val[-1] == val[0]:
                val = val[1:-1]
            os.environ.setdefault(key, val)


load_env(os.path.join(BASE_DIR, ".env"))

# ─────────── Device parameters (from .env) ───────────
DEVICE_ID = os.environ.get("VACUUM_DEVICE_ID", "")
DEVICE_IP = os.environ.get("VACUUM_DEVICE_IP", "")  # robot's LAN IP (from your router)
LOCAL_KEY = os.environ.get("VACUUM_LOCAL_KEY", "")
VERSION   = float(os.environ.get("VACUUM_VERSION", "3.5"))

CLOUD_ORIGIN = os.environ.get("VACUUM_CLOUD_ORIGIN", "https://openapi.tuyaeu.com")
CLOUD_CLIENT = os.environ.get("VACUUM_CLOUD_CLIENT", "")
CLOUD_SECRET = os.environ.get("VACUUM_CLOUD_SECRET", "")

HOST = os.environ.get("VACUUM_HOST", "127.0.0.1")
PORT = int(os.environ.get("VACUUM_PORT", "8765"))

# ─────────── Data points (DP) map ───────────
DP = {
    "power_go": "1", "pause": "2", "switch_charge": "3", "mode": "4",
    "status": "5", "clean_time": "6", "clean_area": "7", "battery": "8",
    "suction": "9", "cistern": "10", "seek": "11", "direction": "12",
    "reset_map": "13", "request": "16",
    "edge_brush": "17", "reset_edge_brush": "18",
    "roll_brush": "19", "reset_roll_brush": "20",
    "filter": "21", "reset_filter": "22",
    "duster_cloth": "23", "reset_duster_cloth": "24",
    "switch_disturb": "25", "volume": "26", "break_clean": "27",
    "fault": "28", "total_area": "29", "total_count": "30", "total_time": "31",
}

_lock = threading.Lock()
_dev = None


def device():
    global _dev
    if _dev is None:
        d = tinytuya.Device(DEVICE_ID, DEVICE_IP, LOCAL_KEY)
        d.set_version(VERSION)
        d.set_socketTimeout(6)
        d.set_socketPersistent(True)
        _dev = d
    return _dev


def read_status():
    with _lock:
        st = device().status()
    dps = st.get("dps", {}) if isinstance(st, dict) else {}
    g = dps.get
    return {
        "ok": bool(dps),
        "status": g(DP["status"]),
        "mode": g(DP["mode"]),
        "battery": g(DP["battery"]),
        "suction": g(DP["suction"]),
        "cistern": g(DP["cistern"]),
        "volume": g(DP["volume"]),
        "disturb": g(DP["switch_disturb"]),
        "fault": g(DP["fault"], 0),
        "clean_time": g(DP["clean_time"], 0),
        "clean_area": g(DP["clean_area"], 0),
        "total_count": g(DP["total_count"], 0),
        "total_area": g(DP["total_area"], 0),
        "total_time": g(DP["total_time"], 0),
        "edge_brush": g(DP["edge_brush"]),
        "roll_brush": g(DP["roll_brush"]),
        "filter": g(DP["filter"]),
        "duster_cloth": g(DP["duster_cloth"]),
        "raw": dps,
    }


def set_dp(dp, value):
    with _lock:
        r = device().set_value(dp, value)
    return r.get("dps") if isinstance(r, dict) else str(r)


def do_action(action, value):
    a = action
    if a == "start":
        set_dp(DP["mode"], "smart"); return set_dp(DP["power_go"], True)
    if a == "pause":   return set_dp(DP["pause"], True)
    if a == "resume":  return set_dp(DP["power_go"], True)
    if a == "home":    return set_dp(DP["mode"], "chargego")
    if a == "break":   return set_dp(DP["break_clean"], True)
    if a == "locate_on":  return set_dp(DP["seek"], True)
    if a == "locate_off": return set_dp(DP["seek"], False)
    if a == "mode":    return set_dp(DP["mode"], value)
    if a == "suction": return set_dp(DP["suction"], value)
    if a == "water":   return set_dp(DP["cistern"], value)
    if a == "volume":  return set_dp(DP["volume"], int(value))
    if a == "disturb": return set_dp(DP["switch_disturb"], value == "true")
    if a == "drive":   return set_dp(DP["direction"], value)
    if a == "reset_map":          return set_dp(DP["reset_map"], True)
    if a == "reset_edge_brush":   return set_dp(DP["reset_edge_brush"], True)
    if a == "reset_roll_brush":   return set_dp(DP["reset_roll_brush"], True)
    if a == "reset_filter":       return set_dp(DP["reset_filter"], True)
    if a == "reset_duster_cloth": return set_dp(DP["reset_duster_cloth"], True)
    raise ValueError("unknown action: " + a)


# ─────────── Floor map (via Tuya cloud) ───────────
def fetch_map_png():
    """Returns (png_bytes, None) or (None, error_text)."""
    try:
        from tuya_vacuum import Vacuum
    except Exception:
        return None, "The tuya-vacuum library is not installed. Run: pip install tuya-vacuum"
    try:
        v = Vacuum(origin=CLOUD_ORIGIN, client_id=CLOUD_CLIENT,
                   client_secret=CLOUD_SECRET, device_id=DEVICE_ID)
        m = v.fetch_map()
        img = m.to_image()
        try:
            from PIL import Image
            w, h = img.size
            scale = max(1, min(6, 800 // max(1, max(w, h))))
            if scale > 1:
                img = img.resize((w * scale, h * scale), Image.NEAREST)
        except Exception:
            pass
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue(), None
    except Exception as e:
        msg = str(e)
        if "not subscribed" in msg or "28841101" in msg:
            return None, "SUBSCRIBE"
        return None, msg


# Action -> short English label returned by the API (the frontend localizes its own).
LABELS = {
    "start": "Started", "pause": "Paused", "resume": "Resuming", "home": "Returning to dock",
    "break": "Finishing", "locate_on": "Sound on", "locate_off": "Sound off",
    "mode": "Mode", "suction": "Suction", "water": "Water", "volume": "Volume",
    "disturb": "Do not disturb", "drive": "Move", "reset_map": "Map reset",
    "reset_edge_brush": "Counter reset", "reset_roll_brush": "Counter reset",
    "reset_filter": "Counter reset", "reset_duster_cloth": "Counter reset",
}

# Correct MIME types (Windows sometimes does not know some of them)
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/javascript", ".mjs")
mimetypes.add_type("image/svg+xml", ".svg")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("font/woff2", ".woff2")
mimetypes.add_type("font/woff", ".woff")

NOT_BUILT_HTML = """<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>RoboVac — build needed</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#0a0e17;color:#e8edf6;font-family:system-ui,Segoe UI,Roboto,sans-serif}
.box{max-width:620px;padding:40px;background:#111726;border:1px solid #1f2840;border-radius:20px;margin:20px}
h1{margin:0 0 6px;font-size:22px}p{color:#8a94a8;line-height:1.6}
code{background:#0a0e17;border:1px solid #1f2840;color:#a78bfa;padding:2px 8px;border-radius:7px;
font-family:ui-monospace,Consolas,monospace;font-size:13px}
pre{background:#0a0e17;border:1px solid #1f2840;border-radius:12px;padding:16px;overflow:auto;
color:#cbd5e1;font-size:13px;line-height:1.7}</style></head>
<body><div class="box">
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="1.8"
stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>
<h1>Frontend is not built yet</h1>
<p>The React UI lives in the <code>frontend/</code> folder. Build it once:</p>
<pre>cd frontend
npm install
npm run build</pre>
<p>…then reload this page. For hot-reload development run <code>npm run dev</code> and open
<code>http://127.0.0.1:5173</code>.</p>
</div></body></html>"""


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):  # keep the console quiet
        pass

    def _json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _bytes(self, body, ctype, code=200, cache=None):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        if cache:
            self.send_header("Cache-Control", cache)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def serve_static(self, path):
        rel = path.lstrip("/")
        if rel == "":
            rel = "index.html"
        rel = posixpath.normpath(rel).replace("\\", "/")
        if rel.startswith("..") or rel.startswith("/") or ":" in rel:
            return self._json({"ok": False, "error": "bad path"}, 400)

        full = os.path.join(DIST_DIR, *rel.split("/"))
        is_asset = "/assets/" in ("/" + rel)

        if not os.path.isfile(full):
            index = os.path.join(DIST_DIR, "index.html")
            if not is_asset and os.path.isfile(index):
                full = index  # SPA fallback
            elif os.path.isfile(index):
                return self._bytes(NOT_BUILT_HTML.encode("utf-8"), "text/html; charset=utf-8", 404)
            else:
                return self._bytes(NOT_BUILT_HTML.encode("utf-8"), "text/html; charset=utf-8", 200)

        try:
            with open(full, "rb") as f:
                data = f.read()
        except OSError:
            return self._json({"ok": False, "error": "read error"}, 500)

        ctype = mimetypes.guess_type(full)[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/json", "image/svg+xml"):
            ctype += "; charset=utf-8" if "charset" not in ctype else ""
        cache = "public, max-age=31536000, immutable" if is_asset else "no-cache"
        self._bytes(data, ctype, 200, cache)

    def do_GET(self):
        u = urlparse(self.path)
        path = u.path

        if path == "/api/status":
            try:
                self._json(read_status())
            except Exception as e:
                self._json({"ok": False, "error": str(e)})
            return

        if path == "/api/map":
            png, err = fetch_map_png()
            if png:
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(png)))
                self.end_headers()
                self.wfile.write(png)
            else:
                self._json({"ok": False, "error": err})
            return

        if path == "/api/action":
            q = parse_qs(u.query)
            action = q.get("action", [""])[0]
            value = q.get("value", [None])[0]
            try:
                res = do_action(action, value)
                self._json({"ok": True, "label": LABELS.get(action, action), "result": res})
            except Exception as e:
                self._json({"ok": False, "error": str(e)})
            return

        if path.startswith("/api/"):
            self._json({"ok": False, "error": "not found"}, 404)
            return

        self.serve_static(path)


def main():
    built = os.path.isfile(os.path.join(DIST_DIR, "index.html"))
    shown_host = "127.0.0.1" if HOST in ("127.0.0.1", "0.0.0.0") else HOST
    print("=" * 52)
    print("  RoboVac - local web control")
    print(f"  UI:  http://{shown_host}:{PORT}")
    if HOST == "0.0.0.0":
        print("  (reachable from other devices on the network by this PC's IP)")
    if not built:
        print("  NOTE: frontend not built yet -> an instructions page will be shown.")
        print("        Build it:  cd frontend && npm install && npm run build")
    if not LOCAL_KEY:
        print("  NOTE: VACUUM_LOCAL_KEY is not set in .env - commands will not work.")
    print("  Stop: Ctrl+C")
    print("=" * 52)
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        srv.shutdown()


if __name__ == "__main__":
    main()

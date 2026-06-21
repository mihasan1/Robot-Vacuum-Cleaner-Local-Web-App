#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Local CLI control for a Tuya robot vacuum. Works directly on the LAN, no cloud.
Reads device parameters from the .env file (see .env.example).

Dependency:  pip install tinytuya
Usage:
    python cli.py            # interactive menu
    python cli.py status     # show status
    python cli.py start      # start cleaning (smart/auto)
    python cli.py home       # return to dock
    python cli.py pause
    python cli.py resume
    python cli.py locate     # play a sound (find the robot)
    python cli.py suction strong   # gentle | normal | strong
    python cli.py water middle     # low | middle | high
"""

import os
import sys
import tinytuya

# Force UTF-8 output (Windows console otherwise breaks on non-ASCII)
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_env(path):
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k, v = k.strip(), v.strip()
            if len(v) >= 2 and v[0] in "\"'" and v[-1] == v[0]:
                v = v[1:-1]
            os.environ.setdefault(k, v)


load_env(os.path.join(BASE_DIR, ".env"))

DEVICE_ID = os.environ.get("VACUUM_DEVICE_ID", "")
DEVICE_IP = os.environ.get("VACUUM_DEVICE_IP", "192.168.0.91")
LOCAL_KEY = os.environ.get("VACUUM_LOCAL_KEY", "")
VERSION   = float(os.environ.get("VACUUM_VERSION", "3.5"))

# DP (data points) for this model
DP_POWER_GO   = "1"   # bool: start / resume
DP_PAUSE      = "2"   # bool: pause
DP_CHARGE     = "3"   # bool: return to dock
DP_MODE       = "4"   # enum: smart | zone | pose | part | chargego
DP_STATUS     = "5"   # enum (read): charging | standby | cleaning | ...
DP_CLEAN_TIME = "6"   # int: session minutes
DP_CLEAN_AREA = "7"   # int: session area, m2
DP_BATTERY    = "8"   # int: battery %
DP_SUCTION    = "9"   # enum: gentle | normal | strong
DP_CISTERN    = "10"  # enum: low | middle | high (water)
DP_SEEK       = "11"  # bool: play locate sound
DP_VOLUME     = "26"  # int: volume %
DP_FAULT      = "28"  # bitmap: errors (0 = none)
DP_TOTAL_AREA = "29"  # int: total area, m2
DP_TOTAL_CNT  = "30"  # int: total cleanings
DP_TOTAL_TIME = "31"  # int: total hours


def connect():
    d = tinytuya.Device(DEVICE_ID, DEVICE_IP, LOCAL_KEY)
    d.set_version(VERSION)
    d.set_socketTimeout(6)
    return d


def get_status(d):
    st = d.status()
    if not st or "dps" not in st:
        print("Could not read status. Robot unreachable?")
        print("Response:", st)
        return None
    return st["dps"]


def print_status(dps):
    g = dps.get
    print("-------- Robot status --------")
    print(f"  Status:     {g(DP_STATUS, '?')}")
    print(f"  Mode:       {g(DP_MODE, '?')}")
    print(f"  Battery:    {g(DP_BATTERY, '?')} %")
    print(f"  Suction:    {g(DP_SUCTION, '?')}")
    print(f"  Water:      {g(DP_CISTERN, '?')}")
    print(f"  Volume:     {g(DP_VOLUME, '?')} %")
    fault = g(DP_FAULT, 0)
    print(f"  Errors:     {'none' if not fault else fault}")
    print(f"  Session:    {g(DP_CLEAN_TIME, 0)} min / {g(DP_CLEAN_AREA, 0)} m2")
    print(f"  Total:      {g(DP_TOTAL_CNT, 0)} cleanings, {g(DP_TOTAL_AREA, 0)} m2, {g(DP_TOTAL_TIME, 0)} h")
    print("------------------------------")


def cmd_start(d): d.set_value(DP_MODE, "smart"); d.set_value(DP_POWER_GO, True); print("Start cleaning (smart)")
def cmd_home(d): d.set_value(DP_MODE, "chargego"); print("Returning to dock")
def cmd_pause(d): d.set_value(DP_PAUSE, True); print("Paused")
def cmd_resume(d): d.set_value(DP_POWER_GO, True); print("Resuming")
def cmd_locate(d): d.set_value(DP_SEEK, True); print("Playing a sound - listen for the robot")
def cmd_quiet(d): d.set_value(DP_SEEK, False); print("Locate sound off")


def cmd_suction(d, level):
    if level not in ("gentle", "normal", "strong"):
        print("Suction must be: gentle | normal | strong"); return
    d.set_value(DP_SUCTION, level); print(f"Suction: {level}")


def cmd_water(d, level):
    if level not in ("low", "middle", "high"):
        print("Water must be: low | middle | high"); return
    d.set_value(DP_CISTERN, level); print(f"Water: {level}")


def menu():
    d = connect()
    actions = {
        "1": ("Status", lambda: print_status(get_status(d) or {})),
        "2": ("Start cleaning", lambda: cmd_start(d)),
        "3": ("Return to dock", lambda: cmd_home(d)),
        "4": ("Pause", lambda: cmd_pause(d)),
        "5": ("Resume", lambda: cmd_resume(d)),
        "6": ("Find (sound)", lambda: cmd_locate(d)),
        "7": ("Suction strong", lambda: cmd_suction(d, "strong")),
        "8": ("Suction normal", lambda: cmd_suction(d, "normal")),
        "9": ("Suction gentle", lambda: cmd_suction(d, "gentle")),
        "0": ("Exit", None),
    }
    while True:
        print("\n=== RoboVac CLI ===")
        for k, (label, _) in actions.items():
            print(f"  {k}. {label}")
        choice = input("Choice: ").strip()
        if choice == "0":
            break
        act = actions.get(choice)
        if act:
            try:
                act[1]()
            except Exception as e:
                print("Error:", e)
        else:
            print("Unknown command")


def main():
    if not LOCAL_KEY:
        print("VACUUM_LOCAL_KEY is not set in .env - see .env.example")
    args = sys.argv[1:]
    if not args:
        menu(); return
    cmd = args[0].lower()
    d = connect()
    if cmd == "status":
        dps = get_status(d)
        if dps: print_status(dps)
    elif cmd == "start":   cmd_start(d)
    elif cmd == "home":    cmd_home(d)
    elif cmd == "pause":   cmd_pause(d)
    elif cmd == "resume":  cmd_resume(d)
    elif cmd == "locate":  cmd_locate(d)
    elif cmd == "quiet":   cmd_quiet(d)
    elif cmd == "suction" and len(args) > 1: cmd_suction(d, args[1].lower())
    elif cmd == "water"   and len(args) > 1: cmd_water(d, args[1].lower())
    else:
        print(__doc__)


if __name__ == "__main__":
    main()

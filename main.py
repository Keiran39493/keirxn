from flask import Flask, jsonify, request, send_from_directory, redirect
import json, os, datetime, urllib.request, urllib.parse, urllib.error

app = Flask(__name__, static_folder=".")
app.config["JSON_SORT_KEYS"] = False

PROFILE_FILE = "profile.json"
LOGS_FILE    = "logs.json"
NOTES_FILE   = "notes.json"
EVENTS_FILE  = "events.json"


# ── Helpers ─────────────────────────────────────────────────────────
def load_profile() -> dict:
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE) as f:
            return json.load(f)
    return {}

def save_profile(data: dict):
    existing = load_profile()
    existing.update(data)
    with open(PROFILE_FILE, "w") as f:
        json.dump(existing, f, indent=2)


# ── Static serving ───────────────────────────────────────────────────
@app.route("/")
def root():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/") or path.startswith("."):
        return jsonify({"error": "not found"}), 404
    try:
        return send_from_directory(".", path)
    except Exception:
        return jsonify({"error": "not found"}), 404


# ── Logs ─────────────────────────────────────────────────────────────
def load_logs() -> dict:
    if os.path.exists(LOGS_FILE):
        with open(LOGS_FILE) as f:
            return json.load(f)
    return {}

def save_logs(data: dict):
    with open(LOGS_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/api/logs", methods=["GET"])
def get_logs():
    return jsonify(load_logs())

@app.route("/api/logs", methods=["POST"])
def post_log():
    data  = request.get_json() or {}
    logs  = load_logs()
    today = datetime.date.today().isoformat()
    entry = {
        "vo2max":       data.get("vo2max"),
        "sleep_score":  data.get("sleep_score"),
        "body_battery": data.get("body_battery"),
        "weight_kg":    data.get("weight_kg"),
        "waist_cm":     data.get("waist_cm"),
        "notes":        data.get("notes", "").strip(),
        "logged_at":    datetime.datetime.now().isoformat(),
    }
    logs[today] = {k: v for k, v in entry.items() if v is not None and v != ""}
    if "notes" in data:
        logs[today]["notes"] = data["notes"].strip()
    save_logs(logs)
    return jsonify({"status": "saved", "date": today})

@app.route("/api/logs/<date>", methods=["DELETE"])
def delete_log(date):
    logs = load_logs()
    logs.pop(date, None)
    save_logs(logs)
    return jsonify({"status": "deleted"})


# ── Notes ────────────────────────────────────────────────────────────
def load_notes() -> list:
    if os.path.exists(NOTES_FILE):
        with open(NOTES_FILE) as f:
            return json.load(f)
    return []

def save_notes(data: list):
    with open(NOTES_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/api/notes", methods=["GET"])
def get_notes():
    return jsonify(load_notes())

@app.route("/api/notes", methods=["POST"])
def post_note():
    data  = request.get_json() or {}
    notes = load_notes()
    note  = {
        "id":         str(int(datetime.datetime.now().timestamp() * 1000)),
        "title":      (data.get("title") or "").strip() or "Untitled",
        "body":       data.get("body", ""),
        "encrypted":  bool(data.get("encrypted", False)),
        "iv":         data.get("iv"),
        "created_at": datetime.datetime.now().isoformat(),
    }
    notes.insert(0, note)
    save_notes(notes)
    return jsonify({"status": "saved", "id": note["id"]})

@app.route("/api/notes/<note_id>", methods=["PUT"])
def update_note(note_id):
    data  = request.get_json() or {}
    notes = load_notes()
    for n in notes:
        if n.get("id") == note_id:
            n["title"]      = (data.get("title") or "").strip() or "Untitled"
            n["body"]       = data.get("body", n["body"])
            n["encrypted"]  = bool(data.get("encrypted", n["encrypted"]))
            n["iv"]         = data.get("iv", n.get("iv"))
            n["updated_at"] = datetime.datetime.now().isoformat()
            break
    save_notes(notes)
    return jsonify({"status": "updated"})

@app.route("/api/notes/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    notes = [n for n in load_notes() if n.get("id") != note_id]
    save_notes(notes)
    return jsonify({"status": "deleted"})


# ── Events ───────────────────────────────────────────────────────────
def load_events() -> list:
    if os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE) as f:
            try: return json.load(f)
            except: return []
    return []

def save_events(data: list):
    with open(EVENTS_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/api/events", methods=["GET"])
def get_events():
    return jsonify(load_events())

@app.route("/api/events", methods=["POST"])
def post_event():
    data  = request.get_json() or {}
    title = (data.get("title") or "").strip()
    date  = (data.get("date")  or "").strip()
    if not title or not date:
        return jsonify({"error": "title and date required"}), 400
    event = {
        "id":         str(int(datetime.datetime.now().timestamp() * 1000)),
        "title":      title,
        "date":       date,
        "all_day":    bool(data.get("all_day", False)),
        "start_time": data.get("start_time") or None,
        "end_time":   data.get("end_time")   or None,
        "color":      data.get("color", "#4285f4"),
        "recurrence": data.get("recurrence") or None,
        "exceptions": data.get("exceptions", []),
        "created_at": datetime.datetime.now().isoformat(),
    }
    events = load_events()
    events.insert(0, event)
    save_events(events)
    return jsonify(event), 201

@app.route("/api/events/<event_id>", methods=["PUT"])
def update_event(event_id):
    data   = request.get_json() or {}
    events = load_events()
    for e in events:
        if e.get("id") == event_id:
            e["title"]      = (data.get("title") or e["title"]).strip()
            e["date"]       = data.get("date",   e["date"])
            e["all_day"]    = bool(data.get("all_day",    e.get("all_day", False)))
            e["start_time"] = data.get("start_time") or None
            e["end_time"]   = data.get("end_time")   or None
            e["color"]      = data.get("color",  e.get("color", "#4285f4"))
            e["recurrence"] = data.get("recurrence", e.get("recurrence"))
            e["exceptions"] = data.get("exceptions", e.get("exceptions", []))
            e["updated_at"] = datetime.datetime.now().isoformat()
            save_events(events)
            return jsonify(e)
    return jsonify({"error": "not found"}), 404

@app.route("/api/events/<event_id>", methods=["DELETE"])
def delete_event(event_id):
    events = [e for e in load_events() if e.get("id") != event_id]
    save_events(events)
    return jsonify({"ok": True})


# ── Holidays (Nager.Date) ────────────────────────────────────────────
@app.route("/api/holidays/<country_code>/<int:year>")
def get_holidays(country_code, year):
    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/{country_code.upper()}"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "keirxn-app/1.0")
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return jsonify(json.loads(r.read().decode()))
    except urllib.error.HTTPError as e:
        return jsonify({"error": f"API error ({e.code})"}), e.code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Google Calendar ──────────────────────────────────────────────────
GCAL_TOKEN_FILE  = "gcal_token.json"
GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:5000/api/gcal/callback")
GCAL_SCOPE = "https://www.googleapis.com/auth/calendar.readonly"

def _load_gcal_token():
    if os.path.exists(GCAL_TOKEN_FILE):
        with open(GCAL_TOKEN_FILE) as f:
            return json.load(f)
    return None

def _save_gcal_token(data):
    data["issued_at"] = datetime.datetime.now().timestamp()
    with open(GCAL_TOKEN_FILE, "w") as f:
        json.dump(data, f, indent=2)

def _gcal_access_token():
    token = _load_gcal_token()
    if not token:
        return None
    issued  = token.get("issued_at", 0)
    expires = token.get("expires_in", 3600)
    if datetime.datetime.now().timestamp() > issued + expires - 60:
        if not token.get("refresh_token"):
            return None
        try:
            data = urllib.parse.urlencode({
                "refresh_token": token["refresh_token"],
                "client_id":     GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "grant_type":    "refresh_token",
            }).encode()
            req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
            with urllib.request.urlopen(req, timeout=10) as r:
                new_token = json.loads(r.read().decode())
            new_token.setdefault("refresh_token", token["refresh_token"])
            _save_gcal_token(new_token)
            return new_token["access_token"]
        except Exception:
            return None
    return token.get("access_token")

def _gcal_api_get(path, params=None):
    access_token = _gcal_access_token()
    if not access_token:
        return None, 401
    url = "https://www.googleapis.com/calendar/v3" + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {access_token}")
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return json.loads(r.read().decode()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode()), e.code
    except Exception as e:
        return {"error": str(e)}, 500

@app.route("/api/gcal/status")
def gcal_status():
    token = _load_gcal_token()
    return jsonify({
        "configured": bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET),
        "connected":  bool(token and token.get("access_token")),
    })

@app.route("/api/gcal/auth")
def gcal_auth():
    if not GOOGLE_CLIENT_ID:
        return redirect("/?gcal_error=not_configured")
    params = urllib.parse.urlencode({
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         GCAL_SCOPE,
        "access_type":   "offline",
        "prompt":        "consent",
    })
    return redirect("https://accounts.google.com/o/oauth2/v2/auth?" + params)

@app.route("/api/gcal/callback")
def gcal_callback():
    code  = request.args.get("code")
    error = request.args.get("error")
    if error or not code:
        return redirect("/?gcal_error=access_denied")
    try:
        data = urllib.parse.urlencode({
            "code":          code,
            "client_id":     GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri":  GOOGLE_REDIRECT_URI,
            "grant_type":    "authorization_code",
        }).encode()
        req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data)
        with urllib.request.urlopen(req, timeout=10) as r:
            tokens = json.loads(r.read().decode())
        _save_gcal_token(tokens)
        return redirect("/?gcal_connected=1")
    except Exception:
        return redirect("/?gcal_error=token_failed")

@app.route("/api/gcal/calendars")
def gcal_calendars():
    data, status = _gcal_api_get("/users/me/calendarList")
    if status != 200:
        return jsonify({"error": "Failed to fetch calendars"}), status
    items = data.get("items", [])
    return jsonify([
        {"id": c["id"], "summary": c.get("summary", c["id"]), "primary": c.get("primary", False)}
        for c in items
    ])

@app.route("/api/gcal/sync", methods=["POST"])
def gcal_sync():
    req_data    = request.get_json() or {}
    calendar_id = req_data.get("calendar_id", "primary")
    months      = int(req_data.get("months", 3))
    now   = datetime.datetime.utcnow()
    t_min = now.isoformat() + "Z"
    t_max = (now + datetime.timedelta(days=months * 30)).isoformat() + "Z"
    data, status = _gcal_api_get(
        f"/calendars/{urllib.parse.quote(calendar_id, safe='')}/events",
        params={"timeMin": t_min, "timeMax": t_max, "singleEvents": "true",
                "orderBy": "startTime", "maxResults": 500},
    )
    if status != 200:
        return jsonify({"error": "Failed to fetch Google Calendar events"}), status
    gcal_items = data.get("items", [])
    events     = load_events()
    existing   = {e.get("gcal_id") for e in events if e.get("gcal_id")}
    imported   = 0
    for idx, gev in enumerate(gcal_items):
        gid = gev.get("id")
        if not gid or gid in existing:
            continue
        start = gev.get("start", {})
        end   = gev.get("end",   {})
        if "date" in start:
            date, all_day, start_t, end_t = start["date"], True, None, None
        else:
            dt      = start.get("dateTime", "")
            date    = dt[:10] if dt else ""
            all_day = False
            start_t = dt[11:16] if len(dt) > 11 else None
            edt     = end.get("dateTime", "")
            end_t   = edt[11:16] if len(edt) > 11 else None
        if not date:
            continue
        ev = {
            "id":         f"gcal_{int(datetime.datetime.now().timestamp()*1000)}_{idx}",
            "gcal_id":    gid,
            "title":      gev.get("summary", "No title"),
            "date":       date,
            "all_day":    all_day,
            "start_time": start_t,
            "end_time":   end_t,
            "color":      "#4285f4",
            "recurrence": None,
            "exceptions": [],
            "source":     "google",
            "created_at": datetime.datetime.now().isoformat(),
        }
        events.insert(0, ev)
        existing.add(gid)
        imported += 1
    save_events(events)
    return jsonify({"imported": imported, "total_gcal": len(gcal_items)})

@app.route("/api/gcal/disconnect", methods=["POST"])
def gcal_disconnect():
    if os.path.exists(GCAL_TOKEN_FILE):
        os.remove(GCAL_TOKEN_FILE)
    return jsonify({"ok": True})


# ── Profile ──────────────────────────────────────────────────────────
@app.route("/api/profile", methods=["GET"])
def get_profile():
    return jsonify(load_profile())

@app.route("/api/profile", methods=["POST"])
def post_profile():
    data = request.get_json() or {}
    save_profile(data)
    return jsonify({"status": "saved"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Running: http://localhost:{port}")
    app.run(debug=True, port=port, use_reloader=False)
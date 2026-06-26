from flask import Flask, jsonify, request, send_from_directory
import json, os, time, datetime

try:
    from garminconnect import (
        Garmin,
        GarminConnectConnectionError,
        GarminConnectTooManyRequestsError,
        GarminConnectAuthenticationError,
    )
    GARMIN_AVAILABLE = True
except ImportError:
    GARMIN_AVAILABLE = False
    print("WARNING: garminconnect not installed - run: uv add garminconnect flask")

app = Flask(__name__, static_folder=".")
app.config["JSON_SORT_KEYS"] = False

PROFILE_FILE = "profile.json"
TOKEN_DIR    = ".garmin"
CACHE_TTL    = 1800  # 30 min

_api          = None        # live Garmin client
_mfa_api      = None        # pending MFA client
_cache: dict  = {}


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

def cached_get(key: str, fn, *args):
    now = time.time()
    if key in _cache:
        val, ts = _cache[key]
        if now - ts < CACHE_TTL:
            return val
    val = fn(*args)
    _cache[key] = (val, now)
    return val

def safe(fn, *args, **kwargs):
    """Call a Garmin API method; return None on any error."""
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        print(f"  garmin error: {e}")
        return None


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


# ── Garmin: connect / status ─────────────────────────────────────────
@app.route("/api/garmin/connect", methods=["POST"])
def garmin_connect():
    global _api, _mfa_api
    if not GARMIN_AVAILABLE:
        return jsonify({"error": "garminconnect not installed"}), 500

    body     = request.get_json() or {}
    email    = body.get("email", "").strip()
    password = body.get("password", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    os.makedirs(TOKEN_DIR, exist_ok=True)
    try:
        try:
            api = Garmin(email=email, password=password, is_cn=False, return_on_mfa=True)
        except TypeError:
            # Older garminconnect without return_on_mfa param
            api = Garmin(email=email, password=password, is_cn=False)

        result = api.login(TOKEN_DIR)

        # Some versions return True/non-None when MFA is required
        if result:
            _mfa_api = api
            save_profile({"garmin_email": email})
            return jsonify({"status": "mfa_required"})

        _api = api
        _cache.clear()
        save_profile({"garmin_email": email})
        return jsonify({"status": "connected"})

    except GarminConnectAuthenticationError:
        return jsonify({"error": "Invalid Garmin credentials. Check email and password."}), 401
    except GarminConnectTooManyRequestsError:
        return jsonify({"error": "Too many login attempts. Wait a few minutes and try again."}), 429
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/garmin/mfa", methods=["POST"])
def garmin_mfa():
    global _api, _mfa_api
    if not _mfa_api:
        return jsonify({"error": "No MFA session pending. Please connect first."}), 400

    code = (request.get_json() or {}).get("code", "").strip()
    if not code:
        return jsonify({"error": "MFA code required"}), 400

    try:
        _mfa_api.login(TOKEN_DIR, mfa_code=code)
        _api = _mfa_api
        _mfa_api = None
        _cache.clear()
        return jsonify({"status": "connected"})
    except Exception as e:
        return jsonify({"error": str(e)}), 401


@app.route("/api/garmin/status")
def garmin_status():
    global _api
    if _api:
        profile = load_profile()
        return jsonify({"connected": True, "email": profile.get("garmin_email")})

    # Auto-reconnect from saved tokens
    if not GARMIN_AVAILABLE:
        return jsonify({"connected": False})

    profile = load_profile()
    email   = profile.get("garmin_email")
    if os.path.exists(TOKEN_DIR) and email:
        try:
            api = Garmin(email=email, password="")
            api.login(TOKEN_DIR)
            _api = api
            return jsonify({"connected": True, "email": email})
        except Exception:
            pass

    return jsonify({"connected": False})


@app.route("/api/garmin/disconnect", methods=["POST"])
def garmin_disconnect():
    global _api
    _api = None
    _cache.clear()
    return jsonify({"status": "disconnected"})


# ── Garmin: metrics ──────────────────────────────────────────────────
@app.route("/api/garmin/metrics")
def garmin_metrics():
    if not _api:
        return jsonify({"error": "not_connected"}), 401

    today     = datetime.date.today().isoformat()
    yesterday = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
    cache_key = f"metrics_{today}"

    def fetch():
        out = {}

        # ── Daily stats (steps, resting HR) ──────────────────
        stats = safe(_api.get_stats, today)
        if stats:
            out["stats"] = {
                "steps":        stats.get("totalSteps"),
                "step_goal":    stats.get("dailyStepGoal"),
                "distance_m":   stats.get("totalDistanceMeters"),
                "resting_hr":   stats.get("restingHeartRate"),
                "max_hr":       stats.get("maxHeartRate"),
                "avg_hr":       stats.get("averageHeartRate"),
                "calories":     stats.get("totalKilocalories"),
            }

        # ── Body Battery ─────────────────────────────────────
        bb = safe(_api.get_body_battery, today, today)
        if bb and isinstance(bb, list) and len(bb) > 0:
            readings = bb[0].get("bodyBatteryValuesArray", [])
            out["body_battery"] = {
                "current":  readings[-1][1] if readings else None,
                "readings": [[r[0], r[1]] for r in readings[-24:]],
            }

        # ── Sleep ────────────────────────────────────────────
        sleep = safe(_api.get_sleep_data, yesterday)
        if sleep:
            dto    = sleep.get("dailySleepDTO") or {}
            scores = sleep.get("sleepScores") or {}
            overall = scores.get("overall")
            score_val = (overall.get("value") if isinstance(overall, dict) else overall)
            out["sleep"] = {
                "score":         score_val,
                "duration_secs": dto.get("sleepTimeSeconds"),
                "deep_secs":     dto.get("deepSleepSeconds"),
                "light_secs":    dto.get("lightSleepSeconds"),
                "rem_secs":      dto.get("remSleepSeconds"),
                "awake_secs":    dto.get("awakeSleepSeconds"),
            }

        # ── HRV ──────────────────────────────────────────────
        hrv = safe(_api.get_hrv_data, today)
        if hrv:
            out["hrv"] = {
                "last_night":  hrv.get("lastNight"),
                "weekly_avg":  hrv.get("weeklyAvg"),
                "status":      hrv.get("lastNightStatus"),
            }

        # ── Stress ───────────────────────────────────────────
        stress = safe(_api.get_stress_data, today)
        if stress:
            out["stress"] = {
                "avg": stress.get("avgStressLevel"),
                "max": stress.get("maxStressLevel"),
            }

        # ── VO2 Max ───────────────────────────────────────────
        vo2raw = safe(_api.get_max_metrics, today)
        if vo2raw and isinstance(vo2raw, list) and len(vo2raw) > 0:
            generic = vo2raw[0].get("generic") or {}
            out["vo2max"] = {
                "value":       generic.get("vo2MaxValue"),
                "fitness_age": generic.get("fitnessAge"),
            }

        # ── SpO2 ─────────────────────────────────────────────
        spo2 = safe(_api.get_spo2_data, today)
        if spo2:
            out["spo2"] = {
                "avg":    spo2.get("averageSpO2"),
                "lowest": spo2.get("lowestSpO2"),
            }

        # ── Respiration ───────────────────────────────────────
        resp = safe(_api.get_respiration_data, today)
        if resp:
            out["respiration"] = {
                "avg_waking": resp.get("avgWakingRespirationValue"),
                "avg_sleep":  resp.get("avgSleepRespirationValue"),
            }

        out["insights"]  = generate_insights(out)
        out["fetched_at"] = datetime.datetime.now().isoformat()
        return out

    return jsonify(cached_get(cache_key, fetch))


@app.route("/api/garmin/trends")
def garmin_trends():
    if not _api:
        return jsonify({"error": "not_connected"}), 401

    today     = datetime.date.today().isoformat()
    cache_key = f"trends_{today}"

    def fetch():
        days     = []
        hrv_vals = []
        sleep_vals = []
        bb_vals  = []
        stress_vals = []

        for i in range(6, -1, -1):
            d     = (datetime.date.today() - datetime.timedelta(days=i)).isoformat()
            dprev = (datetime.date.today() - datetime.timedelta(days=i+1)).isoformat()
            days.append(d[5:])  # MM-DD

            h = safe(_api.get_hrv_data, d)
            hrv_vals.append(h.get("lastNight") if h else None)

            sl = safe(_api.get_sleep_data, dprev)
            if sl:
                scores = sl.get("sleepScores") or {}
                ov = scores.get("overall")
                sleep_vals.append(ov.get("value") if isinstance(ov, dict) else ov)
            else:
                sleep_vals.append(None)

            b = safe(_api.get_body_battery, d, d)
            if b and isinstance(b, list) and len(b) > 0:
                r = b[0].get("bodyBatteryValuesArray", [])
                bb_vals.append(r[0][1] if r else None)
            else:
                bb_vals.append(None)

            st = safe(_api.get_stress_data, d)
            stress_vals.append(st.get("avgStressLevel") if st else None)

        return {
            "days": days,
            "hrv": hrv_vals,
            "sleep": sleep_vals,
            "body_battery": bb_vals,
            "stress": stress_vals,
        }

    return jsonify(cached_get(cache_key, fetch))


# ── Insights engine ──────────────────────────────────────────────────
def generate_insights(m: dict) -> list:
    out = []

    hrv  = m.get("hrv") or {}
    ln   = hrv.get("last_night")
    avg  = hrv.get("weekly_avg")
    if ln and avg and avg > 0:
        pct = round(((ln - avg) / avg) * 100)
        if pct < -15:
            out.append({"type": "warning", "icon": "heart",
                "title": "HRV below baseline",
                "body": f"HRV of {ln} ms is {abs(pct)}% below your 7-day average ({avg} ms). Your autonomic nervous system may be under stress.",
                "action": "Prioritise recovery. Avoid high-intensity training today."})
        elif pct > 10:
            out.append({"type": "positive", "icon": "heart",
                "title": "HRV above baseline",
                "body": f"HRV of {ln} ms is {pct}% above your weekly average. Your body is well recovered.",
                "action": "Great conditions for a hard training session."})

    sleep = m.get("sleep") or {}
    sc    = sleep.get("score")
    if sc is not None:
        if sc < 60:
            out.append({"type": "warning", "icon": "moon",
                "title": "Poor sleep quality",
                "body": f"Sleep score of {sc}/100. Insufficient recovery impairs cognitive function and athletic performance.",
                "action": "Aim for 7–9 hours. Limit alcohol and screens before bed."})
        elif sc >= 85:
            out.append({"type": "positive", "icon": "moon",
                "title": "Excellent sleep",
                "body": f"Sleep score of {sc}/100. Outstanding recovery — your body has had adequate time to repair tissue and consolidate memory.",
                "action": "Take advantage with demanding training or focused work early in the day."})
    dur = sleep.get("duration_secs")
    if dur and dur / 3600 < 6:
        out.append({"type": "warning", "icon": "clock",
            "title": "Short sleep duration",
            "body": f"Only {dur/3600:.1f} h of sleep recorded. Adults require 7–9 h for optimal health and hormonal balance.",
            "action": "Target an earlier bedtime tonight."})

    bb = m.get("body_battery") or {}
    level = bb.get("current")
    if level is not None:
        if level < 26:
            out.append({"type": "warning", "icon": "battery",
                "title": "Body battery critically low",
                "body": f"Battery at {level}% — energy reserves are nearly depleted.",
                "action": "Rest, light stretching, and early sleep only."})
        elif level >= 75:
            out.append({"type": "positive", "icon": "battery",
                "title": "Body battery fully charged",
                "body": f"Battery at {level}% — excellent energy reserves.",
                "action": "Ideal for high-output work or intense training."})

    stress = m.get("stress") or {}
    avg_stress = stress.get("avg")
    if avg_stress is not None and avg_stress > 65:
        out.append({"type": "warning", "icon": "zap",
            "title": "Elevated stress",
            "body": f"Average stress of {avg_stress}/100 today. Chronic high stress suppresses immune function and delays recovery.",
            "action": "Try box breathing (4-4-4-4) or a 10-minute walk outside."})

    vo2 = m.get("vo2max") or {}
    v   = vo2.get("value")
    if v:
        if v >= 55:
            out.append({"type": "positive", "icon": "wind",
                "title": "Elite aerobic capacity",
                "body": f"VO₂ Max of {v} mL/kg/min places you in the excellent/elite category — a strong predictor of longevity.",
                "action": "Maintain with regular zone 2 sessions and periodic high-intensity intervals."})
        elif v < 35:
            out.append({"type": "info", "icon": "wind",
                "title": "Aerobic capacity has room to grow",
                "body": f"VO₂ Max of {v} mL/kg/min. Improving this is one of the highest-ROI health investments you can make.",
                "action": "Add 3–4 × 30–45 min zone 2 cardio sessions per week."})

    if not out:
        out.append({"type": "info", "icon": "check",
            "title": "All metrics within normal range",
            "body": "Your biometric scores are within expected ranges. Keep up your current routine.",
            "action": "Stay consistent with sleep, nutrition, and movement."})

    return out


# ── Profile ──────────────────────────────────────────────────────────
@app.route("/api/profile", methods=["GET"])
def get_profile():
    p = load_profile()
    p.pop("garmin_password", None)
    return jsonify(p)

@app.route("/api/profile", methods=["POST"])
def post_profile():
    data = request.get_json() or {}
    data.pop("garmin_password", None)
    save_profile(data)
    return jsonify({"status": "saved"})


# ── Startup ──────────────────────────────────────────────────────────
def try_reconnect():
    global _api
    if not GARMIN_AVAILABLE:
        return
    profile = load_profile()
    email   = profile.get("garmin_email")
    if os.path.exists(TOKEN_DIR) and email:
        try:
            api = Garmin(email=email, password="")
            api.login(TOKEN_DIR)
            _api = api
            print(f"Garmin auto-reconnected ({email})")
        except Exception as e:
            print(f"  Auto-reconnect failed: {e}")

if __name__ == "__main__":
    os.makedirs(TOKEN_DIR, exist_ok=True)
    try_reconnect()
    print("Running: http://localhost:5000")
    app.run(debug=True, port=5000, use_reloader=False)

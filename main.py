from flask import Flask, jsonify, request, send_from_directory
import json, os

app = Flask(__name__, static_folder=".")
app.config["JSON_SORT_KEYS"] = False

PROFILE_FILE = "profile.json"


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
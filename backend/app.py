import os, time, sqlite3, json, logging, hashlib
import numpy as np
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import subprocess 
from datetime import datetime
import io
from werkzeug.utils import secure_filename

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input

from eye_validator import is_eye_image, validate_file_type

# ── CONFIG ─────────────────────────────────────────────
BASE_DIR   = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "eye_disease_model.keras"
CLASS_PATH = BASE_DIR / "model" / "classes.json"
DB_PATH    = BASE_DIR / "database.db"
UPLOAD_DIR = BASE_DIR / "uploads"

IMG_SIZE   = (300, 300)
UPLOAD_DIR.mkdir(exist_ok=True)

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None
CLASSES = []

# ── LOAD MODEL ─────────────────────────────────────────
def load_model():
    global model, CLASSES

    if CLASS_PATH.exists():
        with open(CLASS_PATH) as f:
            class_map = json.load(f)
        CLASSES = [class_map[str(i)] for i in range(len(class_map))]

    if MODEL_PATH.exists():
        model = tf.keras.models.load_model(MODEL_PATH)
        logger.info("Model loaded")

        # Warmup
        dummy = np.zeros((1, *IMG_SIZE, 3))
        model.predict(dummy)

load_model()

# ── DATABASE ───────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn

# ── PREDICTION ─────────────────────────────────────────
def tta_predict(image_bytes, n=8):
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(IMG_SIZE)

    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)  # ✅ FIXED
    arr = np.expand_dims(arr, axis=0)

    tta_gen = ImageDataGenerator(
        horizontal_flip=True,
        rotation_range=10,
        zoom_range=0.05,
        brightness_range=[0.9, 1.1]
    )

    batch = [arr[0]]
    for aug in tta_gen.flow(arr, batch_size=1):
        batch.append(aug[0])
        if len(batch) >= n:
            break

    preds = model.predict(np.array(batch), verbose=0)
    avg = np.mean(preds, axis=0)

    idx = np.argmax(avg)
    label = CLASSES[idx]
    conf = float(avg[idx])

    scores = {CLASSES[i]: float(avg[i]) for i in range(len(CLASSES))}

    return label, conf, scores

# ── ROUTES ─────────────────────────────────────────────
@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
        "demo_mode": model is None,
        "tf_available": True,
        "timestamp": datetime.now().isoformat()
    })
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file = request.files["image"]

    ok, reason = validate_file_type(file.filename, file.content_type)
    if not ok:
        return jsonify({"error": reason}), 400

    image_bytes = file.read()

    is_eye, reason, score = is_eye_image(image_bytes)
    if not is_eye:
        return jsonify({"error": reason, "eye_score": score}), 422

    # Save file
    filename = f"{int(time.time())}_{secure_filename(file.filename)}"
    path = UPLOAD_DIR / filename
    with open(path, "wb") as f:
        f.write(image_bytes)

    try:
        label, conf, scores = tta_predict(image_bytes)
    except Exception:
        logger.exception("Prediction failed")
        return jsonify({"error": "Prediction failed"}), 500

    # Save DB
    conn = get_db()
    conn.execute(
        "INSERT INTO predictions (filename,label,confidence,all_scores,timestamp) VALUES (?,?,?,?,?)",
        (filename, label, conf, json.dumps(scores), (datetime.utcnow().isoformat()))
    )
    conn.commit()
    conn.close()

    return jsonify({
        "label": label,
        "confidence": round(conf*100, 2),
        "scores": {k: round(v*100,2) for k,v in scores.items()},
        "image_url": f"/uploads/{filename}"
    })

@app.route("/uploads/<path:filename>")
def uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

@app.route("/stats")
def stats():
    conn = get_db()

    rows = conn.execute("SELECT label, confidence FROM predictions").fetchall()
    conn.close()

    total = len(rows)

    if total == 0:
        return jsonify({
            "total_predictions": 0,
            "average_confidence": 0,
            "distribution": {}
        })

    # distribution count
    distribution = {}
    total_conf = 0

    for r in rows:
        label = r["label"]
        conf  = r["confidence"]

        distribution[label] = distribution.get(label, 0) + 1
        total_conf += conf

    avg_conf = total_conf / total

    return jsonify({
        "total_predictions": total,
        "average_confidence": round(avg_conf * 100, 2),
        "distribution": distribution
    })
@app.route("/retrain/status")
def retrain_status():
    return jsonify([])


@app.route("/retrain", methods=["POST"])
def retrain():
    try:
        subprocess.Popen(["python", "train.py"])
        return jsonify({"message": "Retraining started"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/history")
def history():
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))

    conn = get_db()

    rows = conn.execute(
        "SELECT id, filename, label, confidence, timestamp FROM predictions ORDER BY id DESC LIMIT ? OFFSET ?",
        (limit, offset)
    ).fetchall()

    total = conn.execute("SELECT COUNT(*) as count FROM predictions").fetchone()["count"]

    conn.close()

    records = []
    for r in rows:
        records.append({
            "id": r["id"],
            "filename": r["filename"],   # ✅ IMPORTANT (frontend needs this)
            "image_url": f"/uploads/{r['filename']}",
            "label": r["label"],
            "confidence": round(r["confidence"] * 100, 2),
            "timestamp": r["timestamp"],
            "all_scores": {}  # optional (prevents crash)
        })

    return jsonify({
        "records": records,
        "total": total
    })

@app.route("/history/<int:id>", methods=["DELETE"])
def delete_history(id):
    conn = get_db()
    conn.execute("DELETE FROM predictions WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})   

# ── RUN ────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(port=5001, debug=True)
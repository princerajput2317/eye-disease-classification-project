
import numpy as np
from PIL import Image
import io


def is_eye_image(image_bytes: bytes) -> tuple[bool, str, float]:
    """
    Analyse image and return (is_eye, reason, score).
    score = 1.0 means very likely an eye image.
    score = 0.0 means definitely not an eye image.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        return False, "Cannot read image file. Please upload a valid JPG or PNG.", 0.0

    img_resized = img.resize((224, 224))
    arr = np.array(img_resized, dtype=np.float32)

    scores = {}

    # ── Check 1: Image not too dark (all-black = invalid) ────────────────────
    mean_brightness = arr.mean()
    if mean_brightness < 8.0:
        return False, "Image is too dark or completely black. Please upload a clear eye photo.", 0.0
    scores["brightness"] = min(1.0, mean_brightness / 60.0)

    # ── Check 2: Image not too bright (all-white = screenshot / blank) ───────
    if mean_brightness > 245.0:
        return False, "Image appears to be blank or all-white. Please upload a retinal eye image.", 0.0

    # ── Check 3: Retinal images are predominantly RED/ORANGE ─────────────────
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mean_r, mean_g, mean_b = r.mean(), g.mean(), b.mean()

    # Red channel should dominate in fundus photos
    red_dominance = mean_r / (mean_b + 1e-5)
    if red_dominance < 1.15:
        return False, "Not a retinal image (missing red/orange fundus pattern)", 0.2

    scores["red_dominance"] = min(1.0, (red_dominance - 1.0) / 2.0)

    # ── Check 4: Centre region darker or different from edges (circular fundus) ─
    h, w = arr.shape[:2]
    cx, cy = w // 2, h // 2
    centre_size = 60
    centre = arr[cy-centre_size:cy+centre_size, cx-centre_size:cx+centre_size]
    edges_top    = arr[:30, :, :]
    edges_bottom = arr[-30:, :, :]
    edges_left   = arr[:, :30, :]
    edges_right  = arr[:, -30:, :]
    edge_mean    = np.concatenate([edges_top.reshape(-1,3),
                                    edges_bottom.reshape(-1,3),
                                    edges_left.reshape(-1,3),
                                    edges_right.reshape(-1,3)]).mean(axis=0)
    centre_mean  = centre.reshape(-1,3).mean(axis=0)

    # Fundus: edges are dark (black background), centre is bright red/orange
    edge_brightness   = edge_mean.mean()
    centre_brightness = centre_mean.mean()
    edge_darkness_score = max(0.0, 1.0 - edge_brightness / 80.0)  # edges < 80 = dark
    scores["edge_darkness"] = edge_darkness_score

    # ── Check 5: Colour variation — eye images have clear colour gradients ────
    std_r = r.std()
    std_g = g.std()
    std_b = b.std()
    color_variation = (std_r + std_g + std_b) / 3.0
    scores["color_variation"] = min(1.0, color_variation / 40.0)

    # ── Check 6: Not grayscale (retinal photos are colour) ───────────────────
    channel_diff = abs(mean_r - mean_g) + abs(mean_g - mean_b) + abs(mean_r - mean_b)
    scores["not_grayscale"] = min(1.0, channel_diff / 30.0)

    # ── Check 7: Saturation — retinal images are highly saturated ────────────
    max_ch = arr.max(axis=2)
    min_ch = arr.min(axis=2)
    saturation = np.where(max_ch > 0, (max_ch - min_ch) / (max_ch + 1e-5), 0).mean()
    scores["saturation"] = min(1.0, saturation * 2.5)

    # ── Weighted composite score ──────────────────────────────────────────────
    weights = {
        "red_dominance":  0.30,
        "edge_darkness":  0.25,
        "saturation":     0.20,
        "color_variation":0.15,
        "not_grayscale":  0.10,
    }
    final_score = sum(scores.get(k, 0.0) * w for k, w in weights.items())
    final_score = max(0.0, min(1.0, final_score))

    # ── Decision ─────────────────────────────────────────────────────────────
    THRESHOLD = 0.55   # images scoring below this are rejected

    if final_score < THRESHOLD:
        # Build a helpful rejection reason
        if red_dominance < 1.2:
            reason = "This does not appear to be a retinal eye image — it lacks the characteristic red/orange colouring of fundus photographs."
        elif edge_darkness_score < 0.15:
            reason = "This does not appear to be a retinal eye image — fundus photos typically have a dark background around the circular eye."
        elif saturation < 0.2:
            reason = "This appears to be a grayscale or low-colour image. Please upload a colour retinal/fundus eye photograph."
        else:
            reason = "This does not appear to be a retinal eye image. Please upload a fundus/retinal photograph of an eye."
        return False, reason, final_score

    # Accepted — build confidence message
    if final_score > 0.7:
        reason = "High-quality retinal image detected."
    elif final_score > 0.45:
        reason = "Retinal image accepted (moderate confidence)."
    else:
        reason = "Image accepted — low eye confidence, results may be less accurate."

    return True, reason, final_score


def validate_file_type(filename: str, content_type: str) -> tuple[bool, str]:
    """Quick MIME/extension check before any image analysis."""
    allowed_exts  = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
    allowed_mime  = {"image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"}

    import os
    ext = os.path.splitext(filename.lower())[1]
    if ext not in allowed_exts:
        return False, f"File type '{ext}' not supported. Please upload JPG, PNG, or BMP."
    if content_type and content_type not in allowed_mime and not content_type.startswith("image/"):
        return False, f"Invalid file type. Please upload an image file."
    return True, "OK"

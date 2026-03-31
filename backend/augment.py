"""
augment.py  ─  Eye Disease Dataset Augmentation
================================================
Reads   : dataset/<ClassName>/*.jpg   (original Kaggle images)
Writes  : augmented_dataset/<ClassName>/   (original + 5 augmented variants)
Creates : augmented_dataset/labels.csv

Usage:
    python augment.py
    python augment.py --src dataset --dst augmented_dataset --n 5
"""

import os
import argparse
import csv
import time
from pathlib import Path

import numpy as np
from PIL import Image

# ── Optional Keras import ────────────────────────────────────────────────────
try:
    from tensorflow.keras.preprocessing.image import (
        ImageDataGenerator, img_to_array, array_to_img
    )
    KERAS_OK = True
except ImportError:
    KERAS_OK = False
    print("[WARN] TensorFlow/Keras not found. Using PIL-only augmentation.")

# ──────────────────────────── Config ────────────────────────────────────────
DEFAULT_SRC = r"C:\Users\prajp\project exhibition2\eye-disease-project\dataset"
DEFAULT_DST = "augmented_dataset"
AUG_PER_IMG = 5
IMG_SIZE = (300, 300)
VALID_EXTS  = {".jpg", ".jpeg", ".png", ".bmp", ".tiff"}

# ──────────────────────────── Keras augmentor ────────────────────────────────
if KERAS_OK:
    datagen = ImageDataGenerator(
    rotation_range=10,
    horizontal_flip=True,
    vertical_flip=False,   
    zoom_range=0.1,
    brightness_range=[0.9, 1.1],
    width_shift_range=0.05,
    height_shift_range=0.05,
    fill_mode="nearest",
)

# ──────────────────────────── PIL-only augmentor ─────────────────────────────
def _pil_augment(img: Image.Image, idx: int) -> Image.Image:
    """Simple PIL transforms when Keras is unavailable."""
    import random, math
    ops = [
        lambda i: i.transpose(Image.FLIP_LEFT_RIGHT),
        lambda i: i.transpose(Image.FLIP_TOP_BOTTOM),
        lambda i: i.rotate(random.choice([30, 60, 90, 120, 150, 180, 210, 270])),
        lambda i: i.rotate(random.uniform(-25, 25)),
    ]
    chosen = [ops[j % len(ops)] for j in range(idx, idx + 2)]
    for op in chosen:
        img = op(img)
    return img

# ──────────────────────────── Core function ──────────────────────────────────
def augment_dataset(src_dir: Path, dst_dir: Path, n: int = AUG_PER_IMG):
    src_dir = Path(src_dir)
    dst_dir = Path(dst_dir)

    if not src_dir.exists():
        raise FileNotFoundError(f"Source directory not found: {src_dir}")

    classes = sorted([d for d in src_dir.iterdir() if d.is_dir()])
    if not classes:
        raise ValueError(f"No class sub-folders found in {src_dir}")

    print(f"\n{'='*60}")
    print(f"  Eye Disease Augmentation")
    print(f"  Source : {src_dir}")
    print(f"  Dest   : {dst_dir}")
    print(f"  Classes: {[c.name for c in classes]}")
    print(f"  Aug/img: {n}")
    print(f"{'='*60}\n")

    label_rows = [["filepath", "label"]]
    total_written = 0
    t0 = time.time()

    for cls_dir in classes:
        label     = cls_dir.name
        out_dir   = dst_dir / label
        out_dir.mkdir(parents=True, exist_ok=True)

        image_files = [
            f for f in cls_dir.iterdir()
            if f.suffix.lower() in VALID_EXTS
        ]

        print(f"[{label}]  {len(image_files)} original images → {len(image_files) * (n + 1)} total")

        for fpath in image_files:
            try:
                img = Image.open(fpath).convert("RGB").resize(IMG_SIZE)
            except Exception as e:
                print(f"  [SKIP] {fpath.name}: {e}")
                continue

            # ── Save original resized ──
            orig_out = out_dir / fpath.name
            img.save(str(orig_out), "JPEG", quality=92)
            label_rows.append([str(orig_out.relative_to(dst_dir.parent)), label])
            total_written += 1

            # ── Generate augmented variants ──
            stem = fpath.stem
            if KERAS_OK:
                arr = img_to_array(img)
                arr = arr.reshape((1,) + arr.shape)
                i   = 0
                for batch in datagen.flow(arr, batch_size=1, seed=42):
                    aug_img  = array_to_img(batch[0])
                    aug_name = f"{stem}_aug{i+1}.jpg"
                    aug_path = out_dir / aug_name
                    aug_img.save(str(aug_path), "JPEG", quality=92)
                    label_rows.append([str(aug_path.relative_to(dst_dir.parent)), label])
                    total_written += 1
                    i += 1
                    if i >= n:
                        break
            else:
                for i in range(n):
                    aug_img  = _pil_augment(img.copy(), i)
                    aug_name = f"{stem}_aug{i+1}.jpg"
                    aug_path = out_dir / aug_name
                    aug_img.save(str(aug_path), "JPEG", quality=92)
                    label_rows.append([str(aug_path.relative_to(dst_dir.parent)), label])
                    total_written += 1

    
    elapsed = time.time() - t0
    print(f"\n{'='*60}")
    print(f"  Done!  {total_written} images written in {elapsed:.1f}s")
    print(f"{'='*60}\n")
    return total_written


# ──────────────────────────── CLI ────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Augment eye disease dataset")
    parser.add_argument("--src", default=DEFAULT_SRC, help="Source dataset directory")
    parser.add_argument("--dst", default=DEFAULT_DST, help="Output directory")
    parser.add_argument("--n",   type=int, default=AUG_PER_IMG,
                        help="Augmented images per original")
    args = parser.parse_args()

    augment_dataset(Path(args.src), Path(args.dst), args.n)

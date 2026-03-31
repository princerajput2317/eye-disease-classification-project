import os, json, numpy as np, random
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import *
from sklearn.utils.class_weight import compute_class_weight

# ── CONFIG ─────────────────────────────────────────────
DATA_DIR = r"C:\Users\prajp\project exhibition2\eye-disease-project\backend\augmented_dataset"
MODEL_DIR = "model"

IMG_SIZE = (300,300)
BATCH = 24
EPOCHS = 30

# Reproducibility
random.seed(42)
np.random.seed(42)
tf.random.set_seed(42)

# ── DATA ───────────────────────────────────────────────
train_aug = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.15,
    rotation_range=10,
    zoom_range=0.1,
    brightness_range=[0.9,1.1],
    width_shift_range=0.05,
    height_shift_range=0.05,
    horizontal_flip=True
)

val_aug = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    validation_split=0.15
)

train_gen = train_aug.flow_from_directory(
    DATA_DIR, target_size=IMG_SIZE, batch_size=BATCH,
    subset="training", class_mode="categorical"
)

val_gen = val_aug.flow_from_directory(
    DATA_DIR, target_size=IMG_SIZE, batch_size=BATCH,
    subset="validation", class_mode="categorical"
)

# ── CLASS WEIGHTS ──────────────────────────────────────
weights = compute_class_weight(
    "balanced",
    classes=np.unique(train_gen.classes),
    y=train_gen.classes
)
class_weights = dict(enumerate(weights))

# ── MODEL ──────────────────────────────────────────────
base = EfficientNetB3(weights="imagenet", include_top=False, input_shape=(*IMG_SIZE,3))
base.trainable = False

x = base.output
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.Dropout(0.5)(x)
out = layers.Dense(train_gen.num_classes, activation="softmax")(x)

model = Model(base.input, out)

model.compile(
    optimizer=tf.keras.optimizers.Adam(1e-3),
    loss=tf.keras.losses.CategoricalCrossentropy(label_smoothing=0.03),
    metrics=["accuracy", tf.keras.metrics.AUC(name="auc")]
)

# ── CALLBACKS ──────────────────────────────────────────
os.makedirs(MODEL_DIR, exist_ok=True)

callbacks = [
    ModelCheckpoint(f"{MODEL_DIR}/best.keras", monitor="val_auc", save_best_only=True),
    EarlyStopping(patience=5, restore_best_weights=True),
    ReduceLROnPlateau(patience=2)
]

# ── TRAIN ──────────────────────────────────────────────
model.fit(
    train_gen,
    validation_data=val_gen,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=callbacks
)

# ── SAVE ───────────────────────────────────────────────
model.save(f"{MODEL_DIR}/eye_disease_model.keras")

# Save classes
class_map = {str(v):k for k,v in train_gen.class_indices.items()}
with open(f"{MODEL_DIR}/classes.json","w") as f:
    json.dump(class_map, f)

print("✅ Training Complete")
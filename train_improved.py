import pandas as pd
import numpy as np
import tensorflow as tf
import cv2
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras import layers, models, regularizers, callbacks
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
import matplotlib.pyplot as plt

# Check for GPU
print("Num GPUs Available: ", len(tf.config.list_physical_devices('GPU')))

# Load Data
try:
    df = pd.read_csv('coffee_beans.csv')
    X = df["filepaths"]
    y = df["class index"]
except FileNotFoundError:
    print("Error: coffee_beans.csv not found.")
    exit(1)

def load_images(x):
    images = []
    for path in x:
        if not os.path.exists(path):
             print(f"Warning: Image not found: {path}")
             continue
        img = cv2.imread(path)
        if img is None:
            print(f"Could not read image: {path}")
            continue
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = cv2.resize(img, (224, 224))
        # IMPORTANT FIX: Do NOT normalize by dividing by 255.0 here.
        # MobileNetV2 preprocess_input expects inputs in range [0, 255].
        # img = img / 255.0 
    
        images.append(img)
    
    images = np.array(images, dtype=np.float32)
    return images

# Split dataset into training, validation and test set. Using 80% Train, 10% Validation, 10% Test.
# 80% Train, 20% Temp (Test + Val)
X_train_paths, x_temp, y_train, y_temp = train_test_split(X , y, test_size=0.20, random_state=42)

# Split Temp into 50% Val, 50% Test (resulting in 10% Val, 10% Test of total)
X_cv_paths, X_test_paths, y_cv, y_test = train_test_split(x_temp , y_temp, test_size=0.50, random_state=42)

print(f"Training samples: {len(X_train_paths)}")
print(f"Validation samples: {len(X_cv_paths)}")
print(f"Test samples: {len(X_test_paths)}")

del x_temp, y_temp

# Load Images
print("Loading images...")
X_train = load_images(X_train_paths)
X_cv = load_images(X_cv_paths)
X_test = load_images(X_test_paths)
print("Images loaded.")

# Data Augmentation
data_augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(height_factor=0.1, width_factor=0.1),
    layers.RandomContrast(factor=0.1),
])   

tf.keras.utils.set_random_seed(42) # seed for reproducibility

# Pre Trained CNN
base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights='imagenet'
)

# base_model.trainable = False  # freeze pretrained weights
base_model.trainable = True

# Freezing earlier layers, fine tuning top layers
for layer in base_model.layers[:-30]:
    layer.trainable = False

# Reduced L2 regularization strength
l = 1e-4

model = models.Sequential([
    data_augmentation,
    layers.Lambda(preprocess_input),
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),

    layers.Dense(256, activation='relu', kernel_regularizer=regularizers.l2(l)),
    layers.BatchNormalization(),
    layers.Dropout(0.5),

    layers.Dense(4, activation='linear', kernel_regularizer=regularizers.l2(l))
])

# Define callbacks
early_stopping = callbacks.EarlyStopping(
    monitor='val_loss',
    patience=5,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.2,
    patience=3,
    min_lr=1e-6,
    verbose=1
)

# Compile Model
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4), 
    loss= tf.keras.losses.SparseCategoricalCrossentropy(from_logits=True),
    metrics=['accuracy'], 
)

print(f"Training {model.name}...")

history = model.fit(
    X_train, 
    y_train, 
    validation_data=(X_cv, y_cv),
    epochs=30, # Increased epochs since we have early stopping
    callbacks=[early_stopping, reduce_lr]
)
print("Training Done\n")

model.save("coffee_roast_model_improved.keras")

# Evaluate on Test Set
print("Evaluating on Test Set...")
test_loss, test_acc = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {test_acc:.4f}")
print(f"Test Loss: {test_loss:.4f}")

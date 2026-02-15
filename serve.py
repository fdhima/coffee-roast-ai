from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import numpy as np
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware
import os
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["TF_NUM_INTRAOP_THREADS"] = "1"
os.environ["TF_NUM_INTEROP_THREADS"] = "1"

import tensorflow as tf


from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = Path(__file__).parent / "coffee-roast-web/dist"
if frontend_path.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=frontend_path / "assets"),
        name="assets"
    )
else:
    print(f"Warning: Frontend path {frontend_path} does not exist. Static files will not be served.")


model = tf.keras.models.load_model(
    Path(__file__).parent / "coffee_roast_model.keras",
    custom_objects={'preprocess_input': preprocess_input}
)

CLASS_NAMES = {
    0: "Dark",
    1: "Green",
    2: "Light",
    3: "Medium"
}

def preprocess_image(img):
    img = tf.image.resize(img, (224, 224))
    # IMPORTANT: Removed division by 255.0 to match training preprocessing
    # The model expects [0, 255] range inputs for MobileNetV2 preprocessing
    return img


@app.get("/")
def root():
    return FileResponse(frontend_path / "index.html")


@app.post("/predict")
async def predict(file: UploadFile):
    image = Image.open(file.file).convert("RGB")
    image = np.array(image)
    
    # Preprocess
    image = preprocess_image(image)
    image = tf.expand_dims(image, 0)

    # Predict
    # Use model.predict to ensure inference mode (fixing discrepancy with notebook)
    logits = model.predict(image, verbose=0)
    # logits is a numpy array, so no need for .numpy() after softmax if we use tf.nn.softmax
    # or just use scipy/numpy softmax, but let's stick to tf for consistency with previous code
    probs = tf.nn.softmax(logits, axis=-1).numpy()[0]
    
    pred_idx = np.argmax(probs)
    pred_label = CLASS_NAMES[pred_idx]
    confidence = float(probs[pred_idx])
    
    # Return extended response
    return {
        "class": int(pred_idx),
        "label": pred_label,
        "confidence": confidence
    }


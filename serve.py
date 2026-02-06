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


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_path = Path(__file__).parent / "coffee-roast-web/dist"
app.mount(
    "/assets",
    StaticFiles(directory=frontend_path / "assets"),
    name="assets"
)

model = tf.keras.models.load_model(Path(__file__).parent / "coffee_roast_model.keras")

def preprocess_image(img):
    img = tf.image.resize(img, (224, 224))
    img = tf.cast(img, tf.float32) / 255.0
    return img


@app.get("/")
def root():
    return FileResponse(frontend_path / "index.html")


@app.post("/predict")
def predict(file: UploadFile):
    image = Image.open(file.file).convert("RGB")
    image = np.array(image)
    image = preprocess_image(image)
    image = tf.expand_dims(image, 0)

    logits = model(image)
    prediction = tf.argmax(logits, axis=1).numpy()[0]

    return {"class": int(prediction)}


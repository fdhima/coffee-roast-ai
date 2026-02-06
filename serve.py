from fastapi import FastAPI, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import tensorflow as tf
import numpy as np
from PIL import Image
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = tf.keras.models.load_model(Path(__file__).parent / "coffee_roast_model.keras")

def preprocess_image(img):
    img = tf.image.resize(img, (224, 224))
    img = tf.cast(img, tf.float32) / 255.0
    return img


@app.post("/predict")
def predict(file: UploadFile):
    image = Image.open(file.file).convert("RGB")
    image = np.array(image)
    image = preprocess_image(image)
    image = tf.expand_dims(image, 0)

    logits = model(image)
    prediction = tf.argmax(logits, axis=1).numpy()[0]

    return {"class": int(prediction)}


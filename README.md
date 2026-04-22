# Coffee Roast AI

**An end-to-end machine learning application that classifies coffee bean roast levels from images.** Upload a photo of coffee beans and the system instantly identifies whether they are Dark, Medium, Light, or Green (unroasted) — complete with cupping notes and roast characteristics.

## Architecture Overview

The system is split into three layers that communicate in a clean request/response pipeline:

```
Browser (React + Vite)
        │  multipart/form-data POST /predict
        ▼
FastAPI server (serve.py)
        │  numpy array → MobileNetV2 preprocessing → model inference
        ▼
TensorFlow/Keras model (coffee_roast_model.keras)
        │  softmax probabilities over 4 classes
        ▼
JSON response  { class, label, confidence }
        │
        ▼
React UI renders result card with predicted label, confidence %, and cupping notes
```

### Backend — `serve.py`

`serve.py` is a [FastAPI](https://fastapi.tiangolo.com/) application with a single inference endpoint:

- **`POST /predict`** — accepts a multipart image upload, preprocesses it, runs inference, and returns `{ class, label, confidence }`.
- **`GET /`** — serves the pre-built React SPA from `coffee-roast-web/dist/` so the entire app ships as one process.

Image preprocessing mirrors the training pipeline exactly: resize to `224×224`, keep pixel values in the `[0, 255]` range (MobileNetV2's `preprocess_input` handles the final normalization internally). CUDA is intentionally disabled so the server runs on CPU without a GPU driver — inference is fast enough for this task.

### ML Model — `coffee_roast_model.keras`

The model is a fine-tuned **MobileNetV2** CNN trained in `coffee_bean_roast.ipynb`. MobileNetV2 was chosen for its balance of accuracy and small footprint. The classification head maps the frozen/fine-tuned feature extractor to 4 output classes via a softmax layer:

| Index | Class | Description |
|-------|-------|-------------|
| 0 | Dark | Bold, smoky, low acidity; oil visible on surface |
| 1 | Green | Raw, unroasted; grassy aroma |
| 2 | Light | Mild flavour, high acidity; retains origin character |
| 3 | Medium | Balanced flavour, aroma, and acidity |

Training data comes from the [Kaggle coffee bean dataset](https://www.kaggle.com/datasets/gpiosenka/coffee-bean-dataset-resized-224-x-224) (224×224 px images, 80/20 train/test split).

### Frontend — `coffee-roast-web/`

A React 19 + Vite SPA styled with Tailwind CSS 4. Key interactions:

1. User drags & drops or selects an image file.
2. The file is sent to `/predict` via `fetch` with `FormData`.
3. The response is rendered as a result card showing label, confidence percentage, cupping notes, and Acidity/Body bar charts.

In development the Vite dev server proxies `/predict` to the FastAPI server. In production (Docker or `fastapi dev`), FastAPI serves both the API and the built static assets from the same origin, so no proxy is needed.

### Docker — `Dockerfile`

A two-stage build:

1. **Stage 1 (`node:20-slim`)** — installs npm dependencies and runs `npm run build`, producing `coffee-roast-web/dist/`.
2. **Stage 2 (`python:3.11-slim`)** — installs Python dependencies, copies the model and backend, then copies the compiled frontend from stage 1. The container is started with **Gunicorn + UvicornWorker** (1 worker, timeout 120 s).

## Project Structure

```
coffee-roast-ai/
├── serve.py                    # FastAPI app: /predict endpoint + static file serving
├── coffee_roast_model.keras    # Trained MobileNetV2 model
├── coffee_bean_roast.ipynb     # Training notebook
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Multi-stage Docker build
├── coffee_beans.csv            # Dataset index
├── train/                      # Training images (Dark / Green / Light / Medium)
├── test/                       # Test images
└── coffee-roast-web/           # React + Vite frontend
    ├── src/
    │   ├── App.jsx             # Main component: upload, predict, results
    │   └── main.jsx            # React entry point
    ├── package.json
    └── vite.config.js
```

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) and `npm`

## Running Locally

### Backend

```bash
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
fastapi dev serve.py
```

API available at `http://127.0.0.1:8000`. Interactive docs at `http://127.0.0.1:8000/docs`.

### Frontend (development)

```bash
cd coffee-roast-web
npm install
npm run dev
```

Vite dev server runs at `http://localhost:5173` and proxies `/predict` to the FastAPI backend.

## Running with Docker

```bash
docker build -t coffee-roast-app .
docker run -p 8000:8000 coffee-roast-app
```

Both the API and the frontend are served from `http://localhost:8000`.

## Re-training the Model

Open the training notebook in Jupyter or VS Code:

```bash
jupyter notebook coffee_bean_roast.ipynb
```

The notebook walks through data loading, MobileNetV2 fine-tuning, evaluation, and model export.

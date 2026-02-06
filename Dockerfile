# Stage 1: Build the React Frontend
FROM node:20-slim as frontend-builder

WORKDIR /frontend

# Copy package.json and package-lock.json
COPY coffee-roast-web/package.json coffee-roast-web/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the frontend code
COPY coffee-roast-web/ .

# Build the application
RUN npm run build

# Stage 2: Python Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# libgl1 is for opencv-python if needed, usually good to have for image processing
RUN apt-get update && apt-get install -y libgl1 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model
COPY serve.py .
COPY coffee_roast_model.keras .

# Copy built frontend assets from the builder stage
COPY --from=frontend-builder /frontend/dist /app/coffee-roast-web/dist

# Expose the port
EXPOSE 8000

# Run with Gunicorn + Uvicorn workers
CMD ["gunicorn", "serve:app", "--workers", "1", "--threads", "1", "--timeout", "120", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

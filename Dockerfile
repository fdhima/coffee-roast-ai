# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y libgl1 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model
COPY serve.py .
COPY coffee_roast_model.keras .

# Expose the port
EXPOSE 8000

# Run with Gunicorn + Uvicorn workers
CMD ["gunicorn", "serve:app", "--workers", "1", "--threads", "1", "--timeout", "120", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]

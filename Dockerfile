# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY coffee-roast-web/package.json coffee-roast-web/package-lock.json* ./
RUN npm install
COPY coffee-roast-web/ .
RUN npm run build

# Stage 2: Serve with Python/FastAPI
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# libgl1 is often needed for opencv-python if it's in requirements.txt
RUN apt-get update && apt-get install -y libgl1 && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code and model
COPY serve.py .
COPY coffee_roast_model.keras .

# Copy built frontend assets from the builder stage
# The serve.py expects assets in "coffee-roast-web/dist"
COPY --from=frontend-builder /app/dist ./coffee-roast-web/dist

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "serve:app", "--host", "0.0.0.0", "--port", "8000"]

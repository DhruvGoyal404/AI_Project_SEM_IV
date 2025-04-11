# Use official Python base image with Python 3.10
FROM python:3.10-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=300 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install minimal system dependencies first
RUN apt-get update && apt-get install -y \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download XGBoost wheel manually (more reliable than pip)
RUN wget https://files.pythonhosted.org/packages/58/0e/6a9adfaad2b123f7e696e6752d4b7b9a745dabe5e8b8fc2a9f7b5f5950a5/xgboost-2.0.3-py3-none-manylinux2014_x86_64.whl -O /tmp/xgboost.whl

# Install remaining system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first to cache them in docker layer
COPY requirements.txt .

# Install Python dependencies in stages
RUN pip install --upgrade pip && \
    pip install --no-cache-dir /tmp/xgboost.whl && \
    pip install --no-cache-dir -r requirements.txt --timeout 300 || \
    (echo "Retrying pip install..." && pip install --no-cache-dir -r requirements.txt --timeout 300)

# Clean up
RUN rm /tmp/xgboost.whl

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 5000

# Run the application
CMD ["python", "app.py"]
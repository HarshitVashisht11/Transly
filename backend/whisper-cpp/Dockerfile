# Use standard Ubuntu base image
FROM ubuntu:22.04

# Install Python, required packages, and build tools for whisper.cpp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    ffmpeg \
    build-essential \
    cmake \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Upgrade pip and setuptools
RUN pip3 install --no-cache-dir --upgrade pip setuptools wheel

# Install Flask and dependencies
RUN pip3 install --no-cache-dir flask numpy requests

# Clone and build whisper.cpp with more verbose output and error checking
RUN git clone https://github.com/ggerganov/whisper.cpp.git && \
    cd whisper.cpp && \
    sh ./models/download-ggml-model.sh base.en && \
    cmake -B build &&\
    cmake --build build --config Release

# Copy server script
COPY server.py /app/

# Create volume for models
VOLUME /models

# Expose the port the server will run on
EXPOSE 8000

# Start the server
CMD ["python3", "server.py"]

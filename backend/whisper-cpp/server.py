from flask import Flask, request, jsonify
import tempfile
import os
import subprocess
import logging
import platform
import shutil
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger('whisper-service')

app = Flask(__name__)

# Model mapping by size - updated model filenames
MODELS = {
    "tiny": "ggml-tiny.bin",
    "tiny.en": "ggml-tiny.en.bin",
    "base": "ggml-base.bin",
    "base.en": "ggml-base.en.bin",
    "small": "ggml-small.bin",
    "small.en": "ggml-small.en.bin",
    "medium": "ggml-medium.bin",
    "medium.en": "ggml-medium.en.bin",
    "large": "ggml-large.bin",
    "large-v1": "ggml-large-v1.bin",
    "large-v2": "ggml-large-v2.bin",
    "large-v3": "ggml-large-v3.bin"
}

# Default model
DEFAULT_MODEL = "small.en"

def ensure_model_exists(model_name):
    """Return the model file path. If absent, build the model using 'make'."""
    if model_name not in MODELS:
        logger.warning(f"Unknown model '{model_name}', using default model '{DEFAULT_MODEL}'")
        model_name = DEFAULT_MODEL
    
    model_filename = MODELS[model_name]
    model_path = os.path.join('/app/whisper.cpp/models', model_filename)
    
    if not os.path.exists(model_path):
        logger.info(f"Model {model_filename} not found. Building using make command for model '{model_name}'...")
        try:
            result = subprocess.run(["make", "-j", model_name], cwd="/app/whisper.cpp", capture_output=True, text=True)
            if result.returncode != 0:
                logger.error(f"Make command failed: {result.stderr}")
                raise RuntimeError("Failed to build model using make command")
            
            if not os.path.exists(model_path):
                logger.error(f"Model file {model_filename} still not found after make command")
                raise FileNotFoundError(f"Model file {model_filename} still not found after build")
            
            logger.info(f"Model built and available at {model_path}")
        except Exception as e:
            logger.error(f"Error building model: {str(e)}")
            raise
    else:
        logger.info(f"Found model {model_filename} at {model_path}")
    
    return model_path

def find_whisper_binary():
    """Return the path to the 'whisper-cli' binary, using the preferred location or a dynamic search."""
    binary_path = "/app/whisper.cpp/build/bin/whisper-cli"
    if os.path.exists(binary_path):
        logger.info(f"Using whisper-cli binary at: {binary_path}")
        return binary_path

    try:
        find_result = subprocess.run(["find", "/app", "-type", "f", "-name", "whisper-cli"], capture_output=True, text=True)
        found_paths = [p for p in find_result.stdout.strip().split('\n') if p]
        if found_paths:
            binary_path = found_paths[0]
            logger.info(f"Found whisper-cli binary at: {binary_path}")
            return binary_path
        else:
            logger.error("whisper-cli binary not found in /app directory")
            raise FileNotFoundError("whisper-cli binary not found")
    except Exception as e:
        logger.error(f"Error finding whisper-cli binary: {str(e)}")
        raise FileNotFoundError("whisper-cli binary not found")

@app.route('/health', methods=['GET'])
def health_check():
    """Return service health and system info."""
    try:
        device_type = "cpu"
        device_info = f"Device: {device_type}, System: {platform.system()}, Machine: {platform.machine()}"
        return jsonify({
            "status": "ok", 
            "service": "whisper-cpp",
            "device": device_info
        })
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "error", 
            "service": "whisper-cpp", 
            "error": str(e)
        }), 500

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe an uploaded audio file and return the result, processing time, and timestamp."""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    logger.info(f"Received file: {file.filename}")
    
    model_name = request.form.get('model', DEFAULT_MODEL)
    logger.info(f"Using model: {model_name}")

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
        file.save(temp_audio.name)
        temp_audio_path = temp_audio.name

    try:
        converted_audio_path = f"{temp_audio_path}_converted.wav"
        ffmpeg_cmd = [
            "ffmpeg", "-y", "-i", temp_audio_path,
            "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le",
            converted_audio_path
        ]
        subprocess.run(ffmpeg_cmd, check=True)
        
        model_path = ensure_model_exists(model_name)
        whisper_binary = find_whisper_binary()
        
        transcript_base = converted_audio_path
        cmd = [
            whisper_binary,
            "-m", model_path,
            "-f", converted_audio_path,
            "-otxt",
            "-of", transcript_base
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        transcript_file = f"{transcript_base}.txt"
        
        if os.path.exists(transcript_file):
            with open(transcript_file, 'r') as f:
                transcript = f.read().strip()
        else:
            logger.error(f"Transcription failed or output file not found at {transcript_file}. Output: {result.stdout}\nError: {result.stderr}")
            transcript = "Transcription failed."
        
        os.remove(temp_audio_path)
        os.remove(converted_audio_path)
        if os.path.exists(transcript_file):
            os.remove(transcript_file)

        processing_time_str = result.stderr.split("total time =")[-1].split("ms")[0].strip() if "total time =" in result.stderr else None
        processing_time = float(processing_time_str) if processing_time_str else None
        timestamp = datetime.now().isoformat()
        return jsonify({
            "transcript": transcript,
            "processing_time": processing_time,
            "timestamp": timestamp
        })
        
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        if os.path.exists(converted_audio_path):
            os.remove(converted_audio_path)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import re
import os
from fastapi.responses import StreamingResponse
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

logger.info("Starting application...")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allows the React frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    message: str
    model_name: str 

@app.post("/api/chat")
async def chat(message: Message, request: Request):
    logger.info(f"Received request from {request.client.host}")
    logger.info(f"User message: {message.message}")

    ollama_model = message.model_name or "deepseek-r1:7b"
    logger.info(f"Using Ollama model: {ollama_model}")

    try:
        logger.info("Connecting to Ollama at host.docker.internal...")
        client = ollama.Client(host='http://host.docker.internal:11434')
        full_response_content = ""
        for chunk in client.chat(
            model=ollama_model,
            messages=[{'role': 'user', 'content': message.message}],
            stream=True
        ):
            full_response_content += chunk['message']['content']

        # Remove <think> tags and their content from the full response
        cleaned_response = re.sub(r'<think>.*?</think>', '', full_response_content, flags=re.DOTALL)

        logger.info(f"Ollama response: {cleaned_response}")
        return {"response": cleaned_response}

    except Exception as e:
        logger.error(f"Error calling Ollama: {e}")
        return {"response": "Error: Could not get a response."}

@app.get("/api/models")
async def get_models():
    """
    Returns a list of available models from Ollama.
    """
    try:
        client = ollama.Client(host='http://host.docker.internal:11434')
        models_response = client.list()
        logger.info(f"Ollama client.list() response: {models_response}")

        # Handle both dict and object attribute access for model names
        model_objs = models_response.get('models', [])
        model_names = []
        for m in model_objs:
            if isinstance(m, dict) and 'name' in m:
                model_names.append(str(m['name']))
            elif hasattr(m, 'model'):
                model_names.append(str(m.model))

        return {"models": model_names}
    except Exception as e:
        logger.error(f"Error fetching models from Ollama: {e}")
        return {"models": [], "error": str(e)}

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup complete.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down.")

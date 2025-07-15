# Local RAG System

This project implements a local Retrieval-Augmented Generation (RAG) system, featuring a chatbot powered by Ollama for local LLM inference and a React-based frontend for user interaction. The system is designed to be easily deployable using Docker Compose, providing a self-contained environment for both the backend API and the frontend application.

## Features

-   **Local LLM Inference**: Utilizes Ollama to run large language models locally, ensuring data privacy and reducing reliance on external APIs.
-   **Chatbot Interface**: A user-friendly React frontend for seamless interaction with the RAG system.
-   **Model Selection**: Ability to select different Ollama models directly from the frontend.
-   **Real-time Typing Effect**: Enhances user experience by simulating real-time responses from the chatbot.
-   **Dark/Light Mode**: Toggle between dark and light themes for personalized viewing.
-   **Containerized Environment**: Backend (FastAPI) and Frontend (React) are containerized using Docker, simplifying setup and deployment.

## Technologies Used

### Backend

-   **FastAPI**: A modern, fast (high-performance) web framework for building APIs with Python 3.7+.
-   **Ollama**: For running large language models locally.
-   **Pydantic**: Data validation and settings management using Python type hints.
-   **Uvicorn**: An ASGI web server for Python.

### Frontend

-   **React**: A JavaScript library for building user interfaces.
-   **Material-UI (MUI)**: A popular React UI framework for building beautiful and responsive web apps.
-   **React Markdown**: For rendering Markdown content in chat responses.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Git**: For cloning the repository.
-   **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
-   **Docker Compose**: [Install Docker Compose](https://docs.docker.com/compose/install/)
-   **Ollama**: While the backend connects to Ollama via `host.docker.internal`, it's recommended to have Ollama installed and running directly on your host machine to pull and manage models. [Download Ollama](https://ollama.ai/download)

## Getting Started

Follow these steps to get your local RAG system up and running.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/local-rag-system.git
cd local-rag-system
```

### 2. Pull Ollama Models

Before starting the application, ensure you have at least one Ollama model pulled. The `deepseek-r1:7b` model is used by default in the `docker-compose.yml`.

```bash
ollama pull deepseek-r1:7b
# Or pull any other model you prefer, e.g., ollama pull llama2
```

### 3. Build and Run with Docker Compose

Navigate to the root directory of the project and run:

```bash
docker-compose build
docker-compose up -d
```

-   `docker-compose build`: Builds the Docker images for both backend and frontend.
-   `docker-compose up -d`: Starts the services in detached mode.

### 4. Access the Application

Once the containers are up and running:

-   **Frontend**: Open your web browser and go to `http://localhost:3000`
-   **Backend API**: The backend API will be accessible at `http://localhost:8000`

## 5. Project Structure

-   `backend/`: Contains the FastAPI application, `Dockerfile`, and `requirements.txt`.
-   `frontend/`: Contains the React application, `Dockerfile`, and `package.json`.
-   `docker-compose.yml`: Defines the services, networks, and volumes for Docker Compose.
-   `Makefile`: Provides convenient commands for building, running, stopping, and removing Docker containers.

## 6. Usage

1.  Open the frontend application in your browser (`http://localhost:3000`).
2.  Upon first load, a modal will appear prompting you to select an Ollama model. Choose one of the available models (ensure you have pulled them locally with Ollama).
3.  Type your message in the input field and press Enter or click the "Send" button.
4.  The chatbot will respond with a real-time typing effect.
5.  You can change the model at any time using the "Change Model" button in the header.
6.  Toggle between dark and light themes using the sun/moon icon in the header.

## 7. Troubleshooting

-   **"No models found" in the modal**: Ensure Ollama is running on your host machine and you have pulled at least one model (e.g., `ollama pull deepseek-r1:7b`). The backend connects to Ollama via `http://host.docker.internal:11434`.
-   **Frontend not loading**: Check your browser's console for errors. Ensure the frontend Docker container is running (`docker ps`).
-   **Backend errors**: Check the backend container logs (`docker logs chatbot-backend-container`). Ensure the backend can connect to Ollama.

## 8. Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 9. License

This project is licensed under the MIT License - see the LICENSE file for details.

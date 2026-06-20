from fastapi import FastAPI
from models.request_models import ProjectRequest
from idea_generator import generate_project_idea

app = FastAPI(
    title="ResearchPilot",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "message": "ResearchPilot API running"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/generate-project")
def generate_project(request: ProjectRequest):
    return generate_project_idea(request.domain)
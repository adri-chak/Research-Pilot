from fastapi import FastAPI

from models.request_models import ProjectRequest
from graphs.research_graph import research_graph

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


@app.post("/research")
def run_research(request: ProjectRequest):

    result = research_graph.invoke(
        {
            "domain": request.domain,
            "idea": "",
            "score": 0,
            "strengths": "",
            "weaknesses": "",
            "plan": []
        }
    )

    return result
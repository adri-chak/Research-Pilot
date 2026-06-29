from fastapi import FastAPI

from models.request_models import ProjectRequest
from graphs.research_graph import research_graph

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ResearchPilot",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
         "https://research-pilot-gilt.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

        "literature_summary": "",
        "existing_work": [],
        "limitations": [],

        "score": 0,

        "strengths": "",
        "weaknesses": "",

        "plan": []
    }
    )

    return result
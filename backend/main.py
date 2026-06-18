from fastapi import FastAPI

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
from pydantic import BaseModel


class ProjectReview(BaseModel):
    strengths: str
    weaknesses: str
    score: int
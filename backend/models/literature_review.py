from pydantic import BaseModel

class LiteratureReview(BaseModel):
    summary: str
    existing_work: list[str]
    limitations: list[str]
    future_directions: list[str]
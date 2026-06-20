from pydantic import BaseModel


class ProjectIdea(BaseModel):
    project_name: str
    description: str
    difficulty: str
from pydantic import BaseModel


class ProjectRequest(BaseModel):
    domain: str
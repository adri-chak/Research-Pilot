from pydantic import BaseModel


class ImplementationPlan(BaseModel):
    steps: list[str]
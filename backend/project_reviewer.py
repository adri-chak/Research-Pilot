from models.project_review import ProjectReview
from dotenv import load_dotenv
import os

from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

structured_llm = llm.with_structured_output(ProjectReview)


def review_project(project):
    prompt = f"""
    Review the following student project idea.

    Project:
    {project}

    Return:
    - strengths
    - weaknesses
    - score out of 10
    """

    response = structured_llm.invoke(prompt)

    return response


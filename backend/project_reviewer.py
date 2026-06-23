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
    You are a strict final-year engineering project evaluator.

    Evaluate this student project idea:

    PROJECT:
    {project}

    Evaluate using these criteria:

    1. Innovation (0-2)
    2. Technical Complexity (0-2)
    3. Real World Impact (0-2)
    4. Feasibility for a Student Team (0-2)
    5. Industry Relevance (0-2)

    Total Score = sum of all criteria (0-10)

    Scoring Guidelines:

    1-3  = Weak project
    4-5  = Average project
    6-7  = Good project
    8-9  = Excellent project
    10   = Exceptional project

    IMPORTANT:
    - Do NOT always give 8.
    - Use the full score range.
    - Some ideas should score 5-6.
    - Some ideas should score 9-10.
    - Be critical and realistic.

    Return:
    - strengths
    - weaknesses
    - score
    """

    response = structured_llm.invoke(prompt)

    return response

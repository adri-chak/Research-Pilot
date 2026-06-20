from dotenv import load_dotenv
import os
from models.project_idea import ProjectIdea

from langchain_groq import ChatGroq

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

structured_llm = llm.with_structured_output(ProjectIdea)

domain = "Healthcare"

prompt = f"""
Suggest one innovative student project in {domain}.

Return ONLY valid JSON in this format:

{{
    "project_name": "",
    "description": "",
    "difficulty": ""
}}
"""

response = structured_llm.invoke(prompt)

print(response.project_name)
print(response.description)
print(response.difficulty)
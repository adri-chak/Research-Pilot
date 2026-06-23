from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

from models.implementation_plan import ImplementationPlan

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")

structured_llm = llm.with_structured_output(ImplementationPlan)

prompt = ChatPromptTemplate.from_template(
    """
    Create a step-by-step implementation plan for the following project.

    Project:
    {project_name}

    Return 5 to 7 practical implementation steps.
    """
)

def generate_implementation_plan(project_name):
    chain = prompt | structured_llm

    response = chain.invoke(
        {
            "project_name": project_name
        }
    )

    return response
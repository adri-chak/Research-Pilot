from dotenv import load_dotenv
import os

from langchain_groq import ChatGroq

from models.literature_review import LiteratureReview

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

structured_llm = llm.with_structured_output(LiteratureReview)


def generate_literature_review(project_idea):
    prompt = f"""
You are an expert academic research assistant helping students begin a research project.

Project Idea:
{project_idea}

Your task is to produce a concise literature review based on widely known research trends in this field.

Guidelines:

- Do NOT invent paper titles, author names, conferences, journals, or citations.
- If exact published work is unknown, summarize the common research directions instead.
- Keep the review concise, factual, and suitable for a student research proposal.
- Focus only on the project's research domain.
- Avoid marketing language or exaggerated claims.

Return the following:

1. Summary
Provide a 3–5 sentence overview describing the current state of research in this area.

2. Existing Work
Return 4–6 short bullet points describing the most common research approaches, techniques, algorithms, or technologies currently used.

Examples:
- Deep Learning
- Transformer-based Models
- Explainable AI
- Federated Learning
- Computer Vision
- Reinforcement Learning

3. Limitations
Return 4–6 important research limitations or open challenges commonly discussed by researchers.

Examples:
- Limited high-quality datasets
- High computational requirements
- Lack of model interpretability
- Privacy and security concerns
- Poor real-world generalization
- Scalability issues

4. Future Directions

Return 3–5 promising research directions that future researchers could explore.

Examples:
- Lightweight AI models
- Explainable diagnosis systems
- Edge AI deployment
- Privacy-preserving learning
- Multimodal medical AI

The response should sound like an academic literature review rather than a chatbot response.
"""

    response = structured_llm.invoke(prompt)

    return response
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from typing import TypedDict
from langgraph.graph import StateGraph, END

from implementation_planner import generate_implementation_plan
from idea_generator import generate_project_idea
from project_reviewer import review_project
from literature_reviewer import generate_literature_review

class ResearchState(TypedDict):
    domain: str

    idea: str

    literature_summary: str
    existing_work: list[str]
    limitations: list[str]
    future_directions: list[str]

    score: int
    strengths: str
    weaknesses: str

    plan: list[str]

def generate_node(state):
    idea = generate_project_idea(state["domain"])

    state["idea"] = idea.project_name

    return state

def literature_node(state):

    literature = generate_literature_review(
        state["idea"]
    )

    state["literature_summary"] = literature.summary
    state["existing_work"] = literature.existing_work
    state["limitations"] = literature.limitations
    state["future_directions"] = literature.future_directions

    return state


def review_node(state):
    review = review_project(state["idea"])

    state["score"] = review.score
    state["strengths"] = review.strengths
    state["weaknesses"] = review.weaknesses

    return state


def planner_node(state):
    plan = generate_implementation_plan(state["idea"])

    state["plan"] = plan.steps

    return state


graph = StateGraph(ResearchState)

graph.add_node("generate", generate_node)
graph.add_node("literature", literature_node)
graph.add_node("review", review_node)
graph.add_node("planner", planner_node)

graph.set_entry_point("generate")

graph.add_edge("generate", "literature")
graph.add_edge("literature", "review")
graph.add_edge("review", "planner")

research_graph = graph.compile()


if __name__ == "__main__":
    result = research_graph.invoke(
    {
        "domain":"Medical",

        "idea":"",
    
        "literature_summary":"",

        "existing_work":[],

        "limitations":[],

        "future_directions": [],

        "score":0,

        "strengths":"",

        "weaknesses":"",

        "plan":[]
    }
)

    print(result)
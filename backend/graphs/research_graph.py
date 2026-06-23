import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from typing import TypedDict
from langgraph.graph import StateGraph, END

from implementation_planner import generate_implementation_plan
from idea_generator import generate_project_idea
from project_reviewer import review_project


class ResearchState(TypedDict):
    domain: str
    idea: str
    score: int
    plan: list[str]


def generate_node(state):
    idea = generate_project_idea(state["domain"])

    state["idea"] = idea.project_name

    return state


def review_node(state):
    review = review_project(state["idea"])

    state["score"] = review.score

    return state


def planner_node(state):
    plan = generate_implementation_plan(state["idea"])

    state["plan"] = plan.steps

    return state


graph = StateGraph(ResearchState)

graph.add_node("generate", generate_node)
graph.add_node("review", review_node)
graph.add_node("planner", planner_node)

graph.set_entry_point("generate")

graph.add_edge("generate", "review")
graph.add_edge("review", "planner")
graph.add_edge("planner", END)

research_graph = graph.compile()


if __name__ == "__main__":
    result = research_graph.invoke(
        {
            "domain": "Cybersecurity",
            "idea": "",
            "score": 0,
            "plan": []
        }
    )

    print(result)
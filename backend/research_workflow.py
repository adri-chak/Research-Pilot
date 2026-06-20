from idea_generator import generate_project_idea
from project_reviewer import review_project

def run_research_workflow(domain):
    idea = generate_project_idea(domain)

    review = review_project(idea.project_name)

    return idea, review

idea, review = run_research_workflow("Cybersecurity")

print("PROJECT:")
print(idea.project_name)

print("\nSCORE:")
print(review.score)
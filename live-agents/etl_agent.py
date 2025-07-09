import argparse
import operator
from typing import TypedDict

from langgraph.graph import StateGraph, END
# Import our new governance function
from laguardai_wrapper import execute_with_governance

# --- 1. Define the State for our Agent ---
# We've added fields to hold the input arguments and the governance decision.
class AgentState(TypedDict):
    raw_data: str
    summary: str
    target: str
    passport_path: str
    governance_decision: str

# --- 2. Define the Agent's Nodes ---

# This node is unchanged
def read_source_data(state: AgentState):
    """Simulates reading raw data for ETL processing."""
    print("--- Step 1: Reading Source Data ---")
    raw_text = "LaGuardAI is the Trust Fabric for the autonomous enterprise, enabling organizations to scale AI agents with confidence. We govern not just who an agent is, but why it acts, providing verifiable authenticity, governed actions, and immutable accountability."
    print(f"  > Data read successfully.")
    return {"raw_data": raw_text}

# NEW NODE: This node calls our governance wrapper
def governance_check(state: AgentState):
    """Calls the LaGuardAI API to check if the action is permitted."""
    target = state["target"]
    passport_path = state["passport_path"]
    
    # Define the agent's intent based on the input
    intent = {"action": "WRITE", "target": target}
    
    # Call the wrapper function
    response = execute_with_governance(passport_path, intent)
    
    # Check the result and decide if the action is allowed
    if response.get("result") and "Allowed" in response["result"]:
        decision = "allowed"
    else:
        decision = "denied"
        
    return {"governance_decision": decision}

# This node is unchanged
def generate_summary(state: AgentState):
    """Simulates summarizing the raw data with an LLM."""
    print("--- Step 2: Generating Summary ---")
    raw_data = state["raw_data"]
    simulated_summary = raw_data[:70] + "..."
    print(f"  > Summary generated: '{simulated_summary}'")
    return {"summary": simulated_summary}
    
# --- 3. Define the Graph's Conditional Logic ---

# This function will route the agent based on the governance check
def decide_next_step(state: AgentState):
    """Checks the governance decision and routes to the next appropriate step."""
    if state["governance_decision"] == "allowed":
        print("--- Governance Decision: ALLOWED. Proceeding with action. ---")
        return "generate_summary"
    else:
        print("--- Governance Decision: DENIED. Halting workflow. ---")
        return END

# --- 4. Define the Graph ---
workflow = StateGraph(AgentState)

# Add all the nodes
workflow.add_node("read_source_data", read_source_data)
workflow.add_node("governance_check", governance_check)
workflow.add_node("generate_summary", generate_summary)

# Define the graph's flow
workflow.set_entry_point("read_source_data")
workflow.add_edge("read_source_data", "governance_check")
workflow.add_conditional_edges(
    "governance_check",
    decide_next_step,
    {
        "generate_summary": "generate_summary",
        END: END
    }
)
workflow.add_edge("generate_summary", END)

# Compile the graph
app = workflow.compile()

# --- 5. Update Main Execution Block ---
if __name__ == "__main__":
    # Set up command-line argument parsing
    parser = argparse.ArgumentParser(description="Run the LaGuardAI Governed ETL Agent.")
    parser.add_argument("--target", required=True, help="The target system for the write action (e.g., 'etl-summaries').")
    parser.add_argument("--passport", required=True, help="The file path to the agent's passport.json.")
    args = parser.parse_args()

    print("🚀 Launching ETL Summarization Agent...")
    
    # The initial input for the graph now comes from the command line
    initial_input = {
        "target": args.target,
        "passport_path": args.passport
    }
    
    final_state = app.invoke(initial_input)
    print("\n✅ Agent run complete.")

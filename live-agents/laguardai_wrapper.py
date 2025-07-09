import json
import requests

# The URL of your running zkp-api-server.
# Make sure this matches the port your API server is running on.
API_SERVER_URL = "http://localhost:3002/api/execute"

def execute_with_governance(passport_path: str, intent: dict) -> dict:
    """
    Connects to the LaGuardAI API to validate an agent's action.

    Args:
        passport_path: The file path to the agent's passport.json.
        intent: A dictionary representing the agent's intended action.

    Returns:
        A dictionary containing the API's response or an error message.
    """
    print("--- Governance Check: Contacting LaGuardAI Trust Fabric ---")
    
    try:
        # 1. Load the agent's passport from the provided file path
        with open(passport_path, 'r') as f:
            passport = json.load(f)
            
    except FileNotFoundError:
        print(f"  > ❌ ERROR: Passport file not found at '{passport_path}'")
        return {"status": "error", "message": "Passport file not found."}
    except json.JSONDecodeError:
        print(f"  > ❌ ERROR: Could not decode JSON from passport file.")
        return {"status": "error", "message": "Invalid JSON in passport file."}

    # 2. Construct the payload for the API
    payload = {
        "passport": passport,
        "intent": intent
    }
    
    headers = {
        "Content-Type": "application/json"
    }

    # 3. Make the POST request to the LaGuardAI API
    try:
        response = requests.post(API_SERVER_URL, headers=headers, data=json.dumps(payload))
        
        # 4. Process the response
        if response.status_code == 200 or response.status_code == 201:
            print(f"  > ✅ Governance Check Passed. LaGuardAI responded.")
            return response.json()
            print(f"  > RAW API RESPONSE: {response.json()}") # Add this for debugging
        else:
            print(f"  > ❌ Governance Check FAILED. API responded with status {response.status_code}")
            print(f"  > Response: {response.text}")
            return {"status": "error", "message": f"API Error {response.status_code}"}
            
    except requests.exceptions.ConnectionError:
        print(f"  > ❌ ERROR: Could not connect to the LaGuardAI API at {API_SERVER_URL}")
        return {"status": "error", "message": "API connection failed."}

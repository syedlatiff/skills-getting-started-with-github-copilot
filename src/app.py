"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "category": "Academic",
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "category": "Technology",
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "category": "Sports",
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Debate Team": {
        "category": "Academic",
        "description": "Develop public speaking and argumentation skills through competitive debate",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["alex@mergington.edu"]
    },
    "Soccer Team": {
        "category": "Sports",
        "description": "Competitive soccer team for students interested in sports",
        "schedule": "Mondays and Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["james@mergington.edu", "sarah@mergington.edu", "rachel@mergington.edu"]
    },
    "Art Club": {
        "category": "Arts",
        "description": "Explore various art mediums and create collaborative art projects",
        "schedule": "Tuesdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": []
    },
    "Robotics Club": {
        "category": "Technology",
        "description": "Engineer and build robots for competitions",
        "schedule": "Tuesdays and Fridays, 4:00 PM - 5:30 PM",
        "max_participants": 16,
        "participants": ["tech@mergington.edu", "maker@mergington.edu", "robot@mergington.edu", "engineer@mergington.edu", "science@mergington.edu", "isaac@mergington.edu", "building@mergington.edu", "code@mergington.edu", "component@mergington.edu", "project@mergington.edu", "team@mergington.edu", "challenge@mergington.edu", "innovation@mergington.edu", "stem@mergington.edu", "bot@mergington.edu", "robot2@mergington.edu"]
    },
    "Drama Club": {
        "category": "Arts",
        "description": "Perform plays, musicals, and skits. Perfect for aspiring actors!",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 25,
        "participants": ["actor@mergington.edu"]
    },
    "Science Club": {
        "category": "Academic",
        "description": "Conduct experiments and explore scientific concepts through hands-on activities",
        "schedule": "Wednesdays, 3:45 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["scientist@mergington.edu", "lab@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]

    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}

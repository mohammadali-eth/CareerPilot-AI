import os
import sys

# Add current apps/api folder to path to allow resolution of core and database modules
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "apps", "api"))

import pytest
from services.roadmap_ai import RoadmapGenerationEngine


@pytest.mark.asyncio
async def test_roadmap_engine_fallback_generation():
    # Arrange
    target_career = "Backend Developer"
    timeline = "6 Months"
    weekly_hours = 15
    experience_level = "Beginner"
    learning_style = "Practice"
    user_skills = ["Git", "Python"]
    missing_skills = ["FastAPI", "PostgreSQL", "Docker"]
    user_experience = "Basic Python programming."
    user_projects = "Simple calculator CLI."

    # Act
    engine = RoadmapGenerationEngine(
        target_career=target_career,
        timeline_str=timeline,
        weekly_hours=weekly_hours,
        experience_level=experience_level,
        learning_style=learning_style,
        user_skills=user_skills,
        missing_skills=missing_skills,
        user_experience=user_experience,
        user_projects=user_projects
    )
    
    roadmap = await engine.generate()

    # Assert
    assert roadmap["career_goal"] is not None
    assert 0 <= roadmap["success_probability"] <= 100
    assert len(roadmap["learning_phases"]) > 0
    assert len(roadmap["weekly_tasks"]) == 24 # 6 Months is 24 Weeks
    assert len(roadmap["monthly_goals"]) == 6
    assert len(roadmap["projects"]) == 4 # Beginner, Intermediate, Advanced, Capstone
    assert len(roadmap["certifications"]) > 0
    assert "why_milestones_exist_explanation" in roadmap
    assert "why_skills_ordered_explanation" in roadmap
    assert "employability_impact_explanation" in roadmap


def test_success_probability_calculations():
    # Test high hours, advanced experience
    engine_high = RoadmapGenerationEngine(
        target_career="AI Engineer",
        timeline_str="12 Months",
        weekly_hours=20,
        experience_level="Advanced",
        learning_style="Mixed",
        user_skills=[],
        missing_skills=[],
        user_experience="",
        user_projects=""
    )
    assert engine_high.calculate_success_probability() >= 85

    # Test low hours, beginner experience
    engine_low = RoadmapGenerationEngine(
        target_career="AI Engineer",
        timeline_str="3 Months",
        weekly_hours=5,
        experience_level="Beginner",
        learning_style="Mixed",
        user_skills=[],
        missing_skills=[],
        user_experience="",
        user_projects=""
    )
    assert engine_low.calculate_success_probability() <= 55

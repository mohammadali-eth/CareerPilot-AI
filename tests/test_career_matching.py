import pytest
from services.career_matching import CareerMatchingEngine, CareerExplanationGenerator


def test_career_matching_engine_calculations():
    # Arrange: Mock resume extraction data
    extracted_data = {
        "skills": ["Python", "FastAPI", "SQL", "Docker", "Git"],
        "education": ["Bachelor of Science in Computer Science"],
        "experience": ["Worked as a junior backend engineer building REST APIs in Python."],
        "projects": ["Built a microservices application using FastAPI and Postgres"],
        "certifications": ["AWS Certified Developer"]
    }

    # Act
    engine = CareerMatchingEngine(extracted_data)
    matches = engine.calculate_matches()

    # Assert
    assert len(matches) > 0
    # Top match should be a backend developer or software engineer based on skills
    top_match = matches[0]
    assert "career_name" in top_match
    assert 0 <= top_match["match_score"] <= 100
    assert 0 <= top_match["confidence_score"] <= 1.0
    
    # Specific fields check
    assert "skills_score" in top_match
    assert "experience_score" in top_match
    assert "education_score" in top_match
    assert "projects_score" in top_match
    assert "certifications_score" in top_match
    assert "salary_insights" in top_match
    assert "market_demand" in top_match


@pytest.mark.asyncio
async def test_career_explanation_generator_fallback():
    # Arrange
    career_name = "Backend Developer"
    match_score = 85
    user_skills = ["Python", "FastAPI"]
    missing_skills = ["Redis", "Kubernetes"]
    user_experience = "Developed backend applications."
    career_desc = "Develop server-side applications."

    # Act
    explanation = await CareerExplanationGenerator.generate_explanation(
        career_name=career_name,
        match_score=match_score,
        user_skills=user_skills,
        missing_skills=missing_skills,
        user_experience=user_experience,
        career_desc=career_desc
    )

    # Assert
    assert "why_it_matches" in explanation
    assert "recommended_next_steps" in explanation
    assert "estimated_learning_time" in explanation
    assert "growth_potential" in explanation
    assert len(explanation["recommended_next_steps"]) >= 3

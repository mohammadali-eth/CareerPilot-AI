import logging
import asyncio
import json
from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.career import CareerRecommendation, CareerMatch
from repositories.career import CareerRecommendationRepository, CareerMatchRepository
from repositories.resume import ResumeRepository
from repositories.user import ProfileRepository
from services.career_matching import CareerMatchingEngine, CareerExplanationGenerator

logger = logging.getLogger("careerpilot.career.service")


class CareerRecommendationService:
    """
    Orchestration layer managing the collection of user metrics, invocation of similarity models,
    parallelization of generative explanations, and transactional storage of career insights.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.recommendation_repo = CareerRecommendationRepository(db)
        self.match_repo = CareerMatchRepository(db)
        self.resume_repo = ResumeRepository(db)
        self.profile_repo = ProfileRepository(db)

    async def generate_recommendations(self, user_id: UUID) -> CareerRecommendation:
        """
        Orchestrate the end-to-end matching pipeline for a user.
        Loads resume/profile data, scores matches, generates explanations, and stores details.
        """
        # 1. Fetch latest resume
        resumes = await self.resume_repo.get_by_user_id(user_id)
        extracted_data = {}
        
        if resumes:
            latest_resume = resumes[0]
            extracted_data = latest_resume.extracted_data
        else:
            # Fall back to user profile inputs
            profile = await self.profile_repo.get_by_user_id(user_id)
            if not profile:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Please upload a resume or complete your profile to enable career recommendations."
                )
            
            # Simple fallback using target role & experience
            target_role = profile.target_role or "Software Developer"
            experience = profile.current_experience_level or "Entry Level"
            
            # Infer basic skills from target role keywords
            inferred_skills = []
            role_lower = target_role.lower()
            if "front" in role_lower or "react" in role_lower:
                inferred_skills = ["HTML", "CSS", "JavaScript", "TypeScript", "React"]
            elif "back" in role_lower or "api" in role_lower:
                inferred_skills = ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker"]
            elif "data" in role_lower:
                inferred_skills = ["Python", "SQL", "Pandas", "Tableau"]
            elif "devops" in role_lower or "cloud" in role_lower:
                inferred_skills = ["Docker", "Kubernetes", "AWS", "Terraform"]
            else:
                inferred_skills = ["Python", "JavaScript", "SQL", "Git"]

            extracted_data = {
                "skills": inferred_skills,
                "education": ["Information Systems / General Studies"],
                "experience": [f"{experience} experience in {target_role} fields"],
                "certifications": [],
                "projects": []
            }

        # 2. Run Matching Engine
        matching_engine = CareerMatchingEngine(extracted_data)
        scored_matches = matching_engine.calculate_matches()

        # Limit to the top 6 careers for high relevancy and API optimization
        top_matches = scored_matches[:6]

        # 3. Generate AI explanations in parallel
        explanation_tasks = []
        user_skills = extracted_data.get("skills", [])
        experience_summary = " ".join(extracted_data.get("experience", []))

        for match in top_matches:
            task = CareerExplanationGenerator.generate_explanation(
                career_name=match["career_name"],
                match_score=match["match_score"],
                user_skills=user_skills,
                missing_skills=match["missing_skills"],
                user_experience=experience_summary,
                career_desc=match["description"]
            )
            explanation_tasks.append(task)

        explanations = await asyncio.gather(*explanation_tasks)

        # 4. Construct final recommendation payload and insert into database
        recommendation_result = {
            "user_data_snapshot": {
                "skills_count": len(user_skills),
                "experience_length": len(extracted_data.get("experience", [])),
                "has_resume": bool(resumes)
            },
            "top_match_summary": top_matches[0]["career_name"] if top_matches else "None"
        }

        recommendation_data = {
            "user_id": user_id,
            "recommendation_version": "1.0",
            "recommendation_result": recommendation_result,
        }

        # Save recommendation parent
        recommendation_obj = await self.recommendation_repo.create(obj_in=recommendation_data)

        # Save individual match children
        for idx, match in enumerate(top_matches):
            explanation_data = explanations[idx]
            
            # Embed all output specifications into details dictionary
            details = {
                "career_name": match["career_name"],
                "match_score": match["match_score"],
                "confidence_score": match["confidence_score"],
                "why_it_matches": explanation_data["why_it_matches"],
                "required_skills": match["required_skills"],
                "missing_skills": match["missing_skills"],
                "recommended_next_steps": explanation_data["recommended_next_steps"],
                "estimated_learning_time": explanation_data["estimated_learning_time"],
                "growth_potential": explanation_data["growth_potential"],
                "salary_insights": match["salary_insights"],
                "market_demand": match["market_demand"]
            }

            match_data = {
                "recommendation_id": recommendation_obj.id,
                "career_name": match["career_name"],
                "match_score": match["match_score"],
                "confidence_score": match["confidence_score"],
                "explanation": json.dumps(details)  # Store structural JSON details in the text column
            }
            await self.match_repo.create(obj_in=match_data)

        # Commit all records in a single database transaction
        await self.db.commit()

        # Load relation details and return
        final_recommendation = await self.recommendation_repo.get_with_relations(recommendation_obj.id)
        return final_recommendation

    async def get_history(self, user_id: UUID) -> List[CareerRecommendation]:
        """
        Fetch recommendation history of a user.
        """
        return await self.recommendation_repo.get_by_user_id(user_id)

    async def get_recommendation(self, recommendation_id: UUID, user_id: UUID) -> CareerRecommendation:
        """
        Fetch single recommendation batch. Checks ownership bounds.
        """
        recommendation = await self.recommendation_repo.get_with_relations(recommendation_id)
        if not recommendation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation record not found."
            )
        if recommendation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this report."
            )
        return recommendation

    async def delete_recommendation(self, recommendation_id: UUID, user_id: UUID) -> None:
        """
        Delete single recommendation report.
        """
        recommendation = await self.recommendation_repo.get(recommendation_id)
        if not recommendation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recommendation record not found."
            )
        if recommendation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this report."
            )
        await self.recommendation_repo.remove(id=recommendation_id)
        await self.db.commit()

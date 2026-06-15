import logging
import json
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.roadmap import Roadmap, RoadmapMilestone, RoadmapProgress
from repositories.roadmap import RoadmapRepository, RoadmapMilestoneRepository, RoadmapProgressRepository
from repositories.resume import ResumeRepository
from repositories.user import ProfileRepository
from services.roadmap_ai import RoadmapGenerationEngine

logger = logging.getLogger("careerpilot.roadmap.service")


class RoadmapService:
    """
    Orchestration layer managing Career Roadmaps, milestones, and user progress.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.roadmap_repo = RoadmapRepository(db)
        self.milestone_repo = RoadmapMilestoneRepository(db)
        self.progress_repo = RoadmapProgressRepository(db)
        self.resume_repo = ResumeRepository(db)
        self.profile_repo = ProfileRepository(db)

    async def generate_roadmap(
        self,
        user_id: UUID,
        target_career: str,
        timeline: str,
        weekly_hours: int,
        experience_level: str,
        learning_style: str
    ) -> Roadmap:
        """
        Orchestrate the end-to-end generation of a personalized career roadmap.
        """
        # 1. Fetch latest resume/profile
        resumes = await self.resume_repo.get_by_user_id(user_id)
        user_skills = []
        user_experience = ""
        user_projects = ""
        missing_skills = []

        if resumes:
            latest_resume = resumes[0]
            extracted = latest_resume.extracted_data or {}
            user_skills = extracted.get("skills", [])
            user_experience = " ".join(extracted.get("experience", []))
            user_projects = " ".join(extracted.get("projects", []))
            
            # Simple infer missing skills (if target career matched)
            from core.career_kb import CAREER_KNOWLEDGE_BASE
            for career in CAREER_KNOWLEDGE_BASE:
                if career["career_name"].lower() == target_career.lower():
                    missing_skills = [
                        s for s in career["required_skills"]
                        if s.lower() not in [us.lower() for us in user_skills]
                    ]
        else:
            profile = await self.profile_repo.get_by_user_id(user_id)
            if profile:
                user_experience = f"{profile.current_experience_level or 'Entry'} level. Target: {profile.target_role or target_career}."
                # Synthesize default skills
                user_skills = ["Git", "Command Line"]
                missing_skills = ["REST APIs", "SQL", "Containerization"]

        # 2. Run AI/Fallback generator engine
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
        roadmap_data = await engine.generate()

        # 3. Calculate completion date
        total_weeks = engine.total_weeks
        completion_date = datetime.now() + timedelta(weeks=total_weeks)

        # 4. Save Roadmap parent
        roadmap_obj = await self.roadmap_repo.create(obj_in={
            "user_id": user_id,
            "target_career": target_career,
            "timeline": timeline,
            "estimated_completion": completion_date,
            "status": "active",
            "roadmap_data": roadmap_data
        })

        # 5. Generate Milestones based on learning phases
        phases = roadmap_data.get("learning_phases", [])
        running_weeks = 0

        for idx, phase in enumerate(phases):
            # Parse weeks from duration e.g. "4 Weeks"
            duration_str = phase.get("duration", "4 Weeks")
            try:
                weeks = int(duration_str.split()[0])
            except Exception:
                weeks = total_weeks // len(phases)
                
            running_weeks += weeks
            target_date = datetime.now() + timedelta(weeks=running_weeks)

            milestone_obj = await self.milestone_repo.create(obj_in={
                "roadmap_id": roadmap_obj.id,
                "title": phase.get("title", f"Milestone {idx + 1}"),
                "description": phase.get("description", "Complete learning phase objectives."),
                "target_date": target_date,
                "completion_percentage": 0
            })

            # Create default empty progress tracker
            await self.progress_repo.create(obj_in={
                "roadmap_id": roadmap_obj.id,
                "milestone_id": milestone_obj.id,
                "progress": 0,
                "completed": False
            })

        await self.db.commit()

        # Load relation details and return
        final_roadmap = await self.roadmap_repo.get_with_relations(roadmap_obj.id)
        return final_roadmap

    async def get_roadmaps_by_user(self, user_id: UUID) -> List[Roadmap]:
        """
        Get all roadmaps for a user.
        """
        return await self.roadmap_repo.get_by_user_id(user_id)

    async def get_roadmap_by_id(self, roadmap_id: UUID, user_id: UUID) -> Roadmap:
        """
        Retrieve single roadmap by ID with ownership check.
        """
        roadmap = await self.roadmap_repo.get_with_relations(roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found."
            )
        if roadmap.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this roadmap."
            )
        return roadmap

    async def delete_roadmap(self, roadmap_id: UUID, user_id: UUID) -> None:
        """
        Delete a roadmap and related items.
        """
        roadmap = await self.roadmap_repo.get(roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found."
            )
        if roadmap.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to delete this roadmap."
            )
        await self.roadmap_repo.remove(id=roadmap_id)
        await self.db.commit()

    async def update_milestone_progress(
        self,
        roadmap_id: UUID,
        milestone_id: UUID,
        user_id: UUID,
        progress: int,
        completed: bool
    ) -> Roadmap:
        """
        Update progress percentage/completed state for a milestone and recalculate overall progress.
        """
        # Validate roadmap ownership
        roadmap = await self.roadmap_repo.get_with_relations(roadmap_id)
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Roadmap not found."
            )
        if roadmap.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to modify this roadmap."
            )

        # Update progress record
        progress_record = await self.progress_repo.get_by_roadmap_and_milestone(roadmap_id, milestone_id)
        if not progress_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Milestone progress tracker not found."
            )

        progress_record.progress = progress
        progress_record.completed = completed
        self.db.add(progress_record)

        # Update milestone record
        milestone = await self.milestone_repo.get(milestone_id)
        if milestone:
            milestone.completion_percentage = progress
            self.db.add(milestone)

        await self.db.commit()

        # Recalculate overall roadmap status
        all_milestones = await self.milestone_repo.get_by_roadmap_id(roadmap_id)
        if all_milestones:
            total_pct = sum(m.completion_percentage for m in all_milestones)
            avg_pct = total_pct // len(all_milestones)

            if avg_pct >= 100:
                roadmap.status = "completed"
            else:
                roadmap.status = "active"
            
            self.db.add(roadmap)
            await self.db.commit()

        # Return updated roadmap
        return await self.roadmap_repo.get_with_relations(roadmap_id)

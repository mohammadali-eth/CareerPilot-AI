import logging
import json
import httpx
from datetime import datetime, timedelta
from typing import Dict, Any, List, Tuple
from uuid import UUID

from core.config import settings
from core.career_kb import CAREER_KNOWLEDGE_BASE

logger = logging.getLogger("careerpilot.roadmap.ai")


class RoadmapGenerationEngine:
    """
    AI Roadmap Generator. Analyzes user skill gaps, current experience, target career,
    study commitment, and preferred learning styles to generate weekly tasks, projects,
    certifications, progress milestones, and success predictions.
    """

    def __init__(
        self,
        target_career: str,
        timeline_str: str,
        weekly_hours: int,
        experience_level: str,
        learning_style: str,
        user_skills: List[str],
        missing_skills: List[str],
        user_experience: str,
        user_projects: str
    ):
        self.target_career = target_career
        self.timeline_str = timeline_str
        self.weekly_hours = weekly_hours
        self.experience_level = experience_level
        self.learning_style = learning_style
        self.user_skills = [s.strip().lower() for s in user_skills]
        self.missing_skills = [s.strip() for s in missing_skills]
        self.user_experience = user_experience
        self.user_projects = user_projects

        # Parse timeline to total weeks
        self.total_weeks = 12
        if "6" in timeline_str:
            self.total_weeks = 24
        elif "12" in timeline_str:
            self.total_weeks = 48
        else:
            # Custom or fallback
            try:
                self.total_weeks = int(timeline_str.split()[0]) * 4
            except Exception:
                self.total_weeks = 12

    def calculate_success_probability(self) -> int:
        """
        Calculates study success probability based on weekly study commitment and experience level.
        """
        prob = 70
        # Study hours adjustment
        if self.weekly_hours >= 20:
            prob += 15
        elif self.weekly_hours >= 15:
            prob += 10
        elif self.weekly_hours < 8:
            prob -= 15

        # Experience level alignment
        if self.experience_level.lower() == "advanced":
            prob += 10
        elif self.experience_level.lower() == "beginner" and self.total_weeks < 24:
            # Beginner committing to a short timeline
            prob -= 15

        return max(min(prob, 98), 35)

    def get_career_details_from_kb(self) -> Dict[str, Any]:
        """
        Find target career details in the database or return sensible defaults.
        """
        for career in CAREER_KNOWLEDGE_BASE:
            if career["career_name"].lower() == self.target_career.lower():
                return career
        # Default fallback career details
        return {
            "career_name": self.target_career,
            "required_skills": ["Git", "APIs", "Data Structures", "Security"],
            "preferred_certifications": ["AWS Certified Cloud Practitioner"],
            "description": "Professional practitioner in modern technical architectures."
        }

    async def generate(self) -> Dict[str, Any]:
        """
        Generate the complete roadmap schema using OpenAI or cascading fallback generator.
        """
        career_details = self.get_career_details_from_kb()
        skills_to_learn = self.missing_skills if self.missing_skills else career_details["required_skills"]

        if not settings.OPENAI_API_KEY:
            logger.info("OpenAI API key missing. Using deterministic fallback engine.")
            return self.generate_fallback(career_details, skills_to_learn)

        # AI prompt construction
        prompt = f"""
        You are a Principal Technical Architect and Staff Engineering Mentor.
        Build a highly personalized, weekly learning roadmap for a user transitioning into the role of '{self.target_career}'.

        Context:
        - Target Role: {self.target_career}
        - User's Experience Level: {self.experience_level}
        - Study Commitment: {self.weekly_hours} Hours per Week
        - Target Duration: {self.timeline_str} ({self.total_weeks} Weeks)
        - Preferred Learning Style: {self.learning_style}
        - Skills Already Possessed: {', '.join(self.user_skills) if self.user_skills else 'None'}
        - Specific Skill Gaps to Learn: {', '.join(skills_to_learn)}
        - Experience summary: {self.user_experience[:300]}
        - Career context: {career_details.get('description', '')}

        Generate a strict JSON response. Do not output markdown, preambles, or formatting backticks.
        Use this exact schema structure:
        {{
          "career_goal": "A personalized summary of the career transition plan",
          "success_probability": 85, // Integer 0-100 reflecting target viability
          "learning_phases": [
            {{
              "phase_number": 1,
              "title": "Phase Title",
              "description": "Phase focus description",
              "duration": "Duration (e.g. 4 Weeks)",
              "skills_covered": ["Skill1", "Skill2"]
            }}
          ],
          "weekly_tasks": [
            {{
              "week_number": 1,
              "theme": "Weekly core topic",
              "tasks": [
                "Detailed study resource or task 1 matching learning style {self.learning_style}",
                "Detailed task 2"
              ]
            }}
          ],
          "monthly_goals": [
            {{
              "month_number": 1,
              "goal": "Monthly major outcome",
              "focus_areas": ["Focus area 1", "Focus area 2"]
            }}
          ],
          "projects": [
            {{
              "title": "Beginner Project Name",
              "difficulty": "Beginner",
              "estimated_duration": "1 Week",
              "skills_covered": ["Skill1"],
              "portfolio_value": "Short explanation of portfolio merit",
              "why_recommended": "Reasoning based on user's target career"
            }},
            {{
              "title": "Intermediate Project Name",
              "difficulty": "Intermediate",
              "estimated_duration": "2 Weeks",
              "skills_covered": ["Skill2"],
              "portfolio_value": "Medium portfolio merit",
              "why_recommended": "Reasoning"
            }},
            {{
              "title": "Advanced Project Name",
              "difficulty": "Advanced",
              "estimated_duration": "3 Weeks",
              "skills_covered": ["Skill3"],
              "portfolio_value": "High portfolio merit",
              "why_recommended": "Reasoning"
            }},
            {{
              "title": "Capstone Project Name",
              "difficulty": "Capstone",
              "estimated_duration": "4 Weeks",
              "skills_covered": ["Skill4"],
              "portfolio_value": "Exceptional production-grade portfolio value",
              "why_recommended": "Reasoning"
            }}
          ],
          "certifications": [
            {{
              "title": "Certification Name",
              "priority_level": "High / Medium / Low",
              "career_impact": "Direct resume alignment",
              "estimated_completion_time": "Duration",
              "reason_for_recommendation": "Explain why this cert assists their specific skill gaps"
            }}
          ],
          "interview_preparation": [
            "DSA topic / system design focus 1",
            "Mock questions to prepare"
          ],
          "portfolio_improvements": [
            "Portfolio action item 1 (e.g. Add unit tests, deploy on Vercel)"
          ],
          "why_milestones_exist_explanation": "Explain why milestones are ordered this way and how it supports their learning style.",
          "why_skills_ordered_explanation": "Provide pedagogical justification for the sequence of technology learning.",
          "employability_impact_explanation": "Describe how this roadmap maximizes hiring potential for '{self.target_career}'."
        }}

        Limit the number of weekly_tasks to match exactly {self.total_weeks} weeks. Keep responses concise and highly actionable.
        """

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.OPENAI_DEFAULT_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are a professional software engineering mentor. Output only JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    }
                )
                if response.status_code == 200:
                    result_json = response.json()
                    content = result_json["choices"][0]["message"]["content"]
                    parsed_data = json.loads(content)
                    # Force target week matching
                    parsed_data["success_probability"] = self.calculate_success_probability()
                    return parsed_data
                else:
                    logger.error(f"OpenAI roadmap error: {response.text}")
                    raise ValueError("Failed OpenAI request.")
        except Exception as e:
            logger.error(f"OpenAI roadmap generation failed: {e}. Falling back.")
            return self.generate_fallback(career_details, skills_to_learn)

    def generate_fallback(self, career_details: Dict[str, Any], skills_to_learn: List[str]) -> Dict[str, Any]:
        """
        High-fidelity deterministic fallback engine in case OpenAI API is disabled or throws an exception.
        """
        success_prob = self.calculate_success_probability()
        
        # 1. Distribute skills across phases
        num_phases = 3 if self.total_weeks <= 12 else (4 if self.total_weeks <= 24 else 5)
        phases = []
        phase_weeks = self.total_weeks // num_phases
        
        chunk_size = max(1, len(skills_to_learn) // num_phases)
        for i in range(num_phases):
            p_num = i + 1
            skills_chunk = skills_to_learn[i * chunk_size : (i + 1) * chunk_size]
            if i == num_phases - 1:
                skills_chunk = skills_to_learn[i * chunk_size :] # Capture leftovers
            if not skills_chunk:
                skills_chunk = ["Professional Projects", "System Integration"]
                
            phases.append({
                "phase_number": p_num,
                "title": f"Phase {p_num}: " + (f"Core Foundation of {skills_chunk[0]}" if i == 0 else f"Advanced integration with {skills_chunk[0]}"),
                "description": f"Focus deeply on mastering and building projects around {', '.join(skills_chunk)}.",
                "duration": f"{phase_weeks} Weeks",
                "skills_covered": skills_chunk
            })

        # 2. Build weekly tasks
        weekly_tasks = []
        for w in range(1, self.total_weeks + 1):
            # Map week to a phase
            p_idx = min((w - 1) // phase_weeks, num_phases - 1)
            current_phase = phases[p_idx]
            skills_context = current_phase["skills_covered"]
            skill_focus = skills_context[w % len(skills_context)]
            
            weekly_tasks.append({
                "week_number": w,
                "theme": f"Mastering {skill_focus} Concepts",
                "tasks": [
                    f"Read official documentation and developer guides for {skill_focus}.",
                    f"Spend {self.weekly_hours // 2} hours writing clean code examples for {skill_focus}.",
                    f"Configure a Github repo and practice containerization or state management."
                ]
            })

        # 3. Build monthly goals
        num_months = max(1, self.total_weeks // 4)
        monthly_goals = []
        for m in range(1, num_months + 1):
            monthly_goals.append({
                "month_number": m,
                "goal": f"Establish operational fluency in Month {m} topics.",
                "focus_areas": [
                    "Code refactoring and unit tests",
                    "Database optimization and REST routing",
                    "Mock deployment and performance profiling"
                ]
            })

        # 4. Projects Recommendation
        projects = [
            {
                "title": f"Mini-{self.target_career} Tooling",
                "difficulty": "Beginner",
                "estimated_duration": "1 Week",
                "skills_covered": [skills_to_learn[0]] if skills_to_learn else ["Git"],
                "portfolio_value": "Shows baseline technical execution and setup capabilities.",
                "why_recommended": "Establishes immediate familiarity with development environment."
            },
            {
                "title": f"Centralized Database Manager",
                "difficulty": "Intermediate",
                "estimated_duration": "2 Weeks",
                "skills_covered": [skills_to_learn[1]] if len(skills_to_learn) > 1 else ["PostgreSQL"],
                "portfolio_value": "Demonstrates capability to model tables, wire APIs, and perform CRUD operations.",
                "why_recommended": "Crucial requirement for production engineering teams."
            },
            {
                "title": f"Distributed Event Tracker",
                "difficulty": "Advanced",
                "estimated_duration": "3 Weeks",
                "skills_covered": [skills_to_learn[2]] if len(skills_to_learn) > 2 else ["Docker", "Redis"],
                "portfolio_value": "Shows command of caching structures, containerized networking, and error handling.",
                "why_recommended": "Proves readiness to join mid-to-large scale software enterprises."
            },
            {
                "title": f"Enterprise {self.target_career} Platform",
                "difficulty": "Capstone",
                "estimated_duration": "4 Weeks",
                "skills_covered": skills_to_learn[:4] if len(skills_to_learn) >= 4 else skills_to_learn,
                "portfolio_value": "A fully deployed, scalable platform incorporating auth, tests, and CI/CD pipelines.",
                "why_recommended": "Acts as the centerpiece portfolio piece to lock in recruiter calls."
            }
        ]

        # 5. Certifications Recommendation
        cert_names = career_details.get("preferred_certifications", ["AWS Certified Developer"])
        certifications = []
        for idx, cert in enumerate(cert_names):
            certifications.append({
                "title": cert,
                "priority_level": "High" if idx == 0 else "Medium",
                "career_impact": "Substantially increases interview visibility and screens past basic HR requirements.",
                "estimated_completion_time": "4 - 8 Weeks",
                "reason_for_recommendation": f"Validates knowledge gaps in system workflows for {self.target_career}."
            })

        # 6. Explanations
        why_milestones = (
            f"Milestones are designed to build progressive complexity. We start with {skills_to_learn[0] if skills_to_learn else 'foundations'} "
            "to establish muscle memory, followed by database interactions and containerization concepts."
        )
        why_skills = (
            "Learning foundational tooling first prevents cognitive overload. Deployments and optimizations are ordered "
            "later to ensure code-level fluency is achieved beforehand."
        )
        employability = (
            f"This learning path targets specific skill gaps, shifting your resume compatibility from basic matching "
            f"to a well-rounded technical candidate for {self.target_career}."
        )

        return {
            "career_goal": f"A structured program to transition user credentials towards a professional {self.target_career} role.",
            "success_probability": success_prob,
            "learning_phases": phases,
            "weekly_tasks": weekly_tasks,
            "monthly_goals": monthly_goals,
            "projects": projects,
            "certifications": certifications,
            "interview_preparation": [
                f"Practice coding challenges focusing on arrays, lists, and trees.",
                f"Study system design fundamentals (Load balancers, SQL scaling).",
                f"Simulate role behavioral questions focusing on project challenges."
            ],
            "portfolio_improvements": [
                "Configure a professional Github Readme showcasing current projects.",
                "Ensure all repository code has passing unit tests and setup instructions."
            ],
            "why_milestones_exist_explanation": why_milestones,
            "why_skills_ordered_explanation": why_skills,
            "employability_impact_explanation": employability
        }

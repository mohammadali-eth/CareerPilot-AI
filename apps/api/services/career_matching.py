import logging
import json
import httpx
from typing import Dict, Any, List, Tuple
from uuid import UUID
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from core.config import settings
from core.career_kb import CAREER_KNOWLEDGE_BASE

logger = logging.getLogger("careerpilot.career.matching")


class CareerMatchingEngine:
    """
    Engine to calculate semantic similarity and rule-based weights between user resume/profile metrics
    and the Career Knowledge Base. Provides score breakdowns and outputs insights.
    """

    def __init__(self, extracted_data: Dict[str, Any]):
        self.extracted_data = extracted_data
        self.user_skills = [s.strip().lower() for s in extracted_data.get("skills", [])]
        self.user_education = " ".join(extracted_data.get("education", [])).lower()
        self.user_experience = " ".join(extracted_data.get("experience", [])).lower()
        self.user_projects = " ".join(extracted_data.get("projects", [])).lower()
        self.user_certifications = " ".join(extracted_data.get("certifications", [])).lower()

    def calculate_matches(self) -> List[Dict[str, Any]]:
        """
        Evaluate all career paths in the Career KB against user parameters.
        Returns a sorted list of matches.
        """
        matches = []
        for career in CAREER_KNOWLEDGE_BASE:
            # 1. Skills score (40%)
            career_skills = [s.lower() for s in career["required_skills"]]
            matching_skills = [s for s in career_skills if s in self.user_skills]
            missing_skills = [s for s in career["required_skills"] if s.lower() not in self.user_skills]
            
            skills_score = (len(matching_skills) / len(career_skills)) * 100 if career_skills else 0

            # 2. Experience score (25%)
            # Use TF-IDF cosine similarity between user experience and career description/skills
            exp_score = 0
            if self.user_experience.strip():
                try:
                    vectorizer = TfidfVectorizer()
                    career_doc = f"{career['career_name']} {career['description']} {' '.join(career['required_skills'])}"
                    tfidf = vectorizer.fit_transform([self.user_experience, career_doc])
                    exp_score = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]) * 100
                except Exception as e:
                    logger.warning(f"TF-IDF experience matching error: {e}")
                    exp_score = 10.0
            else:
                exp_score = 0.0

            # 3. Education score (15%)
            edu_score = 20.0  # Base score
            for edu_pref in career["preferred_education"]:
                if edu_pref.lower() in self.user_education:
                    edu_score = 100.0
                    break
                elif any(word in self.user_education for word in ["science", "engineering", "technology"]):
                    edu_score = 60.0

            # 4. Projects score (10%)
            proj_score = 0
            if self.user_projects.strip():
                try:
                    vectorizer = TfidfVectorizer()
                    career_doc = f"{career['career_name']} {career['description']} {' '.join(career['required_skills'])}"
                    tfidf = vectorizer.fit_transform([self.user_projects, career_doc])
                    proj_score = float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]) * 100
                except Exception as e:
                    proj_score = 10.0
            else:
                proj_score = 0.0

            # 5. Certifications score (10%)
            cert_score = 0.0
            matching_certs = []
            for cert_pref in career["preferred_certifications"]:
                if cert_pref.lower() in self.user_certifications:
                    matching_certs.append(cert_pref)
            
            if matching_certs:
                cert_score = 100.0
            elif self.user_certifications.strip():
                cert_score = 30.0

            # Aggregate weighted Match Score (Range 0 - 100)
            match_score = int(
                (skills_score * 0.40) +
                (exp_score * 0.25) +
                (edu_score * 0.15) +
                (proj_score * 0.10) +
                (cert_score * 0.10)
            )
            # Bound matches between 10 and 100
            match_score = max(min(match_score, 100), 10)

            # Confidence score calculation based on data density
            confidence_score = 0.5
            if self.user_skills:
                confidence_score += 0.1
            if self.user_experience:
                confidence_score += 0.2
            if self.user_education:
                confidence_score += 0.1
            if self.user_projects:
                confidence_score += 0.1
            confidence_score = min(confidence_score, 0.98)

            matches.append({
                "career_name": career["career_name"],
                "match_score": match_score,
                "confidence_score": confidence_score,
                "skills_score": int(skills_score),
                "experience_score": int(exp_score),
                "education_score": int(edu_score),
                "projects_score": int(proj_score),
                "certifications_score": int(cert_score),
                "required_skills": career["required_skills"],
                "missing_skills": missing_skills,
                "salary_insights": career["salary_insights"],
                "market_demand": career["market_demand"],
                "growth_potential": career["growth_potential"],
                "estimated_learning_time": career["estimated_learning_time"],
                "description": career["description"]
            })

        # Sort matches by match score descending
        matches.sort(key=lambda x: x["match_score"], reverse=True)
        return matches


class CareerExplanationGenerator:
    """
    Invokes generative AI to write deep, personalized, explainable insights for recommended career pathways.
    """

    @staticmethod
    async def generate_explanation(
        career_name: str,
        match_score: int,
        user_skills: List[str],
        missing_skills: List[str],
        user_experience: str,
        career_desc: str
    ) -> Dict[str, Any]:
        """
        Generate detailed explanation parameters using OpenAI if available, falling back to heuristic profiles.
        """
        if not settings.OPENAI_API_KEY:
            # High-quality structural local fallback
            why_it_matches = (
                f"Your background demonstrates a {match_score}% affinity for a career as a {career_name}. "
                f"You have already mastered key required skills like {', '.join(user_skills[:4]) if user_skills else 'general technical solving'}. "
                f"Your experience matches the domain requirements for this path."
            )
            
            steps = []
            if missing_skills:
                steps.append(f"Enroll in courses to acquire missing keywords: {', '.join(missing_skills[:3])}.")
            else:
                steps.append("Build advanced portfolio projects highlighting scalable application architecture.")
            steps.append(f"Review and earn preferred certifications for {career_name}.")
            steps.append("Optimize your resume layout to highlight project contributions using quantifiable metrics.")

            return {
                "why_it_matches": why_it_matches,
                "recommended_next_steps": steps,
                "estimated_learning_time": "3 - 6 Months" if len(missing_skills) < 4 else "6 - 12 Months",
                "growth_potential": "Strong growth trend with excellent long-term job security and high compensation scales."
            }

        prompt = f"""
        You are a Staff Career Counselor and Executive Technical Recruiter.
        Provide a detailed career match analysis for a user evaluating the role of '{career_name}'.

        Context:
        - Overall Match Score: {match_score}/100
        - User's Extracted Skills: {', '.join(user_skills)}
        - Missing Skills Needed: {', '.join(missing_skills)}
        - User's Experience Summary: {user_experience[:400]}
        - Career Description: {career_desc}

        Generate a strict JSON response. Do not output markdown, prefixes, or comments.
        JSON Schema to match:
        {{
          "why_it_matches": "A customized paragraph explaining why their profile fits the role, citing specific skills they possess.",
          "recommended_next_steps": [
            "Step 1: Specific skill to learn",
            "Step 2: Specific project to build",
            "Step 3: Certification or action item"
          ],
          "estimated_learning_time": "Timeline description (e.g. 4-6 Months)",
          "growth_potential": "Summary of industry growth prospects for this career"
        }}
        """

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": settings.OPENAI_DEFAULT_MODEL,
                        "messages": [
                            {"role": "system", "content": "You are a professional recruiting analyzer. Output only JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "temperature": 0.2,
                        "response_format": {"type": "json_object"}
                    }
                )
                
                if response.status_code == 200:
                    result_json = response.json()
                    content = result_json["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.error(f"OpenAI explanation error: {response.text}")
                    raise ValueError("Failed OpenAI API query.")
        except Exception as e:
            logger.error(f"OpenAI error calling explanation generator: {e}. Cascading to local templates.")
            return {
                "why_it_matches": f"You show high compatibility ({match_score}%) with the role of {career_name} based on matching credentials.",
                "recommended_next_steps": [
                    f"Bridge the skill gap by mastering: {', '.join(missing_skills[:3]) if missing_skills else 'system design'}.",
                    "Deploy a real-world project showing full application lifecycle.",
                    "Optimize resume presentation and portfolio descriptions."
                ],
                "estimated_learning_time": "6 Months",
                "growth_potential": "Excellent outlook with rising market adoption."
            }

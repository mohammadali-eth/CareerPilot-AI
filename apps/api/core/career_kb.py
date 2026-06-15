from typing import List, Dict, Any

CAREER_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "career_name": "Software Engineer",
        "required_skills": ["Python", "Java", "C++", "Git", "SQL", "Data Structures", "Algorithms", "REST APIs"],
        "preferred_education": ["Computer Science", "Software Engineering", "Computer Engineering"],
        "preferred_certifications": ["AWS Certified Developer", "Google Cloud Professional Cloud Architect"],
        "salary_insights": {
            "entry_level": "$75,000 - $95,000",
            "mid_level": "$105,000 - $140,000",
            "senior_level": "$150,000 - $210,000"
        },
        "market_demand": {
            "demand_score": 85,
            "growth_trend": "Increasing",
            "industry_adoption": "High across all sectors",
            "future_outlook": "Strong sustained demand as enterprises modernize legacy systems and build cloud infrastructure."
        },
        "growth_potential": "High",
        "estimated_learning_time": "6 - 12 Months",
        "description": "Develop, test, and maintain software applications using general-purpose programming languages and systems architecture."
    },
    {
        "career_name": "Frontend Developer",
        "required_skills": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "TailwindCSS", "Git", "REST APIs"],
        "preferred_education": ["Computer Science", "Information Technology", "Web Development"],
        "preferred_certifications": ["Meta Front-End Developer Certificate", "AWS Certified Cloud Practitioner"],
        "salary_insights": {
            "entry_level": "$65,000 - $85,000",
            "mid_level": "$95,000 - $125,000",
            "senior_level": "$135,000 - $185,000"
        },
        "market_demand": {
            "demand_score": 80,
            "growth_trend": "Stable",
            "industry_adoption": "Very High in Tech and Retail",
            "future_outlook": "Persistent need for rich, responsive web UI and high-performance interactive interfaces."
        },
        "growth_potential": "Medium-High",
        "estimated_learning_time": "3 - 6 Months",
        "description": "Design and build web application user interfaces, optimizing for browser compatibility, responsiveness, and performance."
    },
    {
        "career_name": "Backend Developer",
        "required_skills": ["Python", "FastAPI", "Node.js", "Django", "PostgreSQL", "Redis", "Docker", "REST APIs", "SQL"],
        "preferred_education": ["Computer Science", "Information Technology", "Computer Engineering"],
        "preferred_certifications": ["AWS Certified Developer", "CKA (Certified Kubernetes Administrator)"],
        "salary_insights": {
            "entry_level": "$70,000 - $90,000",
            "mid_level": "$100,000 - $135,000",
            "senior_level": "$145,000 - $195,000"
        },
        "market_demand": {
            "demand_score": 88,
            "growth_trend": "Increasing",
            "industry_adoption": "Critical for all internet architectures",
            "future_outlook": "Growing demand for microservices architectures, serverless models, and highly secure API routing structures."
        },
        "growth_potential": "High",
        "estimated_learning_time": "6 - 9 Months",
        "description": "Build server-side logic, database structures, integration workflows, and API architectures supporting client-facing UI."
    },
    {
        "career_name": "Full Stack Developer",
        "required_skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "Git", "TailwindCSS"],
        "preferred_education": ["Computer Science", "Software Engineering"],
        "preferred_certifications": ["AWS Certified Developer", "Meta Full-stack Developer"],
        "salary_insights": {
            "entry_level": "$75,000 - $100,000",
            "mid_level": "$110,000 - $150,000",
            "senior_level": "$160,000 - $220,000"
        },
        "market_demand": {
            "demand_score": 92,
            "growth_trend": "Increasing",
            "industry_adoption": "Extremely Popular in Startups and Mid-market",
            "future_outlook": "Highly valued due to versatile operational flexibility. Able to build entire modules end-to-end."
        },
        "growth_potential": "High",
        "estimated_learning_time": "9 - 18 Months",
        "description": "Develop both client-side and server-side components of web applications, managing deployments and data state."
    },
    {
        "career_name": "Mobile Developer",
        "required_skills": ["Swift", "Kotlin", "React Native", "Flutter", "TypeScript", "Git", "REST APIs", "Mobile UI Design"],
        "preferred_education": ["Computer Science", "Software Engineering"],
        "preferred_certifications": ["Google Associate Android Developer", "Apple Swift Certification"],
        "salary_insights": {
            "entry_level": "$70,000 - $95,000",
            "mid_level": "$105,000 - $138,000",
            "senior_level": "$145,000 - $200,000"
        },
        "market_demand": {
            "demand_score": 78,
            "growth_trend": "Stable",
            "industry_adoption": "High in Consumer and Service industries",
            "future_outlook": "Sustained need for native mobile applications and cross-platform responsive products."
        },
        "growth_potential": "Medium-High",
        "estimated_learning_time": "6 - 9 Months",
        "description": "Create application packages targeting mobile operating systems like iOS and Android, optimizing for hardware resources."
    },
    {
        "career_name": "DevOps Engineer",
        "required_skills": ["Docker", "Kubernetes", "Terraform", "Git", "CI/CD", "AWS", "Linux", "Python", "Bash", "Prometheus"],
        "preferred_education": ["Computer Science", "Systems Engineering", "Network Security"],
        "preferred_certifications": ["CKA (Certified Kubernetes Administrator)", "AWS DevOps Engineer Professional"],
        "salary_insights": {
            "entry_level": "$85,000 - $110,000",
            "mid_level": "$120,000 - $160,000",
            "senior_level": "$170,000 - $230,000"
        },
        "market_demand": {
            "demand_score": 94,
            "growth_trend": "Increasing",
            "industry_adoption": "Ubiquitous in modern enterprises",
            "future_outlook": "Critical role bridging developers and operations. Growth fueled by multi-cloud infrastructure and automation."
        },
        "growth_potential": "Very High",
        "estimated_learning_time": "9 - 15 Months",
        "description": "Automate system configurations, configure deployment pipelines, manage container orchestration, and monitor infrastructure telemetry."
    },
    {
        "career_name": "Cloud Engineer",
        "required_skills": ["AWS", "Terraform", "Docker", "Linux", "Bash", "Python", "SQL", "Networking", "IAM", "Security Policies"],
        "preferred_education": ["Computer Science", "Information Systems", "Computer Engineering"],
        "preferred_certifications": ["AWS Solutions Architect", "Google Cloud Associate Cloud Engineer"],
        "salary_insights": {
            "entry_level": "$80,000 - $105,000",
            "mid_level": "$115,000 - $150,000",
            "senior_level": "$160,000 - $215,000"
        },
        "market_demand": {
            "demand_score": 90,
            "growth_trend": "Increasing",
            "industry_adoption": "High across all scales",
            "future_outlook": "High request for engineers who can structure serverless platforms and design cost-effective cloud architectures."
        },
        "growth_potential": "High",
        "estimated_learning_time": "6 - 12 Months",
        "description": "Design, configure, deploy, and maintain systems infrastructure hosted in public, private, or hybrid cloud environments."
    },
    {
        "career_name": "Data Analyst",
        "required_skills": ["SQL", "Python", "Pandas", "Tableau", "PowerBI", "Excel", "Data Visualization", "Statistics"],
        "preferred_education": ["Statistics", "Mathematics", "Finance", "Information Systems"],
        "preferred_certifications": ["Google Data Analytics Certificate", "Tableau Desktop Certified Associate"],
        "salary_insights": {
            "entry_level": "$60,000 - $78,000",
            "mid_level": "$85,000 - $110,000",
            "senior_level": "$120,000 - $155,000"
        },
        "market_demand": {
            "demand_score": 82,
            "growth_trend": "Stable",
            "industry_adoption": "Universal in business departments",
            "future_outlook": "Strong need for business intelligence specialists who can transform raw data into operational insights."
        },
        "growth_potential": "Medium-High",
        "estimated_learning_time": "3 - 6 Months",
        "description": "Gather, clean, analyze, and visualize business and operational data to discover trends and support strategic decision-making."
    },
    {
        "career_name": "Data Scientist",
        "required_skills": ["Python", "SQL", "Machine Learning", "Statistics", "Pandas", "Scikit-Learn", "Numpy", "Data Modeling"],
        "preferred_education": ["Data Science", "Statistics", "Mathematics", "Computer Science"],
        "preferred_certifications": ["IBM Data Science Professional", "TensorFlow Developer Certificate"],
        "salary_insights": {
            "entry_level": "$85,000 - $110,000",
            "mid_level": "$125,000 - $165,000",
            "senior_level": "$175,000 - $240,000"
        },
        "market_demand": {
            "demand_score": 86,
            "growth_trend": "Increasing",
            "industry_adoption": "High in Tech and Finance",
            "future_outlook": "Critical role as companies pivot to predictive analytics, large-scale modeling, and structured ML architectures."
        },
        "growth_potential": "High",
        "estimated_learning_time": "12 - 24 Months",
        "description": "Apply advanced statistical modeling, algorithmic processes, and machine learning methods to build predictive systems."
    },
    {
        "career_name": "ML Engineer",
        "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "Numpy", "Docker", "SQL", "Git", "PyTorch", "TensorFlow", "FastAPI"],
        "preferred_education": ["Computer Science", "Data Science", "Artificial Intelligence"],
        "preferred_certifications": ["TensorFlow Developer", "Google Cloud Professional ML Engineer"],
        "salary_insights": {
            "entry_level": "$95,000 - $125,000",
            "mid_level": "$140,000 - $185,000",
            "senior_level": "$200,000 - $280,000"
        },
        "market_demand": {
            "demand_score": 95,
            "growth_trend": "Increasing",
            "industry_adoption": "Explosive growth across all software sectors",
            "future_outlook": "Sustained high demand as businesses embed custom intelligence models and prediction engines into core applications."
        },
        "growth_potential": "Very High",
        "estimated_learning_time": "12 - 18 Months",
        "description": "Design and deploy production-grade machine learning models, managing training architectures and model telemetry."
    },
    {
        "career_name": "AI Engineer",
        "required_skills": ["Python", "OpenAI", "FastAPI", "TypeScript", "LangChain", "Vector Databases", "Prompt Engineering", "Docker", "Git"],
        "preferred_education": ["Computer Science", "Artificial Intelligence", "Software Engineering"],
        "preferred_certifications": ["AWS Certified AI Practitioner", "DeepLearning.AI Generative AI Certification"],
        "salary_insights": {
            "entry_level": "$100,000 - $135,000",
            "mid_level": "$150,000 - $200,000",
            "senior_level": "$220,000 - $300,000"
        },
        "market_demand": {
            "demand_score": 98,
            "growth_trend": "Exponential",
            "industry_adoption": "Extremely high adoption across SaaS platforms",
            "future_outlook": "Unprecedented demand driven by LLMs, Retrieval-Augmented Generation (RAG), and autonomous AI agent workflows."
        },
        "growth_potential": "Exceptional",
        "estimated_learning_time": "6 - 12 Months",
        "description": "Build application workflows powered by Large Language Models, generative AI tools, and semantic embeddings."
    },
    {
        "career_name": "Cybersecurity Analyst",
        "required_skills": ["Linux", "Networking", "Security Policies", "IAM", "Bash", "SQL", "Cryptography", "Penetration Testing"],
        "preferred_education": ["Cybersecurity", "Computer Networks", "Information Technology"],
        "preferred_certifications": ["CompTIA Security+", "CISSP (Certified Information Systems Security Professional)"],
        "salary_insights": {
            "entry_level": "$75,000 - $95,000",
            "mid_level": "$105,000 - $140,000",
            "senior_level": "$150,000 - $210,000"
        },
        "market_demand": {
            "demand_score": 91,
            "growth_trend": "Increasing",
            "industry_adoption": "Critical across all sectors",
            "future_outlook": "Steady job growth fueled by complex security landscapes, regulatory demands, and remote access vulnerability vectors."
        },
        "growth_potential": "High",
        "estimated_learning_time": "6 - 12 Months",
        "description": "Monitor, evaluate, audit, and secure organizational networks, servers, and software systems against threat vectors."
    },
    {
        "career_name": "Product Manager",
        "required_skills": ["Product Strategy", "Agile", "User Experience", "Data Analysis", "SQL", "Roadmapping", "A/B Testing"],
        "preferred_education": ["Business Administration", "Computer Science", "Marketing"],
        "preferred_certifications": ["Product School Certified Product Manager", "Scrum Alliance Product Owner (CSPO)"],
        "salary_insights": {
            "entry_level": "$80,000 - $105,000",
            "mid_level": "$115,000 - $155,000",
            "senior_level": "$165,000 - $220,000"
        },
        "market_demand": {
            "demand_score": 83,
            "growth_trend": "Stable",
            "industry_adoption": "Standard in product organizations",
            "future_outlook": "Steady demand for managers who can coordinate cross-functional engineering, design, and sales pipelines."
        },
        "growth_potential": "High",
        "estimated_learning_time": "6 - 12 Months",
        "description": "Define product strategy, build features roadmaps, coordinate cross-functional engineering cycles, and monitor release metrics."
    },
    {
        "career_name": "UI/UX Designer",
        "required_skills": ["Figma", "User Experience", "Mobile UI Design", "HTML", "CSS", "Wireframing", "Prototyping", "User Research"],
        "preferred_education": ["Design", "Human-Computer Interaction", "Fine Arts"],
        "preferred_certifications": ["Google UX Design Professional Certificate", "Interaction Design Foundation Certificate"],
        "salary_insights": {
            "entry_level": "$60,000 - $80,000",
            "mid_level": "$90,000 - $120,000",
            "senior_level": "$130,000 - $175,000"
        },
        "market_demand": {
            "demand_score": 79,
            "growth_trend": "Stable",
            "industry_adoption": "High in customer-centric applications",
            "future_outlook": "Increasing need for design engineers who understand accessibility, responsive design systems, and user research."
        },
        "growth_potential": "Medium-High",
        "estimated_learning_time": "3 - 6 Months",
        "description": "Design interactive software user experiences, build prototypes, conduct user research, and maintain interface style guides."
    },
    {
        "career_name": "Business Analyst",
        "required_skills": ["SQL", "Excel", "Data Analysis", "Tableau", "Agile", "Process Mapping", "Requirements Gathering"],
        "preferred_education": ["Business Analytics", "Information Systems", "Finance"],
        "preferred_certifications": ["IIBA Certified Business Analysis Professional (CBAP)", "PMI-PBA"],
        "salary_insights": {
            "entry_level": "$60,000 - $75,000",
            "mid_level": "$80,000 - $105,000",
            "senior_level": "$115,000 - $145,000"
        },
        "market_demand": {
            "demand_score": 81,
            "growth_trend": "Stable",
            "industry_adoption": "Universal in financial and corporate platforms",
            "future_outlook": "Sustained requirement to translate operational business requirements into functional engineering backlogs."
        },
        "growth_potential": "Medium",
        "estimated_learning_time": "3 - 6 Months",
        "description": "Audit business systems and user workflows, gather requirements, map business processes, and coordinate feature releases."
    },
    {
        "career_name": "System Administrator",
        "required_skills": ["Linux", "Bash", "Networking", "Security Policies", "Docker", "SQL", "IAM", "Active Directory"],
        "preferred_education": ["Information Technology", "Computer Networking", "Computer Science"],
        "preferred_certifications": ["CompTIA Network+", "Red Hat Certified System Administrator (RHCSA)"],
        "salary_insights": {
            "entry_level": "$55,000 - $75,000",
            "mid_level": "$80,000 - $110,000",
            "senior_level": "$115,000 - $150,000"
        },
        "market_demand": {
            "demand_score": 75,
            "growth_trend": "Stable",
            "industry_adoption": "Standard in internal corporate infrastructures",
            "future_outlook": "Shift towards cloud system administration and identity systems (IAM) coordination."
        },
        "growth_potential": "Medium",
        "estimated_learning_time": "3 - 6 Months",
        "description": "Deploy, configure, monitor, and troubleshoot server operating systems, storage volumes, and network routing configurations."
    }
]

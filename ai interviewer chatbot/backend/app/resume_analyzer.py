import re

# ==================================================
# Known Skills Database
# ==================================================

KNOWN_SKILLS = {
    # Programming
    "python",
    "java",
    "c",
    "c++",
    "javascript",
    "typescript",

    # Web
    "html",
    "css",
    "bootstrap",
    "tailwind",
    "react",
    "node",
    "nodejs",
    "express",
    "fastapi",
    "flask",
    "django",

    # Database
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "sqlite",

    # AI / ML
    "machine learning",
    "deep learning",
    "artificial intelligence",
    "tensorflow",
    "keras",
    "pytorch",
    "scikit-learn",
    "sklearn",
    "numpy",
    "pandas",
    "opencv",
    "nlp",
    "computer vision",

    # Data
    "excel",
    "power bi",

    # Cloud / DevOps
    "git",
    "github",
    "docker",
    "kubernetes",
    "jenkins",
    "github actions",
    "aws",
    "azure",
    "gcp",
    "linux",

    # APIs
    "rest api",
    "json",
    "jwt",

    # GenAI
    "langchain",
    "openai",
    "huggingface",
    "streamlit",
    "gradio",
}

# ==================================================
# Role Skills
# ==================================================

ROLE_SKILLS = {

    "AI Engineer": {
        "python",
        "machine learning",
        "deep learning",
        "tensorflow",
        "pytorch",
        "numpy",
        "pandas",
        "docker",
        "git",
        "aws",
    },

    "Backend Developer": {
        "python",
        "fastapi",
        "sql",
        "postgresql",
        "docker",
        "git",
        "rest api",
        "json",
    },

    "Data Scientist": {
        "python",
        "pandas",
        "numpy",
        "machine learning",
        "sql",
        "excel",
        "power bi",
    },

    "Frontend Developer": {
        "html",
        "css",
        "javascript",
        "typescript",
        "react",
        "tailwind",
        "git",
    },
}

# ==================================================
# Normalize
# ==================================================

def normalize(text: str):

    text = text.lower()

    text = re.sub(r"\s+", " ", text)

    return text

# ==================================================
# Skill Extraction
# ==================================================

def extract_skills(text: str):

    text = normalize(text)

    found = set()

    for skill in KNOWN_SKILLS:

        if re.search(
            rf"\b{re.escape(skill)}\b",
            text,
        ):
            found.add(skill)

    return sorted(found)
# ==================================================
# ATS Score
# ==================================================

def calculate_ats_score(skills, role):

    required = ROLE_SKILLS.get(role, set())

    if not required:
        return 0

    matched = len(set(skills) & required)

    score = round((matched / len(required)) * 100)

    return score


# ==================================================
# Missing Skills
# ==================================================

def missing_skills(skills, role):

    required = ROLE_SKILLS.get(role, set())

    return sorted(list(required - set(skills)))


# ==================================================
# Resume Sections
# ==================================================

def count_projects(text):

    return len(
        re.findall(
            r"\b(project|developed|built|created|implemented)\b",
            text,
            re.IGNORECASE,
        )
    )


def count_certifications(text):

    return len(
        re.findall(
            r"\b(certification|certificate|certified)\b",
            text,
            re.IGNORECASE,
        )
    )


def has_education(text):

    return bool(
        re.search(
            r"\b(b\.?tech|bachelor|master|degree|university|college)\b",
            text,
            re.IGNORECASE,
        )
    )


# ==================================================
# Strengths
# ==================================================

def strengths(skills):

    if not skills:
        return ["No technical skills detected"]

    return [
        f"Strong knowledge of {skill.title()}"
        for skill in skills[:5]
    ]


# ==================================================
# Weaknesses
# ==================================================

def weaknesses(missing):

    if not missing:
        return ["No major weaknesses found"]

    return [
        f"Learn {skill.title()}"
        for skill in missing[:5]
    ]


# ==================================================
# Recommendations
# ==================================================

def recommendations(missing, projects, certifications):

    tips = []

    for skill in missing[:5]:
        tips.append(
            f"Add experience with {skill.title()}."
        )

    if projects < 2:
        tips.append(
            "Include more real-world projects in your resume."
        )

    if certifications == 0:
        tips.append(
            "Add relevant certifications to improve ATS score."
        )

    if not tips:
        tips.append(
            "Excellent resume. Keep your projects updated."
        )

    return tips
# ==================================================
# Main Resume Analyzer
# ==================================================

def analyze_resume(text: str, role: str):

    # Normalize text
    clean_text = normalize(text)

    # Extract detected skills
    skills = extract_skills(clean_text)

    # ATS score
    ats_score = calculate_ats_score(
        skills,
        role,
    )

    # Missing skills
    missing = missing_skills(
        skills,
        role,
    )

    # Resume analysis
    project_count = count_projects(clean_text)
    certification_count = count_certifications(clean_text)
    education_found = has_education(clean_text)

    # Resume completeness score
    completeness = 0

    if skills:
        completeness += 40

    if project_count > 0:
        completeness += 25

    if education_found:
        completeness += 20

    if certification_count > 0:
        completeness += 15

    overall_score = round((ats_score + completeness) / 2)

    return {
        "role": role,
        "overall_score": overall_score,
        "ats_score": ats_score,
        "resume_completeness": completeness,

        "skills_found": skills,
        "missing_skills": missing,

        "projects_detected": project_count,
        "certifications_detected": certification_count,
        "education_detected": education_found,

        "strengths": strengths(skills),
        "weaknesses": weaknesses(missing),
        "recommendations": recommendations(
            missing,
            project_count,
            certification_count,
        ),
    }
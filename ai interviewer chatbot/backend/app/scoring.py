"""
Shared, real (non-AI-API) rule-based interview answer scoring.

This used to live only inside routers/interview.py, reachable through
/interview/evaluate. The actual live interview flow (routers/session.py,
called by the frontend's Interview.jsx) never used it -- it trusted
scores submitted by the client instead, which meant every answer got the
same hardcoded scores regardless of content.

Pulling this out into its own module lets both routers/interview.py and
routers/session.py call the exact same evaluation logic, so there's one
scoring system instead of two divergent ones.
"""
import re
from typing import Any, Dict, List

STOP_WORDS = {
    "the","a","an","and","or","is","are","was","were","to","of","in","on","for",
    "with","this","that","it","i","you","your","we","our","can","could","would",
    "should","do","does","did","how","what","why","when","where","which","from",
    "as","be","been","being","have","has","had","about","describe","explain",
    "give","tell","please"
}

LOW_QUALITY_ANSWERS = {
    "i dont know", "i don't know", "dont know", "don't know", "idk", "no idea",
    "not sure", "i am not sure", "i'm not sure", "i cannot answer", "i can't answer",
    "cannot answer", "can't answer", "skip", "pass", "nothing", "no", "yes", "ok", "okay"
}

TECHNICAL_TERMS = {
    "python","java","javascript","typescript","sql","algorithm","algorithms","data",
    "structure","structures","model","models","machine","learning","artificial",
    "intelligence","ai","ml","tensorflow","pytorch","classification","classifier",
    "regression","database","api","backend","frontend","fastapi","react","feature",
    "features","training","testing","accuracy","precision","recall","f1","tfidf",
    "tf-idf","vector","vectorization","tokenization","stemming","random","forest",
    "naive","bayes","logistic","complexity","dictionary","list","hash","search",
    "deployment","debug","debugging","error","exception","dataset","preprocessing",
    "pipeline","framework","library","server","client","request","response","http",
    "rest","json","postgresql","mysql","mongodb","numpy","pandas","sklearn","scikit",
    "transformer","embedding","semantic","neural","network","deep","git","github",
    "docker","aws","cloud","memory","time","space","binary","tree","queue","stack","array"
}

HR_KEYWORDS = {
    "yourself","strength","strengths","weakness","weaknesses","motivation",
    "motivated","career","goal","goals","team","teamwork","leadership","conflict",
    "challenge","challenging","internship","hire","company","failure","success",
    "pressure","deadline","communication","collaboration","learn","learned",
    "experience","interested","interest","passion"
}

NORMALIZE_NON_WORD_PATTERN = re.compile(r"[^\w\s'-]")
NORMALIZE_SPACES_PATTERN = re.compile(r"\s+")
EXTRACT_WORDS_PATTERN = re.compile(r"\b[\w'-]+\b")
SENTENCE_SPLIT_PATTERN = re.compile(r"[.!?]+")


def normalize_text(text: str) -> str:
    text = text.lower().strip()
    text = NORMALIZE_NON_WORD_PATTERN.sub(" ", text)
    text = NORMALIZE_SPACES_PATTERN.sub(" ", text)
    return text.strip()


def extract_words(text: str) -> List[str]:
    return EXTRACT_WORDS_PATTERN.findall(text.lower())


def extract_keywords(text: str) -> set:
    words = extract_words(text)
    return {w for w in words if w not in STOP_WORDS and len(w) > 2}


def clamp(value: float, minimum: float = 0, maximum: float = 10) -> float:
    return round(max(minimum, min(maximum, value)), 2)


def detect_question_type(question: str) -> str:
    keywords = extract_keywords(question)
    technical_count = len(keywords.intersection(TECHNICAL_TERMS))
    hr_count = len(keywords.intersection(HR_KEYWORDS))
    question_lower = normalize_text(question)

    hr_phrases = [
        "tell me about yourself", "why should we hire you", "why do you want",
        "what interests you", "your strengths", "your weaknesses", "career goals",
        "work in a team", "handle conflict", "handle pressure", "challenging situation",
        "describe a situation", "what did you learn"
    ]

    if any(phrase in question_lower for phrase in hr_phrases):
        return "hr"
    if technical_count > hr_count:
        return "technical"
    if hr_count > technical_count:
        return "hr"
    return "general"


def is_low_quality_answer(answer: str) -> bool:
    normalized = normalize_text(answer)
    if not normalized or normalized in LOW_QUALITY_ANSWERS:
        return True

    words = extract_words(normalized)
    if len(words) <= 2:
        return True

    low_quality_phrases = [
        "i dont know", "i don't know", "don't know this", "dont know this",
        "no idea", "cannot answer", "can't answer", "not sure about this", "i have no idea"
    ]

    if len(words) <= 12:
        for phrase in low_quality_phrases:
            if phrase in normalized:
                return True
    return False


def calculate_repetition_ratio(answer: str) -> float:
    words = extract_words(answer)
    if not words:
        return 1.0
    useful_words = [word for word in words if word not in STOP_WORDS]
    if not useful_words:
        return 1.0
    return 1 - (len(set(useful_words)) / len(useful_words))


def calculate_relevance(question: str, answer: str, ideal_answer: str = "") -> float:
    question_keywords = extract_keywords(question)
    answer_keywords = extract_keywords(answer)
    ideal_keywords = extract_keywords(ideal_answer)

    if not question_keywords:
        return 5.0

    matches = question_keywords.intersection(answer_keywords)
    relevance = (len(matches) / len(question_keywords)) * 10

    if ideal_keywords:
        ideal_matches = ideal_keywords.intersection(answer_keywords)
        ideal_ratio = len(ideal_matches) / max(len(ideal_keywords), 1)
        relevance = (relevance * 0.7) + (ideal_ratio * 10 * 0.3)

    if len(extract_words(answer)) >= 20 and len(matches) >= 2:
        relevance += 1

    if len(matches) == 0:
        relevance = min(relevance, 1.5)

    return clamp(relevance)


def calculate_technical_score(answer: str, question_type: str) -> float:
    answer_keywords = extract_keywords(answer)
    technical_count = len(answer_keywords.intersection(TECHNICAL_TERMS))
    word_count = len(extract_words(answer))

    if question_type == "hr":
        score = 5.0
        if word_count >= 20: score += 1
        if word_count >= 40: score += 1
        return clamp(score)

    score = technical_count * 1.1
    if technical_count >= 3: score += 1
    if technical_count >= 5: score += 1
    if word_count >= 25: score += 0.5
    if word_count >= 50: score += 0.5
    return clamp(score)


def calculate_communication_score(answer: str) -> float:
    word_count = len(extract_words(answer))
    if word_count < 5: score = 1
    elif word_count < 10: score = 3
    elif word_count < 20: score = 5
    elif word_count < 40: score = 7
    elif word_count < 80: score = 8.5
    else: score = 9

    sentences = [s.strip() for s in SENTENCE_SPLIT_PATTERN.split(answer) if s.strip()]
    if len(sentences) >= 3: score += 0.5

    repetition_ratio = calculate_repetition_ratio(answer)
    if repetition_ratio > 0.50: score -= 2
    elif repetition_ratio > 0.35: score -= 1

    return clamp(score)


def calculate_confidence_score(answer: str) -> float:
    normalized = normalize_text(answer)
    word_count = len(extract_words(answer))

    uncertainty_phrases = ["maybe", "i think", "probably", "not sure", "i guess", "perhaps", "might be", "i don't know", "i dont know"]
    uncertainty_count = sum(normalized.count(p) for p in uncertainty_phrases)

    confident_phrases = ["i implemented", "i developed", "i created", "i built", "i used", "i solved", "i learned", "i improved", "i designed", "i tested", "i analyzed", "my approach"]
    confident_count = sum(1 for p in confident_phrases if p in normalized)

    score = 5.5
    if word_count >= 15: score += 1
    if word_count >= 30: score += 1
    score += min(confident_count * 0.5, 2)
    score -= uncertainty_count * 1.5
    return clamp(score)


def calculate_grammar_score(answer: str) -> float:
    answer = answer.strip()
    if not answer: return 0

    score = 5.0
    if answer[0].isupper(): score += 1
    if answer.endswith((".", "!", "?")): score += 1

    sentences = [s.strip() for s in SENTENCE_SPLIT_PATTERN.split(answer) if s.strip()]
    if len(sentences) >= 2: score += 1
    if len(sentences) >= 4: score += 0.5
    if len(extract_words(answer)) >= 15: score += 0.5
    return clamp(score)


def generate_feedback(question_type: str, technical: float, communication: float, confidence: float, relevance: float, grammar: float, overall: float) -> str:
    feedback = []
    if relevance < 3:
        feedback.append("Your answer does not directly address the interview question.")
    elif relevance < 6:
        feedback.append("Your answer is partially relevant but should focus more on the question.")
    else:
        feedback.append("Your answer is relevant to the interview question.")

    if question_type == "technical":
        if technical < 4: feedback.append("Add more technical concepts, algorithms, tools, and implementation details.")
        elif technical < 7: feedback.append("Your technical explanation is good but can be more detailed.")
        else: feedback.append("You demonstrated good technical knowledge.")

    if question_type == "hr" and communication < 6:
        feedback.append("Use the STAR method (Situation, Task, Action, Result) to structure your answer.")

    if communication < 5: feedback.append("Explain your ideas in a clearer and more structured way.")
    elif communication >= 8: feedback.append("Your communication is clear and easy to follow.")

    if confidence < 5: feedback.append("Avoid uncertain phrases like 'maybe' or 'I think'.")
    elif confidence >= 8: feedback.append("Your answer sounds confident.")

    if grammar < 6: feedback.append("Improve grammar and sentence structure.")

    if overall >= 9: feedback.append("Excellent interview answer.")
    elif overall >= 8: feedback.append("Very good answer. Add one real project example to make it even stronger.")
    elif overall >= 6: feedback.append("Good answer, but explain your implementation in greater detail.")
    elif overall >= 4: feedback.append("Your answer needs more depth and practical examples.")
    else: feedback.append("The answer needs significant improvement. Explain your approach step by step and include a practical example.")

    return " ".join(feedback)


def calculate_scores(question: str, answer: str, ideal_answer: str = "") -> Dict[str, Any]:
    if is_low_quality_answer(answer):
        return {
            "technical": 0.5, "communication": 1.5, "confidence": 1.0, "relevance": 0.0,
            "grammar": 3.0, "overall": 1.05,
            "feedback": "The answer does not address the interview question. Provide a direct answer, explain your approach, describe the implementation, and include the final result."
        }

    question_type = detect_question_type(question)
    technical = calculate_technical_score(answer, question_type)
    communication = calculate_communication_score(answer)
    confidence = calculate_confidence_score(answer)
    grammar = calculate_grammar_score(answer)
    relevance = calculate_relevance(question, answer, ideal_answer)

    if question_type == "technical":
        overall = (technical * 0.40) + (communication * 0.15) + (relevance * 0.25) + (confidence * 0.10) + (grammar * 0.10)
    elif question_type == "hr":
        overall = (technical * 0.10) + (communication * 0.30) + (relevance * 0.30) + (confidence * 0.20) + (grammar * 0.10)
    else:
        overall = (technical * 0.25) + (communication * 0.25) + (relevance * 0.25) + (confidence * 0.15) + (grammar * 0.10)

    if relevance < 2: overall = min(overall, 3.0)
    elif relevance < 4: overall = min(overall, 5.0)

    overall = clamp(overall)
    feedback = generate_feedback(question_type, technical, communication, confidence, relevance, grammar, overall)

    return {
        "technical": technical, "communication": communication, "confidence": confidence,
        "relevance": relevance, "grammar": grammar, "overall": overall, "feedback": feedback
    }

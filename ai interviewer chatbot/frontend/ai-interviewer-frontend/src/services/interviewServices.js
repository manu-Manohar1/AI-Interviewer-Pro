import api from "../api/api";

/**
 * STEP 1: Create new session & receive Question 1
 */
export const createInterviewSession = async (sessionData) => {
  const response = await api.post("/session/create", {
    role: sessionData.role || "Software Engineer",
    company: sessionData.company || "General",
    difficulty: sessionData.difficulty || "Medium",
    total_questions: sessionData.total_questions || 5,
  });
  return response.data;
};

/**
 * STEP 2: Submit current question's answer & receive feedback + next question
 */
export const submitSessionAnswer = async (sessionId, answerPayload) => {
  const response = await api.post(`/session/${sessionId}/answer`, {
    user_id: answerPayload.user_id || 1,
    question: answerPayload.question,
    answer: answerPayload.answer,
    technical_score: answerPayload.technical_score ?? 8.5,
    communication_score: answerPayload.communication_score ?? 8.0,
    confidence_score: answerPayload.confidence_score ?? 8.0,
    relevance_score: answerPayload.relevance_score ?? 8.5,
    grammar_score: answerPayload.grammar_score ?? 9.0,
    overall_score: answerPayload.overall_score ?? 8.5,
    feedback_text: answerPayload.feedback_text || "Good response.",
  });
  return response.data;
};

/**
 * STEP 3: Fetch all past sessions for a user
 */
export const getUserSessions = async (userId = 1) => {
  const response = await api.get(`/session/user/${userId}`);
  return response.data;
};

/**
 * STEP 4: Fetch detailed result of a specific session
 */
export const getSessionDetails = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}`);
  return response.data;
};
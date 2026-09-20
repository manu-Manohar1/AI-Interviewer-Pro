import api from "../api/api";

/**
 * STEP 1: Create new session & receive Question 1.
 * The backend derives the owner from the logged-in user's token -- it
 * never accepts a user_id from the client.
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
 * STEP 2: Submit current question's answer & receive feedback + next question.
 *
 * We only ever send the question and the answer text. Scores are computed
 * server-side (app/scoring.py, run inside routers/session.py) from the
 * actual answer content -- they are never supplied by the client. Sending
 * score fields here would do nothing (the backend ignores anything besides
 * question/answer), so we don't pretend to compute them client-side.
 */
export const submitSessionAnswer = async (sessionId, answerPayload) => {
  const response = await api.post(`/session/${sessionId}/answer`, {
    question: answerPayload.question,
    answer: answerPayload.answer,
  });
  return response.data;
};

/**
 * STEP 3: Fetch all past sessions for the current user.
 * userId must be the logged-in user's own id (the backend 403s otherwise) --
 * get it from /auth/me, never hardcode it.
 */
export const getUserSessions = async (userId) => {
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

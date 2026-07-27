import { useEffect, useRef, useState, useCallback } from "react";
import Confetti from "react-confetti";
import api from "../api/api";
import { createInterviewSession, submitSessionAnswer } from "../services/interviewServices";

import CurrentQuestionPanel from "../components/CurrentQuestionPanel";
import ChatConversation from "../components/ChatConversation";
import InterviewControls from "../components/InterviewControls";
import InterviewSidebar from "../components/InterviewSidebar";
import LiveAnalysisPanel from "../components/LiveAnalysisPanel";
import LiveTranscript from "../components/LiveTranscript";
import EmotionDetector from "../components/EmotionDetector";
import AICoach from "../components/AICoach";
import LiveCamera from "../components/LiveCamera";
import EyeContactDetector from "../components/EyeContactDetector";

import { motion, AnimatePresence } from "framer-motion";
import { useWindowSize } from "react-use";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

export default function Interview() {
  // =========================
  // Settings & Session State
  // =========================
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [company, setCompany] = useState("Google");
  const [round, setRound] = useState("Technical");

  const { width, height } = useWindowSize();
  const [sessionId, setSessionId] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [eyeContact, setEyeContact] = useState(100);

  // Timer
  const QUESTION_TIME = 120;
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  // Metrics
  const [transcripts, setTranscripts] = useState({});
  const [scores, setScores] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [, setFillerCounts] = useState({});

  // Recording
  const [recording, setRecording] = useState(false);
  const [interviewState, setInterviewState] = useState("idle");

  const mediaRecorder = useRef(null);
  const microphoneStream = useRef(null);
  const audioChunks = useRef([]);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // =========================
  // Stop Recording with Resource Release
  // =========================
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore inactive state
      }
      recognitionRef.current = null;
    }

    if (
      mediaRecorder.current &&
      mediaRecorder.current.state !== "inactive"
    ) {
      mediaRecorder.current.stop();
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (microphoneStream.current) {
      microphoneStream.current.getTracks().forEach((track) => track.stop());
      microphoneStream.current = null;
    }

    analyserRef.current = null;
    setRecording(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  // Speak Question
  const speakQuestion = useCallback(() => {
    if (!currentQuestionText || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(currentQuestionText);
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    speech.onstart = () => {
      setSpeaking(true);
      setInterviewState("speaking");
    };

    speech.onend = () => {
      setSpeaking(false);
      setInterviewState((prev) => (prev === "recording" ? "listening" : "idle"));
    };

    window.speechSynthesis.speak(speech);
  }, [currentQuestionText]);

  // Timer Effect
  useEffect(() => {
    if (!interviewStarted || interviewCompleted || !currentQuestionText) return;

    if (timeLeft <= 0) {
      if (recording) {
        stopRecording();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [
    interviewStarted,
    interviewCompleted,
    currentQuestionText,
    timeLeft,
    recording,
    stopRecording,
  ]);

  // Submit Answer Action
  const evaluateAnswer = useCallback(
    async (answerOverride = null) => {
      try {
        if (!sessionId || !currentQuestionText) return;

        const answerToSubmit = answerOverride ?? currentAnswer ?? "";

        if (!answerToSubmit.trim()) {
          alert("Please enter or record an answer.");
          return;
        }

        setInterviewState("evaluating");

        const resData = await submitSessionAnswer(sessionId, {
          user_id: 1,
          question: currentQuestionText,
          answer: answerToSubmit,
          technical_score: 8.5,
          communication_score: 9.0,
          confidence_score: 8.0,
          relevance_score: 9.0,
          grammar_score: 9.5,
          overall_score: 8.8,
          feedback_text: "Clear, concise, and structured answer.",
        });

        const currentScore = resData.evaluation.overall_score;
        const currentFeedback = resData.evaluation.feedback_text;

        setScores((prev) => ({
          ...prev,
          [questionNumber]: currentScore,
        }));

        setFeedbacks((prev) => ({
          ...prev,
          [questionNumber]: currentFeedback,
        }));

        setInterviewState("idle");

        setTimeout(() => {
          if (resData.is_completed) {
            setInterviewCompleted(true);
            setInterviewStarted(false);
            setInterviewState("completed");
          } else if (resData.next_question) {
            setQuestionNumber(resData.question_number);
            setCurrentQuestionText(resData.next_question);
            setCurrentAnswer("");
            setTimeLeft(QUESTION_TIME);
          }
        }, 1500);
      } catch (err) {
        console.error(err.response?.data || err);
        setInterviewState("idle");
      }
    },
    [sessionId, currentQuestionText, currentAnswer, questionNumber, QUESTION_TIME]
  );

  // Start Audio Recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      source.connect(analyser);
      analyser.fftSize = 64;

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneStream.current = stream;

      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("file", audioBlob, "answer.webm");

        setInterviewState("transcribing");

        try {
          const res = await api.post("/transcribe/whisper", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          const transcript = res.data.text || "";

          setTranscripts((prev) => ({
            ...prev,
            [questionNumber]: transcript,
          }));

          setFillerCounts((prev) => ({
            ...prev,
            [questionNumber]: res.data.filler_word_count ?? 0,
          }));

          setCurrentAnswer(transcript);
          await evaluateAnswer(transcript);
        } catch (err) {
          console.error(err.response?.data || err);
          setInterviewState("idle");
        }
      };

      mediaRecorder.current.start();
      setRecording(true);
      setInterviewState("listening");

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onend = () => {
          if (
            mediaRecorder.current &&
            mediaRecorder.current.state === "recording"
          ) {
            stopRecording();
          }
        };

        recognitionRef.current.start();
      }
    } catch (err) {
      console.error("Recording Error:", err);
    }
  }, [questionNumber, evaluateAnswer, stopRecording]);

  // Question Speech Trigger
  useEffect(() => {
    if (!currentQuestionText || !interviewStarted) return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(currentQuestionText);
      speech.rate = 1;
      speech.pitch = 1;
      speech.volume = 1;

      speech.onstart = () => {
        setSpeaking(true);
        setInterviewState("speaking");
      };

      speech.onend = () => {
        setSpeaking(false);
        setInterviewState("listening");
        startRecording();
      };

      window.speechSynthesis.speak(speech);
    }

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [currentQuestionText, interviewStarted, startRecording]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const startInterview = async () => {
    try {
      const data = await createInterviewSession({
        role,
        company,
        difficulty,
        total_questions: 5,
      });

      setSessionId(data.session_id);
      setQuestionNumber(data.question_number);
      setCurrentQuestionText(data.question);
      setCurrentAnswer("");
      setTimeLeft(QUESTION_TIME);

      setTranscripts({});
      setScores({});
      setFeedbacks({});
      setFillerCounts({});

      setInterviewStarted(true);
      setInterviewCompleted(false);
      setInterviewState("speaking");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to create interview session.");
    }
  };

  const restartInterview = () => {
    stopRecording();
    setSessionId(null);
    setQuestionNumber(1);
    setCurrentQuestionText("");
    setCurrentAnswer("");
    setInterviewStarted(false);
    setInterviewCompleted(false);
    setTimeLeft(QUESTION_TIME);
    setTranscripts({});
    setScores({});
    setFeedbacks({});
    setFillerCounts({});
    setInterviewState("idle");
  };

  // Score Animation
  const scoreValues = Object.values(scores);
  const finalScore =
    scoreValues.length > 0
      ? (
          scoreValues.reduce((total, score) => total + Number(score), 0) /
          scoreValues.length
        ).toFixed(2)
      : "0.00";

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!interviewCompleted) return;

    let current = 0;
    const target = Number(finalScore);

    const timer = setInterval(() => {
      current += 0.2;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      setAnimatedScore(current);
    }, 20);

    return () => clearInterval(timer);
  }, [interviewCompleted, finalScore]);

  const currentTranscript = transcripts[questionNumber] || "";
  const wordCount = currentTranscript.trim().split(/\s+/).filter(Boolean).length;
  const elapsedSeconds = QUESTION_TIME - timeLeft;
  const speakingSpeed =
    elapsedSeconds > 0 ? Math.round((wordCount / elapsedSeconds) * 60) : 0;

  // Completed Screen
  if (interviewCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-black relative overflow-hidden">
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={300}
          gravity={0.25}
        />

        <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative max-w-xl w-full mx-6 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl p-8 text-center transform-gpu"
        >
          <div className="text-7xl mb-2">🏆</div>
          <h1 className="text-3xl font-extrabold text-white">
            Interview Completed
          </h1>
          <p className="text-gray-300 mt-2 text-xs">
            Your performance analysis has been evaluated!
          </p>

          <div className="mt-6">
            <div className="text-6xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {animatedScore.toFixed(2)}
            </div>
            <p className="text-xs font-semibold text-gray-400 mt-1">Overall Score / 10</p>
          </div>

          <div className="mt-6">
            <span className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
              {Number(finalScore) >= 8
                ? "🌟 Excellent Performance"
                : Number(finalScore) >= 6
                ? "👍 Good Performance"
                : "💪 Keep Practicing"}
            </span>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={restartInterview}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
            >
              🔄 Restart Session
            </button>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 font-bold text-xs text-white transition-all active:scale-95"
            >
              📊 Go to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[100px]"></div>
        <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]"></div>
      </div>

      <div className="max-w-[1850px] mx-auto px-6 py-6">
        {/* Header Banner */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-5 shadow-xl mb-6 border border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* AI Avatar Icon with Glow Effect */}
              <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 blur-md opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center border border-white/20 shadow-lg overflow-hidden">
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=InterviewerPro&backgroundColor=b6e3f4"
                    alt="AI Avatar"
                    className="w-10 h-10 object-contain transform group-hover:scale-110 transition duration-300"
                  />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                  AI Interviewer Pro
                </h1>
                <p className="text-xs text-gray-400">
                  Professional Technical Interview Room
                </p>
              </div>
            </div>

            {interviewStarted && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16">
                  <CircularProgressbar
                    value={(timeLeft / QUESTION_TIME) * 100}
                    text={formatTime(timeLeft)}
                    styles={buildStyles({
                      textSize: "18px",
                      pathColor: "#06b6d4",
                      textColor: "#ffffff",
                      trailColor: "#1e293b",
                    })}
                  />
                </div>
                <div>
                  <div className="text-cyan-400 font-bold text-xs flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" /> LIVE
                  </div>
                  <div className="text-gray-400 text-xs">Interview Active</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Setup Form vs Live Interview Grid */}
        {!interviewStarted ? (
          <div className="max-w-2xl mx-auto bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 space-y-6 transform-gpu">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Start Practice Session
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Target Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Meta">Meta</option>
                  <option value="Apple">Apple</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Interview Round</label>
                <select
                  value={round}
                  onChange={(e) => setRound(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="Technical">Technical</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral">Behavioral</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Python Developer">Python Developer</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <button
              onClick={startInterview}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-[0.99]"
            >
              🚀 Start AI Interview
            </button>
          </div>
        ) : (
          <div className="grid xl:grid-cols-12 gap-5 items-start">
            {/* LEFT SIDEBAR */}
            <div className="xl:col-span-3 space-y-4">
              <InterviewSidebar
                speaking={speaking}
                recording={recording}
                interviewState={interviewState}
              />
              <LiveCamera webcamRef={webcamRef} />
              <AICoach
                confidence={75}
                eyeContact={eyeContact}
                speakingSpeed={speakingSpeed}
                recording={recording}
              />
            </div>

            {/* CENTER PANEL */}
            <div className="xl:col-span-6 space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={questionNumber}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="will-change-transform transform-gpu"
                >
                  <CurrentQuestionPanel
                    question={currentQuestionText}
                    questionNo={questionNumber}
                    total={5}
                    company={company}
                    role={role}
                    difficulty={difficulty}
                    round={round}
                    interviewState={interviewState}
                  />
                </motion.div>
              </AnimatePresence>

              <button
                onClick={speakQuestion}
                className="w-full py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-cyan-400 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                🔊 Repeat Question Audio
              </button>

              <LiveTranscript
                transcript={transcripts[questionNumber]}
                recording={recording}
              />

              <ChatConversation
                question={currentQuestionText}
                answer={currentAnswer}
              />

              <textarea
                rows={4}
                className="w-full rounded-2xl bg-black/40 border border-white/10 text-white p-4 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/50 placeholder-gray-500 transition-all"
                placeholder="Type your answer or speak using the microphone..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                disabled={scores[questionNumber] !== undefined}
              />

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => evaluateAnswer()}
                  disabled={scores[questionNumber] !== undefined || recording}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-40 active:scale-95"
                >
                  Submit Answer
                </button>

                {!recording ? (
                  <button
                    onClick={startRecording}
                    disabled={scores[questionNumber] !== undefined}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40 active:scale-95"
                  >
                    🎤 Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all active:scale-95"
                  >
                    ⏹ Stop Recording
                  </button>
                )}
              </div>

              {/* AI Evaluation Result */}
              {scores[questionNumber] !== undefined && (
                <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-cyan-500/30 shadow-2xl p-6 space-y-3 transform-gpu">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    🧠 AI Evaluation
                  </h2>
                  <p className="text-4xl font-extrabold text-cyan-400">
                    {scores[questionNumber]} / 10
                  </p>

                  <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mt-3">Feedback</h3>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {feedbacks[questionNumber] || "No feedback available."}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="xl:col-span-3 space-y-4">
              <LiveAnalysisPanel
                timeLeft={timeLeft}
                totalTime={QUESTION_TIME}
                recording={recording}
                confidence={
                  scores[questionNumber]
                    ? Math.min(100, Math.round(scores[questionNumber] * 10))
                    : 50
                }
                speakingSpeed={speakingSpeed}
              />

              <EyeContactDetector
                webcamRef={webcamRef}
                onEyeContactChange={setEyeContact}
              />
              <EmotionDetector />

              <InterviewControls
                recording={recording}
                onStart={startRecording}
                onStop={stopRecording}
                onNext={() => evaluateAnswer()}
                onEnd={() => setInterviewCompleted(true)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
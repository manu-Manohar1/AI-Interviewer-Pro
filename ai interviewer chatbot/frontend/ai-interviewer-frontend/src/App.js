import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeUpload from "./pages/Resumeupload";
import Questions from "./pages/Questions";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import History from "./pages/History";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Settings from "./pages/Settings";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/resume" element={<ResumeUpload />} />

        <Route
          path="/resume-analyzer"
          element={<ResumeAnalyzer />}
        />

        <Route path="/questions" element={<Questions />} />

        <Route path="/interview" element={<Interview />} />

        <Route path="/results" element={<Results />} />

        <Route path="/history" element={<History />} />
        <Route
  path="/resume-analyzer"
  element={<ResumeAnalyzer />}
/>
<Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
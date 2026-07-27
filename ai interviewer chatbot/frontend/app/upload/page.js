'use client';

import { useState } from 'react';

export default function UploadPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const [selectedRole, setSelectedRole] = useState(
    'AI/ML Engineer'
  );

  const [selectedDifficulty, setSelectedDifficulty] = useState(
    'Intermediate'
  );

  const [selectedCompany, setSelectedCompany] = useState(
    'General'
  );

  // -------------------------
  // REGISTER
  // -------------------------

  async function register() {
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert('Registered: ' + data.email);
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed');
    }
  }

  // -------------------------
  // LOGIN
  // -------------------------

  async function login() {
    try {
      const res = await fetch(
        'http://127.0.0.1:8000/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setToken(data.access_token);

        localStorage.setItem(
          'token',
          data.access_token
        );

        alert('Login successful');
      } else {
        alert(JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  }

  // -------------------------
  // UPLOAD RESUME
  // -------------------------

  async function upload() {
    if (!file) {
      alert('Choose a file');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      fd.append('file', file);

      const authToken =
        token || localStorage.getItem('token');

      const res = await fetch(
        'http://127.0.0.1:8000/resume/upload',
        {
          method: 'POST',
          headers: authToken
            ? {
                Authorization:
                  'Bearer ' + authToken,
              }
            : {},
          body: fd,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(JSON.stringify(data));
        return;
      }

      setResult(data);

      // Clear old questions
      setQuestions(null);

      alert('Resume uploaded successfully');
    } catch (error) {
      console.error(error);

      alert('Resume upload failed');
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // GENERATE QUESTIONS
  // -------------------------

  async function generateQuestions() {
    if (!result) {
      alert('Upload a resume first');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        role: selectedRole,
        difficulty: selectedDifficulty,
        skills: result.skills || [],
        projects: result.projects || [],
        company:
          selectedCompany === 'General'
            ? null
            : selectedCompany,
      };

      const authToken =
        token || localStorage.getItem('token');

      const res = await fetch(
        'http://127.0.0.1:8000/questions/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',

            ...(authToken
              ? {
                  Authorization:
                    'Bearer ' + authToken,
                }
              : {}),
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error(data);

        alert(
          'Question generation failed: ' +
            JSON.stringify(data)
        );

        return;
      }

      setQuestions(
        Array.isArray(data)
          ? data
          : data.questions || []
      );

      alert('Questions generated successfully');
    } catch (error) {
      console.error(error);

      alert('Question generation failed');
    } finally {
      setLoading(false);
    }
  }

  // -------------------------
  // UI
  // -------------------------

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">
        Upload Resume
      </h1>

      {/* LOGIN */}

      <div className="mb-4 flex flex-wrap gap-2">
        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border px-2 py-1"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border px-2 py-1"
        />

        <button
          onClick={register}
          className="px-3 py-1 bg-slate-700 text-white"
        >
          Register
        </button>

        <button
          onClick={login}
          className="px-3 py-1 bg-cyan-600 text-white"
        >
          Login
        </button>
      </div>

      {/* INTERVIEW OPTIONS */}

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={selectedRole}
          onChange={(e) =>
            setSelectedRole(e.target.value)
          }
          className="border px-2 py-1"
        >
          <option>AI/ML Engineer</option>
          <option>Python Developer</option>
          <option>Java Developer</option>
          <option>Data Analyst</option>
          <option>Web Developer</option>
          <option>HR Interview</option>
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) =>
            setSelectedDifficulty(e.target.value)
          }
          className="border px-2 py-1"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>

        <select
          value={selectedCompany}
          onChange={(e) =>
            setSelectedCompany(e.target.value)
          }
          className="border px-2 py-1"
        >
          <option>General</option>
          <option>Google</option>
          <option>Microsoft</option>
          <option>Amazon</option>
          <option>TCS</option>
          <option>Infosys</option>
        </select>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        <button
          onClick={upload}
          disabled={loading}
          className="px-3 py-1 bg-green-600 text-white"
        >
          {loading
            ? 'Processing...'
            : 'Upload'}
        </button>

        <button
          onClick={generateQuestions}
          disabled={loading}
          className="px-3 py-1 bg-indigo-600 text-white"
        >
          Generate Questions
        </button>
      </div>

      {/* PARSED RESUME */}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-medium">
            Parsed Result
          </h2>

          <div className="mt-2">
            <strong>Skills:</strong>

            <pre className="bg-slate-800 text-white p-3 rounded mt-1 whitespace-pre-wrap">
              {JSON.stringify(
                result.skills,
                null,
                2
              )}
            </pre>

            <strong>Projects:</strong>

            <pre className="bg-slate-800 text-white p-3 rounded mt-1 whitespace-pre-wrap">
              {JSON.stringify(
                result.projects,
                null,
                2
              )}
            </pre>

            <strong>Education:</strong>

            <pre className="bg-slate-800 text-white p-3 rounded mt-1 whitespace-pre-wrap">
              {JSON.stringify(
                result.education,
                null,
                2
              )}
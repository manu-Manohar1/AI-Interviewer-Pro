'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Unable to reach backend.'));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8 text-center">
      <h1 className="text-4xl font-semibold">AI Interviewer Pro</h1>
      <p className="max-w-xl text-lg text-slate-300">
        This frontend page is calling the FastAPI backend successfully.
      </p>
      <div className="rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-4 shadow-lg">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Backend response</p>
        <p className="mt-2 text-xl font-medium text-cyan-400">{message}</p>
      </div>
    </main>
  );
}

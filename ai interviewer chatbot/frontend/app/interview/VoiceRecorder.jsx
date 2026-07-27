'use client';

import React, { useRef, useState } from 'react';

export default function VoiceRecorder({ onTranscription, readAloudText }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [highlightedTranscript, setHighlightedTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      const fd = new FormData();
      fd.append('file', blob, 'recording.webm');

      try {
        const res = await fetch('/transcribe/whisper', {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
        const data = await res.json();
        const nextTranscript = data.text || '';
        setTranscript(nextTranscript);
        setFillerWordCount(data.filler_word_count || 0);
        setHighlightedTranscript(data.highlighted_transcript || nextTranscript);
        if (onTranscription) onTranscription(nextTranscript);
      } catch (err) {
        console.error('Transcription error', err);
      }
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const playRecording = () => {
    if (audioUrl) new Audio(audioUrl).play();
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {!recording ? (
          <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={startRecording}>Start Recording</button>
        ) : (
          <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={stopRecording}>Stop</button>
        )}
        <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={playRecording} disabled={!audioUrl}>Play</button>
        <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={() => speak(readAloudText || '')} disabled={!readAloudText}>Read Question</button>
      </div>

      <div>
        <label className="block text-sm text-slate-400">Transcription</label>
        <textarea className="w-full mt-1 p-2 bg-slate-800 text-white rounded" rows={4} value={transcript} readOnly />
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-sm text-slate-400">Filler word analysis</label>
          <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
            {fillerWordCount} filler {fillerWordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
        <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200" dangerouslySetInnerHTML={{ __html: highlightedTranscript || transcript || 'No transcript yet.' }} />
      </div>
    </div>
  );
}

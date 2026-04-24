import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- CONFIGURATION ---
const RING_CONFIG = {
  baseRadius: 95,
  numPoints: 180,
  idleWaveAmplitude: 2.5,
  idleSpeed: 0.025,
  speakWaveScale: 18,
  lineWidth: 6,
  lineWidthBoost: 4,
  glowBase: 12,
  glowBoost: 20,
  glowColor: 'rgba(168, 85, 247, 0.6)',
  gradientSpeed: 0.008,
  gradientColors: [
    [0.00, '#ff006e'], [0.15, '#ff6b35'], [0.30, '#ffbe0b'],
    [0.45, '#06d6a0'], [0.60, '#0096ff'], [0.75, '#7b2fff'],
    [0.90, '#e040fb'], [1.00, '#ff006e'],
  ],
  freqBandFraction: 0.6,
};

const DEMO_TEXT = "I noticed you've made 4 payments to Stake Casino totalling €240 this month — that's 18% of your budget. This kind of pattern is worth watching. Want me to set a soft spending limit?";

const DEMO_SCRIPT = [
  { t: 0, text: "Hey! I noticed something in your spending this month I want to flag up." },
  { t: 3.5, text: "You've made <span class='highlight'>4 payments to Stake Casino</span> totalling €240 — that's 18% of your monthly budget." },
  { t: 8, text: "This pattern can sneak up on you. Want me to set a <span style='color:#86efac;font-weight:500'>soft limit</span> on gambling transactions?" },
];

const CHAT_RESPONSES = [
  "Looking at your last 3 months, you've spent €680 on gambling. I'd recommend a €50/month limit.",
  "I can set up a spending alert — you'll get notified before you hit 80% of your gambling budget.",
  "No worries, it's just a suggestion. I'll keep an eye on it and let you know if the pattern continues.",
  "Absolutely — you can always adjust or remove any limits I set. You're in full control.",
  "Based on your income and fixed expenses, you have about €320 in discretionary spending this month.",
];

export default function App() {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'speaking' | 'listening'
  const [chatOpen, setChatOpen] = useState(false);
  const [fileName, setFileName] = useState('No file loaded');
  const [speechHtml, setSpeechHtml] = useState(`Tap <strong style="color:rgba(255,255,255,0.9)">Play Demo</strong> to hear Finq's analysis, or upload your own audio file below.`);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'finq', text: "I noticed a pattern in your casino spending this month. Want to talk through it?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Refs for Animation & Audio
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const chatBottomRef = useRef(null);
  
  // Audio context refs (keep outside state to avoid re-renders)
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const isPlayingRef = useRef(false); // Track playing state for the animation loop
  const timeoutRefs = useRef([]);

  // Variables for canvas loop
  const loopVars = useRef({ idlePhase: 0, gradPhase: 0, responseIdx: 0 });

  // Initialize Canvas & Start Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 240;
    
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let animFrame;

    const drawRing = (amplitude) => {
      const cx = size / 2;
      const cy = size / 2;
      const cfg = RING_CONFIG;
      const { idlePhase, gradPhase } = loopVars.current;

      ctx.clearRect(0, 0, size, size);

      const points = [];
      for (let i = 0; i < cfg.numPoints; i++) {
        const angle = (i / cfg.numPoints) * Math.PI * 2;
        let bump = 0;

        if (analyserRef.current && dataArrayRef.current && isPlayingRef.current) {
          const freqIdx = Math.floor((i / cfg.numPoints) * (dataArrayRef.current.length * cfg.freqBandFraction));
          const freqVal = dataArrayRef.current[freqIdx] / 255;
          bump = freqVal * amplitude * cfg.speakWaveScale;
        } else {
          const w1 = Math.sin(angle * 3 + idlePhase) * cfg.idleWaveAmplitude;
          const w2 = Math.sin(angle * 5 - idlePhase * 1.3) * (cfg.idleWaveAmplitude * 0.6);
          bump = (w1 + w2) * (0.3 + amplitude * 0.7);
        }

        const r = cfg.baseRadius + bump;
        points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      }

      const grad = ctx.createConicGradient(gradPhase, cx, cy);
      cfg.gradientColors.forEach(([stop, color]) => grad.addColorStop(stop, color));

      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const prev = points[i === 0 ? points.length - 1 : i - 1];
        const mx = (prev.x + p.x) / 2;
        const my = (prev.y + p.y) / 2;
        if (i === 0) ctx.moveTo(mx, my);
        else ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
      }
      ctx.closePath();

      ctx.strokeStyle = grad;
      ctx.lineWidth = cfg.lineWidth + amplitude * cfg.lineWidthBoost;
      ctx.lineCap = 'round';
      ctx.shadowColor = cfg.glowColor;
      ctx.shadowBlur = cfg.glowBase + amplitude * cfg.glowBoost;
      ctx.stroke();
      ctx.shadowBlur = 0; 

      ctx.beginPath();
      ctx.arc(cx, cy, cfg.baseRadius - 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawWaveformBars = (amplitude) => {
      if (!waveformRef.current) return;
      const bars = waveformRef.current.children;
      const { idlePhase } = loopVars.current;

      for (let i = 0; i < bars.length; i++) {
        let h;
        if (analyserRef.current && dataArrayRef.current && isPlayingRef.current) {
          const idx = Math.floor((i / bars.length) * dataArrayRef.current.length * 0.5);
          h = 4 + (dataArrayRef.current[idx] / 255) * 40;
        } else {
          h = 4 + Math.abs(Math.sin(idlePhase * 2 + i * 0.4)) * amplitude * 20;
        }
        bars[i].style.height = `${h}px`;
        bars[i].style.opacity = 0.4 + amplitude * 0.6;
      }
    };

    const animate = () => {
      loopVars.current.idlePhase += RING_CONFIG.idleSpeed;
      loopVars.current.gradPhase += RING_CONFIG.gradientSpeed;

      let amplitude = 0;
      if (analyserRef.current && dataArrayRef.current && isPlayingRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const avg = dataArrayRef.current.reduce((a, b) => a + b, 0) / dataArrayRef.current.length;
        amplitude = avg / 128;
      } else {
        amplitude = 0.15 + Math.sin(loopVars.current.idlePhase * 0.7) * 0.08;
      }

      drawRing(amplitude);
      drawWaveformBars(amplitude);
      animFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Update sync ref when state changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);


  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const setupAudioContext = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    
    if (!analyserRef.current) {
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch (e) {}
    }
    
    sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
    sourceNodeRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioCtxRef.current.destination);
  };

  const runFakeDemo = () => {
    let i = 0;
    setSpeechHtml('');
    setIsTyping(true);

    const t1 = setTimeout(() => {
      setIsTyping(false);
      setSpeechHtml('');

      const interval = setInterval(() => {
        if (!isPlayingRef.current) {
          clearInterval(interval);
          return;
        }
        i = Math.min(i + 2, DEMO_TEXT.length);
        const raw = DEMO_TEXT.slice(0, i);
        setSpeechHtml(
          raw
            .replace('€240', "<span class='highlight'>€240</span>")
            .replace('18% of your budget', "<span style='color:#fbbf24;font-weight:500'>18% of your budget</span>")
            .replace('soft spending limit', "<span style='color:#86efac;font-weight:500'>soft spending limit</span>")
        );
        if (i >= DEMO_TEXT.length) clearInterval(interval);
      }, 30);

      const t2 = setTimeout(() => {
        if (isPlayingRef.current) stopAudio();
      }, DEMO_TEXT.length * 30 + 1500);
      timeoutRefs.current.push(t2);

    }, 1200);
    timeoutRefs.current.push(t1);
  };

  const runScriptedText = () => {
    DEMO_SCRIPT.forEach(item => {
      const t = setTimeout(() => {
        if (!isPlayingRef.current) return;
        setSpeechHtml(item.text);
      }, item.t * 1000);
      timeoutRefs.current.push(t);
    });
  };

  const togglePlay = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsPlaying(true);
    setStatus('speaking');
    clearAllTimeouts();

    const audioEl = audioRef.current;

    if (audioEl.src && !audioEl.src.endsWith(window.location.href)) {
      try {
        await setupAudioContext();
        runScriptedText();
        audioEl.currentTime = 0;
        await audioEl.play();
        audioEl.onended = stopAudio;
      } catch (e) {
        console.warn('Audio playback failed, running fake demo:', e);
        runFakeDemo();
      }
    } else {
      runFakeDemo();
    }
  };

  const stopAudio = () => {
    setIsPlaying(false);
    setStatus('idle');
    setIsTyping(false);
    clearAllTimeouts();
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setSpeechHtml(`Tap <strong style="color:rgba(255,255,255,0.9)">Play Demo</strong> to hear Finq's analysis, or upload your own audio file below.`);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    
    const url = URL.createObjectURL(file);
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.disconnect(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    audioRef.current.src = url;
  };

  const sendMsg = () => {
    const msg = chatInput.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { sender: 'user', text: msg }]);
    setChatInput('');
    setStatus('listening');

    setTimeout(() => {
      setStatus('speaking');
      setTimeout(() => {
        const reply = CHAT_RESPONSES[loopVars.current.responseIdx % CHAT_RESPONSES.length];
        loopVars.current.responseIdx++;
        setMessages(prev => [...prev, { sender: 'finq', text: reply }]);
        setStatus('idle');
      }, 1000);
    }, 300);
  };

  return (
    <div className="finq-container">
      <div className="bg-glow"></div>

      <div className="screen">
        <div className="notif-bar" onClick={() => !isPlaying && togglePlay()}>
          <div className="notif-dot"></div>
          <div className="notif-text">
            <strong>Finq spotted something</strong><br/>
            Tap to hear what your advisor thinks about this purchase
          </div>
          <div className="notif-chevron">›</div>
        </div>

        <div className="avatar-wrap">
          <canvas ref={canvasRef} className="ring-canvas"></canvas>
          <div className="avatar-inner">
            <img className="avatar-face" src="/1776963928795_image.png" alt="Finq Avatar" 
                 onError={(e) => {
                   e.target.style.display='none'; 
                   e.target.parentNode.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:64px;background:#1a0e2e;">🤖</div>';
                 }}/>
          </div>
        </div>

        <div className={`status-pill ${status}`}>
          <div className="status-dot"></div>
          <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        </div>

        <div className="finq-name">Finq</div>
        <div className="finq-sub">Your bunq financial advisor</div>

        <div className="transaction-card">
          <div className="tx-icon">🎰</div>
          <div className="tx-info">
            <div className="tx-name">Stake Casino</div>
            <div className="tx-detail">Today 14:32 · Recurring pattern detected</div>
          </div>
          <div className="tx-amount">-€240</div>
        </div>

        <div className="speech-bubble">
          {isTyping ? (
            <div className="typing-dots">
              <span></span><span></span><span></span>
            </div>
          ) : (
            <div className="speech-text" dangerouslySetInnerHTML={{ __html: speechHtml }}></div>
          )}
        </div>

        <div className="waveform-bar" ref={waveformRef}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="bar"></div>
          ))}
        </div>

        <div className="file-row">
          <span className="file-icon">🎵</span>
          <div className="file-label">
            <strong>{fileName}</strong>
            Upload any audio to drive the ring in real time
          </div>
          <label className="upload-btn" htmlFor="fileInput">Upload</label>
          <input type="file" id="fileInput" accept="audio/*" onChange={handleFileUpload} />
        </div>

        <div className="controls">
          {!isPlaying ? (
            <button className="btn btn-primary" onClick={togglePlay}>
              ▶ {fileName !== 'No file loaded' ? 'Play File' : 'Play Demo'}
            </button>
          ) : (
            <button className="btn btn-danger" onClick={stopAudio}>■ Stop</button>
          )}
          <button className="btn" onClick={() => setChatOpen(!chatOpen)}>💬 Chat</button>
        </div>

        <button className="chat-toggle" onClick={() => setChatOpen(!chatOpen)}>
          <span>{chatOpen ? '↓' : '↑'}</span> {chatOpen ? 'Hide chat' : 'Ask Finq a follow-up question'}
        </button>

        <div className={`chat-panel ${chatOpen ? 'open' : ''}`}>
          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`msg from-${m.sender}`}>{m.text}</div>
            ))}
            {status === 'listening' && (
              <div className="msg from-user typing-dots" style={{ alignSelf: 'flex-end', padding: '12px' }}>
                <span></span><span></span><span></span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
          <div className="chat-input-row">
            <input 
              className="chat-input" 
              placeholder="Ask Finq anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
            />
            <button className="send-btn" onClick={sendMsg}>➤</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: 'none' }}></audio>
    </div>
  );
}
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// MOCK DATA — replace with real API calls
// ─────────────────────────────────────────────

const MOCK_CONVERSATION = [
  {
    id: 1,
    role: "finn",
    type: "standard",
    text: "Good morning. I'm Finn, your financial intelligence layer. I've reviewed your Bunq account activity from the past 30 days and I'm ready to help. What would you like to explore today?",
    timestamp: "09:01",
    citations: [],
  },
  {
    id: 2,
    role: "user",
    text: "Should I invest €2,000 in crypto right now?",
    timestamp: "09:03",
  },
  {
    id: 3,
    role: "finn",
    type: "warning",
    text: "Hold on — before we go there, I need to flag something. Based on your last 3 months of spending, you're running a €340 deficit heading into Q3. Deploying €2,000 into a volatile asset right now would leave your emergency buffer dangerously thin.",
    timestamp: "09:03",
    citations: [
      { label: "Bunq Statement", source: "bunq_api" },
      { label: "ECB Volatility Index", source: "web_search" },
    ],
  },
  {
    id: 4,
    role: "finn",
    type: "standard",
    text: "If you're set on crypto exposure, I'd suggest capping at €400 — roughly 20% of your intended amount — and only after we clear the Q3 gap. Want me to model both scenarios side by side?",
    timestamp: "09:03",
    citations: [
      { label: "DuckDuckGo Market Data", source: "web_search" },
    ],
  },
];

// Source badge colors
const SOURCE_COLORS = {
  bunq_api: { bg: "#0a2540", border: "#00c4a0", text: "#00c4a0", label: "BUNQ" },
  web_search: { bg: "#0f1a2e", border: "#4f9cf9", text: "#4f9cf9", label: "WEB" },
  anthropic: { bg: "#1a0f2e", border: "#a084f9", text: "#a084f9", label: "AI" },
  aws: { bg: "#1a1000", border: "#f99a00", text: "#f99a00", label: "AWS" },
  elevenlabs: { bg: "#001a10", border: "#00f97a", text: "#00f97a", label: "EL" },
};

// ─────────────────────────────────────────────
// FINN AVATAR COMPONENT
// ─────────────────────────────────────────────

function FinnAvatar({ state = "idle", size = 44 }) {
  // state: "idle" | "thinking" | "talking"
  const ringId = `finn-ring-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
      }}
    >
      <style>{`
        @keyframes finn-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyfinn-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.06); }
        }
        @keyframes finn-pulse {
          0%, 100% { opacity: 0.85; }
          50%       { opacity: 1; filter: brightness(1.3); }
        }
        @keyframes finn-talk {
          0%, 100% { transform: scale(1); }
          25%       { transform: scale(1.04); }
          75%       { transform: scale(0.97); }
        }
        .finn-ring-thinking {
          animation: finn-spin 1.6s linear infinite;
        }
        .finn-ring-talking {
          animation: finn-talk 0.55s ease-in-out infinite;
        }
        .finn-ring-idle {
          animation: finn-pulse 3.5s ease-in-out infinite;
        }
      `}</style>

      {/* Gradient ring */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        style={{ position: "absolute", inset: 0 }}
        className={`finn-ring-${state}`}
      >
        <defs>
          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#ff3cac" />
            <stop offset="16%"  stopColor="#ff6b35" />
            <stop offset="33%"  stopColor="#ffd700" />
            <stop offset="50%"  stopColor="#00f97a" />
            <stop offset="66%"  stopColor="#00c4ff" />
            <stop offset="83%"  stopColor="#4f9cf9" />
            <stop offset="100%" stopColor="#bf5af2" />
          </linearGradient>
          <filter id="finn-glow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle
          cx="22" cy="22" r="20"
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#finn-glow)"
          opacity={state === "idle" ? 0.85 : 1}
        />
      </svg>

      {/* Dark face container */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: "30%",
          background: "linear-gradient(145deg, #141414, #0a0a0a)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Face SVG */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          {/* Eyes */}
          <rect x="6.5" y="6" width="2.5" height="5" rx="1.25" fill="white" opacity="0.92" />
          <rect x="13" y="6" width="2.5" height="5" rx="1.25" fill="white" opacity="0.92" />
          {/* Smile */}
          <path
            d="M7 14.5 Q11 18 15 14.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.92"
          />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TYPEWRITER HOOK
// ─────────────────────────────────────────────

function useTypewriter(text, speed = 22, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    idxRef.current = 0;

    const interval = setInterval(() => {
      idxRef.current += 1;
      setDisplayed(text.slice(0, idxRef.current));
      if (idxRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
}

// ─────────────────────────────────────────────
// CITATION BADGE
// ─────────────────────────────────────────────

function CitationBadge({ citation }) {
  const style = SOURCE_COLORS[citation.source] || SOURCE_COLORS.web_search;
  return (
    <span
      title={citation.label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "1px 7px",
        borderRadius: 4,
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.text,
        fontSize: 9,
        fontFamily: "'DM Mono', 'Fira Mono', monospace",
        letterSpacing: "0.06em",
        fontWeight: 600,
        cursor: "default",
        userSelect: "none",
        verticalAlign: "middle",
        margin: "0 2px",
        textTransform: "uppercase",
      }}
    >
      <span style={{
        width: 5, height: 5, borderRadius: "50%",
        background: style.text, opacity: 0.85,
      }} />
      {style.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────

function FinnMessage({ message, isNew = false }) {
  const isWarning = message.type === "warning";
  const { displayed, done } = useTypewriter(message.text, 18, isNew);

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        animation: "msgIn 0.35s cubic-bezier(0.34,1.3,0.64,1) both",
      }}
    >
      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes warningPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,179,0,0.0); }
          50%       { box-shadow: 0 0 18px 2px rgba(255,179,0,0.18); }
        }
      `}</style>

      <FinnAvatar state={isNew && !done ? "talking" : "idle"} size={40} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Warning label */}
        {isWarning && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 6,
            padding: "3px 10px",
            borderRadius: 20,
            background: "rgba(255,179,0,0.08)",
            border: "1px solid rgba(255,179,0,0.35)",
            color: "#ffb300",
            fontSize: 10,
            fontFamily: "'DM Mono', monospace",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1L9.33 8.5H0.67L5 1Z" stroke="#ffb300" strokeWidth="1.2" fill="rgba(255,179,0,0.15)" />
              <rect x="4.4" y="4" width="1.2" height="2.4" rx="0.5" fill="#ffb300" />
              <circle cx="5" cy="7.3" r="0.55" fill="#ffb300" />
            </svg>
            Finn Intervention
          </div>
        )}

        {/* Bubble */}
        <div
          style={{
            position: "relative",
            padding: "13px 16px",
            borderRadius: isWarning ? "4px 14px 14px 14px" : "4px 14px 14px 14px",
            background: isWarning
              ? "linear-gradient(135deg, rgba(255,179,0,0.07) 0%, rgba(18,18,22,0.95) 100%)"
              : "rgba(255,255,255,0.04)",
            border: isWarning
              ? "1px solid rgba(255,179,0,0.25)"
              : "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(8px)",
            animation: isWarning ? "warningPulse 2.5s ease-in-out 3" : "none",
          }}
        >
          {/* Warning accent bar */}
          {isWarning && (
            <div style={{
              position: "absolute",
              left: 0, top: 10, bottom: 10,
              width: 3,
              borderRadius: 2,
              background: "linear-gradient(180deg, #ffb300, #ff6b35)",
            }} />
          )}

          <p style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.65,
            color: isWarning ? "#f5e6c0" : "#d4d4d8",
            fontFamily: "'Outfit', 'DM Sans', sans-serif",
            paddingLeft: isWarning ? 8 : 0,
          }}>
            {displayed}
            {isNew && !done && (
              <span style={{
                display: "inline-block",
                width: 2,
                height: "1em",
                background: "currentColor",
                marginLeft: 2,
                verticalAlign: "text-bottom",
                animation: "blink 0.7s step-end infinite",
              }} />
            )}
          </p>

          {/* Citations */}
          {done && message.citations && message.citations.length > 0 && (
            <div style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              alignItems: "center",
            }}>
              <span style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'DM Mono', monospace",
                marginRight: 2,
              }}>
                Sources:
              </span>
              {message.citations.map((c, i) => (
                <CitationBadge key={i} citation={c} />
              ))}
            </div>
          )}
        </div>

        <span style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'DM Mono', monospace",
          marginTop: 4,
          display: "block",
          paddingLeft: 4,
        }}>
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}

function UserMessage({ message }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "flex-end",
        animation: "msgIn 0.3s cubic-bezier(0.34,1.3,0.64,1) both",
      }}
    >
      <div style={{ maxWidth: "72%" }}>
        <div style={{
          padding: "11px 16px",
          borderRadius: "14px 4px 14px 14px",
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "1px solid rgba(79,156,249,0.2)",
          color: "#e4e4e8",
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "'Outfit', 'DM Sans', sans-serif",
        }}>
          {message.text}
        </div>
        <div style={{
          textAlign: "right",
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'DM Mono', monospace",
          marginTop: 4,
          paddingRight: 4,
        }}>
          You · {message.timestamp}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// THINKING INDICATOR
// ─────────────────────────────────────────────

function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <style>{`
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
      <FinnAvatar state="thinking" size={40} />
      <div style={{
        padding: "12px 18px",
        borderRadius: "4px 14px 14px 14px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        gap: 5,
        alignItems: "center",
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            animation: `dot-bounce 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.18}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INPUT BAR
// ─────────────────────────────────────────────

function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [fileHover, setFileHover] = useState(false);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const toggleRecording = () => {
    setRecording(r => !r);
    // TODO: Hook up ElevenLabs STT here
    // import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
    // const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    // const transcription = await client.speechToText.convert({ ... });
  };

  return (
    <div style={{
      padding: "16px 20px 20px",
      background: "rgba(8,8,12,0.95)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      backdropFilter: "blur(20px)",
    }}>
      <style>{`
        @keyframes recording-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,60,60,0.5); }
          50%       { box-shadow: 0 0 0 6px rgba(255,60,60,0); }
        }
        .finn-input::placeholder { color: rgba(255,255,255,0.25); }
        .finn-input:focus { outline: none; }
        .finn-send:disabled { opacity: 0.3; cursor: default; }
        .finn-send:not(:disabled):hover { background: rgba(79,156,249,0.25); }
        .finn-icon-btn:hover { background: rgba(255,255,255,0.08) !important; }
      `}</style>

      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        transition: "border-color 0.2s",
      }}
        onFocus={e => e.currentTarget.style.borderColor = "rgba(79,156,249,0.4)"}
        onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
      >
        {/* File upload */}
        <button
          className="finn-icon-btn"
          title="Upload receipt or document (AWS S3)"
          onClick={() => fileRef.current?.click()}
          onMouseEnter={() => setFileHover(true)}
          onMouseLeave={() => setFileHover(false)}
          style={{
            width: 34, height: 34,
            borderRadius: 10,
            border: "none",
            background: fileHover ? "rgba(255,255,255,0.08)" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {/* TODO: Wire to AWS S3 upload endpoint */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 10.5v2a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M8 2v7M5.5 4.5L8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input ref={fileRef} type="file" style={{ display: "none" }} accept=".pdf,.jpg,.jpeg,.png,.csv" />
        </button>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          className="finn-input"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask Finn anything about your finances…"
          disabled={disabled}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            resize: "none",
            color: "rgba(255,255,255,0.88)",
            fontSize: 14,
            fontFamily: "'Outfit', 'DM Sans', sans-serif",
            lineHeight: 1.55,
            padding: "4px 0",
            maxHeight: 120,
            scrollbarWidth: "none",
          }}
        />

        {/* Mic / recording */}
        <button
          className="finn-icon-btn"
          title={recording ? "Stop recording (ElevenLabs STT)" : "Start voice input (ElevenLabs STT)"}
          onClick={toggleRecording}
          style={{
            width: 34, height: 34,
            borderRadius: 10,
            border: "none",
            background: recording ? "rgba(255,60,60,0.12)" : "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: recording ? "#ff5757" : "rgba(255,255,255,0.45)",
            animation: recording ? "recording-ring 1s ease-in-out infinite" : "none",
            transition: "all 0.15s",
          }}
        >
          {/* TODO: Integrate ElevenLabs STT */}
          {recording ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <rect x="4" y="4" width="8" height="8" rx="2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="5.5" y="1" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M2.5 8.5A5.5 5.5 0 008 14a5.5 5.5 0 005.5-5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <line x1="8" y1="14" x2="8" y2="16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Send */}
        <button
          className="finn-send"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          style={{
            width: 34, height: 34,
            borderRadius: 10,
            border: "none",
            background: value.trim() && !disabled
              ? "linear-gradient(135deg, #4f9cf9, #bf5af2)"
              : "rgba(255,255,255,0.06)",
            cursor: value.trim() && !disabled ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M13 7.5L2 2l2.5 5.5L2 13l11-5.5z" fill="white" />
          </svg>
        </button>
      </div>

      <p style={{
        margin: "8px 0 0",
        textAlign: "center",
        fontSize: 10,
        color: "rgba(255,255,255,0.15)",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.04em",
      }}>
        Finn · Powered by Anthropic Claude · Bunq · AWS · ElevenLabs
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

function Header() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      background: "rgba(8,8,12,0.8)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <FinnAvatar state="idle" size={38} />
        <div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#f0f0f2",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.01em",
          }}>
            Finn
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "'DM Mono', monospace",
          }}>
            <span style={{
              width: 6, height: 6,
              borderRadius: "50%",
              background: "#00c4a0",
              boxShadow: "0 0 6px #00c4a0",
              display: "inline-block",
            }} />
            Financial AI · Bunq Connected
          </div>
        </div>
      </div>

      {/* Right side badges */}
      <div style={{ display: "flex", gap: 6 }}>
        {["ANTHROPIC", "BUNQ", "AWS", "EL"].map((badge, i) => {
          const colors = [
            { bg: "rgba(160,132,249,0.08)", border: "rgba(160,132,249,0.25)", text: "rgba(160,132,249,0.7)" },
            { bg: "rgba(0,196,160,0.08)",   border: "rgba(0,196,160,0.25)",   text: "rgba(0,196,160,0.7)" },
            { bg: "rgba(249,154,0,0.08)",   border: "rgba(249,154,0,0.25)",   text: "rgba(249,154,0,0.7)" },
            { bg: "rgba(0,249,122,0.08)",   border: "rgba(0,249,122,0.25)",   text: "rgba(0,249,122,0.7)" },
          ][i];
          return (
            <div key={badge} style={{
              padding: "2px 8px",
              borderRadius: 4,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              fontSize: 9,
              fontFamily: "'DM Mono', monospace",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}>
              {badge}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function FinnChat() {
  const [messages, setMessages] = useState(MOCK_CONVERSATION);
  const [thinking, setThinking] = useState(false);
  const [newMessageId, setNewMessageId] = useState(null);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleSend = useCallback(async (text) => {
    const userMsg = {
      id: Date.now(),
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setThinking(true);

    // ─── TODO: Replace this mock with real Anthropic API call ───
    // import Anthropic from "@anthropic-ai/sdk";
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    //
    // // Fetch Bunq context (statements, balance)
    // const bunqData = await fetch("https://api.bunq.com/v1/user/{userId}/monetary-account", {
    //   headers: { "X-Bunq-Client-Authentication": process.env.BUNQ_API_KEY }
    // }).then(r => r.json());
    //
    // // Optional: DuckDuckGo search for citations
    // const searchResults = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json`);
    //
    // const stream = await client.messages.stream({
    //   model: "claude-opus-4-5",
    //   max_tokens: 1024,
    //   system: `You are Finn, a financial AI assistant integrated with the user's Bunq account.
    //            Account context: ${JSON.stringify(bunqData)}.
    //            Always warn about risky decisions with type:"warning".
    //            Return JSON: { type: "standard"|"warning", text: string, citations: [{label, source}] }`,
    //   messages: [{ role: "user", content: text }],
    // });
    //
    // for await (const chunk of stream) { /* update UI progressively */ }
    // ────────────────────────────────────────────────────────────

    await new Promise(r => setTimeout(r, 1400 + Math.random() * 600));

    const isRisky = /invest|crypto|buy|sell|transfer|withdraw/i.test(text);
    const finnMsg = {
      id: Date.now() + 1,
      role: "finn",
      type: isRisky ? "warning" : "standard",
      text: isRisky
        ? `I've flagged this request for review. Before proceeding, I want to make sure you have the full picture. Your current balance and recent spending patterns suggest a cautious approach would serve you better here. Shall I pull up your Bunq statement for a detailed breakdown?`
        : `I've processed your query using your latest Bunq account data. Based on your transaction history and current market conditions, here's my analysis. Let me know if you'd like me to drill deeper into any specific aspect.`,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      citations: isRisky
        ? [{ label: "Bunq Statement", source: "bunq_api" }, { label: "Market Data", source: "web_search" }]
        : [{ label: "Bunq Data", source: "bunq_api" }],
    };

    setThinking(false);
    setNewMessageId(finnMsg.id);
    setMessages(prev => [...prev, finnMsg]);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        body { background: #08080c; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
      `}</style>

      <div style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#08080c",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 40% at 50% -10%, rgba(79,156,249,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 100% 100%, rgba(191,90,242,0.05) 0%, transparent 60%)
          `,
        }} />

        <Header />

        {/* Message list */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "relative",
          }}
        >
          {messages.map(msg =>
            msg.role === "user"
              ? <UserMessage key={msg.id} message={msg} />
              : <FinnMessage key={msg.id} message={msg} isNew={msg.id === newMessageId} />
          )}

          {thinking && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>

        <InputBar onSend={handleSend} disabled={thinking} />
      </div>
    </>
  );
}

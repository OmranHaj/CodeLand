import { useEffect, useState } from "react";
import Editor, { loader } from "@monaco-editor/react";

/** If Monaco (loaded from a CDN) is not ready by then, fall back to a plain text editor. */
const MONACO_TIMEOUT_MS = 12000;

/**
 * Code editor for the games: Monaco when it loads, otherwise a plain <textarea>, so a slow or
 * blocked CDN never leaves the student without a place to type their code.
 */
export default function CodeEditor({ value, onChange, language = "javascript", label = "Code editor", readOnly = false }) {
  const [mode, setMode] = useState("loading"); // loading | monaco | plain

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => active && setMode((m) => (m === "monaco" ? m : "plain")), MONACO_TIMEOUT_MS);
    loader
      .init()
      .then(() => active && setMode((m) => (m === "plain" ? m : "monaco")))
      .catch(() => active && setMode("plain"));
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  if (mode === "plain") {
    return (
      <textarea
        aria-label={label}
        value={value}
        readOnly={readOnly}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Tab inserts two spaces instead of leaving the editor.
          if (e.key !== "Tab" || readOnly) return;
          e.preventDefault();
          const el = e.currentTarget;
          const { selectionStart: start, selectionEnd: end } = el;
          const next = `${value.slice(0, start)}  ${value.slice(end)}`;
          onChange(next);
          requestAnimationFrame(() => el.setSelectionRange(start + 2, start + 2));
        }}
        style={{
          width: "100%",
          height: "100%",
          padding: "12px 14px",
          border: "none",
          resize: "none",
          outline: "none",
          boxSizing: "border-box",
          color: "#e2e8f0",
          background: "#1e1e1e",
          font: "14px/1.55 'Fira Code', Consolas, monospace",
          tabSize: 2,
        }}
      />
    );
  }

  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={value}
      onChange={(next) => onChange(next ?? "")}
      loading={<div style={{ padding: 14, color: "#94a3b8", fontSize: 13 }}>Loading the editor…</div>}
      options={{
        minimap: { enabled: false },
        readOnly,
        fontSize: 14,
        scrollBeyondLastLine: false,
        tabSize: 2,
        automaticLayout: true,
        lineNumbersMinChars: 3,
        padding: { top: 10, bottom: 10 },
      }}
    />
  );
}

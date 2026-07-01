// client/src/App.jsx
import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { Play, Loader2, Terminal, ChevronDown, Clock, MemoryStick } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const LANGUAGES = [
  { id: "python",     label: "Python 3.12",     monacoLang: "python",  icon: "🐍", starter: `# Python starter\nname = input("Enter your name: ")\nprint(f"Hello, {name}!")\n\n# Fibonacci\ndef fib(n):\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n\nprint(fib(10))` },
  { id: "javascript", label: "JavaScript (Node)", monacoLang: "javascript", icon: "⚡", starter: `// JavaScript (Node.js) starter\nconst readline = require('readline');\nconst rl = readline.createInterface({ input: process.stdin });\nlet input = [];\nrl.on('line', l => input.push(l));\nrl.on('close', () => {\n  console.log("Hello from Node.js!");\n  const n = parseInt(input[0] || "10");\n  // Fibonacci\n  let a = 0, b = 1;\n  for (let i = 0; i < n; i++) [a, b] = [b, a + b];\n  console.log(\`fib(\${n}) = \${a}\`);\n});` },
  { id: "cpp",        label: "C++17",            monacoLang: "cpp",     icon: "⚙️", starter: `#include <bits/stdc++.h>\nusing namespace std;\n\nint fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}\n\nint main() {\n    cout << "Hello from C++!" << endl;\n    int n;\n    cin >> n;\n    cout << "fib(" << n << ") = " << fib(n) << endl;\n    return 0;\n}` },
];

const THEMES = { dark: "vs-dark", light: "light" };

export default function App() {
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].starter);
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | queued | running | done | error
  const [execTime, setExecTime] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [showStdin, setShowStdin] = useState(false);
  const pollRef = useRef(null);
  useEffect(() => {
  return () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };
}, []);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    setCode(newLang.starter);
    setOutput(null);
    setStatus("idle");
  };

  const runCode = async () => {
    setStatus("queued");
    setOutput(null);
    setExecTime(null);

    try {
      // 1. Submit job
      const { data: jobData } = await axios.post(`${API}/api/jobs`, {
        language: lang.id,
        code,
        stdin,
      });

      setStatus("running");

      // 2. Poll for result
      const jobId = jobData.jobId;
      pollRef.current = setInterval(async () => {
        try {
          const { data } = await axios.get(`${API}/api/jobs/${jobId}`);
          if (data.status === "completed") {
            clearInterval(pollRef.current);
            setStatus("done");
            setOutput(data.result);
            setExecTime(data.result.executionTime);
          } else if (data.status === "failed") {
            clearInterval(pollRef.current);
            setStatus("error");
            setOutput({ stdout: "", stderr: data.error || "Job failed", exitCode: 1, timedOut: false });
          }
        } catch {
          clearInterval(pollRef.current);
          setStatus("error");
        }
      }, 600);
    } catch (err) {
      setStatus("error");
      setOutput({ stdout: "", stderr: err.response?.data?.error || "Submission failed", exitCode: 1 });
    }
  };

  const bg = isDark ? "#0d1117" : "#ffffff";
  const surface = isDark ? "#161b22" : "#f6f8fa";
  const border = isDark ? "#30363d" : "#d0d7de";
  const text = isDark ? "#e6edf3" : "#1f2328";
  const muted = isDark ? "#8b949e" : "#57606a";
  const accent = "#2ea043";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "'JetBrains Mono', 'Fira Code', monospace, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <header style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Terminal size={20} color={accent} />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: 0.5 }}>Execify</span>
          <span style={{ fontSize: 11, color: muted, background: isDark ? "#21262d" : "#e7ecf0", padding: "2px 8px", borderRadius: 12, border: `1px solid ${border}` }}>
            Online Code Execution Engine
          </span>
        </div>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{ background: "none", border: `1px solid ${border}`, borderRadius: 6, padding: "4px 10px", color: muted, cursor: "pointer", fontSize: 12 }}
        >
          {isDark ? "☀ Light" : "☾ Dark"}
        </button>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left: Editor Panel ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Toolbar */}
          <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: "8px 14px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Language selector */}
            <div style={{ display: "flex", gap: 6 }}>
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleLangChange(l)}
                  style={{
                    background: lang.id === l.id ? (isDark ? "#21262d" : "#dbe9fd") : "transparent",
                    border: `1px solid ${lang.id === l.id ? "#58a6ff" : border}`,
                    borderRadius: 6,
                    padding: "4px 12px",
                    color: lang.id === l.id ? "#58a6ff" : muted,
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "inherit",
                  }}
                >
                  {l.icon} {l.label}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            {/* Run button */}
            <button
              onClick={runCode}
              disabled={status === "queued" || status === "running"}
              style={{
                background: status === "queued" || status === "running" ? "#238636aa" : "#238636",
                border: "1px solid #2ea043",
                borderRadius: 7,
                padding: "6px 18px",
                color: "#fff",
                cursor: status === "running" ? "not-allowed" : "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              {status === "queued" || status === "running"
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Running...</>
                : <><Play size={14} /> Run Code</>}
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1 }}>
            <Editor
              height="100%"
              language={lang.monacoLang}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme={THEMES[isDark ? "dark" : "light"]}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                padding: { top: 12 },
                tabSize: 4,
              }}
            />
          </div>

          {/* Stdin collapsible */}
          <div style={{ background: surface, borderTop: `1px solid ${border}` }}>
            <button
              onClick={() => setShowStdin(!showStdin)}
              style={{ width: "100%", background: "none", border: "none", padding: "7px 14px", color: muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontFamily: "inherit" }}
            >
              <ChevronDown size={14} style={{ transform: showStdin ? "rotate(180deg)" : "rotate(0)", transition: "0.2s" }} />
              Standard Input (stdin)
            </button>
            {showStdin && (
              <textarea
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Enter program input here..."
                style={{
                  width: "100%", height: 80, background: isDark ? "#0d1117" : "#fff",
                  border: "none", borderTop: `1px solid ${border}`, color: text,
                  padding: "8px 14px", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* ── Right: Output Panel ── */}
        <div style={{ width: 420, background: surface, borderLeft: `1px solid ${border}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={14} color={muted} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Output</span>
            {execTime && (
              <span style={{ marginLeft: "auto", fontSize: 11, color: muted, display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={11} /> {execTime}ms
              </span>
            )}
          </div>

          <div style={{ flex: 1, padding: 14, overflow: "auto", fontSize: 13, lineHeight: 1.6 }}>
            {status === "idle" && (
              <p style={{ color: muted }}>Click <strong>Run Code</strong> to execute your program.</p>
            )}

            {(status === "queued" || status === "running") && (
              <div style={{ color: muted }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  {status === "queued" ? "Job queued in execution queue..." : "Container running your code..."}
                </div>
                <div style={{ background: isDark ? "#0d1117" : "#fff", borderRadius: 6, padding: 10, border: `1px solid ${border}` }}>
                  <p style={{ fontSize: 11, color: muted }}>⚙ Sandbox constraints active:</p>
                  <p style={{ fontSize: 11, color: muted }}>• No network access</p>
                  <p style={{ fontSize: 11, color: muted }}>• 256MB RAM limit</p>
                  <p style={{ fontSize: 11, color: muted }}>• 10 second timeout</p>
                  <p style={{ fontSize: 11, color: muted }}>• Isolated filesystem</p>
                </div>
              </div>
            )}

            {(status === "done" || status === "error") && output && (
              <div>
                {/* Exit status badge */}
                <div style={{ marginBottom: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 12,
                    background: output.exitCode === 0 ? "#1a4731" : "#5c1a1a",
                    color: output.exitCode === 0 ? "#2ea043" : "#f85149",
                    border: `1px solid ${output.exitCode === 0 ? "#2ea043" : "#f85149"}`,
                  }}>
                    {output.timedOut ? "⏱ TLE" : output.exitCode === 0 ? "✓ Exited 0" : `✗ Exit ${output.exitCode}`}
                  </span>
                  {execTime && <span style={{ fontSize: 11, color: muted }}>⏱ {execTime}ms</span>}
                </div>

                {/* stdout */}
                {output.stdout && (
                  <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 11, color: muted, marginBottom: 4 }}>STDOUT</p>
                    <pre style={{
                      background: isDark ? "#0d1117" : "#fff",
                      border: `1px solid ${border}`,
                      borderRadius: 6, padding: 10,
                      fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-all",
                      color: text, margin: 0, maxHeight: 300, overflow: "auto",
                    }}>
                      {output.stdout}
                    </pre>
                  </div>
                )}

                {/* stderr */}
                {output.stderr && (
                  <div>
                    <p style={{ fontSize: 11, color: "#f85149", marginBottom: 4 }}>STDERR</p>
                    <pre style={{
                      background: isDark ? "#1c0a0a" : "#fff5f5",
                      border: "1px solid #5c1a1a",
                      borderRadius: 6, padding: 10,
                      fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-all",
                      color: "#f85149", margin: 0, maxHeight: 200, overflow: "auto",
                    }}>
                      {output.stderr}
                    </pre>
                  </div>
                )}

                {/* No output */}
                {!output.stdout && !output.stderr && (
                  <p style={{ color: muted }}>Program produced no output.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

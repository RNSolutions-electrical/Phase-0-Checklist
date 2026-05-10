import { useState, useEffect } from "react";

/* ─── Google Fonts ─────────────────────────────────────────── */
const FontLink = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
  `}</style>
);

/* ─── Track / Task Data ─────────────────────────────────────── */
const TRACKS = [
  {
    id: "supabase",
    label: "Supabase",
    sub: "New account required",
    accent: "#3ECF8E",
    accentDark: "#0a6640",
    tasks: [
      {
        id: "sb_account",
        title: "Create your Supabase account",
        steps: [
          "Go to supabase.com",
          "Click "Start your project"",
          "Sign up with GitHub — this links the two accounts automatically",
          "Verify your email if prompted",
        ],
        inputs: [],
      },
      {
        id: "sb_project",
        title: "Create project: northgate-hq",
        steps: [
          "Click "New Project"",
          "Name: northgate-hq",
          "Database password: click Generate — save it immediately, it cannot be recovered",
          "Region: US East (N. Virginia)",
          "Click "Create new project" and wait ~2 min for provisioning",
        ],
        inputs: [],
      },
      {
        id: "sb_schema",
        title: "Run the database schema SQL",
        steps: [
          "Go to SQL Editor (left sidebar) → New Query",
          "Open northgate_hq_schema.sql from the files shared earlier",
          "Select all → paste into the editor",
          "Click Run (or Ctrl/Cmd + Enter)",
          "Confirm the result reads: Success. No rows returned.",
          "Go to Table Editor and verify all tables appear in the list",
        ],
        inputs: [],
      },
      {
        id: "sb_creds",
        title: "Copy and save API credentials",
        steps: [
          "Go to Settings → API in the left sidebar",
          "Copy the three values below into the fields",
          "IMPORTANT: Never put the Service Role Key in client-side code — it bypasses all security",
        ],
        inputs: [
          { id: "sb_url",          label: "Project URL",        placeholder: "https://xxxx.supabase.co",  sensitive: false },
          { id: "sb_anon_key",     label: "Anon / Public Key",  placeholder: "eyJhbGciOiJIUzI1NiIs...",   sensitive: true  },
          { id: "sb_service_key",  label: "Service Role Key",   placeholder: "eyJhbGciOiJIUzI1NiIs...",   sensitive: true  },
        ],
      },
      {
        id: "sb_storage",
        title: "Create Storage bucket",
        steps: [
          "Go to Storage (left sidebar)",
          "Click New bucket",
          "Name: northgate-files",
          "Toggle Public bucket: OFF",
          "Click Save",
        ],
        inputs: [],
      },
    ],
  },
  {
    id: "auth0",
    label: "Auth0",
    sub: "New account required",
    accent: "#EB5424",
    accentDark: "#7a2a0f",
    tasks: [
      {
        id: "a0_account",
        title: "Create your Auth0 account",
        steps: [
          "Go to auth0.com → Sign up",
          "Use a personal email address — do not use your @thenorthgategroup.com account here",
          "When asked "What kind of app?" → Single Page Web App → React",
          "Tenant name: northgategroup",
          "Region: US",
        ],
        inputs: [],
      },
      {
        id: "a0_app",
        title: "Create application: Northgate HQ",
        steps: [
          "Go to Applications → Applications",
          "Click Create Application",
          "Name: Northgate HQ",
          "Type: Single Page Application",
          "Click Create",
          "Copy the Domain and Client ID into the fields below",
        ],
        inputs: [
          { id: "a0_domain",    label: "Auth0 Domain",  placeholder: "northgategroup.us.auth0.com",  sensitive: false },
          { id: "a0_client_id", label: "Client ID",     placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",      sensitive: false },
        ],
      },
      {
        id: "a0_urls",
        title: "Configure allowed URLs (placeholder)",
        steps: [
          "In the application settings page, scroll to Application URIs",
          "Allowed Callback URLs: http://localhost:5173",
          "Allowed Logout URLs: http://localhost:5173",
          "Allowed Web Origins: http://localhost:5173",
          "Click Save Changes",
          "Note: these will be updated with the live Netlify URL in Phase 1",
        ],
        inputs: [],
      },
      {
        id: "a0_action",
        title: "Deploy domain restriction Action",
        steps: [
          "Go to Actions → Library → Build Custom",
          "Name: Domain Restriction and Developer Bypass",
          "Trigger: Login / Post Login → click Create",
          "Replace all code in the editor with the Action code from northgate_hq_phase0_setup.md",
          "Click Deploy",
          "Go to Actions → Flows → Login",
          "Drag your new Action between Start and Complete",
          "Click Apply",
        ],
        inputs: [],
      },
      {
        id: "a0_test",
        title: "Test the domain restriction",
        steps: [
          "From the Auth0 dashboard, try logging in with any non-@thenorthgategroup.com email",
          "It should be denied with the restriction message",
          "Try logging in with CRNCMK@gmail.com — it should succeed (developer bypass)",
          "Check this task only when both tests pass",
        ],
        inputs: [],
      },
    ],
  },
  {
    id: "github",
    label: "GitHub",
    sub: "Account exists — create repo",
    accent: "#656d76",
    accentDark: "#2d333b",
    tasks: [
      {
        id: "gh_repo",
        title: "Create repo: northgate-hq",
        steps: [
          "Go to github.com → click + in the top right → New repository",
          "Repository name: northgate-hq",
          "Description: Northgate Group HQ — Internal Operations Platform",
          "Visibility: Private",
          "Check: Add a README file",
          ".gitignore template: Node",
          "Click Create repository",
          "Copy the repo URL into the field below",
        ],
        inputs: [
          { id: "gh_repo_url", label: "Repository URL", placeholder: "https://github.com/username/northgate-hq", sensitive: false },
        ],
      },
      {
        id: "gh_branch",
        title: "Enable branch protection on main",
        steps: [
          "In the repo → Settings → Branches",
          "Click Add rule (or Add branch ruleset)",
          "Branch name pattern: main",
          "Check: Require a pull request before merging",
          "Click Create",
          "This protects main from accidental direct pushes later in the build",
        ],
        inputs: [],
      },
    ],
  },
  {
    id: "netlify",
    label: "Netlify",
    sub: "Account exists — connect to GitHub",
    accent: "#00AD9F",
    accentDark: "#005954",
    tasks: [
      {
        id: "nl_connect",
        title: "Connect GitHub repo to Netlify",
        steps: [
          "Log into netlify.com",
          "Click Add new site → Import an existing project",
          "Click Deploy with GitHub",
          "Authorize Netlify to access your GitHub account if prompted",
          "Search for and select northgate-hq",
        ],
        inputs: [],
      },
      {
        id: "nl_build",
        title: "Configure build settings and get your URL",
        steps: [
          "Branch to deploy: main",
          "Base directory: leave empty",
          "Build command: npm run build",
          "Publish directory: dist",
          "Click Deploy site",
          "NOTE: The first deploy WILL fail — this is expected. The Vite app doesn't exist yet.",
          "Copy the assigned Netlify URL (e.g. northgate-hq.netlify.app) into the field below",
        ],
        inputs: [
          { id: "nl_url", label: "Netlify Site URL", placeholder: "https://northgate-hq.netlify.app", sensitive: false },
        ],
      },
    ],
  },
];

const STORAGE_KEY = "northgate-phase0-v1";
const ALL_TASKS = TRACKS.flatMap((t) => t.tasks);

/* ─── Main Component ────────────────────────────────────────── */
export default function App() {
  const [checks,       setChecks]       = useState({});
  const [inputs,       setInputs]       = useState({});
  const [expanded,     setExpanded]     = useState({});
  const [showSens,     setShowSens]     = useState({});
  const [summary,      setSummary]      = useState("");
  const [showSummary,  setShowSummary]  = useState(false);
  const [saveLabel,    setSaveLabel]    = useState("");
  const [loaded,       setLoaded]       = useState(false);
  const [copied,       setCopied]       = useState(false);

  /* Load */
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r?.value) {
          const d = JSON.parse(r.value);
          setChecks(d.checks  || {});
          setInputs(d.inputs  || {});
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  /* Save (debounced) */
  useEffect(() => {
    if (!loaded) return;
    const t = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ checks, inputs }));
        setSaveLabel("Saved");
        setTimeout(() => setSaveLabel(""), 2000);
      } catch { setSaveLabel("Save error"); }
    }, 600);
    return () => clearTimeout(t);
  }, [checks, inputs, loaded]);

  /* Derived */
  const doneTasks  = ALL_TASKS.filter((t) => checks[t.id]).length;
  const totalTasks = ALL_TASKS.length;
  const pct        = Math.round((doneTasks / totalTasks) * 100);

  const toggle      = (id) => setChecks((p) => ({ ...p, [id]: !p[id] }));
  const toggleExp   = (id) => setExpanded((p) => ({ ...p, [id]: !p[id] }));
  const toggleSens  = (id) => setShowSens((p) => ({ ...p, [id]: !p[id] }));
  const setVal      = (id, v) => setInputs((p) => ({ ...p, [id]: v }));

  /* Generate handoff doc */
  const generate = () => {
    const ts = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const sep = "═".repeat(50);
    const lines = [
      "NORTHGATE HQ — PHASE 0 HANDOFF DOCUMENT",
      `Generated: ${ts}`,
      `Progress:  ${doneTasks}/${totalTasks} tasks complete (${pct}%)`,
      "",
      "Upload this file at the start of a new Claude session",
      "to begin Phase 1 without any re-explanation.",
      sep, "",
    ];
    TRACKS.forEach((track) => {
      lines.push(`[ ${track.label.toUpperCase()} ]`);
      const allInputs = track.tasks.flatMap((t) => t.inputs);
      allInputs.forEach((inp) => {
        const v = inputs[inp.id]?.trim();
        if (v) lines.push(`${inp.label}: ${v}`);
      });
      const incomplete = track.tasks.filter((t) => !checks[t.id]).map((t) => `  - ${t.title}`);
      lines.push(`Status: ${incomplete.length === 0 ? "All tasks complete ✓" : `${track.tasks.filter((t) => checks[t.id]).length}/${track.tasks.length} complete`}`);
      if (incomplete.length) lines.push("Incomplete:\n" + incomplete.join("\n"));
      lines.push("");
    });
    if (inputs["notes"]?.trim()) {
      lines.push("[ NOTES ]");
      lines.push(inputs["notes"].trim());
      lines.push("");
    }
    lines.push(sep);
    lines.push("End of Phase 0 Handoff Document");
    setSummary(lines.join("\n"));
    setShowSummary(true);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(summary); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
  };
  const download = () => {
    const b = new Blob([summary], { type: "text/plain" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u; a.download = "northgate_hq_phase0_handoff.txt"; a.click();
    URL.revokeObjectURL(u);
  };

  if (!loaded) return (
    <div style={{ fontFamily: "DM Sans, sans-serif", padding: "3rem 2rem", color: "#888", fontSize: 14 }}>
      Loading saved progress…
    </div>
  );

  return (
    <>
      <FontLink />
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "#0E0E0E",
        minHeight: "100vh",
        padding: "2rem 1rem",
        color: "#E8E6E0",
      }}>
        <div style={{ maxWidth: 660, margin: "0 auto" }}>

          {/* ── Header ── */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: "#F0EEE8" }}>
                Phase 0 Setup
              </h1>
              <span style={{
                fontSize: 11, fontFamily: "'DM Mono', monospace",
                color: saveLabel === "Saved" ? "#3ECF8E" : saveLabel ? "#ef4444" : "#444",
                transition: "color 0.3s",
              }}>
                {saveLabel || "auto-saves"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 14px", lineHeight: 1.5 }}>
              Check off each step as you complete it. Fill in credentials where prompted.
              When all tracks are done, generate your Phase 1 handoff document and upload it here.
            </p>

            {/* Progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, background: "#1E1E1E", borderRadius: 3, height: 5, overflow: "hidden" }}>
                <div style={{ background: "#3ECF8E", height: "100%", width: `${pct}%`, transition: "width 0.5s cubic-bezier(.4,0,.2,1)", borderRadius: 3 }} />
              </div>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#555", flexShrink: 0, minWidth: 60, textAlign: "right" }}>
                {doneTasks}/{totalTasks} done
              </span>
            </div>
          </div>

          {/* ── Tracks ── */}
          {TRACKS.map((track) => {
            const trackDone  = track.tasks.filter((t) => checks[t.id]).length;
            const trackTotal = track.tasks.length;
            const allDone    = trackDone === trackTotal;

            return (
              <div key={track.id} style={{
                marginBottom: "1rem",
                border: `1px solid ${allDone ? track.accent + "44" : "#1E1E1E"}`,
                borderRadius: 12,
                overflow: "hidden",
                transition: "border-color 0.3s",
              }}>
                {/* Track header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: allDone ? track.accentDark : "#161616",
                  borderBottom: `1px solid ${allDone ? track.accent + "44" : "#1E1E1E"}`,
                }}>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: allDone ? track.accent : "#E8E6E0", letterSpacing: "-0.01em" }}>
                      {track.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>{track.sub}</div>
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 11,
                    background: allDone ? track.accent + "22" : "#1E1E1E",
                    color: allDone ? track.accent : "#555",
                    border: `1px solid ${allDone ? track.accent + "44" : "#2A2A2A"}`,
                    padding: "3px 10px", borderRadius: 20,
                    transition: "all 0.3s",
                  }}>
                    {trackDone}/{trackTotal} {allDone ? "✓" : ""}
                  </div>
                </div>

                {/* Tasks */}
                {track.tasks.map((task, idx) => {
                  const isOpen   = expanded[task.id];
                  const isDone   = !!checks[task.id];
                  const allInps  = task.inputs.filter((i) => inputs[i.id]?.trim()).length;
                  const hasInps  = task.inputs.length > 0;

                  return (
                    <div key={task.id} style={{
                      borderTop: idx === 0 ? "none" : "1px solid #1A1A1A",
                      background: isDone ? "#111" : "transparent",
                      transition: "background 0.2s",
                    }}>
                      {/* Row */}
                      <div
                        onClick={() => toggleExp(task.id)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", cursor: "pointer" }}
                      >
                        {/* Checkbox */}
                        <div
                          onClick={(e) => { e.stopPropagation(); toggle(task.id); }}
                          style={{
                            width: 18, height: 18, borderRadius: 5, flexShrink: 0, cursor: "pointer",
                            border: `1.5px solid ${isDone ? track.accent : "#333"}`,
                            background: isDone ? track.accent : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          {isDone && <span style={{ fontSize: 11, color: "#000", lineHeight: 1 }}>✓</span>}
                        </div>

                        <span style={{
                          flex: 1, fontSize: 13, fontWeight: 500,
                          color: isDone ? "#444" : "#C8C6C0",
                          textDecoration: isDone ? "line-through" : "none",
                          lineHeight: 1.4, transition: "color 0.2s",
                        }}>
                          {task.title}
                        </span>

                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                          {hasInps && (
                            <span style={{
                              fontFamily: "'DM Mono', monospace", fontSize: 10,
                              background: allInps === task.inputs.length ? track.accent + "22" : "#1E1E1E",
                              color: allInps === task.inputs.length ? track.accent : "#555",
                              border: `1px solid ${allInps === task.inputs.length ? track.accent + "55" : "#2A2A2A"}`,
                              padding: "2px 8px", borderRadius: 20,
                              transition: "all 0.2s",
                            }}>
                              {allInps}/{task.inputs.length} fields
                            </span>
                          )}
                          <span style={{
                            fontSize: 10, color: "#444",
                            display: "inline-block",
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.15s",
                          }}>▾</span>
                        </div>
                      </div>

                      {/* Expanded body */}
                      {isOpen && (
                        <div style={{ padding: "2px 16px 16px 16px", borderTop: "1px solid #1A1A1A" }}>
                          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", margin: "12px 0 7px" }}>
                            Steps
                          </p>
                          <ol style={{ margin: 0, paddingLeft: 18 }}>
                            {task.steps.map((s, i) => (
                              <li key={i} style={{ fontSize: 13, color: "#888", padding: "2px 0", lineHeight: 1.6 }}>{s}</li>
                            ))}
                          </ol>

                          {task.inputs.map((inp) => (
                            <div key={inp.id} style={{ marginTop: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#666", fontWeight: 500 }}>
                                  {inp.label}
                                </label>
                                {inp.sensitive && (
                                  <span style={{ fontSize: 10, background: "#2a1a00", color: "#f59e0b", border: "1px solid #5a3800", padding: "1px 7px", borderRadius: 4 }}>
                                    sensitive
                                  </span>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <input
                                  type={inp.sensitive && !showSens[inp.id] ? "password" : "text"}
                                  value={inputs[inp.id] || ""}
                                  onChange={(e) => setVal(inp.id, e.target.value)}
                                  placeholder={inp.placeholder}
                                  style={{
                                    flex: 1, padding: "8px 11px",
                                    fontSize: 12, fontFamily: "'DM Mono', monospace",
                                    background: "#111", color: "#C8C6C0",
                                    border: "1px solid #2A2A2A", borderRadius: 7,
                                    outline: "none", minWidth: 0,
                                    transition: "border-color 0.15s",
                                  }}
                                  onFocus={(e) => (e.target.style.borderColor = track.accent + "88")}
                                  onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                                />
                                {inp.sensitive && (
                                  <button
                                    onClick={() => toggleSens(inp.id)}
                                    style={{
                                      padding: "8px 12px", fontSize: 11,
                                      background: "#161616", color: "#666",
                                      border: "1px solid #2A2A2A", borderRadius: 7, cursor: "pointer",
                                      fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
                                    }}
                                  >
                                    {showSens[inp.id] ? "hide" : "show"}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* ── Notes ── */}
          <div style={{ marginBottom: "1rem", border: "1px solid #1E1E1E", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: "#161616", padding: "12px 16px", borderBottom: "1px solid #1E1E1E" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700, color: "#E8E6E0", letterSpacing: "-0.01em" }}>Notes for Phase 1</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>Issues, questions, or anything to flag before the next session</div>
            </div>
            <div style={{ padding: 16, background: "#0E0E0E" }}>
              <textarea
                value={inputs["notes"] || ""}
                onChange={(e) => setVal("notes", e.target.value)}
                placeholder="e.g. Had trouble with the Auth0 Action — skipped for now and will revisit. GitHub repo is under personal account, not org account."
                style={{
                  width: "100%", minHeight: 90,
                  padding: "9px 11px", fontSize: 13,
                  background: "#111", color: "#C8C6C0",
                  border: "1px solid #2A2A2A", borderRadius: 7,
                  fontFamily: "'DM Sans', sans-serif",
                  resize: "vertical", outline: "none",
                  boxSizing: "border-box", lineHeight: 1.5,
                }}
              />
            </div>
          </div>

          {/* ── Generate button ── */}
          <button
            onClick={generate}
            style={{
              width: "100%", padding: "14px",
              background: pct === 100 ? "#3ECF8E" : "#1A1A1A",
              color: pct === 100 ? "#000" : "#E8E6E0",
              border: `1px solid ${pct === 100 ? "#3ECF8E" : "#2A2A2A"}`,
              borderRadius: 10, fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700, letterSpacing: "-0.01em",
              cursor: "pointer", marginBottom: "1rem",
              transition: "all 0.3s",
            }}
          >
            {pct === 100 ? "✓ Generate Phase 1 Handoff Document" : `Generate Handoff Document (${pct}% complete)`}
          </button>

          {/* ── Summary output ── */}
          {showSummary && (
            <div style={{ border: "1px solid #1E1E1E", borderRadius: 12, overflow: "hidden", marginBottom: "1.5rem" }}>
              <div style={{
                background: "#161616", padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: "1px solid #1E1E1E",
              }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, color: "#E8E6E0" }}>
                  Phase 1 Handoff Document
                </span>
                <div style={{ display: "flex", gap: 7 }}>
                  <button onClick={copy} style={{
                    padding: "5px 13px", fontSize: 11,
                    background: copied ? "#3ECF8E22" : "#1E1E1E",
                    color: copied ? "#3ECF8E" : "#888",
                    border: `1px solid ${copied ? "#3ECF8E55" : "#2A2A2A"}`,
                    borderRadius: 6, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace",
                    transition: "all 0.2s",
                  }}>
                    {copied ? "copied ✓" : "copy"}
                  </button>
                  <button onClick={download} style={{
                    padding: "5px 13px", fontSize: 11,
                    background: "#3ECF8E", color: "#000",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", fontWeight: 500,
                  }}>
                    download .txt
                  </button>
                </div>
              </div>
              <pre style={{
                margin: 0, padding: 16, fontSize: 11,
                background: "#0A0A0A", color: "#888",
                whiteSpace: "pre-wrap", fontFamily: "'DM Mono', monospace",
                maxHeight: 300, overflowY: "auto", lineHeight: 1.6,
              }}>
                {summary}
              </pre>
              <div style={{ padding: "10px 16px", background: "#0E0E0E", borderTop: "1px solid #1E1E1E", fontSize: 12, color: "#555", lineHeight: 1.5 }}>
                Download this file → start a new Claude session → upload the file → say "Phase 1, let's go."
                Claude will have everything it needs.
              </div>
            </div>
          )}

          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#333", textAlign: "center", letterSpacing: "0.04em" }}>
            NORTHGATE HQ · ROBERTSON-NOEL LLC · PHASE 0 · PROGRESS AUTO-SAVES
          </p>
        </div>
      </div>
    </>
  );
}

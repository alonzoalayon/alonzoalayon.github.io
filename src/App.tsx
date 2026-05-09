import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Code2,
  Folder,
  Home,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Terminal,
  Zap,
} from "lucide-react";
import "./App.css";

type Mode = "overview" | "systems" | "case-studies" | "console";

const systems = [
  {
    title: "AI PR Reviewer",
    icon: Bot,
    description:
      "A GitHub-based review assistant for React, React Native, Expo, testing, and release-risk feedback.",
    tags: ["OpenAI", "GitHub Actions", "React Native", "QA"],
  },
  {
    title: "Release Risk Scanner",
    icon: ShieldCheck,
    description:
      "A workflow for reviewing dependency upgrades, Expo SDK changes, native build risk, and release readiness.",
    tags: ["Expo", "EAS", "CI/CD", "Release"],
  },
  {
    title: "Mobile Architecture",
    icon: Code2,
    description:
      "Production React Native architecture using Expo, Zustand, React Query, and reusable feature modules.",
    tags: ["React Native", "Expo", "Zustand", "TypeScript"],
  },
  {
    title: "QA Ownership",
    icon: Zap,
    description:
      "Testing workflows using Playwright, Maestro concepts, exploratory QA, and production bug prevention.",
    tags: ["Playwright", "Testing", "QA", "Automation"],
  },
];

const caseStudies = [
  {
    title: "Owning Releases as the Primary Frontend Engineer",
    summary:
      "Managed app release workflows, environment builds, TestFlight / Play testing, and production readiness.",
  },
  {
    title: "Improving Stability Through Frontend QA",
    summary:
      "Brought QA thinking into development by testing own work, writing integration tests, and reducing regressions.",
  },
  {
    title: "Modernizing React Native App Architecture",
    summary:
      "Helped evolve app structure through reusable components, Zustand stores, React Query cache flows, and Expo tooling.",
  },
];

const systemCommands = [
  "help",
  "resume pdf",
  "resume docx",
  "open github",
  "open linkedin",
  "show writeups",
  "show notes",
  "show systems",
];

const aiQueries = [
  {
    label: "ask engineer-profile",
    question: "What kind of engineer is Alonzo?",
  },
  {
    label: "ask mobile-architecture",
    question: "How does Alonzo approach React Native architecture?",
  },
  {
    label: "ask ai-tooling",
    question: "What AI tools is Alonzo building?",
  },
  {
    label: "ask release-risk",
    question: "How does Alonzo think about release risk?",
  },
  {
    label: "ask startup-fit",
    question: "Would Alonzo be a good fit for a small startup team?",
  },
];

function App() {
  const [mode, setMode] = useState<Mode>("systems");
  const [command, setCommand] = useState("");
  const [answer, setAnswer] = useState(
    "Try asking: What kind of engineer is Alonzo?",
  );
  const [displayedAnswer, setDisplayedAnswer] = useState(
    "Try asking: What kind of engineer is Alonzo?",
  );
  const [isAsking, setIsAsking] = useState(false);

  const consoleRef = useRef<HTMLDivElement | null>(null);
  const systemsRef = useRef<HTMLDivElement | null>(null);

  const runConsoleCommand = async (rawCommand?: string) => {
    const input = (rawCommand ?? command).trim();
    const value = input.toLowerCase();

    if (!input || isAsking) return;

    setCommand(input);

    if (value === "help") {
      setAnswer(`Available system commands:

help — show commands
resume pdf — open PDF resume
resume docx — open DOCX resume
open github — open GitHub
open linkedin — open LinkedIn
show writeups — list architecture writeups
show notes — show engineering notes
show systems — jump to engineering systems

You can also ask natural language questions, like:
"What kind of engineer is Alonzo?"
"How does he approach React Native architecture?"`);
      return;
    }

    if (value === "resume pdf") {
      window.open("/resume.pdf", "_blank");
      setAnswer("Exporting resume profile… Opening resume.pdf.");
      return;
    }

    if (value === "resume docx") {
      window.open("/resume-doc.docx", "_blank");
      setAnswer("Exporting ATS resume profile… Opening resume-doc.docx.");
      return;
    }

    if (value === "resume") {
      setAnswer(`Resume exports available:

resume pdf — open PDF version
resume docx — open ATS-friendly DOCX version`);
      return;
    }

    if (value === "open github" || value === "github") {
      window.open("https://github.com/alonzoalayon", "_blank");
      setAnswer("Opening GitHub engineering archive.");
      return;
    }

    if (value === "open linkedin" || value === "linkedin") {
      window.open("https://linkedin.com/in/alonzoalayon", "_blank");
      setAnswer("Opening LinkedIn profile.");
      return;
    }

    if (value === "show writeups" || value === "writeups") {
      setAnswer(`Architecture writeups:

- How I think about Expo SDK upgrades
- How I approach release risk in mobile apps
- Why frontend engineers should own QA
- Building AI tools for small engineering teams`);
      return;
    }

    if (value === "show notes" || value === "notes") {
      setAnswer(`Engineering notes:

- I think in systems, not isolated components.
- I care about release risk because users feel bugs before engineers do.
- QA is not separate from frontend engineering.
- AI is most useful when it improves real workflows.`);
      return;
    }

    if (value === "show systems" || value === "systems") {
      setMode("systems");
      setAnswer("Loading engineering systems…");
      return;
    }

    if (value.startsWith("ask ")) {
      await askPortfolio(input.replace(/^ask\s+/i, ""));
      return;
    }

    await askPortfolio(input);
  };

  const askPortfolio = async (promptOverride?: string) => {
    const question = (promptOverride ?? command).trim();

    if (!question || isAsking) return;

    try {
      setIsAsking(true);
      setCommand(question);
      setDisplayedAnswer("Thinking...");
      setAnswer("");

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setAnswer(data.answer);
    } catch {
      setAnswer(
        "The AI console failed to respond. Make sure your server is running with npm run server.",
      );
    } finally {
      setIsAsking(false);
    }
  };

  useEffect(() => {
    if (!answer) return;

    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setDisplayedAnswer(answer.slice(0, index));

      if (index >= answer.length) {
        window.clearInterval(interval);
      }
    }, 12);

    return () => window.clearInterval(interval);
  }, [answer]);

  useEffect(() => {
    if (mode === "console" && consoleRef.current) {
      consoleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    if (mode === "systems" && systemsRef.current) {
      systemsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [mode]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <Terminal size={28} />
        </div>

        <div className="side-icons">
          <button
            className={mode === "overview" ? "active" : ""}
            onClick={() => setMode("overview")}
          >
            <Home size={22} />
          </button>
          <button
            className={mode === "systems" ? "active" : ""}
            onClick={() => setMode("systems")}
          >
            <Layers size={22} />
          </button>
          <button
            className={mode === "case-studies" ? "active" : ""}
            onClick={() => setMode("case-studies")}
          >
            <Folder size={22} />
          </button>
          <button
            className={mode === "console" ? "active" : ""}
            onClick={() => setMode("console")}
          >
            <SquareTerminal size={22} />
          </button>
        </div>

        <div className="socials">
          <a href="https://github.com/alonzoalayon" target="_blank">
            GH
          </a>
          <a href="https://linkedin.com/in/alonzoalayon" target="_blank">
            in
          </a>
        </div>
      </aside>

      <section className="app">
        <section className="hero">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="eyebrow">
              <Sparkles size={16} />
              Engineering Systems
            </div>

            <h1>
              I build production <span>frontend systems,</span> not portfolio
              tiles.
            </h1>

            <p>
              A React and React Native engineer focused on mobile architecture,
              release reliability, QA ownership, and AI-assisted developer
              tools.
            </p>

            <div className="actions">
              <button onClick={() => setMode("systems")}>
                Explore Systems <span>→</span>
              </button>
              <button className="secondary" onClick={() => setMode("console")}>
                <Terminal size={18} />
                Open Console
              </button>
            </div>
          </motion.div>

          <motion.div
            className="system-card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="card-header">
              <span className="status-dot" />
              SYSTEM STATUS
            </div>

            <div className="status-grid">
              <Status label="React" value="Advanced" />
              <Status label="React Native" value="Production" />
              <Status label="Expo" value="Release-ready" />
              <Status label="AI Tools" value="In progress" warning />
            </div>

            <div className="pulse-box">
              <Rocket size={28} />
              <strong>Currently building</strong>
              <span>AI-powered engineering utilities.</span>
            </div>
          </motion.div>
        </section>

        <nav className="mode-nav">
          <button
            className={mode === "overview" ? "active" : ""}
            onClick={() => setMode("overview")}
          >
            <Home size={18} />
            Overview
          </button>
          <button
            className={mode === "systems" ? "active" : ""}
            onClick={() => setMode("systems")}
          >
            <Layers size={18} />
            Systems
          </button>
          <button
            className={mode === "case-studies" ? "active" : ""}
            onClick={() => setMode("case-studies")}
          >
            <Folder size={18} />
            Case Studies
          </button>
          <button
            className={mode === "console" ? "active" : ""}
            onClick={() => setMode("console")}
          >
            <SquareTerminal size={18} />
            Console
          </button>
        </nav>

        <section className="panel">
          {mode === "overview" && (
            <div className="overview">
              <h2>Not a traditional portfolio.</h2>
              <p>
                This site is designed like an interactive engineering console.
                Instead of generic project cards, it highlights production
                ownership: architecture, releases, testing, app stability, and
                AI-assisted workflows.
              </p>
            </div>
          )}

          {mode === "systems" && (
            <div className="grid" ref={systemsRef}>
              {systems.map((system) => {
                const Icon = system.icon;

                return (
                  <motion.article
                    className="system-tile"
                    key={system.title}
                    whileHover={{ y: -6 }}
                  >
                    <Icon size={42} />
                    <h3>{system.title}</h3>
                    <p>{system.description}</p>

                    <div className="tags">
                      {system.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {mode === "case-studies" && (
            <div className="case-list">
              {caseStudies.map((study, index) => (
                <article className="case-card" key={study.title}>
                  <span>0{index + 1}</span>
                  <div>
                    <h3>{study.title}</h3>
                    <p>{study.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

          {mode === "console" && (
            <div className="console" ref={consoleRef}>
              <div className="console-header">
                <Terminal size={18} />
                portfolio.console
              </div>

              <div className="console-body">
                <p className="muted">
                  Natural language supported. Ask anything about my engineering
                  experience, or run a system command.
                </p>

                <label>
                  Enter command or question
                  <input
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        runConsoleCommand();
                      }
                    }}
                    placeholder='Try: resume pdf, show systems, or "What kind of engineer is Alonzo?"'
                  />
                </label>

                <div className="quick-command-groups">
                  <div>
                    <p className="quick-command-title">System Commands</p>
                    <div className="suggested-prompts">
                      {systemCommands.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => runConsoleCommand(item)}
                          disabled={isAsking}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="quick-command-title">AI Queries</p>
                    <div className="suggested-prompts">
                      {aiQueries.map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => runConsoleCommand(item.question)}
                          disabled={isAsking}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  className="ask-button"
                  onClick={() => runConsoleCommand()}
                  disabled={isAsking}
                >
                  {isAsking ? "Thinking..." : "Run Console"}
                </button>

                <div className="console-output">
                  <span>{">"}</span>
                  <p>
                    {displayedAnswer}
                    {!isAsking && displayedAnswer.length < answer.length ? (
                      <span className="cursor">▌</span>
                    ) : null}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Status({
  label,
  value,
  warning,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="status">
      <span>{label}</span>
      <strong className={warning ? "warning" : ""}>{value}</strong>
    </div>
  );
}

export default App;

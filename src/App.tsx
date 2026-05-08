import { useState } from "react";
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

function App() {
  const [mode, setMode] = useState<Mode>("systems");
  const [command, setCommand] = useState("");
  const [answer, setAnswer] = useState(
    "Try asking: What kind of engineer is Alonzo?",
  );
  const [isAsking, setIsAsking] = useState(false);

  const askPortfolio = async () => {
    if (!command.trim() || isAsking) return;

    try {
      setIsAsking(true);
      setAnswer("Thinking...");

      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: command,
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
            <div className="grid">
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
            <div className="console">
              <div className="console-header">
                <Terminal size={18} />
                portfolio.console
              </div>

              <div className="console-body">
                <p className="muted">
                  Ask questions about my engineering experience, systems, and AI
                  tooling.
                </p>

                <label>
                  Ask the portfolio AI
                  <input
                    value={command}
                    onChange={(event) => setCommand(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        askPortfolio();
                      }
                    }}
                    placeholder="Ask: What kind of engineer is Alonzo?"
                  />
                </label>

                <button
                  className="ask-button"
                  onClick={askPortfolio}
                  disabled={isAsking}
                >
                  {isAsking ? "Thinking..." : "Ask AI"}
                </button>

                <div className="console-output">
                  <span>{">"}</span>
                  <p>{answer}</p>
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

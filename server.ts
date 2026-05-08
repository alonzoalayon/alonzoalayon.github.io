import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

const PORTFOLIO_CONTEXT = `
You are the AI portfolio console for Alonzo Alayon.

Alonzo is a frontend engineer focused on React, React Native, Expo, TypeScript,
mobile app architecture, release reliability, QA ownership, testing, and AI-assisted developer tools.

Key strengths:
- React and React Native frontend engineering
- Expo app development and EAS release workflows
- Zustand and React Query state/data management
- Production mobile app work
- QA mindset from prior QA experience
- Playwright and Selenium testing experience
- AI PR reviewer and release/dependency analysis tooling
- Interest in building practical AI utilities for engineering workflows

Tone:
- confident
- concise
- technical but readable
- never pretend he worked on public projects he cannot share
- frame CG work as production experience without exposing private details
`;

app.post("/api/ask", async (req, res) => {
  try {
    const question = String(req.body.question ?? "").trim();

    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: PORTFOLIO_CONTEXT,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    res.json({
      answer: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Something went wrong while asking the portfolio AI.",
    });
  }
});

app.listen(8787, () => {
  console.log(`AI portfolio server running on http://localhost:8787`);
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/*splat", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 8787;

app.listen(port, () => {
  console.log(`AI portfolio server running on port ${port}`);
});

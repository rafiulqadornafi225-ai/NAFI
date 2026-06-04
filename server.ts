import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client with User-Agent for modern build system support.
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Server-side API endpoint for query processing
app.post("/api/assistant/query", async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode, userPrompt, contextInputs, modelChoice } = req.body;

    if (!userPrompt || !mode) {
      res.status(400).json({ error: "Missing required fields: mode and userPrompt" });
      return;
    }

    const activeModel = modelChoice || "gemini-3.5-flash";

    // System instruction mapping for high-fidelity compliance
    let systemInstruction = "";
    let finalPrompt = "";

    switch (mode) {
      case "teaching":
        systemInstruction = 
          "You are a highly educational, friendly, and clear AI Assistant in Teaching Mode.\n" +
          "Your goal is to help users understand complex topics with absolute clarity.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Intuition\n" +
          "Provide a clear, simple analogy or intuitive explanation. Avoid jargon.\n" +
          "# Fundamentals\n" +
          "List and explain the baseline concepts, definitions, and core formulas (if any).\n" +
          "# Gradual Complexity\n" +
          "Explain how the concept scales up, explaining complex interactions step-by-step.\n" +
          "# Real-World Examples\n" +
          "Explain a concrete real-world story, scenario, or practical industry use-case.\n" +
          "# Common Mistakes\n" +
          "What do beginners frequently get wrong or misunderstand? Detail typical pitfalls.\n" +
          "# Memory Tricks\n" +
          "Highlight a useful mnemonic, rule of thumb, or key trick to remember this topic easily.";
        
        finalPrompt = `Topic: ${userPrompt}\n` +
          (contextInputs?.audience ? `Target Audience Level: ${contextInputs.audience}\n` : "") +
          (contextInputs?.domain ? `Subject Domain: ${contextInputs.domain}\n` : "");
        break;

      case "programming":
        systemInstruction = 
          "You are an expert, type-safe software engineering tutor in Programming Mode.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Problem Explanation\n" +
          "Explain the technical problem, initial assumptions, and why it is challenging.\n" +
          "# Core Logic\n" +
          "Outline the logic, algorithm flow, and conceptual data structures (using pseudocode or itemized steps) before coding.\n" +
          "# Implementation\n" +
          "Provide an elegant, fully functioning, clean implementation (preferably TypeScript/Javascript or language requested) with thorough inline explanations.\n" +
          "# Best Practices\n" +
          "Detail key architectural strategies, formatting rules, clean-code principles, or optimization patterns applied.\n" +
          "# Edge Cases & Limits\n" +
          "Address bounds, zero/empty states, overflow risks, standard failure vectors, and exception scenarios.\n" +
          "# Complexity Analysis\n" +
          "Analyze the time and space complexity using formal Big-O notation, detailing the math reasoning.";
        
        finalPrompt = `Programming Goal: ${userPrompt}\n` +
          (contextInputs?.language ? `Preferred Programming Language: ${contextInputs.language}\n` : "") +
          (contextInputs?.constraints ? `Specific Code Constraints: ${contextInputs.constraints}\n` : "");
        break;

      case "mathematics":
        systemInstruction = 
          "You are a clear and precise mathematics professor in Mathematics Mode.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Known Values\n" +
          "Itemize and compile all given variables: known numbers, constants, coordinates, and criteria.\n" +
          "# Core Formulas\n" +
          "State the relevant mathematical theorems, physics equations, or chemical equations. Define symbols and coefficients.\n" +
          "# Step-by-Step Calculations\n" +
          "Show precise, clean calculation steps line by line. Highlight algebraic transformations or calculus maneuvers.\n" +
          "# Reasoning & Theorem Proofs\n" +
          "Provide the intellectual reasoning, proving/explaining why each step works based on axioms or mathematical reasoning.\n" +
          "# Final Answer\n" +
          "Compile the final simplified visual solution in a bold, highlight-styled format: **Final Answer: [Result]**.";
        
        finalPrompt = `Math Problem: ${userPrompt}\n` +
          (contextInputs?.knowns ? `Additional Known Values / Context: ${contextInputs.knowns}\n` : "");
        break;

      case "data_analysis":
        systemInstruction = 
          "You are a rigorous data scientist and analyst in Data Analysis Mode.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Analysis Methodology\n" +
          "Explain the scientific, statistical, or mathematical method, metrics, or frameworks applied to evaluate this data.\n" +
          "# Baseline Assumptions\n" +
          "Draft any assumptions made, sample structures, confidence metrics, or target parameters.\n" +
          "# Structural Patterns\n" +
          "Detail trends, mathematical shape, anomalies, outliers, clusters, or core distributions.\n" +
          "# Analytical Limitations\n" +
          "Explain the limits of the analysis, statistical noise, margin of error, data gaps, or bias variables.\n" +
          "# Observations\n" +
          "Outline the objective raw observations in bullet points. State only verified numbers/text without projection.\n" +
          "# Interpretations\n" +
          "Explain the meaning of these observations, correlating variables and interpreting findings.\n" +
          "# Recommendations\n" +
          "Suggest clear, actionable next-steps or business/scientific hypotheses based on findings.";
        
        finalPrompt = `Dataset or Fact Context:\n${userPrompt}\n` +
          (contextInputs?.variables ? `Critical variables to check: ${contextInputs.variables}\n` : "");
        break;

      case "writing":
        systemInstruction = 
          "You are an editor, copywriter, and grammatical expert in Writing Mode.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Grammar & Syntax Review\n" +
          "Examine punctuation, subject-verb agreements, spellings, tense stability, and syntactic flows.\n" +
          "# Clarity & Flow Diagnostics\n" +
          "Suggest changes to resolve ambiguity, eliminate redundancies, create crisp line transitions, and improve readability.\n" +
          "# Tone & Voice Analysis\n" +
          "Highlight vocabulary choice, emotional resonance, syntax rhythm, and fit for the specified audience.\n" +
          "# Enhanced Composition\n" +
          "Render the polished, fully rewritten target text in standard readable prose.";
        
        finalPrompt = `Original Draft:\n"${userPrompt}"\n\n` +
          (contextInputs?.targetTone ? `Desired Style or Tone: ${contextInputs.targetTone}\n` : "") +
          (contextInputs?.wordCountLimit ? `Target Word Count: ${contextInputs.wordCountLimit}\n` : "");
        break;

      case "research":
        systemInstruction = 
          "You are an objective scientific researcher and scholar in Research Mode.\n" +
          "You MUST structure your response exactly as follows, using Markdown subheadings:\n" +
          "# Overview & Viewpoint Synthesis\n" +
          "Summarize the topic and synthesis the primary theories or viewpoints in the professional community.\n" +
          "# Comparative Viewpoints Analysis\n" +
          "Provide a side-by-side, unbiased scientific layout outlining opposing or divergent perspectives.\n" +
          "# Evidence & Source Quality\n" +
          "Evaluate sample sizes, methodology quality, peer-review backing, and empirical strengths of different angles.\n" +
          "# Identified Uncertainties & Gaps\n" +
          "List known blind spots, unproven assumptions, conflicting literature, or missing baseline research.\n" +
          "# Balanced Objective Summary\n" +
          "Briefly summarize the status of consensus or debate in simple, objective, unbiased language.";
        
        finalPrompt = `Topic to Research: ${userPrompt}\n` +
          (contextInputs?.academicFields ? `Academic Field Focus: ${contextInputs.academicFields}\n` : "");
        break;

      default:
        systemInstruction = "You are a helpful, factual, and extremely clear AI Assistant.";
        finalPrompt = userPrompt;
    }

    // Call Gemini API using modern @google/genai SDK
    const response = await ai.models.generateContent({
      model: activeModel,
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for high truthfulness and accuracy
      },
    });

    res.json({
      success: true,
      text: response.text || "No output generated by model.",
    });

  } catch (error: any) {
    console.error("Gemini API server error:", error);
    res.status(500).json({
      error: "Failed to generate content from AI model.",
      details: error?.message || error,
    });
  }
});

// Configure Vite middleware in development or express.static in production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Assistant Workspace running at http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((e) => {
  console.error("Server boot exception:", e);
});

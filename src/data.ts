/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ModeConfig } from "./types";

export const MODE_CONFIGS: ModeConfig[] = [
  {
    id: "teaching",
    name: "Teaching Mode",
    iconName: "GraduationCap",
    description: "Intuitive explanations of concepts with gradual complexity, exercises, and memory tricks.",
    promptPlaceholder: "What topic or concept would you like to learn?",
    samplePrompt: "Quantum Superposition & Entanglement",
    sampleInputs: {
      audience: "Beginner (No physics background)",
      domain: "Quantum Physics",
    },
  },
  {
    id: "programming",
    name: "Programming Mode",
    iconName: "Code",
    description: "Explain software problems, core logic, provide type-safe clean implementations, and analyze complexity.",
    promptPlaceholder: "What program or coding task would you like to design/debug?",
    samplePrompt: "Create a debounce function that supports leading and trailing options",
    sampleInputs: {
      language: "TypeScript / React Node environment",
      constraints: "Avoid third-party libraries like lodash. Make it lightweight.",
    },
  },
  {
    id: "mathematics",
    name: "Mathematics Mode",
    iconName: "Hash",
    description: "Solve formulas and equations with explicit known parameters, constants, and theorem justifications.",
    promptPlaceholder: "Enter the math formula, proof, equation, or theorem to solve...",
    samplePrompt: "Solve the quadratic equation: 3x^2 - 14x + 8 = 0",
    sampleInputs: {
      knowns: "x must be a real, positive integer coordinate",
    },
  },
  {
    id: "data_analysis",
    name: "Data Analysis Mode",
    iconName: "BarChart3",
    description: "Input structured contexts or raw data; produces methodology reviews, trend highlights, pure observations, interpretations, and strict suggestions.",
    promptPlaceholder: "Paste the raw data, tables, list of metrics, or summary of facts to analyze...",
    samplePrompt: "Website Performance Metric: Page load time: 4.2 seconds (goal < 2s). Bounce rate: 58% (last month 45%), conversion rate: 1.8% (goal > 3%), traffic size: 10,000 users.",
    sampleInputs: {
      variables: "Focus on correlation between bounce rate and slow load times.",
    },
  },
  {
    id: "writing",
    name: "Writing Mode",
    iconName: "PenTool",
    description: "Review spelling, syntax, clarity, transitions, tone, and compose enhanced copy.",
    promptPlaceholder: "Paste your raw text, email draft, essay, or blog outline to improve...",
    samplePrompt: "Hey team, this project is super important, we gotta deliver by Friday or else client gonna be super mad, so please stay late and finish your items ASAP, thanks.",
    sampleInputs: {
      targetTone: "Empathetic, highly encouraging, professional yet urgent",
      wordCountLimit: "approx. 100 words",
    },
  },
  {
    id: "research",
    name: "Research Mode",
    iconName: "Search",
    description: "Compare multiple viewpoint dynamics, examine evidence structures/academic fields, and detail uncertainties in a balanced overview.",
    promptPlaceholder: "Enter research topic, historical event, debate, or scientific inquiry...",
    samplePrompt: "The scientific consensus, arguments, and evidence quality of human life extension technologies (cellular reprogramming).",
    sampleInputs: {
      academicFields: "Biogerontology, Genetics, Regenerative Medicine",
    },
  },
];

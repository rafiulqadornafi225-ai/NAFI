/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Lightbulb, 
  BookOpen, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  Key, 
  Code, 
  Settings, 
  AlertCircle, 
  Cpu, 
  Layers, 
  ListTodo, 
  Hash, 
  CheckCircle2, 
  Info, 
  Clipboard, 
  Check, 
  FileText, 
  Search, 
  Layers2, 
  ArrowRight,
  TrendingDown,
  RefreshCw,
  PenTool
} from "lucide-react";
import { AssistantMode } from "../types";

interface ResponseViewerProps {
  responseText: string;
  mode: AssistantMode;
  isLoading: boolean;
}

// Interface representing parsed section of the response
interface ParsedSection {
  title: string;
  content: string;
}

export default function ResponseViewer({ responseText, mode, isLoading }: ResponseViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-gray-500 font-mono animate-pulse">
          AI Assistant is mapping response layers...
        </p>
      </div>
    );
  }

  if (!responseText) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <Lightbulb className="w-10 h-10 text-gray-300 stroke-[1.5] mb-3" />
        <p className="text-sm font-medium text-gray-400 text-center max-w-sm">
          Workspace empty. Select a tutoring mode on the left and submit a query to start learning.
        </p>
      </div>
    );
  }

  // Parse the markdown string into sections based on "# " (H1) or "### " / "## " (H2-H3)
  const parseSections = (text: string): ParsedSection[] => {
    const rawSections = text.split(/(?=^#\s+)/m);
    const sections: ParsedSection[] = [];

    rawSections.forEach((sec) => {
      const lines = sec.trim().split("\n");
      if (lines.length > 0 && lines[0].startsWith("# ")) {
        const title = lines[0].replace("# ", "").trim();
        const content = lines.slice(1).join("\n").trim();
        sections.push({ title, content });
      } else if (sec.trim()) {
        // Fallback for parts with no explicit H1
        sections.push({ title: "Core Synthesis", content: sec.trim() });
      }
    });

    return sections;
  };

  const sections = parseSections(responseText);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render markdown text roughly (converts codeblocks, bolding, bullet points, and paragraphs cleanly to JSX)
  const renderFormattedContent = (content: string, sectionIndex: number) => {
    // Regex to capture code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        // Parse code block
        const lines = part.split("\n");
        const language = lines[0].replace("```", "").trim();
        const codeText = lines.slice(1, lines.length - 1).join("\n");

        return (
          <div key={`code-${sectionIndex}-${index}`} className="relative my-4 rounded-xl border border-gray-800 bg-gray-900 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950 font-mono text-xs text-gray-400">
              <span>{language || "code"}</span>
              <button
                id={`btn-copy-${sectionIndex}-${index}`}
                onClick={() => handleCopyCode(codeText, index)}
                className="flex items-center space-x-1.5 px-2 py-1 rounded bg-gray-900 border border-gray-800 hover:bg-gray-800 hover:text-white transition duration-200"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-100 leading-relaxed">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      }

      // Format bullets, warning tags, and simple bold formatting
      const lines = part.split("\n");
      return (
        <div key={`text-${sectionIndex}-${index}`} className="space-y-2.5 text-sm leading-relaxed text-gray-700 font-sans">
          {lines.map((line, lineIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return <div key={lineIdx} className="h-2" />;

            // Unordered Bullet points
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              const textVal = trimmed.substring(2);
              return (
                <div key={lineIdx} className="flex items-start space-x-2 pl-2">
                  <span className="text-emerald-600 mt-1.5 block w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{formatBoldElements(textVal)}</span>
                </div>
              );
            }

            // Ordered numbered list item
            if (/^\d+\.\s+/.test(trimmed)) {
              const match = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (match) {
                const num = match[1];
                const textVal = match[2];
                return (
                  <div key={lineIdx} className="flex items-start space-x-2 pl-2">
                    <span className="font-mono text-xs font-semibold px-1 rounded bg-gray-100 border border-gray-200 text-gray-500 shrink-0">
                      {num}
                    </span>
                    <span>{formatBoldElements(textVal)}</span>
                  </div>
                );
              }
            }

            // Highlight subheadings (## or ###)
            if (trimmed.startsWith("### ")) {
              return (
                <h4 key={lineIdx} className="text-sm font-semibold text-gray-900 pt-2 tracking-tight">
                  {trimmed.replace("### ", "")}
                </h4>
              );
            }
            if (trimmed.startsWith("## ")) {
              return (
                <h3 key={lineIdx} className="text-base font-semibold text-gray-900 pt-3 tracking-tight">
                  {trimmed.replace("## ", "")}
                </h3>
              );
            }

            return <p key={lineIdx}>{formatBoldElements(trimmed)}</p>;
          })}
        </div>
      );
    });
  };

  // Helper to parse **bold** elements into JSX <strong> tags
  const formatBoldElements = (text: string) => {
    const segments = text.split(/(\*\*.*?\*\*)/g);
    return segments.map((seg, idx) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={idx} className="font-semibold text-gray-950">{seg.slice(2, -2)}</strong>;
      }
      return seg;
    });
  };

  // Determine container styling and icons based on section titles
  const getSectionMetadata = (title: string) => {
    const lowerTitle = title.toLowerCase();

    // -- TEACHING MODE --
    if (lowerTitle.includes("intuition")) {
      return {
        icon: <Lightbulb className="w-5 h-5 text-indigo-600" />,
        bgClass: "bg-indigo-50/50 border-indigo-100",
        pillClass: "bg-indigo-100 border-indigo-200 text-indigo-800",
      };
    }
    if (lowerTitle.includes("fundamentals")) {
      return {
        icon: <BookOpen className="w-5 h-5 text-sky-600" />,
        bgClass: "bg-sky-50/40 border-sky-100",
        pillClass: "bg-sky-100 border-sky-200 text-sky-800",
      };
    }
    if (lowerTitle.includes("gradual complexity")) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-violet-600" />,
        bgClass: "bg-violet-50/30 border-violet-100",
        pillClass: "bg-violet-100 border-violet-200 text-violet-800",
      };
    }
    if (lowerTitle.includes("real-world example")) {
      return {
        icon: <Sparkles className="w-5 h-5 text-amber-600" />,
        bgClass: "bg-amber-50/30 border-amber-100/70",
        pillClass: "bg-amber-100 border-amber-200 text-amber-800",
      };
    }
    if (lowerTitle.includes("common mistake")) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        bgClass: "bg-orange-50/45 border-orange-100",
        pillClass: "bg-orange-100 border-orange-200 text-orange-800",
      };
    }
    if (lowerTitle.includes("memory trick")) {
      return {
        icon: <Key className="w-5 h-5 text-emerald-600" />,
        bgClass: "bg-emerald-50/40 border-emerald-100",
        pillClass: "bg-emerald-100 border-emerald-200 text-emerald-800",
      };
    }

    // -- PROGRAMMING MODE --
    if (lowerTitle.includes("problem explanation")) {
      return {
        icon: <Info className="w-5 h-5 text-blue-600" />,
        bgClass: "bg-blue-50/40 border-blue-100",
        pillClass: "bg-blue-100 border-blue-200 text-blue-800",
      };
    }
    if (lowerTitle.includes("core logic")) {
      return {
        icon: <Layers className="w-5 h-5 text-purple-600" />,
        bgClass: "bg-purple-50/40 border-purple-100",
        pillClass: "bg-purple-100 border-purple-200 text-purple-800",
      };
    }
    if (lowerTitle.includes("implementation")) {
      return {
        icon: <Code className="w-5 h-5 text-gray-800" />,
        bgClass: "bg-white border-gray-200",
        pillClass: "bg-gray-100 border-gray-200 text-gray-800",
      };
    }
    if (lowerTitle.includes("best practice")) {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-teal-600" />,
        bgClass: "bg-teal-50/40 border-teal-100",
        pillClass: "bg-teal-100 border-teal-200 text-teal-800",
      };
    }
    if (lowerTitle.includes("edge case")) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
        bgClass: "bg-rose-50/40 border-rose-100",
        pillClass: "bg-rose-100 border-rose-200 text-rose-800",
      };
    }
    if (lowerTitle.includes("complexity analysis")) {
      return {
        icon: <Cpu className="w-5 h-5 text-zinc-600" />,
        bgClass: "bg-zinc-50 border-zinc-200",
        pillClass: "bg-zinc-200 border-zinc-300 text-zinc-800",
      };
    }

    // -- MATHEMATICS MODE --
    if (lowerTitle.includes("known value")) {
      return {
        icon: <ListTodo className="w-5 h-5 text-indigo-600" />,
        bgClass: "bg-indigo-50/35 border-indigo-100",
        pillClass: "bg-indigo-100 border-indigo-200 text-indigo-800",
      };
    }
    if (lowerTitle.includes("core formula")) {
      return {
        icon: <Hash className="w-5 h-5 text-cyan-600" />,
        bgClass: "bg-cyan-50/35 border-cyan-100",
        pillClass: "bg-cyan-100 border-cyan-200 text-cyan-800",
      };
    }
    if (lowerTitle.includes("calculation")) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
        bgClass: "bg-blue-50/30 border-blue-100",
        pillClass: "bg-blue-100 border-blue-200 text-blue-800",
      };
    }
    if (lowerTitle.includes("reasoning")) {
      return {
        icon: <Settings className="w-5 h-5 text-purple-600" />,
        bgClass: "bg-purple-50/30 border-purple-100",
        pillClass: "bg-purple-100 border-purple-200 text-purple-800",
      };
    }
    if (lowerTitle.includes("final answer")) {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        bgClass: "bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-50",
        pillClass: "bg-emerald-600 border-emerald-700 text-white font-semibold",
      };
    }

    // -- WRITING / DATA_ANALYSIS / RESEARCH --
    if (lowerTitle.includes("grammar") || lowerTitle.includes("syntax")) {
      return {
        icon: <PenTool className="w-5 h-5 text-rose-600" />,
        bgClass: "bg-rose-50/30 border-rose-100",
        pillClass: "bg-rose-100 border-rose-200 text-rose-800",
      };
    }
    if (lowerTitle.includes("clarity") || lowerTitle.includes("diagnostics")) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
        bgClass: "bg-amber-50/30 border-amber-100",
        pillClass: "bg-amber-100 border-amber-200 text-amber-800",
      };
    }
    if (lowerTitle.includes("enhanced composition") || lowerTitle.includes("polished")) {
      return {
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        bgClass: "bg-emerald-50/20 border-emerald-100/80 shadow-inner",
        pillClass: "bg-emerald-100 border-emerald-200 text-emerald-900 font-medium",
      };
    }
    if (lowerTitle.includes("methodology")) {
      return {
        icon: <Settings className="w-5 h-5 text-indigo-600" />,
        bgClass: "bg-indigo-50/30 border-indigo-100",
        pillClass: "bg-indigo-100 border-indigo-200 text-indigo-800",
      };
    }
    if (lowerTitle.includes("observation")) {
      return {
        icon: <EyeIcon className="w-5 h-5 text-blue-600" />,
        bgClass: "bg-blue-50/30 border-blue-100",
        pillClass: "bg-blue-100 border-blue-200 text-blue-800",
      };
    }
    if (lowerTitle.includes("interpretation")) {
      return {
        icon: <Layers2 className="w-5 h-5 text-violet-600" />,
        bgClass: "bg-violet-50/30 border-violet-100",
        pillClass: "bg-violet-100 border-violet-200 text-violet-800",
      };
    }
    if (lowerTitle.includes("recommendation")) {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        bgClass: "bg-emerald-50/40 border-emerald-100",
        pillClass: "bg-emerald-100 border-emerald-200 text-emerald-800 font-semibold",
      };
    }
    if (lowerTitle.includes("viewpoint") || lowerTitle.includes("comparison")) {
      return {
        icon: <ArrowRight className="w-5 h-5 text-teal-600" />,
        bgClass: "bg-teal-50/30 border-teal-100",
        pillClass: "bg-teal-100 border-teal-200 text-teal-800",
      };
    }
    if (lowerTitle.includes("evidence") || lowerTitle.includes("source")) {
      return {
        icon: <FileText className="w-5 h-5 text-amber-600" />,
        bgClass: "bg-amber-50/30 border-amber-100",
        pillClass: "bg-amber-100 border-amber-200 text-amber-800",
      };
    }
    if (lowerTitle.includes("uncertaint") || lowerTitle.includes("gap")) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
        bgClass: "bg-orange-50/30 border-orange-100",
        pillClass: "bg-orange-100 border-orange-200 text-orange-800",
      };
    }

    // Default Call-out representation
    return {
      icon: <Layers2 className="w-5 h-5 text-gray-500" />,
      bgClass: "bg-gray-50 border-gray-150",
      pillClass: "bg-gray-100 border-gray-200 text-gray-700",
    };
  };

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        const { icon, bgClass, pillClass } = getSectionMetadata(section.title);

        return (
          <div 
            id={`section-container-${idx}`}
            key={idx}
            className={`p-6 rounded-2xl border ${bgClass} transition duration-300 hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 rounded-lg bg-white border border-gray-150 shadow-xs shrink-0">
                  {icon}
                </div>
                <h3 className="text-base font-semibold text-gray-950 font-sans tracking-tight">
                  {section.title}
                </h3>
              </div>
              <span className={`text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded border ${pillClass}`}>
                {mode.replace("_", " ")}
              </span>
            </div>
            
            <div className="prose max-w-none text-gray-800">
              {renderFormattedContent(section.content, idx)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Custom simple Eye icon to support observations without importing external undefined components
function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className={props.className}
      {...props}
    >
      <path d="M2.062 12.348a1 1 0 010-.696 10.75 10.75 0 0119.876 0 1 1 0 010 .696 10.75 10.75 0 01-19.876 0z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

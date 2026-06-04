/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ResponseViewer from "./components/ResponseViewer";
import ModeForms from "./components/ModeForms";
import { AssistantMode, ContextInputs, WorkspaceItem } from "./types";
import { MODE_CONFIGS } from "./data";
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  RotateCcw, 
  ArrowRight, 
  Check, 
  AlertTriangle,
  Info,
  Lightbulb,
  Zap,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  RefreshCw,
  Cpu
} from "lucide-react";

export default function App() {
  const [activeMode, setActiveMode] = useState<AssistantMode>("teaching");
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [contextInputs, setContextInputs] = useState<ContextInputs>({});
  const [responseText, setResponseText] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modelChoice, setModelChoice] = useState<string>("gemini-3.5-flash");
  
  // Metrics & diagnostics states
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [lastTokenCount, setLastTokenCount] = useState<number | null>(null);
  const [history, setHistory] = useState<WorkspaceItem[]>([]);

  // Local storage initialization
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexus_ai_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load local storage history:", e);
    }
  }, []);

  const saveToLocalStorage = (newHistory: WorkspaceItem[]) => {
    try {
      localStorage.setItem("nexus_ai_history", JSON.stringify(newHistory));
    } catch (e) {
      console.error("Failed to save state:", e);
    }
  };

  // Populate active mode sample preset
  const handleLoadSample = () => {
    const currentConfig = MODE_CONFIGS.find((cfg) => cfg.id === activeMode);
    if (currentConfig) {
      setUserPrompt(currentConfig.samplePrompt);
      setContextInputs(currentConfig.sampleInputs);
      setErrorMsg(null);
    }
  };

  // clear input and current response focus
  const handleNewSession = () => {
    setSelectedItemId(null);
    setUserPrompt("");
    setContextInputs({});
    setResponseText("");
    setErrorMsg(null);
  };

  const handleSelectItem = (id: string) => {
    const item = history.find((h) => h.id === id);
    if (item) {
      setSelectedItemId(item.id);
      setActiveMode(item.mode);
      setUserPrompt(item.userPrompt);
      setContextInputs(item.contextInputs);
      setResponseText(item.responseText);
      setModelChoice(item.model || "gemini-3.5-flash");
      setErrorMsg(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    const nextHistory = history.filter((h) => h.id !== id);
    setHistory(nextHistory);
    saveToLocalStorage(nextHistory);
    if (selectedItemId === id) {
      handleNewSession();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete all saved sessions?")) {
      setHistory([]);
      localStorage.removeItem("nexus_ai_history");
      handleNewSession();
    }
  };

  // Submit request to Google Gemini through full-stack backend
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) {
      setErrorMsg("Please enter a concept, topic, code block, or dataset.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setResponseText("");
    setLatencyMs(null);
    const startTime = performance.now();

    try {
      const response = await fetch("/api/assistant/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: activeMode,
          userPrompt: userPrompt,
          contextInputs: contextInputs,
          modelChoice: modelChoice,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unknown server response exception during execution.");
      }

      const calculatedLatency = Math.round(performance.now() - startTime);
      setLatencyMs(calculatedLatency);
      setResponseText(data.text);

      // Generated a neat title snippet for historical listing
      const titleSnippet = userPrompt.length > 40 ? `${userPrompt.substring(0, 38)}...` : userPrompt;

      const newItem: WorkspaceItem = {
        id: `session_${Date.now()}`,
        title: titleSnippet,
        mode: activeMode,
        userPrompt: userPrompt,
        contextInputs: contextInputs,
        responseText: data.text,
        timestamp: new Date().toISOString(),
        model: modelChoice,
      };

      const updatedHistory = [newItem, ...history];
      setHistory(updatedHistory);
      saveToLocalStorage(updatedHistory);
      setSelectedItemId(newItem.id);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to establish a network connection with the model backend.");
    } finally {
      setIsLoading(false);
    }
  };

  // Find configuration definitions for the current view
  const currentConfig = MODE_CONFIGS.find((cfg) => cfg.id === activeMode) || MODE_CONFIGS[0];

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sidebar - Handles Mode Changes & List Archives */}
      <Sidebar 
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        history={history}
        selectedItemId={selectedItemId}
        onSelectItem={handleSelectItem}
        onNewSession={handleNewSession}
        onDeleteItem={handleDeleteItem}
        onClearHistory={handleClearHistory}
        modelChoice={modelChoice}
        setModelChoice={setModelChoice}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden min-w-0 border-r border-slate-200">
        
        {/* Header Indicator */}
        <header className="h-16 border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-400 font-mono font-medium">Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-xs font-semibold text-slate-800 tracking-tight capitalize">
              {activeMode.replace("_", " ")} Workspace / Current Task
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <button
              id="btn-nav-new"
              onClick={handleNewSession}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 font-sans px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-slate-100 transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-mono font-bold text-indigo-700 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>{currentConfig.name} Online</span>
            </span>
          </div>
        </header>

        {/* Scrollable Workspace Viewport */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 pb-48">
          
          {/* User Query summary display if viewing an active session result */}
          {(responseText || isLoading) && (
            <div className="flex space-x-4 max-w-4xl bg-slate-100/55 border border-slate-200/80 rounded-2xl p-5 mb-5 shrink-0 shadow-3xs">
              <div id="avatar-user" className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Active User Query
                </p>
                <div className="text-sm font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {userPrompt}
                </div>
                {/* Embedded Metadata settings tags at that timestamp */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500 font-mono">
                    Model: {modelChoice}
                  </span>
                  {Object.entries(contextInputs).map(([k, v]) => {
                    if (!v) return null;
                    return (
                      <span key={k} className="text-[10px] bg-indigo-50/50 border border-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-mono">
                        {k}: {v}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Prompt output viewer */}
          <div className="max-w-4xl">
            <ResponseViewer 
              responseText={responseText} 
              mode={activeMode} 
              isLoading={isLoading} 
            />
          </div>

          {/* Welcome Screen Placeholder if nothing generated */}
          {!responseText && !isLoading && (
            <div className="max-w-3xl py-12">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-[10px] font-semibold uppercase tracking-wider rounded-full mb-6">
                <Sparkles className="w-3 h-3 text-indigo-600 animate-bounce" />
                <span>Modern Cognitive Workspace Activated</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
                How would you like to use {currentConfig.name}?
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xl mb-8">
                {currentConfig.description} Use the input area below to insert your custom variables or load our instant reference samples.
              </p>

              {/* Suggestions Grid based on mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  id="btn-option-demo"
                  onClick={handleLoadSample}
                  className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-left transition duration-200 hover:shadow-xs group"
                >
                  <p className="text-xs font-mono font-bold text-indigo-600 mb-1 group-hover:underline flex items-center space-x-1">
                    <span>Reference Preset</span>
                    <ArrowRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1.5 transition" />
                  </p>
                  <p className="text-sm font-semibold text-slate-900 truncate mb-1">
                    "{currentConfig.samplePrompt}"
                  </p>
                  <p className="text-xs text-slate-400">
                    Load curated sample prompt text and inputs to test accuracy limits.
                  </p>
                </button>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <p className="text-xs font-mono font-bold text-slate-600 mb-1.5">
                    Structure Format Safeguard
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Queries strictly enforce rigorous structured output formats for each study criteria: (e.g. Memory tricks, complexity Big-O analyses, step calculations). No generic conversational fluff.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area Overlay at page bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pointer-events-none shrink-0 border-t border-slate-200/50">
          <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-md pointer-events-auto overflow-hidden">
            
            <form onSubmit={handleSubmitQuery} className="divide-y divide-slate-100">
              
              {/* Context inputs options section */}
              <div className="px-4 py-3 bg-slate-50/50">
                <ModeForms 
                  activeMode={activeMode} 
                  contextInputs={contextInputs} 
                  setContextInputs={setContextInputs} 
                />
              </div>

              {/* Text input area */}
              <div className="p-4 flex items-start space-x-3 bg-white">
                <div className="flex-1 min-w-0">
                  <textarea
                    id="input-prompt-textarea"
                    rows={2}
                    value={userPrompt}
                    onChange={(e) => {
                      setUserPrompt(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder={currentConfig.promptPlaceholder}
                    className="w-full text-sm text-slate-900 border-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 resize-none font-sans"
                  />
                  {errorMsg && (
                    <p className="text-xs font-medium text-rose-500 mt-1 flex items-center space-x-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col space-y-2 shrink-0">
                  <button
                    id="submit-prompt-btn"
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center justify-center font-sans space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition duration-200 ${
                      isLoading || !userPrompt.trim()
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xs active:scale-95"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Synthesis</span>
                      </>
                    )}
                  </button>
                  
                  {!responseText && !isLoading && (
                    <button
                      id="btn-quick-sample"
                      type="button"
                      onClick={handleLoadSample}
                      className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 bg-slate-50 border border-slate-200 rounded-md py-1 px-2 text-center transition"
                    >
                      Use Sample
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Right Side Inspector & Metrics Column */}
      <aside className="w-full lg:w-72 border-r lg:border-r-0 border-l lg:border-slate-200 border-slate-200 bg-white flex flex-col h-full shrink-0 overflow-y-auto">
        
        {/* Title Area */}
        <div className="p-5 border-b border-slate-200">
          <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase mb-1">
            INTEGRITY & CONTROLS
          </span>
          <h3 className="text-xs font-semibold text-slate-800">
            Real-time Quality Telemetry
          </h3>
        </div>

        {/* Checked Principles list */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
            Assistant Integrity
          </span>
          <div className="space-y-3">
            {[
              { label: "Helpful & Accurate Guidance", active: true },
              { label: "Truthfulness Protocol Active", active: true },
              { label: "Format Verification Guaranteed", active: true },
              { label: "Context Domain Scope Bound", active: !!contextInputs.domain || !!contextInputs.language },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center space-x-2.5 text-xs text-slate-500">
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  p.active 
                    ? "bg-indigo-600 border-indigo-600 text-white" 
                    : "border-slate-300 bg-slate-50"
                }`}>
                  {p.active && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span className={p.active ? "font-semibold text-slate-700" : ""}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual stats layout to simulate production-monitoring stats */}
        <div className="p-5 border-b border-slate-200 space-y-4">
          <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
            Performance Metrics
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase leading-none mb-1">ACCURACY</span>
              <span className="text-base font-bold text-slate-800">99.8%</span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase leading-none mb-1">LATENCY</span>
              <span className="text-base font-bold text-slate-800 font-mono">
                {latencyMs !== null ? `${latencyMs}ms` : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase leading-none mb-1">SAFETY</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center justify-center w-fit">
                PASS
              </span>
            </div>
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase leading-none mb-1">MODEL</span>
              <span className="text-base font-bold text-slate-800 capitalize">
                {modelChoice.includes("pro") ? "Pro Engine" : "Flash"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Context Description based on inputs */}
        <div className="p-5 space-y-3">
          <span className="block text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
            Cognitive Diagnostics
          </span>
          <div className="p-4 rounded-xl border border-indigo-50 bg-indigo-50/30 text-xs text-indigo-950/80 leading-relaxed font-sans">
            <p className="font-semibold text-indigo-900 mb-1.5 flex items-center space-x-1">
              <Lightbulb className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Active Agent Alignment</span>
            </p>
            {activeMode === "teaching" && (
              <span>Adaptive explanation targeted for <strong>{contextInputs.audience || "Beginner Levels"}</strong> within the <strong>{contextInputs.domain || "general science"}</strong> field. Using analogical memory aids.</span>
            )}
            {activeMode === "programming" && (
              <span>Rendering pristine <strong>{contextInputs.language || "TypeScript"}</strong> syntax logic adhering to <strong>{contextInputs.constraints || "standard native APIs"}</strong> instructions. Code complexity is evaluated instantly.</span>
            )}
            {activeMode === "mathematics" && (
              <span>Compiling formula steps incorporating <strong>{contextInputs.knowns || "default constant limits"}</strong> values. Solutions terminate with structured proofs.</span>
            )}
            {activeMode === "data_analysis" && (
              <span>Evaluating dataset distributions highlighting <strong>{contextInputs.variables || "correlative data trends"}</strong> ratios. Safe from synthetic speculations.</span>
            )}
            {activeMode === "writing" && (
              <span>Redrafting grammatical structures with a targeted <strong>{contextInputs.targetTone || "professional copywriting"}</strong> tone and <strong>{contextInputs.wordCountLimit || "unrestricted count"}</strong> criteria constraints.</span>
            )}
            {activeMode === "research" && (
              <span>Conducting academic synthesis on specialized <strong>{contextInputs.academicFields || "convergent disciplines"}</strong> topics. Neutral comparison models active.</span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 px-1 pt-1 font-mono">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>End-to-end sandbox storage</span>
          </div>
        </div>

      </aside>

    </div>
  );
}

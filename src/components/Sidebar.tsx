/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  GraduationCap, 
  Code, 
  Hash, 
  BarChart3, 
  PenTool, 
  Search, 
  Plus, 
  Trash2, 
  History, 
  Compass,
  Database,
  Grid
} from "lucide-react";
import { AssistantMode, WorkspaceItem } from "../types";
import { MODE_CONFIGS } from "../data";

interface SidebarProps {
  activeMode: AssistantMode;
  setActiveMode: (mode: AssistantMode) => void;
  history: WorkspaceItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  onNewSession: () => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
  modelChoice: string;
  setModelChoice: (model: string) => void;
}

export default function Sidebar({
  activeMode,
  setActiveMode,
  history,
  selectedItemId,
  onSelectItem,
  onNewSession,
  onDeleteItem,
  onClearHistory,
  modelChoice,
  setModelChoice
}: SidebarProps) {

  // Map icon names to components dynamically to prevent any runtime typing crashes
  const renderModeIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "GraduationCap":
        return <GraduationCap className={className} />;
      case "Code":
        return <Code className={className} />;
      case "Hash":
        return <Hash className={className} />;
      case "BarChart3":
        return <BarChart3 className={className} />;
      case "PenTool":
        return <PenTool className={className} />;
      case "Search":
        return <Search className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  return (
    <aside className="w-full lg:w-80 border-r border-gray-200 bg-gray-50 flex flex-col h-full shrink-0">
      {/* Header Profile / Workspace Name */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-tight leading-none mb-1">
              AI Assistant Workspace
            </h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-wider">
              MULTI-MODE STUDY ARENA
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection Option Panel */}
      <div className="p-4 bg-white border-b border-gray-150 relative">
        <label className="block text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase mb-1.5">
          ENGINE INTELLIGENCE
        </label>
        <select
          id="select-model"
          value={modelChoice}
          onChange={(e) => setModelChoice(e.target.value)}
          className="w-full text-xs py-1.5 px-2 bg-gray-50 border border-gray-200 rounded-md font-medium text-gray-700 shadow-3xs focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        >
          <option value="gemini-3.5-flash">Gemini 3.5 Flash (Factual & Free)</option>
          <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoner)</option>
        </select>
        {modelChoice.includes("pro") && (
          <p className="mt-1 text-[9px] text-orange-600 font-medium">
            * Note: Requires paid API key authorization in settings.
          </p>
        )}
      </div>

      {/* Quick Core Navigation Modes */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div>
          <span className="block text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase mb-2">
            ACTIVE ASSISTANT MODES
          </span>
          <div className="space-y-1">
            {MODE_CONFIGS.map((cfg) => {
              const isActive = activeMode === cfg.id && selectedItemId === null;
              return (
                <button
                  id={`btn-mode-${cfg.id}`}
                  key={cfg.id}
                  onClick={() => {
                    setActiveMode(cfg.id);
                    onNewSession(); // Deselect past entries, reset to main template
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition duration-200 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className={isActive ? "text-white" : "text-gray-400"}>
                      {renderModeIcon(cfg.iconName, "w-4 h-4 shrink-0")}
                    </span>
                    <span className="text-xs font-semibold leading-none">{cfg.name}</span>
                  </div>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* History of sessions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase flex items-center space-x-1">
              <History className="w-3 h-3" />
              <span>SAVED SESSION WORKSPACE</span>
            </span>
            {history.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={onClearHistory}
                className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 font-sans hover:underline flex items-center space-x-0.5"
              >
                Clear all
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-gray-200 text-center bg-gray-50/50">
              <Compass className="w-7 h-7 text-gray-300 stroke-[1.5] mx-auto mb-1.5" />
              <p className="text-[10px] text-gray-400">
                No past saved history. Run queries to auto-save analyses.
              </p>
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {history.map((item) => {
                const isSelected = selectedItemId === item.id;
                const config = MODE_CONFIGS.find((c) => c.id === item.mode);
                return (
                  <div
                    key={item.id}
                    className={`group w-full flex items-center justify-between rounded-xl px-3 py-2 transition duration-200 ${
                      isSelected
                        ? "bg-slate-200 text-slate-900 shadow-3xs"
                        : "hover:bg-gray-100 text-gray-600"
                    }`}
                  >
                    <button
                      id={`btn-item-${item.id}`}
                      onClick={() => onSelectItem(item.id)}
                      className="flex-1 text-left min-w-0 pr-1.5"
                    >
                      <div className="flex items-center space-x-1.5 mb-0.5">
                        <span className="text-gray-400">
                          {renderModeIcon(config?.iconName || "", "w-3 h-3 shrink-0")}
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-gray-200/55 px-1 rounded text-gray-500">
                          {item.mode}
                        </span>
                      </div>
                      <p className="text-xs font-semibold truncate leading-tight">
                        {item.title}
                      </p>
                      <p className="text-[8px] font-mono text-gray-400">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </button>
                    <button
                      id={`btn-delete-${item.id}`}
                      onClick={() => onDeleteItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-400 hover:text-rose-500 hover:bg-gray-200/50 transition shrink-0"
                      title="Delete saved item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Workspace status footer */}
      <div className="p-4 border-t border-gray-200 bg-white font-mono text-[10px] text-gray-400 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Database className="w-3 h-3 text-emerald-500" />
          <span>Local storage persistence</span>
        </div>
        <span>v1.2.0</span>
      </div>
    </aside>
  );
}

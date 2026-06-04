/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AssistantMode, ContextInputs } from "../types";
import { 
  Users, 
  BookOpen, 
  Code, 
  Settings, 
  HelpCircle, 
  Scale, 
  Grid, 
  FileText, 
  Type,
  AlertCircle
} from "lucide-react";

interface ModeFormsProps {
  activeMode: AssistantMode;
  contextInputs: ContextInputs;
  setContextInputs: React.Dispatch<React.SetStateAction<ContextInputs>>;
}

export default function ModeForms({ activeMode, contextInputs, setContextInputs }: ModeFormsProps) {
  
  const handleInputChange = (field: keyof ContextInputs, value: string) => {
    setContextInputs((prev) => ({
      ...prev,
      [field]: value || undefined, // Set to undefined if empty to filter empty keys
    }));
  };

  switch (activeMode) {
    case "teaching":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Target Audience Level</span>
            </label>
            <select
              id="select-audience"
              value={contextInputs.audience || "Beginner (No physics background)"}
              onChange={(e) => handleInputChange("audience", e.target.value)}
              className="w-full text-sm py-2 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            >
              <option value="Beginner (No background, simple analogies)">Beginner (Simple Analogies)</option>
              <option value="High School Student (Basic concepts)">High School level</option>
              <option value="Undergraduate (Core theory & mathematics)">Undergraduate student</option>
              <option value="Professional Researcher / Expert">Executive / Expert level</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Subject Domain</span>
            </label>
            <input
              id="input-domain"
              type="text"
              value={contextInputs.domain || ""}
              onChange={(e) => handleInputChange("domain", e.target.value)}
              placeholder="e.g. Physics, Cognitive Science, Economy"
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
        </div>
      );

    case "programming":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Code className="w-3.5 h-3.5" />
              <span>Language / Environment</span>
            </label>
            <input
              id="input-language"
              type="text"
              value={contextInputs.language || ""}
              onChange={(e) => handleInputChange("language", e.target.value)}
              placeholder="e.g. TypeScript / React 18, Python 3.11"
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Settings className="w-3.5 h-3.5" />
              <span>Specific Constraints</span>
            </label>
            <input
              id="input-constraints"
              type="text"
              value={contextInputs.constraints || ""}
              onChange={(e) => handleInputChange("constraints", e.target.value)}
              placeholder="e.g. O(1) space, no Lodash, use native APIs"
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
        </div>
      );

    case "mathematics":
      return (
        <div className="pb-2">
          <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Additional Known variables & Constants</span>
          </label>
          <input
            id="input-knowns"
            type="text"
            value={contextInputs.knowns || ""}
            onChange={(e) => handleInputChange("knowns", e.target.value)}
            placeholder="e.g. G = 6.674e-11, assume drag coefficient is zero, x is positive real"
            className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>
      );

    case "data_analysis":
      return (
        <div className="pb-2">
          <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Critical Variables / Focus Indicators</span>
          </label>
          <input
            id="input-variables"
            type="text"
            value={contextInputs.variables || ""}
            onChange={(e) => handleInputChange("variables", e.target.value)}
            placeholder="e.g. Correlation of marketing spend vs conversion rates"
            className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>
      );

    case "writing":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Type className="w-3.5 h-3.5" />
              <span>Target Style / Tone</span>
            </label>
            <input
              id="input-tone"
              type="text"
              value={contextInputs.targetTone || ""}
              onChange={(e) => handleInputChange("targetTone", e.target.value)}
              placeholder="e.g. Empathetic and professional, witty tech blogger"
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Target Word Count</span>
            </label>
            <input
              id="input-wordcount"
              type="text"
              value={contextInputs.wordCountLimit || ""}
              onChange={(e) => handleInputChange("wordCountLimit", e.target.value)}
              placeholder="e.g. under 150 words, precisely two paragraphs"
              className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>
        </div>
      );

    case "research":
      return (
        <div className="pb-2">
          <label className="block text-xs font-semibold text-gray-500 font-mono uppercase tracking-wider mb-1.5 flex items-center space-x-1">
            <Grid className="w-3.5 h-3.5" />
            <span>Academic Fields involved</span>
          </label>
          <input
            id="input-academic-fields"
            type="text"
            value={contextInputs.academicFields || ""}
            onChange={(e) => handleInputChange("academicFields", e.target.value)}
            placeholder="e.g. Epigenetics, Biophysics, Clinical Psychology"
            className="w-full text-sm py-1.5 px-3 rounded-lg border border-gray-200 bg-white shadow-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
          />
        </div>
      );

    default:
      return null;
  }
}

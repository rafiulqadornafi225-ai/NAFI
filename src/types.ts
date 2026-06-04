/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssistantMode = 
  | "teaching" 
  | "programming" 
  | "mathematics" 
  | "data_analysis" 
  | "writing" 
  | "research";

export interface ContextInputs {
  // Teaching
  audience?: string;
  domain?: string;
  // Programming
  language?: string;
  constraints?: string;
  // Mathematics
  knowns?: string;
  // Data Analysis
  variables?: string;
  // Writing
  targetTone?: string;
  wordCountLimit?: string;
  // Research
  academicFields?: string;
}

export interface WorkspaceItem {
  id: string;
  title: string;
  mode: AssistantMode;
  userPrompt: string;
  contextInputs: ContextInputs;
  responseText: string;
  timestamp: string;
  model: string;
}

export interface ModeConfig {
  id: AssistantMode;
  name: string;
  iconName: string;
  description: string;
  promptPlaceholder: string;
  samplePrompt: string;
  sampleInputs: ContextInputs;
}

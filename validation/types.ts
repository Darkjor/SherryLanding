export interface Finding {
  rule: string;
  message: string;
  location?: string;
}

export interface AgentResult {
  agent: string;
  errors: Finding[];
  warnings: Finding[];
  info: Finding[];
}

export interface ValidationReport {
  timestamp: string;
  builtHtmlPath: string;
  results: AgentResult[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
  };
}

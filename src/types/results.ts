export interface FuzzingResult {
  id: string;
  timestamp: string;
  target: string;
  module: string;
  findings: Finding[];
  status: "completed" | "running" | "failed";
  duration: number;
}

export interface Finding {
  id: string;
  type: string;
  url: string;
  status: number;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  details?: Record<string, any>;
}

export interface SubdomainResult extends Finding {
  ip?: string;
  technologies?: string[];
  ports?: number[];
}

export interface CustomTestResult extends Finding {
  testName: string;
  payload: string;
  response: string;
}

export type ExportFormat = "json" | "csv" | "pdf";

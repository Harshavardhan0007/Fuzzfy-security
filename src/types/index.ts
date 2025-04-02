
export interface FuzzTarget {
  url: string;
  protocol: 'http' | 'https';
  port?: number;
}

export interface WordlistOption {
  id: string;
  name: string;
  description: string;
  size: number;
  items: string[];
}

export interface FuzzResult {
  id: string;
  path: string;
  statusCode: number;
  contentLength: number;
  responseTime: number;
  timestamp: Date;
  type: 'directory' | 'file' | 'endpoint' | 'subdomain' | 'vhost' | 'parameter';
  interesting: boolean;
}

export interface FuzzOptions {
  wordlist: WordlistOption;
  extensions: string[];
  recursion: boolean;
  recursionDepth: number;
  threads: number;
  timeout: number;
  followRedirects: boolean;
}

export interface FuzzStats {
  totalRequests: number;
  requestsPerSecond: number;
  elapsed: number;
  estimatedTimeRemaining: number;
  progress: number;
}

export type FuzzerStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

export interface ScanReport {
  targetUrl: string;
  scanDate: Date;
  duration: number;
  totalRequests: number;
  findings: FuzzResult[];
  summary: {
    directories: number;
    files: number;
    status200: number;
    status300: number;
    status400: number;
    status500: number;
    interesting: number;
  };
}

export type ModuleType = 'directories' | 'vhosts' | 'api-endpoints' | 'parameters' | 'custom' | 'subdomains';

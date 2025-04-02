
import { FuzzOptions, FuzzResult, FuzzStats, FuzzTarget, WordlistOption } from "../types";

// Mock wordlists for demonstration
export const COMMON_WORDLISTS: WordlistOption[] = [
  {
    id: "common-dirs",
    name: "Common Directories",
    description: "Common web directories found in web servers",
    size: 100,
    items: [
      "admin", "wp-admin", "login", "wp-content", "includes", "images", "js", "css",
      "uploads", "backup", "bak", "config", "db", "logs", "old", "temp", "test",
      "api", "assets", "static", "media", "private", "public", "secure", "cgi-bin"
    ]
  },
  {
    id: "sensitive-files",
    name: "Sensitive Files",
    description: "Files that may contain sensitive information",
    size: 50,
    items: [
      "config.php", ".env", "wp-config.php", "settings.json", "database.yml",
      "credentials.txt", "secrets.json", "users.db", "backup.sql", ".git/HEAD",
      "id_rsa", ".htpasswd", "web.config", "robots.txt", "sitemap.xml"
    ]
  },
  {
    id: "web-tech",
    name: "Web Technologies",
    description: "Common web technology paths",
    size: 75,
    items: [
      "wp-login.php", "phpmyadmin", "adminer.php", "server-status", "info.php",
      "phpinfo.php", "test.php", "debug.php", "setup", "install", "update",
      "ajax", "rpc", "soap", "rest", "graphql", "swagger", "docs"
    ]
  }
];

// Mock extensions
export const COMMON_EXTENSIONS = [
  ".php", ".html", ".js", ".txt", ".xml", ".json", ".bak", ".sql", ".zip", ".tar.gz",
  ".old", ".swp", ".log", ".conf", ".env", ".inc", ".asp", ".aspx", ".jsp", ".py"
];

// Simulate an HTTP request with more guaranteed results for demonstration
const simulateHttpRequest = async (url: string): Promise<{
  statusCode: number;
  contentLength: number;
  responseTime: number;
}> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // Generate status code with higher probability of success for demo purposes
      let statusCode: number;
      
      // Extract the path from URL for pattern matching
      const pathMatch = url.match(/\/([^\/]+)(?:\.[^\/\.]+)?$/);
      const path = pathMatch ? pathMatch[1].toLowerCase() : '';
      
      // Specific paths always return 200 (guaranteed finds for demo)
      const guaranteedPaths = [
        'images', 'css', 'js', 'admin', 'login', 'api', 
        'test', 'backup', 'config', 'robots', 'wp-content'
      ];
      
      // Higher success rate for demonstrations
      if (guaranteedPaths.some(p => path.includes(p))) {
        statusCode = 200;
      } else {
        // For other paths, still have some successes
        const rand = Math.random();
        if (rand < 0.25) {
          statusCode = 200;
        } else if (rand < 0.35) {
          statusCode = 403;
        } else if (rand < 0.45) {
          statusCode = 301;
        } else if (rand < 0.50) {
          statusCode = 500;
        } else {
          statusCode = 404;
        }
      }
      
      // Generate dynamic content length for successful responses
      const contentLength = statusCode === 200 ? Math.floor(Math.random() * 100000) + 1000 : 0;
      
      // Simulate response time
      const responseTime = Math.floor(Math.random() * 300) + 50;
      
      resolve({
        statusCode,
        contentLength,
        responseTime
      });
    }, Math.random() * 100 + 20); // Faster random delay between 20-120ms for demo
  });
};

// Function to start directory fuzzing
export const startDirectoryFuzzing = async (
  target: FuzzTarget,
  options: FuzzOptions,
  onProgress: (stats: FuzzStats) => void,
  onResult: (result: FuzzResult) => void,
  onComplete: () => void,
  onError: (error: Error) => void
): Promise<void> => {
  try {
    const { wordlist, extensions } = options;
    const baseUrl = `${target.protocol}://${target.url}${target.port ? `:${target.port}` : ''}`;
    
    const startTime = Date.now();
    let requestCounter = 0;
    const totalRequests = wordlist.items.length * (extensions.length + 1); // +1 for checking the path without extension
    
    // Process every word in the wordlist
    for (let i = 0; i < wordlist.items.length; i++) {
      const word = wordlist.items[i];
      
      // Try the path without extension first
      try {
        const url = `${baseUrl}/${word}`;
        const response = await simulateHttpRequest(url);
        requestCounter++;
        
        const result: FuzzResult = {
          id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          path: `/${word}`,
          statusCode: response.statusCode,
          contentLength: response.contentLength,
          responseTime: response.responseTime,
          timestamp: new Date(),
          type: response.statusCode === 200 || response.statusCode === 301 || response.statusCode === 302 ? 'directory' : 'file',
          interesting: response.statusCode !== 404
        };
        
        onResult(result);
        
        // Update progress
        const elapsed = (Date.now() - startTime) / 1000;
        const requestsPerSecond = requestCounter / elapsed;
        const progress = (requestCounter / totalRequests) * 100;
        const estimatedTimeRemaining = (totalRequests - requestCounter) / requestsPerSecond;
        
        onProgress({
          totalRequests: requestCounter,
          requestsPerSecond,
          elapsed,
          estimatedTimeRemaining,
          progress
        });
      } catch (error) {
        console.error(`Error processing ${word}:`, error);
      }
      
      // Try each extension
      for (const ext of extensions) {
        try {
          const url = `${baseUrl}/${word}${ext}`;
          const response = await simulateHttpRequest(url);
          requestCounter++;
          
          const result: FuzzResult = {
            id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            path: `/${word}${ext}`,
            statusCode: response.statusCode,
            contentLength: response.contentLength,
            responseTime: response.responseTime,
            timestamp: new Date(),
            type: 'file',
            interesting: response.statusCode !== 404
          };
          
          onResult(result);
          
          // Update progress
          const elapsed = (Date.now() - startTime) / 1000;
          const requestsPerSecond = requestCounter / elapsed;
          const progress = (requestCounter / totalRequests) * 100;
          const estimatedTimeRemaining = (totalRequests - requestCounter) / requestsPerSecond;
          
          onProgress({
            totalRequests: requestCounter,
            requestsPerSecond,
            elapsed,
            estimatedTimeRemaining,
            progress
          });
        } catch (error) {
          console.error(`Error processing ${word}${ext}:`, error);
        }
      }
    }
    
    onComplete();
  } catch (error) {
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('Unknown error occurred during fuzzing'));
    }
  }
};

// Function to get interesting status text with color class
export const getStatusClass = (statusCode: number): string => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'result-success';
  } else if (statusCode >= 300 && statusCode < 400) {
    return 'result-info';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'result-warning';
  } else if (statusCode >= 500) {
    return 'result-danger';
  }
  return '';
};

// Utility to format time in a human-readable way
export const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.floor(seconds)} seconds`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} minutes ${Math.floor(seconds % 60)} seconds`;
  } else {
    return `${Math.floor(seconds / 3600)} hours ${Math.floor((seconds % 3600) / 60)} minutes`;
  }
};

// Utility to format bytes in a human-readable way
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

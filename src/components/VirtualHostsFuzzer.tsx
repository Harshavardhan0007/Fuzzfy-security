
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FuzzTarget } from '@/types';
import { Server, Pause, Play, Download, RotateCcw } from 'lucide-react';
import { Progress } from "@/components/ui/progress";

interface VirtualHostsFuzzerProps {
  target: FuzzTarget | null;
}

interface VHostResult {
  id: string;
  hostname: string;
  statusCode: number;
  contentLength: number;
  responseTime: number;
  interesting: boolean;
  timestamp: Date;
}

const VirtualHostsFuzzer: React.FC<VirtualHostsFuzzerProps> = ({ target }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<VHostResult[]>([]);
  const [wordlist, setWordlist] = useState<string>("common-subdomains");
  const [threads, setThreads] = useState<number>(10);
  const [showInterestingOnly, setShowInterestingOnly] = useState(false);
  
  const handleStartScan = () => {
    if (!target) {
      toast({
        title: "No target specified",
        description: "Please configure a target first.",
        variant: "destructive"
      });
      return;
    }
    
    setStatus('running');
    setResults([]);
    
    // Simulate the scanning process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += (Math.random() * 2);
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setStatus('completed');
        toast({
          title: "Scan completed",
          description: "Virtual hosts discovery scan has finished."
        });
      }
      
      setProgress(currentProgress);
      
      // Add a simulated result every few iterations
      if (Math.random() > 0.7) {
        const newResult: VHostResult = {
          id: `vhost-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          hostname: generateRandomSubdomain() + '.' + (target?.url || 'example.com'),
          statusCode: generateRandomStatusCode(),
          contentLength: Math.floor(Math.random() * 50000),
          responseTime: Math.floor(Math.random() * 300) + 20,
          interesting: Math.random() > 0.7,
          timestamp: new Date()
        };
        
        setResults(prev => [...prev, newResult]);
      }
    }, 200);
    
    return () => clearInterval(interval);
  };
  
  const handlePauseScan = () => {
    setStatus('paused');
    toast({
      title: "Scan paused",
      description: "Virtual hosts discovery scan has been paused."
    });
  };
  
  const handleResumeScan = () => {
    setStatus('running');
    toast({
      title: "Scan resumed",
      description: "Virtual hosts discovery scan has been resumed."
    });
    
    handleStartScan();
  };
  
  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setResults([]);
  };
  
  const handleExportResults = () => {
    const exportData = {
      target: target,
      scanType: "Virtual Hosts Discovery",
      timestamp: new Date().toISOString(),
      results: results
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vhosts-scan-${target?.url}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Results exported",
      description: "Results have been exported to JSON."
    });
  };
  
  // Helper functions for generating random data for simulation
  const generateRandomSubdomain = (): string => {
    const subdomains = [
      'admin', 'mail', 'webmail', 'test', 'dev', 'staging', 'api', 
      'secure', 'shop', 'blog', 'beta', 'new', 'old', 'stage', 'portal',
      'app', 'cdn', 'media', 'internal', 'private', 'vpn', 'intranet'
    ];
    return subdomains[Math.floor(Math.random() * subdomains.length)];
  };
  
  const generateRandomStatusCode = (): number => {
    const statusCodes = [200, 200, 200, 301, 302, 403, 404, 404, 404, 500];
    return statusCodes[Math.floor(Math.random() * statusCodes.length)];
  };
  
  const getStatusClass = (statusCode: number): string => {
    if (statusCode >= 200 && statusCode < 300) {
      return 'text-green-500';
    } else if (statusCode >= 300 && statusCode < 400) {
      return 'text-blue-500';
    } else if (statusCode >= 400 && statusCode < 500) {
      return 'text-yellow-500';
    } else {
      return 'text-red-500';
    }
  };
  
  const displayedResults = showInterestingOnly 
    ? results.filter(r => r.interesting) 
    : results;
  
  return (
    <div className="fuzzer-section">
      {!target ? (
        <div className="bg-security-warning/10 border border-security-warning/20 p-4 rounded-md mb-4">
          <p className="text-security-warning text-sm">Please configure a target URL before starting the scan.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Wordlist</label>
              <Select value={wordlist} onValueChange={setWordlist}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a wordlist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="common-subdomains">Common Subdomains (100)</SelectItem>
                  <SelectItem value="extended-subdomains">Extended Subdomains (500)</SelectItem>
                  <SelectItem value="full-subdomains">Full Subdomains (1000+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Threads</label>
              <Select value={threads.toString()} onValueChange={v => setThreads(parseInt(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Number of threads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 threads</SelectItem>
                  <SelectItem value="10">10 threads</SelectItem>
                  <SelectItem value="20">20 threads</SelectItem>
                  <SelectItem value="50">50 threads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end items-end">
              {status === 'idle' && (
                <Button 
                  onClick={handleStartScan} 
                  className="security-btn-primary"
                >
                  Start Scan
                </Button>
              )}
              
              {status === 'running' && (
                <Button 
                  onClick={handlePauseScan} 
                  variant="outline" 
                  className="mr-2"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              )}
              
              {status === 'paused' && (
                <Button 
                  onClick={handleResumeScan} 
                  variant="outline" 
                  className="mr-2"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              )}
              
              {(status === 'paused' || status === 'completed') && (
                <Button 
                  onClick={handleReset} 
                  variant="outline" 
                  className="mr-2"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              )}
              
              {results.length > 0 && (
                <Button 
                  onClick={handleExportResults} 
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
          </div>
          
          {(status === 'running' || status === 'paused') && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Scan progress</span>
                <span className="text-sm">{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          {results.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Results ({displayedResults.length})</h3>
                <div className="flex items-center">
                  <Checkbox 
                    id="interesting-only" 
                    checked={showInterestingOnly}
                    onCheckedChange={(checked) => setShowInterestingOnly(checked === true)}
                  />
                  <label htmlFor="interesting-only" className="ml-2 text-sm">
                    Show interesting only
                  </label>
                </div>
              </div>
              
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hostname</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                      <TableHead className="text-right">Size</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell className="font-mono">{result.hostname}</TableCell>
                        <TableCell className={`font-medium text-right ${getStatusClass(result.statusCode)}`}>
                          {result.statusCode}
                        </TableCell>
                        <TableCell className="text-right">{result.contentLength} B</TableCell>
                        <TableCell className="text-right">{result.responseTime} ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VirtualHostsFuzzer;


import React, { useState, useEffect } from 'react';
import { Folder, Play, Pause, RotateCcw, BarChart3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FuzzOptions, 
  FuzzResult, 
  FuzzStats, 
  FuzzTarget, 
  FuzzerStatus, 
  WordlistOption
} from '@/types';
import { COMMON_EXTENSIONS, COMMON_WORDLISTS, formatTime, startDirectoryFuzzing } from '@/utils/fuzzer';
import WordlistSelector from './WordlistSelector';
import ResultsDisplay from './ResultsDisplay';
import { useToast } from '@/components/ui/use-toast';

interface DirectoryFuzzerProps {
  target: FuzzTarget | null;
}

const DirectoryFuzzer: React.FC<DirectoryFuzzerProps> = ({ target }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<FuzzerStatus>('idle');
  const [selectedWordlist, setSelectedWordlist] = useState<WordlistOption | null>(COMMON_WORDLISTS[0]);
  const [results, setResults] = useState<FuzzResult[]>([]);
  const [stats, setStats] = useState<FuzzStats>({
    totalRequests: 0,
    requestsPerSecond: 0,
    elapsed: 0,
    estimatedTimeRemaining: 0,
    progress: 0
  });
  
  const [options, setOptions] = useState<FuzzOptions>({
    wordlist: COMMON_WORDLISTS[0],
    extensions: ['.php', '.html', '.txt'],
    recursion: false,
    recursionDepth: 3,
    threads: 10,
    timeout: 5000,
    followRedirects: true
  });

  // Reset results when target changes
  useEffect(() => {
    setResults([]);
    setStats({
      totalRequests: 0,
      requestsPerSecond: 0,
      elapsed: 0,
      estimatedTimeRemaining: 0,
      progress: 0
    });
    setStatus('idle');
  }, [target]);

  const handleStartFuzzing = () => {
    if (!target) {
      toast({
        title: "No target specified",
        description: "Please set a target URL before starting the scan.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedWordlist) {
      toast({
        title: "No wordlist selected",
        description: "Please select a wordlist before starting the scan.",
        variant: "destructive"
      });
      return;
    }

    setResults([]);
    setStats({
      totalRequests: 0,
      requestsPerSecond: 0,
      elapsed: 0,
      estimatedTimeRemaining: 0,
      progress: 0
    });
    setStatus('running');

    const updatedOptions = {
      ...options,
      wordlist: selectedWordlist
    };

    startDirectoryFuzzing(
      target,
      updatedOptions,
      (stats) => {
        setStats(stats);
      },
      (result) => {
        setResults(prev => [result, ...prev]);
      },
      () => {
        setStatus('completed');
        toast({
          title: "Scan completed",
          description: `Completed scan of ${target.url} with ${stats.totalRequests} requests.`
        });
      },
      (error) => {
        setStatus('error');
        toast({
          title: "Scan error",
          description: error.message,
          variant: "destructive"
        });
      }
    );
  };

  const handleStopFuzzing = () => {
    setStatus('idle');
    toast({
      title: "Scan stopped",
      description: "The fuzzing scan has been stopped manually."
    });
  };

  const handlePauseFuzzing = () => {
    if (status === 'running') {
      setStatus('paused');
      toast({
        title: "Scan paused",
        description: "The fuzzing scan has been paused. Resume to continue."
      });
    } else if (status === 'paused') {
      setStatus('running');
      toast({
        title: "Scan resumed",
        description: "The fuzzing scan has been resumed."
      });
    }
  };

  const toggleExtension = (ext: string) => {
    setOptions(prev => {
      if (prev.extensions.includes(ext)) {
        return {
          ...prev,
          extensions: prev.extensions.filter(e => e !== ext)
        };
      } else {
        return {
          ...prev,
          extensions: [...prev.extensions, ext]
        };
      }
    });
  };

  return (
    <div className="fuzzer-section">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <Folder className="w-5 h-5 mr-2 text-security-primary" />
        Directory & File Enumeration
      </h2>

      <Tabs defaultValue="config">
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="results">
            Results
            {results.length > 0 && (
              <span className="ml-2 bg-security-primary/20 text-security-primary text-xs rounded-full px-2 py-0.5">
                {results.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <WordlistSelector 
                selectedWordlist={selectedWordlist} 
                onWordlistChange={(wordlist) => {
                  setSelectedWordlist(wordlist);
                }} 
              />
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">File Extensions</h3>
                <div className="flex flex-wrap gap-2">
                  {COMMON_EXTENSIONS.slice(0, 10).map((ext) => (
                    <div key={ext} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`ext-${ext}`} 
                        checked={options.extensions.includes(ext)}
                        onCheckedChange={() => toggleExtension(ext)}
                      />
                      <label 
                        htmlFor={`ext-${ext}`}
                        className="text-sm cursor-pointer"
                      >
                        {ext}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <Input 
                    placeholder="Add custom extensions (comma separated)" 
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Options</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm flex items-center">
                    <span>Threads</span>
                    <span className="ml-2 bg-security-highlight px-2 rounded text-xs">
                      {options.threads}
                    </span>
                  </label>
                  <div className="w-1/2">
                    <Slider 
                      value={[options.threads]} 
                      min={1} 
                      max={50} 
                      step={1}
                      onValueChange={(value) => {
                        setOptions(prev => ({
                          ...prev,
                          threads: value[0]
                        }));
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Recursive Scanning</label>
                  <Switch 
                    checked={options.recursion} 
                    onCheckedChange={(checked) => {
                      setOptions(prev => ({
                        ...prev,
                        recursion: checked
                      }));
                    }}
                  />
                </div>
                
                {options.recursion && (
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center">
                      <span>Recursion Depth</span>
                      <span className="ml-2 bg-security-highlight px-2 rounded text-xs">
                        {options.recursionDepth}
                      </span>
                    </label>
                    <div className="w-1/2">
                      <Slider 
                        value={[options.recursionDepth]} 
                        min={1} 
                        max={10} 
                        step={1}
                        onValueChange={(value) => {
                          setOptions(prev => ({
                            ...prev,
                            recursionDepth: value[0]
                          }));
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <label className="text-sm">Follow Redirects</label>
                  <Switch 
                    checked={options.followRedirects} 
                    onCheckedChange={(checked) => {
                      setOptions(prev => ({
                        ...prev,
                        followRedirects: checked
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="results">
          <ResultsDisplay results={results} />
        </TabsContent>
      </Tabs>
      
      {/* Progress bar */}
      {status !== 'idle' && status !== 'completed' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span>{stats.totalRequests} requests</span>
            <span>{stats.progress.toFixed(1)}% complete</span>
          </div>
          <Progress value={stats.progress} className="h-1 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.requestsPerSecond.toFixed(1)} req/s</span>
            <span>
              {status === 'running' 
                ? `Est. time remaining: ${formatTime(stats.estimatedTimeRemaining)}` 
                : `Elapsed: ${formatTime(stats.elapsed)}`
              }
            </span>
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-6 flex justify-end space-x-3">
        {status === 'idle' || status === 'completed' || status === 'error' ? (
          <>
            <Button 
              variant="outline" 
              className="w-10 h-10 p-0" 
              onClick={() => {
                setResults([]);
                setStatus('idle');
              }}
              disabled={results.length === 0}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button 
              disabled={!target || !selectedWordlist} 
              onClick={handleStartFuzzing}
              className="security-btn-primary"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Fuzzing
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={handlePauseFuzzing}
              className="flex items-center"
            >
              {status === 'paused' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
            <Button 
              onClick={handleStopFuzzing}
              variant="destructive"
            >
              Stop Scan
            </Button>
          </>
        )}
        
        {status === 'completed' && results.length > 0 && (
          <Button
            variant="outline"
            className="flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        )}
      </div>
    </div>
  );
};

export default DirectoryFuzzer;

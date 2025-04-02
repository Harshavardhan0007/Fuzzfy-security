
import React, { useState } from 'react';
import { Check, Copy, AlertCircle, ExternalLink } from 'lucide-react';
import { FuzzResult } from '@/types';
import { getStatusClass, formatBytes } from '@/utils/fuzzer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

interface ResultsDisplayProps {
  results: FuzzResult[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showInterestingOnly, setShowInterestingOnly] = useState(true); // Default to showing only interesting results
  
  // Filter results based on search input
  const filteredResults = results.filter(result => {
    // First apply interesting filter if enabled
    if (showInterestingOnly && !result.interesting) {
      return false;
    }
    
    // Then apply text filter if present
    if (!filter) return true;
    return (
      result.path.toLowerCase().includes(filter.toLowerCase()) ||
      result.statusCode.toString().includes(filter)
    );
  });
  
  // Count interesting results for display
  const interestingResults = results.filter(result => result.interesting);
  
  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      setCopied(path);
      setTimeout(() => setCopied(null), 2000);
      
      toast({
        title: "Copied to clipboard",
        description: `Path ${path} has been copied to clipboard`,
      });
    });
  };
  
  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-security-darker rounded-lg">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium">No Results Yet</h3>
        <p className="text-muted-foreground">Start a scan to see results here</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">
            {interestingResults.length} interesting results of {results.length} total
          </h3>
          <div className="flex items-center space-x-2 ml-4">
            <input
              type="checkbox"
              id="interesting-only"
              checked={showInterestingOnly}
              onChange={(e) => setShowInterestingOnly(e.target.checked)}
              className="rounded text-security-primary focus:ring-security-primary"
            />
            <label htmlFor="interesting-only" className="text-xs">
              Show interesting only
            </label>
          </div>
        </div>
        <Input 
          placeholder="Filter results..." 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      <div className="bg-security-darker rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 text-xs font-medium border-b border-security-border p-2">
          <div className="col-span-3">Path</div>
          <div className="col-span-1 text-center">Status</div>
          <div className="col-span-1 text-center">Size</div>
          <div className="col-span-1 text-center">Actions</div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto terminal-text">
          {filteredResults.length > 0 ? filteredResults.map((result) => (
            <div 
              key={result.id} 
              className={`grid grid-cols-6 p-2 text-xs hover:bg-security-highlight ${
                result.statusCode === 200 ? 'bg-security-success/10 border-l-2 border-security-success' : 
                result.statusCode === 403 ? 'bg-security-warning/10 border-l-2 border-security-warning' : 
                result.interesting ? '' : 'opacity-60'
              }`}
            >
              <div className="col-span-3 flex items-center">
                <span className="truncate">
                  {result.path}
                </span>
              </div>
              <div className={`col-span-1 text-center ${getStatusClass(result.statusCode)}`}>
                {result.statusCode}
              </div>
              <div className="col-span-1 text-center">
                {result.contentLength > 0 ? formatBytes(result.contentLength) : '-'}
              </div>
              <div className="col-span-1 flex justify-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => handleCopyPath(result.path)}
                >
                  {copied === result.path ? (
                    <Check className="h-3 w-3 text-security-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  disabled={result.statusCode >= 400}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )) : (
            <div className="py-8 text-center text-muted-foreground">
              No results match your filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;

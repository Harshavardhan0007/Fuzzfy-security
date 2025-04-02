
import React, { useState } from 'react';
import { Globe, Crosshair } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FuzzTarget } from '@/types';

interface TargetInputProps {
  onTargetChange: (target: FuzzTarget) => void;
}

const TargetInput: React.FC<TargetInputProps> = ({ onTargetChange }) => {
  const [url, setUrl] = useState('');
  const [protocol, setProtocol] = useState<'http' | 'https'>('https');
  const [port, setPort] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      // Remove protocol prefix if the user included it
      let cleanUrl = url.trim();
      cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
      // Remove trailing slash if present
      cleanUrl = cleanUrl.replace(/\/$/, '');
      
      onTargetChange({
        url: cleanUrl,
        protocol,
        port: port ? parseInt(port, 10) : undefined
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fuzzer-section">
      <h2 className="text-lg font-medium mb-4 flex items-center">
        <Crosshair className="w-5 h-5 mr-2 text-security-primary" />
        Target Configuration
      </h2>
      
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/5">
          <Select 
            defaultValue={protocol} 
            onValueChange={(value) => setProtocol(value as 'http' | 'https')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="http">HTTP</SelectItem>
              <SelectItem value="https">HTTPS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-grow relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="domain.com or IP address"
            className="pl-10"
            required
          />
        </div>
        
        <div className="w-full md:w-1/6">
          <Input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="Port (optional)"
            type="number"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" className="security-btn-primary">
          Set Target
        </Button>
      </div>
    </form>
  );
};

export default TargetInput;

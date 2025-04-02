import React, { useState } from "react";
import { FuzzTarget, SubdomainResult } from "@/types/results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface SubdomainFuzzerProps {
  target: FuzzTarget | null;
}

const SubdomainFuzzer: React.FC<SubdomainFuzzerProps> = ({ target }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const commonSubdomains = [
    "www",
    "mail",
    "ftp",
    "admin",
    "blog",
    "dev",
    "staging",
    "api",
    "test",
    "secure",
    "shop",
    "store",
    "cdn",
    "img",
    "images",
    "static",
    "assets",
    "beta",
    "alpha",
    "demo",
  ];

  const scanSubdomains = async () => {
    if (!target) return;

    setIsScanning(true);
    setError(null);
    setResults([]);

    try {
      // Simulate scanning with some example results
      const mockResults: SubdomainResult[] = commonSubdomains.map(
        (subdomain, index) => ({
          id: `subdomain-${index}`,
          type: "subdomain",
          url: `${subdomain}.${target.url}`,
          status: Math.random() > 0.5 ? 200 : 404,
          description: `Found subdomain: ${subdomain}.${target.url}`,
          severity: "low",
          ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(
            Math.random() * 255
          )}`,
          technologies: ["Nginx", "React", "Node.js"],
          ports: [80, 443, 8080],
        })
      );

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setResults(mockResults);
    } catch (err) {
      setError("Failed to scan subdomains. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Subdomain Enumeration</h2>
        <Button
          onClick={scanSubdomains}
          disabled={!target || isScanning}
          className="flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            "Start Scan"
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4">
        {results.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{result.url}</h3>
                  {result.status === 200 ? (
                    <Badge
                      variant="success"
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Not Found
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{result.description}</p>
                {result.ip && (
                  <p className="text-sm">
                    <span className="font-medium">IP:</span> {result.ip}
                  </p>
                )}
                {result.technologies && result.technologies.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-sm font-medium">Technologies:</span>
                    <div className="flex gap-1">
                      {result.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {result.ports && result.ports.length > 0 && (
                  <p className="text-sm">
                    <span className="font-medium">Open Ports:</span>{" "}
                    {result.ports.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SubdomainFuzzer;

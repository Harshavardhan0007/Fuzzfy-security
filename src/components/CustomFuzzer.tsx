import React, { useState } from "react";
import { FuzzTarget, CustomTestResult } from "@/types/results";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface CustomFuzzerProps {
  target: FuzzTarget | null;
}

const CustomFuzzer: React.FC<CustomFuzzerProps> = ({ target }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<CustomTestResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [testName, setTestName] = useState("");
  const [payload, setPayload] = useState("");
  const [testType, setTestType] = useState("xss");

  const predefinedTests = {
    xss: [
      "<script>alert(1)</script>",
      '"><script>alert(2)</script>',
      "<img src=x onerror=alert(3)>",
      '"><img src=x onerror=alert(4)>',
      '"><svg onload=alert(5)>',
    ],
    sqli: [
      "' OR '1'='1",
      "' UNION SELECT NULL--",
      "' OR 1=1--",
      "admin' --",
      "' OR 'x'='x",
    ],
    lfi: [
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32\\config\\sam",
      "/etc/passwd",
      "c:\\windows\\system32\\config\\sam",
      "/proc/self/environ",
    ],
  };

  const runCustomTest = async () => {
    if (!target || !testName || !payload) return;

    setIsScanning(true);
    setError(null);

    try {
      // Simulate test execution with example results
      const mockResult: CustomTestResult = {
        id: `custom-${Date.now()}`,
        type: testType,
        url: `${target.protocol}://${target.url}${
          target.port ? `:${target.port}` : ""
        }`,
        status: Math.random() > 0.5 ? 200 : 404,
        description: `Custom test: ${testName}`,
        severity: Math.random() > 0.7 ? "high" : "medium",
        testName,
        payload,
        response: "Simulated response from server...",
      };

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResults((prev) => [...prev, mockResult]);
    } catch (err) {
      setError("Failed to run custom test. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const loadPredefinedTest = (type: string) => {
    setTestType(type);
    if (predefinedTests[type as keyof typeof predefinedTests]) {
      setPayload(predefinedTests[type as keyof typeof predefinedTests][0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Name</label>
          <Input
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter a descriptive name for your test"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Type</label>
          <Select value={testType} onValueChange={loadPredefinedTest}>
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xss">Cross-Site Scripting (XSS)</SelectItem>
              <SelectItem value="sqli">SQL Injection</SelectItem>
              <SelectItem value="lfi">Local File Inclusion (LFI)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Payload</label>
          <Textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder="Enter your test payload"
            rows={4}
          />
        </div>

        <Button
          onClick={runCustomTest}
          disabled={!target || isScanning || !testName || !payload}
          className="flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Test...
            </>
          ) : (
            "Run Test"
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
                  <h3 className="font-medium">{result.testName}</h3>
                  <Badge
                    variant={
                      result.severity === "high" ? "destructive" : "secondary"
                    }
                  >
                    {result.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{result.description}</p>
                <div className="mt-2">
                  <p className="text-sm font-medium">Payload:</p>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {result.payload}
                  </pre>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Response:</p>
                  <pre className="text-sm bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {result.response}
                  </pre>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CustomFuzzer;

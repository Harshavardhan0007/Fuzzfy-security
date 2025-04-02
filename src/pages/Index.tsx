import React, { useState } from "react";
import Header from "@/components/Header";
import TargetInput from "@/components/TargetInput";
import DirectoryFuzzer from "@/components/DirectoryFuzzer";
import VirtualHostsFuzzer from "@/components/VirtualHostsFuzzer";
import ApiEndpointsFuzzer from "@/components/ApiEndpointsFuzzer";
import ParametersFuzzer from "@/components/ParametersFuzzer";
import SubdomainFuzzer from "@/components/SubdomainFuzzer";
import CustomFuzzer from "@/components/CustomFuzzer";
import { FuzzTarget, FuzzingResult, ExportFormat } from "@/types/results";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FolderTree,
  Server,
  Webhook,
  Hash,
  FileCode,
  Globe2,
  InfoIcon,
  Download,
} from "lucide-react";
import { exportResults } from "@/utils/export";

const Index = () => {
  const [target, setTarget] = useState<FuzzTarget | null>(null);
  const [results, setResults] = useState<FuzzingResult[]>([]);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");

  const handleExport = async () => {
    if (results.length === 0) {
      alert("No results to export");
      return;
    }
    await exportResults(results, exportFormat);
  };

  return (
    <div className="min-h-screen flex flex-col bg-security-background">
      <Header />

      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full">
        {/* Target configuration */}
        <TargetInput onTargetChange={setTarget} />

        {/* Active target indicator */}
        {target && (
          <div className="bg-security-info/10 border border-security-info/20 rounded-md p-3 mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <InfoIcon className="w-5 h-5 mr-2 text-security-info" />
              <div>
                <h3 className="text-sm font-medium">Active Target:</h3>
                <p className="text-sm">
                  {`${target.protocol}://${target.url}${
                    target.port ? `:${target.port}` : ""
                  }`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select
                  value={exportFormat}
                  onValueChange={(value) =>
                    setExportFormat(value as ExportFormat)
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleExport}
                  disabled={results.length === 0}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-security-success mr-2 animate-pulse"></span>
                <span className="text-xs text-security-foreground/70">
                  Ready to scan
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fuzzing modules tabs */}
        <Tabs defaultValue="directories" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="directories" className="flex items-center">
              <FolderTree className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Directories & Files</span>
              <span className="sm:hidden">Dirs</span>
            </TabsTrigger>
            <TabsTrigger value="vhosts" className="flex items-center">
              <Server className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Virtual Hosts</span>
              <span className="sm:hidden">VHosts</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center">
              <Webhook className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">API Endpoints</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="parameters" className="flex items-center">
              <Hash className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Parameters</span>
              <span className="sm:hidden">Params</span>
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center">
              <FileCode className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Custom Tests</span>
              <span className="sm:hidden">Custom</span>
            </TabsTrigger>
            <TabsTrigger value="subdomains" className="flex items-center">
              <Globe2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Subdomains</span>
              <span className="sm:hidden">Subs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directories">
            <DirectoryFuzzer target={target} />
          </TabsContent>

          <TabsContent value="vhosts">
            <VirtualHostsFuzzer target={target} />
          </TabsContent>

          <TabsContent value="api">
            <ApiEndpointsFuzzer target={target} />
          </TabsContent>

          <TabsContent value="parameters">
            <ParametersFuzzer target={target} />
          </TabsContent>

          <TabsContent value="custom">
            <CustomFuzzer target={target} />
          </TabsContent>

          <TabsContent value="subdomains">
            <SubdomainFuzzer target={target} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-4 px-6 bg-security-darker border-t border-security-border">
        <div className="max-w-7xl mx-auto text-center text-xs text-security-foreground/50">
          <p>
            Fuzzify Security Scanner — Use responsibly and only on systems you
            have permission to test.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

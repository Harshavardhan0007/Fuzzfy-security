import React from "react";
import { Heart, Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-security-darker border-b border-security-border">
      <div className="flex items-center">
        <Heart className="w-8 h-8 mr-2 text-security-primary glow animate-pulse" />
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-security-foreground flex items-center">
            Fuzzify
            <span className="ml-2 text-xs bg-security-primary rounded-full px-2 py-0.5">
              BETA
            </span>
          </h1>
          <p className="text-xs text-security-foreground/70">
            Web Application Security Scanner
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Activity className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
        <Button variant="outline" size="sm" className="md:hidden">
          <Menu className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;

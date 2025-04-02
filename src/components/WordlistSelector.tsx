
import React from 'react';
import { Book, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_WORDLISTS } from '@/utils/fuzzer';
import { WordlistOption } from '@/types';
import { Button } from '@/components/ui/button';

interface WordlistSelectorProps {
  selectedWordlist: WordlistOption | null;
  onWordlistChange: (wordlist: WordlistOption) => void;
}

const WordlistSelector: React.FC<WordlistSelectorProps> = ({
  selectedWordlist,
  onWordlistChange
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center">
        <Book className="w-4 h-4 mr-2 text-security-info" />
        Wordlist Selection
      </h3>
      
      <div className="flex space-x-2">
        <div className="flex-grow">
          <Select 
            value={selectedWordlist?.id || ''} 
            onValueChange={(value) => {
              const wordlist = COMMON_WORDLISTS.find(w => w.id === value);
              if (wordlist) {
                onWordlistChange(wordlist);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select wordlist" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_WORDLISTS.map((wordlist) => (
                <SelectItem key={wordlist.id} value={wordlist.id}>
                  {wordlist.name} ({wordlist.size} entries)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" size="icon" title="Upload custom wordlist">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {selectedWordlist && (
        <p className="text-xs text-muted-foreground mt-1">
          {selectedWordlist.description}
        </p>
      )}
    </div>
  );
};

export default WordlistSelector;

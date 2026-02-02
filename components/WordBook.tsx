
import React from 'react';
import { VocabularyWord } from '../types';

interface WordBookProps {
  words: VocabularyWord[];
  onRemove: (id: string) => void;
  compact?: boolean;
}

const WordBook: React.FC<WordBookProps> = ({ words, onRemove, compact = false }) => {
  if (words.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-30">
        <div className="w-16 h-16 bg-[#FFF2F2] rounded-[1.8rem] flex items-center justify-center mb-4 rotate-[-6deg] animate-pulse">
          <i className="fas fa-person-snowboarding text-2xl text-[#F3C5C5]"></i>
        </div>
        <p className="text-[9px] font-black text-[#D6C1C1] uppercase tracking-widest leading-relaxed">
          Trail is empty!<br/>Translate to start!
        </p>
      </div>
    );
  }

  const groupWordsByDate = (words: VocabularyWord[]) => {
    const groups: { [key: string]: VocabularyWord[] } = {};
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    words.forEach(word => {
      const date = new Date(word.timestamp).toLocaleDateString();
      let label = date;
      if (date === today) label = 'Ski Today ❄️';
      else if (date === yesterday) label = 'Last Session 🏔️';
      if (!groups[label]) groups[label] = [];
      groups[label].push(word);
    });
    return groups;
  };

  const groupedWords = groupWordsByDate(words);

  return (
    <div className={`flex-1 overflow-y-auto custom-scrollbar ${compact ? 'px-3' : 'px-5'}`}>
      <div className="space-y-8 py-4">
        {Object.entries(groupedWords).map(([dateLabel, dateWords]) => (
          <div key={dateLabel} className="space-y-4">
            <div className="flex items-center gap-2.5 sticky top-0 bg-white/95 backdrop-blur-md z-10 py-2">
              <span className="text-[8px] font-black text-[#F3C5C5] uppercase tracking-[0.25em]">{dateLabel}</span>
              <div className="flex-1 h-[1px] bg-[#FEE2E2]"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {dateWords.map((word) => (
                <div 
                  key={word.id} 
                  className="group relative bg-white border border-[#FEE2E2] rounded-[1.6rem] p-4 hover:border-[#F3C5C5] hover:shadow-lg hover:shadow-[#F3C5C5]/5 transition-all duration-500"
                >
                  <button 
                    onClick={() => onRemove(word.id)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-[#F3C5C5] text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-90 z-20"
                  >
                    <i className="fas fa-times text-[8px]"></i>
                  </button>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#5D4A4A] text-base tracking-tight leading-none">{word.word}</span>
                    {word.ipa && <span className="text-[#D6C1C1] text-[9px] font-bold">/{word.ipa}/</span>}
                  </div>
                  
                  <p className="text-[#A68F8F] text-[12px] font-playful leading-relaxed">{word.meaning}</p>
                  
                  {word.example && (
                    <div className="mt-3 text-[10px] text-[#F3C5C5] font-bold bg-[#FFF2F2]/40 p-3 rounded-[1rem] border-l-2 border-[#F3C5C5]">
                      "{word.example}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordBook;

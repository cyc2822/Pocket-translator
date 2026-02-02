
import React, { useState, useEffect } from 'react';
import TranslateBox from './TranslateBox';
import WordBook from './WordBook';
import { VocabularyWord } from '../types';

interface MobileOverlayProps {
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  onWordsExtracted: (words: Omit<VocabularyWord, 'id' | 'timestamp'>[]) => void;
  wordBook: VocabularyWord[];
  onRemoveWord: (id: string) => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = ({ 
  isExpanded, 
  setIsExpanded, 
  onWordsExtracted,
  wordBook,
  onRemoveWord
}) => {
  const [activeTab, setActiveTab] = useState<'translate' | 'words'>('translate');

  useEffect(() => {
    if (!isExpanded) {
      setTimeout(() => setActiveTab('translate'), 300);
    }
  }, [isExpanded]);

  return (
    <>
      {/* Floating Snowboard Trigger */}
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#F3C5C5] text-white rounded-[1.6rem] shadow-2xl shadow-[#F3C5C5]/30 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-90 transition-all z-50 animate-in fade-in zoom-in"
        >
          <i className="fas fa-person-snowboarding text-xl"></i>
          {wordBook.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-[#F3C5C5] text-[9px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#FFF9F9] shadow-lg">
              {wordBook.length}
            </span>
          )}
        </button>
      )}

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#5D4A4A]/5 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          isExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsExpanded(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-x-0 bottom-0 bg-[#FFF9F9] z-[70] transition-transform duration-700 cubic-bezier(0.19, 1, 0.22, 1) transform rounded-t-[3rem] flex flex-col shadow-[0_-15px_50px_rgba(243,197,197,0.12)] max-h-[90vh] ${
          isExpanded ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="h-1.5 w-12 bg-[#FEE2E2] rounded-full mx-auto mt-4 mb-1" />

        <div className="px-6 py-4 border-b border-[#FEE2E2] flex justify-between items-center">
          <div className="flex gap-8">
            {['translate', 'words'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`relative py-1.5 font-playful text-sm transition-all ${activeTab === tab ? 'text-[#F3C5C5]' : 'text-[#D6C1C1]'}`}
              >
                {tab === 'translate' ? 'Translate' : 'My List'}
                {activeTab === tab && (
                  <span className="absolute -bottom-0.5 left-0 w-full h-1 bg-[#F3C5C5] rounded-full animate-in zoom-in duration-300"></span>
                )}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-9 h-9 rounded-xl bg-[#FFF2F2] flex items-center justify-center text-[#F3C5C5] active:scale-90 shadow-sm"
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6">
          <div className="h-full overflow-y-auto custom-scrollbar">
            {activeTab === 'translate' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                <TranslateBox onWordsExtracted={onWordsExtracted} />
                <div className="mt-10 p-8 bg-[#F3C5C5]/5 rounded-[2rem] border border-[#FEE2E2] border-dashed text-center">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm text-[#F3C5C5]">
                    <i className="fas fa-snowflake text-xl"></i>
                  </div>
                  <h4 className="font-playful text-[#5D4A4A] text-xs">Cool Tip</h4>
                  <p className="text-[#A68F8F] text-[10px] font-bold mt-2 leading-relaxed opacity-80">
                    Your snowboard assistant tracks new words from every translation! ❄️
                  </p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                <WordBook words={wordBook} onRemove={onRemoveWord} compact />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileOverlay;

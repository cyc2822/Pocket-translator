
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TranslationResult, VocabularyWord } from './types';
import TranslateBox from './components/TranslateBox';
import WordBook from './components/WordBook';
import MobileOverlay from './components/MobileOverlay';

// Simple Toast Component for a premium feel
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#F3C5C5] text-white px-5 py-2.5 rounded-full shadow-xl shadow-[#F3C5C5]/20 flex items-center gap-2 border border-white/20 backdrop-blur-md">
        <i className="fas fa-snowflake text-[10px] animate-spin-slow"></i>
        <span className="text-[11px] font-black uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [wordBook, setWordBook] = useState<VocabularyWord[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [pipContainer, setPipContainer] = useState<HTMLElement | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    const saved = localStorage.getItem('pocket_words_v2');
    if (saved) {
      try {
        setWordBook(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('pocket_words_v2', JSON.stringify(wordBook));
  }, [wordBook]);

  const showToast = (msg: string) => setToast(msg);

  const addToWordBook = (words: Omit<VocabularyWord, 'id' | 'timestamp'>[]) => {
    const now = Date.now();
    const newEntries: VocabularyWord[] = words.map(w => ({
      ...w,
      id: Math.random().toString(36).substring(7),
      timestamp: now
    }));
    setWordBook(prev => {
      const existing = new Set(prev.map(p => p.word.toLowerCase()));
      const filtered = newEntries.filter(n => !existing.has(n.word.toLowerCase()));
      return [...filtered, ...prev].slice(0, 500);
    });
  };

  const removeWord = (id: string) => {
    setWordBook(prev => prev.filter(w => w.id !== id));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Pocket Translator',
      text: 'Check out this cute AI translator and language helper! 🏂❄️',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link Copied! 🏂');
      }
    } catch (err) { console.log(err); }
  };

  const enterFloatingMode = async () => {
    if (!('documentPictureInPicture' in window)) {
      showToast("Browser not supported!");
      return;
    }
    try {
      // @ts-ignore
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 480,
      });

      [...document.styleSheets].forEach((ss) => {
        try {
          if (ss.href) {
            const l = document.createElement('link');
            l.rel = 'stylesheet'; l.href = ss.href;
            pipWindow.document.head.appendChild(l);
          } else {
            const rules = [...ss.cssRules].map(r => r.cssText).join('');
            const s = document.createElement('style');
            s.textContent = rules;
            pipWindow.document.head.appendChild(s);
          }
        } catch (e) {}
      });

      const container = pipWindow.document.createElement('div');
      container.id = 'pip-root';
      pipWindow.document.body.appendChild(container);
      pipWindow.document.body.className = "bg-[#FFF9F9] p-4 font-sans overflow-hidden";
      
      setPipContainer(container);
      setIsMini(true);

      pipWindow.addEventListener('pagehide', () => {
        setPipContainer(null);
        setIsMini(false);
      });
    } catch (err) { console.error(err); }
  };

  const renderTranslator = (isPip: boolean) => (
    <div className={`w-full transition-all duration-500 ${isPip ? '' : 'max-w-xl mx-auto'}`}>
      <TranslateBox onWordsExtracted={addToWordBook} compact={isPip || isMini} />
      {(isPip || isMini) && wordBook.length > 0 && (
        <div className="mt-4 animate-in fade-in zoom-in duration-500">
          <p className="text-[9px] font-black text-[#E7A4A4] uppercase tracking-[0.2em] mb-2 px-1">Fresh Picks</p>
          <div className="space-y-1.5">
            {wordBook.slice(0, 2).map(w => (
              <div key={w.id} className="bg-white/80 backdrop-blur-sm p-2.5 rounded-[1.2rem] border border-[#FEE2E2] shadow-sm flex justify-between items-center group">
                <div>
                  <div className="text-[11px] font-bold text-[#5D4A4A]">{w.word}</div>
                  <div className="text-[9px] text-[#A68F8F]">{w.meaning}</div>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#FFF2F2] flex items-center justify-center text-[8px] text-[#F3C5C5] group-hover:bg-[#F3C5C5] group-hover:text-white transition-colors">
                  <i className="fas fa-person-snowboarding"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-[#FFF9F9]">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {/* Sidebar */}
      {!isMobile && !isMini && !pipContainer && (
        <aside className="w-64 bg-white h-screen sticky top-0 flex flex-col border-r border-[#FEE2E2] shadow-[10px_0_30px_rgba(243,197,197,0.03)]">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8 group cursor-default">
              <div className="w-10 h-10 bg-[#F3C5C5] rounded-[1rem] flex items-center justify-center text-white shadow-lg shadow-[#F3C5C5]/20 rotate-[-4deg] group-hover:rotate-0 transition-all duration-500">
                <i className="fas fa-person-snowboarding text-lg"></i>
              </div>
              <div>
                <h1 className="text-base font-playful text-[#5D4A4A] leading-none tracking-tight">Pocket</h1>
                <p className="text-[9px] font-bold text-[#F3C5C5] tracking-widest uppercase mt-0.5">Translator</p>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <button 
                onClick={enterFloatingMode}
                className="w-full flex items-center justify-center gap-2.5 p-3 bg-[#FFF2F2] hover:bg-[#FEE2E2] text-[#F3C5C5] rounded-[1.4rem] transition-all active:scale-95 group shadow-sm"
              >
                <i className="fas fa-snowflake text-[10px] group-hover:rotate-90 transition-transform duration-500"></i>
                <span className="text-[11px] font-black uppercase tracking-wider">Magic Float</span>
              </button>

              <button 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 p-2 border border-[#FEE2E2] text-[#D6C1C1] hover:text-[#F3C5C5] hover:border-[#F3C5C5] rounded-[1.4rem] transition-all active:scale-95 group text-[9px] font-black uppercase tracking-widest"
              >
                <i className="fas fa-paper-plane group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"></i>
                Share
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-black text-[#D6C1C1] uppercase tracking-widest">Vocabulary List</span>
              <div className="flex-1 h-[1px] bg-[#FEE2E2]"></div>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col">
            <WordBook words={wordBook} onRemove={removeWord} />
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col relative transition-all duration-500 ${isMini || pipContainer ? 'p-4' : (isMobile ? 'pb-20 p-0' : 'p-6 md:p-12')}`}>
        {/* Playful Pink Background Elements */}
        {!isMini && !pipContainer && !isMobile && (
          <>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F3C5C5]/10 rounded-full blur-[80px] -mr-32 -mt-32 animate-pulse"></div>
          </>
        )}

        {/* Toolbar */}
        {!isMobile && (
          <div className="flex items-center justify-between mb-6 px-1 z-10">
             <div className="flex items-center gap-2">
               {(isMini || pipContainer) && (
                 <div className="flex items-center gap-2 animate-in slide-in-from-left duration-300">
                   <div className="w-7 h-7 bg-[#F3C5C5] rounded-lg flex items-center justify-center text-white text-[10px] shadow-md"><i className="fas fa-person-snowboarding"></i></div>
                   <span className="text-[11px] font-playful text-[#5D4A4A]">PocketTrans</span>
                 </div>
               )}
             </div>
             <div className="flex items-center gap-2">
                {!pipContainer && (
                  <button onClick={handleShare} className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-[#D6C1C1] hover:text-[#F3C5C5] shadow-sm border border-[#FEE2E2] transition-all active:scale-90" title="Share App">
                    <i className="fas fa-share-nodes text-[9px]"></i>
                  </button>
                )}
                {!pipContainer && (
                  <button onClick={enterFloatingMode} className="w-8 h-8 rounded-xl flex items-center justify-center bg-white text-[#D6C1C1] hover:text-[#F3C5C5] shadow-sm border border-[#FEE2E2] transition-all active:scale-90">
                    <i className="fas fa-up-right-from-square text-[9px]"></i>
                  </button>
                )}
                {!pipContainer && (
                  <button onClick={() => setIsMini(!isMini)} className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-sm ${isMini ? 'bg-[#F3C5C5] text-white rotate-180' : 'bg-white text-[#D6C1C1] hover:text-[#F3C5C5] border border-[#FEE2E2]'} active:scale-90`}>
                    <i className={`fas ${isMini ? 'fa-compress-alt' : 'fa-expand-alt'} text-[9px]`}></i>
                  </button>
                )}
             </div>
          </div>
        )}

        {isMobile && !isMini && (
          <header className="bg-white/90 backdrop-blur-md p-4 sticky top-0 z-40 border-b border-[#FEE2E2] flex justify-between items-center rounded-b-[2rem] shadow-sm">
            <div className="flex items-center gap-2.5">
               <div className="w-8 h-8 bg-[#F3C5C5] rounded-xl flex items-center justify-center text-white text-xs shadow-md"><i className="fas fa-person-snowboarding"></i></div>
               <h1 className="font-playful text-[#5D4A4A] text-sm">PocketTrans</h1>
            </div>
            <div className="flex gap-1.5">
              <button onClick={handleShare} className="w-9 h-9 rounded-xl bg-[#FFF2F2] text-[#F3C5C5] flex items-center justify-center active:scale-90 shadow-sm">
                  <i className="fas fa-share-nodes text-xs"></i>
              </button>
              <button onClick={() => setIsMobileExpanded(true)} className="w-9 h-9 rounded-xl bg-[#FFF2F2] text-[#F3C5C5] flex items-center justify-center active:scale-90 shadow-sm">
                  <i className="fas fa-book-sparkles text-xs"></i>
              </button>
            </div>
          </header>
        )}

        {/* The Actual Content */}
        <div className="z-10 h-full overflow-hidden">
          {pipContainer 
            ? createPortal(renderTranslator(true), pipContainer) 
            : renderTranslator(false)
          }
        </div>
      </main>

      {isMobile && (
        <MobileOverlay 
          isExpanded={isMobileExpanded} setIsExpanded={setIsMobileExpanded}
          onWordsExtracted={addToWordBook} wordBook={wordBook} onRemoveWord={removeWord}
        />
      )}
    </div>
  );
};

export default App;


import React, { useState, useRef } from 'react';
import { translateAndExtract } from '../services/gemini';
import { TranslationResult, VocabularyWord } from '../types';

interface TranslateBoxProps {
  onWordsExtracted: (words: Omit<VocabularyWord, 'id' | 'timestamp'>[]) => void;
  compact?: boolean;
}

const TranslateBox: React.FC<TranslateBoxProps> = ({ onWordsExtracted, compact = false }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performTranslation = async (text: string) => {
    if (!text.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await translateAndExtract(text);
      setResult(data);
      if (data.vocabulary && data.vocabulary.length > 0) {
        onWordsExtracted(data.vocabulary);
      }
    } catch (err) {
      setError('Aww, snowy connection hiccup!');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => performTranslation(val), 800);
  };

  // 极致紧凑的字号自适应逻辑
  const getDynamicFontSize = (text: string) => {
    const len = text.length;
    if (compact) {
      if (len < 15) return 'text-sm';
      return 'text-xs';
    }
    // 非紧凑模式（桌面端结果区）
    if (len < 15) return 'text-lg md:text-xl'; // 单词
    if (len < 50) return 'text-base md:text-lg'; // 短句
    return 'text-sm md:text-base'; // 长段落：回归到正常的 14-16px，不再巨大
  };

  return (
    <div className={`flex flex-col gap-3 ${compact ? 'gap-2' : 'gap-4'}`}>
      <div className={`relative bg-white border border-[#FEE2E2] shadow-[0_8px_25px_rgba(243,197,197,0.06)] transition-all duration-500 rounded-[1.6rem] overflow-hidden ${compact ? 'rounded-[1.2rem]' : ''}`}>
        <textarea
          value={input}
          onChange={handleChange}
          placeholder="Type or paste to slide... 🏂"
          className={`w-full p-4 pr-10 resize-none focus:outline-none text-[#5D4A4A] placeholder:text-[#D6C1C1] font-bold bg-transparent ${compact ? 'h-20 text-xs p-3' : 'h-28 text-sm'}`}
        />
        
        {loading && (
          <div className="absolute bottom-4 right-4 animate-spin text-[#F3C5C5]">
            <i className="fas fa-snowflake text-[10px]"></i>
          </div>
        )}

        <div className={`bg-[#FFF2F2]/20 px-4 py-1 flex justify-between items-center text-[8px] font-black text-[#D6C1C1] uppercase tracking-widest border-t border-[#FEE2E2]/50`}>
           <span>{input.length} chars</span>
           <span className="opacity-60 flex items-center gap-1">
             <i className="fas fa-cloud-sun-rain text-[7px]"></i> Snow Mode
           </span>
        </div>
      </div>

      {result && !loading && (
        <div className={`bg-[#F3C5C5] rounded-[1.6rem] shadow-lg shadow-[#F3C5C5]/10 p-4 text-white animate-in zoom-in slide-in-from-top-2 duration-500 relative overflow-hidden ${compact ? 'p-3.5 rounded-[1.2rem]' : 'p-5'}`}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">{result.detectedLanguage}</span>
            <div className="flex gap-1">
              <button onClick={() => navigator.clipboard.writeText(result.translatedText)} className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all">
                <i className="far fa-copy text-[9px]"></i>
              </button>
            </div>
          </div>
          
          <p className={`font-playful leading-relaxed relative z-10 break-words ${getDynamicFontSize(result.translatedText)}`}>
            {result.translatedText}
          </p>

          {result.vocabulary.length > 0 && !compact && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 relative z-10">
              {result.vocabulary.map((v, i) => (
                <div key={i} className="bg-white/10 p-2.5 rounded-[1rem] backdrop-blur-sm border border-white/5 flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black">{v.word}</span>
                    <i className="fas fa-snowflake text-[6px] text-white/40"></i>
                  </div>
                  <p className="text-[10px] font-medium opacity-90 leading-tight">{v.meaning}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-[#FFF2F2] text-[#F3C5C5] p-3 rounded-[1.2rem] text-[9px] font-bold flex items-center gap-2 animate-pulse border border-[#FEE2E2]">
           <i className="fas fa-mountain-sun text-xs"></i>
           {error}
        </div>
      )}
    </div>
  );
};

export default TranslateBox;

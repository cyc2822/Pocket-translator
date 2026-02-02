
export interface VocabularyWord {
  id: string;
  word: string;
  ipa?: string;
  meaning: string;
  example: string;
  timestamp: number;
}

export interface TranslationResult {
  translatedText: string;
  detectedLanguage: string;
  sourceText: string;
  vocabulary: Omit<VocabularyWord, 'id' | 'timestamp'>[];
}

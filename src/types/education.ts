export type ArticleCategory = 'menstrual-health' | 'fertility' | 'symptoms' | 'lifestyle' | 'faq';

export type MediaType = 'text' | 'video';

export interface Article {
  id: string;
  category: ArticleCategory;
  title: string;
  summary: string;
  content: string;
  mediaType: MediaType;
  videoUrl?: string;
  imageUrl?: string;
  readTimeMinutes: number;
  tags: string[];
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: ArticleCategory;
}

export interface CycleTip {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  title: string;
  description: string;
  icon: string;
}

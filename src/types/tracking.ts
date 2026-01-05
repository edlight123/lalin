export type IsoDateString = `${number}-${number}-${number}`;

export type FlowLevel = 'light' | 'medium' | 'heavy';

export type MoodKey = 'happy' | 'sad' | 'anxious' | 'irritable' | 'calm' | 'energetic' | 'tired';

export type PeriodEntry = {
  id: string;
  startDate: IsoDateString;
  endDate?: IsoDateString;
  flow?: FlowLevel;
  notes?: string;
  createdAt: string;
};

export type SymptomEntry = {
  id: string;
  date: IsoDateString;
  symptoms: string[];
  mood?: MoodKey;
  notes?: string;
  createdAt: string;
};

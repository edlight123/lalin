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

export type SymptomSeverity = 0 | 1 | 2 | 3;

export type SymptomItem = {
  key: string; // e.g. 'cramps' or custom label
  custom?: boolean; // true if user-defined
  severity: SymptomSeverity;
};

export type SymptomEntry = {
  id: string;
  date: IsoDateString;
  symptoms: SymptomItem[];
  medications?: string[]; // e.g. ['Ibuprofen', 'Iron supplement']
  mood?: MoodKey;
  notes?: string;
  createdAt: string;
};

export type ProtectionStatus = 'protected' | 'unprotected' | 'none';

export type SexualActivityEntry = {
  id: string;
  date: IsoDateString;
  protection: ProtectionStatus;
  notes?: string;
  createdAt: string;
};

export type OvulationTestResult = 'positive' | 'negative' | 'none';

export type OvulationEntry = {
  id: string;
  date: IsoDateString;
  ovulationTest?: OvulationTestResult;
  bbt?: number; // Basal body temperature in Celsius
  notes?: string;
  createdAt: string;
};

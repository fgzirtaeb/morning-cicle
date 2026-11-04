/**
 * Types for Morning Circle · Unit 2
 * Designed for CRA Jimena Muñiz (Corullón, León)
 */

export type DesdobleId = 'desdoble1' | 'desdoble2';

export type GradeId = 'grade2' | 'grade3' | 'grade4' | 'grade5' | 'grade6';

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface StepInfo {
  number: StepNumber;
  title: string;
  subtitleEs: string;
  icon: string;
}

export interface EmotionItem {
  id: string;
  label: string;
  emoji: string;
  spanish: string;
}

export interface DialogueLine {
  id: string;
  speaker: 'teacher' | 'students';
  textEn: string;
  textEs: string;
}

export interface DialogueByGrade {
  gradeId: GradeId;
  gradeTitle: string;
  lines: DialogueLine[];
}

export interface WeatherDataDocument {
  date: string;
  hours: Record<string, number>;
  source: string;
  fetched: string;
}

export interface TeamScore {
  id: string;
  name: string;
  color: string;
  points: number;
}

export interface BadgeItem {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

export interface TerritoryMap {
  gradeId: GradeId;
  territoryName: string;
  themeDesc: string;
  icon: string;
  tiles: {
    id: number;
    title: string;
    description: string;
    completed: boolean;
  }[];
}

export type DUALevel = 1 | 2 | 3;

export interface FlashCardItem {
  id: string;
  term: string;
  emoji: string;
  category: string;
  sentence: string;
  pronunciationNotice?: string;
  scaffoldLevel1: string; // Visual & hint
  scaffoldLevel2: string; // Fill-in-the-blank
  scaffoldLevel3: string; // Free production prompt
}

export interface WhereIsItItem {
  id: string;
  subject: string;
  subjectEmoji: string;
  location: string;
  locationEmoji: string;
  preposition: 'on' | 'under' | 'in' | 'behind';
  correctSentence: string;
  options: string[];
}

export interface RiddleItem {
  id: string;
  target: string;
  targetEmoji: string;
  habitat: string;
  clues: [string, string, string]; // Clue 1 (hard), Clue 2 (medium), Clue 3 (easy)
  grammarPattern: string; // e.g. "It climbs trees. It doesn't swim."
}

export interface FamousPersonItem {
  id: string;
  name: string;
  role: string;
  roleEmoji: string;
  clues: string[];
  regularVerb: string; // e.g. "invented", "lived", "painted"
  verbBase: string;
  edPronunciation: '/t/' | '/d/' | '/ɪd/';
  pronunciationExplanation: string;
}

export interface QuickCheckItem {
  id: string;
  question: string;
  type: 'true-false' | 'odd-one-out' | 'correct-mistake';
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface GradeUnitData {
  gradeId: GradeId;
  gradeNumber: number;
  gradeLabel: string;
  unitTitle: string;
  themeTerritory: string;
  accentColor: string;
  bgLight: string;
  dialogueLines: DialogueLine[];
  vocabulary: FlashCardItem[];
  whereIsItItems?: WhereIsItItem[];
  riddles?: RiddleItem[];
  famousPeople?: FamousPersonItem[];
  quickChecks: QuickCheckItem[];
  exitTicketPrompts: string[];
}

export interface DesdobleState {
  desdobleId: DesdobleId;
  starJar: number;
  maxStars: number;
  rewardsUnlocked: number;
  teams: TeamScore[];
  scoreHistory: { teamId: string; delta: number; timestamp: number }[];
  territories: Record<GradeId, boolean[]>; // 6 tiles per grade
  badges: Record<string, boolean>;
  streak: number; // Completed sessions streak
  lastCompletedDate?: string;
  bonusGameUnlocked: boolean;
  emotionTally: Record<string, number>;
}

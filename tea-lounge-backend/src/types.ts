// Core types and interfaces for Gigi AI system

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "gigi";
  timestamp: Date;
}

export interface ChatRequest {
  conversationHistory: ChatMessage[];
  sessionId?: string; // For session tracking
  roastCounter?: number; // Legacy support
}

export interface ChatResponse {
  gigiResponse: string;
  sessionId: string;
  newRoastCounter?: number; // Legacy support
  emotionalState?: EmotionalState;
  detectedEmotion?: EmotionAnalysis;
  learnedFacts?: string[]; // New facts learned from this message
  needsClarification?: Array<{
    conflictId: string;
    question: string;
    severity: "low" | "medium" | "high";
  }>; // Conflicts that need user clarification
}

// Emotion detection system
export interface EmotionAnalysis {
  primaryEmotion: Emotion;
  intensity: EmotionIntensity;
  emotionScores: { [key in Emotion]: number };
  isAngryWithVahant: boolean;
  emotionalTriggers: string[];
  confidence: number;
}

export type Emotion =
  | "happy"
  | "sad"
  | "angry"
  | "excited"
  | "neutral"
  | "anxious"
  | "frustrated"
  | "love"
  | "confused";

export type EmotionIntensity = "low" | "medium" | "high";

export interface EmotionalState {
  currentEmotion: Emotion;
  intensity: EmotionIntensity;
  isAngryWithVahant: boolean;
  moodHistory: MoodHistoryEntry[];
  lastEmotionalCheck: Date;
}

export interface MoodHistoryEntry {
  emotion: Emotion;
  intensity: EmotionIntensity;
  timestamp: Date;
  trigger?: string;
}

// Conversation context and memory
export interface ConversationContext {
  recentMessages: ChatMessage[];
  currentTopic?: string;
  ongoingConcerns: string[];
  conversationMood: Emotion;
  lastActivity: Date;
  sessionStarted: Date;
}

export interface ConversationMemory {
  shortTermMemory: ChatMessage[]; // Last 10 messages
  contextSummary: string;
  topicsDiscussed: string[];
  importantMoments: ImportantMoment[];
}

export interface ImportantMoment {
  timestamp: Date;
  description: string;
  emotionalSignificance: EmotionIntensity;
  category: "achievement" | "relationship" | "concern" | "goal" | "memory";
}

// Knowledge management
export interface KnowledgeBase {
  personalFacts: PersonalFact[];
  relationshipDynamics: RelationshipDynamic[];
  preferences: Preference[];
  goals: Goal[];
  concerns: Concern[];
  memories: Memory[];
  lastUpdated: Date;
}

export interface PersonalFact {
  id: string;
  category: "preference" | "habit" | "trait" | "interest" | "goal" | "concern";
  key: string;
  value: string;
  confidence: number;
  source: string; // How we learned this
  timestamp: Date;
  relevance: number; // How often it comes up
}

export interface RelationshipDynamic {
  person: string;
  relationship: string; // "boyfriend", "friend", etc.
  positiveTraits: string[];
  challenges: string[];
  sweetMoments: string[];
  lastUpdated: Date;
}

export interface Preference {
  category: string;
  item: string;
  sentiment: "loves" | "likes" | "neutral" | "dislikes" | "hates";
  confidence: number;
  context?: string;
}

export interface Goal {
  description: string;
  category: "personal" | "relationship" | "career" | "health" | "creative";
  status: "active" | "completed" | "paused" | "abandoned";
  importance: number;
  timeline?: string;
}

export interface Concern {
  description: string;
  category: "relationship" | "personal" | "work" | "family" | "health";
  severity: EmotionIntensity;
  status: "active" | "resolved" | "ongoing";
  firstMentioned: Date;
  lastDiscussed: Date;
}

export interface Memory {
  description: string;
  category: "sweet" | "funny" | "significant" | "achievement" | "challenge";
  emotionalTone: Emotion;
  people: string[];
  timestamp: Date;
  importance: number;
}

// Response generation
export interface ResponseContext {
  emotion: EmotionAnalysis;
  conversationContext: ConversationContext;
  knowledgeContext: RelevantKnowledge;
  responseStrategy: ResponseStrategy;
}

export interface RelevantKnowledge {
  relevantFacts: PersonalFact[];
  relevantMemories: Memory[];
  relationshipContext?: RelationshipDynamic;
  recentConcerns: Concern[];
}

export interface ResponseStrategy {
  strategy:
    | "support"
    | "celebrate"
    | "roast_and_balance"
    | "explore"
    | "remember"
    | "casual";
  tone: "empathetic" | "playful" | "sassy" | "encouraging" | "curious" | "warm";
  shouldAskQuestions: boolean;
  shouldShareMemory: boolean;
  shouldRoast: boolean;
  roastBalance: number; // If roasting, how much positivity to balance with
}

// Learning and updates
export interface LearningExtraction {
  newFacts: PersonalFact[];
  updatedRelationships: RelationshipDynamic[];
  newMemories: Memory[];
  updatedConcerns: Concern[];
  confidence: number;
}

export interface LearningPrompt {
  conversationHistory: ChatMessage[];
  focusArea?: "emotions" | "facts" | "relationships" | "preferences";
  existingKnowledge: KnowledgeBase;
}

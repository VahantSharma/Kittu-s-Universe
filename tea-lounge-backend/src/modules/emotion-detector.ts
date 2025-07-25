import { GenerativeModel } from "@google/generative-ai";
import {
  ChatMessage,
  Emotion,
  EmotionAnalysis,
  EmotionIntensity,
} from "../types";

export class EmotionDetector {
  private model: GenerativeModel;

  constructor(model: GenerativeModel) {
    this.model = model;
  }

  /**
   * Analyzes emotion with enhanced Vahant-specific anger detection
   */
  async detectEmotion(
    conversationHistory: ChatMessage[]
  ): Promise<EmotionAnalysis> {
    if (conversationHistory.length === 0) {
      return this.getDefaultEmotion();
    }

    const latestMessage = conversationHistory[conversationHistory.length - 1];

    // Quick check for simple greetings to avoid unnecessary AI calls
    if (this.isSimpleGreeting(latestMessage.text)) {
      return {
        primaryEmotion: "happy",
        intensity: "low",
        emotionScores: {
          happy: 0.8,
          sad: 0,
          angry: 0,
          excited: 0,
          neutral: 0.2,
          anxious: 0,
          frustrated: 0,
          love: 0,
          confused: 0,
        },
        isAngryWithVahant: false,
        emotionalTriggers: ["greeting"],
        confidence: 0.9,
      };
    }

    const context = this.buildEmotionContext(conversationHistory);

    try {
      // Enhanced AI analysis with Vahant-specific context
      const emotionPrompt = this.buildEmotionPrompt(
        latestMessage.text,
        context
      );
      const result = await this.model.generateContent(emotionPrompt);
      const response = result.response.text().trim();

      return this.parseEmotionResponse(response, latestMessage.text);
    } catch (error) {
      console.error("Emotion detection failed, using fallback:", error);
      return this.fallbackEmotionDetection(latestMessage.text);
    }
  }

  /**
   * Builds context for emotion analysis from recent messages
   */
  private buildEmotionContext(conversationHistory: ChatMessage[]): string {
    const recentMessages = conversationHistory.slice(-5); // Last 5 messages for context
    return recentMessages
      .map((msg) => `${msg.sender === "user" ? "Kittu" : "Gigi"}: ${msg.text}`)
      .join("\n");
  }

  /**
   * Creates a sophisticated prompt for emotion detection
   */
  private buildEmotionPrompt(latestMessage: string, context: string): string {
    return `You are an expert emotion analyst. Analyze Kittu's emotional state from her latest message and conversation context.

LATEST MESSAGE: "${latestMessage}"

RECENT CONVERSATION CONTEXT:
${context}

Analyze for:
1. Primary emotion (happy, sad, angry, excited, neutral, anxious, frustrated, love, confused)
2. Intensity (low, medium, high)
3. Whether she's specifically angry with her boyfriend Vahant
4. Emotional triggers or keywords that indicate the emotion
5. Confidence in your analysis (0.0 to 1.0)

CRITICAL: Look for these patterns:
- Complaints about Vahant, relationship frustration → angry (with Vahant)
- Excitement about events, achievements → happy/excited
- Expressions of sadness, disappointment → sad
- Questions, uncertainty → confused
- Worry about future events → anxious
- General chat without strong emotion → neutral

Return ONLY this JSON format:
{
  "primaryEmotion": "emotion_name",
  "intensity": "low|medium|high",
  "emotionScores": {
    "happy": 0.0,
    "sad": 0.0,
    "angry": 0.0,
    "excited": 0.0,
    "neutral": 0.0,
    "anxious": 0.0,
    "frustrated": 0.0,
    "love": 0.0,
    "confused": 0.0
  },
  "isAngryWithVahant": false,
  "emotionalTriggers": ["word1", "word2"],
  "confidence": 0.85
}`;
  }

  /**
   * Parses AI response and validates emotion analysis
   */
  private parseEmotionResponse(
    response: string,
    originalMessage: string
  ): EmotionAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate and sanitize the response
      return {
        primaryEmotion: this.validateEmotion(parsed.primaryEmotion),
        intensity: this.validateIntensity(parsed.intensity),
        emotionScores: this.validateEmotionScores(parsed.emotionScores),
        isAngryWithVahant: Boolean(parsed.isAngryWithVahant),
        emotionalTriggers: Array.isArray(parsed.emotionalTriggers)
          ? parsed.emotionalTriggers.slice(0, 5) // Limit to 5 triggers
          : [],
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      };
    } catch (error) {
      console.error("Failed to parse emotion response:", error);
      return this.fallbackEmotionDetection(originalMessage);
    }
  }

  /**
   * Fallback emotion detection using simple keyword matching
   */
  private fallbackEmotionDetection(message: string): EmotionAnalysis {
    const lowerMessage = message.toLowerCase();

    // Simple keyword-based emotion detection
    const emotionKeywords = {
      happy: [
        "happy",
        "joy",
        "excited",
        "amazing",
        "wonderful",
        "great",
        "awesome",
        "yay",
      ],
      sad: [
        "sad",
        "depressed",
        "down",
        "upset",
        "crying",
        "hurt",
        "disappointed",
      ],
      angry: [
        "angry",
        "mad",
        "furious",
        "annoyed",
        "irritated",
        "frustrated",
        "pissed",
      ],
      excited: ["excited", "thrilled", "can't wait", "amazing", "omg", "wow"],
      anxious: [
        "worried",
        "nervous",
        "anxious",
        "scared",
        "concerned",
        "stress",
      ],
      confused: ["confused", "don't understand", "what", "huh", "unclear"],
      love: ["love", "adore", "amazing", "perfect", "best", "wonderful"],
    };

    let primaryEmotion: Emotion = "neutral";
    let maxScore = 0;
    const emotionScores: { [key in Emotion]: number } = {
      happy: 0,
      sad: 0,
      angry: 0,
      excited: 0,
      neutral: 0.5,
      anxious: 0,
      frustrated: 0,
      love: 0,
      confused: 0,
    };

    // Check for emotion keywords
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
      const score =
        keywords.reduce((acc, keyword) => {
          return acc + (lowerMessage.includes(keyword) ? 1 : 0);
        }, 0) / keywords.length;

      emotionScores[emotion as Emotion] = score;
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as Emotion;
      }
    }

    // Check if angry with Vahant specifically
    const isAngryWithVahant =
      lowerMessage.includes("vahant") &&
      (emotionScores.angry > 0.3 || emotionScores.frustrated > 0.3);

    return {
      primaryEmotion,
      intensity: maxScore > 0.6 ? "high" : maxScore > 0.3 ? "medium" : "low",
      emotionScores,
      isAngryWithVahant,
      emotionalTriggers: this.extractTriggers(message),
      confidence: 0.6, // Lower confidence for fallback
    };
  }

  /**
   * Extracts emotional trigger words from message
   */
  private extractTriggers(message: string): string[] {
    const emotionalWords = [
      "vahant",
      "boyfriend",
      "relationship",
      "annoying",
      "frustrated",
      "happy",
      "sad",
      "excited",
      "worried",
      "confused",
      "angry",
      "love",
    ];

    return emotionalWords
      .filter((word) => message.toLowerCase().includes(word))
      .slice(0, 3);
  }

  /**
   * Validates emotion is in allowed list
   */
  private validateEmotion(emotion: string): Emotion {
    const validEmotions: Emotion[] = [
      "happy",
      "sad",
      "angry",
      "excited",
      "neutral",
      "anxious",
      "frustrated",
      "love",
      "confused",
    ];
    return validEmotions.includes(emotion as Emotion)
      ? (emotion as Emotion)
      : "neutral";
  }

  /**
   * Validates intensity is in allowed list
   */
  private validateIntensity(intensity: string): EmotionIntensity {
    const validIntensities: EmotionIntensity[] = ["low", "medium", "high"];
    return validIntensities.includes(intensity as EmotionIntensity)
      ? (intensity as EmotionIntensity)
      : "medium";
  }

  /**
   * Validates and normalizes emotion scores
   */
  private validateEmotionScores(scores: unknown): { [key in Emotion]: number } {
    const defaultScores: { [key in Emotion]: number } = {
      happy: 0,
      sad: 0,
      angry: 0,
      excited: 0,
      neutral: 0.5,
      anxious: 0,
      frustrated: 0,
      love: 0,
      confused: 0,
    };

    if (typeof scores !== "object" || scores === null) {
      return defaultScores;
    }

    const validatedScores = { ...defaultScores };

    if (typeof scores === "object" && scores !== null) {
      const scoresObj = scores as Record<string, unknown>;
      for (const emotion of Object.keys(defaultScores)) {
        if (typeof scoresObj[emotion] === "number") {
          validatedScores[emotion as Emotion] = Math.max(
            0,
            Math.min(1, scoresObj[emotion] as number)
          );
        }
      }
    }

    return validatedScores;
  }

  /**
   * Returns default neutral emotion
   */
  private getDefaultEmotion(): EmotionAnalysis {
    return {
      primaryEmotion: "neutral",
      intensity: "low",
      emotionScores: {
        happy: 0,
        sad: 0,
        angry: 0,
        excited: 0,
        neutral: 1,
        anxious: 0,
        frustrated: 0,
        love: 0,
        confused: 0,
      },
      isAngryWithVahant: false,
      emotionalTriggers: [],
      confidence: 1.0,
    };
  }

  /**
   * Quick emotion check for simple cases (greeting, basic responses)
   */
  isSimpleGreeting(message: string): boolean {
    const greetings = ["hi", "hello", "hey", "good morning", "good evening"];
    const lowerMessage = message.toLowerCase().trim();
    return greetings.some(
      (greeting) =>
        lowerMessage === greeting ||
        lowerMessage === `${greeting} gigi` ||
        lowerMessage.startsWith(`${greeting} `)
    );
  }

  /**
   * Checks if message contains relationship complaints
   */
  containsRelationshipComplaint(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const relationshipWords = ["vahant", "boyfriend", "he"];
    const complaintWords = [
      "annoying",
      "frustrating",
      "stupid",
      "wrong",
      "bad",
      "hate",
    ];

    return (
      relationshipWords.some((rel) => lowerMessage.includes(rel)) &&
      complaintWords.some((comp) => lowerMessage.includes(comp))
    );
  }
}

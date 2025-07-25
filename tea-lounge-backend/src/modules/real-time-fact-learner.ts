/**
 * Real-Time Fact Learner - Extracts and learns facts from conversations immediately
 * with confidence scoring and intelligent categorization
 */

import { GenerativeModel } from "@google/generative-ai";

export interface LearnedFact {
  id: string;
  content: string;
  category:
    | "personal"
    | "relationship"
    | "preferences"
    | "emotions"
    | "plans"
    | "interests"
    | "concerns";
  confidence: number; // 0.0 to 1.0
  timestamp: Date;
  source: string; // The original message
  verified: boolean;
}

export interface FactExtractionResult {
  facts: LearnedFact[];
  confidence: number;
  needsVerification: LearnedFact[];
}

export class RealTimeFactLearner {
  private model: GenerativeModel;
  private factCounter = 0;

  constructor(model: GenerativeModel) {
    this.model = model;
  }

  /**
   * Extracts facts from a message in real-time
   */
  async extractFacts(
    message: string,
    conversationContext?: string[]
  ): Promise<FactExtractionResult> {
    if (this.isSimpleMessage(message)) {
      return {
        facts: [],
        confidence: 1.0,
        needsVerification: [],
      };
    }

    try {
      const extractionPrompt = this.buildFactExtractionPrompt(
        message,
        conversationContext
      );
      const result = await this.model.generateContent(extractionPrompt);
      const response = result.response.text().trim();

      return this.parseFactExtractionResponse(response, message);
    } catch (error) {
      console.error("Fact extraction failed:", error);
      return this.fallbackFactExtraction(message);
    }
  }

  /**
   * Builds prompt for fact extraction
   */
  private buildFactExtractionPrompt(
    message: string,
    context?: string[]
  ): string {
    return `You are an intelligent fact extraction system. Extract meaningful facts from Kittu's message.

MESSAGE: "${message}"
${context ? `CONTEXT: ${context.join(", ")}` : ""}

Extract facts in this JSON format:
{
  "facts": [
    {
      "content": "specific fact content",
      "category": "personal|relationship|preferences|emotions|plans|interests|concerns",
      "confidence": 0.9,
      "needsVerification": false
    }
  ]
}

EXTRACTION RULES:
1. Only extract CONCRETE facts, not opinions or casual statements
2. Categories:
   - personal: About Kittu herself (age, job, family, etc.)
   - relationship: About Vahant or romantic relationships
   - preferences: Things she likes/dislikes (food, places, activities)
   - emotions: Current emotional states or feelings
   - plans: Future activities or scheduled events
   - interests: Hobbies, topics she's interested in
   - concerns: Worries or problems she mentions

3. Confidence scoring:
   - 0.9-1.0: Explicitly stated facts
   - 0.7-0.8: Strongly implied facts
   - 0.5-0.6: Uncertain or ambiguous facts
   - Below 0.5: Don't extract

4. Set needsVerification=true if the fact contradicts common patterns or seems unusual

Examples:
- "I'm going on a date with Vahant tomorrow" → plans: "Date with Vahant scheduled for tomorrow"
- "I love blue dresses" → preferences: "Likes blue dresses"
- "I feel sad about the cheesecake" → emotions: "Currently feeling sad about cheesecake situation"

Return only JSON response:`;
  }

  /**
   * Parses AI response for fact extraction
   */
  private parseFactExtractionResponse(
    response: string,
    originalMessage: string
  ): FactExtractionResult {
    try {
      // Clean up response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.fallbackFactExtraction(originalMessage);
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const facts: LearnedFact[] = [];
      const needsVerification: LearnedFact[] = [];

      if (parsed.facts && Array.isArray(parsed.facts)) {
        for (const factData of parsed.facts) {
          if (factData.confidence >= 0.5) {
            const fact: LearnedFact = {
              id: this.generateFactId(),
              content: factData.content,
              category: factData.category,
              confidence: factData.confidence,
              timestamp: new Date(),
              source: originalMessage,
              verified: !factData.needsVerification,
            };

            facts.push(fact);

            if (factData.needsVerification) {
              needsVerification.push(fact);
            }
          }
        }
      }

      return {
        facts,
        confidence:
          facts.length > 0 ? Math.max(...facts.map((f) => f.confidence)) : 0,
        needsVerification,
      };
    } catch (error) {
      console.error("Failed to parse fact extraction response:", error);
      return this.fallbackFactExtraction(originalMessage);
    }
  }

  /**
   * Fallback fact extraction using pattern matching
   */
  private fallbackFactExtraction(message: string): FactExtractionResult {
    const facts: LearnedFact[] = [];
    const lowerMessage = message.toLowerCase();

    // Pattern-based fact extraction
    const patterns = [
      {
        pattern: /going.*(date|dinner|out).*(vahant|with him)/i,
        category: "plans" as const,
        template: (match: string) => `Plans to go on date with Vahant`,
      },
      {
        pattern: /wearing.*(dress|outfit|clothes)/i,
        category: "preferences" as const,
        template: (match: string) => `Outfit choice: ${match}`,
      },
      {
        pattern: /feel(ing)?\s+(sad|happy|excited|nervous|angry)/i,
        category: "emotions" as const,
        template: (match: string) =>
          `Current emotion: ${match.split(" ").pop()}`,
      },
      {
        pattern: /going\s+to\s+([^.!?]+)/i,
        category: "plans" as const,
        template: (match: string) =>
          `Plans to visit: ${match.replace("going to ", "")}`,
      },
    ];

    patterns.forEach(({ pattern, category, template }) => {
      const match = message.match(pattern);
      if (match) {
        facts.push({
          id: this.generateFactId(),
          content: template(match[0]),
          category,
          confidence: 0.7,
          timestamp: new Date(),
          source: message,
          verified: true,
        });
      }
    });

    return {
      facts,
      confidence: facts.length > 0 ? 0.7 : 0,
      needsVerification: [],
    };
  }

  /**
   * Checks if message is too simple for fact extraction
   */
  private isSimpleMessage(message: string): boolean {
    const simplePatterns = [
      /^(hi|hello|hey|yes|no|ok|okay|thanks|bye)$/i,
      /^[a-z]{1,3}$/i, // Very short responses
      /^(lol|haha|omg|wow)$/i,
    ];

    return simplePatterns.some((pattern) => pattern.test(message.trim()));
  }

  /**
   * Generates unique fact ID
   */
  private generateFactId(): string {
    return `fact_${Date.now()}_${++this.factCounter}`;
  }

  /**
   * Categorizes a fact based on content
   */
  public categorizeFact(content: string): LearnedFact["category"] {
    const lowerContent = content.toLowerCase();

    if (
      lowerContent.includes("vahant") ||
      lowerContent.includes("boyfriend") ||
      lowerContent.includes("relationship")
    ) {
      return "relationship";
    }

    if (
      lowerContent.includes("feel") ||
      lowerContent.includes("sad") ||
      lowerContent.includes("happy") ||
      lowerContent.includes("excited") ||
      lowerContent.includes("nervous")
    ) {
      return "emotions";
    }

    if (
      lowerContent.includes("going") ||
      lowerContent.includes("date") ||
      lowerContent.includes("plan") ||
      lowerContent.includes("tomorrow") ||
      lowerContent.includes("next")
    ) {
      return "plans";
    }

    if (
      lowerContent.includes("like") ||
      lowerContent.includes("love") ||
      lowerContent.includes("hate") ||
      lowerContent.includes("prefer")
    ) {
      return "preferences";
    }

    if (
      lowerContent.includes("worried") ||
      lowerContent.includes("concerned") ||
      lowerContent.includes("problem") ||
      lowerContent.includes("issue")
    ) {
      return "concerns";
    }

    if (
      lowerContent.includes("hobby") ||
      lowerContent.includes("enjoy") ||
      lowerContent.includes("interested")
    ) {
      return "interests";
    }

    return "personal";
  }

  /**
   * Validates fact against common sense
   */
  public validateFact(fact: LearnedFact): boolean {
    // Basic validation rules
    if (fact.content.length < 5) return false;
    if (fact.confidence < 0.3) return false;

    // Category-specific validation
    switch (fact.category) {
      case "emotions":
        return /\b(happy|sad|excited|nervous|angry|love|joy|fear|anxiety|depression)\b/i.test(
          fact.content
        );
      case "plans":
        return /\b(going|will|plan|date|visit|meet|tomorrow|next|future)\b/i.test(
          fact.content
        );
      case "relationship":
        return /\b(vahant|boyfriend|date|love|relationship)\b/i.test(
          fact.content
        );
      default:
        return true;
    }
  }
}

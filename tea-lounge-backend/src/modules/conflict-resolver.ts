/**
 * Conflict Resolver - Detects conflicts between new and existing facts
 * and generates intelligent clarification questions
 */

import { LearnedFact } from "./real-time-fact-learner";

export interface ConflictInfo {
  conflictId: string;
  newFact: LearnedFact;
  existingFact: LearnedFact;
  conflictType: "contradiction" | "inconsistency" | "ambiguity" | "temporal";
  severity: "low" | "medium" | "high";
  clarificationQuestion: string;
  suggestedResolution: "update" | "ignore" | "clarify" | "merge";
}

export interface ConflictResolutionResult {
  conflicts: ConflictInfo[];
  hasConflicts: boolean;
  needsImmediateAttention: ConflictInfo[];
  autoResolvable: ConflictInfo[];
}

export class ConflictResolver {
  private conflictCounter = 0;

  /**
   * Detects conflicts between new facts and existing knowledge
   */
  detectConflicts(
    newFacts: LearnedFact[],
    existingFacts: { [category: string]: { [key: string]: string } }
  ): ConflictResolutionResult {
    const conflicts: ConflictInfo[] = [];
    const needsImmediateAttention: ConflictInfo[] = [];
    const autoResolvable: ConflictInfo[] = [];

    for (const newFact of newFacts) {
      const categoryFacts = existingFacts[newFact.category] || {};

      for (const [key, existingContent] of Object.entries(categoryFacts)) {
        const conflictInfo = this.analyzeFactConflict(
          newFact,
          existingContent,
          key
        );

        if (conflictInfo) {
          conflicts.push(conflictInfo);

          if (
            conflictInfo.severity === "high" ||
            conflictInfo.conflictType === "contradiction"
          ) {
            needsImmediateAttention.push(conflictInfo);
          } else if (
            conflictInfo.suggestedResolution === "update" ||
            conflictInfo.suggestedResolution === "merge"
          ) {
            autoResolvable.push(conflictInfo);
          }
        }
      }
    }

    return {
      conflicts,
      hasConflicts: conflicts.length > 0,
      needsImmediateAttention,
      autoResolvable,
    };
  }

  /**
   * Analyzes potential conflict between new and existing fact
   */
  private analyzeFactConflict(
    newFact: LearnedFact,
    existingContent: string,
    existingKey: string
  ): ConflictInfo | null {
    // Create a mock existing fact for comparison
    const existingFact: LearnedFact = {
      id: existingKey,
      content: existingContent,
      category: newFact.category,
      confidence: 0.8, // Assume existing facts have high confidence
      timestamp: new Date(Date.now() - 86400000), // Yesterday
      source: "previous conversation",
      verified: true,
    };

    // Check for different types of conflicts
    const contradictionConflict = this.checkContradiction(
      newFact,
      existingFact
    );
    if (contradictionConflict) return contradictionConflict;

    const temporalConflict = this.checkTemporalConflict(newFact, existingFact);
    if (temporalConflict) return temporalConflict;

    const inconsistencyConflict = this.checkInconsistency(
      newFact,
      existingFact
    );
    if (inconsistencyConflict) return inconsistencyConflict;

    const ambiguityConflict = this.checkAmbiguity(newFact, existingFact);
    if (ambiguityConflict) return ambiguityConflict;

    return null;
  }

  /**
   * Checks for direct contradictions
   */
  private checkContradiction(
    newFact: LearnedFact,
    existingFact: LearnedFact
  ): ConflictInfo | null {
    const newContent = newFact.content.toLowerCase();
    const existingContent = existingFact.content.toLowerCase();

    // Check for emotional contradictions
    if (newFact.category === "emotions") {
      const emotionConflicts = [
        {
          positive: ["happy", "excited", "joy"],
          negative: ["sad", "angry", "depressed"],
        },
        { positive: ["love", "like"], negative: ["hate", "dislike"] },
        {
          positive: ["calm", "relaxed"],
          negative: ["nervous", "anxious", "stressed"],
        },
      ];

      for (const { positive, negative } of emotionConflicts) {
        const newIsPositive = positive.some((word) =>
          newContent.includes(word)
        );
        const newIsNegative = negative.some((word) =>
          newContent.includes(word)
        );
        const existingIsPositive = positive.some((word) =>
          existingContent.includes(word)
        );
        const existingIsNegative = negative.some((word) =>
          existingContent.includes(word)
        );

        if (
          (newIsPositive && existingIsNegative) ||
          (newIsNegative && existingIsPositive)
        ) {
          return {
            conflictId: this.generateConflictId(),
            newFact,
            existingFact,
            conflictType: "contradiction",
            severity: "high",
            clarificationQuestion: `I noticed you mentioned feeling ${
              newIsPositive ? "positive" : "negative"
            } now, but earlier you seemed ${
              existingIsPositive ? "positive" : "negative"
            }. How are you actually feeling right now?`,
            suggestedResolution: "clarify",
          };
        }
      }
    }

    // Check for relationship status contradictions
    if (newFact.category === "relationship") {
      if (newContent.includes("single") && existingContent.includes("vahant")) {
        return {
          conflictId: this.generateConflictId(),
          newFact,
          existingFact,
          conflictType: "contradiction",
          severity: "high",
          clarificationQuestion:
            "Wait bestie, are you single or are you with Vahant? I'm getting mixed signals here!",
          suggestedResolution: "clarify",
        };
      }
    }

    // Check for preference contradictions
    if (newFact.category === "preferences") {
      const likeWords = ["like", "love", "enjoy", "prefer"];
      const dislikeWords = ["hate", "dislike", "don't like", "avoid"];

      const newLikes = likeWords.some((word) => newContent.includes(word));
      const newDislikes = dislikeWords.some((word) =>
        newContent.includes(word)
      );
      const existingLikes = likeWords.some((word) =>
        existingContent.includes(word)
      );
      const existingDislikes = dislikeWords.some((word) =>
        existingContent.includes(word)
      );

      if ((newLikes && existingDislikes) || (newDislikes && existingLikes)) {
        // Check if they're about the same thing
        const commonTerms = this.findCommonTerms(newContent, existingContent);
        if (commonTerms.length > 0) {
          return {
            conflictId: this.generateConflictId(),
            newFact,
            existingFact,
            conflictType: "contradiction",
            severity: "medium",
            clarificationQuestion: `I'm confused - do you like or dislike ${commonTerms[0]}? You've mentioned both!`,
            suggestedResolution: "clarify",
          };
        }
      }
    }

    return null;
  }

  /**
   * Checks for temporal conflicts (time-based)
   */
  private checkTemporalConflict(
    newFact: LearnedFact,
    existingFact: LearnedFact
  ): ConflictInfo | null {
    if (newFact.category === "plans") {
      const newContent = newFact.content.toLowerCase();
      const existingContent = existingFact.content.toLowerCase();

      // Check for conflicting date plans
      if (newContent.includes("date") && existingContent.includes("date")) {
        const newTime = this.extractTimeReference(newContent);
        const existingTime = this.extractTimeReference(existingContent);

        if (newTime && existingTime && newTime !== existingTime) {
          return {
            conflictId: this.generateConflictId(),
            newFact,
            existingFact,
            conflictType: "temporal",
            severity: "medium",
            clarificationQuestion: `I heard about a date ${newTime}, but earlier you mentioned ${existingTime}. Which date is happening?`,
            suggestedResolution: "clarify",
          };
        }
      }
    }

    return null;
  }

  /**
   * Checks for inconsistencies
   */
  private checkInconsistency(
    newFact: LearnedFact,
    existingFact: LearnedFact
  ): ConflictInfo | null {
    // Check for low confidence new facts conflicting with high confidence existing facts
    if (newFact.confidence < 0.6 && existingFact.confidence > 0.8) {
      const similarity = this.calculateContentSimilarity(
        newFact.content,
        existingFact.content
      );

      if (similarity > 0.3 && similarity < 0.8) {
        return {
          conflictId: this.generateConflictId(),
          newFact,
          existingFact,
          conflictType: "inconsistency",
          severity: "low",
          clarificationQuestion: `I want to make sure I understand correctly - you mentioned something similar before. Can you clarify?`,
          suggestedResolution: "merge",
        };
      }
    }

    return null;
  }

  /**
   * Checks for ambiguity that needs clarification
   */
  private checkAmbiguity(
    newFact: LearnedFact,
    existingFact: LearnedFact
  ): ConflictInfo | null {
    if (newFact.category === existingFact.category && !newFact.verified) {
      const similarity = this.calculateContentSimilarity(
        newFact.content,
        existingFact.content
      );

      if (similarity > 0.5 && similarity < 0.9) {
        return {
          conflictId: this.generateConflictId(),
          newFact,
          existingFact,
          conflictType: "ambiguity",
          severity: "low",
          clarificationQuestion: `Just to be clear, are you talking about the same thing as before, or is this something new?`,
          suggestedResolution: "clarify",
        };
      }
    }

    return null;
  }

  /**
   * Generates clarification response that includes the conflict
   */
  generateClarificationResponse(
    originalResponse: string,
    conflicts: ConflictInfo[]
  ): string {
    if (conflicts.length === 0) return originalResponse;

    const highPriorityConflicts = conflicts.filter(
      (c) => c.severity === "high" || c.conflictType === "contradiction"
    );

    if (highPriorityConflicts.length > 0) {
      const conflict = highPriorityConflicts[0];
      return `${originalResponse}\n\nWait bestie, ${conflict.clarificationQuestion}`;
    }

    const mediumPriorityConflicts = conflicts.filter(
      (c) => c.severity === "medium"
    );
    if (mediumPriorityConflicts.length > 0) {
      const conflict = mediumPriorityConflicts[0];
      return `${originalResponse}\n\nBy the way, ${conflict.clarificationQuestion}`;
    }

    return originalResponse;
  }

  /**
   * Helper methods
   */
  private generateConflictId(): string {
    return `conflict_${Date.now()}_${++this.conflictCounter}`;
  }

  private findCommonTerms(text1: string, text2: string): string[] {
    const words1 = text1.split(" ").filter((w) => w.length > 3);
    const words2 = text2.split(" ").filter((w) => w.length > 3);

    return words1.filter((word) => words2.includes(word));
  }

  private extractTimeReference(text: string): string | null {
    const timePatterns = [
      /\b(today|tomorrow|tonight|this evening)\b/i,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(\d{1,2})(st|nd|rd|th)\b/i,
      /\b(next week|this week|next month)\b/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) return match[0].toLowerCase();
    }

    return null;
  }

  private calculateContentSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(" "));
    const words2 = new Set(text2.toLowerCase().split(" "));

    const intersection = new Set(
      [...words1].filter((word) => words2.has(word))
    );
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

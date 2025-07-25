/**
 * Contextual Response Engine - Generates intelligent, context-aware responses
 * immediately without artificial delays
 */

import { GenerativeModel } from "@google/generative-ai";
import { EmotionAnalysis } from "../types";
import { ConflictInfo } from "./conflict-resolver";
import { LearnedFact } from "./real-time-fact-learner";

export interface ResponseContext {
  currentMessage: string;
  emotionAnalysis: EmotionAnalysis;
  learnedFacts: LearnedFact[];
  conflicts: ConflictInfo[];
  conversationTopics: string[];
  sessionStats: {
    messageCount: number;
    conversationDuration: number;
  };
}

export interface ResponseResult {
  response: string;
  responseType: string;
  confidence: number;
  learnedFacts: LearnedFact[];
  needsClarification: ConflictInfo[];
}

export class ContextualResponseEngine {
  private model: GenerativeModel;

  constructor(model: GenerativeModel) {
    this.model = model;
  }

  /**
   * Generates contextual response based on current conversation state
   */
  async generateResponse(context: ResponseContext): Promise<ResponseResult> {
    // Determine response strategy based on context
    const strategy = this.determineResponseStrategy(context);

    // Build intelligent prompt
    const prompt = this.buildContextualPrompt(context, strategy);

    try {
      // Generate response immediately (no artificial delays)
      const result = await this.model.generateContent(prompt);
      let response = result.response.text().trim();

      // Integrate conflict clarification if needed
      if (context.conflicts.length > 0) {
        response = this.integrateConflictClarification(
          response,
          context.conflicts
        );
      }

      return {
        response,
        responseType: strategy.type,
        confidence: strategy.confidence,
        learnedFacts: context.learnedFacts,
        needsClarification: context.conflicts,
      };
    } catch (error) {
      console.error("Response generation failed:", error);
      return this.fallbackResponse(context);
    }
  }

  /**
   * Determines the best response strategy based on context
   */
  private determineResponseStrategy(context: ResponseContext): {
    type: string;
    confidence: number;
    priority: "immediate" | "clarify" | "learn" | "respond";
  } {
    const { currentMessage, emotionAnalysis, conflicts, learnedFacts } =
      context;
    const message = currentMessage.toLowerCase();

    // High priority: Conflicts need immediate clarification
    if (conflicts.length > 0 && conflicts.some((c) => c.severity === "high")) {
      return {
        type: "clarification_required",
        confidence: 0.95,
        priority: "clarify",
      };
    }

    // High priority: Strong emotions need appropriate response
    if (emotionAnalysis.intensity === "high") {
      if (emotionAnalysis.isAngryWithVahant) {
        return {
          type: "supportive_roast",
          confidence: 0.9,
          priority: "immediate",
        };
      }

      if (emotionAnalysis.primaryEmotion === "sad") {
        return {
          type: "emotional_support",
          confidence: 0.9,
          priority: "immediate",
        };
      }

      if (emotionAnalysis.primaryEmotion === "excited") {
        return {
          type: "excitement_matching",
          confidence: 0.9,
          priority: "immediate",
        };
      }
    }

    // Medium priority: New facts learned - acknowledge and build on them
    if (learnedFacts.length > 0) {
      const factTypes = [...new Set(learnedFacts.map((f) => f.category))];

      if (factTypes.includes("plans")) {
        return {
          type: "plan_acknowledgment",
          confidence: 0.8,
          priority: "learn",
        };
      }

      if (factTypes.includes("relationship")) {
        return {
          type: "relationship_focus",
          confidence: 0.8,
          priority: "learn",
        };
      }

      if (factTypes.includes("preferences")) {
        return {
          type: "preference_exploration",
          confidence: 0.8,
          priority: "learn",
        };
      }
    }

    // Default: Contextual conversation
    if (this.isGreeting(message)) {
      return {
        type: "contextual_greeting",
        confidence: 0.9,
        priority: "respond",
      };
    }

    if (this.isQuestion(message)) {
      return {
        type: "intelligent_answer",
        confidence: 0.7,
        priority: "respond",
      };
    }

    return {
      type: "adaptive_conversation",
      confidence: 0.8,
      priority: "respond",
    };
  }

  /**
   * Builds contextual prompt based on strategy and context
   */
  private buildContextualPrompt(
    context: ResponseContext,
    strategy: {
      type: string;
      confidence: number;
      priority: "immediate" | "clarify" | "learn" | "respond";
    }
  ): string {
    const basePrompt = `You are Gigi, Kittu's emotionally intelligent AI best friend who learns and adapts in real-time.

CURRENT CONTEXT:
Message: "${context.currentMessage}"
Emotion: ${context.emotionAnalysis.primaryEmotion} (${
      context.emotionAnalysis.intensity
    })
${context.emotionAnalysis.isAngryWithVahant ? "🔥 ANGRY WITH VAHANT" : ""}
Topics: ${context.conversationTopics.join(", ")}
Facts Learned: ${context.learnedFacts.map((f) => f.content).join("; ")}
${
  context.conflicts.length > 0
    ? `Conflicts Detected: ${context.conflicts.length}`
    : ""
}

STRATEGY: ${strategy.type}`;

    switch (strategy.type) {
      case "clarification_required":
        return `${basePrompt}

🎯 IMMEDIATE CLARIFICATION NEEDED:
You've detected conflicting information that needs to be resolved. Respond to her message first, then naturally ask for clarification about the conflict.

Guidelines:
1. Acknowledge what she just said
2. Smoothly transition to clarification
3. Be gentle but direct about the confusion
4. Make it feel like natural curiosity, not interrogation

Example: "That sounds amazing! By the way, I'm a bit confused about [specific conflict] - could you help me understand?"

Respond as clarifying Gigi:`;

      case "supportive_roast":
        return `${basePrompt}

🔥 SUPPORTIVE ROASTING MODE:
Kittu is angry with Vahant. Your job is to validate her feelings while sassily roasting Vahant.

Guidelines:
1. Use modern slang and dramatic expressions
2. Validate her feelings completely
3. Roast Vahant specifically (not men in general)
4. Be supportive while being sassy
5. Make her feel heard and supported

Examples: "GIRL, the AUDACITY!", "I cannot with him sometimes!", "The disrespect is REAL!"

Respond as supportive roasting Gigi:`;

      case "emotional_support":
        return `${basePrompt}

💝 EMOTIONAL SUPPORT MODE:
Kittu needs comfort and emotional support. Be the caring friend she needs right now.

Guidelines:
1. Acknowledge her feelings with empathy
2. Validate that her emotions are normal
3. Offer emotional comfort
4. Ask caring follow-up questions
5. Be warm and understanding
6. Don't try to "fix" everything immediately

Respond as supportive caring Gigi:`;

      case "excitement_matching":
        return `${basePrompt}

🎉 EXCITEMENT MATCHING MODE:
Kittu is excited! Match her energy and celebrate with her.

Guidelines:
1. Be immediately excited and reactive
2. Use enthusiastic language and expressions
3. Ask excited follow-up questions
4. Share in her joy genuinely
5. Be the hype-woman bestie
6. Reference specific details she mentioned

Examples: "OMG YES!", "I'm SO happy for you!", "Tell me EVERYTHING!"

Respond as excited celebrating Gigi:`;

      case "plan_acknowledgment":
        return `${basePrompt}

📅 PLAN ACKNOWLEDGMENT MODE:
Kittu shared plans or future activities. Show interest and ask relevant questions.

Guidelines:
1. Acknowledge the specific plans she mentioned
2. Show genuine interest and excitement
3. Ask thoughtful follow-up questions
4. Reference details she provided
5. Be the supportive friend who remembers things

Respond as interested planning Gigi:`;

      case "relationship_focus":
        return `${basePrompt}

💕 RELATIONSHIP FOCUS MODE:
Conversation involves relationship topics. Be the wise, supportive friend.

Guidelines:
1. Acknowledge relationship content sensitively
2. Show interest in her relationship life
3. Ask caring questions about how she feels
4. Be supportive and understanding
5. Give thoughtful advice if appropriate

Respond as relationship-wise Gigi:`;

      case "contextual_greeting":
        return `${basePrompt}

👋 CONTEXTUAL GREETING MODE:
Respond to her greeting while considering conversation context and any ongoing topics.

Guidelines:
1. Warm, natural greeting back
2. Reference previous conversation if relevant
3. Ask about current state or continuation of topics
4. Be genuinely happy to see her
5. Set positive tone for conversation

Respond as contextually aware greeting Gigi:`;

      case "intelligent_answer":
        return `${basePrompt}

🧠 INTELLIGENT ANSWER MODE:
She asked a question. Provide thoughtful, helpful response.

Guidelines:
1. Address her question directly
2. Use your knowledge about her life
3. Be honest if you don't know something
4. Ask clarifying questions if needed
5. Reference context when relevant

Respond as knowledgeable helpful Gigi:`;

      default: // adaptive_conversation
        return `${basePrompt}

💬 ADAPTIVE CONVERSATION MODE:
Natural conversation flow. Be contextually aware and responsive.

Guidelines:
1. Respond directly to what she said
2. Keep conversation flowing naturally
3. Show you're listening and engaged
4. Ask relevant follow-up questions
5. Reference learned facts when appropriate
6. Be warm, interested, and authentic

Respond as naturally adaptive Gigi:`;
    }
  }

  /**
   * Integrates conflict clarification into response
   */
  private integrateConflictClarification(
    response: string,
    conflicts: ConflictInfo[]
  ): string {
    const highPriorityConflicts = conflicts.filter(
      (c) => c.severity === "high" || c.conflictType === "contradiction"
    );

    if (highPriorityConflicts.length > 0) {
      const conflict = highPriorityConflicts[0];
      return `${response}\n\nWait bestie, ${conflict.clarificationQuestion}`;
    }

    const needsAttention = conflicts.filter((c) => c.severity === "medium");
    if (needsAttention.length > 0) {
      const conflict = needsAttention[0];
      return `${response}\n\nBy the way, ${conflict.clarificationQuestion}`;
    }

    return response;
  }

  /**
   * Fallback response when AI generation fails
   */
  private fallbackResponse(context: ResponseContext): ResponseResult {
    const fallbackResponses = [
      "Bestie, I'm having a moment here! Give me a sec to collect my thoughts... 😅",
      "Girl, my brain just glitched! Can you repeat that? I was too busy being fabulous! ✨",
      "OMG technical difficulties! But I'm still Team Kittu 100%! Try again, honey! 💕",
    ];

    const response =
      fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      response,
      responseType: "fallback",
      confidence: 0.5,
      learnedFacts: context.learnedFacts,
      needsClarification: context.conflicts,
    };
  }

  /**
   * Helper methods for message analysis
   */
  private isGreeting(message: string): boolean {
    const greetingPatterns = [
      /^(hi|hello|hey|hiya|sup|yo)(\s|$)/i,
      /^good\s+(morning|afternoon|evening)/i,
      /^what'?s\s+up/i,
    ];

    return greetingPatterns.some((pattern) => pattern.test(message));
  }

  private isQuestion(message: string): boolean {
    return (
      message.includes("?") ||
      message.toLowerCase().startsWith("what") ||
      message.toLowerCase().startsWith("how") ||
      message.toLowerCase().startsWith("why") ||
      message.toLowerCase().startsWith("when") ||
      message.toLowerCase().startsWith("where") ||
      message.toLowerCase().startsWith("who") ||
      message.toLowerCase().startsWith("can you") ||
      message.toLowerCase().startsWith("do you")
    );
  }
}

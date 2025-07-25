/**
 * Conversation Session Manager - Handles individual conversation sessions
 * Prevents cross-contamination between different chat sessions
 */

import { randomUUID } from "crypto";
import { ChatMessage } from "../types";

export interface ConversationSession {
  sessionId: string;
  messages: ChatMessage[];
  lastActivity: Date;
  context: {
    currentTopics: string[];
    emotionalState: string;
    ongoingConcerns: string[];
  };
}

export class ConversationSessionManager {
  private sessions: Map<string, ConversationSession> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Creates or retrieves a conversation session
   */
  getOrCreateSession(
    sessionId?: string,
    initialMessage?: ChatMessage
  ): ConversationSession {
    if (!sessionId) {
      sessionId = randomUUID();
    }

    let session = this.sessions.get(sessionId);

    if (!session) {
      // Normalize initial message timestamp if provided
      const normalizedInitialMessage = initialMessage
        ? {
            ...initialMessage,
            timestamp:
              initialMessage.timestamp instanceof Date
                ? initialMessage.timestamp
                : new Date(initialMessage.timestamp),
          }
        : undefined;

      session = {
        sessionId,
        messages: normalizedInitialMessage ? [normalizedInitialMessage] : [],
        lastActivity: new Date(),
        context: {
          currentTopics: [],
          emotionalState: "neutral",
          ongoingConcerns: [],
        },
      };
      this.sessions.set(sessionId, session);
    } else {
      session.lastActivity = new Date();
    }

    return session;
  }

  /**
   * Updates session with new message and context
   */
  updateSession(
    sessionId: string,
    message: ChatMessage,
    emotionalState?: string
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Check if message already exists to avoid duplicates
    const messageExists = session.messages.some(
      (existingMsg) =>
        existingMsg.id === message.id ||
        (existingMsg.text === message.text &&
          existingMsg.sender === message.sender &&
          Math.abs(
            new Date(existingMsg.timestamp).getTime() -
              new Date(message.timestamp).getTime()
          ) < 1000)
    );

    if (messageExists) {
      console.log(
        `⚠️ Message already exists in session, skipping duplicate: ${message.text.substring(
          0,
          30
        )}...`
      );
      return;
    }

    // Ensure timestamp is a Date object
    const normalizedMessage: ChatMessage = {
      ...message,
      timestamp:
        message.timestamp instanceof Date
          ? message.timestamp
          : new Date(message.timestamp),
    };

    session.messages.push(normalizedMessage);
    session.lastActivity = new Date();

    console.log(
      `✅ Added message to session: ${normalizedMessage.text.substring(
        0,
        30
      )}... (Total: ${session.messages.length})`
    );

    if (emotionalState) {
      session.context.emotionalState = emotionalState;
    }

    // Extract topics from user messages
    if (message.sender === "user") {
      const topics = this.extractTopicsFromMessage(message.text);
      session.context.currentTopics = [
        ...new Set([...session.context.currentTopics, ...topics]),
      ];

      // Keep only recent topics (last 5)
      if (session.context.currentTopics.length > 5) {
        session.context.currentTopics = session.context.currentTopics.slice(-5);
      }
    }
  }
  /**
   * Gets current user messages from session
   */
  getUserMessages(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    if (!session) return [];

    return session.messages.filter((msg) => msg.sender === "user");
  }

  /**
   * Gets latest user message from session
   */
  getLatestUserMessage(sessionId: string): ChatMessage | null {
    const userMessages = this.getUserMessages(sessionId);
    return userMessages.length > 0
      ? userMessages[userMessages.length - 1]
      : null;
  }

  /**
   * Checks if a message is newer than the latest in session
   */
  isMessageNewer(sessionId: string, message: ChatMessage): boolean {
    const latestInSession = this.getLatestUserMessage(sessionId);
    if (!latestInSession) return true;

    const messageTime = new Date(message.timestamp).getTime();
    const latestTime = new Date(latestInSession.timestamp).getTime();

    return (
      messageTime > latestTime ||
      (messageTime === latestTime && message.id !== latestInSession.id)
    );
  }

  /**
   * Gets session context for response generation
   */
  getSessionContext(sessionId: string): ConversationSession["context"] {
    const session = this.sessions.get(sessionId);
    return (
      session?.context || {
        currentTopics: [],
        emotionalState: "neutral",
        ongoingConcerns: [],
      }
    );
  }

  /**
   * Cleanup expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (
        now.getTime() - session.lastActivity.getTime() >
        this.SESSION_TIMEOUT
      ) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Extract topics from message text
   */
  private extractTopicsFromMessage(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    // Topic patterns
    const topicPatterns = [
      { pattern: /\b(date|dating|going out)\b/, topic: "dating" },
      { pattern: /\b(dress|outfit|wearing|clothes)\b/, topic: "fashion" },
      { pattern: /\b(restaurant|food|eating|meal)\b/, topic: "food" },
      { pattern: /\b(vahant|boyfriend)\b/, topic: "relationship" },
      { pattern: /\b(website|dreamscape|project)\b/, topic: "projects" },
      { pattern: /\b(sad|happy|excited|nervous|angry)\b/, topic: "emotions" },
      { pattern: /\b(work|job|office)\b/, topic: "work" },
      { pattern: /\b(family|friends|social)\b/, topic: "social" },
    ];

    topicPatterns.forEach(({ pattern, topic }) => {
      if (pattern.test(lowerText)) {
        topics.push(topic);
      }
    });

    return topics;
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    messageCount: number;
    userMessageCount: number;
    conversationDuration: number;
    topicsDiscussed: string[];
  } {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return {
        messageCount: 0,
        userMessageCount: 0,
        conversationDuration: 0,
        topicsDiscussed: [],
      };
    }

    const userMessages = session.messages.filter(
      (msg) => msg.sender === "user"
    );

    // Handle both Date objects and string timestamps
    const firstMessageTimestamp = session.messages[0]?.timestamp;
    const conversationStart = firstMessageTimestamp
      ? firstMessageTimestamp instanceof Date
        ? firstMessageTimestamp
        : new Date(firstMessageTimestamp)
      : session.lastActivity;

    const duration =
      session.lastActivity.getTime() - conversationStart.getTime();

    return {
      messageCount: session.messages.length,
      userMessageCount: userMessages.length,
      conversationDuration: Math.max(0, duration), // Ensure non-negative duration
      topicsDiscussed: session.context.currentTopics,
    };
  }
}

/**
 * Gigi AI - Dynamic Emotionally Intelligent Implementation
 * Real-time learning, conflict resolution, and contextual response system
 */

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";

// Import enhanced modules
import { ConflictResolver } from "./modules/conflict-resolver";
import {
  ContextualResponseEngine,
  ResponseContext,
} from "./modules/contextual-response-engine";
import { ConversationSessionManager } from "./modules/conversation-session-manager";
import { EmotionDetector } from "./modules/emotion-detector";
import { IntelligentMemoryBank } from "./modules/intelligent-memory-bank";
import { RealTimeFactLearner } from "./modules/real-time-fact-learner";

// Import Spotify routes
import spotifyRoutes from "./routes/spotify";

// Types
import { ChatRequest, ChatResponse } from "./types";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

// Production-ready CORS configuration
const allowedOrigins = [
  // Development
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://localhost:3000",
  // Production - Update these with your actual domains
  process.env.FRONTEND_URL,
  "https://dreamscape-kitkut-whispers.vercel.app",
].filter(Boolean); // Remove undefined values

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`🚫 CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  })
);
app.use(bodyParser.json());

// Health check endpoint for Render
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Spotify routes
app.use("/api/spotify", spotifyRoutes);

// Initialize AI and intelligent modules
let model: GenerativeModel;
let emotionDetector: EmotionDetector;
let sessionManager: ConversationSessionManager;
let factLearner: RealTimeFactLearner;
let conflictResolver: ConflictResolver;
let responseEngine: ContextualResponseEngine;
let memoryBank: IntelligentMemoryBank;

// Initialize services
const initializeServices = async (): Promise<void> => {
  try {
    // Try multiple environment variable names for Google Gemini API key
    const apiKey =
      process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing required environment variables:");
      console.error("   - GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY is required");
      console.error("   - Please check your environment configuration");
      throw new Error(
        "GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY not found in environment variables"
      );
    }

    console.log("🔧 Initializing AI model with Gemini API...");
    // Initialize AI model
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    console.log("🧠 Initializing intelligent modules...");
    // Initialize intelligent modules
    emotionDetector = new EmotionDetector(model);
    sessionManager = new ConversationSessionManager();
    factLearner = new RealTimeFactLearner(model);
    conflictResolver = new ConflictResolver();
    responseEngine = new ContextualResponseEngine(model);
    memoryBank = new IntelligentMemoryBank();

    // Load existing knowledge
    await loadExistingKnowledge();

    // Start cleanup intervals
    setInterval(() => sessionManager.cleanupExpiredSessions(), 15 * 60 * 1000); // Every 15 minutes
    setInterval(() => memoryBank.cleanup(), 60 * 60 * 1000); // Every hour

    console.log("✅ Gigi AI intelligent services initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    console.error("   Current environment variables:");
    console.error("   - NODE_ENV:", process.env.NODE_ENV);
    console.error("   - PORT:", process.env.PORT);
    console.error("   - FRONTEND_URL:", process.env.FRONTEND_URL);
    console.error(
      "   - GOOGLE_GEMINI_API_KEY:",
      process.env.GOOGLE_GEMINI_API_KEY ? "SET" : "NOT SET"
    );
    console.error(
      "   - GEMINI_API_KEY:",
      process.env.GEMINI_API_KEY ? "SET" : "NOT SET"
    );
    console.error(
      "   - SPOTIFY_CLIENT_ID:",
      process.env.SPOTIFY_CLIENT_ID ? "SET" : "NOT SET"
    );
    console.error(
      "   - SPOTIFY_CLIENT_SECRET:",
      process.env.SPOTIFY_CLIENT_SECRET ? "SET" : "NOT SET"
    );

    // In production, exit with error; in development, show more helpful message
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.error(
        "   💡 For development, make sure your .env file in tea-lounge-backend contains:"
      );
      console.error("      GOOGLE_GEMINI_API_KEY=your_api_key_here");
      process.exit(1);
    }
  }
};

// Load existing knowledge into memory bank
const loadExistingKnowledge = async (): Promise<void> => {
  try {
    const knowledgeBasePath = path.join(__dirname, "..", "knowledgeBase.json");

    if (fs.existsSync(knowledgeBasePath)) {
      const rawData = fs.readFileSync(knowledgeBasePath, "utf8");
      const baseKnowledge = JSON.parse(rawData);

      // Import existing knowledge into memory bank
      if (baseKnowledge.learnedFacts) {
        memoryBank.importKnowledge(baseKnowledge.learnedFacts);
      }

      const stats = memoryBank.getMemoryStats();
      console.log(`📚 Loaded ${stats.totalFacts} facts from knowledge base`);

      // Log category distribution
      console.log("📊 Facts by category:", stats.factsByCategory);
    } else {
      console.log("📝 No existing knowledge base found, starting fresh");
    }
  } catch (error) {
    console.error("❌ Failed to load knowledge base:", error);
  }
};

// Save knowledge periodically
const saveKnowledge = async (): Promise<void> => {
  try {
    const knowledgeBasePath = path.join(__dirname, "..", "knowledgeBase.json");
    const exportedKnowledge = memoryBank.exportKnowledge();

    const knowledgeToSave = {
      learnedFacts: exportedKnowledge,
      memoryStats: memoryBank.getMemoryStats(),
      lastSaved: new Date().toISOString(),
    };

    await fs.promises.writeFile(
      knowledgeBasePath,
      JSON.stringify(knowledgeToSave, null, 2)
    );

    console.log("💾 Knowledge base saved successfully");
  } catch (error) {
    console.error("❌ Failed to save knowledge base:", error);
  }
};

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  const memoryStats = memoryBank.getMemoryStats();

  res.json({
    status: "healthy",
    message: "Dynamic Gigi is ready! ✨",
    timestamp: new Date().toISOString(),
    intelligence: {
      totalFacts: memoryStats.totalFacts,
      categories: Object.keys(memoryStats.factsByCategory),
      averageConfidence: memoryStats.averageConfidence.toFixed(2),
      recentlyLearned: memoryStats.recentlyLearned,
    },
  });
});

// Main dynamic chat endpoint
app.post(
  "/api/gigi-chat",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationHistory, sessionId }: ChatRequest = req.body;

      if (
        !Array.isArray(conversationHistory) ||
        conversationHistory.length === 0
      ) {
        res.json({
          gigiResponse: "Hey hun! What's going on in your world today? ✨",
          sessionId: sessionId || sessionManager.getOrCreateSession().sessionId,
          newRoastCounter: 0,
        });
        return;
      }

      // Get or create conversation session
      const session = sessionManager.getOrCreateSession(sessionId);

      // Get latest user message from the incoming conversation history (NOT from session)
      const userMessages = conversationHistory.filter(
        (msg) => msg.sender === "user"
      );
      if (userMessages.length === 0) {
        res.json({
          gigiResponse:
            "Hey bestie! I'm here to chat - what's on your mind? ✨",
          sessionId: session.sessionId,
          newRoastCounter: 0,
        });
        return;
      }

      const latestMessage = userMessages[userMessages.length - 1];
      console.log(
        `💬 Kittu (Session: ${session.sessionId.substring(0, 8)}): ${
          latestMessage.text
        }`
      );
      console.log(
        `📊 Processing message #${userMessages.length} in conversation`
      );
      console.log(
        `🔍 Message ID: ${latestMessage.id}, Timestamp: ${latestMessage.timestamp}`
      );

      // Verify this is a new message to avoid reprocessing
      if (!sessionManager.isMessageNewer(session.sessionId, latestMessage)) {
        console.log(`⚠️ Message appears to be already processed, checking...`);
        const latestInSession = sessionManager.getLatestUserMessage(
          session.sessionId
        );
        if (latestInSession && latestInSession.text === latestMessage.text) {
          console.log(`🔄 Duplicate message detected, sending cached response`);
          res.json({
            gigiResponse:
              "I just responded to that! What else is on your mind? ✨",
            sessionId: session.sessionId,
            newRoastCounter: 0,
          });
          return;
        }
      }

      // STEP 1: Detect emotion immediately using ONLY the incoming conversation history
      const emotionAnalysis = await emotionDetector.detectEmotion(userMessages);
      console.log(
        `😊 Emotion: ${emotionAnalysis.primaryEmotion} (${emotionAnalysis.intensity})`
      );

      if (emotionAnalysis.isAngryWithVahant) {
        console.log(
          "😠 Kittu is specifically angry with Vahant - roasting mode enabled"
        );
      }

      // STEP 2: Extract facts from the CURRENT message only
      const factExtractionResult = await factLearner.extractFacts(
        latestMessage.text,
        [] // Don't use session context yet, focus on current message
      );

      if (factExtractionResult.facts.length > 0) {
        console.log(
          `🧠 Learned ${factExtractionResult.facts.length} new facts from current message:`,
          factExtractionResult.facts.map((f) => f.content)
        );
      }

      // STEP 3: Detect conflicts with existing knowledge
      const existingKnowledge = memoryBank.exportKnowledge();
      const conflictResolution = conflictResolver.detectConflicts(
        factExtractionResult.facts,
        existingKnowledge
      );

      if (conflictResolution.hasConflicts) {
        console.log(
          `⚠️ Detected ${conflictResolution.conflicts.length} conflicts`
        );
      }

      // STEP 4: Store new facts in memory (auto-resolve minor conflicts)
      for (const fact of factExtractionResult.facts) {
        memoryBank.storeFact(fact);
      }

      // STEP 5: NOW update session with the current message after processing
      sessionManager.updateSession(session.sessionId, latestMessage);

      // Get session context AFTER updating with current message
      const sessionContext = sessionManager.getSessionContext(
        session.sessionId
      );

      // STEP 6: Get contextual facts for response
      const contextualFacts = memoryBank.getContextualFacts(
        latestMessage.text,
        [emotionAnalysis.primaryEmotion === "sad" ? "emotions" : "all"],
        5
      );

      // STEP 7: Build response context
      let sessionStats;
      try {
        const fullStats = sessionManager.getSessionStats(session.sessionId);
        sessionStats = {
          messageCount: fullStats.messageCount,
          conversationDuration: fullStats.conversationDuration,
        };
      } catch (error) {
        console.warn("⚠️ Error getting session stats, using defaults:", error);
        sessionStats = {
          messageCount: userMessages.length,
          conversationDuration: 0,
        };
      }

      const responseContext: ResponseContext = {
        currentMessage: latestMessage.text,
        emotionAnalysis,
        learnedFacts: factExtractionResult.facts,
        conflicts: conflictResolution.needsImmediateAttention,
        conversationTopics: sessionContext.currentTopics,
        sessionStats,
      };

      // STEP 8: Generate intelligent response (no artificial delays)
      const responseResult = await responseEngine.generateResponse(
        responseContext
      );

      console.log(
        `✅ Response (${
          responseResult.responseType
        }): "${responseResult.response.substring(0, 50)}..."`
      );

      // STEP 9: Update session with Gigi's response
      sessionManager.updateSession(
        session.sessionId,
        {
          id: `gigi_${Date.now()}`,
          text: responseResult.response,
          sender: "gigi",
          timestamp: new Date(),
        },
        emotionAnalysis.primaryEmotion
      );

      // STEP 10: Save knowledge periodically (10% chance)
      if (Math.random() < 0.1) {
        await saveKnowledge();
      }

      // STEP 11: Build response
      const response: ChatResponse = {
        gigiResponse: responseResult.response,
        sessionId: session.sessionId,
        newRoastCounter: 0, // Legacy support
        emotionalState: {
          currentEmotion: emotionAnalysis.primaryEmotion,
          intensity: emotionAnalysis.intensity,
          isAngryWithVahant: emotionAnalysis.isAngryWithVahant,
          moodHistory: [],
          lastEmotionalCheck: new Date(),
        },
        detectedEmotion: emotionAnalysis,
        learnedFacts: factExtractionResult.facts.map((f) => f.content),
        needsClarification: conflictResolution.needsImmediateAttention.map(
          (conflict) => ({
            conflictId: conflict.conflictId,
            question: conflict.clarificationQuestion,
            severity: conflict.severity,
          })
        ),
      };

      res.json(response);
    } catch (error) {
      console.error("❌ Error in dynamic chat endpoint:", error);

      const fallbackResponses = [
        "Bestie, I'm having a moment here! Give me a sec to collect my thoughts... 😅",
        "Girl, my brain just glitched! Can you repeat that? I was too busy being fabulous! ✨",
        "OMG technical difficulties! But I'm still Team Kittu 100%! Try again, honey! 💕",
      ];

      const randomResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      res.status(500).json({
        gigiResponse: randomResponse,
        sessionId: req.body.sessionId || "error_session",
        newRoastCounter: 0,
        error: "Internal server error",
      });
    }
  }
);

// Knowledge exploration endpoint
app.get("/api/knowledge", (req: Request, res: Response) => {
  const memoryStats = memoryBank.getMemoryStats();
  const recentFacts = memoryBank.getRecentFacts(24);

  res.json({
    memoryStats,
    recentFacts: recentFacts.slice(0, 10), // Last 10 facts
    categories: Object.keys(memoryStats.factsByCategory),
    intelligence: {
      totalKnowledge: memoryStats.totalFacts,
      verificationRate:
        ((memoryStats.verifiedFacts / memoryStats.totalFacts) * 100).toFixed(
          1
        ) + "%",
      averageConfidence: (memoryStats.averageConfidence * 100).toFixed(1) + "%",
    },
  });
});

// Conflict resolution endpoint
app.post("/api/resolve-conflict", async (req: Request, res: Response) => {
  try {
    const { conflictId, resolution } = req.body;

    if (!conflictId || !resolution) {
      res.status(400).json({ error: "Missing conflictId or resolution" });
      return;
    }

    // This would need to be implemented with proper conflict tracking
    // For now, just acknowledge the resolution
    console.log(
      `✅ Conflict ${conflictId} resolved with choice: ${resolution}`
    );

    res.json({
      success: true,
      message: `Conflict resolved with choice: ${resolution}`,
      conflictId,
    });
  } catch (error) {
    console.error("❌ Error resolving conflict:", error);
    res.status(500).json({ error: "Failed to resolve conflict" });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🌸 Gigi is saving her memories and saying goodbye...");
  await saveKnowledge();
  console.log("💾 Knowledge saved successfully");
  process.exit(0);
});

// Start server
const startServer = async (): Promise<void> => {
  await initializeServices();

  app.listen(PORT, () => {
    const memoryStats = memoryBank.getMemoryStats();

    console.log("🌟 =====================================");
    console.log("🌸    Dynamic Gigi Tea Lounge        🌸");
    console.log("🧠   Real-time Learning AI            🧠");
    console.log("🌟 =====================================");
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat: http://localhost:${PORT}/api/gigi-chat`);
    console.log(`🧠 Knowledge: http://localhost:${PORT}/api/knowledge`);
    console.log(`⚖️ Conflicts: http://localhost:${PORT}/api/resolve-conflict`);
    console.log(`🎵 Spotify: http://localhost:${PORT}/api/spotify`);
    console.log("");
    console.log("🎯 Dynamic Features:");
    console.log("   • Real-time fact learning and conflict detection");
    console.log("   • Session-based conversation tracking");
    console.log("   • Intelligent contextual responses");
    console.log("   • Immediate responses (no artificial delays)");
    console.log("   • Automatic knowledge verification");
    console.log("");
    console.log(
      `📚 Current Intelligence: ${memoryStats.totalFacts} facts across ${
        Object.keys(memoryStats.factsByCategory).length
      } categories`
    );
    console.log(
      `🎯 Confidence: ${(memoryStats.averageConfidence * 100).toFixed(
        1
      )}% | Verified: ${memoryStats.verifiedFacts}/${memoryStats.totalFacts}`
    );
    console.log("");
    console.log("✨ Ready to be Kittu's dynamic intelligent bestie! ✨");
    console.log("🌟 =====================================");
  });
};

startServer().catch(console.error);

export default app;

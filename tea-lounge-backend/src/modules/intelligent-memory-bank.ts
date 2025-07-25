/**
 * Intelligent Memory Bank - Stores and retrieves facts with metadata,
 * confidence scoring, and intelligent conflict resolution
 */

import { ConflictInfo } from "./conflict-resolver";
import { LearnedFact } from "./real-time-fact-learner";

export interface MemoryEntry {
  fact: LearnedFact;
  lastAccessed: Date;
  accessCount: number;
  verified: boolean;
  confidence: number;
  relatedFacts: string[]; // IDs of related facts
}

export interface MemoryStats {
  totalFacts: number;
  factsByCategory: { [category: string]: number };
  averageConfidence: number;
  verifiedFacts: number;
  recentlyLearned: number; // Facts learned in last 24 hours
}

export class IntelligentMemoryBank {
  private memory: Map<string, MemoryEntry> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private timelineIndex: Map<string, Set<string>> = new Map(); // date -> fact IDs

  /**
   * Stores a new fact in memory with intelligent indexing
   */
  storeFact(fact: LearnedFact, relatedFactIds: string[] = []): void {
    const entry: MemoryEntry = {
      fact,
      lastAccessed: new Date(),
      accessCount: 0,
      verified: fact.verified,
      confidence: fact.confidence,
      relatedFacts: relatedFactIds
    };

    this.memory.set(fact.id, entry);
    this.updateIndexes(fact);
    
    console.log(`💾 Stored fact: ${fact.content} (confidence: ${fact.confidence})`);
  }

  /**
   * Retrieves facts by category with confidence filtering
   */
  getFactsByCategory(category: string, minConfidence: number = 0.5): LearnedFact[] {
    const factIds = this.categoryIndex.get(category) || new Set();
    const facts: LearnedFact[] = [];

    for (const factId of factIds) {
      const entry = this.memory.get(factId);
      if (entry && entry.confidence >= minConfidence) {
        entry.lastAccessed = new Date();
        entry.accessCount++;
        facts.push(entry.fact);
      }
    }

    return facts.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Retrieves recent facts within a time window
   */
  getRecentFacts(hoursBack: number = 24): LearnedFact[] {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const recentFacts: LearnedFact[] = [];

    for (const entry of this.memory.values()) {
      if (entry.fact.timestamp >= cutoffTime) {
        entry.lastAccessed = new Date();
        entry.accessCount++;
        recentFacts.push(entry.fact);
      }
    }

    return recentFacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Searches for facts containing specific keywords
   */
  searchFacts(keywords: string[], minConfidence: number = 0.5): LearnedFact[] {
    const results: LearnedFact[] = [];
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));

    for (const entry of this.memory.values()) {
      if (entry.confidence < minConfidence) continue;
      
      const factContent = entry.fact.content.toLowerCase();
      const hasKeyword = keywords.some(keyword => 
        factContent.includes(keyword.toLowerCase())
      );
      
      if (hasKeyword) {
        entry.lastAccessed = new Date();
        entry.accessCount++;
        results.push(entry.fact);
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Gets contextually relevant facts for conversation
   */
  getContextualFacts(
    currentMessage: string,
    categories: string[] = [],
    limit: number = 5
  ): LearnedFact[] {
    const messageWords = currentMessage.toLowerCase().split(' ');
    const relevantFacts: { fact: LearnedFact; relevance: number }[] = [];

    for (const entry of this.memory.values()) {
      let relevanceScore = 0;

      // Category relevance
      if (categories.length === 0 || categories.includes(entry.fact.category)) {
        relevanceScore += 0.3;
      }

      // Keyword relevance
      const factWords = entry.fact.content.toLowerCase().split(' ');
      const commonWords = messageWords.filter(word => 
        factWords.includes(word) && word.length > 3
      );
      relevanceScore += commonWords.length * 0.2;

      // Confidence boost
      relevanceScore += entry.fact.confidence * 0.3;

      // Recency boost
      const hoursOld = (Date.now() - entry.fact.timestamp.getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) relevanceScore += 0.2;

      // Access frequency boost
      relevanceScore += Math.min(entry.accessCount * 0.1, 0.3);

      if (relevanceScore > 0.5) {
        relevantFacts.push({ fact: entry.fact, relevance: relevanceScore });
      }
    }

    return relevantFacts
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(item => {
        const entry = this.memory.get(item.fact.id);
        if (entry) {
          entry.lastAccessed = new Date();
          entry.accessCount++;
        }
        return item.fact;
      });
  }

  /**
   * Updates fact confidence based on verification
   */
  updateFactConfidence(factId: string, newConfidence: number, verified: boolean = false): void {
    const entry = this.memory.get(factId);
    if (entry) {
      entry.confidence = Math.max(0, Math.min(1, newConfidence));
      entry.verified = verified;
      entry.lastAccessed = new Date();
      
      console.log(`🔄 Updated fact confidence: ${entry.fact.content} -> ${newConfidence}`);
    }
  }

  /**
   * Resolves conflicts by updating or merging facts
   */
  resolveConflict(conflictInfo: ConflictInfo, userChoice: 'new' | 'existing' | 'merge'): void {
    switch (userChoice) {
      case 'new':
        // Update existing fact with new information
        this.updateFactConfidence(conflictInfo.existingFact.id, 0.3, false);
        this.storeFact(conflictInfo.newFact, [conflictInfo.existingFact.id]);
        break;
        
      case 'existing':
        // Boost confidence in existing fact
        this.updateFactConfidence(conflictInfo.existingFact.id, 
          Math.min(1.0, conflictInfo.existingFact.confidence + 0.2), true);
        // Lower confidence in new fact
        conflictInfo.newFact.confidence = 0.2;
        this.storeFact(conflictInfo.newFact, [conflictInfo.existingFact.id]);
        break;
        
      case 'merge': {
        // Create merged fact
        const mergedContent = `${conflictInfo.existingFact.content}; ${conflictInfo.newFact.content}`;
        const mergedFact: LearnedFact = {
          id: `merged_${Date.now()}`,
          content: mergedContent,
          category: conflictInfo.newFact.category,
          confidence: (conflictInfo.existingFact.confidence + conflictInfo.newFact.confidence) / 2,
          timestamp: new Date(),
          source: `Merged: ${conflictInfo.newFact.source}`,
          verified: true
        };
        
        this.storeFact(mergedFact, [conflictInfo.existingFact.id, conflictInfo.newFact.id]);
        break;
      }
    }
    
    console.log(`✅ Conflict resolved: ${userChoice} chosen for "${conflictInfo.newFact.content}"`);
  }

  /**
   * Gets memory statistics
   */
  getMemoryStats(): MemoryStats {
    const totalFacts = this.memory.size;
    const factsByCategory: { [category: string]: number } = {};
    let totalConfidence = 0;
    let verifiedCount = 0;
    let recentCount = 0;
    
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const entry of this.memory.values()) {
      const category = entry.fact.category;
      factsByCategory[category] = (factsByCategory[category] || 0) + 1;
      
      totalConfidence += entry.confidence;
      
      if (entry.verified) verifiedCount++;
      if (entry.fact.timestamp >= twentyFourHoursAgo) recentCount++;
    }

    return {
      totalFacts,
      factsByCategory,
      averageConfidence: totalFacts > 0 ? totalConfidence / totalFacts : 0,
      verifiedFacts: verifiedCount,
      recentlyLearned: recentCount
    };
  }

  /**
   * Exports knowledge for persistence
   */
  exportKnowledge(): { [category: string]: { [key: string]: string } } {
    const exported: { [category: string]: { [key: string]: string } } = {};

    for (const entry of this.memory.values()) {
      const category = entry.fact.category;
      if (!exported[category]) {
        exported[category] = {};
      }
      
      exported[category][entry.fact.id] = entry.fact.content;
    }

    return exported;
  }

  /**
   * Imports knowledge from existing format
   */
  importKnowledge(knowledge: { [category: string]: { [key: string]: string } }): void {
    for (const [category, facts] of Object.entries(knowledge)) {
      for (const [key, content] of Object.entries(facts)) {
        const fact: LearnedFact = {
          id: key,
          content,
          category: category as LearnedFact['category'],
          confidence: 0.8, // Assume imported facts have good confidence
          timestamp: new Date(),
          source: 'imported knowledge',
          verified: true
        };
        
        this.storeFact(fact);
      }
    }
    
    console.log(`📚 Imported ${Object.keys(knowledge).length} categories of knowledge`);
  }

  /**
   * Cleans up low-confidence and old unused facts
   */
  cleanup(minConfidence: number = 0.3, maxAge: number = 30): void {
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
    const toDelete: string[] = [];

    for (const [factId, entry] of this.memory.entries()) {
      const shouldDelete = (
        entry.confidence < minConfidence && 
        entry.fact.timestamp < cutoffDate && 
        entry.accessCount === 0
      );
      
      if (shouldDelete) {
        toDelete.push(factId);
      }
    }

    for (const factId of toDelete) {
      this.deleteFact(factId);
    }

    console.log(`🧹 Cleaned up ${toDelete.length} low-quality facts`);
  }

  /**
   * Private helper methods
   */
  private updateIndexes(fact: LearnedFact): void {
    // Category index
    if (!this.categoryIndex.has(fact.category)) {
      this.categoryIndex.set(fact.category, new Set());
    }
    this.categoryIndex.get(fact.category)!.add(fact.id);

    // Timeline index
    const dateKey = fact.timestamp.toDateString();
    if (!this.timelineIndex.has(dateKey)) {
      this.timelineIndex.set(dateKey, new Set());
    }
    this.timelineIndex.get(dateKey)!.add(fact.id);
  }

  private deleteFact(factId: string): void {
    const entry = this.memory.get(factId);
    if (!entry) return;

    // Remove from main memory
    this.memory.delete(factId);

    // Remove from category index
    const categorySet = this.categoryIndex.get(entry.fact.category);
    if (categorySet) {
      categorySet.delete(factId);
      if (categorySet.size === 0) {
        this.categoryIndex.delete(entry.fact.category);
      }
    }

    // Remove from timeline index
    const dateKey = entry.fact.timestamp.toDateString();
    const timelineSet = this.timelineIndex.get(dateKey);
    if (timelineSet) {
      timelineSet.delete(factId);
      if (timelineSet.size === 0) {
        this.timelineIndex.delete(dateKey);
      }
    }
  }
}

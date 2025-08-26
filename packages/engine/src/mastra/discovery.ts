/**
 * Mastra Component Discovery System
 * Intelligent discovery and recommendation of Mastra components based on user input
 */

import { 
  getAllComponents, 
  getComponentsByTag, 
  getComponentsByUseCase,
  COMPONENT_METADATA,
  ComponentMetadata 
} from './registry';

export interface ComponentRecommendation {
  component: ComponentMetadata;
  relevanceScore: number;
  matchReasons: string[];
  suggestedParameters?: Record<string, any>;
}

export interface DiscoveryResult {
  recommendations: {
    tools: ComponentRecommendation[];
    agents: ComponentRecommendation[];
    workflows: ComponentRecommendation[];
  };
  totalScore: number;
  confidence: number;
}

export class ComponentDiscovery {
  private keywordMap: Record<string, string[]>;
  private intentComponentMap: Record<string, string[]>;

  constructor() {
    this.keywordMap = this.buildKeywordMap();
    this.intentComponentMap = this.buildIntentComponentMap();
  }

  /**
   * Discover relevant components based on user input and intent
   */
  discoverComponents(userInput: string, intentType?: string): DiscoveryResult {
    const allComponents = getAllComponents();
    const recommendations = {
      tools: [] as ComponentRecommendation[],
      agents: [] as ComponentRecommendation[],
      workflows: [] as ComponentRecommendation[]
    };

    // Score each component based on relevance
    allComponents.forEach(component => {
      const recommendation = this.scoreComponent(component, userInput, intentType);
      
      if (recommendation.relevanceScore > 0.3) { // Threshold for relevance
        if (component.category === 'tool') {
          recommendations.tools.push(recommendation);
        } else if (component.category === 'agent') {
          recommendations.agents.push(recommendation);
        } else if (component.category === 'workflow') {
          recommendations.workflows.push(recommendation);
        }
      }
    });

    // Sort by relevance score
    recommendations.tools.sort((a, b) => b.relevanceScore - a.relevanceScore);
    recommendations.agents.sort((a, b) => b.relevanceScore - a.relevanceScore);
    recommendations.workflows.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit to top recommendations
    recommendations.tools = recommendations.tools.slice(0, 5);
    recommendations.agents = recommendations.agents.slice(0, 3);
    recommendations.workflows = recommendations.workflows.slice(0, 2);

    const totalScore = this.calculateTotalScore(recommendations);
    const confidence = this.calculateConfidence(recommendations, userInput);

    return {
      recommendations,
      totalScore,
      confidence
    };
  }

  /**
   * Score a component based on its relevance to the user input
   */
  private scoreComponent(
    component: ComponentMetadata, 
    userInput: string, 
    intentType?: string
  ): ComponentRecommendation {
    let score = 0;
    const matchReasons: string[] = [];
    const suggestedParameters: Record<string, any> = {};

    const lowerInput = userInput.toLowerCase();
    const lowerDescription = component.description.toLowerCase();

    // 1. Intent type matching (high weight)
    if (intentType && this.intentComponentMap[intentType]?.includes(component.id)) {
      score += 0.4;
      matchReasons.push(`Matches ${intentType} intent`);
    }

    // 2. Tag matching (medium weight)
    const matchingTags = component.tags.filter(tag => 
      lowerInput.includes(tag.toLowerCase()) || 
      this.keywordMap[tag]?.some(keyword => lowerInput.includes(keyword))
    );
    if (matchingTags.length > 0) {
      score += 0.3 * (matchingTags.length / component.tags.length);
      matchReasons.push(`Matches tags: ${matchingTags.join(', ')}`);
    }

    // 3. Use case matching (medium weight)
    const matchingUseCases = component.useCases.filter(useCase =>
      this.textSimilarity(lowerInput, useCase.toLowerCase()) > 0.3
    );
    if (matchingUseCases.length > 0) {
      score += 0.25 * (matchingUseCases.length / component.useCases.length);
      matchReasons.push(`Matches use cases: ${matchingUseCases.slice(0, 2).join(', ')}`);
    }

    // 4. Description similarity (low weight)
    const descriptionSimilarity = this.textSimilarity(lowerInput, lowerDescription);
    if (descriptionSimilarity > 0.2) {
      score += 0.15 * descriptionSimilarity;
      matchReasons.push('Similar to component description');
    }

    // 5. Keyword extraction and parameter suggestion
    const extractedParams = this.extractParameters(userInput, component);
    if (Object.keys(extractedParams).length > 0) {
      score += 0.1;
      Object.assign(suggestedParameters, extractedParams);
      matchReasons.push('Parameters detected in input');
    }

    // 6. Component popularity/reliability boost
    const popularComponents = ['freight-booking', 'warehouse-finder', 'shipment-tracking', 'email-notification'];
    if (popularComponents.includes(component.id)) {
      score += 0.05;
    }

    return {
      component,
      relevanceScore: Math.min(score, 1.0), // Cap at 1.0
      matchReasons,
      suggestedParameters: Object.keys(suggestedParameters).length > 0 ? suggestedParameters : undefined
    };
  }

  /**
   * Calculate text similarity between two strings
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/).filter(w => w.length > 2);
    const words2 = text2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;

    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Extract parameters from user input based on component requirements
   */
  private extractParameters(userInput: string, component: ComponentMetadata): Record<string, any> {
    const params: Record<string, any> = {};
    const lowerInput = userInput.toLowerCase();

    // Location extraction
    const locationRegex = /(?:from|to|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    let match;
    const locations = [];
    while ((match = locationRegex.exec(userInput)) !== null) {
      locations.push(match[1]);
    }
    if (locations.length > 0) {
      if (component.id === 'freight-booking') {
        params.origin = locations[0];
        if (locations.length > 1) params.destination = locations[1];
      } else if (component.id === 'warehouse-finder') {
        params.location = locations[0];
      }
    }

    // Quantity extraction
    const quantityRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(containers?|packages?|lbs?|kg|tons?|sq\s*ft|pallets?)/gi;
    while ((match = quantityRegex.exec(userInput)) !== null) {
      if (component.id === 'freight-booking') {
        if (match[2].toLowerCase().includes('container')) {
          params.cargoType = 'FCL';
        }
        if (match[2].toLowerCase().includes('kg') || match[2].toLowerCase().includes('lbs')) {
          params.weight = parseFloat(match[1].replace(/,/g, ''));
        }
      } else if (component.id === 'warehouse-finder') {
        if (match[2].toLowerCase().includes('sq ft')) {
          params.minCapacity = parseFloat(match[1].replace(/,/g, ''));
        }
      }
    }

    // Urgency detection
    if (lowerInput.includes('urgent') || lowerInput.includes('fast') || lowerInput.includes('express')) {
      if (component.id === 'freight-booking') {
        params.urgency = 'urgent';
      }
    }

    // Storage type detection
    if (component.id === 'warehouse-finder') {
      if (lowerInput.includes('refrigerat') || lowerInput.includes('cold')) {
        params.storageType = 'refrigerated';
      } else if (lowerInput.includes('frozen')) {
        params.storageType = 'frozen';
      } else if (lowerInput.includes('hazmat') || lowerInput.includes('dangerous')) {
        params.storageType = 'hazmat';
      }
    }

    // Tracking number detection
    if (component.id === 'shipment-tracking') {
      const trackingRegex = /(?:track|tracking|shipment)\s+(?:number\s+)?([A-Z0-9]{6,20})/gi;
      while ((match = trackingRegex.exec(userInput)) !== null) {
        params.trackingNumber = match[1];
      }
    }

    return params;
  }

  /**
   * Build keyword mapping for better component discovery
   */
  private buildKeywordMap(): Record<string, string[]> {
    return {
      'freight': ['shipping', 'transport', 'cargo', 'shipment', 'forwarding'],
      'booking': ['reserve', 'schedule', 'arrange', 'book'],
      'ocean': ['sea', 'maritime', 'vessel', 'container', 'fcl', 'lcl'],
      'air': ['flight', 'airfreight', 'aviation', 'express'],
      'warehouse': ['storage', 'facility', 'distribution', 'fulfillment', 'dc'],
      '3pl': ['third party', 'logistics provider', 'outsourcing'],
      'customs': ['clearance', 'duties', 'import', 'export', 'border'],
      'tracking': ['monitor', 'trace', 'follow', 'status', 'visibility'],
      'compliance': ['regulation', 'audit', 'certification', 'standards'],
      'notification': ['alert', 'message', 'inform', 'notify'],
      'voice': ['call', 'phone', 'telephone', 'speak'],
      'coordination': ['manage', 'organize', 'coordinate', 'oversee']
    };
  }

  /**
   * Build intent to component mapping
   */
  private buildIntentComponentMap(): Record<string, string[]> {
    return {
      'freight_forwarding': ['freight-booking', 'freight-coordinator', 'email-notification', 'ocean-freight-booking'],
      'warehousing': ['warehouse-finder', 'warehouse-manager', 'email-notification'],
      'customs': ['customs-clearance', 'customs-specialist', 'email-notification'],
      'tracking': ['shipment-tracking', 'tracking-coordinator', 'email-notification'],
      'cross_docking': ['warehouse-finder', 'warehouse-manager', 'email-notification'],
      'inventory': ['warehouse-finder', 'warehouse-manager'],
      'optimization': ['freight-booking', 'warehouse-finder', 'freight-coordinator']
    };
  }

  /**
   * Calculate total relevance score for the discovery result
   */
  private calculateTotalScore(recommendations: {
    tools: ComponentRecommendation[];
    agents: ComponentRecommendation[];
    workflows: ComponentRecommendation[];
  }): number {
    const allRecommendations = [
      ...recommendations.tools,
      ...recommendations.agents,
      ...recommendations.workflows
    ];

    if (allRecommendations.length === 0) return 0;

    const totalScore = allRecommendations.reduce((sum, rec) => sum + rec.relevanceScore, 0);
    return totalScore / allRecommendations.length;
  }

  /**
   * Calculate confidence in the discovery results
   */
  private calculateConfidence(
    recommendations: {
      tools: ComponentRecommendation[];
      agents: ComponentRecommendation[];
      workflows: ComponentRecommendation[];
    },
    userInput: string
  ): number {
    const totalComponents = recommendations.tools.length + 
                           recommendations.agents.length + 
                           recommendations.workflows.length;

    if (totalComponents === 0) return 0.1;

    // Base confidence on number of components found and their scores
    let confidence = Math.min(totalComponents / 5, 1.0) * 0.5; // Up to 0.5 for quantity

    // Add confidence based on top scores
    const topScores = [
      ...recommendations.tools.slice(0, 2),
      ...recommendations.agents.slice(0, 1),
      ...recommendations.workflows.slice(0, 1)
    ].map(rec => rec.relevanceScore);

    if (topScores.length > 0) {
      const avgTopScore = topScores.reduce((sum, score) => sum + score, 0) / topScores.length;
      confidence += avgTopScore * 0.5; // Up to 0.5 for quality
    }

    // Boost confidence if we have a good mix of components
    if (recommendations.tools.length > 0 && recommendations.agents.length > 0) {
      confidence += 0.1;
    }

    // Reduce confidence for very short or very long inputs
    const inputLength = userInput.split(/\s+/).length;
    if (inputLength < 3 || inputLength > 50) {
      confidence *= 0.8;
    }

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  /**
   * Get component recommendations for a specific category
   */
  getRecommendationsByCategory(
    userInput: string, 
    category: 'tool' | 'agent' | 'workflow',
    intentType?: string,
    limit: number = 5
  ): ComponentRecommendation[] {
    const result = this.discoverComponents(userInput, intentType);
    return result.recommendations[category + 's' as keyof typeof result.recommendations].slice(0, limit);
  }

  /**
   * Check if components have satisfied dependencies
   */
  validateComponentDependencies(selectedComponents: string[]): {
    valid: boolean;
    missingDependencies: string[];
    suggestions: string[];
  } {
    const missingDependencies: string[] = [];
    const suggestions: string[] = [];

    selectedComponents.forEach(componentId => {
      const component = COMPONENT_METADATA[componentId];
      if (component && component.dependencies) {
        component.dependencies.forEach(dep => {
          if (!selectedComponents.includes(dep)) {
            missingDependencies.push(dep);
            const depComponent = COMPONENT_METADATA[dep];
            if (depComponent) {
              suggestions.push(`Add ${depComponent.name} (${dep}) for ${component.name}`);
            }
          }
        });
      }
    });

    return {
      valid: missingDependencies.length === 0,
      missingDependencies: [...new Set(missingDependencies)],
      suggestions
    };
  }
}

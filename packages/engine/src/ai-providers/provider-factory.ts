import { AIProvider } from './ai-provider-interface';
import { ClaudeService } from './claude-service';

export type AIProviderType = 'claude';

export class AIProviderFactory {
  private static providers = new Map<string, AIProvider>();

  static createProvider(type: AIProviderType, config: any): AIProvider {
    const key = `${type}_${JSON.stringify(config)}`;
    
    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: AIProvider;
    
    switch (type) {
      case 'claude':
        if (!config.apiKey) {
          throw new Error('Claude API key is required');
        }
        provider = new ClaudeService(config.apiKey);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  static getAvailableProviders(): AIProviderType[] {
    return ['claude'];
  }

  static clearCache(): void {
    this.providers.clear();
  }
}

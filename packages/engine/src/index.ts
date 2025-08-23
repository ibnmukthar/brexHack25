export { LogisticsEngine } from './engine';
export { WorkflowParser } from './parser';
export { WorkflowGenerator } from './generator';
export { WorkflowExecutor } from './executor';
export { MockIntegrations } from './mock-integrations';
export * from './types';

// AI Providers
export { AIProvider, WorkflowTemplate, ParameterSchema } from './ai-providers/ai-provider-interface';
export { ClaudeService } from './ai-providers/claude-service';
export { AIProviderFactory, AIProviderType } from './ai-providers/provider-factory';

export async function textToWorkflow(input: string) {
  const { LogisticsEngine } = await import('./engine');
  const engine = new LogisticsEngine();
  return engine.createWorkflow(input);
}
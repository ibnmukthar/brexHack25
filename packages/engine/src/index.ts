export { LogisticsEngine } from './engine';
export { WorkflowParser } from './parser';
export { WorkflowGenerator } from './generator';
export { WorkflowExecutor } from './executor';
export { MockIntegrations } from './mock-integrations';
export * from './types';

export async function textToWorkflow(input: string) {
  const { LogisticsEngine } = await import('./engine');
  const engine = new LogisticsEngine();
  return engine.createWorkflow(input);
}
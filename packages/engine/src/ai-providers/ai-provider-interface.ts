import { LogisticsIntent, Workflow } from '../types';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'inventory' | 'shipment' | 'supplier' | 'demand';
  parameters: ParameterSchema[];
  steps: WorkflowStepTemplate[];
  integrations: IntegrationRequirement[];
  output_schema: Record<string, string>;
}

export interface ParameterSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'textarea';
  label?: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  validation?: any;
  ui_hint?: 'slider' | 'dropdown' | 'input' | 'checkbox';
}

export interface WorkflowStepTemplate {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  outputs?: string[];
}

export interface IntegrationRequirement {
  name: string;
  type: 'rest' | 'graphql' | 'webhook' | 'smtp';
  required: boolean;
}

export interface AIProvider {
  name: string;
  parseIntent(input: string): Promise<LogisticsIntent>;
  generateWorkflow(intent: LogisticsIntent, template: WorkflowTemplate): Promise<Workflow>;
  extractParameters(workflow: Workflow): Promise<ParameterSchema[]>;
}

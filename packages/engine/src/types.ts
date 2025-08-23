export interface LogisticsIntent {
  type: 'tracking' | 'optimization' | 'carrier_selection' | 'inventory' | 'return_processing';
  entities: Record<string, any>;
  priority: 'low' | 'medium' | 'high';
  constraints?: {
    timeWindow?: string;
    costLimit?: number;
    serviceLevel?: string;
    costPriority?: 'minimize' | 'maximize';
    timePriority?: 'minimize' | 'maximize';
  };
}

export interface WorkflowParams {
  [key: string]: any;
}

export interface ExecutionContext {
  workflowId: string;
  parameters: WorkflowParams;
  stepOutputs: Record<string, any>;
  startTime: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  config: Record<string, any>;
  dependencies?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  triggers?: string[];
  metadata: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  stepResults: Record<string, any>;
  logs: string[];
}

export interface UIComponent {
  type: 'input' | 'select' | 'checkbox' | 'slider' | 'button' | 'display';
  label: string;
  id: string;
  props?: Record<string, any>;
  value?: any;
}

export interface WorkflowUI {
  title: string;
  steps: {
    id: string;
    name: string;
    status: string;
    controls: UIComponent[];
  }[];
}
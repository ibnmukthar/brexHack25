/**
 * Mastra Component Registry
 * Central registry for all available Mastra components (tools, agents, workflows)
 */

// Generic Tools
import { apiConnectorTool } from './tools/api-connector';
import { dataProcessorTool } from './tools/data-processor';
import { notificationSenderTool } from './tools/notification-sender';
import { documentHandlerTool } from './tools/document-handler';

// Generic Agents
import { logisticsCoordinatorAgent } from './agents/logistics-coordinator';
import { dataAnalystAgent } from './agents/data-analyst';
import { processManagerAgent } from './agents/process-manager';

export interface ComponentMetadata {
  id: string;
  name: string;
  description: string;
  category: 'tool' | 'agent' | 'workflow';
  tags: string[];
  useCases: string[];
  dependencies?: string[];
  version?: string;
  author?: string;
  documentation?: string;
  configurable?: boolean;
  parameters?: Record<string, any>;
}

// Tool Registry
export const TOOLS = {
  'api-connector': apiConnectorTool,
  'data-processor': dataProcessorTool,
  'notification-sender': notificationSenderTool,
  'document-handler': documentHandlerTool
} as const;

// Agent Registry
export const AGENTS = {
  'logistics-coordinator': logisticsCoordinatorAgent,
  'data-analyst': dataAnalystAgent,
  'process-manager': processManagerAgent
} as const;

// Workflow Registry
export const WORKFLOWS = {
  // Generic workflows can be composed dynamically
} as const;

// Component Metadata
export const COMPONENT_METADATA: Record<string, Omit<ComponentMetadata, 'id'>> = {
  // Generic Tools
  'api-connector': {
    name: 'API Connector',
    description: 'Generic tool for connecting to external APIs and services',
    category: 'tool',
    tags: ['api', 'integration', 'external', 'connector', 'http', 'rest'],
    useCases: [
      'Connect to freight booking APIs',
      'Integrate with warehouse management systems',
      'Access customs clearance services',
      'Connect to tracking systems',
      'Integrate with ERP systems',
      'Access third-party logistics APIs'
    ],
    configurable: true,
    parameters: {
      endpoint: 'string',
      method: 'GET|POST|PUT|DELETE',
      authentication: 'object',
      headers: 'object',
      timeout: 'number'
    }
  },
  'data-processor': {
    name: 'Data Processor',
    description: 'Generic tool for processing, transforming, and analyzing data',
    category: 'tool',
    tags: ['data', 'processing', 'transformation', 'analysis', 'validation', 'filtering'],
    useCases: [
      'Process shipment data and generate reports',
      'Transform data between different formats',
      'Validate logistics data quality',
      'Filter and sort logistics records',
      'Calculate costs and performance metrics',
      'Merge data from multiple sources'
    ],
    configurable: true,
    parameters: {
      operations: 'array',
      outputFormat: 'json|csv|xml',
      validation: 'object'
    }
  },
  'notification-sender': {
    name: 'Notification Sender',
    description: 'Generic tool for sending notifications via various channels',
    category: 'tool',
    tags: ['notification', 'communication', 'email', 'sms', 'webhook', 'alerts'],
    useCases: [
      'Send shipment status updates via email',
      'Send SMS alerts for urgent issues',
      'Trigger webhook notifications to systems',
      'Send Slack/Teams messages to teams',
      'Schedule delivery notifications',
      'Send compliance alerts and reminders'
    ],
    configurable: true,
    parameters: {
      channel: 'email|sms|webhook|slack|teams',
      recipients: 'array',
      template: 'object',
      scheduling: 'object'
    }
  },
  'document-handler': {
    name: 'Document Handler',
    description: 'Generic tool for processing, validating, and managing documents',
    category: 'tool',
    tags: ['document', 'processing', 'validation', 'pdf', 'conversion', 'management'],
    useCases: [
      'Process bills of lading and invoices',
      'Validate customs documentation',
      'Convert documents between formats',
      'Extract data from shipping documents',
      'Generate compliance reports',
      'Manage document workflows and approvals'
    ],
    configurable: true,
    parameters: {
      operation: 'validate|extract|convert|merge|split',
      documents: 'array',
      config: 'object'
    }
  },

  // Generic Agents
  'logistics-coordinator': {
    name: 'Logistics Coordinator',
    description: 'Generic agent for coordinating and orchestrating logistics operations',
    category: 'agent',
    tags: ['logistics', 'coordination', 'orchestration', 'planning', 'optimization'],
    useCases: [
      'Coordinate freight forwarding operations',
      'Manage warehouse and distribution processes',
      'Orchestrate customs clearance workflows',
      'Plan supply chain optimization',
      'Coordinate vendor management activities',
      'Manage transportation planning'
    ],
    configurable: true,
    parameters: {
      operation: 'freight_coordination|warehouse_management|customs_clearance',
      context: 'object',
      requirements: 'object',
      preferences: 'object'
    },
    dependencies: ['api-connector', 'data-processor', 'notification-sender']
  },
  'data-analyst': {
    name: 'Data Analyst',
    description: 'Generic agent for analyzing data and generating insights',
    category: 'agent',
    tags: ['data', 'analysis', 'insights', 'reporting', 'metrics', 'intelligence'],
    useCases: [
      'Analyze logistics performance metrics',
      'Generate cost analysis reports',
      'Identify trends and patterns',
      'Create predictive analytics',
      'Monitor compliance metrics',
      'Optimize operational efficiency'
    ],
    configurable: true,
    parameters: {
      analysis_type: 'performance_analysis|cost_analysis|trend_analysis',
      data_sources: 'array',
      analysis_config: 'object',
      output_config: 'object'
    },
    dependencies: ['data-processor', 'notification-sender']
  },
  'process-manager': {
    name: 'Process Manager',
    description: 'Generic agent for managing and optimizing business processes',
    category: 'agent',
    tags: ['process', 'management', 'workflow', 'optimization', 'monitoring', 'automation'],
    useCases: [
      'Orchestrate complex logistics workflows',
      'Manage exception handling processes',
      'Monitor quality assurance procedures',
      'Ensure compliance monitoring',
      'Optimize resource allocation',
      'Handle incident response workflows'
    ],
    configurable: true,
    parameters: {
      process_type: 'workflow_orchestration|exception_handling|quality_assurance',
      process_config: 'object',
      monitoring_config: 'object',
      automation_config: 'object'
    },
    dependencies: ['api-connector', 'data-processor', 'notification-sender', 'document-handler']
  }
};

// Helper functions
export function getComponentsByCategory(category: 'tool' | 'agent' | 'workflow') {
  return Object.entries(COMPONENT_METADATA)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([id, metadata]) => ({ ...metadata, id }));
}

export function getComponentsByTag(tag: string) {
  return Object.entries(COMPONENT_METADATA)
    .filter(([_, metadata]) => metadata.tags.includes(tag))
    .map(([id, metadata]) => ({ ...metadata, id }));
}

export function getComponentsByUseCase(useCase: string) {
  return Object.entries(COMPONENT_METADATA)
    .filter(([_, metadata]) =>
      metadata.useCases.some(uc =>
        uc.toLowerCase().includes(useCase.toLowerCase())
      )
    )
    .map(([id, metadata]) => ({ ...metadata, id }));
}

export function getAllComponents() {
  return Object.entries(COMPONENT_METADATA)
    .map(([id, metadata]) => ({ ...metadata, id }));
}

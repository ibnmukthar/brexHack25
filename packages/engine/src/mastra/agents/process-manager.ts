/**
 * Generic Process Manager Agent
 * Configurable agent for managing and orchestrating business processes
 */

import { z } from 'zod';

export const processManagerAgent: {
  id: string;
  name: string;
  description: string;
  category: 'agent';
  inputSchema: any;
  outputSchema: any;
  execute: (input: any) => Promise<any>;
} = {
  id: 'process-manager',
  name: 'Process Manager',
  description: 'Generic agent for managing, monitoring, and optimizing business processes',
  category: 'agent' as const,
  
  inputSchema: z.object({
    process_type: z.enum([
      'workflow_orchestration', 'exception_handling', 'quality_assurance',
      'compliance_monitoring', 'resource_allocation', 'performance_optimization',
      'change_management', 'incident_response', 'audit_management'
    ]).describe('Type of process management to perform'),
    process_config: z.object({
      name: z.string(),
      description: z.string().optional(),
      steps: z.array(z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(['manual', 'automated', 'approval', 'notification', 'validation']),
        dependencies: z.array(z.string()).optional(),
        timeout: z.number().optional().describe('Timeout in minutes'),
        retry_config: z.object({
          max_attempts: z.number().default(3),
          delay: z.number().default(60)
        }).optional()
      })),
      sla: z.object({
        completion_time: z.number().describe('Expected completion time in minutes'),
        quality_threshold: z.number().min(0).max(100).default(95),
        escalation_rules: z.array(z.object({
          condition: z.string(),
          action: z.string(),
          delay: z.number()
        })).optional()
      }).optional()
    }),
    monitoring_config: z.object({
      metrics: z.array(z.string()).describe('Metrics to track'),
      alerts: z.array(z.object({
        condition: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        recipients: z.array(z.string())
      })).optional(),
      reporting: z.object({
        frequency: z.enum(['real-time', 'hourly', 'daily', 'weekly']),
        recipients: z.array(z.string()).optional()
      }).optional()
    }).optional(),
    automation_config: z.object({
      auto_retry: z.boolean().default(true),
      auto_escalate: z.boolean().default(true),
      auto_approve: z.object({
        enabled: z.boolean().default(false),
        conditions: z.array(z.string()).optional()
      }).optional(),
      parallel_execution: z.boolean().default(false)
    }).optional()
  }),

  outputSchema: z.object({
    success: z.boolean(),
    process_instance: z.object({
      id: z.string(),
      status: z.enum(['created', 'running', 'paused', 'completed', 'failed', 'cancelled']),
      current_step: z.string().optional(),
      progress: z.number().min(0).max(100),
      started_at: z.string(),
      estimated_completion: z.string().optional(),
      actual_completion: z.string().optional()
    }),
    execution_plan: z.object({
      total_steps: z.number(),
      parallel_branches: z.number(),
      critical_path: z.array(z.string()),
      estimated_duration: z.number(),
      resource_requirements: z.array(z.object({
        type: z.string(),
        quantity: z.number(),
        duration: z.number()
      }))
    }),
    monitoring_setup: z.object({
      dashboards: z.array(z.object({
        name: z.string(),
        url: z.string(),
        metrics: z.array(z.string())
      })),
      alerts_configured: z.number(),
      reporting_schedule: z.string()
    }).optional(),
    quality_gates: z.array(z.object({
      step_id: z.string(),
      criteria: z.array(z.string()),
      auto_check: z.boolean()
    })).optional(),
    compliance_checks: z.array(z.object({
      regulation: z.string(),
      requirement: z.string(),
      verification_method: z.string(),
      status: z.enum(['pending', 'passed', 'failed', 'not_applicable'])
    })).optional(),
    error: z.string().optional()
  }),

  execute: async (input: z.infer<typeof processManagerAgent.inputSchema>) => {
    try {
      const processInstance = await createProcessInstance(input);
      const executionPlan = await generateExecutionPlan(input);
      const monitoringSetup = await setupMonitoring(input);
      const qualityGates = await configureQualityGates(input);
      const complianceChecks = await setupComplianceChecks(input);

      return {
        success: true,
        process_instance: processInstance,
        execution_plan: executionPlan,
        monitoring_setup: monitoringSetup,
        quality_gates: qualityGates,
        compliance_checks: complianceChecks
      };

    } catch (error) {
      return {
        success: false,
        process_instance: {
          id: generateProcessId(),
          status: 'failed' as const,
          progress: 0,
          started_at: new Date().toISOString()
        },
        execution_plan: {
          total_steps: 0,
          parallel_branches: 0,
          critical_path: [],
          estimated_duration: 0,
          resource_requirements: []
        },
        error: error instanceof Error ? error.message : 'Process management failed'
      };
    }
  }
};

async function createProcessInstance(input: any) {
  const processId = generateProcessId();
  const startTime = new Date();
  const estimatedDuration = calculateEstimatedDuration(input.process_config.steps);
  const estimatedCompletion = new Date(startTime.getTime() + estimatedDuration * 60 * 1000);

  return {
    id: processId,
    status: 'created' as const,
    current_step: input.process_config.steps[0]?.id,
    progress: 0,
    started_at: startTime.toISOString(),
    estimated_completion: estimatedCompletion.toISOString()
  };
}

async function generateExecutionPlan(input: any) {
  const { steps } = input.process_config;
  const { parallel_execution } = input.automation_config || {};

  // Analyze step dependencies to determine execution order
  const dependencyGraph = buildDependencyGraph(steps);
  const criticalPath = findCriticalPath(dependencyGraph);
  const parallelBranches = parallel_execution ? identifyParallelBranches(dependencyGraph) : 0;
  
  // Calculate resource requirements
  const resourceRequirements = calculateResourceRequirements(steps);
  
  // Estimate total duration considering parallelization
  const estimatedDuration = calculateOptimizedDuration(steps, parallelBranches);

  return {
    total_steps: steps.length,
    parallel_branches: parallelBranches,
    critical_path: criticalPath,
    estimated_duration: estimatedDuration,
    resource_requirements: resourceRequirements
  };
}

async function setupMonitoring(input: any) {
  const { monitoring_config } = input;
  
  if (!monitoring_config) return undefined;

  const dashboards = [
    {
      name: 'Process Overview',
      url: `/dashboard/process/${generateProcessId()}`,
      metrics: ['completion_rate', 'average_duration', 'error_rate']
    },
    {
      name: 'Performance Metrics',
      url: `/dashboard/performance/${generateProcessId()}`,
      metrics: monitoring_config.metrics || ['throughput', 'quality_score', 'sla_compliance']
    }
  ];

  const alertsConfigured = monitoring_config.alerts?.length || 0;
  const reportingSchedule = monitoring_config.reporting?.frequency || 'daily';

  return {
    dashboards,
    alerts_configured: alertsConfigured,
    reporting_schedule: reportingSchedule
  };
}

async function configureQualityGates(input: any) {
  const { steps } = input.process_config;
  const { quality_threshold } = input.process_config.sla || {};

  return steps
    .filter((step: any) => step.type === 'validation' || step.type === 'approval')
    .map((step: any) => ({
      step_id: step.id,
      criteria: generateQualityCriteria(step, quality_threshold),
      auto_check: step.type === 'validation'
    }));
}

async function setupComplianceChecks(input: any) {
  const { process_type } = input;
  
  // Generate compliance checks based on process type
  const complianceTemplates: Record<string, any[]> = {
    quality_assurance: [
      { regulation: 'ISO 9001', requirement: 'Quality Management System', method: 'audit' },
      { regulation: 'ISO 14001', requirement: 'Environmental Management', method: 'assessment' }
    ],
    compliance_monitoring: [
      { regulation: 'SOX', requirement: 'Financial Controls', method: 'review' },
      { regulation: 'GDPR', requirement: 'Data Protection', method: 'validation' }
    ],
    audit_management: [
      { regulation: 'Internal Audit', requirement: 'Process Documentation', method: 'verification' },
      { regulation: 'External Audit', requirement: 'Compliance Evidence', method: 'documentation' }
    ]
  };

  const checks = complianceTemplates[process_type] || [];
  
  return checks.map(check => ({
    regulation: check.regulation,
    requirement: check.requirement,
    verification_method: check.method,
    status: 'pending' as const
  }));
}

function buildDependencyGraph(steps: any[]) {
  const graph: Record<string, string[]> = {};
  
  steps.forEach(step => {
    graph[step.id] = step.dependencies || [];
  });
  
  return graph;
}

function findCriticalPath(dependencyGraph: Record<string, string[]>): string[] {
  // Simple critical path calculation - longest path through dependencies
  const visited = new Set<string>();
  const criticalPath: string[] = [];
  
  function dfs(nodeId: string, path: string[]): string[] {
    if (visited.has(nodeId)) return path;
    
    visited.add(nodeId);
    const newPath = [...path, nodeId];
    
    const dependencies = dependencyGraph[nodeId] || [];
    if (dependencies.length === 0) return newPath;
    
    let longestPath = newPath;
    dependencies.forEach(dep => {
      const depPath = dfs(dep, newPath);
      if (depPath.length > longestPath.length) {
        longestPath = depPath;
      }
    });
    
    return longestPath;
  }
  
  // Find the longest path from any starting node
  Object.keys(dependencyGraph).forEach(nodeId => {
    const path = dfs(nodeId, []);
    if (path.length > criticalPath.length) {
      criticalPath.splice(0, criticalPath.length, ...path);
    }
  });
  
  return criticalPath;
}

function identifyParallelBranches(dependencyGraph: Record<string, string[]>): number {
  // Count nodes that can run in parallel (no dependencies on each other)
  const nodes = Object.keys(dependencyGraph);
  let parallelGroups = 0;
  
  // Simple heuristic: count nodes with no dependencies as potential parallel branches
  const independentNodes = nodes.filter(node => 
    (dependencyGraph[node] || []).length === 0
  );
  
  parallelGroups = Math.max(1, Math.floor(independentNodes.length / 2));
  
  return parallelGroups;
}

function calculateResourceRequirements(steps: any[]) {
  const requirements: Record<string, { quantity: number; duration: number }> = {};
  
  steps.forEach(step => {
    const resourceType = getResourceType(step.type);
    const duration = step.timeout || 60; // minutes
    
    if (!requirements[resourceType]) {
      requirements[resourceType] = { quantity: 0, duration: 0 };
    }
    
    requirements[resourceType].quantity += 1;
    requirements[resourceType].duration += duration;
  });
  
  return Object.entries(requirements).map(([type, req]) => ({
    type,
    quantity: req.quantity,
    duration: req.duration
  }));
}

function getResourceType(stepType: string): string {
  const resourceMap: Record<string, string> = {
    manual: 'human_operator',
    automated: 'compute_resource',
    approval: 'approver',
    notification: 'notification_service',
    validation: 'validation_service'
  };
  
  return resourceMap[stepType] || 'generic_resource';
}

function calculateEstimatedDuration(steps: any[]): number {
  return steps.reduce((total, step) => total + (step.timeout || 60), 0);
}

function calculateOptimizedDuration(steps: any[], parallelBranches: number): number {
  const totalDuration = calculateEstimatedDuration(steps);
  
  if (parallelBranches <= 1) return totalDuration;
  
  // Simple optimization: assume some steps can run in parallel
  const parallelizationFactor = Math.min(0.7, 1 - (parallelBranches * 0.1));
  return Math.floor(totalDuration * parallelizationFactor);
}

function generateQualityCriteria(step: any, qualityThreshold?: number): string[] {
  const criteria = [];
  
  if (step.type === 'validation') {
    criteria.push('Data integrity check passed');
    criteria.push('Business rules validation successful');
    if (qualityThreshold) {
      criteria.push(`Quality score >= ${qualityThreshold}%`);
    }
  }
  
  if (step.type === 'approval') {
    criteria.push('Authorized approver signature');
    criteria.push('Approval within SLA timeframe');
    criteria.push('Complete documentation provided');
  }
  
  // Default criteria
  if (criteria.length === 0) {
    criteria.push('Step completed successfully');
    criteria.push('No errors or exceptions');
  }
  
  return criteria;
}

function generateProcessId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `proc_${timestamp}_${random}`;
}

// Process state management utilities
export class ProcessStateManager {
  private processes: Map<string, any> = new Map();
  
  updateProcessStatus(processId: string, status: string, currentStep?: string) {
    const process = this.processes.get(processId);
    if (process) {
      process.status = status;
      process.current_step = currentStep;
      process.progress = this.calculateProgress(process, currentStep);
      
      if (status === 'completed') {
        process.actual_completion = new Date().toISOString();
      }
      
      this.processes.set(processId, process);
    }
  }
  
  private calculateProgress(process: any, currentStep?: string): number {
    if (!currentStep || !process.steps) return 0;
    
    const currentIndex = process.steps.findIndex((step: any) => step.id === currentStep);
    if (currentIndex === -1) return 0;
    
    return Math.floor(((currentIndex + 1) / process.steps.length) * 100);
  }
  
  getProcessStatus(processId: string) {
    return this.processes.get(processId);
  }
  
  getAllProcesses() {
    return Array.from(this.processes.values());
  }
}

// Export singleton instance
export const processStateManager = new ProcessStateManager();

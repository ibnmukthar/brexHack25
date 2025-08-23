import { Workflow, WorkflowExecution, WorkflowStep } from './types';
import { MockIntegrations } from './mock-integrations';

export class WorkflowExecutor {
  private integrations: MockIntegrations;

  constructor() {
    this.integrations = new MockIntegrations();
  }

  async execute(workflow: Workflow, params: any = {}): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}`,
      workflowId: workflow.id,
      status: 'running',
      startTime: new Date().toISOString(),
      stepResults: {},
      logs: [`Starting workflow: ${workflow.name}`]
    };

    try {
      await this.executeSteps(workflow.steps, execution, params);
      execution.status = 'completed';
      execution.endTime = new Date().toISOString();
      execution.logs.push('Workflow completed successfully');
    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date().toISOString();
      execution.logs.push(`Workflow failed: ${error}`);
    }

    return execution;
  }

  async runWithMockData(workflowId: string, params: any): Promise<WorkflowExecution> {
    return {
      id: `exec_${Date.now()}`,
      workflowId,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 5000).toISOString(),
      stepResults: {
        step1: { success: true, data: 'Mock result 1' },
        step2: { success: true, data: 'Mock result 2' }
      },
      logs: [
        'Workflow started',
        'Step 1 completed',
        'Step 2 completed',
        'Workflow completed successfully'
      ]
    };
  }

  private async executeSteps(steps: WorkflowStep[], execution: WorkflowExecution, params: any) {
    const completedSteps = new Set<string>();
    const pendingSteps = [...steps];

    while (pendingSteps.length > 0) {
      let progress = false;

      for (let i = pendingSteps.length - 1; i >= 0; i--) {
        const step = pendingSteps[i];
        
        if (this.canExecuteStep(step, completedSteps)) {
          execution.logs.push(`Executing step: ${step.name}`);
          
          try {
            const result = await this.executeStep(step, execution.stepResults, params);
            execution.stepResults[step.id] = result;
            completedSteps.add(step.id);
            pendingSteps.splice(i, 1);
            progress = true;
            
            execution.logs.push(`Completed step: ${step.name}`);
          } catch (error) {
            execution.logs.push(`Failed step: ${step.name} - ${error}`);
            throw error;
          }
        }
      }

      if (!progress) {
        throw new Error('Workflow deadlock: circular dependencies detected');
      }
    }
  }

  private canExecuteStep(step: WorkflowStep, completedSteps: Set<string>): boolean {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true;
    }
    
    return step.dependencies.every(dep => completedSteps.has(dep));
  }

  private async executeStep(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    switch (step.type) {
      case 'api_call':
        return this.executeApiCall(step, previousResults, params);
      case 'data_processing':
        return this.executeDataProcessing(step, previousResults, params);
      case 'optimization_algorithm':
        return this.executeOptimization(step, previousResults, params);
      case 'notification':
        return this.executeNotification(step, previousResults, params);
      case 'validation':
        return this.executeValidation(step, previousResults, params);
      case 'erp_query':
        return this.executeERPQuery(step, previousResults, params);
      default:
        await this.delay(500 + Math.random() * 1000);
        return { success: true, data: `Mock result for ${step.type}` };
    }
  }

  private async executeApiCall(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    const { config } = step;
    
    if (config.endpoint === 'carrier_api') {
      return this.integrations.trackCarrier('fedex', config.trackingNumber);
    }
    
    await this.delay(800);
    return { success: true, data: 'API call completed', response: { status: 'success' } };
  }

  private async executeDataProcessing(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(600);
    
    return {
      success: true,
      processed_data: {
        status: 'in_transit',
        estimated_delivery: new Date(Date.now() + 86400000).toISOString(),
        confidence: 0.92
      }
    };
  }

  private async executeOptimization(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    const locations = params.locations || ['Chicago', 'Milwaukee', 'Madison'];
    return this.integrations.optimizeRoute(locations);
  }

  private async executeNotification(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(200);
    
    return {
      success: true,
      notifications_sent: step.config.triggers?.length || 1,
      channels: ['email', 'sms', 'webhook']
    };
  }

  private async executeValidation(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(400);
    
    const checks = step.config.checks || [];
    return {
      success: true,
      validation_results: checks.reduce((acc: any, check: string) => {
        acc[check] = Math.random() > 0.1; // 90% pass rate
        return acc;
      }, {}),
      overall_valid: true
    };
  }

  private async executeERPQuery(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    return this.integrations.queryERP(step.config.query);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
import { WorkflowParser } from './parser';
import { WorkflowGenerator } from './generator';
import { WorkflowExecutor } from './executor';
import { MockIntegrations } from './mock-integrations';
import { Workflow, WorkflowUI, UIComponent } from './types';

export class LogisticsEngine {
  private parser: WorkflowParser;
  private generator: WorkflowGenerator;
  private executor: WorkflowExecutor;
  private integrations: MockIntegrations;

  constructor() {
    this.parser = new WorkflowParser();
    this.generator = new WorkflowGenerator();
    this.executor = new WorkflowExecutor();
    this.integrations = new MockIntegrations();
  }

  async createWorkflow(input: string) {
    console.log('📝 Parsing input:', input);
    
    const intent = await this.parser.parse(input);
    console.log('🎯 Detected intent:', intent);
    
    const workflow = await this.generator.generate(intent);
    console.log('⚙️ Generated workflow:', workflow.name);
    
    const ui = this.generateSimpleUI(workflow);
    
    return {
      id: workflow.id,
      intent,
      workflow,
      ui,
      executable: true,
      createdAt: new Date().toISOString()
    };
  }

  async executeWorkflow(workflowId: string, params: any = {}) {
    console.log('🚀 Executing workflow:', workflowId);
    return this.executor.runWithMockData(workflowId, params);
  }

  async getWorkflowStatus(executionId: string) {
    await this.delay(100);
    return {
      id: executionId,
      status: 'completed',
      progress: 100,
      currentStep: 'finished',
      results: {
        totalSteps: 4,
        completedSteps: 4,
        estimatedSavings: '$127.50',
        timeToComplete: '2.3 minutes'
      }
    };
  }

  private generateSimpleUI(workflow: Workflow): WorkflowUI {
    return {
      title: workflow.name,
      steps: workflow.steps.map(step => ({
        id: step.id,
        name: step.name,
        status: 'pending',
        controls: this.getStepControls(step.type, step.config)
      }))
    };
  }

  private getStepControls(stepType: string, config: any): UIComponent[] {
    const controlMap: Record<string, UIComponent[]> = {
      optimization_algorithm: [
        { type: 'slider', label: 'Cost vs Speed Priority', id: 'priority', props: { min: 0, max: 100, value: 50 } },
        { type: 'select', label: 'Vehicle Type', id: 'vehicle', props: { options: ['Truck', 'Van', 'Bike', 'Walking'] } },
        { type: 'checkbox', label: 'Include Tolls', id: 'tolls', value: false },
        { type: 'input', label: 'Max Distance (miles)', id: 'maxDistance', props: { type: 'number', placeholder: '500' } }
      ],
      api_aggregation: [
        { type: 'checkbox', label: 'Express Shipping', id: 'express', value: false },
        { type: 'select', label: 'Preferred Carrier', id: 'carrier', props: { options: ['Any', 'FedEx', 'UPS', 'DHL', 'USPS'] } },
        { type: 'slider', label: 'Budget Limit ($)', id: 'budget', props: { min: 10, max: 200, value: 50 } }
      ],
      validation: [
        { type: 'checkbox', label: 'Skip Manual Checks', id: 'automate', value: true },
        { type: 'select', label: 'Approval Level', id: 'approval', props: { options: ['Auto', 'Manager', 'Director'] } }
      ],
      notification: [
        { type: 'checkbox', label: 'Email Notifications', id: 'email', value: true },
        { type: 'checkbox', label: 'SMS Alerts', id: 'sms', value: false },
        { type: 'input', label: 'Webhook URL', id: 'webhook', props: { placeholder: 'https://...' } }
      ],
      erp_query: [
        { type: 'select', label: 'Data Source', id: 'source', props: { options: ['All Warehouses', 'Primary Only', 'Secondary Only'] } },
        { type: 'slider', label: 'Threshold %', id: 'threshold', props: { min: 10, max: 50, value: 20 } }
      ]
    };

    return controlMap[stepType] || [
      { type: 'display', label: 'Step Configuration', id: 'info', value: 'This step will run automatically' }
    ];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
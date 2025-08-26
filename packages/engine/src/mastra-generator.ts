import Anthropic from '@anthropic-ai/sdk';
import { LogisticsIntent, Workflow, WorkflowStep } from './types';
import { 
  getAllComponents, 
  getComponentsByTag, 
  getComponentsByUseCase,
  COMPONENT_METADATA,
  ComponentMetadata 
} from './mastra/registry';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface MastraWorkflowRequest {
  intent: LogisticsIntent;
  userInput: string;
  context?: {
    previousWorkflows?: string[];
    constraints?: Record<string, any>;
    preferences?: Record<string, any>;
  };
}

export interface MastraWorkflowComposition {
  selectedComponents: {
    tools: ComponentMetadata[];
    agents: ComponentMetadata[];
    workflows: ComponentMetadata[];
  };
  workflowStructure: {
    steps: Array<{
      id: string;
      name: string;
      component: string;
      componentType: 'tool' | 'agent' | 'workflow';
      parameters: Record<string, any>;
      dependencies: string[];
    }>;
  };
  mastraCode: string;
}

export class MastraWorkflowGenerator {
  private _apiKey: string;
  private _model: string;
  private _maxTokens: number;
  private _temperature: number;

  constructor(apiKey?: string) {
    this._apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this._model = process.env.WORKFLOW_MODEL || 'claude-3-5-sonnet-latest';
    this._maxTokens = parseInt(process.env.WORKFLOW_MAX_TOKENS || '4000');
    this._temperature = parseFloat(process.env.WORKFLOW_TEMPERATURE || '0.1');

    console.log('🔧 Mastra Generator initialized');
    console.log('🔑 API Key available:', this._apiKey ? `Yes (${this._apiKey.substring(0, 10)}...)` : 'No');
    console.log('🤖 Model:', this._model);
  }

  async generateMastraWorkflow(request: MastraWorkflowRequest): Promise<{
    workflow: Workflow;
    mastraComposition: MastraWorkflowComposition;
    uiControls: any[];
  }> {
    try {
      console.log('🔍 Analyzing user request for Mastra components...');
      
      // Step 1: Discover relevant components
      const relevantComponents = this.discoverRelevantComponents(request);
      
      // Step 2: Use AI to compose workflow from available components
      const composition = await this.composeWorkflowWithAI(request, relevantComponents);
      
      // Step 3: Generate traditional workflow structure for UI compatibility
      const workflow = this.createWorkflowFromComposition(composition, request);
      
      // Step 4: Generate UI controls based on selected components
      const uiControls = this.generateMastraUIControls(composition);

      return {
        workflow,
        mastraComposition: composition,
        uiControls
      };
    } catch (error) {
      console.error('Mastra workflow generation failed:', error);
      return this.generateFallbackMastraWorkflow(request);
    }
  }

  private discoverRelevantComponents(request: MastraWorkflowRequest): {
    tools: ComponentMetadata[];
    agents: ComponentMetadata[];
    workflows: ComponentMetadata[];
  } {
    const { intent, userInput } = request;
    
    // Get components by intent type tags
    const intentTags = this.getIntentTags(intent.type);
    let relevantComponents = {
      tools: [] as ComponentMetadata[],
      agents: [] as ComponentMetadata[],
      workflows: [] as ComponentMetadata[]
    };

    // Search by tags
    intentTags.forEach(tag => {
      const components = getComponentsByTag(tag);
      components.forEach(comp => {
        if (comp.category === 'tool' && !relevantComponents.tools.find(t => t.id === comp.id)) {
          relevantComponents.tools.push(comp);
        } else if (comp.category === 'agent' && !relevantComponents.agents.find(a => a.id === comp.id)) {
          relevantComponents.agents.push(comp);
        } else if (comp.category === 'workflow' && !relevantComponents.workflows.find(w => w.id === comp.id)) {
          relevantComponents.workflows.push(comp);
        }
      });
    });

    // Search by use cases mentioned in user input
    const useCaseComponents = getComponentsByUseCase(userInput);
    useCaseComponents.forEach(comp => {
      if (comp.category === 'tool' && !relevantComponents.tools.find(t => t.id === comp.id)) {
        relevantComponents.tools.push(comp);
      } else if (comp.category === 'agent' && !relevantComponents.agents.find(a => a.id === comp.id)) {
        relevantComponents.agents.push(comp);
      } else if (comp.category === 'workflow' && !relevantComponents.workflows.find(w => w.id === comp.id)) {
        relevantComponents.workflows.push(comp);
      }
    });

    console.log(`🔍 Discovered ${relevantComponents.tools.length} tools, ${relevantComponents.agents.length} agents, ${relevantComponents.workflows.length} workflows`);
    
    return relevantComponents;
  }

  private getIntentTags(intentType: string): string[] {
    const tagMap: Record<string, string[]> = {
      'freight_forwarding': ['freight', 'booking', 'ocean', 'air', 'carriers'],
      'warehousing': ['warehouse', '3pl', 'storage', 'fulfillment'],
      'customs': ['customs', 'clearance', 'documentation', 'compliance'],
      'tracking': ['tracking', 'visibility', 'monitoring', 'status'],
      'cross_docking': ['warehouse', 'distribution', 'coordination'],
      'inventory': ['warehouse', 'storage', 'optimization'],
      'optimization': ['optimization', 'cost', 'efficiency']
    };

    return tagMap[intentType] || ['logistics'];
  }

  private async composeWorkflowWithAI(
    request: MastraWorkflowRequest, 
    availableComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] }
  ): Promise<MastraWorkflowComposition> {
    const prompt = this.buildMastraCompositionPrompt(request, availableComponents);

    try {
      console.log('🤖 Calling Claude API for Mastra workflow composition...');
      const aiResponse = await this.callAI(prompt);
      
      if (aiResponse && aiResponse.composition) {
        return this.parseMastraComposition(aiResponse.composition, availableComponents);
      } else {
        throw new Error('Invalid AI response for Mastra composition');
      }
    } catch (error) {
      console.error('AI composition failed, using fallback:', error);
      return this.createFallbackComposition(request, availableComponents);
    }
  }

  private buildMastraCompositionPrompt(
    request: MastraWorkflowRequest,
    availableComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] }
  ): string {
    return `You are a Mastra workflow composition expert. Your task is to compose a logistics workflow using ONLY the predefined components provided below.

USER REQUEST: "${request.userInput}"
INTENT TYPE: ${request.intent.type}

AVAILABLE COMPONENTS:

TOOLS:
${availableComponents.tools.map(tool => `- ${tool.id}: ${tool.description}\n  Use cases: ${tool.useCases.join(', ')}`).join('\n')}

AGENTS:
${availableComponents.agents.map(agent => `- ${agent.id}: ${agent.description}\n  Use cases: ${agent.useCases.join(', ')}\n  Dependencies: ${agent.dependencies?.join(', ') || 'none'}`).join('\n')}

WORKFLOWS:
${availableComponents.workflows.map(workflow => `- ${workflow.id}: ${workflow.description}\n  Use cases: ${workflow.useCases.join(', ')}\n  Dependencies: ${workflow.dependencies?.join(', ') || 'none'}`).join('\n')}

COMPOSITION RULES:
1. You can ONLY use the components listed above - do NOT create new ones
2. Select 2-5 components that best address the user's request
3. Compose them into a logical workflow sequence
4. Ensure dependencies are satisfied (agents need their required tools)
5. Generate executable Mastra TypeScript code

RESPONSE FORMAT (JSON only):
\`\`\`json
{
  "composition": {
    "selectedComponents": {
      "tools": ["tool-id-1", "tool-id-2"],
      "agents": ["agent-id-1"],
      "workflows": []
    },
    "workflowSteps": [
      {
        "id": "step_1",
        "name": "Step Name",
        "component": "component-id",
        "componentType": "tool|agent|workflow",
        "parameters": {"param1": "value1"},
        "dependencies": []
      }
    ],
    "mastraCode": "// Complete TypeScript Mastra workflow code here"
  }
}
\`\`\`

Focus on creating a practical, executable workflow that solves the user's logistics challenge.`;
  }

  private async callAI(prompt: string): Promise<any> {
    if (!this._apiKey) {
      console.warn('No Anthropic API key provided, using fallback composition');
      return null;
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this._apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this._model,
          max_tokens: this._maxTokens,
          temperature: this._temperature,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const content = data.content?.[0]?.text;

      if (!content) {
        throw new Error('No content received from Claude API');
      }

      // Parse JSON response
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('Claude API call failed:', error);
      throw error;
    }
  }

  private parseMastraComposition(
    aiComposition: any,
    availableComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] }
  ): MastraWorkflowComposition {
    // Validate and parse AI composition
    const selectedComponents = {
      tools: aiComposition.selectedComponents?.tools?.map((id: string) => 
        availableComponents.tools.find(t => t.id === id)
      ).filter(Boolean) || [],
      agents: aiComposition.selectedComponents?.agents?.map((id: string) => 
        availableComponents.agents.find(a => a.id === id)
      ).filter(Boolean) || [],
      workflows: aiComposition.selectedComponents?.workflows?.map((id: string) => 
        availableComponents.workflows.find(w => w.id === id)
      ).filter(Boolean) || []
    };

    const workflowStructure = {
      steps: aiComposition.workflowSteps || []
    };

    const mastraCode = aiComposition.mastraCode || this.generateDefaultMastraCode(selectedComponents, workflowStructure);

    return {
      selectedComponents,
      workflowStructure,
      mastraCode
    };
  }

  private createFallbackComposition(
    request: MastraWorkflowRequest,
    availableComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] }
  ): MastraWorkflowComposition {
    // Create a simple fallback composition based on intent type
    const { intent } = request;
    
    let selectedComponents = {
      tools: [] as ComponentMetadata[],
      agents: [] as ComponentMetadata[],
      workflows: [] as ComponentMetadata[]
    };

    // Select components based on intent type
    switch (intent.type) {
      case 'freight_forwarding':
        selectedComponents.tools = availableComponents.tools.filter(t => 
          ['freight-booking', 'email-notification'].includes(t.id)
        );
        selectedComponents.agents = availableComponents.agents.filter(a => 
          a.id === 'freight-coordinator'
        );
        break;
      
      case 'warehousing':
        selectedComponents.tools = availableComponents.tools.filter(t => 
          ['warehouse-finder', 'email-notification'].includes(t.id)
        );
        selectedComponents.agents = availableComponents.agents.filter(a => 
          a.id === 'warehouse-manager'
        );
        break;
      
      case 'customs':
        selectedComponents.tools = availableComponents.tools.filter(t => 
          ['customs-clearance', 'email-notification'].includes(t.id)
        );
        selectedComponents.agents = availableComponents.agents.filter(a => 
          a.id === 'customs-specialist'
        );
        break;
      
      case 'tracking':
        selectedComponents.tools = availableComponents.tools.filter(t => 
          ['shipment-tracking', 'email-notification'].includes(t.id)
        );
        selectedComponents.agents = availableComponents.agents.filter(a => 
          a.id === 'tracking-coordinator'
        );
        break;
      
      default:
        // Generic fallback - select first available components
        selectedComponents.tools = availableComponents.tools.slice(0, 2);
        selectedComponents.agents = availableComponents.agents.slice(0, 1);
    }

    const workflowStructure = {
      steps: this.generateFallbackSteps(selectedComponents, intent)
    };

    const mastraCode = this.generateDefaultMastraCode(selectedComponents, workflowStructure);

    return {
      selectedComponents,
      workflowStructure,
      mastraCode
    };
  }

  private generateFallbackSteps(
    selectedComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] },
    intent: LogisticsIntent
  ): Array<{
    id: string;
    name: string;
    component: string;
    componentType: 'tool' | 'agent' | 'workflow';
    parameters: Record<string, any>;
    dependencies: string[];
  }> {
    const steps: Array<{
      id: string;
      name: string;
      component: string;
      componentType: 'tool' | 'agent' | 'workflow';
      parameters: Record<string, any>;
      dependencies: string[];
    }> = [];

    // Add agent step if available
    if (selectedComponents.agents.length > 0) {
      const agent = selectedComponents.agents[0];
      steps.push({
        id: `${agent.id}_coordination`,
        name: `${agent.name} Coordination`,
        component: agent.id,
        componentType: 'agent' as const,
        parameters: { intent: intent.type },
        dependencies: []
      });
    }

    // Add tool steps
    selectedComponents.tools.forEach((tool, index) => {
      steps.push({
        id: `${tool.id}_execution`,
        name: `${tool.name} Execution`,
        component: tool.id,
        componentType: 'tool' as const,
        parameters: {},
        dependencies: index === 0 && steps.length > 0 ? [steps[0].id] : []
      });
    });

    return steps;
  }

  private generateDefaultMastraCode(
    selectedComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] },
    workflowStructure: { steps: any[] }
  ): string {
    const imports = [
      "import { createWorkflow, createStep } from '@mastra/core/workflows';",
      "import { z } from 'zod';"
    ];

    // Add component imports
    selectedComponents.tools.forEach(tool => {
      imports.push(`import { ${tool.id.replace('-', '')}Tool } from './tools/${tool.id}';`);
    });

    selectedComponents.agents.forEach(agent => {
      imports.push(`import { ${agent.id.replace('-', '')}Agent } from './agents/${agent.id}';`);
    });

    const workflowCode = `
export const generatedLogisticsWorkflow = createWorkflow({
  id: 'generated-logistics-workflow',
  name: 'Generated Logistics Workflow',
  description: 'AI-generated workflow using Mastra components',
  inputSchema: z.object({
    userInput: z.string(),
    parameters: z.record(z.any()).optional()
  }),
  outputSchema: z.object({
    results: z.array(z.any()),
    status: z.enum(['completed', 'failed']),
    executionTime: z.string()
  })
})
${workflowStructure.steps.map((step, index) => {
  return `.then(createStep({
    id: '${step.id}',
    name: '${step.name}',
    description: 'Execute ${step.component} ${step.componentType}',
    execute: async ({ input }) => {
      // Execute ${step.component} ${step.componentType}
      console.log('Executing ${step.name}');
      return { stepResult: 'completed', timestamp: new Date().toISOString() };
    }
  }))`;
}).join('')}
.commit();`;

    return imports.join('\n') + '\n\n' + workflowCode;
  }

  private createWorkflowFromComposition(
    composition: MastraWorkflowComposition,
    request: MastraWorkflowRequest
  ): Workflow {
    const workflowId = `mastra_wf_${Date.now()}`;
    
    const steps: WorkflowStep[] = composition.workflowStructure.steps.map(step => ({
      id: step.id,
      name: step.name,
      type: step.componentType === 'agent' ? 'agent_coordination' : 'tool_execution',
      status: 'pending',
      config: {
        component: step.component,
        componentType: step.componentType,
        parameters: step.parameters
      },
      dependencies: step.dependencies
    }));

    return {
      id: workflowId,
      name: `Mastra ${request.intent.type} Workflow`,
      description: `AI-composed Mastra workflow using ${composition.selectedComponents.tools.length} tools, ${composition.selectedComponents.agents.length} agents, and ${composition.selectedComponents.workflows.length} workflows`,
      steps,
      triggers: ['manual_trigger'],
      metadata: {
        category: request.intent.type,
        estimated_duration: this.estimateMastraDuration(composition),
        complexity: this.calculateMastraComplexity(composition),
        mastraGenerated: true,
        selectedComponents: composition.selectedComponents,
        generatedAt: new Date().toISOString()
      }
    };
  }

  private generateMastraUIControls(composition: MastraWorkflowComposition): any[] {
    const controls: any[] = [];

    composition.workflowStructure.steps.forEach(step => {
      const component = this.findComponentById(step.component, composition.selectedComponents);
      if (component) {
        controls.push({
          stepId: step.id,
          stepName: step.name,
          componentType: step.componentType,
          componentName: component.name,
          controls: this.generateComponentControls(component, step.parameters)
        });
      }
    });

    return controls;
  }

  private findComponentById(
    id: string, 
    selectedComponents: { tools: ComponentMetadata[]; agents: ComponentMetadata[]; workflows: ComponentMetadata[] }
  ): ComponentMetadata | undefined {
    return [...selectedComponents.tools, ...selectedComponents.agents, ...selectedComponents.workflows]
      .find(comp => comp.id === id);
  }

  private generateComponentControls(component: ComponentMetadata, parameters: Record<string, any>): any[] {
    // Generate UI controls based on component type and metadata
    const controls = [];

    if (component.category === 'tool') {
      // Tool-specific controls
      switch (component.id) {
        case 'freight-booking':
          controls.push(
            { type: 'input', label: 'Origin', id: 'origin', required: true },
            { type: 'input', label: 'Destination', id: 'destination', required: true },
            { type: 'select', label: 'Cargo Type', id: 'cargoType', options: [
              { value: 'FCL', label: 'Full Container Load' },
              { value: 'LCL', label: 'Less than Container Load' },
              { value: 'Air', label: 'Air Freight' },
              { value: 'Road', label: 'Road Transport' }
            ]},
            { type: 'checkbox', label: 'Include Insurance', id: 'includeInsurance', value: true }
          );
          break;
        
        case 'warehouse-finder':
          controls.push(
            { type: 'input', label: 'Location', id: 'location', required: true },
            { type: 'select', label: 'Storage Type', id: 'storageType', options: [
              { value: 'ambient', label: 'Ambient' },
              { value: 'refrigerated', label: 'Refrigerated' },
              { value: 'frozen', label: 'Frozen' },
              { value: 'hazmat', label: 'Hazmat' }
            ]},
            { type: 'input', label: 'Min Capacity (sq ft)', id: 'minCapacity', required: true }
          );
          break;
        
        default:
          controls.push({ type: 'display', label: 'Component Configuration', value: component.description });
      }
    } else if (component.category === 'agent') {
      // Agent-specific controls
      controls.push(
        { type: 'display', label: 'Agent', value: `${component.name} will coordinate this step automatically` },
        { type: 'textarea', label: 'Special Instructions', id: 'instructions', placeholder: 'Any special instructions for the agent...' }
      );
    }

    return controls;
  }

  private estimateMastraDuration(composition: MastraWorkflowComposition): string {
    const stepCount = composition.workflowStructure.steps.length;
    const hasAgents = composition.selectedComponents.agents.length > 0;
    const hasComplexTools = composition.selectedComponents.tools.some(t => 
      ['customs-clearance', 'freight-booking'].includes(t.id)
    );

    let baseMinutes = stepCount * 2; // 2 minutes per step
    if (hasAgents) baseMinutes += 5; // Agents add coordination time
    if (hasComplexTools) baseMinutes += 10; // Complex tools take longer

    return `${baseMinutes}-${baseMinutes + 5} minutes`;
  }

  private calculateMastraComplexity(composition: MastraWorkflowComposition): 'low' | 'medium' | 'high' {
    const componentCount = composition.selectedComponents.tools.length + 
                          composition.selectedComponents.agents.length + 
                          composition.selectedComponents.workflows.length;
    
    const stepCount = composition.workflowStructure.steps.length;
    const hasMultipleAgents = composition.selectedComponents.agents.length > 1;
    const hasWorkflows = composition.selectedComponents.workflows.length > 0;

    if (componentCount <= 2 && stepCount <= 3 && !hasMultipleAgents && !hasWorkflows) {
      return 'low';
    } else if (componentCount <= 4 && stepCount <= 6) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private generateFallbackMastraWorkflow(request: MastraWorkflowRequest): {
    workflow: Workflow;
    mastraComposition: MastraWorkflowComposition;
    uiControls: any[];
  } {
    // Simple fallback when everything fails
    const availableComponents = {
      tools: getAllComponents().filter(c => c.category === 'tool'),
      agents: getAllComponents().filter(c => c.category === 'agent'),
      workflows: getAllComponents().filter(c => c.category === 'workflow')
    };

    const composition = this.createFallbackComposition(request, availableComponents);
    const workflow = this.createWorkflowFromComposition(composition, request);
    const uiControls = this.generateMastraUIControls(composition);

    return { workflow, mastraComposition: composition, uiControls };
  }
}

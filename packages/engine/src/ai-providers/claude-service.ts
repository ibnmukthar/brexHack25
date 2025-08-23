import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { AIProvider, WorkflowTemplate, ParameterSchema } from './ai-provider-interface';
import { LogisticsIntent, Workflow, WorkflowStep } from '../types';

const LogisticsIntentSchema = z.object({
  type: z.enum(['tracking', 'optimization', 'carrier_selection', 'inventory', 'return_processing']),
  entities: z.record(z.any()),
  priority: z.enum(['low', 'medium', 'high']),
  constraints: z.object({
    timeWindow: z.string().optional(),
    costLimit: z.number().optional(),
    serviceLevel: z.string().optional(),
    costPriority: z.enum(['minimize', 'maximize']).optional(),
    timePriority: z.enum(['minimize', 'maximize']).optional(),
  }).optional(),
});

export class ClaudeService implements AIProvider {
  public readonly name = 'claude';
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  async parseIntent(input: string): Promise<LogisticsIntent> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Parse this logistics request into a structured intent. Return only valid JSON.

Input: "${input}"

Extract:
- type: one of [tracking, optimization, carrier_selection, inventory, return_processing]
- entities: key-value pairs of relevant entities (shipment_id, warehouse, items, etc.)
- priority: low, medium, or high
- constraints: optional time/cost constraints

Example output:
{
  "type": "inventory",
  "entities": {
    "warehouse": "WH001",
    "threshold": 20
  },
  "priority": "medium",
  "constraints": {
    "timeWindow": "24h"
  }
}

Return only the JSON object:`
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return LogisticsIntentSchema.parse(parsed);
    } catch (error) {
      console.error('Error parsing intent with Claude:', error);
      // Fallback to basic parsing
      return this.fallbackParseIntent(input);
    }
  }

  async generateWorkflow(intent: LogisticsIntent, template: WorkflowTemplate): Promise<Workflow> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `Generate a workflow based on this intent and template. Return only valid JSON.

Intent: ${JSON.stringify(intent)}
Template: ${JSON.stringify(template)}

Create a workflow with:
- Unique ID
- Descriptive name
- Clear description
- Steps based on template but customized for intent
- Metadata with estimated duration

Return only the JSON workflow object:`
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return this.validateWorkflow(parsed);
    } catch (error) {
      console.error('Error generating workflow with Claude:', error);
      // Fallback to template-based generation
      return this.fallbackGenerateWorkflow(intent, template);
    }
  }

  async extractParameters(workflow: Workflow): Promise<ParameterSchema[]> {
    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Extract configurable parameters from this workflow. Return only valid JSON array.

Workflow: ${JSON.stringify(workflow)}

For each configurable value in the workflow steps, create a parameter with:
- name: parameter identifier
- type: string, number, boolean, select, multi-select
- label: human-readable label
- required: boolean
- default: default value if any
- options: array for select types
- ui_hint: slider, dropdown, input, checkbox

Return only the JSON array of parameters:`
          }
        ]
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in Claude response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error extracting parameters with Claude:', error);
      // Fallback to basic parameter extraction
      return this.fallbackExtractParameters(workflow);
    }
  }

  private fallbackParseIntent(input: string): LogisticsIntent {
    const lowerInput = input.toLowerCase();
    
    let type: LogisticsIntent['type'] = 'inventory';
    if (lowerInput.includes('track') || lowerInput.includes('shipment')) {
      type = 'tracking';
    } else if (lowerInput.includes('optimize') || lowerInput.includes('route')) {
      type = 'optimization';
    } else if (lowerInput.includes('carrier') || lowerInput.includes('shipping')) {
      type = 'carrier_selection';
    } else if (lowerInput.includes('return')) {
      type = 'return_processing';
    }

    return {
      type,
      entities: { input },
      priority: 'medium',
      constraints: {}
    };
  }

  private fallbackGenerateWorkflow(intent: LogisticsIntent, template: WorkflowTemplate): Workflow {
    const workflowId = `workflow_${Date.now()}`;
    
    const steps: WorkflowStep[] = template.steps.map((stepTemplate, index) => ({
      id: `${stepTemplate.id}_${index}`,
      name: stepTemplate.name,
      type: stepTemplate.type,
      status: 'pending',
      config: stepTemplate.config,
      dependencies: index > 0 ? [`${template.steps[index - 1].id}_${index - 1}`] : undefined
    }));

    return {
      id: workflowId,
      name: `${template.name} - ${intent.type}`,
      description: `Generated workflow for ${intent.type} based on ${template.name}`,
      steps,
      metadata: {
        template_id: template.id,
        intent_type: intent.type,
        created_at: new Date().toISOString(),
        estimated_duration: '5-10 minutes'
      }
    };
  }

  private fallbackExtractParameters(workflow: Workflow): ParameterSchema[] {
    const parameters: ParameterSchema[] = [];
    
    // Extract common parameters from workflow config
    workflow.steps.forEach(step => {
      if (step.config) {
        Object.entries(step.config).forEach(([key, value]) => {
          if (typeof value === 'string' && value.includes('{{') && value.includes('}}')) {
            const paramName = value.replace(/[{}]/g, '');
            if (!parameters.find(p => p.name === paramName)) {
              parameters.push({
                name: paramName,
                type: 'string',
                label: this.humanizeParameterName(paramName),
                required: false
              });
            }
          }
        });
      }
    });

    return parameters;
  }

  private validateWorkflow(workflow: any): Workflow {
    // Basic validation and cleanup
    return {
      id: workflow.id || `workflow_${Date.now()}`,
      name: workflow.name || 'Generated Workflow',
      description: workflow.description || 'Auto-generated workflow',
      steps: Array.isArray(workflow.steps) ? workflow.steps : [],
      triggers: workflow.triggers,
      metadata: workflow.metadata || {}
    };
  }

  private humanizeParameterName(paramName: string): string {
    return paramName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }
}

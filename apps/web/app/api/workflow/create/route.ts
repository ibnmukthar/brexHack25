import { NextRequest, NextResponse } from 'next/server';
import { LogisticsEngine } from '@logistics/engine';

export async function POST(request: NextRequest) {
  try {
    const { input, useAI = true, framework = 'mastra' } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      );
    }

    const engine = new LogisticsEngine();

    // Use enhanced AI workflow generation with Mastra-style component information
    let workflow;
    if (useAI) {
      console.log('🤖 Using AI workflow generation with component composition');
      workflow = await engine.createAIWorkflow(input);

      // Add Mastra-style component information for demonstration
      if (framework === 'mastra') {
        workflow.framework = 'mastra';
        workflow.mastraComposition = generateMastraStyleComposition(workflow, input);
      }
    } else {
      console.log('📝 Using basic workflow generation');
      workflow = await engine.createWorkflow(input);
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Workflow creation error:', error);

    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

// Helper function to generate Mastra-style composition information
function generateMastraStyleComposition(workflow: any, input: string) {
  // Analyze the input to determine relevant components
  const lowerInput = input.toLowerCase();

  const selectedComponents = {
    tools: [] as any[],
    agents: [] as any[],
    workflows: [] as any[]
  };

  // Determine tools based on input using new generic components
  if (lowerInput.includes('api') || lowerInput.includes('integration') || lowerInput.includes('connect')) {
    selectedComponents.tools.push({ id: 'api-connector', name: 'API Connector' });
  }
  if (lowerInput.includes('data') || lowerInput.includes('process') || lowerInput.includes('analyze') || lowerInput.includes('transform')) {
    selectedComponents.tools.push({ id: 'data-processor', name: 'Data Processor' });
  }
  if (lowerInput.includes('document') || lowerInput.includes('validate') || lowerInput.includes('pdf') || lowerInput.includes('file')) {
    selectedComponents.tools.push({ id: 'document-handler', name: 'Document Handler' });
  }
  if (lowerInput.includes('notification') || lowerInput.includes('alert') || lowerInput.includes('email') || lowerInput.includes('notify')) {
    selectedComponents.tools.push({ id: 'notification-sender', name: 'Notification Sender' });
  }

  // Default to API connector and notification sender if no specific tools identified
  if (selectedComponents.tools.length === 0) {
    selectedComponents.tools.push({ id: 'api-connector', name: 'API Connector' });
    selectedComponents.tools.push({ id: 'notification-sender', name: 'Notification Sender' });
  }

  // Determine agents based on workflow type using new generic agents
  if (lowerInput.includes('coordinate') || lowerInput.includes('manage') || lowerInput.includes('orchestrate') || lowerInput.includes('logistics')) {
    selectedComponents.agents.push({ id: 'logistics-coordinator', name: 'Logistics Coordinator' });
  }
  if (lowerInput.includes('analyze') || lowerInput.includes('data') || lowerInput.includes('performance') || lowerInput.includes('metrics')) {
    selectedComponents.agents.push({ id: 'data-analyst', name: 'Data Analyst' });
  }
  if (lowerInput.includes('process') || lowerInput.includes('workflow') || lowerInput.includes('automation') || lowerInput.includes('optimize')) {
    selectedComponents.agents.push({ id: 'process-manager', name: 'Process Manager' });
  }

  // Default to logistics coordinator for general logistics tasks
  if (selectedComponents.agents.length === 0) {
    selectedComponents.agents.push({ id: 'logistics-coordinator', name: 'Logistics Coordinator' });
  }

  // Generate workflow steps based on the actual workflow
  const workflowStructure = {
    steps: workflow.workflow.steps.map((step: any, index: number) => ({
      id: step.id,
      name: step.name,
      component: selectedComponents.tools[index % selectedComponents.tools.length]?.id || 'generic-tool',
      componentType: index === 0 && selectedComponents.agents.length > 0 ? 'agent' : 'tool',
      parameters: step.config || {},
      dependencies: step.dependencies || []
    }))
  };

  // Generate simplified Mastra-style TypeScript code
  const mastraCode = generateMastraCode(selectedComponents, workflowStructure, input);

  return {
    selectedComponents,
    workflowStructure,
    mastraCode
  };
}

function generateMastraCode(selectedComponents: any, workflowStructure: any, input: string): string {
  const imports = [
    "import { createWorkflow, createStep } from '@mastra/core/workflows';",
    "import { z } from 'zod';"
  ];

  // Add component imports
  selectedComponents.tools.forEach((tool: any) => {
    const importName = tool.id.replace(/-/g, '').charAt(0).toLowerCase() + tool.id.replace(/-/g, '').slice(1) + 'Tool';
    imports.push(`import { ${importName} } from './tools/${tool.id}';`);
  });

  selectedComponents.agents.forEach((agent: any) => {
    const importName = agent.id.replace(/-/g, '').charAt(0).toLowerCase() + agent.id.replace(/-/g, '').slice(1) + 'Agent';
    imports.push(`import { ${importName} } from './agents/${agent.id}';`);
  });

  const workflowCode = `
/**
 * Generated Mastra Workflow for: ${input}
 * Components: ${selectedComponents.tools.length} tools, ${selectedComponents.agents.length} agents
 */
export const generatedLogisticsWorkflow = createWorkflow({
  id: 'generated-logistics-workflow',
  name: 'Generated Logistics Workflow',
  description: 'AI-generated workflow using Mastra component composition',
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
${workflowStructure.steps.map((step: any, index: number) => {
  return `.then(createStep({
    id: '${step.id}',
    name: '${step.name}',
    description: 'Execute ${step.component} ${step.componentType}',
    execute: async ({ input }) => {
      // Execute ${step.component} ${step.componentType}
      console.log('Executing ${step.name} with ${step.component}');

      // Simulate component execution
      const componentName = '${step.component.replace(/-/g, '').charAt(0).toLowerCase() + step.component.replace(/-/g, '').slice(1)}${step.componentType === 'agent' ? 'Agent' : 'Tool'}';
      const result = await ${step.component.replace(/-/g, '').charAt(0).toLowerCase() + step.component.replace(/-/g, '').slice(1)}${step.componentType === 'agent' ? 'Agent' : 'Tool'}.execute(input);

      return {
        stepResult: result,
        timestamp: new Date().toISOString(),
        component: '${step.component}',
        componentType: '${step.componentType}'
      };
    }
  }))`;
}).join('')}
.commit();

// Execute the workflow
export async function executeWorkflow(input: any) {
  return await generatedLogisticsWorkflow.execute(input);
}`;

  return imports.join('\n') + '\n\n' + workflowCode;
}

export async function GET() {
  return NextResponse.json({
    message: 'Workflow API is running',
    version: '1.0.0',
    endpoints: {
      create: 'POST /api/workflow/create',
      execute: 'POST /api/workflow/{id}/execute'
    }
  });
}
import { LogisticsIntent, Workflow, WorkflowStep } from './types';

export interface AIWorkflowRequest {
  intent: LogisticsIntent;
  userInput: string;
  context?: {
    previousWorkflows?: string[];
    constraints?: Record<string, any>;
    preferences?: Record<string, any>;
  };
}

export interface LangGraphNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'action' | 'condition' | 'parallel' | 'human';
  function: string;
  inputs: string[];
  outputs: string[];
  code: string;
  position?: { x: number; y: number };
}

export interface LangGraphEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface LangGraphWorkflow {
  nodes: LangGraphNode[];
  edges: LangGraphEdge[];
  code: string;
  entryPoint: string;
  exitPoint: string;
}

export class AIWorkflowGenerator {
  private _apiKey: string;
  private _model: string;
  private _maxTokens: number;
  private _temperature: number;

  constructor(apiKey?: string) {
    this._apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this._model = process.env.WORKFLOW_MODEL || 'claude-3-5-sonnet-latest';
    this._maxTokens = parseInt(process.env.WORKFLOW_MAX_TOKENS || '4000');
    this._temperature = parseFloat(process.env.WORKFLOW_TEMPERATURE || '0.1');

    // Log API availability (without exposing key)
    console.log('🔑 API Key available:', this._apiKey ? `Yes (${this._apiKey.substring(0, 10)}...)` : 'No');
    console.log('🤖 Model:', this._model);
    console.log('📊 Max tokens:', this._maxTokens);
    console.log('🌡️ Temperature:', this._temperature);
  }

  async generateDynamicWorkflow(request: AIWorkflowRequest): Promise<{
    workflow: Workflow;
    langGraph: LangGraphWorkflow;
    uiControls: any[];
  }> {
    const prompt = this.buildWorkflowPrompt(request);

    try {
      console.log('🤖 Calling Claude API for workflow generation...');
      const aiResponse = await this.callAI(prompt);
      console.log('✅ Claude API response received');

      const workflow = this.parseWorkflowFromAI(aiResponse, request);

      // Use Claude-generated LangGraph code if available
      const langGraph = aiResponse?.langGraphCode
        ? this.createLangGraphFromAICode(aiResponse.langGraphCode, workflow)
        : this.generateLangGraphFromWorkflow(workflow);

      const uiControls = this.generateDynamicUIControls(workflow);

      return {
        workflow,
        langGraph,
        uiControls
      };
    } catch (error) {
      console.error('AI workflow generation failed:', error);
      // Fallback to enhanced dynamic generation
      return this.generateFallbackWorkflow(request);
    }
  }

  private createLangGraphFromAICode(aiCode: string, workflow: Workflow): LangGraphWorkflow {
    // Create nodes from workflow steps
    const nodes: LangGraphNode[] = [];
    const edges: LangGraphEdge[] = [];

    // Add start node
    nodes.push({
      id: 'start',
      name: 'Start',
      type: 'start',
      function: 'initialize_workflow',
      inputs: [],
      outputs: ['workflow_context'],
      code: 'def initialize_workflow(input_data): return {"context": input_data}',
      position: { x: 100, y: 100 }
    });

    // Generate nodes for each workflow step
    workflow.steps.forEach((step, index) => {
      const node = this.createLangGraphNode(step, index);
      nodes.push(node);

      // Create edge from previous node
      const sourceId = index === 0 ? 'start' : workflow.steps[index - 1].id;
      edges.push({
        id: `edge_${sourceId}_${step.id}`,
        source: sourceId,
        target: step.id,
        label: `Step ${index + 1}`
      });
    });

    // Add end node
    nodes.push({
      id: 'end',
      name: 'Complete',
      type: 'end',
      function: 'finalize_workflow',
      inputs: ['results'],
      outputs: [],
      code: 'def finalize_workflow(results): return {"completed": True, "results": results}',
      position: { x: 100 + (workflow.steps.length + 1) * 200, y: 100 }
    });

    // Edge to end node
    const lastStep = workflow.steps[workflow.steps.length - 1];
    edges.push({
      id: `edge_${lastStep.id}_end`,
      source: lastStep.id,
      target: 'end',
      label: 'Complete'
    });

    return {
      nodes,
      edges,
      code: aiCode, // Use Claude-generated code
      entryPoint: 'start',
      exitPoint: 'end'
    };
  }

  private buildWorkflowPrompt(request: AIWorkflowRequest): string {
    const requirements = this.extractRequirements(request.userInput);

    return `You are an expert logistics workflow automation system. Generate a detailed, executable workflow for the following request:

USER INPUT: "${request.userInput}"
INTENT TYPE: ${request.intent.type}
PRIORITY: ${request.intent.priority}
ENTITIES: ${JSON.stringify(request.intent.entities)}
EXTRACTED REQUIREMENTS: ${JSON.stringify(requirements)}

Generate a comprehensive logistics workflow with the following specifications:

1. WORKFLOW STRUCTURE:
   - Create 3-8 specific, actionable steps
   - Each step must have realistic logistics operations
   - Include proper dependencies between steps
   - Specify exact API calls, data processing, and decision points
   - Include error handling and validation steps

2. STEP TYPES TO USE:
   - requirements_analysis: For analyzing shipment/logistics requirements
   - api_aggregation: For querying multiple providers (3PLs, freight forwarders)
   - decision_matrix: For comparing options with weighted criteria
   - api_call: For executing bookings, transactions, or API operations
   - validation: For document/data validation
   - financial_calculation: For cost calculations, duties, taxes
   - tracking: For monitoring and status updates
   - logistics_coordination: For coordinating carriers, warehouses, etc.

3. PROVIDER INTEGRATION:
   For ${request.intent.type}, consider these providers:
   ${this.getRelevantProviders(request.intent.type)}

4. RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure:

\`\`\`json
{
  "workflowAnalysis": {
    "complexity": "low|medium|high",
    "estimatedDuration": "X-Y minutes",
    "keyRequirements": ["requirement1", "requirement2"],
    "recommendedProviders": ["provider1", "provider2"]
  },
  "workflowSteps": [
    {
      "id": "step_id",
      "name": "Step Name",
      "type": "step_type",
      "description": "What this step does",
      "config": {
        "parameters": ["param1", "param2"],
        "providers": ["provider1"] // if applicable
      },
      "dependencies": ["previous_step_id"] // if applicable
    }
  ],
  "langGraphCode": "# Python LangGraph code for this workflow\\nfrom langgraph import StateGraph\\n# ... complete executable code"
}
\`\`\`

Focus specifically on ${request.intent.type} logistics operations. Be detailed and realistic.`;
  }

  private getRelevantProviders(intentType: string): string {
    const providerMap: Record<string, string[]> = {
      'freight_forwarding': ['Kuehne + Nagel', 'Expeditors', 'Flexport', 'DHL Global Forwarding'],
      'warehousing': ['DHL Supply Chain', 'C.H. Robinson', 'Prologis', 'Ryder'],
      'customs': ['Expeditors (customs brokerage)', 'CH Robinson (customs)', 'Flexport (customs)'],
      'consolidation': ['C.H. Robinson (LTL)', 'FedEx Freight', 'UPS Freight', 'Old Dominion'],
      'port_management': ['Port Authority APIs', 'Vessel tracking systems', 'Terminal operators'],
      'compliance': ['Regulatory databases', 'Certification bodies', 'Audit systems'],
      'cross_docking': ['WMS providers', 'Dock scheduling systems', 'Sortation systems'],
      'tracking': ['Carrier APIs', 'GPS tracking', 'IoT sensors'],
      'optimization': ['Route optimization engines', 'Load planning systems'],
      'carrier_selection': ['Multi-carrier platforms', 'Rate shopping engines'],
      'inventory': ['WMS systems', 'ERP integrations', 'Demand forecasting'],
      'return_processing': ['Reverse logistics providers', 'Return management systems']
    };

    const providers = providerMap[intentType] || ['Generic logistics providers'];
    return providers.join(', ');
  }

  private async callAI(prompt: string): Promise<any> {
    if (!this._apiKey) {
      console.warn('No Anthropic API key provided, falling back to mock generation');
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        workflow: null,
        reasoning: "Mock AI-generated workflow (no API key)",
        confidence: 0.85
      };
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

      // Try to parse JSON response from Claude
      try {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }

        // If no JSON block, try to parse the entire content
        return JSON.parse(content);
      } catch (parseError) {
        console.warn('Failed to parse Claude response as JSON, using text analysis');
        return {
          workflow: null,
          reasoning: content,
          confidence: 0.90,
          rawResponse: content
        };
      }
    } catch (error) {
      console.error('Claude API call failed:', error);
      // Fallback to mock generation
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        workflow: null,
        reasoning: `Fallback generation due to API error: ${error}`,
        confidence: 0.75,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private parseWorkflowFromAI(aiResponse: any, request: AIWorkflowRequest): Workflow {
    const workflowId = `ai_wf_${Date.now()}`;

    // Try to use AI-generated steps if available
    let steps: WorkflowStep[] = [];
    let workflowName = this.generateWorkflowName(request);
    let workflowDescription = this.generateWorkflowDescription(request);
    let estimatedDuration = '';
    let complexity: 'low' | 'medium' | 'high' = 'medium';

    if (aiResponse && aiResponse.workflowSteps && Array.isArray(aiResponse.workflowSteps)) {
      // Use AI-generated steps
      steps = aiResponse.workflowSteps.map((step: any, index: number) => ({
        id: step.id || `ai_step_${index + 1}`,
        name: step.name || `Step ${index + 1}`,
        type: step.type || 'api_call',
        status: 'pending' as const,
        config: step.config || {},
        dependencies: step.dependencies || (index > 0 ? [aiResponse.workflowSteps[index - 1].id] : undefined)
      }));

      // Use AI analysis if available
      if (aiResponse.workflowAnalysis) {
        const analysis = aiResponse.workflowAnalysis;
        estimatedDuration = analysis.estimatedDuration || this.estimateDuration(steps);
        complexity = analysis.complexity || this.calculateComplexity(steps);

        if (analysis.keyRequirements && analysis.keyRequirements.length > 0) {
          workflowDescription = `AI-generated workflow addressing: ${analysis.keyRequirements.join(', ')}. ${workflowDescription}`;
        }
      }
    } else {
      // Fallback to dynamic generation
      console.log('Using fallback step generation - AI response not structured correctly');
      steps = this.generateDynamicSteps(request);
      estimatedDuration = this.estimateDuration(steps);
      complexity = this.calculateComplexity(steps);
    }

    return {
      id: workflowId,
      name: workflowName,
      description: workflowDescription,
      steps,
      triggers: this.generateTriggers(request),
      metadata: {
        category: request.intent.type,
        estimated_duration: estimatedDuration,
        complexity,
        aiGenerated: true,
        confidence: aiResponse?.confidence || 0.90,
        generatedAt: new Date().toISOString(),
        aiAnalysis: aiResponse?.workflowAnalysis || null,
        rawAIResponse: aiResponse?.rawResponse || null
      }
    };
  }

  private generateDynamicSteps(request: AIWorkflowRequest): WorkflowStep[] {
    const { intent, userInput } = request;

    // Analyze user input for specific requirements
    const requirements = this.extractRequirements(userInput);
    const entities = intent.entities || {};
    
    // Generate steps based on intent type and extracted requirements
    switch (intent.type) {
      case 'freight_forwarding':
        return this.generateFreightForwardingSteps(requirements, entities);
      case 'warehousing':
        return this.generateWarehousingSteps(requirements, entities);
      case 'customs':
        return this.generateCustomsSteps(requirements, entities);
      case 'consolidation':
        return this.generateConsolidationSteps(requirements, entities);
      case 'port_management':
        return this.generatePortManagementSteps(requirements, entities);
      case 'compliance':
        return this.generateComplianceSteps(requirements, entities);
      case 'cross_docking':
        return this.generateCrossDockingSteps(requirements, entities);
      case 'tracking':
        return this.generateTrackingSteps(requirements, entities);
      case 'optimization':
        return this.generateOptimizationSteps(requirements, entities);
      case 'carrier_selection':
        return this.generateCarrierSelectionSteps(requirements, entities);
      case 'inventory':
        return this.generateInventorySteps(requirements, entities);
      case 'return_processing':
        return this.generateReturnProcessingSteps(requirements, entities);
      default:
        return this.generateGenericSteps(requirements, entities);
    }
  }

  private extractRequirements(userInput: string): Record<string, any> {
    const requirements: Record<string, any> = {};
    
    // Extract locations
    const locationRegex = /(?:from|to|in|at)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
    const locations = [];
    let match;
    while ((match = locationRegex.exec(userInput)) !== null) {
      locations.push(match[1]);
    }
    if (locations.length > 0) requirements.locations = locations;
    
    // Extract quantities and weights
    const quantityRegex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(containers?|packages?|shipments?|lbs?|kg|tons?|sq\s*ft|pallets?)/gi;
    const quantities = [];
    while ((match = quantityRegex.exec(userInput)) !== null) {
      quantities.push({ value: match[1], unit: match[2] });
    }
    if (quantities.length > 0) requirements.quantities = quantities;
    
    // Extract time constraints
    const timeRegex = /(?:within|by|in)\s+(\d+)\s*(days?|hours?|weeks?|months?)/gi;
    while ((match = timeRegex.exec(userInput)) !== null) {
      requirements.timeConstraint = { value: parseInt(match[1]), unit: match[2] };
    }
    
    // Extract cost preferences
    if (userInput.toLowerCase().includes('cost') || userInput.toLowerCase().includes('cheap') || userInput.toLowerCase().includes('savings')) {
      requirements.costOptimization = true;
    }
    
    // Extract speed preferences
    if (userInput.toLowerCase().includes('fast') || userInput.toLowerCase().includes('urgent') || userInput.toLowerCase().includes('express')) {
      requirements.speedOptimization = true;
    }
    
    // Extract specific providers
    const providerRegex = /(?:flexport|kuehne|nagel|expeditors|dhl|robinson|ups|fedex|maersk)/gi;
    const providers = [];
    while ((match = providerRegex.exec(userInput)) !== null) {
      providers.push(match[0].toLowerCase());
    }
    if (providers.length > 0) requirements.preferredProviders = providers;
    
    return requirements;
  }

  private generateWorkflowName(request: AIWorkflowRequest): string {
    const { intent, userInput } = request;
    const requirements = this.extractRequirements(userInput);
    
    // Generate dynamic names based on content
    const baseNames = {
      freight_forwarding: 'International Freight Coordination',
      warehousing: '3PL Warehouse Management',
      customs: 'Customs Clearance Processing',
      consolidation: 'Shipment Consolidation',
      port_management: 'Port Operations Management',
      compliance: 'Regulatory Compliance Audit',
      cross_docking: 'Cross-Dock Operations',
      tracking: 'Shipment Tracking System',
      optimization: 'Logistics Optimization',
      carrier_selection: 'Carrier Selection Process',
      inventory: 'Inventory Management',
      return_processing: 'Return Processing System'
    };
    
    let name = baseNames[intent.type] || 'Logistics Workflow';
    
    // Add specific details from requirements
    if (requirements.locations && requirements.locations.length > 0) {
      name += ` - ${requirements.locations.join(' to ')}`;
    }
    
    if (requirements.quantities && requirements.quantities.length > 0) {
      const qty = requirements.quantities[0];
      name += ` (${qty.value} ${qty.unit})`;
    }
    
    return name;
  }

  private generateWorkflowDescription(request: AIWorkflowRequest): string {
    const requirements = this.extractRequirements(request.userInput);
    
    let description = `AI-generated workflow for ${request.intent.type} operations. `;
    
    if (requirements.locations) {
      description += `Handling logistics between ${requirements.locations.join(', ')}. `;
    }
    
    if (requirements.costOptimization) {
      description += 'Optimized for cost efficiency. ';
    }
    
    if (requirements.speedOptimization) {
      description += 'Prioritizing speed and urgency. ';
    }
    
    if (requirements.preferredProviders) {
      description += `Integrating with ${requirements.preferredProviders.join(', ')}. `;
    }
    
    description += 'Dynamically generated based on natural language requirements.';
    
    return description;
  }

  private generateFreightForwardingSteps(requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    // Dynamic step 1: Requirements analysis
    steps.push({
      id: 'analyze_shipment_requirements',
      name: 'Analyze Shipment Requirements',
      type: 'requirements_analysis',
      status: 'pending',
      config: {
        parameters: this.getRequiredParameters(requirements),
        validation: {
          required: ['origin', 'destination', 'cargo_details'],
          optional: ['timeline', 'budget', 'special_requirements']
        }
      }
    });

    // Dynamic step 2: Provider selection based on user preferences
    const providers = requirements.preferredProviders || ['kuehne_nagel', 'expeditors', 'flexport'];
    steps.push({
      id: 'query_freight_forwarders',
      name: `Query ${providers.length} Freight Forwarders`,
      type: 'api_aggregation',
      status: 'pending',
      config: {
        providers: providers,
        services: this.determineServices(requirements),
        filters: this.buildFilters(requirements)
      },
      dependencies: ['analyze_shipment_requirements']
    });

    // Dynamic step 3: Comparison with weighted criteria
    const criteria = this.determineCriteria(requirements);
    steps.push({
      id: 'compare_options',
      name: 'Compare Service Options',
      type: 'decision_matrix',
      status: 'pending',
      config: {
        criteria: criteria.names,
        weights: criteria.weights,
        scoring_method: 'weighted_average'
      },
      dependencies: ['query_freight_forwarders']
    });

    // Dynamic step 4: Booking with specific requirements
    steps.push({
      id: 'execute_booking',
      name: 'Execute Freight Booking',
      type: 'api_call',
      status: 'pending',
      config: {
        action: 'create_booking',
        include_insurance: requirements.insurance !== false,
        documentation_required: true,
        tracking_enabled: true
      },
      dependencies: ['compare_options']
    });

    return steps;
  }

  private generateWarehousingSteps(requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    steps.push({
      id: 'assess_storage_requirements',
      name: 'Assess Storage Requirements',
      type: 'requirements_analysis',
      status: 'pending',
      config: {
        parameters: ['storage_type', 'capacity_needed', 'location_preferences', 'duration'],
        capacity_analysis: requirements.quantities || [],
        location_constraints: requirements.locations || []
      }
    });

    const providers = requirements.preferredProviders || ['dhl_supply_chain', 'ch_robinson', 'prologis'];
    steps.push({
      id: 'query_3pl_providers',
      name: `Evaluate ${providers.length} 3PL Providers`,
      type: 'api_aggregation',
      status: 'pending',
      config: {
        providers: providers,
        services: ['warehousing', 'distribution', 'value_added_services'],
        location_filter: requirements.locations
      },
      dependencies: ['assess_storage_requirements']
    });

    steps.push({
      id: 'facility_evaluation',
      name: 'Evaluate Warehouse Facilities',
      type: 'decision_matrix',
      status: 'pending',
      config: {
        criteria: ['cost_per_sqft', 'location_score', 'capacity_match', 'technology_level', 'sla_rating'],
        weights: this.getWarehousingWeights(requirements)
      },
      dependencies: ['query_3pl_providers']
    });

    if (requirements.costOptimization) {
      steps.push({
        id: 'negotiate_terms',
        name: 'Negotiate Contract Terms',
        type: 'negotiation',
        status: 'pending',
        config: {
          focus_areas: ['pricing', 'volume_discounts', 'sla_terms'],
          target_savings: '15-25%'
        },
        dependencies: ['facility_evaluation']
      });
    }

    return steps;
  }

  private generateCustomsSteps(requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    const steps: WorkflowStep[] = [];

    steps.push({
      id: 'document_validation',
      name: 'Validate Import Documentation',
      type: 'validation',
      status: 'pending',
      config: {
        required_docs: this.getRequiredDocs(requirements),
        compliance_checks: ['ctpat', 'ams', 'isf'],
        auto_generation: true
      }
    });

    steps.push({
      id: 'tariff_classification',
      name: 'Classify Goods & Calculate Duties',
      type: 'financial_calculation',
      status: 'pending',
      config: {
        classification_system: 'hts',
        duty_calculation: 'automated',
        tax_types: ['import_duty', 'vat', 'excise_tax']
      },
      dependencies: ['document_validation']
    });

    steps.push({
      id: 'customs_filing',
      name: 'Submit Customs Entry',
      type: 'api_call',
      status: 'pending',
      config: {
        system: 'ace_portal',
        entry_type: this.determineEntryType(requirements),
        broker_integration: true
      },
      dependencies: ['tariff_classification']
    });

    steps.push({
      id: 'clearance_monitoring',
      name: 'Monitor Clearance Progress',
      type: 'tracking',
      status: 'pending',
      config: {
        monitoring_frequency: '15_minutes',
        escalation_rules: ['examination_hold', 'document_request', 'payment_due'],
        notifications: ['email', 'sms', 'webhook']
      },
      dependencies: ['customs_filing']
    });

    return steps;
  }

  private getRequiredParameters(requirements: Record<string, any>): string[] {
    const params = ['origin', 'destination'];

    if (requirements.quantities) params.push('weight', 'dimensions');
    if (requirements.timeConstraint) params.push('timeline');
    if (requirements.costOptimization) params.push('budget_constraints');
    if (requirements.locations) params.push('route_preferences');

    return params;
  }

  private determineServices(requirements: Record<string, any>): string[] {
    const services = ['ocean_freight'];

    if (requirements.speedOptimization) services.push('air_freight');
    if (requirements.quantities?.some((q: any) => q.unit.includes('container'))) {
      services.push('fcl_service');
    } else {
      services.push('lcl_service');
    }

    return services;
  }

  private buildFilters(requirements: Record<string, any>): Record<string, any> {
    const filters: Record<string, any> = {};

    if (requirements.timeConstraint) {
      filters.max_transit_time = `${requirements.timeConstraint.value}_${requirements.timeConstraint.unit}`;
    }

    if (requirements.costOptimization) {
      filters.sort_by = 'cost_ascending';
    }

    if (requirements.speedOptimization) {
      filters.sort_by = 'transit_time_ascending';
    }

    return filters;
  }

  private determineCriteria(requirements: Record<string, any>): { names: string[], weights: Record<string, number> } {
    const criteria = ['cost', 'transit_time', 'reliability'];
    const weights: Record<string, number> = {};

    if (requirements.costOptimization) {
      weights.cost = 0.5;
      weights.transit_time = 0.3;
      weights.reliability = 0.2;
    } else if (requirements.speedOptimization) {
      weights.cost = 0.2;
      weights.transit_time = 0.5;
      weights.reliability = 0.3;
    } else {
      weights.cost = 0.35;
      weights.transit_time = 0.35;
      weights.reliability = 0.3;
    }

    return { names: criteria, weights };
  }

  private generateLangGraphFromWorkflow(workflow: Workflow): LangGraphWorkflow {
    const nodes: LangGraphNode[] = [];
    const edges: LangGraphEdge[] = [];

    // Create start node
    nodes.push({
      id: 'start',
      name: 'Start',
      type: 'start',
      function: 'initialize_workflow',
      inputs: [],
      outputs: ['workflow_context'],
      code: this.generateStartNodeCode(workflow),
      position: { x: 100, y: 100 }
    });

    // Generate nodes for each workflow step
    workflow.steps.forEach((step, index) => {
      const node = this.createLangGraphNode(step, index);
      nodes.push(node);

      // Create edge from previous node
      const sourceId = index === 0 ? 'start' : workflow.steps[index - 1].id;
      edges.push({
        id: `edge_${sourceId}_${step.id}`,
        source: sourceId,
        target: step.id,
        label: `Step ${index + 1}`
      });
    });

    // Create end node
    nodes.push({
      id: 'end',
      name: 'Complete',
      type: 'end',
      function: 'finalize_workflow',
      inputs: ['results'],
      outputs: [],
      code: this.generateEndNodeCode(workflow),
      position: { x: 100 + (workflow.steps.length + 1) * 200, y: 100 }
    });

    // Edge to end node
    const lastStep = workflow.steps[workflow.steps.length - 1];
    edges.push({
      id: `edge_${lastStep.id}_end`,
      source: lastStep.id,
      target: 'end',
      label: 'Complete'
    });

    const fullCode = this.generateFullLangGraphCode(nodes, edges, workflow);

    return {
      nodes,
      edges,
      code: fullCode,
      entryPoint: 'start',
      exitPoint: 'end'
    };
  }

  private createLangGraphNode(step: WorkflowStep, index: number): LangGraphNode {
    const nodeTypes: Record<string, LangGraphNode['type']> = {
      'requirements_analysis': 'action',
      'api_aggregation': 'action',
      'decision_matrix': 'condition',
      'api_call': 'action',
      'validation': 'condition',
      'financial_calculation': 'action',
      'tracking': 'action',
      'negotiation': 'human'
    };

    const nodeType = nodeTypes[step.type] || 'action';

    return {
      id: step.id,
      name: step.name,
      type: nodeType,
      function: this.generateNodeFunction(step),
      inputs: this.getNodeInputs(step),
      outputs: this.getNodeOutputs(step),
      code: this.generateNodeCode(step),
      position: { x: 100 + (index + 1) * 200, y: 100 }
    };
  }

  private generateNodeFunction(step: WorkflowStep): string {
    const functionNames = {
      'requirements_analysis': 'analyze_requirements',
      'api_aggregation': 'aggregate_api_data',
      'decision_matrix': 'evaluate_options',
      'api_call': 'execute_api_call',
      'validation': 'validate_data',
      'financial_calculation': 'calculate_costs',
      'tracking': 'monitor_progress',
      'negotiation': 'human_negotiation'
    };

    return functionNames[step.type as keyof typeof functionNames] || 'process_step';
  }

  private getNodeInputs(step: WorkflowStep): string[] {
    const inputs = ['context'];

    if (step.dependencies && step.dependencies.length > 0) {
      inputs.push(...step.dependencies.map(dep => `${dep}_result`));
    }

    return inputs;
  }

  private getNodeOutputs(step: WorkflowStep): string[] {
    return [`${step.id}_result`, 'updated_context'];
  }

  private generateNodeCode(step: WorkflowStep): string {
    const functionName = this.generateNodeFunction(step);
    const inputs = this.getNodeInputs(step).join(', ');
    const config = JSON.stringify(step.config, null, 2);

    return `
async def ${functionName}(${inputs}):
    """
    ${step.name}
    Type: ${step.type}
    """
    config = ${config}

    try:
        # Execute step logic based on configuration
        result = await execute_${step.type}(config, context)

        # Update context with results
        updated_context = {**context, "${step.id}": result}

        return {
            "${step.id}_result": result,
            "updated_context": updated_context,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "${step.id}_result": None,
            "error": str(e),
            "status": "failed",
            "timestamp": datetime.now().isoformat()
        }
`;
  }

  private generateStartNodeCode(workflow: Workflow): string {
    return `
async def initialize_workflow(input_data):
    """
    Initialize ${workflow.name}
    """
    return {
        "workflow_context": {
            "workflow_id": "${workflow.id}",
            "workflow_name": "${workflow.name}",
            "started_at": datetime.now().isoformat(),
            "input_data": input_data,
            "status": "initialized"
        }
    }
`;
  }

  private generateEndNodeCode(workflow: Workflow): string {
    return `
async def finalize_workflow(results):
    """
    Finalize ${workflow.name}
    """
    return {
        "workflow_completed": True,
        "completed_at": datetime.now().isoformat(),
        "final_results": results,
        "status": "completed"
    }
`;
  }

  private generateFullLangGraphCode(nodes: LangGraphNode[], edges: LangGraphEdge[], workflow: Workflow): string {
    const imports = `
from langgraph import StateGraph, END
from typing import Dict, Any, List
from datetime import datetime
import asyncio
`;

    const stateDefinition = `
class WorkflowState:
    """State for ${workflow.name}"""
    context: Dict[str, Any]
    results: Dict[str, Any]
    status: str
    errors: List[str]
`;

    const nodeFunctions = nodes.map(node => node.code).join('\n');

    const graphDefinition = `
# Create the workflow graph
workflow_graph = StateGraph(WorkflowState)

# Add nodes
${nodes.map(node => `workflow_graph.add_node("${node.id}", ${node.function})`).join('\n')}

# Add edges
${edges.map(edge => `workflow_graph.add_edge("${edge.source}", "${edge.target}")`).join('\n')}

# Set entry point
workflow_graph.set_entry_point("${nodes[0].id}")

# Compile the graph
compiled_workflow = workflow_graph.compile()
`;

    const executionFunction = `
async def execute_workflow(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute the ${workflow.name} workflow
    """
    initial_state = WorkflowState(
        context={"input": input_data},
        results={},
        status="running",
        errors=[]
    )

    result = await compiled_workflow.ainvoke(initial_state)
    return result
`;

    return `${imports}\n${stateDefinition}\n${nodeFunctions}\n${graphDefinition}\n${executionFunction}`;
  }

  private generateDynamicUIControls(workflow: Workflow): any[] {
    const controls: any[] = [];

    workflow.steps.forEach(step => {
      const stepControls = this.generateStepControls(step);
      controls.push({
        stepId: step.id,
        stepName: step.name,
        controls: stepControls
      });
    });

    return controls;
  }

  private generateStepControls(step: WorkflowStep): any[] {
    const controls: any[] = [];
    const config = step.config || {};

    // Generate controls based on step type and configuration
    switch (step.type) {
      case 'requirements_analysis':
        if (config.parameters) {
          config.parameters.forEach((param: string) => {
            controls.push({
              type: 'input',
              label: this.formatLabel(param),
              id: param,
              required: config.validation?.required?.includes(param) || false
            });
          });
        }
        break;

      case 'api_aggregation':
        if (config.providers) {
          controls.push({
            type: 'multiselect',
            label: 'Select Providers',
            id: 'providers',
            options: config.providers.map((p: string) => ({
              value: p,
              label: this.formatProviderName(p)
            })),
            value: config.providers
          });
        }
        break;

      case 'decision_matrix':
        if (config.criteria) {
          config.criteria.forEach((criterion: string) => {
            controls.push({
              type: 'slider',
              label: `${this.formatLabel(criterion)} Weight`,
              id: `weight_${criterion}`,
              min: 0,
              max: 1,
              step: 0.1,
              value: config.weights?.[criterion] || 0.33
            });
          });
        }
        break;

      case 'api_call':
        controls.push({
          type: 'checkbox',
          label: 'Auto-execute',
          id: 'auto_execute',
          value: true
        });

        if (config.include_insurance !== undefined) {
          controls.push({
            type: 'checkbox',
            label: 'Include Insurance',
            id: 'include_insurance',
            value: config.include_insurance
          });
        }
        break;

      case 'validation':
        if (config.required_docs) {
          controls.push({
            type: 'checklist',
            label: 'Required Documents',
            id: 'required_docs',
            options: config.required_docs.map((doc: string) => ({
              value: doc,
              label: this.formatLabel(doc),
              checked: true
            }))
          });
        }
        break;

      case 'tracking':
        if (config.monitoring_frequency) {
          controls.push({
            type: 'select',
            label: 'Monitoring Frequency',
            id: 'monitoring_frequency',
            options: [
              { value: '5_minutes', label: 'Every 5 minutes' },
              { value: '15_minutes', label: 'Every 15 minutes' },
              { value: '30_minutes', label: 'Every 30 minutes' },
              { value: '1_hour', label: 'Every hour' }
            ],
            value: config.monitoring_frequency
          });
        }
        break;

      default:
        // Generic controls for unknown step types
        controls.push({
          type: 'display',
          label: 'Step Configuration',
          id: 'info',
          value: `This step will execute automatically with the configured parameters.`
        });
    }

    return controls;
  }

  private formatLabel(text: string): string {
    return text
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatProviderName(provider: string): string {
    const names: Record<string, string> = {
      'kuehne_nagel': 'Kuehne + Nagel',
      'ch_robinson': 'C.H. Robinson',
      'dhl_supply_chain': 'DHL Supply Chain',
      'expeditors': 'Expeditors',
      'flexport': 'Flexport',
      'prologis': 'Prologis'
    };

    return names[provider] || this.formatLabel(provider);
  }

  // Helper methods for step generation
  private generateTriggers(request: AIWorkflowRequest): string[] {
    const triggers = ['manual_trigger'];

    if (request.intent.type === 'tracking') {
      triggers.push('shipment_status_change', 'location_update');
    } else if (request.intent.type === 'inventory') {
      triggers.push('stock_level_alert', 'reorder_threshold');
    } else if (request.intent.type === 'port_management') {
      triggers.push('congestion_alert', 'vessel_delay');
    }

    return triggers;
  }

  private estimateDuration(steps: WorkflowStep[]): string {
    const baseDuration = steps.length * 1.5; // 1.5 minutes per step base
    const complexity = steps.reduce((acc, step) => {
      const complexityMap: Record<string, number> = {
        'requirements_analysis': 1,
        'api_aggregation': 2,
        'decision_matrix': 1.5,
        'api_call': 1,
        'validation': 1.2,
        'financial_calculation': 1.3,
        'tracking': 0.8,
        'negotiation': 3
      };
      return acc + (complexityMap[step.type] || 1);
    }, 0);

    const totalMinutes = Math.ceil(baseDuration * (complexity / steps.length));
    return `${totalMinutes}-${totalMinutes + 2} minutes`;
  }

  private calculateComplexity(steps: WorkflowStep[]): 'low' | 'medium' | 'high' {
    const complexityScore = steps.reduce((acc, step) => {
      const scores: Record<string, number> = {
        'requirements_analysis': 1,
        'api_aggregation': 3,
        'decision_matrix': 2,
        'api_call': 1,
        'validation': 2,
        'financial_calculation': 2,
        'tracking': 1,
        'negotiation': 4
      };
      return acc + (scores[step.type] || 1);
    }, 0);

    const avgComplexity = complexityScore / steps.length;

    if (avgComplexity <= 1.5) return 'low';
    if (avgComplexity <= 2.5) return 'medium';
    return 'high';
  }

  private async generateFallbackWorkflow(request: AIWorkflowRequest): Promise<{
    workflow: Workflow;
    langGraph: LangGraphWorkflow;
    uiControls: any[];
  }> {
    // Fallback to dynamic generation without AI API
    const workflow = this.parseWorkflowFromAI({}, request);
    const langGraph = this.generateLangGraphFromWorkflow(workflow);
    const uiControls = this.generateDynamicUIControls(workflow);

    return { workflow, langGraph, uiControls };
  }

  // Placeholder methods for remaining step types (to be implemented)
  private generateConsolidationSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generatePortManagementSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateComplianceSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateCrossDockingSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateTrackingSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateOptimizationSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateCarrierSelectionSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateInventorySteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateReturnProcessingSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private generateGenericSteps(_requirements: Record<string, any>, _entities: Record<string, any>): WorkflowStep[] {
    return []; // Implementation would go here
  }

  private getRequiredDocs(_requirements: Record<string, any>): string[] {
    return ['commercial_invoice', 'packing_list', 'bill_of_lading'];
  }

  private determineEntryType(_requirements: Record<string, any>): string {
    return 'formal';
  }

  private getWarehousingWeights(_requirements: Record<string, any>): Record<string, number> {
    return { cost_per_sqft: 0.4, location_score: 0.3, capacity_match: 0.3 };
  }
}

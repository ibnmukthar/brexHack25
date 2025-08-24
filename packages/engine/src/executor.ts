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
      case 'api_aggregation':
        return this.executeApiAggregation(step, previousResults, params);
      case 'requirements_analysis':
        return this.executeRequirementsAnalysis(step, previousResults, params);
      case 'decision_matrix':
        return this.executeDecisionMatrix(step, previousResults, params);
      case 'logistics_coordination':
        return this.executeLogisticsCoordination(step, previousResults, params);
      case 'document_generation':
        return this.executeDocumentGeneration(step, previousResults, params);
      case 'financial_calculation':
        return this.executeFinancialCalculation(step, previousResults, params);
      case 'tracking':
        return this.executeTracking(step, previousResults, params);
      case 'data_analysis':
        return this.executeDataAnalysis(step, previousResults, params);
      case 'decision':
        return this.executeDecision(step, previousResults, params);
      case 'wms_integration':
        return this.executeWMSIntegration(step, previousResults, params);
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

  private async executeApiAggregation(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    const { config } = step;
    await this.delay(800 + Math.random() * 400);

    if (config.providers?.includes('kuehne_nagel') || config.providers?.includes('expeditors')) {
      // Freight forwarder aggregation
      const results = [];
      for (const provider of config.providers.slice(0, 3)) {
        const result = await this.integrations.queryFreightForwarder(provider, 'ocean_fcl', params);
        results.push(result);
      }
      return { success: true, provider_quotes: results, best_option: results[0] };
    }

    if (config.providers?.includes('flexport') || config.providers?.includes('ch_robinson')) {
      // 3PL aggregation
      const results = [];
      for (const provider of config.providers.slice(0, 3)) {
        const result = await this.integrations.query3PL(provider, 'ocean_freight', params);
        results.push(result);
      }
      return { success: true, provider_quotes: results, best_option: results[0] };
    }

    if (config.carriers) {
      // Carrier aggregation
      return this.integrations.getCarrierRates(params);
    }

    return { success: true, aggregated_data: 'Multiple API responses collected' };
  }

  private async executeRequirementsAnalysis(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(600 + Math.random() * 300);

    const { config } = step;
    const requirements: Record<string, any> = {};

    if (config.parameters) {
      for (const param of config.parameters) {
        switch (param) {
          case 'origin':
            requirements[param] = params.origin || 'Chicago, IL';
            break;
          case 'destination':
            requirements[param] = params.destination || 'New York, NY';
            break;
          case 'weight':
            requirements[param] = params.weight || '500 lbs';
            break;
          case 'timeline':
            requirements[param] = params.timeline || '3-5 days';
            break;
          case 'budget':
            requirements[param] = params.budget || '$2000';
            break;
          default:
            requirements[param] = `Analyzed ${param}`;
        }
      }
    }

    return {
      success: true,
      requirements,
      analysis_confidence: 0.95,
      recommendations: ['Consider express shipping', 'Optimize packaging', 'Use preferred carriers']
    };
  }

  private async executeDecisionMatrix(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(700 + Math.random() * 300);

    const { config } = step;
    const criteria = config.criteria || ['cost', 'speed', 'reliability'];
    const weights = config.weights || {};

    // Simulate scoring multiple options
    const options = [
      { name: 'Option A', scores: { cost: 0.8, speed: 0.6, reliability: 0.9 } },
      { name: 'Option B', scores: { cost: 0.6, speed: 0.9, reliability: 0.7 } },
      { name: 'Option C', scores: { cost: 0.7, speed: 0.7, reliability: 0.8 } }
    ];

    // Calculate weighted scores
    const scoredOptions = options.map(option => {
      let totalScore = 0;
      let totalWeight = 0;

      criteria.forEach((criterion: string) => {
        const weight = weights[criterion] || (1 / criteria.length);
        totalScore += (option.scores[criterion as keyof typeof option.scores] || 0.5) * weight;
        totalWeight += weight;
      });

      return {
        ...option,
        finalScore: totalScore / totalWeight,
        recommendation: totalScore / totalWeight > 0.75 ? 'Recommended' : 'Consider'
      };
    });

    scoredOptions.sort((a, b) => b.finalScore - a.finalScore);

    return {
      success: true,
      decision_matrix: scoredOptions,
      recommended_option: scoredOptions[0],
      analysis_method: config.scoring_method || 'weighted_average'
    };
  }

  private async executeLogisticsCoordination(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(900 + Math.random() * 400);

    const { config } = step;

    if (config.scheduling_window) {
      return {
        success: true,
        scheduled_slots: [
          { time: '08:00-10:00', dock: 'A1', carrier: 'FedEx', status: 'confirmed' },
          { time: '10:00-12:00', dock: 'A2', carrier: 'UPS', status: 'confirmed' },
          { time: '14:00-16:00', dock: 'B1', carrier: 'DHL', status: 'pending' }
        ],
        utilization_rate: 0.85,
        coordination_status: 'optimized'
      };
    }

    return {
      success: true,
      coordination_result: 'Logistics activities coordinated successfully',
      stakeholders_notified: ['carriers', 'warehouse', 'customers'],
      next_actions: ['Monitor progress', 'Handle exceptions', 'Update tracking']
    };
  }

  private async executeDocumentGeneration(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(500 + Math.random() * 300);

    const { config } = step;

    if (config.format?.includes('RMA')) {
      return this.integrations.processReturn(params);
    }

    const documents = [];
    if (config.required_docs) {
      for (const doc of config.required_docs) {
        documents.push({
          type: doc,
          status: 'generated',
          document_id: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      generated_documents: documents,
      compliance_status: 'verified',
      digital_signatures: config.include_signatures || false
    };
  }

  private async executeFinancialCalculation(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(400 + Math.random() * 200);

    const { config } = step;

    if (config.tax_calculations) {
      const baseValue = params.cargo_value || 10000;
      return {
        success: true,
        calculations: {
          cargo_value: baseValue,
          import_duty: baseValue * 0.05,
          vat: baseValue * 0.20,
          excise_tax: baseValue * 0.02,
          total_taxes: baseValue * 0.27,
          total_cost: baseValue * 1.27
        },
        currency: 'USD',
        calculation_date: new Date().toISOString()
      };
    }

    return {
      success: true,
      financial_result: 'Calculations completed',
      total_cost: Math.floor(Math.random() * 5000) + 1000,
      savings_identified: Math.floor(Math.random() * 500) + 100
    };
  }

  private async executeTracking(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(300 + Math.random() * 200);

    const { config } = step;

    if (config.check_interval) {
      return {
        success: true,
        tracking_status: 'active',
        current_location: 'In Transit - Chicago, IL',
        next_update: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        alerts_configured: config.notifications || ['email'],
        monitoring_frequency: config.check_interval
      };
    }

    return {
      success: true,
      tracking_result: 'Tracking initiated successfully',
      tracking_id: `TRK_${Date.now()}`,
      status: 'active'
    };
  }

  private async executeDataAnalysis(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(800 + Math.random() * 400);

    const { config } = step;

    if (config.criteria?.includes('destination_proximity')) {
      return {
        success: true,
        analysis_results: {
          consolidation_opportunities: 12,
          potential_savings: '$1,250',
          recommended_groupings: [
            { destinations: ['Chicago', 'Milwaukee'], shipments: 5, savings: '$450' },
            { destinations: ['Dallas', 'Austin'], shipments: 4, savings: '$380' },
            { destinations: ['Miami', 'Tampa'], shipments: 3, savings: '$420' }
          ]
        },
        confidence_score: 0.89
      };
    }

    if (config.gap_analysis) {
      return {
        success: true,
        compliance_gaps: [
          { type: 'missing_documentation', severity: 'high', count: 3 },
          { type: 'expired_certifications', severity: 'medium', count: 7 },
          { type: 'process_deviations', severity: 'low', count: 12 }
        ],
        overall_compliance_score: 0.78,
        priority_actions: ['Update documentation', 'Renew certifications', 'Process training']
      };
    }

    return {
      success: true,
      analysis_complete: true,
      insights: ['Data patterns identified', 'Optimization opportunities found', 'Recommendations generated'],
      data_quality_score: 0.92
    };
  }

  private async executeDecision(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(500 + Math.random() * 300);

    const { config } = step;

    if (config.alternatives) {
      const selectedAlternative = config.alternatives[0]; // Select first alternative for demo
      return {
        success: true,
        decision_made: selectedAlternative,
        decision_confidence: 0.87,
        factors_considered: config.alternatives,
        cost_benefit_analysis: config.cost_benefit_analysis ? {
          cost_impact: '$-450',
          time_impact: '+2 hours',
          risk_reduction: '35%',
          overall_benefit: 'Positive'
        } : null
      };
    }

    return {
      success: true,
      decision_result: 'Decision executed successfully',
      action_taken: 'Proceed with recommended option',
      confidence_level: 'high'
    };
  }

  private async executeWMSIntegration(step: WorkflowStep, previousResults: Record<string, any>, params: any): Promise<any> {
    await this.delay(600 + Math.random() * 300);

    const { config } = step;

    if (config.sortation_rules) {
      return {
        success: true,
        sortation_complete: true,
        items_processed: 1250,
        sorting_accuracy: 0.998,
        exceptions: 2,
        throughput_rate: '450 items/hour',
        quality_checks: config.quality_checks === 'automated_scanning' ? 'passed' : 'manual_review_required'
      };
    }

    // Default WMS operation
    return this.integrations.queryWMS('pick_performance', params);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
'use client';

import { useState } from 'react';
import { SAMPLE_WORKFLOW_RESULTS } from '@/lib/sample-inputs';

interface WorkflowExecutorProps {
  workflow: any;
  onExecute?: () => void;
}

interface ExecutionStatus {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  logs: string[];
  results?: any;
}

export function WorkflowExecutor({ workflow, onExecute }: WorkflowExecutorProps) {
  const [execution, setExecution] = useState<ExecutionStatus>({
    id: '',
    status: 'idle',
    progress: 0,
    currentStep: '',
    logs: [],
    results: null
  });

  const [showLogs, setShowLogs] = useState(false);
  const [parameters, setParameters] = useState<Record<string, any>>({});

  const handleExecute = async () => {
    if (!workflow) return;
    
    onExecute?.();
    
    setExecution({
      id: `exec_${Date.now()}`,
      status: 'running',
      progress: 0,
      currentStep: 'Starting workflow...',
      logs: [`🚀 Starting workflow: ${workflow.workflow?.name}`],
      results: null
    });

    try {
      const response = await fetch(`/api/workflow/${workflow.id}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parameters })
      });

      if (!response.ok) {
        throw new Error('Execution failed');
      }

      const result = await response.json();
      
      // Simulate step-by-step execution for demo
      await simulateExecution(workflow, result);

    } catch (error) {
      console.error('Execution error:', error);
      setExecution(prev => ({
        ...prev,
        status: 'failed',
        currentStep: 'Execution failed',
        logs: [...prev.logs, `❌ Error: ${error}`]
      }));
    }
  };

  const simulateExecution = async (workflow: any, finalResult: any) => {
    const steps = workflow.workflow?.steps || [];
    const totalSteps = steps.length;

    // Add initial setup logs
    setExecution(prev => ({
      ...prev,
      logs: [...prev.logs, `🔍 Analyzing workflow: ${totalSteps} steps identified`, `🚀 Initializing logistics integrations...`]
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < totalSteps; i++) {
      const step = steps[i];
      const progress = ((i + 1) / totalSteps) * 100;

      // Add step-specific emojis and realistic messages
      const stepEmoji = getStepEmoji(step.type);
      const stepMessage = getStepMessage(step.type, step.name);

      setExecution(prev => ({
        ...prev,
        progress: ((i + 0.3) / totalSteps) * 100,
        currentStep: `${stepEmoji} ${step.name}`,
        logs: [...prev.logs, `${stepEmoji} Executing: ${step.name}`, `   ${stepMessage}`]
      }));

      // Simulate realistic step duration based on step type
      const stepDuration = getStepDuration(step.type);
      await new Promise(resolve => setTimeout(resolve, stepDuration));

      // Add intermediate progress updates for longer steps
      if (stepDuration > 1500) {
        setExecution(prev => ({
          ...prev,
          progress: ((i + 0.7) / totalSteps) * 100,
          logs: [...prev.logs, `   📊 Processing data...`]
        }));
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Complete the step
      setExecution(prev => ({
        ...prev,
        progress,
        logs: [...prev.logs, `✅ Completed: ${step.name}`, `   💡 ${getStepResult(step.type)}`]
      }));

      // Small delay between steps
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Add final completion sequence
    setExecution(prev => ({
      ...prev,
      logs: [...prev.logs, `🔄 Finalizing results...`, `📈 Calculating cost savings...`]
    }));

    await new Promise(resolve => setTimeout(resolve, 800));

    // Complete execution with enhanced results
    const workflowResults = SAMPLE_WORKFLOW_RESULTS[workflow.intent?.type as keyof typeof SAMPLE_WORKFLOW_RESULTS];
    const completionTime = `${Math.floor(Math.random() * 3) + 2}.${Math.floor(Math.random() * 9) + 1}`;

    setExecution(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      currentStep: '🎉 Workflow completed successfully',
      logs: [...prev.logs,
        `🎉 Workflow completed in ${completionTime} minutes`,
        `💰 Estimated savings: ${workflowResults?.estimatedSavings || '$89.50'}`,
        `⚡ Success rate: ${workflowResults?.successRate || '96.8%'}`,
        `📋 All logistics operations coordinated successfully`
      ],
      results: {
        ...finalResult,
        estimatedSavings: workflowResults?.estimatedSavings || '$89.50',
        timeToComplete: `${completionTime} minutes`,
        successRate: workflowResults?.successRate || '96.8%',
        benefits: workflowResults?.benefits || ['Automated processing', 'Cost optimization', 'Time savings'],
        operationsCompleted: totalSteps,
        integrationsUsed: getIntegrationsUsed(workflow.intent?.type),
        nextRecommendations: getNextRecommendations(workflow.intent?.type)
      }
    }));
  };

  const getStepEmoji = (stepType: string): string => {
    const emojiMap: Record<string, string> = {
      'api_call': '🌐',
      'api_aggregation': '🔄',
      'requirements_analysis': '📋',
      'decision_matrix': '📊',
      'logistics_coordination': '🚚',
      'document_generation': '📄',
      'financial_calculation': '💰',
      'tracking': '📍',
      'data_analysis': '📈',
      'optimization_algorithm': '🧠',
      'validation': '✅',
      'notification': '📢',
      'data_processing': '⚙️',
      'erp_query': '🏢',
      'decision': '🎯',
      'wms_integration': '🏭'
    };
    return emojiMap[stepType] || '⚙️';
  };

  const getStepMessage = (stepType: string, stepName: string): string => {
    const messages: Record<string, string[]> = {
      'api_aggregation': ['Querying multiple providers...', 'Comparing rates and services...', 'Aggregating responses...'],
      'requirements_analysis': ['Analyzing shipment requirements...', 'Validating parameters...', 'Generating recommendations...'],
      'decision_matrix': ['Evaluating options...', 'Calculating weighted scores...', 'Ranking alternatives...'],
      'logistics_coordination': ['Coordinating with carriers...', 'Scheduling resources...', 'Optimizing logistics flow...'],
      'financial_calculation': ['Computing costs and taxes...', 'Analyzing financial impact...', 'Generating cost breakdown...'],
      'tracking': ['Initiating real-time monitoring...', 'Setting up alerts...', 'Configuring notifications...'],
      'data_analysis': ['Processing logistics data...', 'Identifying patterns...', 'Generating insights...']
    };

    const stepMessages = messages[stepType] || ['Processing request...', 'Executing operation...', 'Completing task...'];
    return stepMessages[Math.floor(Math.random() * stepMessages.length)];
  };

  const getStepDuration = (stepType: string): number => {
    const durations: Record<string, number> = {
      'api_aggregation': 2000,
      'requirements_analysis': 1200,
      'decision_matrix': 1800,
      'logistics_coordination': 2200,
      'financial_calculation': 1000,
      'tracking': 800,
      'data_analysis': 2500,
      'optimization_algorithm': 3000
    };

    const baseDuration = durations[stepType] || 1000;
    return baseDuration + Math.random() * 800;
  };

  const getStepResult = (stepType: string): string => {
    const results: Record<string, string[]> = {
      'api_aggregation': ['3 providers compared', 'Best rates identified', 'Options ranked by value'],
      'requirements_analysis': ['Requirements validated', 'Recommendations generated', 'Parameters optimized'],
      'decision_matrix': ['Best option selected', 'Risk factors assessed', 'Cost-benefit analyzed'],
      'logistics_coordination': ['Resources scheduled', 'Carriers coordinated', 'Timeline optimized'],
      'financial_calculation': ['Costs calculated', 'Savings identified', 'Budget optimized'],
      'tracking': ['Monitoring active', 'Alerts configured', 'Real-time updates enabled'],
      'data_analysis': ['Insights generated', 'Patterns identified', 'Opportunities found']
    };

    const stepResults = results[stepType] || ['Operation completed', 'Data processed', 'Task finished'];
    return stepResults[Math.floor(Math.random() * stepResults.length)];
  };

  const getIntegrationsUsed = (intentType: string): string[] => {
    const integrations: Record<string, string[]> = {
      'freight_forwarding': ['Kuehne + Nagel API', 'Expeditors Platform', 'Port Authority Systems'],
      'warehousing': ['DHL Supply Chain', 'C.H. Robinson WMS', 'Prologis Network'],
      'customs': ['CBP ACE Portal', 'Trade Compliance DB', 'Tariff Classification API'],
      'consolidation': ['LTL Carrier Network', 'Load Optimization Engine', 'Route Planning API'],
      'port_management': ['Port Authority APIs', 'Vessel Tracking Systems', 'Congestion Monitors'],
      'compliance': ['Regulatory Database', 'Audit Management System', 'Certification Tracker'],
      'cross_docking': ['WMS Integration', 'Dock Scheduling System', 'Sortation Control API']
    };

    return integrations[intentType] || ['Carrier APIs', 'Logistics Platform', 'Tracking Systems'];
  };

  const getNextRecommendations = (intentType: string): string[] => {
    const recommendations: Record<string, string[]> = {
      'freight_forwarding': ['Monitor vessel schedules', 'Track customs clearance', 'Optimize container utilization'],
      'warehousing': ['Review capacity utilization', 'Optimize inventory placement', 'Monitor SLA performance'],
      'customs': ['Track duty payments', 'Monitor compliance status', 'Update documentation'],
      'consolidation': ['Monitor shipment volumes', 'Identify new opportunities', 'Track cost savings'],
      'port_management': ['Continue congestion monitoring', 'Track vessel arrivals', 'Optimize dwell times'],
      'compliance': ['Schedule follow-up audits', 'Monitor corrective actions', 'Update procedures'],
      'cross_docking': ['Monitor throughput rates', 'Optimize dock assignments', 'Track performance metrics']
    };

    return recommendations[intentType] || ['Monitor performance', 'Track metrics', 'Optimize operations'];
  };

  const resetExecution = () => {
    setExecution({
      id: '',
      status: 'idle',
      progress: 0,
      currentStep: '',
      logs: [],
      results: null
    });
  };

  if (!workflow) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          ▶️ Workflow Execution
        </h2>
        {execution.status === 'completed' && (
          <button
            onClick={resetExecution}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Parameter Configuration */}
      {execution.status === 'idle' && workflow.ui?.steps?.some((step: any) => step.controls?.length > 0) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-3">Configuration Parameters</h3>
          <div className="space-y-3">
            {workflow.ui.steps.filter((step: any) => step.controls?.length > 0).slice(0, 2).map((step: any) => (
              <div key={step.id}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">{step.name}</h4>
                <div className="grid grid-cols-2 gap-3">
                  {step.controls.slice(0, 4).map((control: any) => (
                    <div key={control.id}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {control.label}
                      </label>
                      {control.type === 'select' && (
                        <select
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={parameters[control.id] || ''}
                          onChange={(e) => setParameters(prev => ({...prev, [control.id]: e.target.value}))}
                        >
                          <option value="">Choose...</option>
                          {control.props?.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}
                      {control.type === 'checkbox' && (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={parameters[control.id] || false}
                            onChange={(e) => setParameters(prev => ({...prev, [control.id]: e.target.checked}))}
                            className="rounded"
                          />
                          <span className="text-sm">Enable</span>
                        </label>
                      )}
                      {control.type === 'input' && (
                        <input
                          type={control.props?.type || 'text'}
                          placeholder={control.props?.placeholder}
                          className="w-full p-2 border border-gray-300 rounded text-sm"
                          value={parameters[control.id] || ''}
                          onChange={(e) => setParameters(prev => ({...prev, [control.id]: e.target.value}))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Status */}
      {execution.status !== 'idle' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {execution.currentStep}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(execution.progress)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                execution.status === 'completed' ? 'bg-green-500' :
                execution.status === 'failed' ? 'bg-red-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${execution.progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                execution.status === 'running' ? 'bg-blue-500 animate-pulse' :
                execution.status === 'completed' ? 'bg-green-500' :
                execution.status === 'failed' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></div>
              <span className="text-sm capitalize font-medium">
                {execution.status === 'running' ? 'In Progress' : execution.status}
              </span>
            </div>
            
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              {showLogs ? 'Hide' : 'Show'} Logs ({execution.logs.length})
            </button>
          </div>
        </div>
      )}

      {/* Execution Logs */}
      {showLogs && execution.logs.length > 0 && (
        <div className="mb-6 p-3 bg-gray-900 text-green-400 rounded-lg font-mono text-xs max-h-40 overflow-y-auto">
          {execution.logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {execution.status === 'completed' && execution.results && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
            🎉 Execution Results
          </h3>

          {/* Main Metrics */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {execution.results.estimatedSavings}
              </div>
              <div className="text-sm text-green-700">Estimated Savings</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {execution.results.timeToComplete}
              </div>
              <div className="text-sm text-blue-700">Completion Time</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {execution.results.successRate || '96.8%'}
              </div>
              <div className="text-sm text-purple-700">Success Rate</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {execution.results.operationsCompleted || workflow.workflow?.steps?.length || 0}
              </div>
              <div className="text-sm text-orange-700">Operations</div>
            </div>
          </div>

          {/* Detailed Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Key Benefits */}
            {execution.results.benefits && (
              <div className="p-3 bg-white rounded-lg border border-green-200">
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  ✨ Key Benefits
                </h4>
                <div className="space-y-1">
                  {execution.results.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                      <span className="text-green-500">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Used */}
            {execution.results.integrationsUsed && (
              <div className="p-3 bg-white rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-2">
                  🔗 Integrations Used
                </h4>
                <div className="space-y-1">
                  {execution.results.integrationsUsed.map((integration: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-blue-600">
                      <span className="text-blue-500">•</span>
                      <span>{integration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Recommendations */}
          {execution.results.nextRecommendations && (
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-2">
                🚀 Next Recommended Actions
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {execution.results.nextRecommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-purple-600 p-2 bg-purple-50 rounded">
                    <span className="text-purple-500">→</span>
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-1">
                🏆 Workflow Performance Summary
              </div>
              <div className="text-xs text-gray-600">
                Processed {execution.results.operationsCompleted || workflow.workflow?.steps?.length || 0} logistics operations
                with {execution.results.successRate || '96.8%'} success rate,
                achieving {execution.results.estimatedSavings} in estimated cost savings
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {execution.status === 'idle' && (
          <button
            onClick={handleExecute}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>▶️</span>
            Execute Workflow
          </button>
        )}
        
        {execution.status === 'running' && (
          <button
            disabled
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg opacity-50 cursor-not-allowed font-medium flex items-center justify-center gap-2"
          >
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Executing...
          </button>
        )}
        
        {execution.status === 'completed' && (
          <button
            onClick={handleExecute}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <span>🔄</span>
            Run Again
          </button>
        )}

        <button
          onClick={() => window.open('/api/workflow/export', '_blank')}
          className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          📤 Export
        </button>
      </div>
    </div>
  );
}
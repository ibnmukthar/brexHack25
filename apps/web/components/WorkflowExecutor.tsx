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
    
    for (let i = 0; i < totalSteps; i++) {
      const step = steps[i];
      const progress = ((i + 1) / totalSteps) * 100;
      
      setExecution(prev => ({
        ...prev,
        progress,
        currentStep: step.name,
        logs: [...prev.logs, `⚙️ Executing: ${step.name}`]
      }));
      
      // Simulate step duration
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      
      setExecution(prev => ({
        ...prev,
        logs: [...prev.logs, `✅ Completed: ${step.name}`]
      }));
    }

    // Complete execution
    setExecution(prev => ({
      ...prev,
      status: 'completed',
      progress: 100,
      currentStep: 'Workflow completed successfully',
      logs: [...prev.logs, `🎉 Workflow completed in ${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9) + 1} minutes`],
      results: {
        ...finalResult,
        estimatedSavings: SAMPLE_WORKFLOW_RESULTS[workflow.intent?.type as keyof typeof SAMPLE_WORKFLOW_RESULTS]?.estimatedSavings || '$89.50',
        timeToComplete: SAMPLE_WORKFLOW_RESULTS[workflow.intent?.type as keyof typeof SAMPLE_WORKFLOW_RESULTS]?.timeToComplete || '1.2 minutes',
        benefits: SAMPLE_WORKFLOW_RESULTS[workflow.intent?.type as keyof typeof SAMPLE_WORKFLOW_RESULTS]?.benefits || ['Automated processing', 'Cost optimization', 'Time savings']
      }
    }));
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
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            🎉 Execution Results
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {execution.results.estimatedSavings}
              </div>
              <div className="text-sm text-green-700">Estimated Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {execution.results.timeToComplete}
              </div>
              <div className="text-sm text-blue-700">Completion Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(execution.progress)}%
              </div>
              <div className="text-sm text-purple-700">Success Rate</div>
            </div>
          </div>

          {execution.results.benefits && (
            <div>
              <h4 className="font-medium text-green-700 mb-2">Key Benefits</h4>
              <div className="space-y-1">
                {execution.results.benefits.map((benefit: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-600">
                    <span>✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
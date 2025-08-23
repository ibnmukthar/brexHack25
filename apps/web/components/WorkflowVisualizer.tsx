'use client';

import { useState } from 'react';

interface WorkflowVisualizerProps {
  workflow: any;
}

export function WorkflowVisualizer({ workflow }: WorkflowVisualizerProps) {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  if (!workflow) return null;

  const getStepIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'api_call': '🌐',
      'data_processing': '⚙️',
      'optimization_algorithm': '🧠',
      'notification': '📢',
      'validation': '✅',
      'erp_query': '📊',
      'logistics_coordination': '🚚',
      'decision': '🎯',
      'document_generation': '📄',
      'api_aggregation': '🔄',
      'requirements_analysis': '📋',
      'decision_matrix': '📈',
      'rule_engine': '⚡',
      'demand_forecasting': '📉',
      'financial_transaction': '💰',
      'quality_control': '🔍',
      'data_collection': '📥'
    };
    return icons[type] || '⚙️';
  };

  const getStepColor = (type: string): string => {
    const colors: Record<string, string> = {
      'api_call': 'border-blue-300 bg-blue-50',
      'data_processing': 'border-green-300 bg-green-50', 
      'optimization_algorithm': 'border-purple-300 bg-purple-50',
      'notification': 'border-yellow-300 bg-yellow-50',
      'validation': 'border-emerald-300 bg-emerald-50',
      'erp_query': 'border-orange-300 bg-orange-50',
      'logistics_coordination': 'border-red-300 bg-red-50',
      'decision': 'border-indigo-300 bg-indigo-50',
      'document_generation': 'border-gray-300 bg-gray-50',
      'financial_transaction': 'border-green-400 bg-green-100'
    };
    return colors[type] || 'border-gray-300 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-gray-800">
            📋 {workflow.workflow?.name || 'Generated Workflow'}
          </h2>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Ready to Execute
          </span>
        </div>
        <p className="text-gray-600 text-sm">
          {workflow.workflow?.description || 'AI-generated logistics workflow'}
        </p>
      </div>

      {/* Workflow Intent Summary */}
      {workflow.intent && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Intent Analysis</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Type:</span>
              <span className="ml-2 text-blue-600 capitalize">{workflow.intent.type.replace('_', ' ')}</span>
            </div>
            <div>
              <span className="font-medium text-blue-700">Priority:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                workflow.intent.priority === 'high' ? 'bg-red-100 text-red-700' :
                workflow.intent.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {workflow.intent.priority}
              </span>
            </div>
          </div>
          
          {workflow.intent.entities && Object.keys(workflow.intent.entities).length > 0 && (
            <div className="mt-3">
              <span className="font-medium text-blue-700">Detected Entities:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {Object.entries(workflow.intent.entities).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workflow Steps */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Execution Steps ({workflow.workflow?.steps?.length || 0})
        </h3>
        
        {workflow.workflow?.steps?.map((step: any, index: number) => (
          <div key={step.id} className="relative">
            {/* Connection Line */}
            {index < workflow.workflow.steps.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
            )}
            
            <div 
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                getStepColor(step.type)
              } ${selectedStep === step.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
              onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center font-bold text-sm text-gray-600">
                  {index + 1}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{getStepIcon(step.type)}</span>
                    <h4 className="font-semibold text-gray-800">{step.name}</h4>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                    <span className="px-2 py-1 bg-white bg-opacity-50 rounded-full font-medium">
                      {step.type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      {step.status}
                    </span>
                  </div>

                  {step.dependencies && step.dependencies.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Depends on:</span> {step.dependencies.join(', ')}
                    </div>
                  )}

                  {/* Expanded Details */}
                  {selectedStep === step.id && (
                    <div className="mt-3 p-3 bg-white bg-opacity-60 rounded border border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-2">Configuration</h5>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(step.config, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Metadata */}
      {workflow.workflow?.triggers && workflow.workflow.triggers.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Automatic Triggers</h4>
          <div className="flex flex-wrap gap-2">
            {workflow.workflow.triggers.map((trigger: string, index: number) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                🔔 {trigger.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{workflow.workflow?.steps?.length || 0}</div>
          <div className="text-sm text-blue-700">Steps</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">~2.5m</div>
          <div className="text-sm text-green-700">Est. Time</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">Auto</div>
          <div className="text-sm text-purple-700">Execution</div>
        </div>
      </div>
    </div>
  );
}
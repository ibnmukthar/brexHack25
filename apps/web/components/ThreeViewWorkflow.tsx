'use client';

import { useState } from 'react';
import { WorkflowVisualizer } from './WorkflowVisualizer';
import { WorkflowExecutor } from './WorkflowExecutor';

interface ThreeViewWorkflowProps {
  workflow: any;
  onExecute?: () => void;
}

export function ThreeViewWorkflow({ workflow, onExecute }: ThreeViewWorkflowProps) {
  const [activeView, setActiveView] = useState<'ui' | 'workflow' | 'code'>('ui');

  const tabs = [
    { id: 'ui', label: '🎛️ UI View', description: 'Interactive workflow controls' },
    { id: 'workflow', label: '📊 Workflow View', description: 'Visual workflow graph' },
    { id: 'code', label: '💻 Code View', description: 'Generated LangGraph code' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeView === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab.label}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeView === 'ui' && (
          <UIView workflow={workflow} onExecute={onExecute} />
        )}
        
        {activeView === 'workflow' && (
          <WorkflowView workflow={workflow} />
        )}
        
        {activeView === 'code' && (
          <CodeView workflow={workflow} />
        )}
      </div>
    </div>
  );
}

function UIView({ workflow, onExecute }: { workflow: any; onExecute?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Interactive Workflow Controls</h3>
          <p className="text-sm text-gray-600">Configure and execute your workflow with dynamic controls</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">AI Generated</span>
        </div>
      </div>

      {/* AI Analysis Summary */}
      {workflow.workflow?.metadata?.aiAnalysis && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🤖 AI Analysis</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Complexity:</span>
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                workflow.workflow.metadata.aiAnalysis.complexity === 'high' ? 'bg-red-100 text-red-700' :
                workflow.workflow.metadata.aiAnalysis.complexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {workflow.workflow.metadata.aiAnalysis.complexity}
              </span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Duration:</span>
              <span className="ml-2 text-blue-700">{workflow.workflow.metadata.aiAnalysis.estimatedDuration}</span>
            </div>
          </div>
          
          {workflow.workflow.metadata.aiAnalysis.keyRequirements && (
            <div className="mt-3">
              <span className="font-medium text-blue-800">Key Requirements:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {workflow.workflow.metadata.aiAnalysis.keyRequirements.map((req: string, index: number) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {req}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dynamic UI Controls */}
      {workflow.uiControls && workflow.uiControls.length > 0 ? (
        <div className="space-y-6">
          {workflow.uiControls.map((stepControl: any, index: number) => (
            <div key={stepControl.stepId} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                {stepControl.stepName}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stepControl.controls.map((control: any, controlIndex: number) => (
                  <DynamicControl key={controlIndex} control={control} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">⚙️</div>
          <p>No dynamic controls available for this workflow</p>
        </div>
      )}

      {/* Execution Section */}
      <div className="border-t border-gray-200 pt-6">
        <WorkflowExecutor workflow={workflow} onExecute={onExecute} />
      </div>
    </div>
  );
}

function WorkflowView({ workflow }: { workflow: any }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Workflow Visualization</h3>
          <p className="text-sm text-gray-600">Visual representation of your logistics workflow</p>
        </div>
        {workflow.langGraph && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-purple-600 font-medium">LangGraph Compatible</span>
          </div>
        )}
      </div>

      {/* Workflow Graph */}
      <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
        <WorkflowVisualizer workflow={workflow} />
      </div>

      {/* LangGraph Nodes Info */}
      {workflow.langGraph && workflow.langGraph.nodes && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">LangGraph Nodes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflow.langGraph.nodes.map((node: any) => (
              <div key={node.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getNodeColor(node.type)}`}></div>
                  <span className="font-medium text-sm">{node.name}</span>
                </div>
                <div className="text-xs text-gray-600">
                  <div>Type: {node.type}</div>
                  <div>Function: {node.function}</div>
                  <div>Inputs: {node.inputs.length}</div>
                  <div>Outputs: {node.outputs.length}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeView({ workflow }: { workflow: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (workflow.langGraph?.code) {
      await navigator.clipboard.writeText(workflow.langGraph.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Generated LangGraph Code</h3>
          <p className="text-sm text-gray-600">Executable Python code for your workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">Production Ready</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>
      </div>

      {workflow.langGraph?.code ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-800 text-gray-100 p-4 text-sm font-mono overflow-x-auto">
            <pre className="whitespace-pre-wrap">{workflow.langGraph.code}</pre>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
          <div className="text-4xl mb-2">💻</div>
          <p>No code generated for this workflow</p>
        </div>
      )}

      {/* Code Statistics */}
      {workflow.langGraph?.code && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {workflow.langGraph.nodes?.length || 0}
            </div>
            <div className="text-sm text-blue-700">Nodes</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {workflow.langGraph.edges?.length || 0}
            </div>
            <div className="text-sm text-green-700">Edges</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {workflow.langGraph.code.split('\n').length}
            </div>
            <div className="text-sm text-purple-700">Lines</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {Math.ceil(workflow.langGraph.code.length / 1000)}K
            </div>
            <div className="text-sm text-orange-700">Characters</div>
          </div>
        </div>
      )}
    </div>
  );
}

function DynamicControl({ control }: { control: any }) {
  switch (control.type) {
    case 'input':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {control.label}
            {control.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${control.label.toLowerCase()}`}
          />
        </div>
      );

    case 'select':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {control.label}
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            {control.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'multiselect':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {control.label}
          </label>
          <div className="space-y-2">
            {control.options?.map((option: any) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={control.value?.includes(option.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'checkbox':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            defaultChecked={control.value}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            {control.label}
          </label>
        </div>
      );

    case 'slider':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {control.label}
          </label>
          <input
            type="range"
            min={control.min}
            max={control.max}
            step={control.step}
            defaultValue={control.value}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{control.min}</span>
            <span>{control.max}</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
          {control.value || control.label}
        </div>
      );
  }
}

function getNodeColor(nodeType: string): string {
  const colors = {
    start: 'bg-green-500',
    end: 'bg-red-500',
    action: 'bg-blue-500',
    condition: 'bg-yellow-500',
    parallel: 'bg-purple-500',
    human: 'bg-orange-500'
  };
  return colors[nodeType as keyof typeof colors] || 'bg-gray-500';
}

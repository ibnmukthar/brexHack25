'use client';

import { useState } from 'react';
import { DEMO_SCENARIOS, WORKFLOW_TEMPLATES } from '@/lib/sample-inputs';

interface WorkflowBuilderProps {
  onWorkflowCreated: (workflow: any) => void;
}

export function WorkflowBuilder({ onWorkflowCreated }: WorkflowBuilderProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/workflow/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          useAI: true // Enable AI-powered workflow generation
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create workflow');
      }

      const workflow = await response.json();
      onWorkflowCreated(workflow);
    } catch (error) {
      console.error('Error creating workflow:', error);
      alert('Failed to create workflow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleScenarioSelect = (scenario: any) => {
    setInput(scenario.input);
    setSelectedCategory(scenario.category);
  };

  const filteredScenarios = selectedCategory 
    ? DEMO_SCENARIOS.filter(s => s.category === selectedCategory)
    : DEMO_SCENARIOS;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🤖 AI Workflow Builder
        </h2>
        <p className="text-gray-600 text-sm">
          Describe your logistics workflow in plain English and let AI handle the rest
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === '' 
                ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === key 
                  ? 'bg-blue-100 text-blue-700 border-blue-200 border' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {template.icon} {key.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Scenarios */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <span>⚡ Quick Start Scenarios</span>
          <span className="text-xs text-gray-500">({filteredScenarios.length} available)</span>
        </label>
        <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
          {filteredScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleScenarioSelect(scenario)}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 flex items-center gap-2">
                  {scenario.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${{
                    'medium': 'bg-yellow-100 text-yellow-700',
                    'high': 'bg-red-100 text-red-700',
                    'low': 'bg-green-100 text-green-700'
                  }[scenario.complexity] || 'bg-gray-100 text-gray-600'}`}>
                    {scenario.complexity}
                  </span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                {scenario.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe Your Workflow
        </label>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
          rows={4}
          placeholder="Try: 'Track my shipment ABC123 and notify me when it reaches Chicago' or 'Find the cheapest way to ship 5kg package to London in 2 days'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <div className="mt-1 text-xs text-gray-500">
          💡 Tip: Press Cmd/Ctrl + Enter to generate workflow
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="animate-pulse">Analyzing logistics requirements...</span>
          </>
        ) : (
          <>
            <span className="text-lg">🚀</span>
            Generate AI Workflow
          </>
        )}
      </button>

      {/* Helper Text */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-xs font-medium text-gray-700 mb-1">What can you ask for?</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div>• Track shipments and get notifications</div>
          <div>• Optimize delivery routes and schedules</div>
          <div>• Compare shipping carriers and costs</div>
          <div>• Manage inventory and auto-reordering</div>
          <div>• Process returns and refunds</div>
        </div>
      </div>
    </div>
  );
}
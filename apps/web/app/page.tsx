'use client';

import { useState } from 'react';
import { WorkflowBuilder } from '@/components/WorkflowBuilder';
import { ThreeViewWorkflow } from '@/components/ThreeViewWorkflow';

export default function HomePage() {
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [executing, setExecuting] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                🚚 Logistics AI Workflow Builder
                <span className="text-sm font-normal bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Beta
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                Transform natural language into executable logistics workflows powered by AI
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 text-right">
                <div className="font-medium">Hackathon Demo</div>
                <div className="flex items-center gap-2">
                  <span>Ready for Production</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live System
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Input */}
          <div className="space-y-6">
            <WorkflowBuilder 
              onWorkflowCreated={setActiveWorkflow}
            />
            
            {/* Sample Results Preview */}
            {!activeWorkflow && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
                <h3 className="text-lg font-bold mb-3">🎯 What You Can Achieve</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="font-bold text-xl">85%</div>
                    <div>Faster Processing</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="font-bold text-xl">$2.4K</div>
                    <div>Monthly Savings</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="font-bold text-xl">24/7</div>
                    <div>Automated</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-3">
                    <div className="font-bold text-xl">99.2%</div>
                    <div>Success Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Three-View System */}
          <div className="space-y-6">
            {activeWorkflow ? (
              <ThreeViewWorkflow
                workflow={activeWorkflow}
                onExecute={() => setExecuting(true)}
              />
            ) : (
              <div className="space-y-6">
                {/* AI Assistant Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Ready to Build Your Workflow
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select a demo scenario or describe your logistics workflow in plain English.
                    Our AI will analyze your requirements and generate a complete automation workflow.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800 mb-1">📦 Smart Tracking</div>
                      <div className="text-sm text-gray-600">Real-time shipment monitoring with predictive notifications</div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800 mb-1">🚚 Route Optimization</div>
                      <div className="text-sm text-gray-600">AI-powered routing to minimize costs and delivery time</div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800 mb-1">💰 Cost Analysis</div>
                      <div className="text-sm text-gray-600">Automated carrier comparison and cost optimization</div>
                    </div>
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800 mb-1">📊 Inventory Management</div>
                      <div className="text-sm text-gray-600">Automated reordering with demand forecasting</div>
                    </div>
                  </div>
                </div>

                {/* Live Metrics Dashboard */}
                <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    📊 Platform Metrics
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2,847</div>
                      <div className="text-sm text-blue-700">Workflows Generated</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$1.2M</div>
                      <div className="text-sm text-green-700">Cost Savings</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">96.8%</div>
                      <div className="text-sm text-purple-700">Success Rate</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">47</div>
                      <div className="text-sm text-orange-700">Active Integrations</div>
                    </div>
                  </div>

                  {/* Live Activity Feed */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      ⚡ Live Activity
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-green-600 p-2 bg-green-50 rounded">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Freight workflow completed - $1,250 saved</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 p-2 bg-blue-50 rounded">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>3PL warehouse selection in progress</span>
                      </div>
                      <div className="flex items-center gap-2 text-purple-600 p-2 bg-purple-50 rounded">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Customs clearance automated</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {!activeWorkflow && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Why Choose AI-Powered Logistics Workflows?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="font-semibold text-gray-800 mb-2">Lightning Fast</h3>
                <p className="text-gray-600 text-sm">
                  Generate complex workflows in seconds, not hours. Natural language processing 
                  understands your requirements instantly.
                </p>
              </div>
              
              <div className="p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold text-gray-800 mb-2">Precision Automation</h3>
                <p className="text-gray-600 text-sm">
                  AI analyzes your specific needs and creates optimized workflows with 
                  built-in error handling and recovery.
                </p>
              </div>
              
              <div className="p-6">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="font-semibold text-gray-800 mb-2">Measurable ROI</h3>
                <p className="text-gray-600 text-sm">
                  Track savings, efficiency gains, and performance improvements with 
                  real-time analytics and reporting.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>🚀 Built for the Hackathon • Powered by AI • Ready for Enterprise</p>
            <p className="mt-2">
              Transform your logistics operations with intelligent automation workflows
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
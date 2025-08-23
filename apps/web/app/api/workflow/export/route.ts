import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const mockWorkflowData = {
      workflow: {
        id: 'wf_sample_export',
        name: 'Sample Logistics Workflow',
        description: 'AI-generated workflow for demonstration',
        created: new Date().toISOString(),
        steps: [
          {
            id: 'step1',
            name: 'Data Collection',
            type: 'api_call',
            config: { endpoint: 'logistics_api' }
          },
          {
            id: 'step2', 
            name: 'Route Optimization',
            type: 'optimization_algorithm',
            config: { algorithm: 'tsp_solver' }
          }
        ]
      },
      execution_results: {
        total_runs: 12,
        success_rate: '96.8%',
        average_completion_time: '2.3 minutes',
        cost_savings: '$247.80'
      },
      generated_by: 'Logistics AI Workflow Builder',
      export_date: new Date().toISOString()
    };

    const jsonData = JSON.stringify(mockWorkflowData, null, 2);
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="workflow_export_${Date.now()}.json"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    
    return NextResponse.json(
      { error: 'Failed to export workflow' },
      { status: 500 }
    );
  }
}
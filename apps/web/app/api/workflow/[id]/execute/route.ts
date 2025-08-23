import { NextRequest, NextResponse } from 'next/server';
import { LogisticsEngine } from '@logistics/engine';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { parameters = {} } = await request.json();
    const workflowId = params.id;
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const engine = new LogisticsEngine();
    const execution = await engine.executeWorkflow(workflowId, parameters);
    
    return NextResponse.json(execution);
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    return NextResponse.json(
      { error: 'Failed to execute workflow' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    
    if (!workflowId) {
      return NextResponse.json(
        { error: 'Workflow ID is required' },
        { status: 400 }
      );
    }

    const engine = new LogisticsEngine();
    const status = await engine.getWorkflowStatus(`exec_${workflowId}`);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    );
  }
}
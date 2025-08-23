import { NextRequest, NextResponse } from 'next/server';
import { textToWorkflow } from '@logistics/engine';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      );
    }

    const workflow = await textToWorkflow(input);
    
    return NextResponse.json(workflow);
  } catch (error) {
    console.error('Workflow creation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Workflow API is running',
    version: '1.0.0',
    endpoints: {
      create: 'POST /api/workflow/create',
      execute: 'POST /api/workflow/{id}/execute'
    }
  });
}
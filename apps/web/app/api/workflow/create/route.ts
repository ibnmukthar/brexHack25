import { NextRequest, NextResponse } from 'next/server';
import { LogisticsEngine } from '@logistics/engine';

export async function POST(request: NextRequest) {
  try {
    const { input, useAI = true } = await request.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input provided' },
        { status: 400 }
      );
    }

    const engine = new LogisticsEngine();

    // Use AI-powered generation by default
    const workflow = useAI
      ? await engine.createAIWorkflow(input)
      : await engine.createWorkflow(input);

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
import { Workflow, WorkflowUI } from './types';
export declare class LogisticsEngine {
    private parser;
    private generator;
    private executor;
    private integrations;
    constructor();
    createWorkflow(input: string): Promise<{
        id: string;
        intent: import("./types").LogisticsIntent;
        workflow: Workflow;
        ui: WorkflowUI;
        executable: boolean;
        createdAt: string;
    }>;
    executeWorkflow(workflowId: string, params?: any): Promise<import("./types").WorkflowExecution>;
    getWorkflowStatus(executionId: string): Promise<{
        id: string;
        status: string;
        progress: number;
        currentStep: string;
        results: {
            totalSteps: number;
            completedSteps: number;
            estimatedSavings: string;
            timeToComplete: string;
        };
    }>;
    private generateSimpleUI;
    private getStepControls;
    private delay;
}

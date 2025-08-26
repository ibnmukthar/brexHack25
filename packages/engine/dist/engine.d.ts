import { Workflow, WorkflowUI } from './types';
export declare class LogisticsEngine {
    private parser;
    private generator;
    private aiGenerator;
    private mastraGenerator;
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
    createAIWorkflow(input: string): Promise<{
        id: string;
        intent: import("./types").LogisticsIntent;
        workflow: Workflow;
        langGraph: import("./ai-generator").LangGraphWorkflow;
        ui: WorkflowUI;
        uiControls: any[];
        executable: boolean;
        createdAt: string;
    }>;
    createMastraWorkflow(input: string): Promise<{
        id: string;
        intent: import("./types").LogisticsIntent;
        workflow: Workflow;
        mastraComposition: import("./mastra-generator").MastraWorkflowComposition;
        ui: WorkflowUI;
        uiControls: any[];
        executable: boolean;
        createdAt: string;
        framework: string;
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

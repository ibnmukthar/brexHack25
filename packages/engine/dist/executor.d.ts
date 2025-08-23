import { Workflow, WorkflowExecution } from './types';
export declare class WorkflowExecutor {
    private integrations;
    constructor();
    execute(workflow: Workflow, params?: any): Promise<WorkflowExecution>;
    runWithMockData(workflowId: string, params: any): Promise<WorkflowExecution>;
    private executeSteps;
    private canExecuteStep;
    private executeStep;
    private executeApiCall;
    private executeDataProcessing;
    private executeOptimization;
    private executeNotification;
    private executeValidation;
    private executeERPQuery;
    private delay;
}

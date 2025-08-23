import { LogisticsIntent, Workflow } from './types';
export declare class WorkflowGenerator {
    generate(intent: LogisticsIntent): Promise<Workflow>;
    private generateTrackingWorkflow;
    private generateOptimizationWorkflow;
    private generateCarrierSelectionWorkflow;
    private generateInventoryWorkflow;
    private generateReturnWorkflow;
    private getOptimizationObjectives;
    private getCarrierWeights;
}

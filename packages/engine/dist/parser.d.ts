import { LogisticsIntent } from './types';
export declare class WorkflowParser {
    parse(input: string): Promise<LogisticsIntent>;
    private detectIntentType;
    private extractEntities;
    private determinePriority;
    private extractConstraints;
}

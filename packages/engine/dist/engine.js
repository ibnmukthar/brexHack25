"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogisticsEngine = void 0;
const parser_1 = require("./parser");
const generator_1 = require("./generator");
const executor_1 = require("./executor");
const mock_integrations_1 = require("./mock-integrations");
const ai_generator_1 = require("./ai-generator");
const mastra_generator_1 = require("./mastra-generator");
class LogisticsEngine {
    constructor() {
        this.parser = new parser_1.WorkflowParser();
        this.generator = new generator_1.WorkflowGenerator();
        this.aiGenerator = new ai_generator_1.AIWorkflowGenerator();
        this.mastraGenerator = new mastra_generator_1.MastraWorkflowGenerator();
        this.executor = new executor_1.WorkflowExecutor();
        this.integrations = new mock_integrations_1.MockIntegrations();
    }
    async createWorkflow(input) {
        console.log('📝 Parsing input:', input);
        const intent = await this.parser.parse(input);
        console.log('🎯 Detected intent:', intent);
        const workflow = await this.generator.generate(intent);
        console.log('⚙️ Generated workflow:', workflow.name);
        const ui = this.generateSimpleUI(workflow);
        return {
            id: workflow.id,
            intent,
            workflow,
            ui,
            executable: true,
            createdAt: new Date().toISOString()
        };
    }
    async createAIWorkflow(input) {
        console.log('🤖 AI Parsing input:', input);
        const intent = await this.parser.parse(input);
        console.log('🎯 AI Detected intent:', intent);
        // Create AI workflow request
        const aiRequest = {
            intent,
            userInput: input,
            context: {
                previousWorkflows: [],
                constraints: intent.constraints || {},
                preferences: {}
            }
        };
        // Generate dynamic workflow with AI
        const { workflow, langGraph, uiControls } = await this.aiGenerator.generateDynamicWorkflow(aiRequest);
        console.log('🤖 AI Generated workflow:', workflow.name);
        const ui = this.generateSimpleUI(workflow);
        return {
            id: workflow.id,
            intent,
            workflow,
            langGraph,
            ui,
            uiControls,
            executable: true,
            createdAt: new Date().toISOString()
        };
    }
    async createMastraWorkflow(input) {
        console.log('🔧 Mastra Parsing input:', input);
        const intent = await this.parser.parse(input);
        console.log('🎯 Mastra Detected intent:', intent);
        // Create Mastra workflow request
        const mastraRequest = {
            intent,
            userInput: input,
            context: {
                previousWorkflows: [],
                constraints: intent.constraints || {},
                preferences: {}
            }
        };
        // Generate Mastra workflow with component composition
        const { workflow, mastraComposition, uiControls } = await this.mastraGenerator.generateMastraWorkflow(mastraRequest);
        console.log('🔧 Mastra Generated workflow:', workflow.name);
        const ui = this.generateSimpleUI(workflow);
        return {
            id: workflow.id,
            intent,
            workflow,
            mastraComposition,
            ui,
            uiControls,
            executable: true,
            createdAt: new Date().toISOString(),
            framework: 'mastra'
        };
    }
    async executeWorkflow(workflowId, params = {}) {
        console.log('🚀 Executing workflow:', workflowId);
        return this.executor.runWithMockData(workflowId, params);
    }
    async getWorkflowStatus(executionId) {
        await this.delay(100);
        return {
            id: executionId,
            status: 'completed',
            progress: 100,
            currentStep: 'finished',
            results: {
                totalSteps: 4,
                completedSteps: 4,
                estimatedSavings: '$127.50',
                timeToComplete: '2.3 minutes'
            }
        };
    }
    generateSimpleUI(workflow) {
        return {
            title: workflow.name,
            steps: workflow.steps.map(step => ({
                id: step.id,
                name: step.name,
                status: 'pending',
                controls: this.getStepControls(step.type, step.config)
            }))
        };
    }
    getStepControls(stepType, config) {
        const controlMap = {
            optimization_algorithm: [
                { type: 'slider', label: 'Cost vs Speed Priority', id: 'priority', props: { min: 0, max: 100, value: 50 } },
                { type: 'select', label: 'Vehicle Type', id: 'vehicle', props: { options: ['Truck', 'Van', 'Bike', 'Walking'] } },
                { type: 'checkbox', label: 'Include Tolls', id: 'tolls', value: false },
                { type: 'input', label: 'Max Distance (miles)', id: 'maxDistance', props: { type: 'number', placeholder: '500' } }
            ],
            api_aggregation: [
                { type: 'checkbox', label: 'Express Shipping', id: 'express', value: false },
                { type: 'select', label: 'Preferred Carrier', id: 'carrier', props: { options: ['Any', 'FedEx', 'UPS', 'DHL', 'USPS'] } },
                { type: 'slider', label: 'Budget Limit ($)', id: 'budget', props: { min: 10, max: 200, value: 50 } }
            ],
            validation: [
                { type: 'checkbox', label: 'Skip Manual Checks', id: 'automate', value: true },
                { type: 'select', label: 'Approval Level', id: 'approval', props: { options: ['Auto', 'Manager', 'Director'] } }
            ],
            notification: [
                { type: 'checkbox', label: 'Email Notifications', id: 'email', value: true },
                { type: 'checkbox', label: 'SMS Alerts', id: 'sms', value: false },
                { type: 'input', label: 'Webhook URL', id: 'webhook', props: { placeholder: 'https://...' } }
            ],
            erp_query: [
                { type: 'select', label: 'Data Source', id: 'source', props: { options: ['All Warehouses', 'Primary Only', 'Secondary Only'] } },
                { type: 'slider', label: 'Threshold %', id: 'threshold', props: { min: 10, max: 50, value: 20 } }
            ]
        };
        return controlMap[stepType] || [
            { type: 'display', label: 'Step Configuration', id: 'info', value: 'This step will run automatically' }
        ];
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.LogisticsEngine = LogisticsEngine;

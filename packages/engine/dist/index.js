"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockIntegrations = exports.WorkflowExecutor = exports.WorkflowGenerator = exports.WorkflowParser = exports.LogisticsEngine = void 0;
exports.textToWorkflow = textToWorkflow;
var engine_1 = require("./engine");
Object.defineProperty(exports, "LogisticsEngine", { enumerable: true, get: function () { return engine_1.LogisticsEngine; } });
var parser_1 = require("./parser");
Object.defineProperty(exports, "WorkflowParser", { enumerable: true, get: function () { return parser_1.WorkflowParser; } });
var generator_1 = require("./generator");
Object.defineProperty(exports, "WorkflowGenerator", { enumerable: true, get: function () { return generator_1.WorkflowGenerator; } });
var executor_1 = require("./executor");
Object.defineProperty(exports, "WorkflowExecutor", { enumerable: true, get: function () { return executor_1.WorkflowExecutor; } });
var mock_integrations_1 = require("./mock-integrations");
Object.defineProperty(exports, "MockIntegrations", { enumerable: true, get: function () { return mock_integrations_1.MockIntegrations; } });
__exportStar(require("./types"), exports);
async function textToWorkflow(input) {
    const { LogisticsEngine } = await Promise.resolve().then(() => require('./engine'));
    const engine = new LogisticsEngine();
    return engine.createWorkflow(input);
}

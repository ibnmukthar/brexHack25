# Code Architecture & Implementation Details

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (REST)                        │
├─────────────────────────────────────────────────────────────┤
│                 Workflow Engine Core                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ AI Provider │ │ Templates   │ │ Orchestration       │   │
│  │ (Claude)    │ │ Registry    │ │ Engine              │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                   Mock Data Layer                          │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure & Responsibilities

### Core Engine (`packages/engine/src/`)

#### AI Providers (`ai-providers/`)
```typescript
// ai-provider-interface.ts - Abstract interface
export interface AIProvider {
  parseIntent(input: string): Promise<LogisticsIntent>
  generateWorkflow(intent: LogisticsIntent, template: WorkflowTemplate): Promise<Workflow>
  extractParameters(workflow: Workflow): Promise<WorkflowParameter[]>
}

// claude-service.ts - Claude implementation
export class ClaudeService implements AIProvider {
  private client: Anthropic
  private parseWithFallback(response: string): any
  private validateWorkflowStructure(workflow: any): boolean
}

// provider-factory.ts - Factory pattern
export class AIProviderFactory {
  static createProvider(type: 'claude', config: any): AIProvider
}
```

#### Templates (`templates/`)
```typescript
// template-registry.ts - Centralized management
export class TemplateRegistry {
  private templates = new Map<string, WorkflowTemplate>()
  register(template: WorkflowTemplate): void
  getTemplate(id: string): WorkflowTemplate | undefined
  findTemplateByIntent(intentType: string): WorkflowTemplate | undefined
}

// Individual templates (inventory-template.ts, etc.)
export const INVENTORY_TEMPLATE: WorkflowTemplate = {
  id: 'inventory-management',
  parameters: [...],
  steps: [...],
  integrations: [...],
  output_schema: {...}
}
```

#### Orchestration (`orchestration/`)
```typescript
// workflow-engine.ts - Main orchestrator
export class WorkflowEngine {
  private workflows = new Map<string, Workflow>()
  private stepExecutors = new Map<string, StepExecutor>()
  
  storeWorkflow(workflow: Workflow): void
  executeWorkflow(id: string, params: WorkflowParams): Promise<WorkflowExecution>
  registerStepExecutor(type: string, executor: StepExecutor): void
}

// execution-context.ts - State management
export class ExecutionContext {
  private variables = new Map<string, any>()
  private logs: string[] = []
  
  setVariable(key: string, value: any): void
  resolveConfig(config: any): any
  addLog(message: string): void
}

// Step Executors
export class MockApiExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: ExecutionContext): Promise<void>
}

export class DataProcessingExecutor implements StepExecutor {
  private executeScript(script: string, inputs: string[], context: ExecutionContext): any
}
```

### API Layer (`apps/web/app/api/`)

#### Workflow Management
```typescript
// workflows/create/route.ts
export async function POST(request: NextRequest) {
  const { prompt, provider = 'claude' } = await request.json()
  const aiProvider = AIProviderFactory.createProvider('claude', { apiKey })
  const intent = await aiProvider.parseIntent(prompt)
  const template = templateRegistry.findTemplateByIntent(intent.type)
  const workflow = await aiProvider.generateWorkflow(intent, template)
  return NextResponse.json({ success: true, workflow })
}

// workflows/[id]/execute/route.ts
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { parameters = {} } = await request.json()
  const execution = await workflowEngine.executeWorkflow(workflowId, parameters)
  return NextResponse.json({ success: true, execution })
}
```

## 🔄 Data Flow

### 1. Workflow Creation Flow
```
User Prompt → AI Provider → Intent Parsing → Template Selection → Workflow Generation → Storage
```

### 2. Execution Flow
```
Parameters → Execution Context → Step Executors → Mock APIs → Results → Response
```

### 3. Parameter Resolution
```typescript
// Example parameter resolution in ExecutionContext
resolveConfig(config: any): any {
  if (typeof config === 'string' && config.includes('{{')) {
    return config.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return this.variables.get(key) || match
    })
  }
  if (typeof config === 'object') {
    const resolved = {}
    for (const [key, value] of Object.entries(config)) {
      resolved[key] = this.resolveConfig(value)
    }
    return resolved
  }
  return config
}
```

## 🎯 Template Structure

### Template Definition
```typescript
interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  parameters: WorkflowParameter[]
  steps: WorkflowStep[]
  integrations: Integration[]
  output_schema: Record<string, string>
}

interface WorkflowParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multi-select'
  label: string
  required?: boolean
  default?: any
  options?: string[]
  min?: number
  max?: number
  ui_hint?: string
}

interface WorkflowStep {
  id: string
  type: string
  name: string
  config: any
  outputs?: string[]
}
```

### Step Types Implementation

#### Mock API Call
```typescript
{
  id: 'fetch-inventory-data',
  type: 'mock-api-call',
  name: 'Fetch Current Inventory Levels',
  config: {
    mock_data_key: 'inventory_levels',
    params: {
      categories: '{{product_categories}}'
    }
  },
  outputs: ['inventory_data']
}
```

#### Data Processing
```typescript
{
  id: 'process-inventory',
  type: 'data-processing',
  name: 'Process Inventory Data',
  config: {
    script: `
      const lowStockItems = [];
      Object.entries(inventory_data).forEach(([category, data]) => {
        if (data.current_stock < reorder_threshold) {
          lowStockItems.push({
            category,
            current_stock: data.current_stock,
            reorder_point: data.reorder_point
          });
        }
      });
      return { low_stock_items: lowStockItems };
    `,
    inputs: ['inventory_data', 'reorder_threshold']
  },
  outputs: ['processed_data']
}
```

#### Conditional Logic
```typescript
{
  id: 'check-reorder-needed',
  type: 'conditional',
  name: 'Check if Reorder Needed',
  config: {
    condition: 'processed_data.low_stock_items.length > 0',
    true_branch: 'send-reorder-alert',
    false_branch: 'generate-status-report'
  }
}
```

## 🔧 Mock Data System

### Mock Data Structure
```typescript
// mock-data.ts
export const MOCK_DATA = {
  inventory_levels: {
    electronics: {
      current_stock: 245,
      reorder_point: 100,
      max_stock: 500,
      predicted_demand: 180,
      trend: 'increasing',
      confidence_score: 0.87
    }
  },
  
  shipment_tracking: {
    'TRK123456789': {
      tracking_number: 'TRK123456789',
      carrier: 'FedEx',
      status: 'in_transit',
      current_location: 'Chicago, IL',
      estimated_delivery: '2025-08-25T10:00:00.000Z',
      events: [...]
    }
  }
}
```

### Mock API Executor
```typescript
export class MockApiExecutor implements StepExecutor {
  async execute(step: WorkflowStep, context: ExecutionContext): Promise<void> {
    const config = context.resolveConfig(step.config)
    const mockDataKey = config.mock_data_key
    const mockData = MOCK_DATA[mockDataKey]
    
    // Simulate API delay
    await this.delay(200 + Math.random() * 500)
    
    // Filter data based on parameters
    const filteredData = this.filterMockData(mockData, config.params)
    
    // Store results in context
    step.outputs?.forEach(output => {
      context.setVariable(output, filteredData)
    })
  }
}
```

## 🎨 UI Schema Generation (Future)

### Parameter to UI Control Mapping
```typescript
interface UIControl {
  type: 'input' | 'select' | 'multiselect' | 'slider' | 'toggle'
  label: string
  value: any
  options?: any[]
  validation?: ValidationRule[]
}

const parameterToUIControl = (param: WorkflowParameter): UIControl => {
  switch (param.type) {
    case 'multi-select':
      return {
        type: 'multiselect',
        label: param.label,
        value: param.default || [],
        options: param.options?.map(opt => ({ label: opt, value: opt }))
      }
    
    case 'number':
      return param.ui_hint === 'slider' ? {
        type: 'slider',
        label: param.label,
        value: param.default || param.min || 0,
        min: param.min,
        max: param.max
      } : {
        type: 'input',
        label: param.label,
        value: param.default || 0
      }
  }
}
```

## 🔍 Error Handling Strategy

### Graceful Degradation
```typescript
// AI Provider fallback
async parseIntent(input: string): Promise<LogisticsIntent> {
  try {
    const response = await this.client.messages.create({...})
    return this.parseWithFallback(response.content[0].text)
  } catch (error) {
    console.error('Claude API error:', error)
    // Fallback to keyword-based intent detection
    return this.keywordBasedIntentDetection(input)
  }
}

// Step execution error handling
async executeStep(step: WorkflowStep, context: ExecutionContext): Promise<void> {
  try {
    await executor.execute(step, context)
    context.addLog(`✅ Step ${step.name} completed successfully`)
  } catch (error) {
    context.addLog(`❌ Step ${step.name} failed: ${error.message}`)
    // Continue execution with error state
    context.setVariable(`${step.id}_error`, error.message)
  }
}
```

## 📊 Performance Considerations

### Caching Strategy
```typescript
// Template caching
class TemplateRegistry {
  private templateCache = new Map<string, WorkflowTemplate>()
  
  getTemplate(id: string): WorkflowTemplate | undefined {
    if (this.templateCache.has(id)) {
      return this.templateCache.get(id)
    }
    // Load and cache template
  }
}

// AI response caching (future)
class ClaudeService {
  private responseCache = new Map<string, any>()
  
  async parseIntent(input: string): Promise<LogisticsIntent> {
    const cacheKey = `intent_${hash(input)}`
    if (this.responseCache.has(cacheKey)) {
      return this.responseCache.get(cacheKey)
    }
    // Make API call and cache result
  }
}
```

### Memory Management
```typescript
// Execution context cleanup
class ExecutionContext {
  cleanup(): void {
    this.variables.clear()
    this.logs.splice(0, this.logs.length - 100) // Keep last 100 logs
  }
}

// Workflow storage limits
class WorkflowEngine {
  private readonly MAX_STORED_WORKFLOWS = 1000
  private readonly MAX_EXECUTION_HISTORY = 50
  
  storeWorkflow(workflow: Workflow): void {
    if (this.workflows.size >= this.MAX_STORED_WORKFLOWS) {
      // Remove oldest workflows
      const oldestKey = this.workflows.keys().next().value
      this.workflows.delete(oldestKey)
    }
    this.workflows.set(workflow.id, workflow)
  }
}
```

## 🔐 Security Implementation

### Input Validation
```typescript
// Parameter validation
const validateParameters = (params: any, schema: WorkflowParameter[]): boolean => {
  for (const param of schema) {
    if (param.required && !params[param.name]) {
      throw new Error(`Required parameter ${param.name} is missing`)
    }
    
    if (param.type === 'number') {
      const value = Number(params[param.name])
      if (isNaN(value)) {
        throw new Error(`Parameter ${param.name} must be a number`)
      }
      if (param.min !== undefined && value < param.min) {
        throw new Error(`Parameter ${param.name} must be >= ${param.min}`)
      }
    }
  }
  return true
}

// Script execution sandboxing
class DataProcessingExecutor {
  private executeScript(script: string, inputs: string[], context: ExecutionContext): any {
    // Create isolated context
    const sandbox = {
      ...inputs.reduce((acc, input) => {
        acc[input] = context.getVariable(input)
        return acc
      }, {}),
      // Whitelist safe functions only
      Math, Date, JSON, console: { log: () => {} }
    }
    
    // Execute with timeout
    return vm.runInNewContext(script, sandbox, { timeout: 5000 })
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
// Template registry tests
describe('TemplateRegistry', () => {
  it('should find template by intent type', () => {
    const registry = new TemplateRegistry()
    const template = registry.findTemplateByIntent('inventory')
    expect(template?.id).toBe('inventory-management')
  })
})

// Workflow execution tests
describe('WorkflowEngine', () => {
  it('should execute inventory workflow successfully', async () => {
    const engine = new WorkflowEngine()
    const execution = await engine.executeWorkflow('inventory-test', {
      product_categories: ['electronics'],
      reorder_threshold: 100
    })
    expect(execution.status).toBe('completed')
  })
})
```

### Integration Tests
```typescript
// API endpoint tests
describe('Workflow API', () => {
  it('should create workflow from prompt', async () => {
    const response = await fetch('/api/workflows/create', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Check inventory levels' })
    })
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.workflow.template_id).toBe('inventory-management')
  })
})
```

---

*This document provides the complete technical implementation details for the Logistics AI Workflow Builder system.*

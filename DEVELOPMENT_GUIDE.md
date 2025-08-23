# Logistics AI Workflow Builder - Development Guide

## 🎯 Project Overview

A comprehensive logistics workflow automation system that converts natural language prompts into executable workflows with standardized templates, AI-powered intent parsing, and API-first architecture for B2B integration.

### Key Features
- **Natural Language to Workflow**: Convert user prompts into structured logistics workflows
- **4 Logistics Templates**: Inventory, Shipment Tracking, Supplier Evaluation, Demand Forecasting
- **Custom Orchestration Engine**: Lightweight, predictable workflow execution
- **API-First Architecture**: RESTful endpoints for B2B integration
- **Dynamic Parameter System**: Real-time workflow configuration
- **Mock Data Integration**: Fast development with simulated logistics data

---

## 🏗️ Architecture Overview

### Monorepo Structure
```
brexHack25/
├── packages/engine/          # Core workflow engine
│   └── src/
│       ├── ai-providers/     # Claude AI integration
│       ├── orchestration/    # Workflow execution engine
│       ├── templates/        # Logistics workflow templates
│       └── types.ts          # Shared TypeScript interfaces
├── apps/web/                 # Next.js frontend & API
│   └── app/api/             # RESTful API endpoints
└── test-workflow.js         # End-to-end testing
```

### Core Components

#### 1. AI Provider Layer (`packages/engine/src/ai-providers/`)
- **AIProvider Interface**: Abstract interface for AI services
- **ClaudeService**: Anthropic Claude integration for intent parsing
- **ProviderFactory**: Factory pattern for AI provider instantiation

#### 2. Orchestration Engine (`packages/engine/src/orchestration/`)
- **WorkflowEngine**: Main orchestration coordinator
- **ExecutionContext**: Manages workflow state and parameter resolution
- **Step Executors**: Modular step execution handlers
  - MockApiExecutor: Simulates API calls with mock data
  - DataProcessingExecutor: Runs JavaScript/Python scripts
  - ConditionalExecutor: Handles workflow branching
  - NotificationExecutor: Sends alerts via email/SMS/Slack

#### 3. Template System (`packages/engine/src/templates/`)
- **TemplateRegistry**: Centralized template management
- **4 Logistics Templates**:
  - Inventory Management
  - Shipment Tracking  
  - Supplier Performance Evaluation
  - Demand Forecasting

#### 4. API Layer (`apps/web/app/api/`)
- RESTful endpoints for workflow CRUD operations
- Execution management and monitoring
- Template catalog and configuration

---

## 📋 Current Development Status

### ✅ Phase 1: Core Foundation (COMPLETED)

#### Phase 1.1: AI Provider Interface ✅
**Files Created:**
- `packages/engine/src/ai-providers/ai-provider-interface.ts`
- `packages/engine/src/ai-providers/claude-service.ts`
- `packages/engine/src/ai-providers/provider-factory.ts`

**Key Features:**
- Abstract AI provider interface with intent parsing
- Claude service implementation with structured JSON parsing
- Fallback mechanisms for robust AI responses
- Provider factory for easy AI service instantiation

#### Phase 1.2: Workflow Orchestration Engine ✅
**Files Created:**
- `packages/engine/src/orchestration/workflow-engine.ts`
- `packages/engine/src/orchestration/execution-context.ts`
- `packages/engine/src/orchestration/step-executors/`
  - `step-executor-interface.ts`
  - `mock-api-executor.ts`
  - `data-processing-executor.ts`
  - `conditional-executor.ts`
  - `notification-executor.ts`
  - `mock-data.ts`

**Key Features:**
- Custom lightweight workflow engine (not LangGraph)
- Modular step executor architecture
- Mock API integration with realistic logistics data
- JavaScript/Python script execution capability
- Conditional branching and notification systems

#### Phase 1.3: Logistics Templates ✅
**Files Created:**
- `packages/engine/src/templates/inventory-template.ts`
- `packages/engine/src/templates/shipment-template.ts`
- `packages/engine/src/templates/supplier-template.ts`
- `packages/engine/src/templates/demand-template.ts`
- `packages/engine/src/templates/template-registry.ts`

**Template Details:**

1. **Inventory Management Template**
   - Parameters: product_categories, reorder_threshold, notification_email
   - Steps: Fetch inventory → Process data → Check thresholds → Send alerts
   - Mock Data: Stock levels, reorder points, demand predictions

2. **Shipment Tracking Template**
   - Parameters: tracking_numbers, carrier_preference, customer_email
   - Steps: Track shipments → Process updates → Check delays → Notify customers
   - Mock Data: Carrier APIs, tracking events, delivery estimates

3. **Supplier Performance Template**
   - Parameters: supplier_ids, evaluation_period, performance_threshold
   - Steps: Collect metrics → Calculate scores → Generate reports → Send feedback
   - Mock Data: Delivery performance, quality scores, cost analysis

4. **Demand Forecasting Template**
   - Parameters: product_categories, forecast_horizon, confidence_level
   - Steps: Historical data → Forecast generation → Validation → Recommendations
   - Mock Data: Sales history, seasonal factors, trend analysis

#### Phase 1.4: API Routes ✅
**Files Created:**
- `apps/web/app/api/workflows/create/route.ts`
- `apps/web/app/api/workflows/[id]/route.ts`
- `apps/web/app/api/workflows/[id]/execute/route.ts`
- `apps/web/app/api/workflows/[id]/configure/route.ts`
- `apps/web/app/api/workflows/[id]/status/route.ts`
- `apps/web/app/api/workflows/list/route.ts`
- `apps/web/app/api/templates/route.ts`
- `apps/web/app/api/executions/[id]/route.ts`

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/workflows/create` | Generate workflow from natural language |
| GET | `/api/workflows/[id]` | Get workflow details |
| PUT | `/api/workflows/[id]` | Update workflow |
| DELETE | `/api/workflows/[id]` | Delete workflow |
| POST | `/api/workflows/[id]/execute` | Execute workflow with parameters |
| GET | `/api/workflows/[id]/configure` | Get parameter schema |
| PUT | `/api/workflows/[id]/configure` | Update workflow parameters |
| GET | `/api/workflows/[id]/status` | Get execution status |
| GET | `/api/workflows/list` | List workflows with filters |
| GET | `/api/templates` | Get template catalog |
| GET | `/api/executions/[id]` | Get execution details |

#### Phase 1.5: End-to-End Testing ✅
**Files Created:**
- `test-workflow.js` - Comprehensive system testing

**Test Coverage:**
- Template registry functionality
- Intent parsing (mocked)
- Template selection logic
- Workflow generation and storage
- Workflow execution with parameters
- Parameter extraction and validation

---

## 🚀 Next Development Phases

### Phase 2: Parameter System (PENDING)

#### Phase 2.1: Parameter Extraction
**Goal**: Extract configurable parameters from generated workflows
**Files to Create:**
- `packages/engine/src/parameter-extraction/parameter-analyzer.ts`
- `packages/engine/src/parameter-extraction/validation-rules.ts`

#### Phase 2.2: Workflow AST Analysis
**Goal**: Analyze workflow structure for dynamic UI generation
**Files to Create:**
- `packages/engine/src/ast-analysis/workflow-parser.ts`
- `packages/engine/src/ast-analysis/dependency-analyzer.ts`

#### Phase 2.3: UI Schema Generation
**Goal**: Generate UI schemas from workflow parameters
**Files to Create:**
- `packages/engine/src/ui-generation/schema-generator.ts`
- `packages/engine/src/ui-generation/control-mapping.ts`

### Phase 3: Dynamic UI (PENDING)

#### Phase 3.1: React Components
**Goal**: Create dynamic React components for parameter controls
**Files to Create:**
- `apps/web/components/workflow/ParameterControl.tsx`
- `apps/web/components/workflow/WorkflowBuilder.tsx`
- `apps/web/components/workflow/ExecutionMonitor.tsx`

#### Phase 3.2: Real-time Updates
**Goal**: Implement real-time parameter updates and validation
**Files to Create:**
- `apps/web/hooks/useWorkflowParameters.ts`
- `apps/web/lib/websocket-client.ts`

### Phase 4: Future Enhancements

#### n8n Integration (OPTIONAL)
**Goal**: Export workflows to n8n format for visual editing
**Files to Create:**
- `packages/engine/src/exporters/n8n-exporter.ts`
- `packages/engine/src/exporters/workflow-converter.ts`

---

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- pnpm (package manager)
- Anthropic Claude API key

### Installation
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY

# Build engine package
cd packages/engine
pnpm build

# Start development server
cd ../../apps/web
pnpm dev
```

### Testing
```bash
# Run end-to-end test
node test-workflow.js

# Test API endpoints
curl -X POST http://localhost:3000/api/workflows/create \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Check inventory levels for electronics"}'
```

---

## 🔧 Technical Decisions

### Why Custom Engine vs LangGraph?
- **Predictability**: Template-driven workflows with consistent behavior
- **Simplicity**: Lightweight, debuggable execution engine
- **Logistics Focus**: Optimized specifically for logistics use cases
- **API-First**: Built for B2B integration from the ground up

### Mock Data Strategy
- **Fast Development**: No external API dependencies during development
- **Reliable Demos**: Consistent, realistic logistics data
- **Easy Testing**: Predictable responses for automated testing
- **Future Migration**: Clear separation for real API integration

### TypeScript Architecture
- **Type Safety**: Comprehensive interfaces for all components
- **Developer Experience**: IntelliSense and compile-time validation
- **Maintainability**: Clear contracts between system components
- **Scalability**: Easy to extend with new templates and executors

---

## 📊 Key Metrics & Success Criteria

### Performance Targets
- **Workflow Creation**: < 2 seconds from prompt to executable workflow
- **Execution Time**: < 30 seconds for typical logistics workflows
- **API Response**: < 500ms for CRUD operations
- **Template Loading**: < 100ms for template catalog

### Quality Metrics
- **Test Coverage**: > 80% for core engine components
- **API Reliability**: 99.9% uptime for workflow execution
- **Error Handling**: Graceful degradation with meaningful error messages
- **Documentation**: Complete API documentation with examples

---

## 🔐 Security Considerations

### API Security
- Input validation for all API endpoints
- Rate limiting for workflow creation and execution
- Authentication middleware (to be implemented)
- Secure parameter handling and validation

### Code Execution
- Sandboxed JavaScript/Python execution in data processing steps
- Input sanitization for user-provided scripts
- Resource limits for script execution
- Audit logging for all workflow executions

---

## 📚 Dependencies

### Core Dependencies
```json
{
  "@anthropic-ai/sdk": "^0.24.3",
  "zod": "^3.23.8",
  "next": "14.2.5",
  "react": "^18",
  "typescript": "^5"
}
```

### Development Dependencies
- ESLint + Prettier for code formatting
- Jest for unit testing
- Turbo for monorepo management
- TypeScript for type safety

---

## 🤝 Development Workflow

### Git Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/***: Individual feature development
- **hotfix/***: Critical bug fixes

### Code Review Process
1. Feature development in separate branch
2. Comprehensive testing (unit + integration)
3. Code review with at least one approval
4. Merge to develop for integration testing
5. Release to main after QA approval

### Release Process
1. Version bump in package.json
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to staging for final testing
5. Production deployment with monitoring

---

## 📞 Support & Documentation

### API Documentation
- OpenAPI/Swagger specification (to be generated)
- Postman collection for testing
- Integration examples for common use cases

### Developer Resources
- Code examples for each template type
- Custom step executor development guide
- Troubleshooting guide for common issues
- Performance optimization best practices

---

*Last Updated: 2025-08-23*
*Version: 1.0.0*
*Status: Phase 1 Complete, Ready for Phase 2*

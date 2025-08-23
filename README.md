# 🚚 Logistics AI Workflow Builder - Hackathon Edition

Transform natural language into executable logistics workflows powered by AI. Built for rapid deployment and demonstration at hackathons.

## 🚀 Quick Start (5 minutes)

```bash
# Clone and setup
git clone <your-repo-url>
cd brexHack25
npm install

# Start development
npm run dev

# Open in browser - Main app will be available at:
# http://localhost:3000
```

## 📋 Project Structure

```
brexHack25/
├── package.json                 # Root package.json with workspaces
├── turbo.json                   # Turborepo configuration
├── packages/
│   └── engine/                  # Core workflow engine
│       ├── package.json
│       ├── src/
│       │   ├── index.ts        # Main exports
│       │   ├── engine.ts       # Logistics engine core
│       │   ├── parser.ts       # Text → Intent parser
│       │   ├── generator.ts    # Intent → Workflow generator
│       │   ├── executor.ts     # Workflow runner
│       │   ├── mock-integrations.ts  # Mock ERP/Carrier APIs
│       │   └── types.ts        # TypeScript definitions
│       └── tsconfig.json
└── apps/
    └── web/                    # Next.js demo app
        ├── package.json
        ├── app/
        │   ├── page.tsx        # Main demo page
        │   ├── layout.tsx      # App layout
        │   ├── globals.css     # Global styles
        │   └── api/
        │       └── workflow/
        │           ├── create/route.ts      # Create workflow API
        │           ├── [id]/execute/route.ts # Execute workflow API
        │           └── export/route.ts      # Export workflow API
        ├── components/
        │   ├── WorkflowBuilder.tsx    # Text input → Workflow
        │   ├── WorkflowVisualizer.tsx # Workflow visualization
        │   └── WorkflowExecutor.tsx   # Workflow execution & monitoring
        ├── lib/
        │   └── sample-inputs.ts       # Demo scenarios & templates
        └── [config files...]
```

## 🎯 Demo Scenarios

The app comes pre-loaded with compelling demo scenarios:

- **📦 International Tracking**: Real-time shipment monitoring with customs notifications
- **🚚 Route Optimization**: AI-powered last-mile delivery optimization for 25+ packages
- **✈️ Carrier Selection**: Compare carriers for international shipments with time constraints
- **📊 Inventory Management**: Automated reordering with demand forecasting
- **↩️ Return Processing**: End-to-end return workflow with RMA generation
- **🚨 Emergency Routing**: Disaster response logistics with priority handling

## 💻 Development Commands

```bash
# Install dependencies
npm install

# Start development (all packages)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Clean build artifacts
npm run clean
```

## 🏗️ Architecture Overview

### Core Engine (`packages/engine/`)

- **Parser**: Converts natural language to structured intents
- **Generator**: Creates executable workflows from intents  
- **Executor**: Runs workflows with step-by-step execution
- **Mock Integrations**: Simulates ERP, carrier, and tracking APIs

### Web App (`apps/web/`)

- **Next.js 14**: App router with TypeScript
- **Tailwind CSS**: Responsive, modern UI
- **React Components**: Modular workflow builder, visualizer, executor
- **API Routes**: RESTful endpoints for workflow operations

## 🎨 Key Features

### 🤖 AI-Powered Workflow Generation
- Natural language processing for logistics intents
- Intelligent step sequencing and dependency management
- Automatic parameter extraction and validation

### 📊 Real-Time Visualization
- Interactive workflow diagrams
- Step-by-step execution monitoring
- Live progress tracking with estimated completion times

### ⚡ Mock Integrations
- Simulated ERP system queries
- Carrier API responses (FedEx, UPS, DHL, USPS)
- Route optimization with realistic results
- Inventory management with stock levels

### 🎯 Production-Ready Architecture
- Monorepo with Turborepo for scalability
- TypeScript throughout for type safety
- Modular component architecture
- RESTful API design

## 🚀 Deployment Options

### Vercel (Recommended for Hackathons)
```bash
npm run build
npx vercel --prod
```

### Docker
```bash
# Build image
docker build -t logistics-workflow .

# Run container
docker run -p 3000:3000 logistics-workflow
```

### Traditional Hosting
```bash
npm run build
npm run start
```

## 📈 Performance Metrics

The demo showcases impressive metrics to highlight business value:

- **85% Faster Processing**: Automated workflow vs manual processes
- **$2.4K Monthly Savings**: Cost optimization through AI
- **99.2% Success Rate**: Reliable workflow execution
- **24/7 Automation**: Continuous operation without human intervention

## 🧪 Testing Demo Scenarios

Try these inputs to showcase different capabilities:

```
"Track shipment ABC123 and notify when it reaches Chicago"
→ Generates tracking workflow with location-based notifications

"Optimize route for 20 packages in downtown by 5pm, prefer lowest cost"
→ Creates route optimization with cost prioritization

"Find cheapest carrier for overnight delivery to NYC for 5kg package"
→ Builds carrier selection workflow with cost comparison

"Check inventory at all warehouses and reorder items below 20%"
→ Automated inventory management with reordering logic
```

## 🛠️ Customization for Your Use Case

### Adding New Intent Types
1. Update `parser.ts` with new intent detection logic
2. Add workflow generation logic in `generator.ts`
3. Create execution handlers in `executor.ts`
4. Add UI templates in component files

### Integrating Real APIs
1. Replace mock functions in `mock-integrations.ts`
2. Add authentication and error handling
3. Update environment variables for API keys
4. Test with staging endpoints first

### Extending UI Components
1. Modify components in `apps/web/components/`
2. Add new demo scenarios to `sample-inputs.ts`
3. Update styling in `globals.css` or component files
4. Test responsive design on different screen sizes

## 🎯 Hackathon Tips

### For Maximum Impact
1. **Focus on 3-4 polished workflows** rather than many broken ones
2. **Use compelling mock data** that tells a story
3. **Show cost/time savings** in big, clear numbers
4. **Make the UI smooth and responsive** for live demos
5. **Prepare a backup demo video** in case of technical issues

### Live Demo Strategy
1. Start with the most visual scenario (route optimization)
2. Show the natural language input → workflow generation
3. Execute the workflow with live progress updates
4. Highlight the cost savings and time benefits
5. Export the workflow to show enterprise readiness

### Technical Backup Plan
- All scenarios work with mock data (no external dependencies)
- Workflows execute locally without internet
- Export functionality provides tangible output
- Mobile-responsive for tablet demos if laptop fails

## 🔧 Environment Setup

### Required
- Node.js 18+ 
- npm or yarn package manager

### Optional (for enhanced demos)
```bash
# Create .env.local file in apps/web/ for real API integration
echo "OPENAI_API_KEY=your-key-here" > apps/web/.env.local
echo "FEDEX_API_KEY=your-key-here" >> apps/web/.env.local
```

## 📚 Additional Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Turborepo**: https://turbo.build/repo/docs
- **TypeScript**: https://www.typescriptlang.org/docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Built for Hackathon Success

This repository is specifically designed for hackathon environments:
- **5-minute setup** from clone to running demo
- **Pre-loaded scenarios** for immediate impact
- **Mock data** eliminates external dependencies
- **Professional UI** that impresses judges
- **Exportable workflows** show enterprise potential
- **Scalable architecture** demonstrates technical depth

Ready to win your hackathon? Let's build the future of logistics automation! 🚀
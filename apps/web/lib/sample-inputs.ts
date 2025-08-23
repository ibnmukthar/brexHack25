export const DEMO_SCENARIOS = [
  {
    id: 1,
    name: '📦 Track International Shipment',
    input: 'Track shipment SH12345 from Shanghai to Los Angeles, notify when it clears customs',
    category: 'tracking',
    complexity: 'medium',
    description: 'Real-time international shipment tracking with customs notifications'
  },
  {
    id: 2,
    name: '🚚 Optimize Last-Mile Delivery',
    input: 'Optimize delivery route for 25 packages in Chicago downtown area by 5pm today, prefer lowest cost',
    category: 'optimization',
    complexity: 'high',
    description: 'AI-powered route optimization for cost-effective deliveries'
  },
  {
    id: 3,
    name: '✈️ Select Best Carrier',
    input: 'Find the best carrier for 500kg shipment from NYC to London, needs to arrive within 3 days',
    category: 'carrier_selection',
    complexity: 'medium',
    description: 'Compare carriers based on cost, speed, and reliability'
  },
  {
    id: 4,
    name: '📊 Inventory Restock',
    input: 'Check inventory levels at all warehouses and automatically reorder items below 20% threshold',
    category: 'inventory',
    complexity: 'high',
    description: 'Automated inventory monitoring and purchase order generation'
  },
  {
    id: 5,
    name: '↩️ Process Return',
    input: 'Process return for order #ORD789, generate RMA, schedule pickup, and issue refund after inspection',
    category: 'return_processing',
    complexity: 'high',
    description: 'End-to-end return processing with automated refunds'
  },
  {
    id: 6,
    name: '🚨 Emergency Reroute',
    input: 'Reroute all shipments from Houston due to hurricane, prioritize medical supplies',
    category: 'optimization',
    complexity: 'high',
    description: 'Emergency logistics coordination with priority-based routing'
  },
  {
    id: 7,
    name: '💰 Cost Analysis',
    input: 'Analyze shipping costs for Q1 and identify opportunities for 15% cost reduction',
    category: 'analytics',
    complexity: 'medium',
    description: 'Financial analysis and cost optimization recommendations'
  },
  {
    id: 8,
    name: '🔄 Supplier Coordination',
    input: 'Coordinate with top 3 suppliers to ensure just-in-time delivery for production schedule',
    category: 'supplier_management',
    complexity: 'high',
    description: 'Multi-supplier coordination for lean manufacturing'
  }
];

export const WORKFLOW_TEMPLATES = {
  tracking: {
    icon: '📦',
    color: 'blue',
    examples: [
      'Track shipment ABC123',
      'Monitor package delivery status',
      'Get real-time location updates'
    ]
  },
  optimization: {
    icon: '🚚',
    color: 'green',
    examples: [
      'Optimize delivery routes',
      'Find fastest path for 20 stops',
      'Minimize fuel costs for delivery'
    ]
  },
  carrier_selection: {
    icon: '✈️',
    color: 'purple',
    examples: [
      'Find cheapest shipping option',
      'Compare overnight delivery rates',
      'Select most reliable carrier'
    ]
  },
  inventory: {
    icon: '📊',
    color: 'orange',
    examples: [
      'Check stock levels across warehouses',
      'Auto-reorder low inventory items',
      'Forecast demand for next month'
    ]
  },
  return_processing: {
    icon: '↩️',
    color: 'red',
    examples: [
      'Process customer return',
      'Generate return shipping label',
      'Issue refund after inspection'
    ]
  }
};

export const SAMPLE_WORKFLOW_RESULTS = {
  tracking: {
    estimatedSavings: '$45.20',
    timeToComplete: '30 seconds',
    successRate: '99.2%',
    benefits: ['Real-time updates', 'Proactive notifications', 'Exception handling']
  },
  optimization: {
    estimatedSavings: '$247.80',
    timeToComplete: '2.5 minutes', 
    successRate: '96.8%',
    benefits: ['27% distance reduction', '35 minutes saved', 'Lower fuel costs']
  },
  carrier_selection: {
    estimatedSavings: '$89.50',
    timeToComplete: '45 seconds',
    successRate: '98.5%',
    benefits: ['Best rates found', 'Service comparison', 'Reliability scoring']
  },
  inventory: {
    estimatedSavings: '$1,240.00',
    timeToComplete: '1.8 minutes',
    successRate: '94.3%',
    benefits: ['Prevent stockouts', 'Optimize order quantities', 'Reduce carrying costs']
  },
  return_processing: {
    estimatedSavings: '$67.30',
    timeToComplete: '3.2 minutes',
    successRate: '97.1%',
    benefits: ['Automated RMA', 'Faster refunds', 'Improved satisfaction']
  }
};
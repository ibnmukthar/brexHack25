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
  },
  {
    id: 9,
    name: '🚢 Ocean Freight Booking',
    input: 'Book ocean freight from Shanghai to Hamburg for 2 containers, get best rates from Flexport and Kuehne+Nagel',
    category: 'freight_forwarding',
    complexity: 'high',
    description: 'International ocean freight booking with multiple 3PL comparison'
  },
  {
    id: 10,
    name: '🏭 3PL Warehouse Selection',
    input: 'Find 3PL warehouse in Memphis with 100K sq ft capacity for electronics distribution, compare DHL and C.H. Robinson',
    category: 'warehousing',
    complexity: 'medium',
    description: '3PL warehouse selection and capacity planning'
  },
  {
    id: 11,
    name: '🛃 Customs Clearance',
    input: 'Process customs clearance for electronics shipment from China, ensure all documentation is complete',
    category: 'customs',
    complexity: 'high',
    description: 'Automated customs documentation and clearance processing'
  },
  {
    id: 12,
    name: '🚛 LTL Consolidation',
    input: 'Consolidate 5 small shipments from Chicago to Atlanta into LTL freight, optimize for cost savings',
    category: 'consolidation',
    complexity: 'medium',
    description: 'Less-than-truckload consolidation and optimization'
  },
  {
    id: 13,
    name: '⚓ Port Congestion Alert',
    input: 'Monitor Port of Los Angeles congestion levels and automatically reroute containers to Long Beach if delays exceed 5 days',
    category: 'port_management',
    complexity: 'high',
    description: 'Real-time port monitoring with automatic rerouting'
  },
  {
    id: 14,
    name: '📋 Compliance Audit',
    input: 'Audit all international shipments for CTPAT compliance and generate corrective action reports',
    category: 'compliance',
    complexity: 'high',
    description: 'Automated compliance auditing and reporting'
  },
  {
    id: 15,
    name: '🔄 Cross-Docking Operation',
    input: 'Coordinate cross-docking operation at Memphis hub for 50 inbound and 75 outbound shipments',
    category: 'cross_docking',
    complexity: 'high',
    description: 'Complex cross-docking coordination and scheduling'
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
  },
  freight_forwarding: {
    icon: '🚢',
    color: 'blue',
    examples: [
      'Book ocean freight containers',
      'Compare freight forwarder rates',
      'Arrange door-to-door shipping'
    ]
  },
  warehousing: {
    icon: '🏭',
    color: 'gray',
    examples: [
      'Find 3PL warehouse space',
      'Optimize warehouse layout',
      'Manage inventory distribution'
    ]
  },
  customs: {
    icon: '🛃',
    color: 'yellow',
    examples: [
      'Process customs clearance',
      'Prepare import documentation',
      'Handle duty calculations'
    ]
  },
  consolidation: {
    icon: '📦',
    color: 'green',
    examples: [
      'Consolidate LTL shipments',
      'Optimize container loading',
      'Reduce shipping costs'
    ]
  },
  port_management: {
    icon: '⚓',
    color: 'blue',
    examples: [
      'Monitor port congestion',
      'Track vessel schedules',
      'Manage container dwell time'
    ]
  },
  compliance: {
    icon: '📋',
    color: 'red',
    examples: [
      'Audit compliance requirements',
      'Generate regulatory reports',
      'Ensure documentation accuracy'
    ]
  },
  cross_docking: {
    icon: '🔄',
    color: 'purple',
    examples: [
      'Coordinate cross-dock operations',
      'Schedule inbound/outbound loads',
      'Optimize dock door assignments'
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
  },
  freight_forwarding: {
    estimatedSavings: '$1,850.00',
    timeToComplete: '4.2 minutes',
    successRate: '95.8%',
    benefits: ['Multi-carrier comparison', 'Documentation automation', 'Cost optimization']
  },
  warehousing: {
    estimatedSavings: '$890.00',
    timeToComplete: '2.1 minutes',
    successRate: '97.5%',
    benefits: ['3PL rate comparison', 'Capacity optimization', 'Location analysis']
  },
  customs: {
    estimatedSavings: '$320.00',
    timeToComplete: '5.5 minutes',
    successRate: '98.9%',
    benefits: ['Automated documentation', 'Compliance verification', 'Faster clearance']
  },
  consolidation: {
    estimatedSavings: '$445.00',
    timeToComplete: '1.7 minutes',
    successRate: '96.2%',
    benefits: ['Load optimization', 'Cost reduction', 'Improved efficiency']
  },
  port_management: {
    estimatedSavings: '$1,200.00',
    timeToComplete: '3.8 minutes',
    successRate: '94.7%',
    benefits: ['Congestion avoidance', 'Schedule optimization', 'Dwell time reduction']
  },
  compliance: {
    estimatedSavings: '$750.00',
    timeToComplete: '6.2 minutes',
    successRate: '99.1%',
    benefits: ['Automated auditing', 'Risk mitigation', 'Regulatory compliance']
  },
  cross_docking: {
    estimatedSavings: '$1,100.00',
    timeToComplete: '4.5 minutes',
    successRate: '95.3%',
    benefits: ['Dock optimization', 'Reduced handling', 'Faster throughput']
  }
};
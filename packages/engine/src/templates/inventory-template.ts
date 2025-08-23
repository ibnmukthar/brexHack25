import { WorkflowTemplate } from '../ai-providers/ai-provider-interface';

export const INVENTORY_TEMPLATE: WorkflowTemplate = {
  id: 'inventory-management',
  name: 'Inventory Management',
  description: 'Monitor stock levels and automate reordering across warehouses',
  category: 'inventory',
  
  parameters: [
    {
      name: 'warehouse_ids',
      type: 'multi-select',
      label: 'Warehouses to Monitor',
      options: ['warehouse_001', 'warehouse_002', 'warehouse_003'],
      required: true,
      default: ['warehouse_001']
    },
    {
      name: 'threshold_percentage',
      type: 'number',
      label: 'Reorder Threshold (%)',
      min: 5,
      max: 50,
      default: 20,
      ui_hint: 'slider'
    },
    {
      name: 'auto_approve_limit',
      type: 'number',
      label: 'Auto-approve Orders Under ($)',
      default: 5000
    },
    {
      name: 'notification_emails',
      type: 'string',
      label: 'Notification Recipients',
      default: 'inventory@company.com'
    }
  ],
  
  steps: [
    {
      id: 'fetch-inventory',
      type: 'mock-api-call',
      name: 'Get Current Inventory Levels',
      config: {
        mock_data_key: 'inventory_levels',
        params: { warehouse_ids: '{{warehouse_ids}}' }
      },
      outputs: ['inventory_data']
    },
    {
      id: 'analyze-stock',
      type: 'data-processing',
      name: 'Analyze Stock Levels',
      config: {
        script: `
          const allItems = [];
          Object.values(inventory_data).forEach(warehouseItems => {
            allItems.push(...warehouseItems);
          });
          
          const lowStockItems = allItems.filter(item => 
            item.stock_percentage < threshold_percentage
          );
          
          const totalValue = lowStockItems.reduce((sum, item) => 
            sum + (item.unit_cost * (item.max_stock - item.current_stock)), 0
          );
          
          return {
            low_stock_items: lowStockItems,
            total_reorder_value: totalValue,
            requires_approval: totalValue > auto_approve_limit
          };
        `,
        inputs: ['inventory_data', 'threshold_percentage', 'auto_approve_limit']
      },
      outputs: ['low_stock_items', 'total_reorder_value', 'requires_approval']
    },
    {
      id: 'check-reorder-needed',
      type: 'conditional',
      name: 'Check if Reorder Needed',
      config: {
        condition: 'low_stock_items.length > 0',
        branches: {
          true: 'create-purchase-orders',
          false: 'send-status-report'
        }
      }
    },
    {
      id: 'create-purchase-orders',
      type: 'mock-api-call',
      name: 'Create Purchase Orders',
      config: {
        mock_data_key: 'purchase_orders',
        body: {
          items: '{{low_stock_items}}',
          total_value: '{{total_reorder_value}}',
          auto_approved: '{{requires_approval}}'
        }
      },
      outputs: ['purchase_orders']
    },
    {
      id: 'send-notifications',
      type: 'notification',
      name: 'Send Inventory Notifications',
      config: {
        channels: [
          {
            type: 'email',
            to: '{{notification_emails}}',
            template: 'inventory-alert',
            data: {
              low_stock_count: '{{low_stock_items.length}}',
              total_value: '{{total_reorder_value}}',
              warehouses: '{{warehouse_ids}}'
            }
          }
        ]
      }
    }
  ],
  
  integrations: [
    { name: 'inventory_api', type: 'rest', required: true },
    { name: 'purchase_order_api', type: 'rest', required: true },
    { name: 'email_service', type: 'smtp', required: false }
  ],
  
  output_schema: {
    success: 'boolean',
    orders_created: 'number',
    total_value: 'number',
    execution_time: 'string',
    low_stock_items: 'array'
  }
};

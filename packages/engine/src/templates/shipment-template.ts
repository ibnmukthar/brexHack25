import { WorkflowTemplate } from '../ai-providers/ai-provider-interface';

export const SHIPMENT_TEMPLATE: WorkflowTemplate = {
  id: 'shipment-tracking',
  name: 'Shipment Tracking & Notifications',
  description: 'Track shipments across multiple carriers and notify customers of updates',
  category: 'shipment',
  
  parameters: [
    {
      name: 'tracking_numbers',
      type: 'textarea',
      label: 'Tracking Numbers (one per line)',
      required: true
    },
    {
      name: 'carriers',
      type: 'multi-select',
      label: 'Carriers to Check',
      options: ['fedex', 'ups', 'dhl', 'usps'],
      default: ['fedex', 'ups']
    },
    {
      name: 'notify_on_events',
      type: 'multi-select',
      label: 'Events to Notify On',
      options: ['shipped', 'in_transit', 'out_for_delivery', 'delivered', 'exception'],
      default: ['delivered', 'exception']
    },
    {
      name: 'customer_notification',
      type: 'boolean',
      label: 'Send Customer Notifications',
      default: true
    }
  ],
  
  steps: [
    {
      id: 'parse-tracking-numbers',
      type: 'data-processing',
      name: 'Parse and Validate Tracking Numbers',
      config: {
        script: `
          const numbers = tracking_numbers.split('\\n')
            .map(n => n.trim())
            .filter(n => n.length > 0);
          
          return { 
            parsed_numbers: numbers,
            total_count: numbers.length 
          };
        `,
        inputs: ['tracking_numbers']
      },
      outputs: ['parsed_numbers', 'total_count']
    },
    {
      id: 'fetch-tracking-data',
      type: 'mock-api-call',
      name: 'Fetch Tracking Information',
      config: {
        mock_data_key: 'tracking_data',
        params: { 
          tracking_numbers: '{{parsed_numbers}}',
          carriers: '{{carriers}}'
        }
      },
      outputs: ['tracking_results']
    },
    {
      id: 'process-tracking-events',
      type: 'data-processing',
      name: 'Process Tracking Events',
      config: {
        script: `
          const processedResults = [];
          
          parsed_numbers.forEach(trackingNumber => {
            const trackingData = tracking_results[trackingNumber] || {
              status: 'not_found',
              carrier: 'unknown'
            };
            
            const relevantEvents = trackingData.events ? 
              trackingData.events.filter(event => 
                notify_on_events.includes(event.status)
              ) : [];
            
            processedResults.push({
              tracking_number: trackingNumber,
              carrier: trackingData.carrier,
              status: trackingData.status,
              location: trackingData.location,
              estimated_delivery: trackingData.estimated_delivery,
              notifications_needed: relevantEvents.length > 0,
              events: relevantEvents
            });
          });
          
          return {
            results: processedResults,
            notifications_count: processedResults.filter(r => r.notifications_needed).length
          };
        `,
        inputs: ['parsed_numbers', 'tracking_results', 'notify_on_events']
      },
      outputs: ['processed_results', 'notifications_count']
    },
    {
      id: 'check-notifications-needed',
      type: 'conditional',
      name: 'Check if Notifications Needed',
      config: {
        condition: 'customer_notification === true && notifications_count > 0',
        branches: {
          true: 'send-customer-notifications',
          false: 'generate-tracking-report'
        }
      }
    },
    {
      id: 'send-customer-notifications',
      type: 'notification',
      name: 'Send Customer Notifications',
      config: {
        channels: [
          {
            type: 'email',
            to: 'customer@example.com',
            template: 'shipment-update',
            data: {
              tracking_updates: '{{processed_results}}',
              total_shipments: '{{total_count}}'
            }
          },
          {
            type: 'sms',
            to: '+1234567890',
            template: 'shipment-update',
            data: {
              notifications_count: '{{notifications_count}}'
            }
          }
        ]
      }
    },
    {
      id: 'generate-tracking-report',
      type: 'data-processing',
      name: 'Generate Tracking Summary Report',
      config: {
        script: `
          const summary = {
            total_shipments: processed_results.length,
            delivered: processed_results.filter(r => r.status === 'delivered').length,
            in_transit: processed_results.filter(r => r.status === 'in_transit').length,
            exceptions: processed_results.filter(r => r.status === 'exception').length,
            not_found: processed_results.filter(r => r.status === 'not_found').length
          };
          
          return {
            summary: summary,
            details: processed_results,
            generated_at: new Date().toISOString()
          };
        `,
        inputs: ['processed_results']
      },
      outputs: ['tracking_summary']
    }
  ],
  
  integrations: [
    { name: 'fedex_api', type: 'rest', required: false },
    { name: 'ups_api', type: 'rest', required: false },
    { name: 'dhl_api', type: 'rest', required: false },
    { name: 'usps_api', type: 'rest', required: false },
    { name: 'email_service', type: 'smtp', required: false },
    { name: 'sms_service', type: 'rest', required: false }
  ],
  
  output_schema: {
    success: 'boolean',
    total_shipments: 'number',
    notifications_sent: 'number',
    summary: 'object',
    execution_time: 'string'
  }
};

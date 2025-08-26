/**
 * Generic API Connector Tool
 * Configurable tool for making API calls to various logistics services
 */

import { z } from 'zod';

export const apiConnectorTool: {
  id: string;
  name: string;
  description: string;
  category: 'tool';
  inputSchema: any;
  outputSchema: any;
  execute: (input: any) => Promise<any>;
} = {
  id: 'api-connector',
  name: 'API Connector',
  description: 'Generic tool for connecting to external APIs and services',
  category: 'tool' as const,
  
  inputSchema: z.object({
    endpoint: z.string().describe('API endpoint URL'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).default('GET'),
    headers: z.record(z.string()).optional().describe('HTTP headers'),
    body: z.any().optional().describe('Request body'),
    authentication: z.object({
      type: z.enum(['none', 'bearer', 'api-key', 'basic']).default('none'),
      token: z.string().optional(),
      apiKey: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional()
    }).optional(),
    timeout: z.number().default(30000).describe('Request timeout in milliseconds'),
    retries: z.number().default(3).describe('Number of retry attempts'),
    responseMapping: z.record(z.string()).optional().describe('Map response fields to standard format')
  }),

  outputSchema: z.object({
    success: z.boolean(),
    data: z.any().optional(),
    status: z.number(),
    headers: z.record(z.string()).optional(),
    error: z.string().optional(),
    executionTime: z.number(),
    retryCount: z.number()
  }),

  execute: async (input: z.infer<typeof apiConnectorTool.inputSchema>) => {
    const startTime = Date.now();
    let retryCount = 0;
    
    const makeRequest = async (): Promise<any> => {
      try {
        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...input.headers
        };

        // Add authentication
        if (input.authentication) {
          switch (input.authentication.type) {
            case 'bearer':
              if (input.authentication.token) {
                headers['Authorization'] = `Bearer ${input.authentication.token}`;
              }
              break;
            case 'api-key':
              if (input.authentication.apiKey) {
                headers['X-API-Key'] = input.authentication.apiKey;
              }
              break;
            case 'basic':
              if (input.authentication.username && input.authentication.password) {
                const credentials = Buffer.from(
                  `${input.authentication.username}:${input.authentication.password}`
                ).toString('base64');
                headers['Authorization'] = `Basic ${credentials}`;
              }
              break;
          }
        }

        // Make the request (simulated for demo)
        const response = await simulateApiCall(input.endpoint, {
          method: input.method,
          headers,
          body: input.body,
          timeout: input.timeout
        });

        // Apply response mapping if provided
        let mappedData: any = response.data;
        if (input.responseMapping && response.data) {
          mappedData = {};
          Object.entries(input.responseMapping).forEach(([key, path]) => {
            (mappedData as any)[key] = getNestedValue(response.data, path as string);
          });
        }

        return {
          success: true,
          data: mappedData,
          status: response.status,
          headers: response.headers,
          executionTime: Date.now() - startTime,
          retryCount
        };

      } catch (error) {
        retryCount++;
        if (retryCount < input.retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return makeRequest();
        }
        
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 500,
          executionTime: Date.now() - startTime,
          retryCount
        };
      }
    };

    return makeRequest();
  }
};

// Helper function to simulate API calls for demo
async function simulateApiCall(endpoint: string, options: any) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
  
  // Generate mock response based on endpoint
  const mockData = generateMockResponse(endpoint, options.method);
  
  return {
    status: 200,
    headers: { 'content-type': 'application/json' },
    data: mockData
  };
}

function generateMockResponse(endpoint: string, method: string) {
  const endpointLower = endpoint.toLowerCase();
  
  if (endpointLower.includes('freight') || endpointLower.includes('shipping')) {
    return {
      quotes: [
        { carrier: 'Maersk', service: 'FCL', cost: 2500, transitTime: '14 days' },
        { carrier: 'MSC', service: 'FCL', cost: 2350, transitTime: '16 days' },
        { carrier: 'CMA CGM', service: 'FCL', cost: 2400, transitTime: '15 days' }
      ],
      currency: 'USD',
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
  
  if (endpointLower.includes('warehouse') || endpointLower.includes('3pl')) {
    return {
      facilities: [
        { 
          name: 'Memphis Distribution Center', 
          location: 'Memphis, TN',
          capacity: 50000,
          services: ['temperature-controlled', 'security', 'cross-docking'],
          cost: 12.50
        },
        {
          name: 'Nashville Logistics Hub',
          location: 'Nashville, TN', 
          capacity: 75000,
          services: ['ambient', 'security', 'fulfillment'],
          cost: 10.75
        }
      ]
    };
  }
  
  if (endpointLower.includes('track') || endpointLower.includes('status')) {
    return {
      trackingNumber: 'TRK123456789',
      status: 'in_transit',
      location: 'Port of Hamburg',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        { timestamp: new Date().toISOString(), event: 'Departed origin port', location: 'Shanghai' },
        { timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), event: 'In transit', location: 'At sea' }
      ]
    };
  }
  
  // Generic response
  return {
    success: true,
    timestamp: new Date().toISOString(),
    data: `Mock response for ${method} ${endpoint}`
  };
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

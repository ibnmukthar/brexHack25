/**
 * Generic Data Processor Tool
 * Configurable tool for processing, transforming, and analyzing data
 */

import { z } from 'zod';

export const dataProcessorTool: {
  id: string;
  name: string;
  description: string;
  category: 'tool';
  inputSchema: any;
  outputSchema: any;
  execute: (input: any) => Promise<any>;
} = {
  id: 'data-processor',
  name: 'Data Processor',
  description: 'Generic tool for processing, transforming, and analyzing data',
  category: 'tool' as const,
  
  inputSchema: z.object({
    data: z.any().describe('Input data to process'),
    operations: z.array(z.object({
      type: z.enum([
        'filter', 'map', 'sort', 'group', 'aggregate', 
        'validate', 'transform', 'merge', 'split', 'calculate'
      ]),
      config: z.record(z.any()).describe('Operation-specific configuration')
    })).describe('List of operations to perform'),
    outputFormat: z.enum(['json', 'csv', 'xml', 'array', 'object']).default('json'),
    validation: z.object({
      schema: z.record(z.any()).optional(),
      required: z.array(z.string()).optional(),
      rules: z.array(z.object({
        field: z.string(),
        rule: z.string(),
        value: z.any().optional()
      })).optional()
    }).optional()
  }),

  outputSchema: z.object({
    success: z.boolean(),
    processedData: z.any(),
    summary: z.object({
      inputCount: z.number(),
      outputCount: z.number(),
      operationsApplied: z.number(),
      validationErrors: z.array(z.string()).optional(),
      processingTime: z.number()
    }),
    metadata: z.record(z.any()).optional(),
    error: z.string().optional()
  }),

  execute: async (input: z.infer<typeof dataProcessorTool.inputSchema>) => {
    const startTime = Date.now();
    let processedData = input.data;
    const validationErrors: string[] = [];
    
    try {
      // Validate input data if validation rules provided
      if (input.validation) {
        const errors = validateData(processedData, input.validation);
        validationErrors.push(...errors);
      }

      // Apply operations sequentially
      for (const operation of input.operations) {
        processedData = await applyOperation(processedData, operation);
      }

      // Format output
      const formattedData = formatOutput(processedData, input.outputFormat);

      return {
        success: true,
        processedData: formattedData,
        summary: {
          inputCount: Array.isArray(input.data) ? input.data.length : 1,
          outputCount: Array.isArray(formattedData) ? formattedData.length : 1,
          operationsApplied: input.operations.length,
          validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
          processingTime: Date.now() - startTime
        },
        metadata: {
          timestamp: new Date().toISOString(),
          operations: input.operations.map((op: any) => op.type)
        }
      };

    } catch (error) {
      return {
        success: false,
        processedData: null,
        summary: {
          inputCount: Array.isArray(input.data) ? input.data.length : 1,
          outputCount: 0,
          operationsApplied: 0,
          validationErrors: validationErrors,
          processingTime: Date.now() - startTime
        },
        error: error instanceof Error ? error.message : 'Processing failed'
      };
    }
  }
};

async function applyOperation(data: any, operation: any): Promise<any> {
  const { type, config } = operation;
  
  switch (type) {
    case 'filter':
      if (Array.isArray(data)) {
        return data.filter(item => evaluateFilter(item, config));
      }
      return data;
      
    case 'map':
      if (Array.isArray(data)) {
        return data.map(item => transformItem(item, config));
      }
      return transformItem(data, config);
      
    case 'sort':
      if (Array.isArray(data)) {
        const field = config.field || 'id';
        const direction = config.direction || 'asc';
        return data.sort((a, b) => {
          const aVal = getNestedValue(a, field);
          const bVal = getNestedValue(b, field);
          if (direction === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      return data;
      
    case 'group':
      if (Array.isArray(data)) {
        const field = config.field;
        return data.reduce((groups, item) => {
          const key = getNestedValue(item, field);
          if (!groups[key]) groups[key] = [];
          groups[key].push(item);
          return groups;
        }, {} as Record<string, any[]>);
      }
      return data;
      
    case 'aggregate':
      if (Array.isArray(data)) {
        const field = config.field;
        const operation = config.operation || 'sum';
        const values = data.map(item => getNestedValue(item, field)).filter(v => typeof v === 'number');
        
        switch (operation) {
          case 'sum': return values.reduce((sum, val) => sum + val, 0);
          case 'avg': return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          case 'min': return Math.min(...values);
          case 'max': return Math.max(...values);
          case 'count': return values.length;
          default: return values;
        }
      }
      return data;
      
    case 'validate':
      // Validation is handled separately
      return data;
      
    case 'transform':
      return transformData(data, config);
      
    case 'merge':
      if (config.mergeWith) {
        return { ...data, ...config.mergeWith };
      }
      return data;
      
    case 'split':
      if (typeof data === 'string' && config.delimiter) {
        return data.split(config.delimiter);
      }
      return data;
      
    case 'calculate':
      return calculateValues(data, config);
      
    default:
      return data;
  }
}

function evaluateFilter(item: any, config: any): boolean {
  const { field, operator, value } = config;
  const itemValue = getNestedValue(item, field);
  
  switch (operator) {
    case 'equals': return itemValue === value;
    case 'not_equals': return itemValue !== value;
    case 'greater_than': return itemValue > value;
    case 'less_than': return itemValue < value;
    case 'contains': return String(itemValue).includes(String(value));
    case 'starts_with': return String(itemValue).startsWith(String(value));
    case 'ends_with': return String(itemValue).endsWith(String(value));
    case 'in': return Array.isArray(value) && value.includes(itemValue);
    case 'not_in': return Array.isArray(value) && !value.includes(itemValue);
    default: return true;
  }
}

function transformItem(item: any, config: any): any {
  if (config.mapping) {
    const transformed: any = {};
    Object.entries(config.mapping).forEach(([newKey, oldKey]) => {
      transformed[newKey] = getNestedValue(item, oldKey as string);
    });
    return transformed;
  }
  return item;
}

function transformData(data: any, config: any): any {
  if (config.template) {
    // Apply template transformation
    return applyTemplate(data, config.template);
  }
  return data;
}

function calculateValues(data: any, config: any): any {
  if (config.formula && Array.isArray(data)) {
    // Simple formula evaluation for demo
    const formula = config.formula;
    if (formula.includes('total_cost')) {
      return data.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
    }
    if (formula.includes('average_time')) {
      const times = data.map((item: any) => item.time || 0);
      return times.length > 0 ? times.reduce((sum: number, time: number) => sum + time, 0) / times.length : 0;
    }
  }
  return data;
}

function validateData(data: any, validation: any): string[] {
  const errors: string[] = [];
  
  if (validation.required && Array.isArray(validation.required)) {
    validation.required.forEach((field: string) => {
      if (!getNestedValue(data, field)) {
        errors.push(`Required field '${field}' is missing`);
      }
    });
  }
  
  if (validation.rules && Array.isArray(validation.rules)) {
    validation.rules.forEach((rule: any) => {
      const value = getNestedValue(data, rule.field);
      if (!evaluateValidationRule(value, rule)) {
        errors.push(`Validation failed for field '${rule.field}': ${rule.rule}`);
      }
    });
  }
  
  return errors;
}

function evaluateValidationRule(value: any, rule: any): boolean {
  switch (rule.rule) {
    case 'not_empty': return value != null && value !== '';
    case 'is_number': return typeof value === 'number';
    case 'is_string': return typeof value === 'string';
    case 'min_length': return String(value).length >= rule.value;
    case 'max_length': return String(value).length <= rule.value;
    case 'min_value': return Number(value) >= rule.value;
    case 'max_value': return Number(value) <= rule.value;
    default: return true;
  }
}

function formatOutput(data: any, format: string): any {
  switch (format) {
    case 'csv':
      if (Array.isArray(data)) {
        const headers = Object.keys(data[0] || {});
        const rows = data.map(item => headers.map(h => item[h]).join(','));
        return [headers.join(','), ...rows].join('\n');
      }
      return data;
    case 'xml':
      return `<data>${JSON.stringify(data)}</data>`;
    case 'array':
      return Array.isArray(data) ? data : [data];
    case 'object':
      return Array.isArray(data) ? { items: data } : data;
    default:
      return data;
  }
}

function applyTemplate(data: any, template: string): any {
  // Simple template replacement for demo
  let result = template;
  Object.entries(data).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  return result;
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

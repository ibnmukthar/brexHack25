/**
 * Generic Document Handler Tool
 * Configurable tool for processing, validating, and managing documents
 */

import { z } from 'zod';

export const documentHandlerTool: {
  id: string;
  name: string;
  description: string;
  category: 'tool';
  inputSchema: any;
  outputSchema: any;
  execute: (input: any) => Promise<any>;
} = {
  id: 'document-handler',
  name: 'Document Handler',
  description: 'Generic tool for processing, validating, and managing documents and files',
  category: 'tool' as const,
  
  inputSchema: z.object({
    operation: z.enum([
      'validate', 'extract', 'convert', 'merge', 'split', 
      'sign', 'encrypt', 'compress', 'generate', 'compare'
    ]).describe('Document operation to perform'),
    documents: z.array(z.object({
      id: z.string().optional(),
      name: z.string(),
      type: z.string().describe('Document type (pdf, docx, xlsx, etc.)'),
      url: z.string().optional(),
      content: z.string().optional(),
      metadata: z.record(z.any()).optional()
    })).describe('Documents to process'),
    config: z.object({
      outputFormat: z.string().optional(),
      validationRules: z.array(z.object({
        field: z.string(),
        rule: z.string(),
        value: z.any().optional(),
        required: z.boolean().default(false)
      })).optional(),
      extractionFields: z.array(z.string()).optional(),
      template: z.string().optional(),
      templateData: z.record(z.any()).optional(),
      signatureConfig: z.object({
        signerName: z.string().optional(),
        signerEmail: z.string().optional(),
        certificatePath: z.string().optional()
      }).optional(),
      compressionLevel: z.number().min(1).max(9).default(6).optional(),
      encryptionKey: z.string().optional()
    }).optional()
  }),

  outputSchema: z.object({
    success: z.boolean(),
    processedDocuments: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      url: z.string().optional(),
      content: z.string().optional(),
      size: z.number().optional(),
      checksum: z.string().optional(),
      metadata: z.record(z.any()).optional()
    })),
    extractedData: z.record(z.any()).optional(),
    validationResults: z.array(z.object({
      documentId: z.string(),
      valid: z.boolean(),
      errors: z.array(z.string()).optional(),
      warnings: z.array(z.string()).optional()
    })).optional(),
    operationDetails: z.object({
      operation: z.string(),
      processingTime: z.number(),
      documentsProcessed: z.number(),
      totalSize: z.number().optional()
    }),
    error: z.string().optional()
  }),

  execute: async (input: z.infer<typeof documentHandlerTool.inputSchema>) => {
    const startTime = Date.now();
    
    try {
      let processedDocuments: any[] = [];
      let extractedData: Record<string, any> = {};
      let validationResults: any[] = [];

      switch (input.operation) {
        case 'validate':
          validationResults = await validateDocuments(input.documents, input.config?.validationRules || []);
          processedDocuments = input.documents.map((doc: any) => ({ ...doc, id: doc.id || generateDocId() }));
          break;

        case 'extract':
          const extractionResult = await extractDataFromDocuments(input.documents, input.config?.extractionFields || []);
          extractedData = extractionResult.data;
          processedDocuments = extractionResult.documents;
          break;

        case 'convert':
          processedDocuments = await convertDocuments(input.documents, input.config?.outputFormat || 'pdf');
          break;

        case 'merge':
          processedDocuments = await mergeDocuments(input.documents);
          break;

        case 'split':
          processedDocuments = await splitDocuments(input.documents);
          break;

        case 'sign':
          processedDocuments = await signDocuments(input.documents, input.config?.signatureConfig);
          break;

        case 'encrypt':
          processedDocuments = await encryptDocuments(input.documents, input.config?.encryptionKey);
          break;

        case 'compress':
          processedDocuments = await compressDocuments(input.documents, input.config?.compressionLevel || 6);
          break;

        case 'generate':
          processedDocuments = await generateDocuments(input.config?.template, input.config?.templateData);
          break;

        case 'compare':
          const comparisonResult = await compareDocuments(input.documents);
          extractedData = comparisonResult;
          processedDocuments = input.documents.map((doc: any) => ({ ...doc, id: doc.id || generateDocId() }));
          break;

        default:
          throw new Error(`Unsupported operation: ${input.operation}`);
      }

      const totalSize = processedDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0);

      return {
        success: true,
        processedDocuments,
        extractedData: Object.keys(extractedData).length > 0 ? extractedData : undefined,
        validationResults: validationResults.length > 0 ? validationResults : undefined,
        operationDetails: {
          operation: input.operation,
          processingTime: Date.now() - startTime,
          documentsProcessed: processedDocuments.length,
          totalSize
        }
      };

    } catch (error) {
      return {
        success: false,
        processedDocuments: [],
        operationDetails: {
          operation: input.operation,
          processingTime: Date.now() - startTime,
          documentsProcessed: 0
        },
        error: error instanceof Error ? error.message : 'Document processing failed'
      };
    }
  }
};

async function validateDocuments(documents: any[], rules: any[]): Promise<any[]> {
  return documents.map(doc => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Simulate document validation
    rules.forEach(rule => {
      const fieldValue = getDocumentField(doc, rule.field);
      
      if (rule.required && !fieldValue) {
        errors.push(`Required field '${rule.field}' is missing`);
      }
      
      if (fieldValue && !validateField(fieldValue, rule)) {
        errors.push(`Field '${rule.field}' failed validation: ${rule.rule}`);
      }
    });

    // Common document validations
    if (!doc.type) {
      errors.push('Document type is required');
    }
    
    if (!doc.content && !doc.url) {
      errors.push('Document content or URL is required');
    }

    return {
      documentId: doc.id || generateDocId(),
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  });
}

async function extractDataFromDocuments(documents: any[], fields: string[]): Promise<{ data: any, documents: any[] }> {
  const extractedData: Record<string, any> = {};
  const processedDocs = documents.map(doc => {
    const docId = doc.id || generateDocId();
    
    // Simulate data extraction based on document type
    const docData = extractDocumentData(doc, fields);
    extractedData[docId] = docData;
    
    return {
      ...doc,
      id: docId,
      size: estimateDocumentSize(doc),
      checksum: generateChecksum(doc.content || doc.name)
    };
  });

  return { data: extractedData, documents: processedDocs };
}

async function convertDocuments(documents: any[], outputFormat: string): Promise<any[]> {
  return documents.map(doc => ({
    ...doc,
    id: doc.id || generateDocId(),
    type: outputFormat,
    name: doc.name.replace(/\.[^.]+$/, `.${outputFormat}`),
    size: estimateDocumentSize(doc, outputFormat),
    checksum: generateChecksum(doc.content || doc.name),
    metadata: {
      ...doc.metadata,
      originalType: doc.type,
      convertedAt: new Date().toISOString()
    }
  }));
}

async function mergeDocuments(documents: any[]): Promise<any[]> {
  if (documents.length <= 1) return documents;
  
  const mergedDoc = {
    id: generateDocId(),
    name: `merged_${documents.length}_documents.pdf`,
    type: 'pdf',
    size: documents.reduce((sum, doc) => sum + estimateDocumentSize(doc), 0),
    checksum: generateChecksum(documents.map(d => d.name).join('')),
    metadata: {
      sourceDocuments: documents.map(d => d.name),
      mergedAt: new Date().toISOString(),
      documentCount: documents.length
    }
  };

  return [mergedDoc];
}

async function splitDocuments(documents: any[]): Promise<any[]> {
  const splitDocs: any[] = [];
  
  documents.forEach(doc => {
    // Simulate splitting each document into 2-3 parts
    const parts = Math.floor(Math.random() * 2) + 2;
    for (let i = 1; i <= parts; i++) {
      splitDocs.push({
        id: generateDocId(),
        name: `${doc.name.replace(/\.[^.]+$/, '')}_part${i}.${doc.type}`,
        type: doc.type,
        size: Math.floor(estimateDocumentSize(doc) / parts),
        checksum: generateChecksum(`${doc.name}_part${i}`),
        metadata: {
          ...doc.metadata,
          originalDocument: doc.name,
          partNumber: i,
          totalParts: parts,
          splitAt: new Date().toISOString()
        }
      });
    }
  });

  return splitDocs;
}

async function signDocuments(documents: any[], signatureConfig?: any): Promise<any[]> {
  return documents.map(doc => ({
    ...doc,
    id: doc.id || generateDocId(),
    size: estimateDocumentSize(doc) + 1024, // Add signature overhead
    checksum: generateChecksum(doc.content || doc.name + '_signed'),
    metadata: {
      ...doc.metadata,
      signed: true,
      signedBy: signatureConfig?.signerName || 'System',
      signedAt: new Date().toISOString(),
      certificate: signatureConfig?.certificatePath || 'system_cert.pem'
    }
  }));
}

async function encryptDocuments(documents: any[], encryptionKey?: string): Promise<any[]> {
  return documents.map(doc => ({
    ...doc,
    id: doc.id || generateDocId(),
    name: `${doc.name}.encrypted`,
    size: Math.floor(estimateDocumentSize(doc) * 1.1), // Encryption overhead
    checksum: generateChecksum(doc.content || doc.name + '_encrypted'),
    metadata: {
      ...doc.metadata,
      encrypted: true,
      encryptionAlgorithm: 'AES-256',
      encryptedAt: new Date().toISOString()
    }
  }));
}

async function compressDocuments(documents: any[], compressionLevel: number): Promise<any[]> {
  const compressionRatio = 0.3 + (compressionLevel / 10) * 0.4; // 30-70% compression
  
  return documents.map(doc => ({
    ...doc,
    id: doc.id || generateDocId(),
    name: `${doc.name}.zip`,
    type: 'zip',
    size: Math.floor(estimateDocumentSize(doc) * compressionRatio),
    checksum: generateChecksum(doc.content || doc.name + '_compressed'),
    metadata: {
      ...doc.metadata,
      compressed: true,
      compressionLevel,
      compressionRatio: Math.round((1 - compressionRatio) * 100),
      compressedAt: new Date().toISOString()
    }
  }));
}

async function generateDocuments(template?: string, templateData?: any): Promise<any[]> {
  if (!template) {
    throw new Error('Template is required for document generation');
  }

  const docTypes = ['invoice', 'bill_of_lading', 'packing_list', 'customs_declaration'];
  const selectedType = docTypes.includes(template) ? template : 'document';

  return [{
    id: generateDocId(),
    name: `generated_${selectedType}_${Date.now()}.pdf`,
    type: 'pdf',
    size: 50000 + Math.floor(Math.random() * 100000),
    checksum: generateChecksum(template + JSON.stringify(templateData)),
    metadata: {
      generated: true,
      template,
      templateData,
      generatedAt: new Date().toISOString()
    }
  }];
}

async function compareDocuments(documents: any[]): Promise<any> {
  if (documents.length < 2) {
    throw new Error('At least 2 documents are required for comparison');
  }

  const comparison = {
    documentsCompared: documents.length,
    similarities: Math.floor(Math.random() * 40) + 60, // 60-100% similarity
    differences: [],
    comparedAt: new Date().toISOString()
  };

  // Simulate finding differences
  const diffTypes = ['content', 'metadata', 'structure', 'formatting'];
  const numDiffs = Math.floor(Math.random() * 5);

  for (let i = 0; i < numDiffs; i++) {
    (comparison.differences as any[]).push({
      type: diffTypes[Math.floor(Math.random() * diffTypes.length)],
      location: `page_${Math.floor(Math.random() * 5) + 1}`,
      description: `Difference found in ${diffTypes[i % diffTypes.length]}`
    });
  }

  return comparison;
}

function extractDocumentData(doc: any, fields: string[]): any {
  const data: Record<string, any> = {};
  
  // Simulate data extraction based on document type
  if (doc.type === 'invoice') {
    data.invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
    data.amount = Math.floor(Math.random() * 10000) + 100;
    data.currency = 'USD';
    data.dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  } else if (doc.type === 'bill_of_lading') {
    data.blNumber = `BL-${Math.floor(Math.random() * 100000)}`;
    data.vessel = 'MV Container Ship';
    data.port = 'Hamburg';
    data.containers = Math.floor(Math.random() * 10) + 1;
  }
  
  // Add requested fields
  fields.forEach(field => {
    if (!data[field]) {
      data[field] = `extracted_${field}_value`;
    }
  });

  return data;
}

function getDocumentField(doc: any, field: string): any {
  return field.split('.').reduce((obj, key) => obj?.[key], doc);
}

function validateField(value: any, rule: any): boolean {
  switch (rule.rule) {
    case 'not_empty': return value != null && value !== '';
    case 'min_length': return String(value).length >= rule.value;
    case 'max_length': return String(value).length <= rule.value;
    case 'pattern': return new RegExp(rule.value).test(String(value));
    case 'type': return typeof value === rule.value;
    default: return true;
  }
}

function estimateDocumentSize(doc: any, format?: string): number {
  const baseSize = doc.content ? doc.content.length : 10000;
  const formatMultipliers: Record<string, number> = {
    pdf: 1.0,
    docx: 0.8,
    xlsx: 1.2,
    txt: 0.1,
    jpg: 2.0,
    png: 2.5
  };
  
  const multiplier = formatMultipliers[format || doc.type] || 1.0;
  return Math.floor(baseSize * multiplier);
}

function generateDocId(): string {
  return `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function generateChecksum(content: string): string {
  // Simple hash simulation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

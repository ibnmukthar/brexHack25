/**
 * Generic Notification Sender Tool
 * Configurable tool for sending notifications via various channels
 */

import { z } from 'zod';

export const notificationSenderTool: {
  id: string;
  name: string;
  description: string;
  category: 'tool';
  inputSchema: any;
  outputSchema: any;
  execute: (input: any) => Promise<any>;
} = {
  id: 'notification-sender',
  name: 'Notification Sender',
  description: 'Generic tool for sending notifications via email, SMS, webhook, or other channels',
  category: 'tool' as const,
  
  inputSchema: z.object({
    channel: z.enum(['email', 'sms', 'webhook', 'slack', 'teams', 'push']).describe('Notification channel'),
    recipients: z.array(z.string()).describe('List of recipients (emails, phone numbers, webhook URLs, etc.)'),
    subject: z.string().optional().describe('Subject line (for email/push notifications)'),
    message: z.string().describe('Notification message content'),
    template: z.object({
      id: z.string().optional(),
      variables: z.record(z.any()).optional()
    }).optional().describe('Template configuration'),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    scheduling: z.object({
      sendAt: z.string().optional().describe('ISO timestamp for scheduled delivery'),
      timezone: z.string().optional().describe('Timezone for scheduling')
    }).optional(),
    attachments: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      content: z.string().optional(),
      type: z.string().optional()
    })).optional(),
    options: z.object({
      trackOpens: z.boolean().default(false),
      trackClicks: z.boolean().default(false),
      retryAttempts: z.number().default(3),
      retryDelay: z.number().default(300) // seconds
    }).optional()
  }),

  outputSchema: z.object({
    success: z.boolean(),
    messageId: z.string(),
    status: z.enum(['sent', 'scheduled', 'failed', 'queued']),
    recipients: z.array(z.object({
      recipient: z.string(),
      status: z.enum(['sent', 'failed', 'bounced', 'queued']),
      messageId: z.string().optional(),
      error: z.string().optional()
    })),
    sentAt: z.string().optional(),
    scheduledFor: z.string().optional(),
    deliveryEstimate: z.string().optional(),
    cost: z.number().optional(),
    retryCount: z.number().default(0),
    metadata: z.record(z.any()).optional()
  }),

  execute: async (input: z.infer<typeof notificationSenderTool.inputSchema>) => {
    const messageId = generateMessageId();
    const timestamp = new Date().toISOString();
    
    try {
      // Check if message should be scheduled
      if (input.scheduling?.sendAt) {
        const scheduledTime = new Date(input.scheduling.sendAt);
        if (scheduledTime > new Date()) {
          return {
            success: true,
            messageId,
            status: 'scheduled' as const,
            recipients: input.recipients.map((recipient: string) => ({
              recipient,
              status: 'queued' as const,
              messageId: `${messageId}-${recipient.slice(-4)}`
            })),
            scheduledFor: scheduledTime.toISOString(),
            deliveryEstimate: calculateDeliveryEstimate(input.channel, scheduledTime),
            cost: calculateCost(input.channel, input.recipients.length),
            retryCount: 0,
            metadata: {
              channel: input.channel,
              priority: input.priority,
              template: input.template?.id
            }
          };
        }
      }

      // Process immediate delivery
      const recipientResults = await Promise.all(
        input.recipients.map((recipient: string) =>
          sendToRecipient(recipient, input, messageId)
        )
      );

      const allSent = recipientResults.every(r => r.status === 'sent');
      const anySent = recipientResults.some(r => r.status === 'sent');

      return {
        success: anySent,
        messageId,
        status: allSent ? 'sent' as const : (anySent ? 'sent' as const : 'failed' as const),
        recipients: recipientResults,
        sentAt: timestamp,
        deliveryEstimate: calculateDeliveryEstimate(input.channel),
        cost: calculateCost(input.channel, recipientResults.filter(r => r.status === 'sent').length),
        retryCount: 0,
        metadata: {
          channel: input.channel,
          priority: input.priority,
          template: input.template?.id,
          totalRecipients: input.recipients.length,
          successfulDeliveries: recipientResults.filter(r => r.status === 'sent').length
        }
      };

    } catch (error) {
      return {
        success: false,
        messageId,
        status: 'failed' as const,
        recipients: input.recipients.map((recipient: string) => ({
          recipient,
          status: 'failed' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        })),
        retryCount: 0,
        metadata: {
          channel: input.channel,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
};

async function sendToRecipient(recipient: string, input: any, messageId: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));
  
  // Validate recipient format based on channel
  const isValidRecipient = validateRecipient(recipient, input.channel);
  if (!isValidRecipient) {
    return {
      recipient,
      status: 'failed' as const,
      error: `Invalid ${input.channel} format: ${recipient}`
    };
  }

  // Simulate delivery success/failure (95% success rate for demo)
  const deliverySuccess = Math.random() > 0.05;
  
  if (deliverySuccess) {
    return {
      recipient,
      status: 'sent' as const,
      messageId: `${messageId}-${recipient.slice(-4)}`
    };
  } else {
    return {
      recipient,
      status: 'failed' as const,
      error: 'Delivery failed - recipient unreachable'
    };
  }
}

function validateRecipient(recipient: string, channel: string): boolean {
  switch (channel) {
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);
    case 'sms':
      return /^\+?[\d\s\-\(\)]{10,}$/.test(recipient);
    case 'webhook':
      return /^https?:\/\/.+/.test(recipient);
    case 'slack':
      return recipient.startsWith('#') || recipient.startsWith('@') || recipient.includes('slack.com');
    case 'teams':
      return recipient.includes('teams.microsoft.com') || recipient.includes('@');
    case 'push':
      return recipient.length > 10; // Simple token validation
    default:
      return true;
  }
}

function calculateDeliveryEstimate(channel: string, scheduledTime?: Date): string {
  const baseTime = scheduledTime || new Date();
  let estimateMinutes = 0;

  switch (channel) {
    case 'email':
      estimateMinutes = 1;
      break;
    case 'sms':
      estimateMinutes = 0.5;
      break;
    case 'webhook':
      estimateMinutes = 0.1;
      break;
    case 'slack':
    case 'teams':
      estimateMinutes = 0.2;
      break;
    case 'push':
      estimateMinutes = 0.1;
      break;
    default:
      estimateMinutes = 1;
  }

  const estimatedDelivery = new Date(baseTime.getTime() + estimateMinutes * 60 * 1000);
  return estimatedDelivery.toISOString();
}

function calculateCost(channel: string, recipientCount: number): number {
  const baseCosts: Record<string, number> = {
    email: 0.001,    // $0.001 per email
    sms: 0.05,       // $0.05 per SMS
    webhook: 0.0001, // $0.0001 per webhook
    slack: 0,        // Free
    teams: 0,        // Free
    push: 0.001      // $0.001 per push
  };

  const baseCost = baseCosts[channel] || 0;
  return Math.round(baseCost * recipientCount * 1000) / 1000; // Round to 3 decimal places
}

function generateMessageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `msg_${timestamp}_${random}`;
}

// Template processing utilities
export function processTemplate(template: string, variables: Record<string, any>): string {
  let processed = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, String(value));
  });
  
  return processed;
}

export function getTemplateVariables(template: string): string[] {
  const matches = template.match(/{{\\s*([^}]+)\\s*}}/g) || [];
  return matches.map(match => match.replace(/[{}\\s]/g, ''));
}

// Common notification templates
export const NOTIFICATION_TEMPLATES = {
  shipment_update: {
    subject: 'Shipment Update: {{trackingNumber}}',
    message: 'Your shipment {{trackingNumber}} has been updated. Status: {{status}}. Estimated delivery: {{estimatedDelivery}}'
  },
  booking_confirmation: {
    subject: 'Booking Confirmed: {{bookingId}}',
    message: 'Your booking {{bookingId}} has been confirmed. Service: {{service}}, Departure: {{departureDate}}'
  },
  warehouse_alert: {
    subject: 'Warehouse Alert: {{alertType}}',
    message: 'Alert from {{warehouseName}}: {{alertMessage}}. Action required: {{actionRequired}}'
  },
  customs_notification: {
    subject: 'Customs Update: {{clearanceId}}',
    message: 'Customs clearance {{clearanceId}} status: {{status}}. {{additionalInfo}}'
  }
};

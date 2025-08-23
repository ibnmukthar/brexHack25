import { LogisticsIntent } from './types';

export class WorkflowParser {
  async parse(input: string): Promise<LogisticsIntent> {
    const normalizedInput = input.toLowerCase();
    
    const intentType = this.detectIntentType(normalizedInput);
    const entities = this.extractEntities(normalizedInput);
    const priority = this.determinePriority(normalizedInput);
    const constraints = this.extractConstraints(normalizedInput);

    return {
      type: intentType,
      entities,
      priority,
      constraints
    };
  }

  private detectIntentType(input: string): LogisticsIntent['type'] {
    // Freight forwarding keywords
    if (input.includes('ocean freight') || input.includes('freight forward') || input.includes('fcl') || input.includes('lcl') ||
        input.includes('kuehne') || input.includes('expeditors') || input.includes('book ocean')) {
      return 'freight_forwarding';
    }

    // Warehousing keywords
    if (input.includes('warehouse') || input.includes('3pl') || input.includes('storage') || input.includes('distribution center') ||
        input.includes('dhl supply') || input.includes('prologis')) {
      return 'warehousing';
    }

    // Customs keywords
    if (input.includes('customs') || input.includes('clearance') || input.includes('import') || input.includes('export') ||
        input.includes('documentation') || input.includes('duty') || input.includes('tariff')) {
      return 'customs';
    }

    // Consolidation keywords
    if (input.includes('consolidat') || input.includes('ltl') || input.includes('combine') || input.includes('merge shipment')) {
      return 'consolidation';
    }

    // Port management keywords
    if (input.includes('port') || input.includes('congestion') || input.includes('dwell time') || input.includes('vessel') ||
        input.includes('reroute') || input.includes('terminal')) {
      return 'port_management';
    }

    // Compliance keywords
    if (input.includes('compliance') || input.includes('audit') || input.includes('ctpat') || input.includes('regulation') ||
        input.includes('certif') || input.includes('standard')) {
      return 'compliance';
    }

    // Cross-docking keywords
    if (input.includes('cross dock') || input.includes('cross-dock') || input.includes('sortation') ||
        input.includes('inbound') && input.includes('outbound')) {
      return 'cross_docking';
    }

    // Original keywords
    if (input.includes('track') || input.includes('tracking') || input.includes('shipment')) {
      return 'tracking';
    }
    if (input.includes('optimize') || input.includes('route') || input.includes('delivery')) {
      return 'optimization';
    }
    if (input.includes('carrier') || input.includes('shipping') || input.includes('best')) {
      return 'carrier_selection';
    }
    if (input.includes('inventory') || input.includes('stock') || input.includes('reorder')) {
      return 'inventory';
    }
    if (input.includes('return') || input.includes('rma') || input.includes('refund')) {
      return 'return_processing';
    }

    return 'optimization';
  }

  private extractEntities(input: string): Record<string, any> {
    const entities: Record<string, any> = {};
    
    const trackingRegex = /(?:shipment|tracking|order)[\s#]*([a-z0-9]+)/i;
    const trackingMatch = input.match(trackingRegex);
    if (trackingMatch) {
      entities.trackingNumber = trackingMatch[1].toUpperCase();
    }

    const locationRegex = /(from|to|in)\s+([a-z\s,]+?)(?:\s|,|$)/gi;
    const locations = [];
    let locationMatch;
    while ((locationMatch = locationRegex.exec(input)) !== null) {
      locations.push({
        type: locationMatch[1],
        location: locationMatch[2].trim()
      });
    }
    if (locations.length > 0) {
      entities.locations = locations;
    }

    const quantityRegex = /(\d+)\s*(packages?|items?|kg|lbs?)/i;
    const quantityMatch = input.match(quantityRegex);
    if (quantityMatch) {
      entities.quantity = {
        amount: parseInt(quantityMatch[1]),
        unit: quantityMatch[2]
      };
    }

    const timeRegex = /(within|by|before)\s+(.+?)(?:\s|,|$)/i;
    const timeMatch = input.match(timeRegex);
    if (timeMatch) {
      entities.timeConstraint = timeMatch[2].trim();
    }

    return entities;
  }

  private determinePriority(input: string): LogisticsIntent['priority'] {
    if (input.includes('urgent') || input.includes('asap') || input.includes('emergency')) {
      return 'high';
    }
    if (input.includes('expedite') || input.includes('priority') || input.includes('rush')) {
      return 'high';
    }
    if (input.includes('standard') || input.includes('regular')) {
      return 'medium';
    }
    return 'medium';
  }

  private extractConstraints(input: string): any {
    const constraints: any = {};

    if (input.includes('cheapest') || input.includes('lowest cost')) {
      constraints.costPriority = 'minimize';
    }
    if (input.includes('fastest') || input.includes('quickest')) {
      constraints.timePriority = 'minimize';
    }

    const costRegex = /(?:under|below|less than)\s*\$?(\d+)/i;
    const costMatch = input.match(costRegex);
    if (costMatch) {
      constraints.costLimit = parseInt(costMatch[1]);
    }

    const timeWindowRegex = /(by|before|within)\s+(.+?)(?:\s|,|$)/i;
    const timeWindowMatch = input.match(timeWindowRegex);
    if (timeWindowMatch) {
      constraints.timeWindow = timeWindowMatch[2].trim();
    }

    return Object.keys(constraints).length > 0 ? constraints : undefined;
  }
}
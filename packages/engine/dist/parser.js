"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowParser = void 0;
class WorkflowParser {
    async parse(input) {
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
    detectIntentType(input) {
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
    extractEntities(input) {
        const entities = {};
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
    determinePriority(input) {
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
    extractConstraints(input) {
        const constraints = {};
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
exports.WorkflowParser = WorkflowParser;

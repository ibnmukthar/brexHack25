import { WorkflowTemplate } from '../ai-providers/ai-provider-interface';
import { INVENTORY_TEMPLATE } from './inventory-template';
import { SHIPMENT_TEMPLATE } from './shipment-template';
import { SUPPLIER_TEMPLATE } from './supplier-template';
import { DEMAND_TEMPLATE } from './demand-template';

export class TemplateRegistry {
  private templates = new Map<string, WorkflowTemplate>();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.register(INVENTORY_TEMPLATE);
    this.register(SHIPMENT_TEMPLATE);
    this.register(SUPPLIER_TEMPLATE);
    this.register(DEMAND_TEMPLATE);
  }

  register(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): WorkflowTemplate | undefined {
    return this.templates.get(id);
  }

  getTemplatesByCategory(category: string): WorkflowTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category);
  }

  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplateIds(): string[] {
    return Array.from(this.templates.keys());
  }

  getCategories(): string[] {
    const categories = new Set<string>();
    this.templates.forEach(template => {
      categories.add(template.category);
    });
    return Array.from(categories);
  }

  findTemplateByIntent(intentType: string): WorkflowTemplate | undefined {
    // Map intent types to template categories
    const intentToCategory: Record<string, string> = {
      'inventory': 'inventory',
      'tracking': 'shipment',
      'optimization': 'shipment',
      'carrier_selection': 'shipment',
      'return_processing': 'shipment',
      'supplier': 'supplier',
      'demand': 'demand'
    };

    const category = intentToCategory[intentType];
    if (!category) return undefined;

    return this.getTemplatesByCategory(category)[0];
  }
}

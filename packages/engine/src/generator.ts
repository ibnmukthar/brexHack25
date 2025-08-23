import { LogisticsIntent, Workflow, WorkflowStep } from './types';

export class WorkflowGenerator {
  async generate(intent: LogisticsIntent): Promise<Workflow> {
    const workflowId = `wf_${Date.now()}`;

    switch (intent.type) {
      case 'tracking':
        return this.generateTrackingWorkflow(workflowId, intent);
      case 'optimization':
        return this.generateOptimizationWorkflow(workflowId, intent);
      case 'carrier_selection':
        return this.generateCarrierSelectionWorkflow(workflowId, intent);
      case 'inventory':
        return this.generateInventoryWorkflow(workflowId, intent);
      case 'return_processing':
        return this.generateReturnWorkflow(workflowId, intent);
      case 'freight_forwarding':
        return this.generateFreightForwardingWorkflow(workflowId, intent);
      case 'warehousing':
        return this.generateWarehousingWorkflow(workflowId, intent);
      case 'customs':
        return this.generateCustomsWorkflow(workflowId, intent);
      case 'consolidation':
        return this.generateConsolidationWorkflow(workflowId, intent);
      case 'port_management':
        return this.generatePortManagementWorkflow(workflowId, intent);
      case 'compliance':
        return this.generateComplianceWorkflow(workflowId, intent);
      case 'cross_docking':
        return this.generateCrossDockingWorkflow(workflowId, intent);
      default:
        throw new Error(`Unknown intent type: ${intent.type}`);
    }
  }

  private generateTrackingWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'fetch_tracking',
        name: 'Fetch Tracking Information',
        type: 'api_call',
        status: 'pending',
        config: {
          endpoint: 'carrier_api',
          trackingNumber: intent.entities.trackingNumber
        }
      },
      {
        id: 'analyze_status',
        name: 'Analyze Current Status',
        type: 'data_processing',
        status: 'pending',
        config: {
          rules: ['check_delays', 'predict_eta', 'identify_issues']
        },
        dependencies: ['fetch_tracking']
      }
    ];

    if (intent.entities.locations) {
      steps.push({
        id: 'location_notification',
        name: 'Location-Based Notifications',
        type: 'notification',
        status: 'pending',
        config: {
          triggers: intent.entities.locations.map((loc: any) => ({
            location: loc.location,
            action: 'notify'
          }))
        },
        dependencies: ['analyze_status']
      });
    }

    return {
      id,
      name: `Track Shipment ${intent.entities.trackingNumber || 'Unknown'}`,
      description: 'Real-time shipment tracking with intelligent notifications',
      steps,
      triggers: ['status_change', 'location_update'],
      metadata: { intent, createdAt: new Date().toISOString() }
    };
  }

  private generateOptimizationWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'collect_parameters',
        name: 'Collect Optimization Parameters',
        type: 'data_collection',
        status: 'pending',
        config: {
          parameters: ['locations', 'constraints', 'vehicle_specs', 'time_windows']
        }
      },
      {
        id: 'calculate_routes',
        name: 'Calculate Optimal Routes',
        type: 'optimization_algorithm',
        status: 'pending',
        config: {
          algorithm: 'tsp_with_constraints',
          objectives: this.getOptimizationObjectives(intent)
        },
        dependencies: ['collect_parameters']
      },
      {
        id: 'validate_routes',
        name: 'Validate Route Feasibility',
        type: 'validation',
        status: 'pending',
        config: {
          checks: ['time_constraints', 'capacity_limits', 'driver_regulations']
        },
        dependencies: ['calculate_routes']
      },
      {
        id: 'generate_instructions',
        name: 'Generate Delivery Instructions',
        type: 'document_generation',
        status: 'pending',
        config: {
          format: 'driver_manifest',
          include: ['route_map', 'delivery_sequence', 'contact_info']
        },
        dependencies: ['validate_routes']
      }
    ];

    return {
      id,
      name: 'Route Optimization',
      description: `Optimize delivery routes for ${intent.entities.quantity?.amount || 'multiple'} packages`,
      steps,
      triggers: ['schedule_change', 'traffic_update'],
      metadata: { intent, createdAt: new Date().toISOString() }
    };
  }

  private generateCarrierSelectionWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'gather_requirements',
        name: 'Gather Shipping Requirements',
        type: 'requirements_analysis',
        status: 'pending',
        config: {
          factors: ['weight', 'dimensions', 'destination', 'timeline', 'budget']
        }
      },
      {
        id: 'query_carriers',
        name: 'Query Available Carriers',
        type: 'api_aggregation',
        status: 'pending',
        config: {
          carriers: ['fedex', 'ups', 'dhl', 'usps'],
          services: ['express', 'standard', 'economy']
        },
        dependencies: ['gather_requirements']
      },
      {
        id: 'compare_options',
        name: 'Compare Carrier Options',
        type: 'decision_matrix',
        status: 'pending',
        config: {
          criteria: ['cost', 'speed', 'reliability', 'tracking', 'insurance'],
          weights: this.getCarrierWeights(intent)
        },
        dependencies: ['query_carriers']
      },
      {
        id: 'select_carrier',
        name: 'Select Best Carrier',
        type: 'decision',
        status: 'pending',
        config: {
          algorithm: 'weighted_scoring',
          fallback_options: 3
        },
        dependencies: ['compare_options']
      }
    ];

    return {
      id,
      name: 'Carrier Selection',
      description: 'Find the best shipping carrier based on your requirements',
      steps,
      triggers: ['rate_change', 'service_update'],
      metadata: { intent, createdAt: new Date().toISOString() }
    };
  }

  private generateInventoryWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'check_inventory_levels',
        name: 'Check Current Inventory Levels',
        type: 'erp_query',
        status: 'pending',
        config: {
          query: 'inventory_status',
          warehouses: 'all',
          threshold: 0.2
        }
      },
      {
        id: 'identify_reorder_items',
        name: 'Identify Items to Reorder',
        type: 'rule_engine',
        status: 'pending',
        config: {
          rules: ['below_threshold', 'seasonal_demand', 'lead_time_buffer']
        },
        dependencies: ['check_inventory_levels']
      },
      {
        id: 'calculate_order_quantities',
        name: 'Calculate Optimal Order Quantities',
        type: 'demand_forecasting',
        status: 'pending',
        config: {
          method: 'economic_order_quantity',
          factors: ['historical_demand', 'carrying_cost', 'order_cost']
        },
        dependencies: ['identify_reorder_items']
      },
      {
        id: 'create_purchase_orders',
        name: 'Create Purchase Orders',
        type: 'document_generation',
        status: 'pending',
        config: {
          approval_required: true,
          preferred_suppliers: 'priority_list'
        },
        dependencies: ['calculate_order_quantities']
      }
    ];

    return {
      id,
      name: 'Automated Inventory Restock',
      description: 'Automatically monitor and reorder inventory items',
      steps,
      triggers: ['daily_check', 'critical_low_stock'],
      metadata: { intent, createdAt: new Date().toISOString() }
    };
  }

  private generateReturnWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'validate_return_request',
        name: 'Validate Return Request',
        type: 'validation',
        status: 'pending',
        config: {
          checks: ['return_policy', 'time_limits', 'condition_requirements']
        }
      },
      {
        id: 'generate_rma',
        name: 'Generate RMA Number',
        type: 'document_generation',
        status: 'pending',
        config: {
          format: 'RMA-YYYYMMDD-###',
          include_instructions: true
        },
        dependencies: ['validate_return_request']
      },
      {
        id: 'schedule_pickup',
        name: 'Schedule Return Pickup',
        type: 'logistics_coordination',
        status: 'pending',
        config: {
          carrier: 'original_carrier',
          pickup_window: '48_hours',
          packaging_required: true
        },
        dependencies: ['generate_rma']
      },
      {
        id: 'process_inspection',
        name: 'Process Return Inspection',
        type: 'quality_control',
        status: 'pending',
        config: {
          inspection_criteria: ['damage_assessment', 'completeness_check'],
          automation_level: 'partial'
        },
        dependencies: ['schedule_pickup']
      },
      {
        id: 'issue_refund',
        name: 'Issue Refund',
        type: 'financial_transaction',
        status: 'pending',
        config: {
          method: 'original_payment',
          processing_time: '3-5_business_days'
        },
        dependencies: ['process_inspection']
      }
    ];

    return {
      id,
      name: 'Return Processing',
      description: 'Complete return processing workflow',
      steps,
      triggers: ['return_received', 'inspection_complete'],
      metadata: { intent, createdAt: new Date().toISOString() }
    };
  }

  private getOptimizationObjectives(intent: LogisticsIntent): string[] {
    const objectives = ['minimize_distance'];
    
    if (intent.constraints?.costPriority === 'minimize') {
      objectives.push('minimize_cost');
    }
    if (intent.constraints?.timePriority === 'minimize') {
      objectives.push('minimize_time');
    }
    if (intent.priority === 'high') {
      objectives.push('maximize_reliability');
    }

    return objectives;
  }

  private getCarrierWeights(intent: LogisticsIntent): Record<string, number> {
    const weights = {
      cost: 0.3,
      speed: 0.3,
      reliability: 0.2,
      tracking: 0.1,
      insurance: 0.1
    };

    if (intent.constraints?.costPriority === 'minimize') {
      weights.cost = 0.5;
      weights.speed = 0.2;
    }
    if (intent.constraints?.timePriority === 'minimize') {
      weights.speed = 0.5;
      weights.cost = 0.2;
    }
    if (intent.priority === 'high') {
      weights.reliability = 0.4;
    }

    return weights;
  }

  private generateFreightForwardingWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'analyze_shipment_requirements',
        name: 'Analyze Shipment Requirements',
        type: 'requirements_analysis',
        status: 'pending',
        config: {
          parameters: ['origin', 'destination', 'cargo_type', 'weight', 'dimensions', 'timeline']
        }
      },
      {
        id: 'query_freight_forwarders',
        name: 'Query Freight Forwarders',
        type: 'api_aggregation',
        status: 'pending',
        config: {
          providers: ['kuehne_nagel', 'expeditors', 'dhl_global_forwarding'],
          services: ['ocean_fcl', 'ocean_lcl', 'air_freight']
        },
        dependencies: ['analyze_shipment_requirements']
      },
      {
        id: 'compare_rates_services',
        name: 'Compare Rates and Services',
        type: 'decision_matrix',
        status: 'pending',
        config: {
          criteria: ['cost', 'transit_time', 'reliability', 'service_level'],
          weights: { cost: 0.4, transit_time: 0.3, reliability: 0.2, service_level: 0.1 }
        },
        dependencies: ['query_freight_forwarders']
      },
      {
        id: 'book_shipment',
        name: 'Book Selected Service',
        type: 'api_call',
        status: 'pending',
        config: {
          action: 'create_booking',
          include_insurance: true,
          documentation_required: true
        },
        dependencies: ['compare_rates_services']
      }
    ];

    return {
      id,
      name: 'Freight Forwarding Workflow',
      description: 'Compare and book freight forwarding services for international shipments',
      steps,
      triggers: ['shipment_ready', 'booking_deadline_approaching'],
      metadata: {
        category: 'freight_forwarding',
        estimated_duration: '4-6 minutes',
        complexity: 'high'
      }
    };
  }

  private generateWarehousingWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'assess_storage_needs',
        name: 'Assess Storage Requirements',
        type: 'requirements_analysis',
        status: 'pending',
        config: {
          parameters: ['storage_type', 'capacity_needed', 'location_preferences', 'special_requirements']
        }
      },
      {
        id: 'query_3pl_providers',
        name: 'Query 3PL Warehouse Providers',
        type: 'api_aggregation',
        status: 'pending',
        config: {
          providers: ['dhl_supply_chain', 'ch_robinson', 'ryder', 'prologis'],
          services: ['warehousing', 'distribution', 'value_added_services']
        },
        dependencies: ['assess_storage_needs']
      },
      {
        id: 'evaluate_facilities',
        name: 'Evaluate Warehouse Facilities',
        type: 'decision_matrix',
        status: 'pending',
        config: {
          criteria: ['cost_per_sqft', 'location', 'capacity', 'technology', 'sla'],
          scoring_method: 'weighted_average'
        },
        dependencies: ['query_3pl_providers']
      },
      {
        id: 'negotiate_contract',
        name: 'Negotiate Service Contract',
        type: 'api_call',
        status: 'pending',
        config: {
          action: 'initiate_contract_negotiation',
          terms: ['pricing', 'sla', 'capacity_guarantee', 'termination_clause']
        },
        dependencies: ['evaluate_facilities']
      }
    ];

    return {
      id,
      name: '3PL Warehousing Selection',
      description: 'Find and contract optimal 3PL warehouse solutions',
      steps,
      triggers: ['capacity_shortage', 'expansion_required'],
      metadata: {
        category: 'warehousing',
        estimated_duration: '3-5 minutes',
        complexity: 'medium'
      }
    };
  }

  private generateCustomsWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'validate_documentation',
        name: 'Validate Import Documentation',
        type: 'validation',
        status: 'pending',
        config: {
          required_docs: ['commercial_invoice', 'packing_list', 'bill_of_lading', 'certificate_of_origin'],
          compliance_checks: ['ctpat', 'ams', 'isf']
        }
      },
      {
        id: 'calculate_duties_taxes',
        name: 'Calculate Duties and Taxes',
        type: 'financial_calculation',
        status: 'pending',
        config: {
          tariff_schedule: 'hts',
          duty_rates: 'current',
          tax_calculations: ['import_duty', 'vat', 'excise_tax']
        },
        dependencies: ['validate_documentation']
      },
      {
        id: 'submit_customs_entry',
        name: 'Submit Customs Entry',
        type: 'api_call',
        status: 'pending',
        config: {
          system: 'ace_portal',
          entry_type: 'formal',
          broker_required: true
        },
        dependencies: ['calculate_duties_taxes']
      },
      {
        id: 'monitor_clearance_status',
        name: 'Monitor Clearance Status',
        type: 'tracking',
        status: 'pending',
        config: {
          check_interval: '30_minutes',
          escalation_threshold: '24_hours',
          notifications: ['email', 'sms']
        },
        dependencies: ['submit_customs_entry']
      }
    ];

    return {
      id,
      name: 'Customs Clearance Workflow',
      description: 'Automated customs documentation and clearance processing',
      steps,
      triggers: ['shipment_arrival', 'documentation_complete'],
      metadata: {
        category: 'customs',
        estimated_duration: '5-8 minutes',
        complexity: 'high'
      }
    };
  }

  private generateConsolidationWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'identify_consolidation_opportunities',
        name: 'Identify Consolidation Opportunities',
        type: 'data_analysis',
        status: 'pending',
        config: {
          criteria: ['destination_proximity', 'delivery_timeline', 'cargo_compatibility'],
          analysis_period: '24_hours'
        }
      },
      {
        id: 'optimize_load_planning',
        name: 'Optimize Load Planning',
        type: 'optimization_algorithm',
        status: 'pending',
        config: {
          algorithm: 'bin_packing',
          constraints: ['weight_limits', 'volume_limits', 'stacking_rules'],
          objectives: ['maximize_utilization', 'minimize_cost']
        },
        dependencies: ['identify_consolidation_opportunities']
      },
      {
        id: 'book_consolidated_shipment',
        name: 'Book Consolidated Shipment',
        type: 'api_call',
        status: 'pending',
        config: {
          service_type: 'ltl',
          carriers: ['fedex_freight', 'ups_freight', 'old_dominion'],
          pickup_scheduling: 'automated'
        },
        dependencies: ['optimize_load_planning']
      }
    ];

    return {
      id,
      name: 'Shipment Consolidation Workflow',
      description: 'Consolidate multiple shipments for cost optimization',
      steps,
      triggers: ['consolidation_threshold_met', 'daily_consolidation_run'],
      metadata: {
        category: 'consolidation',
        estimated_duration: '2-3 minutes',
        complexity: 'medium'
      }
    };
  }

  private generatePortManagementWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'monitor_port_status',
        name: 'Monitor Port Congestion Status',
        type: 'api_call',
        status: 'pending',
        config: {
          ports: ['USLAX', 'USLGB', 'USNYC', 'USSAV'],
          metrics: ['congestion_level', 'dwell_time', 'vessel_queue'],
          update_frequency: '1_hour'
        }
      },
      {
        id: 'analyze_congestion_impact',
        name: 'Analyze Congestion Impact',
        type: 'data_processing',
        status: 'pending',
        config: {
          impact_factors: ['delay_cost', 'demurrage_risk', 'alternative_routes'],
          threshold_alerts: ['high_congestion', 'extended_dwell_time']
        },
        dependencies: ['monitor_port_status']
      },
      {
        id: 'recommend_alternatives',
        name: 'Recommend Alternative Routes',
        type: 'decision',
        status: 'pending',
        config: {
          alternatives: ['alternative_ports', 'rail_diversion', 'schedule_adjustment'],
          cost_benefit_analysis: true
        },
        dependencies: ['analyze_congestion_impact']
      },
      {
        id: 'execute_rerouting',
        name: 'Execute Rerouting Decision',
        type: 'api_call',
        status: 'pending',
        config: {
          action: 'update_routing',
          notify_stakeholders: true,
          update_tracking: true
        },
        dependencies: ['recommend_alternatives']
      }
    ];

    return {
      id,
      name: 'Port Management & Rerouting',
      description: 'Monitor port congestion and automatically reroute shipments',
      steps,
      triggers: ['congestion_alert', 'vessel_delay'],
      metadata: {
        category: 'port_management',
        estimated_duration: '4-6 minutes',
        complexity: 'high'
      }
    };
  }

  private generateComplianceWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'audit_compliance_requirements',
        name: 'Audit Compliance Requirements',
        type: 'validation',
        status: 'pending',
        config: {
          regulations: ['ctpat', 'tsa', 'dot', 'fda', 'epa'],
          audit_scope: ['documentation', 'processes', 'training'],
          compliance_standards: ['iso_28000', 'c_tpat']
        }
      },
      {
        id: 'identify_gaps',
        name: 'Identify Compliance Gaps',
        type: 'data_analysis',
        status: 'pending',
        config: {
          gap_analysis: ['missing_documentation', 'expired_certifications', 'process_deviations'],
          risk_assessment: 'high_medium_low'
        },
        dependencies: ['audit_compliance_requirements']
      },
      {
        id: 'generate_corrective_actions',
        name: 'Generate Corrective Action Plan',
        type: 'document_generation',
        status: 'pending',
        config: {
          action_plan_template: 'capa_template',
          priority_matrix: 'risk_impact',
          timeline_generation: 'automated'
        },
        dependencies: ['identify_gaps']
      },
      {
        id: 'track_remediation',
        name: 'Track Remediation Progress',
        type: 'tracking',
        status: 'pending',
        config: {
          tracking_frequency: 'weekly',
          escalation_rules: ['overdue_actions', 'high_risk_items'],
          reporting: 'dashboard_updates'
        },
        dependencies: ['generate_corrective_actions']
      }
    ];

    return {
      id,
      name: 'Compliance Audit & Remediation',
      description: 'Automated compliance auditing with corrective action tracking',
      steps,
      triggers: ['scheduled_audit', 'compliance_incident'],
      metadata: {
        category: 'compliance',
        estimated_duration: '6-8 minutes',
        complexity: 'high'
      }
    };
  }

  private generateCrossDockingWorkflow(id: string, intent: LogisticsIntent): Workflow {
    const steps: WorkflowStep[] = [
      {
        id: 'coordinate_inbound_schedule',
        name: 'Coordinate Inbound Schedules',
        type: 'logistics_coordination',
        status: 'pending',
        config: {
          scheduling_window: '2_hour_slots',
          dock_assignments: 'automated',
          carrier_notifications: 'real_time'
        }
      },
      {
        id: 'optimize_dock_assignments',
        name: 'Optimize Dock Door Assignments',
        type: 'optimization_algorithm',
        status: 'pending',
        config: {
          algorithm: 'dock_scheduling',
          constraints: ['equipment_compatibility', 'product_flow', 'labor_availability'],
          objectives: ['minimize_handling_time', 'maximize_throughput']
        },
        dependencies: ['coordinate_inbound_schedule']
      },
      {
        id: 'manage_sortation',
        name: 'Manage Product Sortation',
        type: 'wms_integration',
        status: 'pending',
        config: {
          sortation_rules: ['destination_based', 'priority_based', 'carrier_based'],
          quality_checks: 'automated_scanning',
          exception_handling: 'manual_review'
        },
        dependencies: ['optimize_dock_assignments']
      },
      {
        id: 'coordinate_outbound_loading',
        name: 'Coordinate Outbound Loading',
        type: 'logistics_coordination',
        status: 'pending',
        config: {
          loading_sequence: 'optimized',
          carrier_coordination: 'real_time',
          documentation: 'automated_bol'
        },
        dependencies: ['manage_sortation']
      }
    ];

    return {
      id,
      name: 'Cross-Docking Operations',
      description: 'Coordinate complex cross-docking operations with optimized flow',
      steps,
      triggers: ['inbound_arrival', 'outbound_schedule'],
      metadata: {
        category: 'cross_docking',
        estimated_duration: '4-7 minutes',
        complexity: 'high'
      }
    };
  }
}
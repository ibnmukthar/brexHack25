export class MockIntegrations {
  async queryERP(query: string) {
    await this.delay(500);

    const mockData: Record<string, any> = {
      inventory_status: {
        warehouses: [
          {
            id: 'WH001',
            location: 'Chicago, IL',
            items: [
              { sku: 'SKU001', name: 'Widget A', current_stock: 45, reorder_level: 50, status: 'reorder_needed' },
              { sku: 'SKU002', name: 'Widget B', current_stock: 120, reorder_level: 25, status: 'sufficient' },
              { sku: 'SKU003', name: 'Gadget C', current_stock: 8, reorder_level: 20, status: 'critical_low' }
            ]
          },
          {
            id: 'WH002',
            location: 'Los Angeles, CA',
            items: [
              { sku: 'SKU001', name: 'Widget A', current_stock: 75, reorder_level: 50, status: 'sufficient' },
              { sku: 'SKU004', name: 'Tool D', current_stock: 15, reorder_level: 30, status: 'reorder_needed' }
            ]
          }
        ],
        total_items_below_threshold: 3,
        total_reorder_value: 15420.50
      },
      shipments: [
        {
          id: 'SH001',
          status: 'pending',
          origin: 'Chicago, IL',
          destination: 'New York, NY',
          items: 25,
          weight: '450 lbs',
          created_date: '2024-01-12T08:00:00Z'
        },
        {
          id: 'SH002',
          status: 'in_transit',
          origin: 'Los Angeles, CA',
          destination: 'Phoenix, AZ',
          items: 12,
          weight: '180 lbs',
          created_date: '2024-01-11T14:30:00Z'
        }
      ]
    };

    return mockData[query] || { message: `No mock data available for query: ${query}` };
  }

  // 3PL Provider APIs
  async query3PL(provider: string, service: string, params: any = {}) {
    await this.delay(600);

    const providers = {
      'flexport': {
        name: 'Flexport',
        services: {
          'ocean_freight': {
            routes: [
              { origin: 'Shanghai', destination: 'Los Angeles', transit_time: '14-18 days', cost_per_teu: 2850 },
              { origin: 'Hamburg', destination: 'New York', transit_time: '12-16 days', cost_per_teu: 3200 },
              { origin: 'Singapore', destination: 'Long Beach', transit_time: '16-20 days', cost_per_teu: 2950 }
            ],
            capacity: 'Available',
            next_sailing: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          'air_freight': {
            routes: [
              { origin: 'Hong Kong', destination: 'Chicago', transit_time: '2-3 days', cost_per_kg: 4.50 },
              { origin: 'Frankfurt', destination: 'Miami', transit_time: '1-2 days', cost_per_kg: 5.20 }
            ],
            capacity: 'Limited',
            next_flight: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
          },
          'customs_clearance': {
            processing_time: '2-4 business days',
            success_rate: 0.96,
            required_docs: ['Commercial Invoice', 'Packing List', 'Bill of Lading', 'Certificate of Origin']
          }
        }
      },
      'ch_robinson': {
        name: 'C.H. Robinson',
        services: {
          'ltl_freight': {
            lanes: [
              { origin: 'Chicago', destination: 'Atlanta', transit_time: '2-3 days', cost_per_lb: 0.45 },
              { origin: 'Los Angeles', destination: 'Denver', transit_time: '1-2 days', cost_per_lb: 0.52 }
            ],
            capacity: 'High',
            pickup_availability: 'Same day'
          },
          'truckload': {
            lanes: [
              { origin: 'Dallas', destination: 'Phoenix', transit_time: '1-2 days', cost: 1850 },
              { origin: 'Miami', destination: 'Jacksonville', transit_time: '1 day', cost: 950 }
            ],
            equipment: ['Dry Van', 'Refrigerated', 'Flatbed'],
            driver_availability: 'Good'
          }
        }
      },
      'dhl_supply_chain': {
        name: 'DHL Supply Chain',
        services: {
          'warehousing': {
            locations: [
              { city: 'Memphis', capacity: '500K sq ft', utilization: 0.78, cost_per_pallet: 12.50 },
              { city: 'Cincinnati', capacity: '750K sq ft', utilization: 0.65, cost_per_pallet: 11.80 }
            ],
            services: ['Pick & Pack', 'Cross Docking', 'Value Added Services'],
            sla: '99.5% accuracy'
          },
          'distribution': {
            coverage: 'North America',
            delivery_options: ['Same Day', 'Next Day', '2-Day', 'Ground'],
            tracking: 'Real-time GPS'
          }
        }
      }
    };

    const providerData = providers[provider as keyof typeof providers];
    if (!providerData) {
      return { error: `Unknown 3PL provider: ${provider}` };
    }

    const serviceData = providerData.services[service as keyof typeof providerData.services];
    if (!serviceData) {
      return { error: `Service ${service} not available for ${provider}` };
    }

    return {
      provider: providerData.name,
      service,
      data: serviceData,
      quote_id: `QUOTE_${provider.toUpperCase()}_${Date.now()}`,
      valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  // Freight Forwarder APIs
  async queryFreightForwarder(forwarder: string, shipmentType: string, params: any = {}) {
    await this.delay(700);

    const forwarders = {
      'kuehne_nagel': {
        name: 'Kuehne + Nagel',
        specialties: ['Ocean Freight', 'Air Freight', 'Contract Logistics'],
        services: {
          'ocean_fcl': {
            routes: [
              {
                origin: 'Shanghai',
                destination: 'Hamburg',
                transit_time: '28-32 days',
                cost: 3450,
                vessel: 'MSC OSCAR',
                departure: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
              },
              {
                origin: 'Ningbo',
                destination: 'Rotterdam',
                transit_time: '30-35 days',
                cost: 3200,
                vessel: 'EVER GIVEN',
                departure: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            ],
            container_types: ['20ft', '40ft', '40ft HC', '45ft HC'],
            additional_services: ['Insurance', 'Customs Clearance', 'Door-to-Door']
          },
          'air_express': {
            routes: [
              { origin: 'Frankfurt', destination: 'JFK', transit_time: '1-2 days', cost_per_kg: 6.80 },
              { origin: 'Amsterdam', destination: 'LAX', transit_time: '2-3 days', cost_per_kg: 7.20 }
            ],
            capacity: 'Available',
            cutoff_times: { 'same_day': '14:00', 'next_day': '18:00' }
          }
        }
      },
      'expeditors': {
        name: 'Expeditors',
        specialties: ['Customs Brokerage', 'Cargo Insurance', 'Supply Chain Solutions'],
        services: {
          'customs_brokerage': {
            processing_time: '1-3 business days',
            success_rate: 0.98,
            countries: ['USA', 'Canada', 'Mexico', 'EU', 'China', 'Japan'],
            fees: {
              'standard': 125,
              'express': 250,
              'complex': 450
            }
          },
          'cargo_insurance': {
            coverage_types: ['All Risk', 'Total Loss Only', 'General Average'],
            premium_rate: 0.15, // percentage of cargo value
            max_coverage: 10000000,
            claims_processing: '5-10 business days'
          }
        }
      }
    };

    const forwarderData = forwarders[forwarder as keyof typeof forwarders];
    if (!forwarderData) {
      return { error: `Unknown freight forwarder: ${forwarder}` };
    }

    const serviceData = forwarderData.services[shipmentType as keyof typeof forwarderData.services];
    if (!serviceData) {
      return { error: `Shipment type ${shipmentType} not available for ${forwarder}` };
    }

    return {
      forwarder: forwarderData.name,
      shipment_type: shipmentType,
      specialties: forwarderData.specialties,
      data: serviceData,
      quote_id: `FF_${forwarder.toUpperCase()}_${Date.now()}`,
      valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  async trackCarrier(carrier: string, trackingNumber: string) {
    await this.delay(300);
    
    const mockStatuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = Math.floor(Math.random() * mockStatuses.length);
    const currentStatus = mockStatuses[currentStatusIndex];
    
    const mockLocations = [
      'Chicago, IL', 'Indianapolis, IN', 'Columbus, OH', 'Pittsburgh, PA', 'New York, NY'
    ];
    
    const events = [];
    const baseTime = new Date('2024-01-13T10:00:00Z').getTime();
    
    for (let i = 0; i <= currentStatusIndex; i++) {
      events.push({
        time: new Date(baseTime + (i * 6 * 60 * 60 * 1000)).toISOString(),
        description: this.getStatusDescription(mockStatuses[i]),
        location: mockLocations[i] || 'In Transit'
      });
    }

    return {
      trackingNumber,
      carrier: carrier.toUpperCase(),
      status: currentStatus,
      currentLocation: mockLocations[currentStatusIndex] || 'In Transit',
      estimatedDelivery: new Date(baseTime + (5 * 24 * 60 * 60 * 1000)).toISOString(),
      progress: Math.round((currentStatusIndex + 1) / mockStatuses.length * 100),
      events: events.reverse(),
      serviceType: 'Ground',
      weight: '2.5 lbs',
      dimensions: '12x8x4 inches'
    };
  }

  async optimizeRoute(locations: string[]) {
    await this.delay(800);
    
    const shuffled = [...locations].sort(() => Math.random() - 0.5);
    const distance = Math.floor(Math.random() * 300) + 50;
    const estimatedTime = Math.floor(distance / 35 * 60); // Assuming 35 mph average
    const fuelCost = Math.round(distance * 0.15 * 3.50); // $3.50/gal, 15mpg
    const driverCost = Math.round(estimatedTime / 60 * 25); // $25/hour
    const totalCost = fuelCost + driverCost;

    return {
      optimizedRoute: shuffled,
      routeDetails: {
        totalDistance: `${distance} miles`,
        estimatedTime: `${Math.floor(estimatedTime / 60)}h ${estimatedTime % 60}m`,
        totalCost: `$${totalCost}`,
        costBreakdown: {
          fuel: `$${fuelCost}`,
          driver: `$${driverCost}`,
          vehicle: '$15'
        },
        savings: {
          distanceReduction: `${Math.floor(Math.random() * 50) + 10} miles`,
          timeReduction: `${Math.floor(Math.random() * 60) + 15} minutes`,
          costSavings: `$${Math.floor(Math.random() * 40) + 10}`
        }
      },
      waypoints: shuffled.map((location, index) => ({
        stop: index + 1,
        location,
        estimatedArrival: new Date(Date.now() + (index + 1) * 45 * 60 * 1000).toISOString(),
        packages: Math.floor(Math.random() * 5) + 1,
        serviceTime: '15 minutes'
      })),
      confidence: 0.94,
      alternatives: [
        {
          name: 'Fastest Route',
          timeSaving: '25 minutes',
          costIncrease: '$12'
        },
        {
          name: 'Most Economical',
          costSaving: '$18',
          timeIncrease: '35 minutes'
        }
      ]
    };
  }

  async getCarrierRates(shipmentDetails: any) {
    await this.delay(600);
    
    const carriers = [
      {
        name: 'FedEx',
        services: [
          { name: 'Ground', cost: 12.45, deliveryDays: 3, reliability: 0.96 },
          { name: 'Express', cost: 24.80, deliveryDays: 1, reliability: 0.98 },
          { name: '2Day', cost: 18.30, deliveryDays: 2, reliability: 0.97 }
        ]
      },
      {
        name: 'UPS',
        services: [
          { name: 'Ground', cost: 11.80, deliveryDays: 3, reliability: 0.95 },
          { name: 'Next Day', cost: 26.10, deliveryDays: 1, reliability: 0.97 },
          { name: '2nd Day', cost: 17.95, deliveryDays: 2, reliability: 0.96 }
        ]
      },
      {
        name: 'DHL',
        services: [
          { name: 'Express', cost: 28.50, deliveryDays: 1, reliability: 0.94 },
          { name: 'Standard', cost: 19.75, deliveryDays: 2, reliability: 0.93 }
        ]
      },
      {
        name: 'USPS',
        services: [
          { name: 'Ground', cost: 9.95, deliveryDays: 4, reliability: 0.89 },
          { name: 'Priority', cost: 15.20, deliveryDays: 2, reliability: 0.91 }
        ]
      }
    ];

    return {
      shipmentId: `QUOTE_${Date.now()}`,
      requestedDate: new Date().toISOString(),
      origin: shipmentDetails.origin || 'Chicago, IL',
      destination: shipmentDetails.destination || 'New York, NY',
      weight: shipmentDetails.weight || '5 lbs',
      dimensions: shipmentDetails.dimensions || '12x8x6 inches',
      carriers: carriers.map(carrier => ({
        ...carrier,
        services: carrier.services.map(service => ({
          ...service,
          estimatedDelivery: new Date(Date.now() + service.deliveryDays * 24 * 60 * 60 * 1000).toISOString(),
          features: ['tracking', 'insurance', 'signature_required'].slice(0, Math.floor(Math.random() * 3) + 1)
        }))
      }))
    };
  }

  async processReturn(returnRequest: any) {
    await this.delay(400);

    const rmaNumber = `RMA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    return {
      rmaNumber,
      status: 'approved',
      returnInstructions: {
        steps: [
          'Package item securely in original packaging',
          'Print and attach the provided return label',
          'Drop off at any UPS location or schedule pickup',
          'Track return progress with RMA number'
        ],
        returnLabel: {
          trackingNumber: `1Z${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
          carrier: 'UPS',
          serviceType: 'Ground'
        },
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      refundDetails: {
        amount: returnRequest.refundAmount || 89.99,
        method: 'original_payment_method',
        processingTime: '3-5 business days after item received'
      },
      inspectionCriteria: [
        'Item must be in original condition',
        'All accessories and packaging included',
        'No signs of wear or damage beyond normal use'
      ]
    };
  }

  // Port and Terminal APIs
  async queryPortStatus(portCode: string) {
    await this.delay(500);

    const ports = {
      'USLAX': {
        name: 'Port of Los Angeles',
        status: 'operational',
        congestion_level: 'medium',
        average_dwell_time: '4.2 days',
        berth_availability: 0.75,
        vessel_queue: 12,
        customs_processing: '2-3 days',
        rail_connectivity: 'excellent',
        truck_turn_time: '45 minutes'
      },
      'USNYC': {
        name: 'Port of New York/New Jersey',
        status: 'operational',
        congestion_level: 'high',
        average_dwell_time: '5.8 days',
        berth_availability: 0.60,
        vessel_queue: 18,
        customs_processing: '3-4 days',
        rail_connectivity: 'good',
        truck_turn_time: '65 minutes'
      },
      'CNSHA': {
        name: 'Port of Shanghai',
        status: 'operational',
        congestion_level: 'low',
        average_dwell_time: '2.1 days',
        berth_availability: 0.85,
        vessel_queue: 6,
        customs_processing: '1-2 days',
        rail_connectivity: 'excellent',
        truck_turn_time: '25 minutes'
      }
    };

    const portData = ports[portCode as keyof typeof ports];
    if (!portData) {
      return { error: `Unknown port code: ${portCode}` };
    }

    return {
      port_code: portCode,
      ...portData,
      last_updated: new Date().toISOString(),
      weather_conditions: 'Clear',
      operational_hours: '24/7'
    };
  }

  // Warehouse Management System APIs
  async queryWMS(operation: string, params: any = {}) {
    await this.delay(400);

    const operations = {
      'inventory_levels': {
        locations: [
          {
            warehouse_id: 'WH_CHICAGO_01',
            location: 'Chicago, IL',
            total_capacity: 50000,
            current_utilization: 0.78,
            available_space: 11000,
            inventory_value: 2450000,
            items: [
              { sku: 'ELEC001', description: 'Laptop Computer', quantity: 245, location: 'A1-B3', last_counted: '2024-01-15' },
              { sku: 'FURN002', description: 'Office Chair', quantity: 89, location: 'B2-C4', last_counted: '2024-01-14' },
              { sku: 'SUPP003', description: 'Paper Supplies', quantity: 1250, location: 'C1-D2', last_counted: '2024-01-16' }
            ]
          },
          {
            warehouse_id: 'WH_DALLAS_02',
            location: 'Dallas, TX',
            total_capacity: 75000,
            current_utilization: 0.65,
            available_space: 26250,
            inventory_value: 3200000,
            items: [
              { sku: 'ELEC001', description: 'Laptop Computer', quantity: 156, location: 'A3-B1', last_counted: '2024-01-15' },
              { sku: 'AUTO004', description: 'Car Parts', quantity: 2340, location: 'D1-E5', last_counted: '2024-01-13' }
            ]
          }
        ]
      },
      'pick_performance': {
        daily_stats: {
          total_picks: 2450,
          accuracy_rate: 0.996,
          average_pick_time: 45, // seconds
          picks_per_hour: 120,
          error_rate: 0.004
        },
        top_pickers: [
          { employee_id: 'EMP001', name: 'John Smith', picks_today: 340, accuracy: 0.998 },
          { employee_id: 'EMP002', name: 'Maria Garcia', picks_today: 325, accuracy: 0.997 },
          { employee_id: 'EMP003', name: 'David Chen', picks_today: 310, accuracy: 0.995 }
        ]
      },
      'shipping_queue': {
        pending_orders: 156,
        ready_to_ship: 89,
        awaiting_pickup: 23,
        average_processing_time: '2.3 hours',
        carriers_scheduled: [
          { carrier: 'FedEx', pickup_time: '14:00', packages: 45 },
          { carrier: 'UPS', pickup_time: '15:30', packages: 67 },
          { carrier: 'DHL', pickup_time: '16:00', packages: 12 }
        ]
      }
    };

    const operationData = operations[operation as keyof typeof operations];
    if (!operationData) {
      return { error: `Unknown WMS operation: ${operation}` };
    }

    return {
      operation,
      timestamp: new Date().toISOString(),
      data: operationData
    };
  }

  // Transportation Management System APIs
  async queryTMS(function_name: string, params: any = {}) {
    await this.delay(600);

    const functions = {
      'load_planning': {
        available_capacity: {
          trucks: [
            { truck_id: 'TRK001', driver: 'Mike Johnson', capacity: '26,000 lbs', current_load: '18,500 lbs', available: '7,500 lbs', location: 'Chicago, IL' },
            { truck_id: 'TRK002', driver: 'Sarah Wilson', capacity: '26,000 lbs', current_load: '22,000 lbs', available: '4,000 lbs', location: 'Dallas, TX' },
            { truck_id: 'TRK003', driver: 'Robert Lee', capacity: '26,000 lbs', current_load: '0 lbs', available: '26,000 lbs', location: 'Atlanta, GA' }
          ],
          utilization_rate: 0.72,
          optimization_suggestions: [
            'Consolidate shipments TRK001 and TRK003 for Chicago-Atlanta route',
            'Consider LTL for partial loads under 10,000 lbs',
            'Schedule backhaul opportunities for empty return trips'
          ]
        }
      },
      'route_optimization': {
        optimized_routes: [
          {
            route_id: 'RT001',
            driver: 'Mike Johnson',
            stops: ['Chicago, IL', 'Indianapolis, IN', 'Louisville, KY', 'Nashville, TN'],
            total_distance: '485 miles',
            estimated_time: '8.5 hours',
            fuel_cost: '$145.50',
            toll_cost: '$28.00',
            total_cost: '$173.50'
          },
          {
            route_id: 'RT002',
            driver: 'Sarah Wilson',
            stops: ['Dallas, TX', 'Austin, TX', 'Houston, TX', 'San Antonio, TX'],
            total_distance: '520 miles',
            estimated_time: '9.2 hours',
            fuel_cost: '$156.00',
            toll_cost: '$15.50',
            total_cost: '$171.50'
          }
        ],
        savings: {
          distance_saved: '127 miles',
          time_saved: '2.3 hours',
          cost_saved: '$89.50'
        }
      },
      'carrier_performance': {
        metrics: [
          {
            carrier: 'FedEx',
            on_time_delivery: 0.96,
            damage_rate: 0.002,
            cost_per_shipment: 24.50,
            customer_satisfaction: 4.7,
            volume_ytd: 12450
          },
          {
            carrier: 'UPS',
            on_time_delivery: 0.94,
            damage_rate: 0.003,
            cost_per_shipment: 22.80,
            customer_satisfaction: 4.5,
            volume_ytd: 15600
          },
          {
            carrier: 'DHL',
            on_time_delivery: 0.92,
            damage_rate: 0.001,
            cost_per_shipment: 28.90,
            customer_satisfaction: 4.6,
            volume_ytd: 8900
          }
        ]
      }
    };

    const functionData = functions[function_name as keyof typeof functions];
    if (!functionData) {
      return { error: `Unknown TMS function: ${function_name}` };
    }

    return {
      function: function_name,
      timestamp: new Date().toISOString(),
      data: functionData
    };
  }

  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      picked_up: 'Package picked up from sender',
      in_transit: 'Package in transit to destination',
      out_for_delivery: 'Out for delivery',
      delivered: 'Package delivered'
    };
    return descriptions[status] || 'Status update';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
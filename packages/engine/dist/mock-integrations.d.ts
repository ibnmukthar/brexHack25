export declare class MockIntegrations {
    queryERP(query: string): Promise<any>;
    query3PL(provider: string, service: string, params?: any): Promise<{
        error: string;
        provider?: undefined;
        service?: undefined;
        data?: undefined;
        quote_id?: undefined;
        valid_until?: undefined;
    } | {
        provider: string;
        service: string;
        data: never;
        quote_id: string;
        valid_until: string;
        error?: undefined;
    }>;
    queryFreightForwarder(forwarder: string, shipmentType: string, params?: any): Promise<{
        error: string;
        forwarder?: undefined;
        shipment_type?: undefined;
        specialties?: undefined;
        data?: undefined;
        quote_id?: undefined;
        valid_until?: undefined;
    } | {
        forwarder: string;
        shipment_type: string;
        specialties: string[];
        data: never;
        quote_id: string;
        valid_until: string;
        error?: undefined;
    }>;
    trackCarrier(carrier: string, trackingNumber: string): Promise<{
        trackingNumber: string;
        carrier: string;
        status: string;
        currentLocation: string;
        estimatedDelivery: string;
        progress: number;
        events: {
            time: string;
            description: string;
            location: string;
        }[];
        serviceType: string;
        weight: string;
        dimensions: string;
    }>;
    optimizeRoute(locations: string[]): Promise<{
        optimizedRoute: string[];
        routeDetails: {
            totalDistance: string;
            estimatedTime: string;
            totalCost: string;
            costBreakdown: {
                fuel: string;
                driver: string;
                vehicle: string;
            };
            savings: {
                distanceReduction: string;
                timeReduction: string;
                costSavings: string;
            };
        };
        waypoints: {
            stop: number;
            location: string;
            estimatedArrival: string;
            packages: number;
            serviceTime: string;
        }[];
        confidence: number;
        alternatives: ({
            name: string;
            timeSaving: string;
            costIncrease: string;
            costSaving?: undefined;
            timeIncrease?: undefined;
        } | {
            name: string;
            costSaving: string;
            timeIncrease: string;
            timeSaving?: undefined;
            costIncrease?: undefined;
        })[];
    }>;
    getCarrierRates(shipmentDetails: any): Promise<{
        shipmentId: string;
        requestedDate: string;
        origin: any;
        destination: any;
        weight: any;
        dimensions: any;
        carriers: {
            services: {
                estimatedDelivery: string;
                features: string[];
                name: string;
                cost: number;
                deliveryDays: number;
                reliability: number;
            }[];
            name: string;
        }[];
    }>;
    processReturn(returnRequest: any): Promise<{
        rmaNumber: string;
        status: string;
        returnInstructions: {
            steps: string[];
            returnLabel: {
                trackingNumber: string;
                carrier: string;
                serviceType: string;
            };
            deadline: string;
        };
        refundDetails: {
            amount: any;
            method: string;
            processingTime: string;
        };
        inspectionCriteria: string[];
    }>;
    queryPortStatus(portCode: string): Promise<{
        error: string;
    } | {
        last_updated: string;
        weather_conditions: string;
        operational_hours: string;
        name: string;
        status: string;
        congestion_level: string;
        average_dwell_time: string;
        berth_availability: number;
        vessel_queue: number;
        customs_processing: string;
        rail_connectivity: string;
        truck_turn_time: string;
        port_code: string;
        error?: undefined;
    }>;
    queryWMS(operation: string, params?: any): Promise<{
        error: string;
        operation?: undefined;
        timestamp?: undefined;
        data?: undefined;
    } | {
        operation: string;
        timestamp: string;
        data: {
            locations: {
                warehouse_id: string;
                location: string;
                total_capacity: number;
                current_utilization: number;
                available_space: number;
                inventory_value: number;
                items: {
                    sku: string;
                    description: string;
                    quantity: number;
                    location: string;
                    last_counted: string;
                }[];
            }[];
        } | {
            daily_stats: {
                total_picks: number;
                accuracy_rate: number;
                average_pick_time: number;
                picks_per_hour: number;
                error_rate: number;
            };
            top_pickers: {
                employee_id: string;
                name: string;
                picks_today: number;
                accuracy: number;
            }[];
        } | {
            pending_orders: number;
            ready_to_ship: number;
            awaiting_pickup: number;
            average_processing_time: string;
            carriers_scheduled: {
                carrier: string;
                pickup_time: string;
                packages: number;
            }[];
        };
        error?: undefined;
    }>;
    queryTMS(function_name: string, params?: any): Promise<{
        error: string;
        function?: undefined;
        timestamp?: undefined;
        data?: undefined;
    } | {
        function: string;
        timestamp: string;
        data: {
            available_capacity: {
                trucks: {
                    truck_id: string;
                    driver: string;
                    capacity: string;
                    current_load: string;
                    available: string;
                    location: string;
                }[];
                utilization_rate: number;
                optimization_suggestions: string[];
            };
        } | {
            optimized_routes: {
                route_id: string;
                driver: string;
                stops: string[];
                total_distance: string;
                estimated_time: string;
                fuel_cost: string;
                toll_cost: string;
                total_cost: string;
            }[];
            savings: {
                distance_saved: string;
                time_saved: string;
                cost_saved: string;
            };
        } | {
            metrics: {
                carrier: string;
                on_time_delivery: number;
                damage_rate: number;
                cost_per_shipment: number;
                customer_satisfaction: number;
                volume_ytd: number;
            }[];
        };
        error?: undefined;
    }>;
    private getStatusDescription;
    private delay;
}
